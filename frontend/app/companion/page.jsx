"use client";

import React, { useState, useRef } from "react";
import Navbar from "../../components/Navbar";
import VoiceSummaryPlayer from "../../components/VoiceSummaryPlayer";
import VoiceInputButton from "../../components/VoiceInputButton";
import { unlockAudio } from "../../lib/voiceAudio";
import { buildCompanionNarration } from "../../lib/narration";

const COMPANION_I18N = {
  hi: {
    folio: "खाता क्रमांक / Folio: CG-PTN-2026-0921-R",
    sessionInfo: "सत्र: 2026-27 | ग्राम पंचायत: सेलूद (पाटन)",
    liveStatus: "लाइव वित्तीय साथी (Sahay Live)",
    lastEntry: "अंतिम प्रविष्टि: 24 Oct 2026, 06:15 PM",

    // Intake Form
    intakeHeading: "दैनिक उत्पादन एवं हिसाब इनपुट",
    intakeSubheading: "(Daily Production & Input Parameters)",
    intakeDesc: "आज के किए गए उत्पादन अथवा विक्रय की संख्या दर्ज करें। प्रणाली स्वतः बैंक किश्त गुल्लक (₹160/दिन) अलग कर आपकी शुद्ध घर खर्च बचत की गणना करेगी।",
    modeSelf: "👤 स्वयं सेवा",
    modeSakhi: "🤝 सखी / CSC मोड",
    tradeLabel: "1. व्यवसाय श्रेणी (Trade Category)",
    unitLabel: "2. आज का दैनिक उत्पादन (Output Units)",
    unitDesc: "आज तैयार किए गए माल / सेवा की संख्या दर्ज करें।",
    rateLabel: "3. औसत दर प्रति इकाई (Avg. Rate Per Unit)",
    ratePerUnit: "/ इकाई",
    calculateBtn: "📊 दैनिक हिसाब व गुल्लक आवंटन गणना करें (Calculate Cashflow)",
    calculatingBtn: "हिसाब व आवंटन गणना की जा रही है...",
    zeroTestBtn: "उत्पादन 0 करके घाटा परीक्षण देखें (Test 0 Units)",

    trades: {
      tailor: { title: "सिलाई (Boutique)", unit: "सूट सिले (Suits)", defaultRate: 250, defaultUnits: 4 },
      dairy: { title: "डेयरी (Dairy)", unit: "लीटर दूध (Liters)", defaultRate: 48, defaultUnits: 20 },
      retail: { title: "किराना (Retail)", unit: "ग्राहक सेवा (Bills)", defaultRate: 180, defaultUnits: 6 },
      vegetable_vendor: { title: "सब्जी (Vendor)", unit: "किलो विक्रय (Kilos)", defaultRate: 35, defaultUnits: 30 },
      electronics_repair: { title: "मरम्मत कार्य (Repair/CSC)", unit: "उपकरण सेवा (Jobs)", defaultRate: 150, defaultUnits: 7 },
    },

    // Outputs
    audioHeading: "🔊 आज का ऑडियो सारांश सुनें (Listen to Daily Audio Cashflow)",
    audioTag: "Groq AI Audio Ledger",
    spokenPreviewLabel: "अनुवाद (Spoken Preview):",
    audioDialect: "आवाज: ग्रामीण छत्तीसगढ़ी-हिंदी",

    cardATitle: "खाता [क] / Card A",
    cardALabel: "दैनिक कुल आवक (Gross Inflow)",
    cardBTitle: "गुल्लक [ख] / Card B",
    cardBLabel: "बैंक किश्त कोटा (EMI Quota)",
    cardBLocked: "Locked",
    cardBSub: "(₹4,800 किश्त ÷ 30 दिन)",
    cardCTitle: "बचत [ग] / Card C",
    cardCLabel: "घर खर्च व शुद्ध बचत (Surplus)",
    cardCSurplusCaption: "हाथ में शुद्ध शेष राशि",
    cardCDeficitCaption: "किश्त कोटा हेतु कमी (Deficit)",

    healthGoodTitle: "✅ बहुत बढ़िया! आज का बैंक किश्त कोटा सुरक्षित है।",
    healthGoodDesc: "आज के ₹{gross} उत्पादन में से ₹{emi} सुरक्षित गुल्लक में जमा कर दिए गए हैं। आपका शुद्ध घर खर्च बचत ₹{net} पूरी तरह स्वतंत्र और उपलब्ध है। 05 नवम्बर की किश्त समय पर जमा होगी।",
    healthAlertTitle: "⚠️ चेतावनी: आज का उत्पादन बैंक किश्त कोटा से कम है!",
    healthAlertDesc: "आज की कुल आवक केवल ₹{gross} है, जबकि दैनिक किश्त गुल्लक कोटा ₹{emi} है। आज ₹{deficit} की कमी है। बैंक सखी सुनीता दीदी से वैकल्पिक कार्ययोजना हेतु संपर्क करें।",

    monthlyProgressLabel: "माह का संचित गुल्लक:",
    sweepSupported: "बैंक सुरक्षा लॉकर: SBI ऑटो-स्वीप समर्थित",

    // Active Loan Registry
    activeLoanTitle: "सक्रिय ऋण खाता विवरण (Active Loan Registry)",
    activeLoanSub: "Pradhan Mantri Mudra Yojana (PMMY) किशोर ऋण",
    regularAccountBadge: "🟢 मानक खाता / Regular",
    sanctionedLabel: "स्वीकृत राशि (Sanctioned)",
    sanctionedVal: "₹3,50,000",
    tradeVal: "सिलाई एवं बुटीक इकाई",
    disbursedLabel: "वितरण तिथि (Disbursed)",
    disbursedVal: "15 Sep 2026",
    disbursedTag: "प्रथम किश्त प्राप्त",
    bankBranchLabel: "सेवा प्रदाता बैंक (Bank Branch)",
    bankBranchVal: "भारतीय स्टेट बैंक (SBI)",
    bankBranchSub: "पाटन मुख्य शाखा (4021)",
    nextEmiLabel: "आगामी किश्त (Next EMI)",
    nextEmiVal: "₹4,800",
    nextEmiDue: "नियत तिथि: 05 Nov 2026",
    loanAcLabel: "ऋण खाता (Loan A/c)",
    loanAcVal: "SBIN-0921-8842-491",
    ifscVal: "IFSC: SBIN0004021",
    udyamLabel: "उद्यम पंजीकरण (Udyam ID)",
    udyamVal: "UDYAM-CG-04-001928",
    udyamTag: "सत्यापित सूक्ष्म इकाई",
    cibilStatus: "सिबिल स्कोर अभी जांचा नहीं गया है — औपचारिक रिपोर्ट हेतु बैंक से संपर्क करें।",
    contractCode: "अनुबंध कोड: CG-MUDRA-26",

    // Bank Sakhi Card
    sakhiTitle: "सुनीता दीदी (Sunita Didi)",
    sakhiRole: "पाटन ब्लॉक वित्तीय समन्वयक (SRLM)",
    sakhiArea: "पाटन क्षेत्र कोड: CG-491111 | सहायता केंद्र: दुर्ग ग्रामीण विकास समिति",
    sakhiHours: "सक्रिय सहायता उपलब्ध (09:00 AM - 06:00 PM)",
    callSakhiBtn: "📞 बैंक सखी को कॉल करें (0788-262104)",
    callSakhiSub: "डोरस्टेप बैंकिंग एवं भौतिक सत्यापन सहायता के लिए कॉल करें",

    // 5-Stage Roadmap
    roadmapTitle: "🚀 5-चरणीय प्रगति एवं सब्सिडी रोडमैप (Milestone Progression Tracker)",
    roadmapBadge: "Stage Roadmap",
    roadmapRate: "प्रगति दर: चरण 2/5 सक्रिय",

    stage1Title: "ऋण वितरण संपन्न",
    stage1Desc: "₹3,50,000 सीधे बैंक खाते में क्रेडिट हुए।",
    stage1Date: "15 Sep 2026",
    stage1Sub: "सत्यापित यूटीआर प्राप्त",

    stage2Title: "सिलाई मशीन क्रय व सत्यापन",
    stage2Desc: "उपकरण क्रय बिल और कार्यशाला का जियो-टैग्ड फोटो अपलोड करें।",
    stage2Btn: "बिल व फोटो अपलोड करें",
    stage2Sub: "सखी भौतिक सत्यापन प्रतीक्षित",
    stage2Verified: "✅ फोटो व जीएसटी बिल सत्यापित",

    stage3Title: "3% ब्याज अनुदान (DIC)",
    stage3Desc: "छत्तीसगढ़ उद्योग केंद्र महिला उद्यम ब्याज छूट दावा उपलब्ध।",
    stage3Btn: "⚡ 3% छूट दावा करें",
    stage3Claimed: "✅ 3% छूट दावा पंजीकृत",
    stage3Annual: "वार्षिक बचत: ₹10,500",

    stage4Title: "६ माह समयबद्ध भुगतान",
    stage4Desc: "बिना किसी चूक के ६ नियमित मासिक किश्तें पूरी करें। सिबिल स्कोर 760+ लक्ष्य।",
    stage4Progress: "प्रगति: 1/6 किश्त पूर्ण",

    stage5Title: "मुद्रा तरुण उन्नयन",
    stage5Desc: "₹10 लाख तक अतिरिक्त विस्तार ऋण पात्रता स्वचालित अनलॉक होगी।",
    stage5Lock: "लॉक (मई 2027 में अनलॉक)",

    // Statutory Locker
    complianceTitle: "🛡️ संवैधानिक दस्तावेज एवं बीमा लॉकर (Statutory Compliance Locker)",
    complianceSub: "डिजिटल लॉकर प्रमाणित एवं केंद्रीय डाटाबेस से संबद्ध",
    complianceCount: "3/3 दस्तावेज वैध",
    doc1Org: "एमएसएमई मंत्रालय, भारत सरकार",
    doc1Title: "उद्यम पंजीकरण प्रमाण पत्र",
    doc1Valid: "✅ 2030 तक वैध (Validated)",
    doc2Org: "SBI General Insurance",
    doc2Title: "उपकरण व सुरक्षा बीमा पॉलिसी",
    doc2Valid: "✅ सक्रिय कवर (₹3.5 लाख)",
    doc3Org: "ग्राम पंचायत सेलूद (दुर्ग)",
    doc3Title: "व्यापार अनापत्ति प्रमाण (NOC)",
    doc3Valid: "📄 जमा किया गया — सत्यापन लंबित",
    viewDoc: "[देखें / View]",

    // Bottom Action Bar
    printSlipBtn: "🖨️ दैनिक बहीखाता पर्ची प्रिंट करें",
    statementBtn: "📈 वित्तीय प्रगति रिपोर्ट (Ledger Statement)",
    backBtn: "← योजना चयन पृष्ठ पर वापस जाएं (Back to Matcher)",
    footerTitle: "ग्रामीण वित्तीय सहयोग एवं उद्यम खाता",
    footerDesc: "प्रमाणित ग्रामीण वित्तीय समावेशन मंच। भारत सरकार एवं अग्रणी बैंकों के सहयोग से ग्रामीण उद्यमियों के लिए अधिकृत।",
  },

  mr: {
    folio: "खाते क्रमांक / Folio: CG-PTN-2026-0921-R",
    sessionInfo: "सत्र: 2026-27 | ग्रामपंचायत: सेलुद (पाटन)",
    liveStatus: "थेट आर्थिक साथी (Sahay Live)",
    lastEntry: "अंतिम नोंद: 24 Oct 2026, 06:15 PM",

    // Intake Form
    intakeHeading: "दैनिक उत्पादन आणि हिशोब नोंद",
    intakeSubheading: "(Daily Production & Input Parameters)",
    intakeDesc: "आज केलेल्या उत्पादन किंवा विक्रीची संख्या नोंदवा. प्रणाली आपोआप बँक हप्ता गुल्लक (₹160/दिवस) वेगळा करून आपल्या घरखर्च नफ्याची गणना करेल.",
    modeSelf: "👤 स्व-सेवा",
    modeSakhi: "🤝 सखी / CSC मोड",
    tradeLabel: "1. व्यवसाय श्रेणी (Trade Category)",
    unitLabel: "2. आजचे दैनिक उत्पादन (Output Units)",
    unitDesc: "आज तयार केलेले नग / सेवा संख्या नोंदवा.",
    rateLabel: "3. सरासरी दर प्रति युनिट (Avg. Rate Per Unit)",
    ratePerUnit: "/ युनिट",
    calculateBtn: "📊 दैनिक हिशोब व गुल्लक वाटप गणना करा (Calculate Cashflow)",
    calculatingBtn: "हिशोब व वाटप गणना सुरू आहे...",
    zeroTestBtn: "उत्पादन 0 करून तोटा चाचणी पहा (Test 0 Units)",

    trades: {
      tailor: { title: "शिलाई (Boutique)", unit: "सूट शिवले (Suits)", defaultRate: 250, defaultUnits: 4 },
      dairy: { title: "दुग्ध व्यवसाय (Dairy)", unit: "लिटर दूध (Liters)", defaultRate: 48, defaultUnits: 20 },
      retail: { title: "किराणा (Retail)", unit: "ग्राहक सेवा (Bills)", defaultRate: 180, defaultUnits: 6 },
      vegetable_vendor: { title: "भाजीपाला (Vendor)", unit: "किलो विक्री (Kilos)", defaultRate: 35, defaultUnits: 30 },
      electronics_repair: { title: "दुरुस्ती / सेवा (Repair & CSC)", unit: "उपकरण सेवा (Jobs)", defaultRate: 150, defaultUnits: 7 },
    },

    // Outputs
    audioHeading: "🔊 आजचा ऑडिओ सारांश ऐका (Listen to Daily Audio Cashflow)",
    audioTag: "Groq AI Audio Ledger",
    spokenPreviewLabel: "अनुवाद (Spoken Preview):",
    audioDialect: "आवाज: प्रादेशिक मराठी",

    cardATitle: "खाते [अ] / Card A",
    cardALabel: "दैनिक एकूण आवक (Gross Inflow)",
    cardBTitle: "गुल्लक [ब] / Card B",
    cardBLabel: "बँक हप्ता कोटा (EMI Quota)",
    cardBLocked: "Locked",
    cardBSub: "(₹4,800 हप्ता ÷ 30 दिवस)",
    cardCTitle: "बचत [क] / Card C",
    cardCLabel: "घरखर्च व निव्वळ बचत (Surplus)",
    cardCSurplusCaption: "हातात शिल्लक निव्वळ रक्कम",
    cardCDeficitCaption: "हप्ता भरण्यासाठी तूट (Deficit)",

    healthGoodTitle: "✅ उत्तम! आजचा बँक हप्ता कोटा सुरक्षित आहे.",
    healthGoodDesc: "आजच्या ₹{gross} उत्पादनामधून ₹{emi} सुरक्षित गुल्लक मध्ये बाजूला ठेवले आहेत. तुमचा निव्वळ घरखर्च नफा ₹{net} सुरक्षित आहे. 05 नोव्हेंबरचा हप्ता वेळेवर भरेल.",
    healthAlertTitle: "⚠️ चेतावणी: आजचे उत्पादन बँक हप्ता कोट्यापेक्षा कमी आहे!",
    healthAlertDesc: "आजची एकूण आवक केवळ ₹{gross} आहे, तर दैनिक हप्ता कोटा ₹{emi} आहे. आज ₹{deficit} ची तूट आहे. बँक सखी सुनीता दीदी यांच्याशी संपर्क साधा.",

    monthlyProgressLabel: "महिन्याचा संचित गुल्लक:",
    sweepSupported: "बँक सुरक्षा लॉकर: SBI ऑटो-स्वीप समर्थित",

    // Active Loan Registry
    activeLoanTitle: "सक्रिय कर्ज खाते तपशील (Active Loan Registry)",
    activeLoanSub: "Pradhan Mantri Mudra Yojana (PMMY) किशोर कर्ज",
    regularAccountBadge: "🟢 नियमित खाते / Regular",
    sanctionedLabel: "मंजूर रक्कम (Sanctioned)",
    sanctionedVal: "₹3,50,000",
    tradeVal: "शिलाई व बुटीक युनिट",
    disbursedLabel: "वितरण तारीख (Disbursed)",
    disbursedVal: "15 Sep 2026",
    disbursedTag: "पहिला हप्ता प्राप्त",
    bankBranchLabel: "सेवा पुरवठादार बँक (Bank Branch)",
    bankBranchVal: "भारतीय स्टेट बँक (SBI)",
    bankBranchSub: "पाटन मुख्य शाखा (4021)",
    nextEmiLabel: "पुढील हप्ता (Next EMI)",
    nextEmiVal: "₹4,800",
    nextEmiDue: "देय तारीख: 05 Nov 2026",
    loanAcLabel: "कर्ज खाते (Loan A/c)",
    loanAcVal: "SBIN-0921-8842-491",
    ifscVal: "IFSC: SBIN0004021",
    udyamLabel: "उद्यम नोंदणी (Udyam ID)",
    udyamVal: "UDYAM-CG-04-001928",
    udyamTag: "सत्यापित सूक्ष्म युनिट",
    cibilStatus: "सिबिल स्कोअर अद्याप तपासलेला नाही — औपचारिक अहवालासाठी बँकेशी संपर्क साधा.",
    contractCode: "करार कोड: CG-MUDRA-26",

    // Bank Sakhi Card
    sakhiTitle: "सुनीता दीदी (Sunita Didi)",
    sakhiRole: "पाटन ब्लॉक आर्थिक समन्वयक (SRLM)",
    sakhiArea: "पाटन क्षेत्र कोड: CG-491111 | मदत केंद्र: दुर्ग ग्रामीण विकास समिती",
    sakhiHours: "सक्रिय मदत उपलब्ध (09:00 AM - 06:00 PM)",
    callSakhiBtn: "📞 बँक सखींना कॉल करा (0788-262104)",
    callSakhiSub: "डोअरस्टेप बँकिंग आणि प्रत्यक्ष तपासणीसाठी कॉल करा",

    // 5-Stage Roadmap
    roadmapTitle: "🚀 5-टप्प्यांची प्रगती व सबसिडी रोडमॅप (Milestone Progression Tracker)",
    roadmapBadge: "Stage Roadmap",
    roadmapRate: "प्रगती दर: टप्पा 2/5 सक्रिय",

    stage1Title: "कर्ज वितरण पूर्ण",
    stage1Desc: "₹3,50,000 थेट बँक खात्यात जमा झाले.",
    stage1Date: "15 Sep 2026",
    stage1Sub: "सत्यापित UTR प्राप्त",

    stage2Title: "शिलाई मशिन खरेदी व पडताळणी",
    stage2Desc: "मशिन खरेदी बिल आणि कार्यशाळेचा जिओ-टॅग फोटो अपलोड करा.",
    stage2Btn: "बिल व फोटो अपलोड करा",
    stage2Sub: "सखी प्रत्यक्ष पडताळणी प्रलंबित",
    stage2Verified: "✅ फोटो व जीएसटी बिल सत्यापित",

    stage3Title: "3% व्याज सवलत (DIC)",
    stage3Desc: "उद्योग केंद्र महिला उद्यम व्याज अनुदान दावा उपलब्ध.",
    stage3Btn: "⚡ 3% सवलत दावा करा",
    stage3Claimed: "✅ 3% सवलत दावा नोंदवला",
    stage3Annual: "वार्षिक बचत: ₹10,500",

    stage4Title: "६ महिने नियमित परतफेड",
    stage4Desc: "विनाचूक ६ नियमित मासिक हप्ते पूर्ण करा. सिबिल स्कोअर 760+ लक्ष्य.",
    stage4Progress: "प्रगती: 1/6 हप्ते पूर्ण",

    stage5Title: "मुद्रा तरुण श्रेणी उन्नयन",
    stage5Desc: "₹10 लाखांपर्यंत पुढील विस्तार कर्ज आपोआप अनलॉक होईल.",
    stage5Lock: "लॉक (मे 2027 मध्ये अनलॉक)",

    // Statutory Locker
    complianceTitle: "🛡️ वैधानिक कागदपत्रे व विमा लॉकर (Statutory Compliance Locker)",
    complianceSub: "डिजिटल लॉकर प्रमाणित आणि केंद्रीय डेटाबेसशी जोडलेले",
    complianceCount: "3/3 कागदपत्रे वैध",
    doc1Org: "एमएसएमई मंत्रालय, भारत सरकार",
    doc1Title: "उद्यम नोंदणी प्रमाणपत्र",
    doc1Valid: "✅ 2030 पर्यंत वैध (Validated)",
    doc2Org: "SBI General Insurance",
    doc2Title: "उपकरण व सुरक्षा विमा पॉलिसी",
    doc2Valid: "✅ सक्रिय कव्हर (₹3.5 लाख)",
    doc3Org: "ग्रामपंचायत सेलुद (दुर्ग)",
    doc3Title: "व्यवसाय ना-हरकत प्रमाणपत्र (NOC)",
    doc3Valid: "📄 सादर केले — पडताळणी प्रलंबित",
    viewDoc: "[पहा / View]",

    // Bottom Action Bar
    printSlipBtn: "🖨️ दैनिक हिशोब पावती प्रिंट करा",
    statementBtn: "📈 आर्थिक प्रगती अहवाल (Ledger Statement)",
    backBtn: "← योजना निवड पृष्ठावर परत जा (Back to Matcher)",
    footerTitle: "ग्रामीण आर्थिक सहकार्य व उद्यम खाते",
    footerDesc: "प्रमाणित ग्रामीण वित्तीय समावेशन मंच। भारत सरकार व बँकांच्या सहकार्याने अधिकृत.",
  },

  ta: {
    folio: "கணக்கு எண் / Folio: CG-PTN-2026-0921-R",
    sessionInfo: "ஆண்டு: 2026-27 | கிராம பஞ்சாயத்து: செலுத் (படன்)",
    liveStatus: "நேரடி நிதி துணை (Sahay Live)",
    lastEntry: "கடைசி பதிவு: 24 Oct 2026, 06:15 PM",

    // Intake Form
    intakeHeading: "தினசரி உற்பத்தி மற்றும் வரவு-செலவு உள்ளீடு",
    intakeSubheading: "(Daily Production & Input Parameters)",
    intakeDesc: "இன்றைய உற்பத்தி அல்லது விற்பனை எண்ணிக்கையை உள்ளிடவும். கணினி தானாக வங்கி தவணை சேமிப்பை (₹160/நாள்) பிரித்து உங்கள் குடும்ப நிகர லாபத்தை கணக்கிடும்.",
    modeSelf: "👤 சுய சேவை",
    modeSakhi: "🤝 சகி / CSC முறை",
    tradeLabel: "1. தொழில் பிரிவு (Trade Category)",
    unitLabel: "2. இன்றைய உற்பத்தி அளவு (Output Units)",
    unitDesc: "இன்று தயார் செய்யப்பட்ட தயாரிப்புகள் / சேவையின் எண்ணிக்கை.",
    rateLabel: "3. சராசரி அலகு விலை (Avg. Rate Per Unit)",
    ratePerUnit: "/ அலகு",
    calculateBtn: "📊 தினசரி கணக்கீடு மற்றும் சேமிப்பை கணக்கிடுக (Calculate Cashflow)",
    calculatingBtn: "கணக்கீடு செய்யப்படுகிறது...",
    zeroTestBtn: "உற்பத்தி 0 ஆக்கி நஷ்ட சோதனை காண்க (Test 0 Units)",

    trades: {
      tailor: { title: "தையல் (Boutique)", unit: "தைத்த உடைகள் (Suits)", defaultRate: 250, defaultUnits: 4 },
      dairy: { title: "பால் பண்ணை (Dairy)", unit: "லிட்டர் பால் (Liters)", defaultRate: 48, defaultUnits: 20 },
      retail: { title: "மளிகை கடை (Retail)", unit: "வாடிக்கையாளர் பில் (Bills)", defaultRate: 180, defaultUnits: 6 },
      vegetable_vendor: { title: "காய்கறி (Vendor)", unit: "கிலோ விற்பனை (Kilos)", defaultRate: 35, defaultUnits: 30 },
      electronics_repair: { title: "பழுது நீக்கம் (Repair & CSC)", unit: "சேவை வேலைகள் (Jobs)", defaultRate: 150, defaultUnits: 7 },
    },

    // Outputs
    audioHeading: "🔊 இன்றைய ஆடியோ சுருக்கத்தைக் கேளுங்கள் (Listen to Daily Audio Cashflow)",
    audioTag: "Groq AI Audio Ledger",
    spokenPreviewLabel: "மொழிபெயர்ப்பு (Spoken Preview):",
    audioDialect: "குரல்: தமிழ்",

    cardATitle: "கணக்கு [A] / Card A",
    cardALabel: "தினசரி மொத்த வருமானம் (Gross Inflow)",
    cardBTitle: "சேமிப்பு குடுவை [B] / Card B",
    cardBLabel: "வங்கி தவணை ஒதுக்கீடு (EMI Quota)",
    cardBLocked: "Locked",
    cardBSub: "(₹4,800 தவணை ÷ 30 நாட்கள்)",
    cardCTitle: "சேமிப்பு [C] / Card C",
    cardCLabel: "குடும்ப நிகர லாபம் (Surplus)",
    cardCSurplusCaption: "கையில் உள்ள நிகர தொகை",
    cardCDeficitCaption: "தவணைக்கான பற்றாக்குறை (Deficit)",

    healthGoodTitle: "✅ மிக நன்று! இன்றைய வங்கி தவணை தொகை பாதுகாக்கப்பட்டுள்ளது.",
    healthGoodDesc: "இன்றைய ₹{gross} வருமானத்தில் ₹{emi} வங்கி சேமிப்பு குடுவையில் ஒதுக்கப்பட்டுள்ளது. உங்கள் குடும்ப நிகர லாபம் ₹{net} பாதுகாப்பாக உள்ளது.",
    healthAlertTitle: "⚠️ எச்சரிக்கை: இன்றைய உற்பத்தி வங்கி தவணை இலக்கை விட குறைவாக உள்ளது!",
    healthAlertDesc: "இன்றைய மொத்த வரவு ₹{gross}, ஆனால் தினசரி தவணை இலக்கு ₹{emi}. இன்று ₹{deficit} பற்றாக்குறை ஏற்பட்டுள்ளது. வங்கி சகி சுனிதா திதியை தொடர்பு கொள்ளவும்.",

    monthlyProgressLabel: "மாதத்தின் மொத்த சேமிப்பு:",
    sweepSupported: "வங்கி பாதுகாப்பு: SBI ஆட்டோ-ஸ்வீப் ஆதரவு",

    // Active Loan Registry
    activeLoanTitle: "செயலில் உள்ள கடன் கணக்கு விவரம் (Active Loan Registry)",
    activeLoanSub: "Pradhan Mantri Mudra Yojana (PMMY) கிஷோர் கடன்",
    regularAccountBadge: "🟢 வழக்கமான கணக்கு / Regular",
    sanctionedLabel: "ஒப்புதல் பெற்ற தொகை (Sanctioned)",
    sanctionedVal: "₹3,50,000",
    tradeVal: "தையல் மற்றும் பொட்டிக் பிரிவு",
    disbursedLabel: "வழங்கப்பட்ட தேதி (Disbursed)",
    disbursedVal: "15 Sep 2026",
    disbursedTag: "முதல் தவணை பெறப்பட்டது",
    bankBranchLabel: "வங்கி கிளை (Bank Branch)",
    bankBranchVal: "பாரத ஸ்டேட் வங்கி (SBI)",
    bankBranchSub: "படன் முதன்மை கிளை (4021)",
    nextEmiLabel: "அடுத்த தவணை (Next EMI)",
    nextEmiVal: "₹4,800",
    nextEmiDue: "கடைசி தேதி: 05 Nov 2026",
    loanAcLabel: "கடன் கணக்கு எண் (Loan A/c)",
    loanAcVal: "SBIN-0921-8842-491",
    ifscVal: "IFSC: SBIN0004021",
    udyamLabel: "உத்யம் பதிவு (Udyam ID)",
    udyamVal: "UDYAM-CG-04-001928",
    udyamTag: "சரிபார்க்கப்பட்ட குறுந்தொழில்",
    cibilStatus: "சிபில் மதிப்பெண் இன்னும் சரிபார்க்கப்படவில்லை — முறையான அறிக்கைக்கு வங்கியைத் தொடர்பு கொள்ளவும்.",
    contractCode: "ஒப்பந்த குறியீடு: CG-MUDRA-26",

    // Bank Sakhi Card
    sakhiTitle: "சுனிதா திதி (Sunita Didi)",
    sakhiRole: "படன் வட்டார நிதி ஒருங்கிணைப்பாளர் (SRLM)",
    sakhiArea: "படன் குறியீடு: CG-491111 | உதவி மையம்: துர்க் ஊரக வளர்ச்சி சங்கம்",
    sakhiHours: "உதவி கிடைக்கும் நேரம் (09:00 AM - 06:00 PM)",
    callSakhiBtn: "📞 வங்கி சகிக்கு அழைக்கவும் (0788-262104)",
    callSakhiSub: "நேரடி வங்கி சேவை மற்றும் சரிபார்ப்பு உதவிக்கு அழைக்கவும்",

    // 5-Stage Roadmap
    roadmapTitle: "🚀 5-படிநிலை முன்னேற்றம் மற்றும் மானிய வழிகாட்டி (Milestone Progression Tracker)",
    roadmapBadge: "Stage Roadmap",
    roadmapRate: "முன்னேற்றம்: படி 2/5 செயலில் உள்ளது",

    stage1Title: "கடன் தொகை வழங்கப்பட்டது",
    stage1Desc: "₹3,50,000 நேரடியாக வங்கி கணக்கில் வரவு வைக்கப்பட்டது.",
    stage1Date: "15 Sep 2026",
    stage1Sub: "சரிபார்க்கப்பட்ட UTR பெறப்பட்டது",

    stage2Title: "தையல் இயந்திரம் கொள்முதல் மற்றும் சரிபார்ப்பு",
    stage2Desc: "இயந்திர ரசீது மற்றும் பட்டறையின் புவி-குறிச்சொல் புகைப்படத்தை பதிவேற்றவும்.",
    stage2Btn: "ரசீது & புகைப்படம் பதிவேற்றவும்",
    stage2Sub: "வங்கி சகி நேரடி சரிபார்ப்பு நிலுவையில் உள்ளது",
    stage2Verified: "✅ புகைப்படம் மற்றும் ஜிஎஸ்டி ரசீது சரிபார்க்கப்பட்டது",

    stage3Title: "3% வட்டி மானியம் (DIC)",
    stage3Desc: "தொழில் மைய மகளிர் தொழில் வட்டி மானிய கோரிக்கை கிடைக்கிறது.",
    stage3Btn: "⚡ 3% மானியம் கோரவும்",
    stage3Claimed: "✅ 3% மானிய கோரிக்கை பதிவு செய்யப்பட்டது",
    stage3Annual: "ஆண்டு சேமிப்பு: ₹10,500",

    stage4Title: "6 மாதங்கள் சரியான நேரத்தில் தவணை செலுத்துதல்",
    stage4Desc: "தவறாமல் 6 மாத தவணைகளை முடிக்கவும். சிபில் இலக்கு 760+.",
    stage4Progress: "முன்னேற்றம்: 1/6 தவணை முடிந்தது",

    stage5Title: "முத்ரா தருண் கடன் உயர்வு",
    stage5Desc: "₹10 லட்சம் வரையிலான கூடுதல் விரிவாக்க கடன் தானாக திறக்கப்படும்.",
    stage5Lock: "பூட்டப்பட்டுள்ளது (மே 2027-ல் திறக்கப்படும்)",

    // Statutory Locker
    complianceTitle: "🛡️ சட்டப்பூர்வ ஆவணங்கள் மற்றும் காப்பீடு (Statutory Compliance Locker)",
    complianceSub: "டிஜிலாக்கர் மூலம் சரிபார்க்கப்பட்டு மத்திய தரவுத்தளத்துடன் இணைக்கப்பட்டுள்ளது",
    complianceCount: "3/3 ஆவணங்கள் செல்லுபடியாகும்",
    doc1Org: "குறு, சிறு அமைச்சகம், இந்திய அரசு",
    doc1Title: "உத்யம் பதிவு சான்றிதழ்",
    doc1Valid: "✅ 2030 வரை செல்லுபடியாகும்",
    doc2Org: "SBI General Insurance",
    doc2Title: "இயந்திரம் & பாதுகாப்பு காப்பீட்டுக் கொள்கை",
    doc2Valid: "✅ செயலில் உள்ள பாதுகாப்பு (₹3.5 லட்சம்)",
    doc3Org: "கிராம பஞ்சாயத்து செலுத் (துர்க்)",
    doc3Title: "தொழில் தடையில்லா சான்றிதழ் (NOC)",
    doc3Valid: "📄 சமர்ப்பிக்கப்பட்டது — சரிபார்ப்பு நிலுவையில்",
    viewDoc: "[பார்க்க / View]",

    // Bottom Action Bar
    printSlipBtn: "🖨️ தினசரி கணக்கு சீட்டை அச்சிடவும்",
    statementBtn: "📈 நிதி முன்னேற்ற அறிக்கை (Ledger Statement)",
    backBtn: "← திட்ட தேர்வு பக்கத்திற்கு திரும்பவும் (Back to Matcher)",
    footerTitle: "ஊரக நிதி உதவி மற்றும் தொழில் கணக்கு",
    footerDesc: "அங்கீகரிக்கப்பட்ட ஊரக நிதி சேர்க்கை தளம். இந்திய அரசு மற்றும் வங்கிகளுடன் இணைந்து செயல்படுகிறது.",
  },

  en: {
    folio: "Folio Registry: CG-PTN-2026-0921-R",
    sessionInfo: "Session: 2026-27 | Gram Panchayat: Selud (Patan)",
    liveStatus: "Live Credit Ledger (Sahay Live)",
    lastEntry: "Last Entry: 24 Oct 2026, 06:15 PM",

    // Intake Form
    intakeHeading: "Daily Production & Financial Input",
    intakeSubheading: "(Daily Production & Input Parameters)",
    intakeDesc: "Enter today's physical output units. The system automatically secures your daily bank EMI quota (₹160/day) and computes your net household surplus.",
    modeSelf: "👤 Self-Service",
    modeSakhi: "🤝 Bank Sakhi / CSC Mode",
    tradeLabel: "1. Enterprise Trade Category",
    unitLabel: "2. Today's Output Production (Units)",
    unitDesc: "Enter the number of units / services produced today.",
    rateLabel: "3. Average Rate Per Unit",
    ratePerUnit: "/ unit",
    calculateBtn: "📊 Calculate Daily Cashflow & Savings Allocation",
    calculatingBtn: "Calculating ledger allocation...",
    zeroTestBtn: "Simulate Deficit (Test 0 Units)",

    trades: {
      tailor: { title: "Tailoring (Boutique)", unit: "Suits Stitched (Suits)", defaultRate: 250, defaultUnits: 4 },
      dairy: { title: "Dairy Farming", unit: "Liters of Milk (Liters)", defaultRate: 48, defaultUnits: 20 },
      retail: { title: "Kirana Retail Store", unit: "Customer Footfall (Bills)", defaultRate: 180, defaultUnits: 6 },
      vegetable_vendor: { title: "Vegetable Vendor", unit: "Kilos Sold (Kilos)", defaultRate: 35, defaultUnits: 30 },
      electronics_repair: { title: "Repair / CSC Services", unit: "Service Jobs (Jobs)", defaultRate: 150, defaultUnits: 7 },
    },

    // Outputs
    audioHeading: "🔊 Listen to Today's Audio Cashflow Summary",
    audioTag: "Groq AI Audio Ledger",
    spokenPreviewLabel: "Spoken Preview:",
    audioDialect: "Voice: Official English",

    cardATitle: "Ledger [A] / Card A",
    cardALabel: "Daily Gross Inflow",
    cardBTitle: "Bank Jar [B] / Card B",
    cardBLabel: "Daily Bank EMI Quota",
    cardBLocked: "Locked",
    cardBSub: "(₹4,800 EMI ÷ 30 Days)",
    cardCTitle: "Surplus [C] / Card C",
    cardCLabel: "Net Household Surplus",
    cardCSurplusCaption: "Net take-home cash surplus",
    cardCDeficitCaption: "EMI Quota Deficit",

    healthGoodTitle: "✅ Excellent! Today's bank repayment quota is securely covered.",
    healthGoodDesc: "Out of today's ₹{gross} revenue, ₹{emi} has been safely locked in your bank repayment jar. Your net household surplus of ₹{net} is available and free. Next EMI will be paid on time.",
    healthAlertTitle: "⚠️ Warning: Today's revenue is below the daily EMI quota!",
    healthAlertDesc: "Today's gross inflow is ₹{gross}, while the required daily repayment jar target is ₹{emi}. You have a ₹{deficit} deficit. Connect with assigned Bank Sakhi Sunita Didi for recovery guidance.",

    monthlyProgressLabel: "Monthly Cumulative Jar:",
    sweepSupported: "Bank Security Locker: SBI Auto-Sweep Enabled",

    // Active Loan Registry
    activeLoanTitle: "Active Loan Account Overview",
    activeLoanSub: "Pradhan Mantri Mudra Yojana (PMMY) Kishore Credit",
    regularAccountBadge: "🟢 Standard Account / Regular",
    sanctionedLabel: "Sanctioned Amount",
    sanctionedVal: "₹3,50,000",
    tradeVal: "Tailoring & Boutique Unit",
    disbursedLabel: "Disbursal Date",
    disbursedVal: "15 Sep 2026",
    disbursedTag: "1st Tranche Credited",
    bankBranchLabel: "Servicing Bank Branch",
    bankBranchVal: "State Bank of India (SBI)",
    bankBranchSub: "Patan Main Branch (4021)",
    nextEmiLabel: "Next Monthly EMI Due",
    nextEmiVal: "₹4,800",
    nextEmiDue: "Due Date: 05 Nov 2026",
    loanAcLabel: "Loan Account No.",
    loanAcVal: "SBIN-0921-8842-491",
    ifscVal: "IFSC: SBIN0004021",
    udyamLabel: "MSME Udyam ID",
    udyamVal: "UDYAM-CG-04-001928",
    udyamTag: "Verified Micro Enterprise",
    cibilStatus: "CIBIL score not yet checked — ask your bank for a formal credit report.",
    contractCode: "Contract Code: CG-MUDRA-26",

    // Bank Sakhi Card
    sakhiTitle: "Sunita Didi (Bank Sakhi)",
    sakhiRole: "Patan Block Financial Coordinator (SRLM)",
    sakhiArea: "Patan Area Code: CG-491111 | Helpdesk: Durg Rural Development Society",
    sakhiHours: "Active Support Available (09:00 AM - 06:00 PM)",
    callSakhiBtn: "📞 Call Bank Sakhi (0788-262104)",
    callSakhiSub: "Call for doorstep banking & asset physical inspection support",

    // 5-Stage Roadmap
    roadmapTitle: "🚀 5-Stage Milestone Progression & Subsidy Roadmap",
    roadmapBadge: "Stage Roadmap",
    roadmapRate: "Progress Rate: Stage 2/5 Active",

    stage1Title: "Loan Disbursed into Account",
    stage1Desc: "₹3,50,000 credited directly to savings/current account.",
    stage1Date: "15 Sep 2026",
    stage1Sub: "Verified UTR Credited",

    stage2Title: "Machinery Purchase & Inspection",
    stage2Desc: "Upload equipment GST invoice and workshop geo-tagged photograph.",
    stage2Btn: "Upload Invoice & Photo",
    stage2Sub: "Bank Sakhi inspection pending",
    stage2Verified: "✅ Photo & GST Invoice Verified",

    stage3Title: "3% Interest Subvention (DIC)",
    stage3Desc: "District Industries Centre Women Enterprise interest rebate available.",
    stage3Btn: "⚡ Claim 3% Interest Subvention",
    stage3Claimed: "✅ 3% Subvention Claim Lodged",
    stage3Annual: "Annual Savings: ₹10,500",

    stage4Title: "6-Month Timely Repayment Track",
    stage4Desc: "Complete 6 consecutive EMIs without delay. Target CIBIL score: 760+.",
    stage4Progress: "Progress: 1/6 EMIs Completed",

    stage5Title: "Mudra Tarun Upgrade Eligibility",
    stage5Desc: "Up to ₹10 Lakhs expansion credit limit automatically unlocked.",
    stage5Lock: "Locked (Unlocks in May 2027)",

    // Statutory Locker
    complianceTitle: "🛡️ Statutory Compliance & Insurance Locker",
    complianceSub: "DigiLocker verified & linked with Central MSME registry",
    complianceCount: "3/3 Documents Valid",
    doc1Org: "Ministry of MSME, Govt. of India",
    doc1Title: "Udyam Registration Certificate",
    doc1Valid: "✅ Validated till 2030",
    doc2Org: "SBI General Insurance",
    doc2Title: "Machinery & Protection Policy",
    doc2Valid: "✅ Active Cover (₹3.5 Lakhs)",
    doc3Org: "Gram Panchayat Selud (Durg)",
    doc3Title: "Trade No-Objection Certificate (NOC)",
    doc3Valid: "📄 Submitted — pending verification",
    viewDoc: "[View Document]",

    // Bottom Action Bar
    printSlipBtn: "🖨️ Print Daily Cashflow Ledger Slip",
    statementBtn: "📈 Financial Progress Report (Ledger Statement)",
    backBtn: "← Back to Scheme Matcher",
    footerTitle: "Rural Financial Support & Enterprise Ledger",
    footerDesc: "Official rural financial inclusion platform. Authorized by Govt. of India in collaboration with lead banks.",
  },
};

const DAILY_EMI_FIXED = 160; // ₹4,800 monthly EMI / 30 days

export default function CompanionPage() {
  const [lang, setLang] = useState("hi");
  const [assistedMode, setAssistedMode] = useState(false);
  const [tradeCategory, setTradeCategory] = useState("tailor");
  const [voiceHeard, setVoiceHeard] = useState("");
  const [speakToken, setSpeakToken] = useState(0); // bumped when results are ready: triggers the spoken result
  const [unitCount, setUnitCount] = useState(4);
  const [unitRate, setUnitRate] = useState(250);

  // Two-phase visibility state
  const [hasCalculated, setHasCalculated] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Milestone interactive actions
  const [invoiceUploaded, setInvoiceUploaded] = useState(false);
  const [subsidyClaimed, setSubsidyClaimed] = useState(false);

  const resultsRef = useRef(null);
  const t = COMPANION_I18N[lang] || COMPANION_I18N.hi;
  const currentTrade = t.trades[tradeCategory] || t.trades.tailor;

  // Handle Trade Change
  const handleTradeSelect = (key) => {
    setTradeCategory(key);
    const tradeData = t.trades[key] || t.trades.tailor;
    setUnitCount(tradeData.defaultUnits);
    setUnitRate(tradeData.defaultRate);
  };

  // Computations
  const grossInflow = Math.max(0, unitCount) * Math.max(0, unitRate);
  const netSurplus = grossInflow - DAILY_EMI_FIXED;
  const isHealthy = netSurplus >= 0;
  const deficitAmount = Math.abs(netSurplus);

  // Calculate & Reveal Outputs
  const handleCalculate = (e) => {
    if (e) e.preventDefault();
    unlockAudio(); // runs inside the user's tap, so the result can be spoken automatically later
    setIsCalculating(true);
    setTimeout(() => {
      setHasCalculated(true);
      setIsCalculating(false);
      setSpeakToken((n) => n + 1); // result is ready: start speaking it
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }, 400);
  };

  // Simulate Deficit
  const handleSimulateDeficit = () => {
    unlockAudio();
    setUnitCount(0);
    setHasCalculated(true);
    setSpeakToken((n) => n + 1);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // Dynamic Audio Voice Script
  // What is SPOKEN. Only numbers computed from today's inputs are read out
  // (earning, the fixed daily installment this page assumes, what is left).
  // This page's sample loan history (credited amount, "next EMI due", insurance and
  // registration status) is placeholder content and is deliberately NOT narrated:
  // reading it aloud would present made-up status as the user's real loan.
  const getAudioScript = () =>
    buildCompanionNarration({ lang, gross: grossInflow, emi: DAILY_EMI_FIXED, net: netSurplus });

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Unified Spacious Stitch Navbar with Sharp Corners */}
      <Navbar activePage="companion" lang={lang} setLang={setLang} />

      <main className="w-full pt-20 bg-surface min-h-[calc(100vh-140px)]">
        <div className="flex flex-col w-full">

          {/* Sub-Header Registry Stripe */}
          <div className="w-full bg-[#f5e6d4] border-b border-[#d6c4b1] px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-y-2 text-[#221a10]">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-[#845400] text-white font-bold text-xs rounded-none">
                खा
              </span>
              <span className="font-mono text-xs uppercase tracking-wider text-[#221a10] font-bold">
                {t.folio}
              </span>
              <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-none bg-[#d6c4b1]"></span>
              <span className="font-sans text-xs text-[#514536] hidden md:inline">
                {t.sessionInfo}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-sans">
              <span className="flex items-center gap-1.5 text-[#4d6537] font-bold">
                <span className="w-2 h-2 rounded-none bg-[#4d6537] animate-pulse"></span>
                {t.liveStatus}
              </span>
              <span className="text-[#514536] font-mono hidden sm:inline">
                {t.lastEntry}
              </span>
            </div>
          </div>

          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8">

            {/* ========================================================================= */}
            {/* PHASE 1: INPUT CONTROLS FIRST (Daily Production Intake & Mode Selection) */}
            {/* ========================================================================= */}
            <section className="w-full bg-[#ffffff] border-2 border-[#837564] p-5 sm:p-7 relative shadow-md rounded-none">

              {/* Header Title with Mode Segmented Control */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-[#d6c4b1]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#845400] text-white font-sans text-[11px] uppercase font-bold rounded-none">
                      खाता-बही भाग ३
                    </span>
                    <span className="font-sans text-xs text-[#514536] uppercase tracking-wider">
                      दैनिक आवक-जावक रजिस्टर
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl text-[#221a10] font-bold mt-1">
                    📒 {t.intakeHeading} <span className="text-sm font-sans font-normal text-[#514536]">{t.intakeSubheading}</span>
                  </h2>
                  <p className="font-sans text-xs text-[#514536] mt-1 max-w-2xl">
                    {t.intakeDesc}
                  </p>
                </div>

                {/* Assisted / Self-Service Toggle (Square) */}
                <div className="flex items-center gap-2 bg-[#fff8f3] p-1 border border-[#d6c4b1] rounded-none">
                  <button
                    type="button"
                    onClick={() => setAssistedMode(false)}
                    className={`px-3 py-1.5 rounded-none text-xs font-sans font-bold transition-colors ${!assistedMode
                      ? "bg-[#845400] text-white shadow-xs"
                      : "text-[#514536] hover:text-[#221a10]"
                      }`}
                  >
                    {t.modeSelf}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssistedMode(true)}
                    className={`px-3 py-1.5 rounded-none text-xs font-sans font-bold transition-colors ${assistedMode
                      ? "bg-[#845400] text-white shadow-xs"
                      : "text-[#514536] hover:text-[#221a10]"
                      }`}
                  >
                    {t.modeSakhi}
                  </button>
                </div>
              </div>

              {/* Form Input Elements Grid */}
              <form onSubmit={handleCalculate} className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">

                {/* Left: Trade Category & Unit Controls (7 Cols) */}
                <div className="lg:col-span-7 flex flex-col gap-5">

                  {/* PRIMARY VOICE INPUT — speak once, the form fills itself.
                      Typing stays fully available below. */}
                  <div className="border-2 border-[#845400] bg-[#fbebda]/50 p-5 flex flex-col items-center gap-3 rounded-none">
                    <p className="font-sans font-bold text-base text-[#221a10] text-center">
                      {lang === "en"
                        ? "Tell us about today's work — we'll fill the form for you"
                        : "आज का काम बोलकर बताएं — हम फ़ॉर्म भर देंगे"}
                    </p>
                    <VoiceInputButton
                      language={lang}
                      fields={{
                        trade_category: "one of exactly: tailor, dairy, retail, vegetable_vendor, electronics_repair — closest match to the person's work (tailor = sewing/boutique, dairy = milk/cattle, retail = grocery/kirana shop, vegetable_vendor = selling vegetables/fruit, electronics_repair = mobile/electronics repair or CSC centre); null if unclear",
                        unit_count: "how many units/items they sold or made today, as a plain number; null if not stated",
                        unit_rate: "the price per unit in rupees, as a plain number; null if not stated",
                      }}
                      onTranscript={(text) => setVoiceHeard(text)}
                      onResult={(values) => {
                        const VALID_TRADES = ["tailor", "dairy", "retail", "vegetable_vendor", "electronics_repair"];
                        // Trade change resets units/rate to that trade's defaults, so
                        // apply it FIRST — spoken numbers must be set after, or the
                        // reset would silently wipe out what the person just said.
                        if (VALID_TRADES.includes(values.trade_category)) handleTradeSelect(values.trade_category);
                        const count = Math.round(Number(values.unit_count));
                        const rate = Math.round(Number(values.unit_rate));
                        if (count > 0) setUnitCount(count);
                        if (rate > 0) setUnitRate(rate);
                      }}
                    />
                    {voiceHeard && (
                      <p className="text-sm text-[#514536] text-center max-w-md">
                        <span className="font-bold">{lang === "en" ? "We heard: " : "हमने सुना: "}</span>
                        &ldquo;{voiceHeard}&rdquo;
                        <br />
                        <span className="text-xs">
                          {lang === "en"
                            ? "Check the boxes below — you can change anything that's wrong."
                            : "नीचे के बॉक्स देखें — कुछ गलत हो तो बदल सकते हैं।"}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* 1. Trade Category Selector */}
                  <div className="flex flex-col gap-2">
                    <label className="font-sans text-xs uppercase text-[#221a10] font-bold flex items-center justify-between">
                      <span>{t.tradeLabel}</span>
                      <span className="text-[#845400] font-semibold">
                        चयनित: {currentTrade.title}
                      </span>
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.keys(t.trades).map((key) => {
                        const tr = t.trades[key];
                        const isSelected = tradeCategory === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => handleTradeSelect(key)}
                            className={`p-2.5 text-left border rounded-none font-sans text-xs transition-all flex items-center gap-2 ${isSelected
                              ? "bg-[#845400] text-white border-[#845400] font-bold shadow-xs"
                              : "bg-[#fff8f3] text-[#221a10] border-[#d6c4b1] hover:bg-[#fbebda]"
                              }`}
                          >
                            <span className="text-base">
                              {key === "tailor" ? "🧵" : key === "dairy" ? "🥛" : key === "retail" ? "🏪" : key === "vegetable_vendor" ? "🥦" : "📱"}
                            </span>
                            <span className="truncate">{tr.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Today's Physical Output Units Stepper */}
                  <div className="flex flex-col gap-2 pt-3 border-t border-[#d6c4b1]">
                    <div className="flex items-center justify-between">
                      <label className="font-sans text-xs uppercase text-[#221a10] font-bold">
                        {t.unitLabel}
                      </label>
                      <span className="font-sans text-xs text-[#486172] font-bold">
                        {currentTrade.unit}
                      </span>
                    </div>

                    <div className="flex items-stretch h-12 border-2 border-[#221a10] rounded-none overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setUnitCount(Math.max(0, unitCount - 1))}
                        className="w-16 bg-[#fbebda] text-[#221a10] hover:bg-[#f5e6d4] active:bg-[#d6c4b1] flex items-center justify-center font-bold text-xl select-none border-r border-[#d6c4b1] rounded-none"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        max="500"
                        value={unitCount}
                        onChange={(e) => setUnitCount(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full text-center font-mono text-2xl font-bold text-[#221a10] bg-[#ffffff] focus:outline-none rounded-none"
                      />
                      <button
                        type="button"
                        onClick={() => setUnitCount(unitCount + 1)}
                        className="w-16 bg-[#fbebda] text-[#221a10] hover:bg-[#f5e6d4] active:bg-[#d6c4b1] flex items-center justify-center font-bold text-xl select-none border-l border-[#d6c4b1] rounded-none"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-sans text-[11px] text-[#514536]">
                      {t.unitDesc}
                    </span>
                  </div>

                  {/* 3. Average Rate Per Unit */}
                  <div className="flex flex-col gap-2 pt-3 border-t border-[#d6c4b1]">
                    <label className="font-sans text-xs uppercase text-[#221a10] font-bold">
                      {t.rateLabel}
                    </label>
                    <div className="flex items-center border-2 border-[#837564] bg-[#ffffff] h-11 rounded-none overflow-hidden">
                      <div className="h-full px-4 bg-[#fbebda] border-r border-[#d6c4b1] flex items-center justify-center font-mono font-bold text-[#221a10]">
                        ₹
                      </div>
                      <input
                        type="number"
                        min="1"
                        value={unitRate}
                        onChange={(e) => setUnitRate(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full px-3 font-mono text-base font-bold text-[#221a10] bg-transparent focus:outline-none rounded-none"
                      />
                      <div className="px-3 text-xs text-[#514536] font-sans whitespace-nowrap">
                        {t.ratePerUnit}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right: Live Calculation Formula Card & Actions (5 Cols) */}
                <div className="lg:col-span-5 bg-[#fff8f3] border border-[#d6c4b1] p-5 rounded-none flex flex-col justify-between gap-4">
                  <div>
                    <span className="font-sans text-xs uppercase font-bold text-[#514536] block mb-2">
                      💡 पूर्व-गणना झलक (Live Calculation Formula)
                    </span>
                    <div className="p-3 bg-[#ffffff] border border-[#d6c4b1] rounded-none">
                      <p className="font-mono text-sm font-bold text-[#221a10]">
                        {unitCount} {currentTrade.unit} × ₹{unitRate.toLocaleString("en-IN")} ={" "}
                        <span className="text-[#845400]">₹{grossInflow.toLocaleString("en-IN")}</span>
                      </p>
                      <p className="text-[11px] text-[#514536] font-sans mt-1">
                        दैनिक बैंक गुल्लक हिस्सा: <strong>₹{DAILY_EMI_FIXED}</strong> (₹4,800 / 30 दिन)
                      </p>
                    </div>

                    <div className="mt-4 p-3 bg-[#fbebda] border border-[#d6c4b1] rounded-none flex items-center justify-between text-xs font-sans">
                      <span className="text-[#514536]">अनुमानित घर खर्च बचत:</span>
                      <span className={`font-mono font-bold text-sm ${netSurplus >= 0 ? "text-[#4d6537]" : "text-[#ba1a1a]"}`}>
                        {netSurplus >= 0 ? `₹${netSurplus.toLocaleString("en-IN")}` : `-₹${deficitAmount.toLocaleString("en-IN")}`}
                      </span>
                    </div>
                  </div>

                  {/* Primary Calculate Button (Square) */}
                  <div className="flex flex-col gap-2 pt-4 border-t border-[#d6c4b1]">
                    <button
                      type="submit"
                      disabled={isCalculating}
                      className="w-full py-3 px-4 bg-[#845400] hover:bg-[#6b4400] text-white font-sans text-sm font-bold uppercase tracking-wider rounded-none shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 border border-[#221a10]"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {isCalculating ? "autorenew" : "calculate"}
                      </span>
                      <span>{isCalculating ? t.calculatingBtn : t.calculateBtn}</span>
                    </button>

                    {/* Deficit Simulation Trigger */}
                    <button
                      type="button"
                      onClick={handleSimulateDeficit}
                      className="text-center font-sans text-[11px] text-[#845400] hover:underline font-semibold rounded-none"
                    >
                      {t.zeroTestBtn}
                    </button>
                  </div>
                </div>

              </form>
            </section>


            {/* ========================================================================= */}
            {/* PHASE 2: OUTPUTS REVEALED ON DEMAND (Ledger Cards, Roadmap, Sakhi, Locker)*/}
            {/* ========================================================================= */}
            {hasCalculated && (
              <div ref={resultsRef} className="flex flex-col gap-8 animate-in fade-in duration-300">

                {/* 1. Dynamic Audio Voice Summary Player */}
                <section className="w-full bg-[#fff1e3] border border-[#845400]/40 rounded-none shadow-xs p-4 sm:p-5 relative overflow-hidden">
                  <VoiceSummaryPlayer
                    text={getAudioScript()}
                    autoPlayToken={speakToken}
                    language={lang}
                    title={t.audioHeading}
                  />
                  <div className="mt-2 pt-2 border-t border-[#d6c4b1]/60 flex flex-wrap items-center justify-between text-xs text-[#514536]">
                    <div className="flex items-center gap-1.5">
                      <strong className="text-[#486172]">{t.spokenPreviewLabel}</strong>
                      <span>"{getAudioScript()}"</span>
                    </div>
                    <span className="text-[11px] text-[#4d6537] font-semibold mt-1 sm:mt-0">
                      {t.audioDialect}
                    </span>
                  </div>
                </section>

                {/* 2. Tri-Card Horizontal Ledger & Repayment Health Banner */}
                <section className="bg-[#ffffff] border-2 border-[#837564] p-5 sm:p-7 rounded-none shadow-md flex flex-col gap-6">

                  {/* Tri-Card Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                    {/* Card A: Gross Inflow */}
                    <div className="bg-[#fff8f3] p-4 border border-[#d6c4b1] rounded-none flex flex-col justify-between">
                      <div className="flex items-center justify-between pb-1.5 border-b border-[#d6c4b1]">
                        <span className="font-sans text-[11px] uppercase font-bold text-[#514536]">{t.cardATitle}</span>
                        <span className="material-symbols-outlined text-[18px] text-[#486172]">trending_up</span>
                      </div>
                      <div className="py-3">
                        <span className="font-sans text-xs uppercase text-[#514536] block">{t.cardALabel}</span>
                        <div className="font-serif text-3xl font-bold font-mono text-[#221a10] mt-1">
                          ₹{grossInflow.toLocaleString("en-IN")}
                        </div>
                      </div>
                      <div className="pt-2 border-t border-[#d6c4b1] font-sans text-xs text-[#486172] font-semibold truncate">
                        {unitCount} {currentTrade.unit}
                      </div>
                    </div>

                    {/* Card B: Locked Bank Repayment Jar */}
                    <div className="bg-[#f5e6d4] p-4 border-2 border-[#845400] rounded-none flex flex-col justify-between relative overflow-hidden shadow-xs">
                      <div className="flex items-center justify-between pb-1.5 border-b border-[#845400]/30">
                        <span className="font-sans text-[11px] uppercase font-bold text-[#845400]">{t.cardBTitle}</span>
                        <span className="px-1.5 py-0.5 bg-[#845400] text-white font-mono text-[10px] uppercase font-bold rounded-none">
                          {t.cardBLocked} 🔒
                        </span>
                      </div>
                      <div className="py-3 z-10">
                        <span className="font-sans text-xs uppercase text-[#514536] block">{t.cardBLabel}</span>
                        <div className="font-serif text-3xl font-bold font-mono text-[#845400] mt-1">
                          ₹{DAILY_EMI_FIXED.toLocaleString("en-IN")}
                        </div>
                      </div>
                      <div className="pt-2 border-t border-[#845400]/30 z-10 font-sans text-xs text-[#514536]">
                        {t.cardBSub}
                      </div>
                    </div>

                    {/* Card C: Household Net Surplus / Deficit */}
                    <div className={`p-4 border rounded-none flex flex-col justify-between ${isHealthy
                      ? "bg-[#fff8f3] border-[#4d6537]/60"
                      : "bg-[#ffdad6]/40 border-[#ba1a1a]"
                      }`}>
                      <div className="flex items-center justify-between pb-1.5 border-b border-[#d6c4b1]">
                        <span className="font-sans text-[11px] uppercase font-bold text-[#514536]">{t.cardCTitle}</span>
                        <span className={`material-symbols-outlined text-[18px] ${isHealthy ? "text-[#4d6537]" : "text-[#ba1a1a]"}`}>
                          account_balance_wallet
                        </span>
                      </div>
                      <div className="py-3">
                        <span className="font-sans text-xs uppercase text-[#514536] block">{t.cardCLabel}</span>
                        <div className={`font-serif text-3xl font-bold font-mono mt-1 ${isHealthy ? "text-[#4d6537]" : "text-[#ba1a1a]"}`}>
                          {isHealthy ? `₹${netSurplus.toLocaleString("en-IN")}` : `-₹${deficitAmount.toLocaleString("en-IN")}`}
                        </div>
                      </div>
                      <div className={`pt-2 border-t border-[#d6c4b1] font-sans text-xs font-bold ${isHealthy ? "text-[#4d6537]" : "text-[#ba1a1a]"}`}>
                        {isHealthy ? t.cardCSurplusCaption : t.cardCDeficitCaption}
                      </div>
                    </div>

                  </div>

                  {/* Prominent Repayment Health Callout Banner */}
                  <div className={`p-4 sm:p-5 border-2 rounded-none flex items-start gap-4 transition-colors ${isHealthy
                    ? "border-[#4d6537] bg-[#cfecb1]/30"
                    : "border-[#ba1a1a] bg-[#ffdad6]/50"
                    }`}>
                    <span className={`material-symbols-outlined text-[32px] flex-shrink-0 ${isHealthy ? "text-[#4d6537]" : "text-[#ba1a1a]"
                      }`}>
                      {isHealthy ? "task_alt" : "warning"}
                    </span>
                    <div className="flex flex-col">
                      <h4 className={`font-serif text-base sm:text-lg font-bold ${isHealthy ? "text-[#4d6537]" : "text-[#ba1a1a]"
                        }`}>
                        {isHealthy ? t.healthGoodTitle : t.healthAlertTitle}
                      </h4>
                      <p className="font-sans text-xs sm:text-sm text-[#221a10] mt-1 leading-relaxed">
                        {isHealthy
                          ? t.healthGoodDesc.replace("{gross}", grossInflow.toLocaleString("en-IN")).replace("{emi}", DAILY_EMI_FIXED).replace("{net}", netSurplus.toLocaleString("en-IN"))
                          : t.healthAlertDesc.replace("{gross}", grossInflow.toLocaleString("en-IN")).replace("{emi}", DAILY_EMI_FIXED).replace("{deficit}", deficitAmount.toLocaleString("en-IN"))
                        }
                      </p>
                    </div>
                  </div>

                  {/* Summary Bar */}
                  <div className="bg-[#fff8f3] border border-[#d6c4b1] p-3 rounded-none flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 font-sans text-[#514536] uppercase font-semibold">
                      <span className="material-symbols-outlined text-[16px] text-[#486172]">lock</span>
                      <span>{t.sweepSupported}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[#221a10]">{t.monthlyProgressLabel} <strong>₹3,680 / ₹4,800</strong></span>
                      <div className="w-20 bg-[#f5e6d4] h-2 rounded-none overflow-hidden border border-[#d6c4b1]">
                        <div className="bg-[#845400] h-full" style={{ width: "76%" }}></div>
                      </div>
                    </div>
                  </div>

                </section>

                {/* 3. Upper Grid: Active Loan Registry & Bank Sakhi Coordinator */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                  {/* Left: Active Loan Account Registry Card (7 Cols) */}
                  <div className="lg:col-span-7 bg-[#fff8f3] border-2 border-[#d6c4b1] p-5 sm:p-6 rounded-none flex flex-col justify-between relative shadow-sm">
                    <div className="absolute top-3 right-3 border-2 border-[#4d6537] text-[#4d6537] px-2 py-0.5 font-mono text-[10px] uppercase font-bold tracking-wider rounded-none select-none">
                      {t.regularAccountBadge}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 pb-3 border-b border-[#d6c4b1]">
                        <span className="material-symbols-outlined text-[#845400] text-[24px]">account_balance</span>
                        <div>
                          <h3 className="font-serif text-base sm:text-lg text-[#221a10] font-bold">
                            {t.activeLoanTitle}
                          </h3>
                          <span className="font-sans text-xs text-[#514536]">{t.activeLoanSub}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-3 py-4 border-b border-[#d6c4b1] text-xs">
                        <div>
                          <span className="font-sans text-[10px] uppercase text-[#514536] block">{t.sanctionedLabel}</span>
                          <span className="font-serif text-lg font-bold text-[#845400] font-mono">{t.sanctionedVal}</span>
                          <span className="text-[11px] text-[#514536] block">{t.tradeVal}</span>
                        </div>
                        <div>
                          <span className="font-sans text-[10px] uppercase text-[#514536] block">{t.disbursedLabel}</span>
                          <span className="font-mono text-sm font-bold text-[#221a10]">{t.disbursedVal}</span>
                          <span className="text-[10px] text-[#4d6537] font-bold block">{t.disbursedTag}</span>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <span className="font-sans text-[10px] uppercase text-[#514536] block">{t.bankBranchLabel}</span>
                          <span className="font-sans text-xs font-bold text-[#221a10] block">{t.bankBranchVal}</span>
                          <span className="text-[11px] text-[#514536]">{t.bankBranchSub}</span>
                        </div>
                        <div>
                          <span className="font-sans text-[10px] uppercase text-[#514536] block">{t.nextEmiLabel}</span>
                          <span className="font-serif text-lg font-bold text-[#845400] font-mono">{t.nextEmiVal}</span>
                          <span className="text-[10px] text-[#ba1a1a] font-bold block">{t.nextEmiDue}</span>
                        </div>
                        <div>
                          <span className="font-sans text-[10px] uppercase text-[#514536] block">{t.loanAcLabel}</span>
                          <span className="font-mono text-xs font-bold text-[#221a10] block">{t.loanAcVal}</span>
                          <span className="text-[10px] text-[#514536]">{t.ifscVal}</span>
                        </div>
                        <div>
                          <span className="font-sans text-[10px] uppercase text-[#514536] block">{t.udyamLabel}</span>
                          <span className="font-mono text-xs font-bold text-[#486172] block">{t.udyamVal}</span>
                          <span className="text-[10px] text-[#4d6537]">{t.udyamTag}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 flex items-center justify-between text-xs font-sans">
                      <div className="flex items-center gap-1.5 text-[#4d6537] font-bold">
                        <span className="material-symbols-outlined text-[16px]">verified</span>
                        <span>{t.cibilStatus}</span>
                      </div>
                      <span className="font-mono text-[10px] text-[#514536]">{t.contractCode}</span>
                    </div>
                  </div>

                  {/* Right: Assigned Bank Sakhi Card (5 Cols) */}
                  <div className="lg:col-span-5 bg-[#fbebda] border border-[#d6c4b1] p-5 sm:p-6 rounded-none flex flex-col justify-between shadow-xs">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-[#d6c4b1]">
                        <span className="font-sans text-xs uppercase font-bold text-[#514536]">
                          असाइन बैंक सखी (Bank Sakhi):
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#4d6537] font-bold">
                          <span className="w-2 h-2 rounded-none bg-[#4d6537]"></span>
                          Online
                        </span>
                      </div>

                      <div className="flex items-start gap-4 py-4">
                        <div className="w-14 h-14 rounded-none border border-[#d6c4b1] bg-[#fff8f3] flex items-center justify-center text-3xl shadow-xs flex-shrink-0">
                          👩‍💼
                        </div>
                        <div className="flex flex-col">
                          <h3 className="font-serif text-lg font-bold text-[#221a10]">{t.sakhiTitle}</h3>
                          <span className="font-sans text-xs text-[#486172] font-semibold">{t.sakhiRole}</span>
                          <p className="font-sans text-[11px] text-[#514536] mt-1 leading-snug">
                            {t.sakhiArea}
                          </p>
                          <div className="mt-1 flex items-center gap-1 text-[11px] text-[#4d6537] font-semibold">
                            <span className="material-symbols-outlined text-[14px]">call_received</span>
                            <span>{t.sakhiHours}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#d6c4b1] flex flex-col gap-1.5">
                      <a
                        href="tel:0788262104"
                        className="w-full bg-[#486172] hover:bg-[#384c59] text-white py-2.5 px-4 rounded-none font-sans text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-xs transition-colors border border-[#221a10]"
                      >
                        <span className="material-symbols-outlined text-[16px]">phone_in_talk</span>
                        <span>{t.callSakhiBtn}</span>
                      </a>
                      <span className="text-center font-sans text-[10px] text-[#514536]">
                        {t.callSakhiSub}
                      </span>
                    </div>
                  </div>

                </section>

                {/* 4. 5-Stage Milestone Progression Tracker */}
                <section className="w-full bg-[#ffffff] p-5 sm:p-7 border border-[#d6c4b1] rounded-none shadow-xs">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 pb-4 border-b border-[#d6c4b1]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-sans text-xs uppercase text-[#486172] font-bold">शासकीय वित्तीय प्रगति चक्र</span>
                        <span className="px-2 py-0.5 bg-[#f5e6d4] font-sans text-[10px] uppercase font-bold text-[#221a10] border border-[#d6c4b1] rounded-none">
                          {t.roadmapBadge}
                        </span>
                      </div>
                      <h2 className="font-serif text-xl sm:text-2xl text-[#221a10] font-bold mt-1">
                        {t.roadmapTitle}
                      </h2>
                    </div>
                    <span className="font-sans text-xs text-[#514536] font-bold">
                      {t.roadmapRate}
                    </span>
                  </div>

                  {/* 5 Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-5">

                    {/* STAGE 1: COMPLETED */}
                    <div className="flex flex-col justify-between bg-[#fff8f3] border-t-4 border-t-[#4d6537] border-x border-b border-[#d6c4b1] p-3.5 rounded-none">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="font-sans text-xs uppercase font-bold text-[#4d6537]">चरण 1</span>
                          <span className="material-symbols-outlined text-[18px] text-[#4d6537]">check_circle</span>
                        </div>
                        <h4 className="font-serif text-sm font-bold text-[#221a10] leading-tight">{t.stage1Title}</h4>
                        <p className="font-sans text-[11px] text-[#514536]">{t.stage1Desc}</p>
                      </div>
                      <div className="pt-3 mt-2 border-t border-[#d6c4b1]">
                        <span className="font-mono text-xs text-[#4d6537] font-bold block">{t.stage1Date}</span>
                        <span className="font-sans text-[10px] text-[#514536]">{t.stage1Sub}</span>
                      </div>
                    </div>

                    {/* STAGE 2: ACTIVE (Machinery & Geo Photo) */}
                    <div className="flex flex-col justify-between bg-[#f5e6d4] border-2 border-[#845400] p-3.5 rounded-none shadow-xs relative">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="font-sans text-xs uppercase font-bold text-[#845400]">चरण 2</span>
                          <span className="material-symbols-outlined text-[18px] text-[#845400]">photo_camera</span>
                        </div>
                        <h4 className="font-serif text-sm font-bold text-[#221a10] leading-tight">{t.stage2Title}</h4>
                        <p className="font-sans text-[11px] text-[#221a10]">{t.stage2Desc}</p>
                      </div>
                      <div className="pt-3 mt-2 border-t border-[#845400]/30 flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setInvoiceUploaded(true);
                            alert("Invoice and geo-tagged photo uploaded! Bank Sakhi notified.");
                          }}
                          className={`w-full font-sans text-xs font-bold py-1.5 px-2 rounded-none flex items-center justify-center gap-1 transition-colors border border-[#221a10] ${invoiceUploaded
                            ? "bg-[#4d6537] text-white"
                            : "bg-[#845400] text-white hover:bg-[#6b4400]"
                            }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {invoiceUploaded ? "check" : "upload_file"}
                          </span>
                          <span>{invoiceUploaded ? t.stage2Verified : t.stage2Btn}</span>
                        </button>
                        <span className="font-sans text-[9px] text-center text-[#514536]">
                          {invoiceUploaded ? "सत्यापित" : t.stage2Sub}
                        </span>
                      </div>
                    </div>

                    {/* STAGE 3: ACTIONABLE CLAIM (DIC Subvention) */}
                    <div className="flex flex-col justify-between bg-[#fff8f3] border-t-4 border-t-[#486172] border-x border-b border-[#d6c4b1] p-3.5 rounded-none">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="font-sans text-xs uppercase font-bold text-[#486172]">चरण 3</span>
                          <span className="material-symbols-outlined text-[18px] text-[#486172]">request_quote</span>
                        </div>
                        <h4 className="font-serif text-sm font-bold text-[#221a10] leading-tight">{t.stage3Title}</h4>
                        <p className="font-sans text-[11px] text-[#514536]">{t.stage3Desc}</p>
                      </div>
                      <div className="pt-3 mt-2 border-t border-[#d6c4b1]">
                        <button
                          type="button"
                          onClick={() => {
                            setSubsidyClaimed(true);
                            alert("3% Interest Subvention Claim lodged with DIC!");
                          }}
                          className={`w-full font-sans text-xs font-bold py-1.5 px-2 rounded-none transition-colors border ${subsidyClaimed
                            ? "bg-[#4d6537] text-white border-[#4d6537]"
                            : "bg-[#ffffff] border-[#486172] text-[#486172] hover:bg-[#486172] hover:text-white"
                            }`}
                        >
                          {subsidyClaimed ? t.stage3Claimed : t.stage3Btn}
                        </button>
                        <span className="font-sans text-[10px] text-center block mt-1 text-[#514536]">
                          {t.stage3Annual}
                        </span>
                      </div>
                    </div>

                    {/* STAGE 4: IN PROGRESS / TRACK RECORD */}
                    <div className="flex flex-col justify-between bg-[#fff8f3] border-t-4 border-t-[#837564] border-x border-b border-[#d6c4b1] p-3.5 rounded-none opacity-85">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="font-sans text-xs uppercase font-bold text-[#514536]">चरण 4</span>
                          <span className="material-symbols-outlined text-[18px] text-[#837564]">history_edu</span>
                        </div>
                        <h4 className="font-serif text-sm font-bold text-[#221a10] leading-tight">{t.stage4Title}</h4>
                        <p className="font-sans text-[11px] text-[#514536]">{t.stage4Desc}</p>
                      </div>
                      <div className="pt-3 mt-2 border-t border-[#d6c4b1]">
                        <div className="flex items-center justify-between font-sans text-[10px] text-[#514536]">
                          <span>{t.stage4Progress}</span>
                        </div>
                        <div className="w-full bg-[#d6c4b1] h-1.5 mt-1 rounded-none overflow-hidden">
                          <div className="bg-[#486172] h-full" style={{ width: "16%" }}></div>
                        </div>
                      </div>
                    </div>

                    {/* STAGE 5: FUTURE UPGRADE TARGET */}
                    <div className="flex flex-col justify-between bg-[#fff8f3] border-t-4 border-t-[#d6c4b1] border-x border-b border-[#d6c4b1] p-3.5 rounded-none opacity-75">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="font-sans text-xs uppercase font-bold text-[#837564]">चरण 5</span>
                          <span className="material-symbols-outlined text-[18px] text-[#837564]">military_tech</span>
                        </div>
                        <h4 className="font-serif text-sm font-bold text-[#514536] leading-tight">{t.stage5Title}</h4>
                        <p className="font-sans text-[11px] text-[#514536]">{t.stage5Desc}</p>
                      </div>
                      <div className="pt-3 mt-2 border-t border-[#d6c4b1]">
                        <span className="font-sans text-[10px] text-[#837564] font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">lock</span>
                          <span>{t.stage5Lock}</span>
                        </span>
                      </div>
                    </div>

                  </div>
                </section>

                {/* 5. Statutory Compliance & Insurance Locker */}
                <section className="w-full bg-[#fff8f3] border border-[#837564] p-5 sm:p-6 rounded-none">
                  <div className="flex items-center justify-between pb-3 border-b border-[#d6c4b1]">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#4d6537] text-[24px]">verified_user</span>
                      <div>
                        <h3 className="font-serif text-base sm:text-lg text-[#221a10] font-bold">
                          {t.complianceTitle}
                        </h3>
                        <span className="font-sans text-xs text-[#514536]">{t.complianceSub}</span>
                      </div>
                    </div>
                    <span className="font-sans text-xs text-[#4d6537] font-bold bg-[#cfecb1] px-2.5 py-1 border border-[#4d6537] rounded-none">
                      {t.complianceCount}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">

                    {/* Doc 1 */}
                    <div className="bg-[#ffffff] p-4 border border-[#d6c4b1] rounded-none flex flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-sans text-[10px] uppercase text-[#486172] font-bold block">{t.doc1Org}</span>
                          <h4 className="font-serif text-sm font-bold text-[#221a10] mt-0.5">{t.doc1Title}</h4>
                          <span className="font-mono text-xs font-bold text-[#221a10] mt-1 block">UDYAM-CG-04-001928</span>
                        </div>
                        <span className="material-symbols-outlined text-[#4d6537] text-[20px]">verified</span>
                      </div>
                      <div className="pt-3 mt-3 border-t border-[#d6c4b1] flex items-center justify-between text-xs">
                        <span className="text-[#4d6537] font-semibold">{t.doc1Valid}</span>
                        <button type="button" onClick={() => alert("Opening Udyam Certificate...")} className="text-[#845400] font-bold hover:underline rounded-none">
                          {t.viewDoc}
                        </button>
                      </div>
                    </div>

                    {/* Doc 2 */}
                    <div className="bg-[#ffffff] p-4 border border-[#d6c4b1] rounded-none flex flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-sans text-[10px] uppercase text-[#486172] font-bold block">{t.doc2Org}</span>
                          <h4 className="font-serif text-sm font-bold text-[#221a10] mt-0.5">{t.doc2Title}</h4>
                          <span className="font-mono text-xs font-bold text-[#221a10] mt-1 block">POL-SBI-MUDRA-98114</span>
                        </div>
                        <span className="material-symbols-outlined text-[#4d6537] text-[20px]">policy</span>
                      </div>
                      <div className="pt-3 mt-3 border-t border-[#d6c4b1] flex items-center justify-between text-xs">
                        <span className="text-[#4d6537] font-semibold">{t.doc2Valid}</span>
                        <button type="button" onClick={() => alert("Opening Policy Copy...")} className="text-[#845400] font-bold hover:underline rounded-none">
                          {t.viewDoc}
                        </button>
                      </div>
                    </div>

                    {/* Doc 3 */}
                    <div className="bg-[#ffffff] p-4 border border-[#d6c4b1] rounded-none flex flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-sans text-[10px] uppercase text-[#486172] font-bold block">{t.doc3Org}</span>
                          <h4 className="font-serif text-sm font-bold text-[#221a10] mt-0.5">{t.doc3Title}</h4>
                          <span className="font-mono text-xs font-bold text-[#221a10] mt-1 block">GP-SLD-NOC-2026/89</span>
                        </div>
                        <span className="material-symbols-outlined text-[#4d6537] text-[20px]">approval_delegation</span>
                      </div>
                      <div className="pt-3 mt-3 border-t border-[#d6c4b1] flex items-center justify-between text-xs">
                        <span className="text-[#4d6537] font-semibold">{t.doc3Valid}</span>
                        <button type="button" onClick={() => alert("Opening Gram Panchayat NOC...")} className="text-[#845400] font-bold hover:underline rounded-none">
                          {t.viewDoc}
                        </button>
                      </div>
                    </div>

                  </div>
                </section>

                {/* 6. Execution Control Action Bar */}
                <div className="w-full bg-[#f5e6d4] border-2 border-[#221a10] p-4 sm:p-5 rounded-none flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="w-full sm:w-auto bg-[#845400] hover:bg-[#6b4400] text-white px-4 py-2.5 font-sans text-xs font-bold uppercase rounded-none border border-[#221a10] flex items-center justify-center gap-2 shadow-xs transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">print</span>
                      <span>{t.printSlipBtn}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => alert("Generating Ledger Statement...")}
                      className="w-full sm:w-auto bg-[#ffffff] text-[#221a10] hover:bg-[#fbebda] px-4 py-2.5 font-sans text-xs font-bold uppercase rounded-none border border-[#d6c4b1] flex items-center justify-center gap-2 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">bar_chart</span>
                      <span>{t.statementBtn}</span>
                    </button>
                  </div>
                  <a
                    href="/scheme-matcher"
                    className="font-sans text-xs uppercase text-[#845400] font-bold hover:underline rounded-none"
                  >
                    {t.backBtn}
                  </a>
                </div>

              </div>
            )}

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#fbebda] border-t border-[#d6c4b1] py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="material-symbols-outlined text-[#845400] text-[20px]">verified</span>
              <span className="font-serif text-sm font-semibold text-[#221a10]">{t.footerTitle}</span>
            </div>
            <p className="font-sans text-xs text-[#514536] max-w-xl">{t.footerDesc}</p>
          </div>
          <div className="flex items-center gap-6 font-sans text-xs uppercase text-[#514536]">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#4d6537] text-[18px]">lock</span>
              <span>Suraksha Code: CSC-VERIFIED</span>
            </div>
            <span>© 2026 Sahay-AI Ledger</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
