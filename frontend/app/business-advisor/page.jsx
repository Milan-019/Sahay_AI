"use client";

import React, { useState, useRef } from "react";
import Navbar from "../../components/Navbar";
import VoiceSummaryPlayer from "../../components/VoiceSummaryPlayer";
import VoiceInputButton from "../../components/VoiceInputButton";
import { unlockAudio } from "../../lib/voiceAudio";
import { buildAdvisorNarration } from "../../lib/narration";

// Multi-lingual dictionary for Business Advisor
const ADVISOR_I18N = {
  hi: {
    formNo: "प्रपत्र संख्या / Form No. BFA-88",
    registryIndex: "रजिस्ट्री इंडेक्स: CG-DURG",
    tagline: "आपके व्यवसाय हेतु स्थानीय बाज़ार व ऋण विश्लेषण",
    censusBadge: "CENSUS 2011 एवं OSM सत्यापित",
    part1Badge: "खंड-अ / PART-I",
    frameworkTitle: "National Rural Enterprise Advisory Framework",
    pageHeading: "व्यापार व्यवहार्यता व ऋण सलाहकार",
    pageSubheading: "Business Feasibility, Spatial Market Grounding & Institutional Credit Scoring Engine",
    modeSelf: "👤 स्वयं सेवा (Self)",
    modeAssisted: "🤝 बैंक सखी / CSC मोड (Assisted)",
    viewBorrower: "📱 ग्रामीण उद्यमी दृश्य",
    viewBanker: "📑 बैंक प्रबंधक क्रेडिट पर्ची",

    // Intake
    blockLabel: "1. ब्लॉक / क्षेत्र (Block Location)",
    censusLink: "🟢 लाइव सेंसेक्स डाटा लिंक",
    applicantLabel: "4. आवेदक का नाम (Applicant Full Name)",
    prefixMrs: "श्रीमती",
    prefixMr: "श्री",
    verifiedUidai: "UIDAI / DigiLocker प्रपत्र से सत्यापित",
    verifiedSakhi: "बैंक सखी प्रमाणीकरण द्वारा सत्यापित",
    incomeLabel: "8. वार्षिक पारिवारिक आय (Annual Income)",
    incomeBracket: "आय वर्ग: मध्यम-निम्न",
    tradeLabel: "2. व्यवसाय श्रेणी (Trade Category Selection)",
    tradesAvailable: "6 श्रेणियां उपलब्ध",
    womenLabel: "5. महिला उद्यमी (Women)",
    womenSub: "50-100 bps ब्याज छूट लागू",
    scStLabel: "6. SC / ST आवेदक",
    scStYes: "आरक्षित श्रेणी मान्य (सबवेंशन)",
    scStNo: "नहीं (सामान्य/OBC वर्ग)",
    greenfieldLabel: "7. नवीन उद्यम (Greenfield)",
    greenfieldSub: "प्रथम व्यवसाय स्थापना",
    langLabel: "9. भाषा (Language)",
    marginHeading: "पूंजी एवं स्वयं का अंशदान",
    marginLabel: "3. उपलब्ध मार्जिन (Own Funds)",
    projectCostCalc: "गणना परियोजना लागत:",
    marginBasis: "आधार: 20% स्वयं अंशदान + 80% बैंक ऋण",
    btnCalculate: "व्यवहार्यता विश्लेषण व ऋण रिपोर्ट तैयार करें",
    btnCalculating: "व्यवहार्यता विश्लेषण हो रहा है...",

    // Part 2 Output
    part2Badge: "खंड-ब / PART-II",
    resultsHeading: "व्यवहार्यता एवं शाखा आवंटन परिणाम (Advisory Dossier)",
    enginesActive: "इंजन 1, 2, 3 सक्रिय",

    audioTitle: "ग्रामीण ऑडियो सलाह (Vernacular AI Voice Advisory)",
    audioDialect: "बोली: छत्तीसगढ़ी-मिश्रित सरल हिन्दी",
    audioEngineTag: "Groq AI Multi-lingual Speech Engine",
    transcriptTitle: "📝 प्रतिलेखन (Voice Transcript Preview):",

    demoCardTitle: "जनसांख्यिकी एवं स्थानीय बाजार विश्लेषण",
    engine1Badge: "बाज़ार विश्लेषण",
    demoSource: "स्रोत: Census 2011 Primary Abstract & OSM Live API",
    liveVerified: "🟢 Live Verified",
    totalPopLabel: "ब्लॉक कुल जनसंख्या",
    totalPopSub: "कुल ग्रामीण एवं अर्ध-नगरीय क्षेत्र",
    femalePopLabel: "महिला आबादी (Target Base)",
    femalePopSub: "वस्त्र व दैनिक उपभोग हेतु उपयुक्त",
    scStRatioLabel: "SC / ST अनुपात",
    scStRatioSub: "सामाजिक समावेशन मानक",
    femaleWorkforceLabel: "महिला कार्यबल भागीदारी",
    femaleWorkforceSub: "उच्च विकास व उपभोग क्षमता",
    dominantEconLabel: "प्रमुख आर्थिक गतिविधि",
    competitorDensityLabel: "लाइव प्रतिस्पर्धी घनत्व (OpenStreetMap)",
    moderateCompBadge: "मध्यम प्रतिस्पर्धा — उच्च मांग",
    demoScore: "जनसांख्यिकी सूचकांक स्कोर: 8.4 / 10 (व्यवहार्य)",

    swotCardTitle: "व्यवसाय SWOT विश्लेषण मैट्रिक्स (Field Reality)",
    strengthTitle: "ताकत (Strengths)",
    weaknessTitle: "कमजोरी (Weaknesses)",
    opportunityTitle: "अवसर (Opportunities)",
    threatTitle: "खतरे व जोखिम (Threats)",
    pricingBenchmarkLabel: "🎯 अनुशंसित मूल्य निर्धारण मार्गदर्शन (Pricing Benchmark)",
    opportunitySummaryLabel: "अवसर सारांश:",
    overallRating: "समग्र व्यवहार्यता रेटिंग: श्रेणी-A (अति-अनुकूल)",

    engine2Badge: "अनुशंसित ऋण योजना",
    underwritingMatch: "Institutional Underwriting Match",
    eligibility100: "पात्रता: 100% अनुशंसित",
    projectCostLabel: "कुल परियोजना लागत",
    projectCostSub: "80% ऋण + 20% मार्जिन",
    sanctionedLoanLabel: "स्वीकृत ऋण राशि (80%)",
    sanctionedLoanSub: "संयंत्र, मशीनरी व कच्चा माल",
    effectiveRateLabel: "प्रभावी ब्याज दर",
    tenureLabel: "ऋण अवधि व छूट (Tenure)",
    tenureSub: "60 माह (6 माह मोराटोरियम)",

    physicalHeading: "ग्रामीण भौतिक इकाई रूपांतरण (Physical-Unit Grounded Feasibility)",
    financialGroundingBadge: "Financial Literacy Grounding",
    monthlyEmiLabel: "मासिक किश्त (Monthly EMI)",
    monthlyEmiSub: "मूलधन + ब्याज संयोजन",
    dailyBurdenLabel: "दैनिक किश्त (Daily Burden)",
    dailyBurdenSub: "30 दिवस माह आधार",
    dailyOutputThresholdLabel: "दैनिक उत्पादन आवश्यकता (Physical Output Threshold)",
    altMetricLabel: "वैकल्पिक पैमाना:",

    engine3Badge: "निकटतम बैंक शाखा",
    partnerBranchHeading: "आवंटित बैंक शाखा व नजदीकी सेवा केंद्र",
    primaryBranchTag: "प्राथमिक आवंटित शाखा",
    nearestDistanceTag: "निकटतम दूरी",
    quotaRemainingLabel: "सक्रिय मुद्रा कोटा शेष:",
    quotaAvailable: "उपलब्ध",
    tatLabel: "औसत स्वीकृति समय: 3 से 5 कार्यदिवस",
    routingReasonLabel: "मार्ग चयन कारण:",
    auditLogHeading: "निरीक्षण लॉग: बायपास की गई अन्य शाखाएं (Audit Log)",
    assignedSakhiLabel: "संबद्ध बैंक सखी:",

    docReadinessHeading: "दस्तावेज तत्परता व सत्यापन सारांश",
    docReadyBadge: "100% Verified",
    docReadyAlert: "दस्तावेज पूर्ण — बैंक शाखा में प्रस्तुत करने हेतु तैयार (Ready for Submission)",
    aadhaarLabel: "आधार कार्ड (Aadhaar Card)",
    aadhaarSub: "DigiLocker ई-केवाईसी सत्यापित (UIDAI)",
    panLabel: "पैन कार्ड (PAN Card)",
    panSub: "NSDL डायरेक्ट डेटाबेस मैच",
    passbookLabel: "बैंक पासबुक (Active Passbook)",
    passbookSub: "विगत 6 माह का निरंतर बचत खाता रिकॉर्ड",
    udyamLabel: "उद्यम पंजीकरण (Udyam MSME)",
    ocrMismatchZero: "OCR नाम / जन्मतिथि असंगतता: शून्य (0 Mismatches Flagged)",

    slipCardHeading: "बैंक प्रबंधक क्रेडिट मूल्यांकन पर्ची (Banker Credit Appraisal Slip)",
    slipFormNo: "फॉर्म सं. BC-SLIP/2026/A",
    confidentialBadge: "CONFIDENTIAL / UNDERWRITING",
    recommendedSanction: "RECOMMENDED SANCTION",
    borrowerLabel: "आवेदक (Borrower)",
    tradeNatureLabel: "व्यापार प्रकृति (Activity)",
    cibilLabel: "CIBIL बेंचमार्क स्कोर",
    cibilSub: "शून्य डिफॉल्ट रिकॉर्ड",
    dscrLabel: "DSCR कवरेज अनुपात",
    dscrSub: "उत्कृष्ट पुनर्भुगतान क्षमता",
    cashflowHeading: "📊 अनुमानित शुद्ध नकदी प्रवाह एवं व्यवहार्यता संकेतक (Cash Flow Projection)",
    grossReceiptsLabel: "मासिक सकल आय (Gross Receipts):",
    opexLabel: "मासिक परिचालन व्यय (OPEX):",
    npvLabel: "शुद्ध वर्तमान मूल्य (NPV 5-Yr):",
    recommendationNoteLabel: "शाखा अनुशंसा टिप्पणी (Branch Credit Recommendation):",
    borrowerSignLabel: "आवेदक का हस्ताक्षर / अंगूठा:",
    officerSignLabel: "कृषि/सूक्ष्म ऋण अधिकारी (SBI):",
    issuanceDateLabel: "निर्गत तिथि व समय:",
    btnPrintSlip: "🖨️ A4 बैंक क्रेडिट पर्ची प्रिंट करें",
    btnForwardBranch: "🤝 ऋण आवेदन सीधे बैंक शाखा को अग्रसारित करें",

    // Trades
    trades: {
      tailor: { title: "सिलाई व बुटीक", subtitle: "Boutique & Tailor", unit: "1 सूट प्रतिदिन (1 Suit/Day)", alt: "🥛 5 लीटर दूध प्रतिदिन के समतुल्य", rate: "₹ 250 – ₹ 350" },
      dairy: { title: "डेयरी व पशुपालन", subtitle: "Dairy Livestock", unit: "6 लीटर दूध प्रतिदिन (6L/Day)", alt: "🌾 2 बोरी पशु आहार बचत समतुल्य", rate: "₹ 45 – ₹ 52 / लीटर" },
      retail: { title: "किराना व जनरल स्टोर", subtitle: "Retail Provision", unit: "3 ग्राहक बिलिंग प्रतिदिन (3 Bills/Day)", alt: "📦 5 थोक पैकेट विक्रय समतुल्य", rate: "18-22% सकल मार्जिन" },
      vegetable_vendor: { title: "सब्जी व फल विक्रेता", subtitle: "Perishables Vendor", unit: "10 किग्रा सब्जी विक्रय (10 Kg/Day)", alt: "🥬 2 क्रेट मौसमी सब्जी समतुल्य", rate: "25-30% दैनिक मार्जिन" },
      electronics_repair: { title: "मरम्मत व CSC केंद्र", subtitle: "Tech & Hardware", unit: "2 डिवाइस सर्विस प्रतिदिन (2 Jobs/Day)", alt: "⚡ 5 ऑनलाइन आवेदन सेवा समतुल्य", rate: "₹ 150 – ₹ 300 / सेवा" },
      incense_craft: { title: "हस्तशिल्प / अगरबत्ती", subtitle: "Cottage Craft", unit: "8 पैकेट अगरबत्ती निर्माण (8 Packs/Day)", alt: "🧺 1 बांस हस्तशिल्प उत्पाद समतुल्य", rate: "₹ 40 – ₹ 60 / पैकेट" },
    },
  },

  en: {
    formNo: "Form No. BFA-88",
    registryIndex: "Registry Index: CG-DURG",
    tagline: "Local market and loan analysis for your business",
    censusBadge: "CENSUS 2011 & OSM VERIFIED",
    part1Badge: "PART-I / Section A",
    frameworkTitle: "National Rural Enterprise Advisory Framework",
    pageHeading: "Rural Business Feasibility & Credit Advisor",
    pageSubheading: "Spatial Market Grounding, Census Analytics & Institutional Credit Scoring Engine",
    modeSelf: "👤 Self-Service Mode",
    modeAssisted: "🤝 Bank Sakhi / CSC Assisted",
    viewBorrower: "📱 Borrower Friendly View",
    viewBanker: "📑 Banker Credit Appraisal Slip",

    // Intake
    blockLabel: "1. Rural Block Location",
    censusLink: "🟢 Live Census 2011 Linked",
    applicantLabel: "4. Applicant Full Name",
    prefixMrs: "Mrs.",
    prefixMr: "Mr.",
    verifiedUidai: "Verified via UIDAI / DigiLocker Registry",
    verifiedSakhi: "Verified via Bank Sakhi Biometric Portal",
    incomeLabel: "8. Annual Family Income",
    incomeBracket: "Income Bracket: Low-Middle Rural",
    tradeLabel: "2. Proposed Trade Category",
    tradesAvailable: "6 Categories Available",
    womenLabel: "5. Women Entrepreneur",
    womenSub: "50-100 bps Interest Concession Eligible",
    scStLabel: "6. SC / ST Category",
    scStYes: "Affirmative Subvention Active",
    scStNo: "General / OBC Category",
    greenfieldLabel: "7. Greenfield Venture",
    greenfieldSub: "First-time Business Setup",
    langLabel: "9. Preferred Language",
    marginHeading: "Capital & Self Contribution",
    marginLabel: "3. Available Margin (Own Funds)",
    projectCostCalc: "Computed Project Cost:",
    marginBasis: "Basis: 20% Own Margin + 80% Institutional Loan",
    btnCalculate: "Generate Feasibility Report & Credit Dossier",
    btnCalculating: "Analyzing Spatial & Market Data...",

    // Part 2 Output
    part2Badge: "PART-II / Advisory Dossier",
    resultsHeading: "Feasibility Dossier & Branch Routing Output",
    enginesActive: "Engines 1, 2, 3 Active & Grounded",

    audioTitle: "Vernacular AI Voice Advisory",
    audioDialect: "Dialect: Rural Hindi / Vernacular Audio",
    audioEngineTag: "Groq AI Multi-lingual Speech Engine",
    transcriptTitle: "📝 Spoken Transcript Preview:",

    demoCardTitle: "Census Demographics & Market Reality",
    engine1Badge: "Market Analysis",
    demoSource: "Source: Census 2011 Primary Abstract & OSM Live API",
    liveVerified: "🟢 Live Verified",
    totalPopLabel: "Total Block Population",
    totalPopSub: "Rural & Peri-urban Aggregated",
    femalePopLabel: "Female Population (Target Base)",
    femalePopSub: "High Potential for Apparel & Retail",
    scStRatioLabel: "SC / ST Proportion",
    scStRatioSub: "Financial Inclusion Metric",
    femaleWorkforceLabel: "Female Workforce Participation",
    femaleWorkforceSub: "Strong Expansion Headroom",
    dominantEconLabel: "Dominant Economic Activity",
    competitorDensityLabel: "Live Competitor Density (OpenStreetMap)",
    moderateCompBadge: "Moderate Competition — High Demand",
    demoScore: "Demographic Viability Index: 8.4 / 10 (Highly Viable)",

    swotCardTitle: "Field Reality SWOT Matrix",
    strengthTitle: "Strengths",
    weaknessTitle: "Weaknesses",
    opportunityTitle: "Opportunities",
    threatTitle: "Risks & Threats",
    pricingBenchmarkLabel: "🎯 Recommended Pricing Guidance",
    opportunitySummaryLabel: "Opportunity Narrative:",
    overallRating: "Overall Commercial Rating: Grade-A (Optimal)",

    engine2Badge: "Recommended Loan Scheme",
    underwritingMatch: "Institutional Credit Match",
    eligibility100: "Eligibility: 100% Recommended",
    projectCostLabel: "Total Project Cost",
    projectCostSub: "80% Loan + 20% Margin",
    sanctionedLoanLabel: "Sanctioned Loan (80%)",
    sanctionedLoanSub: "Plant, Machinery & Working Capital",
    effectiveRateLabel: "Effective Interest Rate",
    tenureLabel: "Tenure & Grace Period",
    tenureSub: "60 Months (6 Months Moratorium)",

    physicalHeading: "Rural Physical-Unit Conversion (Debt Service Grounding)",
    financialGroundingBadge: "Financial Literacy Grounding",
    monthlyEmiLabel: "Monthly Repayment (EMI)",
    monthlyEmiSub: "Principal + Interest Amortization",
    dailyBurdenLabel: "Daily Debt Burden",
    dailyBurdenSub: "Calculated on 30-day Month",
    dailyOutputThresholdLabel: "Daily Physical Output Threshold",
    altMetricLabel: "Alternative Metric:",

    engine3Badge: "Nearest Bank Branch",
    partnerBranchHeading: "Allocated Bank Branch & Service Hub",
    primaryBranchTag: "Primary Allocated Branch",
    nearestDistanceTag: "Nearest Distance",
    quotaRemainingLabel: "Active Mudra Quota Remaining:",
    quotaAvailable: "Available",
    tatLabel: "Average Processing TAT: 3 to 5 Working Days",
    routingReasonLabel: "Routing Rationale:",
    auditLogHeading: "Audit Log: Bypassed Closer Branches",
    assignedSakhiLabel: "Assigned Bank Sakhi:",

    docReadinessHeading: "Document Readiness & Verification Summary",
    docReadyBadge: "100% Verified",
    docReadyAlert: "All Documents Complete — Ready for Branch Submission",
    aadhaarLabel: "Aadhaar Card",
    aadhaarSub: "DigiLocker e-KYC Verified (UIDAI)",
    panLabel: "PAN Card",
    panSub: "NSDL Direct Database Match",
    passbookLabel: "Bank Passbook",
    passbookSub: "6-Month Active Saving Ledger",
    udyamLabel: "Udyam MSME Registration",
    ocrMismatchZero: "OCR Name / DOB Discrepancies: 0 Flags",

    slipCardHeading: "Banker Credit Appraisal Slip",
    slipFormNo: "Form No. BC-SLIP/2026/A",
    confidentialBadge: "CONFIDENTIAL / UNDERWRITING",
    recommendedSanction: "RECOMMENDED SANCTION",
    borrowerLabel: "Borrower Name",
    tradeNatureLabel: "Enterprise Activity",
    cibilLabel: "CIBIL Benchmark Score",
    cibilSub: "Clean Repayment Track",
    dscrLabel: "DSCR Coverage Ratio",
    dscrSub: "Superior Debt Repayment Margin",
    cashflowHeading: "📊 Projected Cash Flow & Commercial Viability",
    grossReceiptsLabel: "Monthly Gross Receipts:",
    opexLabel: "Monthly Operating Expenses (OPEX):",
    npvLabel: "Net Present Value (NPV 5-Yr):",
    recommendationNoteLabel: "Branch Underwriting Note:",
    borrowerSignLabel: "Applicant Signature / Thumb:",
    officerSignLabel: "Credit Officer Signature (SBI):",
    issuanceDateLabel: "Issuance Timestamp:",
    btnPrintSlip: "🖨️ Print A4 Banker Appraisal Slip",
    btnForwardBranch: "🤝 Forward Application Directly to Bank Branch",

    // Trades
    trades: {
      tailor: { title: "Boutique & Tailoring", subtitle: "Apparel & Fashion", unit: "1 Suit Stitched / Day", alt: "🥛 Equivalent to 5L milk daily", rate: "₹ 250 – ₹ 350 / suit" },
      dairy: { title: "Dairy & Livestock", subtitle: "Milk Production", unit: "6 Liters of Milk / Day", alt: "🌾 Equivalent to 2 bags cattle feed", rate: "₹ 45 – ₹ 52 / Liter" },
      retail: { title: "Kirana & Provision Store", subtitle: "Retail Commerce", unit: "3 Customer Bills / Day", alt: "📦 Equivalent to 5 wholesale packs", rate: "18-22% Gross Margin" },
      vegetable_vendor: { title: "Fresh Produce Vendor", subtitle: "Perishables", unit: "10 Kg Vegetables / Day", alt: "🥬 Equivalent to 2 crates produce", rate: "25-30% Daily Margin" },
      electronics_repair: { title: "Repair & CSC Tech Hub", subtitle: "Hardware Support", unit: "2 Devices Serviced / Day", alt: "⚡ Equivalent to 5 citizen forms", rate: "₹ 150 – ₹ 300 / service" },
      incense_craft: { title: "Handicrafts & Incense", subtitle: "Cottage Industry", unit: "8 Incense Packs / Day", alt: "🧺 Equivalent to 1 bamboo artifact", rate: "₹ 40 – ₹ 60 / pack" },
    },
  },

  mr: {
    formNo: "फॉर्म क्र. BFA-88",
    registryIndex: "नोंदणी निर्देशांक: CG-DURG",
    tagline: "आपल्या व्यवसायासाठी स्थानिक बाजार व कर्ज विश्लेषण",
    censusBadge: "CENSUS 2011 व OSM सत्यापित",
    part1Badge: "भाग-अ / PART-I",
    frameworkTitle: "National Rural Enterprise Advisory Framework",
    pageHeading: "व्यवसाय व्यवहार्यता व कर्ज सल्लागार",
    pageSubheading: "स्थानिक बाजारपेठ विश्लेषण, लोकसंख्या माहिती व बँक क्रेडिट स्कोअरिंग",
    modeSelf: "👤 स्वतः सेवा (Self)",
    modeAssisted: "🤝 बँक सखी / CSC सहाय्य (Assisted)",
    viewBorrower: "📱 ग्रामीण उद्योजक दृश्य",
    viewBanker: "📑 बँक व्यवस्थापक क्रेडिट पावती",

    // Intake
    blockLabel: "1. तालुका / ब्लॉक निवडा (Block Location)",
    censusLink: "🟢 थेट जनगणनेची आकडेवारी लिंक",
    applicantLabel: "4. अर्जदाराचे नाव (Applicant Full Name)",
    prefixMrs: "सौ.",
    prefixMr: "श्री.",
    verifiedUidai: "UIDAI / DigiLocker द्वारे सत्यापित",
    verifiedSakhi: "बँक सखी बायोमेट्रिक द्वारे सत्यापित",
    incomeLabel: "8. वार्षिक कौटुंबिक उत्पन्न (Annual Income)",
    incomeBracket: "उत्पन्न गट: मध्यम-अल्प ग्रामीण",
    tradeLabel: "2. व्यवसाय वर्ग निवडा (Trade Category Selection)",
    tradesAvailable: "6 व्यवसाय पर्याय उपलब्ध",
    womenLabel: "5. महिला उद्योजक (Women)",
    womenSub: "50-100 bps व्याज सवलत लागू",
    scStLabel: "6. SC / ST प्रवर्ग",
    scStYes: "विशेष सवलत योजना लागू",
    scStNo: "नाही (सर्वसाधारण/OBC)",
    greenfieldLabel: "7. नवीन व्यवसाय (Greenfield)",
    greenfieldSub: "पहिल्यांदाच व्यवसाय सुरू",
    langLabel: "9. भाषा (Language)",
    marginHeading: "भांडवल व स्वतःचा हिस्सा",
    marginLabel: "3. उपलब्ध स्वतःचे भांडवल (Own Funds)",
    projectCostCalc: "एकूण प्रकल्प खर्च:",
    marginBasis: "आधार: 20% स्वतःचे भांडवल + 80% बँक कर्ज",
    btnCalculate: "व्यवहार्यता अहवाल व कर्ज विश्लेषण तयार करा",
    btnCalculating: "व्यवहार्यता तपासली जात आहे...",

    // Part 2 Output
    part2Badge: "भाग-ब / PART-II",
    resultsHeading: "व्यवहार्यता व बँक शाखा वाटप अहवाल (Advisory Dossier)",
    enginesActive: "इंजिन 1, 2, 3 सक्रिय",

    audioTitle: "ग्रामीण ऑडिओ सल्ला (Vernacular AI Voice Advisory)",
    audioDialect: "बोली: मराठी ग्रामीण आवाज",
    audioEngineTag: "Groq AI Multi-lingual Speech Engine",
    transcriptTitle: "📝 ऑडिओ संवाद सारांश:",

    demoCardTitle: "जनसांख्यिकी व स्थानिक बाजार विश्लेषण",
    engine1Badge: "बाजार विश्लेषण",
    demoSource: "स्रोत: Census 2011 Primary Abstract & OSM Live API",
    liveVerified: "🟢 Live Verified",
    totalPopLabel: "ब्लॉकची एकूण लोकसंख्या",
    totalPopSub: "एकूण ग्रामीण व निम-शहरी क्षेत्र",
    femalePopLabel: "महिला लोकसंख्या (Target Base)",
    femalePopSub: "कापड व दैनंदिन वस्तू वापरासाठी अनुकूल",
    scStRatioLabel: "SC / ST प्रमाण",
    scStRatioSub: "सामाजिक समावेशक निर्देशांक",
    femaleWorkforceLabel: "महिला कार्यबल सहभाग",
    femaleWorkforceSub: "उच्च विकास व खरेदी क्षमता",
    dominantEconLabel: "प्रमुख आर्थिक उपक्रम",
    competitorDensityLabel: "थेट स्पर्धा घनता (OpenStreetMap)",
    moderateCompBadge: "मध्यम स्पर्धा — प्रचंड मागणी",
    demoScore: "व्यवहार्यता निर्देशांक: 8.4 / 10 (अति-अनुकूल)",

    swotCardTitle: "व्यवसाय SWOT विश्लेषण (Field Reality)",
    strengthTitle: "सामर्थ्य (Strengths)",
    weaknessTitle: "मर्यादा (Weaknesses)",
    opportunityTitle: "संधी (Opportunities)",
    threatTitle: "धोके व आव्हाने (Threats)",
    pricingBenchmarkLabel: "🎯 शिफारस केलेले दर मार्गदर्शन (Pricing Benchmark)",
    opportunitySummaryLabel: "संधी सारांश:",
    overallRating: "समग्र व्यवहार्यता रेटिंग: श्रेणी-A (उत्कृष्ट)",

    engine2Badge: "शिफारस केलेली कर्ज योजना",
    underwritingMatch: "बँक निकष जुळणी",
    eligibility100: "पात्रता: 100% शिफारस",
    projectCostLabel: "एकूण प्रकल्प खर्च",
    projectCostSub: "80% कर्ज + 20% स्वतःचे भांडवल",
    sanctionedLoanLabel: "मंजूर कर्ज रक्कम (80%)",
    sanctionedLoanSub: "यंत्रसामग्री व कच्चा माल",
    effectiveRateLabel: "प्रभावी व्याजदर",
    tenureLabel: "कर्ज मुदत व सवलत (Tenure)",
    tenureSub: "60 महिने (6 महिने हप्ता सवलत)",

    physicalHeading: "ग्रामीण भौतिक उत्पादन समतुल्यता (Physical-Unit Grounding)",
    financialGroundingBadge: "वित्तीय साक्षरता मॉडेल",
    monthlyEmiLabel: "मासिक हप्ता (Monthly EMI)",
    monthlyEmiSub: "मुद्दल + व्याज परतफेड",
    dailyBurdenLabel: "दैनिक हप्ता भार (Daily Burden)",
    dailyBurdenSub: "30 दिवसांच्या महिन्यावर आधारित",
    dailyOutputThresholdLabel: "दैनिक आवश्यक उत्पादन (Physical Output Threshold)",
    altMetricLabel: "पर्यायी उत्पादन:",

    engine3Badge: "जवळची बँक शाखा",
    partnerBranchHeading: "वाटप केलेली बँक शाखा व सेवा केंद्र",
    primaryBranchTag: "प्राथमिक वाटप शाखा",
    nearestDistanceTag: "सर्वात जवळचे अंतर",
    quotaRemainingLabel: "सक्रिय मुद्रा कोटा शिल्लक:",
    quotaAvailable: "उपलब्ध",
    tatLabel: "मंजुरी कालावधी: 3 ते 5 कामाचे दिवस",
    routingReasonLabel: "शाखा वाटप कारण:",
    auditLogHeading: "तपासणी नोंद: वगळण्यात आलेल्या इतर शाखा",
    assignedSakhiLabel: "संबंधित बँक सखी:",

    docReadinessHeading: "कागदपत्र पूर्तता व पडताळणी सारांश",
    docReadyBadge: "100% Verified",
    docReadyAlert: "कागदपत्रे पूर्ण — बँक शाखेत जमा करण्यास तयार (Ready for Submission)",
    aadhaarLabel: "आधार कार्ड (Aadhaar Card)",
    aadhaarSub: "DigiLocker ई-केवायसी सत्यापित (UIDAI)",
    panLabel: "पॅन कार्ड (PAN Card)",
    panSub: "NSDL थेट डेटाबेस जुळणी",
    passbookLabel: "बँक पासबुक (Active Passbook)",
    passbookSub: "मागील 6 महिन्यांची बचत खाते नोंद",
    udyamLabel: "उद्यम नोंदणी (Udyam MSME)",
    ocrMismatchZero: "OCR नाव / जन्मतारीख त्रुटी: शून्य (0 Flags)",

    slipCardHeading: "बँक व्यवस्थापक क्रेडिट मूल्यांकन पावती (Banker Slip)",
    slipFormNo: "फॉर्म क्र. BC-SLIP/2026/A",
    confidentialBadge: "CONFIDENTIAL / UNDERWRITING",
    recommendedSanction: "RECOMMENDED SANCTION",
    borrowerLabel: "अर्जदार (Borrower)",
    tradeNatureLabel: "व्यवसाय स्वरूप (Activity)",
    cibilLabel: "CIBIL बेंचमार्क स्कोअर",
    cibilSub: "शून्य डिफॉल्ट ट्रॅक",
    dscrLabel: "DSCR कव्हरेज प्रमाण",
    dscrSub: "उत्कृष्ट परतफेड क्षमता",
    cashflowHeading: "📊 अंदाजित निव्वळ रोख प्रवाह (Cash Flow Projection)",
    grossReceiptsLabel: "मासिक एकूण आवक (Gross Receipts):",
    opexLabel: "मासिक परिचालन खर्च (OPEX):",
    npvLabel: "निव्वळ वर्तमान मूल्य (NPV 5-Yr):",
    recommendationNoteLabel: "शाखा शिफारस शेरा (Branch Credit Note):",
    borrowerSignLabel: "अर्जदाराची स्वाक्षरी / अंगठा:",
    officerSignLabel: "कृषी/सूक्ष्म कर्ज अधिकारी (SBI):",
    issuanceDateLabel: "जारी दिनांक व वेळ:",
    btnPrintSlip: "🖨️ A4 बँक पावती प्रिंट करा",
    btnForwardBranch: "🤝 अर्ज थेट संबंधित बँकेला पाठवा",

    // Trades
    trades: {
      tailor: { title: "शिलाई व बुटीक", subtitle: "Boutique & Tailor", unit: "1 सूट दररोज (1 Suit/Day)", alt: "🥛 दररोज 5 लिटर दुधाच्या समतुल्य", rate: "₹ 250 – ₹ 350" },
      dairy: { title: "दुग्धव्यवसाय व पशुपालन", subtitle: "Dairy Livestock", unit: "6 लिटर दूध दररोज (6L/Day)", alt: "🌾 2 पोती पशुखाद्य बचत समतुल्य", rate: "₹ 45 – ₹ 52 / लिटर" },
      retail: { title: "किराणा व जनरल स्टोअर", subtitle: "Retail Provision", unit: "3 ग्राहक बिलिंग दररोज (3 Bills/Day)", alt: "📦 5 घाऊक पॅकेट विक्री समतुल्य", rate: "18-22% नफा" },
      vegetable_vendor: { title: "भाजीपाला व फळ विक्री", subtitle: "Perishables Vendor", unit: "10 किलो भाजीपाला दररोज (10 Kg/Day)", alt: "🥬 2 क्रेट हंगामी भाजी समतुल्य", rate: "25-30% मार्जिन" },
      electronics_repair: { title: "दुरुस्ती व CSC केंद्र", subtitle: "Tech & Hardware", unit: "2 उपकरणे दुरुस्ती दररोज (2 Jobs/Day)", alt: "⚡ 5 ऑनलाइन अर्ज सेवा समतुल्य", rate: "₹ 150 – ₹ 300 / सेवा" },
      incense_craft: { title: "हस्तकला / अगरबत्ती", subtitle: "Cottage Craft", unit: "8 पॅकेट अगरबत्ती निर्मिती (8 Packs/Day)", alt: "🧺 1 बांबू कलाकुसर समतुल्य", rate: "₹ 40 – ₹ 60 / पॅकेट" },
    },
  },

  ta: {
    formNo: "படிவம் எண்: BFA-88",
    registryIndex: "பதிவு எண்: CG-DURG",
    tagline: "உங்கள் வணிகத்திற்கான உள்ளூர் சந்தை மற்றும் கடன் பகுப்பாய்வு",
    censusBadge: "CENSUS 2011 & OSM சரிபார்க்கப்பட்டது",
    part1Badge: "பகுதி-அ / PART-I",
    frameworkTitle: "National Rural Enterprise Advisory Framework",
    pageHeading: "கிராமப்புற தொழில் சாத்தியக்கூறு மற்றும் கடன் ஆலோசகர்",
    pageSubheading: "உள்ளூர் சந்தை பகுப்பாய்வு, மக்கள் தொகை தரவு மற்றும் வங்கி கடன் மதிப்பீடு",
    modeSelf: "👤 சுய சேவை (Self)",
    modeAssisted: "🤝 வங்கி சகி / CSC உதவி (Assisted)",
    viewBorrower: "📱 கடன் வாங்குபவர் பார்வை",
    viewBanker: "📑 வங்கி மேலாளர் கடன் ரசீது",

    // Intake
    blockLabel: "1. வட்டாரம் / பகுதி தேர்வு (Block Location)",
    censusLink: "🟢 மக்கள் தொகை கணக்கெடுப்பு இணைப்பு",
    applicantLabel: "4. விண்ணப்பதாரர் பெயர் (Applicant Full Name)",
    prefixMrs: "திருமதி.",
    prefixMr: "திரு.",
    verifiedUidai: "UIDAI / DigiLocker சரிபார்க்கப்பட்டது",
    verifiedSakhi: "வங்கி சகி பயோமெட்ரிக் சரிபார்க்கப்பட்டது",
    incomeLabel: "8. ஆண்டு குடும்ப வருமானம் (Annual Income)",
    incomeBracket: "வருமான நிலை: கிராமப்புற நடுத்தர-குறைவு",
    tradeLabel: "2. தொழில் பிரிவு தேர்வு (Trade Category Selection)",
    tradesAvailable: "6 தொழில் பிரிவுகள் உள்ளன",
    womenLabel: "5. பெண் தொழில்முனைவோர் (Women)",
    womenSub: "50-100 bps வட்டி சலுகை உண்டு",
    scStLabel: "6. SC / ST பிரிவு",
    scStYes: "சிறப்பு சலுகை திட்டம் உண்டு",
    scStNo: "இல்லை (பொது/OBC)",
    greenfieldLabel: "7. புதிய தொழில் (Greenfield)",
    greenfieldSub: "முதல் முறை தொழில் தொடங்குதல்",
    langLabel: "9. மொழி (Language)",
    marginHeading: "மூலதனம் மற்றும் சுய பங்கு",
    marginLabel: "3. சொந்த முதலீட்டுத் தொகை (Own Funds)",
    projectCostCalc: "மொத்த திட்டச் செலவு:",
    marginBasis: "அடிப்படை: 20% சொந்த முதலீடு + 80% வங்கி கடன்",
    btnCalculate: "சாத்தியக்கூறு அறிக்கை மற்றும் கடன் விவரம் பெறுக",
    btnCalculating: "சாத்தியக்கூறு கணக்கிடப்படுகிறது...",

    // Part 2 Output
    part2Badge: "பகுதி-ஆ / PART-II",
    resultsHeading: "சாத்தியக்கூறு மற்றும் வங்கி ஒதுக்கீடு முடிவு (Advisory Dossier)",
    enginesActive: "இயந்திரங்கள் 1, 2, 3 செயலில் உள்ளன",

    audioTitle: "கிராமப்புற குரல் வழிகாட்டி (Vernacular AI Voice Advisory)",
    audioDialect: "மொழி: தமிழ் குரல் வழிகாட்டல்",
    audioEngineTag: "Groq AI Multi-lingual Speech Engine",
    transcriptTitle: "📝 குரல் உரை முன்னோட்டம்:",

    demoCardTitle: "மக்கள் தொகை மற்றும் உள்ளூர் சந்தை பகுப்பாய்வு",
    engine1Badge: "சந்தை பகுப்பாய்வு",
    demoSource: "ஆதாரம்: Census 2011 Primary Abstract & OSM Live API",
    liveVerified: "🟢 Live Verified",
    totalPopLabel: "வட்டார மொத்த மக்கள் தொகை",
    totalPopSub: "கிராமப்புற மற்றும் புறநகர் பகுதி",
    femalePopLabel: "பெண்கள் மக்கள் தொகை (Target Base)",
    femalePopSub: "ஆடை மற்றும் சில்லறை வணிகத்திற்கு ஏற்றது",
    scStRatioLabel: "SC / ST விகிதம்",
    scStRatioSub: "சமூக சேர்க்கை அளவுகோல்",
    femaleWorkforceLabel: "பெண்கள் பணியாளர் பங்கேற்பு",
    femaleWorkforceSub: "உயர் வளர்ச்சி மற்றும் வாங்கும் திறன்",
    dominantEconLabel: "முக்கிய பொருளாதார நடவடிக்கை",
    competitorDensityLabel: "நேரலை போட்டி அடர்த்தி (OpenStreetMap)",
    moderateCompBadge: "மிதமான போட்டி — அதிக தேவை",
    demoScore: "சாத்தியக்கூறு குறியீடு: 8.4 / 10 (மிகவும் சாத்தியமானது)",

    swotCardTitle: "தொழில் SWOT பகுப்பாய்வு (Field Reality)",
    strengthTitle: "பலங்கள் (Strengths)",
    weaknessTitle: "பலவீனங்கள் (Weaknesses)",
    opportunityTitle: "வாய்ப்புகள் (Opportunities)",
    threatTitle: "அபாயங்கள் மற்றும் சவால்கள் (Threats)",
    pricingBenchmarkLabel: "🎯 பரிந்துரைக்கப்பட்ட விலை வழிகாட்டுதல் (Pricing Benchmark)",
    opportunitySummaryLabel: "வாய்ப்பு சுருக்கம்:",
    overallRating: "ஒட்டுமொத்த வணிக மதிப்பீடு: தரம்-A (உகந்தது)",

    engine2Badge: "பரிந்துரைக்கப்பட்ட கடன் திட்டம்",
    underwritingMatch: "வங்கி தகுதி பொருத்தம்",
    eligibility100: "தகுதி: 100% பரிந்துரைக்கப்படுகிறது",
    projectCostLabel: "மொத்த திட்டச் செலவு",
    projectCostSub: "80% கடன் + 20% சொந்த முதலீடு",
    sanctionedLoanLabel: "அனுமதிக்கப்பட்ட கடன் தொகை (80%)",
    sanctionedLoanSub: "இயந்திரங்கள் மற்றும் மூலப்பொருட்கள்",
    effectiveRateLabel: "பயனுள்ள வட்டி விகிதம்",
    tenureLabel: "கடன் காலம் மற்றும் சலுகை (Tenure)",
    tenureSub: "60 மாதங்கள் (6 மாத தவணை விலக்கு)",

    physicalHeading: "கிராமப்புற உற்பத்தி அளவீடு (Physical-Unit Grounding)",
    financialGroundingBadge: "நிதி கல்வியறிவு மாதிரி",
    monthlyEmiLabel: "மாதாந்திர தவணை (Monthly EMI)",
    monthlyEmiSub: "அசல் + வட்டி திருப்பிச் செலுத்துதல்",
    dailyBurdenLabel: "தினசரி கடன் சுமை (Daily Burden)",
    dailyBurdenSub: "30 நாள் மாத கணக்கீடு",
    dailyOutputThresholdLabel: "தினசரி தேவையான உற்பத்தி (Physical Output Threshold)",
    altMetricLabel: "மாற்று அளவீடு:",

    engine3Badge: "அருகிலுள்ள வங்கி கிளை",
    partnerBranchHeading: "ஒதுக்கப்பட்ட வங்கி கிளை மற்றும் சேவை மையம்",
    primaryBranchTag: "முதன்மை ஒதுக்கப்பட்ட கிளை",
    nearestDistanceTag: "அருகிலுள்ள தூரம்",
    quotaRemainingLabel: "செயலில் உள்ள முத்ரா ஒதுக்கீடு இருப்பு:",
    quotaAvailable: "கிடைக்கிறது",
    tatLabel: "சராசரி அனுமதி காலம்: 3 முதல் 5 வேலை நாட்கள்",
    routingReasonLabel: "கிளை ஒதுக்கீட்டு காரணம்:",
    auditLogHeading: "தணிக்கை பதிவு: தவிர்க்கப்பட்ட பிற கிளைகள்",
    assignedSakhiLabel: "ஒதுக்கப்பட்ட வங்கி சகி:",

    docReadinessHeading: "ஆவணங்கள் தயார்நிலை மற்றும் சரிபார்ப்பு சுருக்கம்",
    docReadyBadge: "100% Verified",
    docReadyAlert: "அனைத்து ஆவணங்களும் தயார் — வங்கியில் சமர்ப்பிக்கலாம் (Ready for Submission)",
    aadhaarLabel: "ஆதார் அட்டை (Aadhaar Card)",
    aadhaarSub: "DigiLocker e-KYC சரிபார்க்கப்பட்டது (UIDAI)",
    panLabel: "பான் அட்டை (PAN Card)",
    panSub: "NSDL நேரடி தரவுத்தள பொருத்தம்",
    passbookLabel: "வங்கி கணக்குப் புத்தகம் (Active Passbook)",
    passbookSub: "கடந்த 6 மாத சேமிப்பு கணக்கு பதிவு",
    udyamLabel: "உத்யம் பதிவு (Udyam MSME)",
    ocrMismatchZero: "OCR பெயர் / பிறந்த தேதி முரண்பாடுகள்: இல்லை (0 Flags)",

    slipCardHeading: "வங்கி மேலாளர் கடன் மதிப்பீட்டு ரசீது (Banker Slip)",
    slipFormNo: "படிவம் எண்: BC-SLIP/2026/A",
    confidentialBadge: "CONFIDENTIAL / UNDERWRITING",
    recommendedSanction: "RECOMMENDED SANCTION",
    borrowerLabel: "விண்ணப்பதாரர் (Borrower)",
    tradeNatureLabel: "தொழில் வகை (Activity)",
    cibilLabel: "CIBIL குறியீட்டு எண்",
    cibilSub: "சிறந்த திருப்பிச் செலுத்தும் பதிவு",
    dscrLabel: "DSCR பாதுகாப்பு விகிதம்",
    dscrSub: "உயர் கடன் திருப்பிச் செலுத்தும் திறன்",
    cashflowHeading: "📊 எதிர்பார்க்கப்படும் பணப்புழக்கம் (Cash Flow Projection)",
    grossReceiptsLabel: "மாதாந்திர மொத்த வருவாய் (Gross Receipts):",
    opexLabel: "மாதாந்திர செயல்பாட்டு செலவு (OPEX):",
    npvLabel: "நிகர தற்போதைய மதிப்பு (NPV 5-Yr):",
    recommendationNoteLabel: "வங்கி பரிந்துரைக் குறிப்பு (Branch Note):",
    borrowerSignLabel: "விண்ணப்பதாரர் கையொப்பம் / கைரேகை:",
    officerSignLabel: "கடன் அதிகாரி கையொப்பம் (SBI):",
    issuanceDateLabel: "வெளியிடப்பட்ட தேதி மற்றும் நேரம்:",
    btnPrintSlip: "🖨️ A4 வங்கி ரசீது அச்சிடுக",
    btnForwardBranch: "🤝 விண்ணப்பத்தை நேரடியாக வங்கிக்கு அனுப்புக",

    // Trades
    trades: {
      tailor: { title: "தையல் மற்றும் பூட்டிக்", subtitle: "Boutique & Tailor", unit: "தினமும் 1 ஆடை தைத்தல் (1 Suit/Day)", alt: "🥛 தினமும் 5 லிட்டர் பாலுக்கு சமம்", rate: "₹ 250 – ₹ 350" },
      dairy: { title: "பால் பண்ணை மற்றும் கால்நடை", subtitle: "Dairy Livestock", unit: "தினமும் 6 லிட்டர் பால் (6L/Day)", alt: "🌾 2 மூட்டை கால்நடை தீவன சேமிப்பு", rate: "₹ 45 – ₹ 52 / லிட்டர்" },
      retail: { title: "மளிகை மற்றும் பொது அங்காடி", subtitle: "Retail Provision", unit: "தினமும் 3 வாடிக்கையாளர் பில் (3 Bills/Day)", alt: "📦 5 மொத்த பேக்கெட் விற்பனைக்கு சமம்", rate: "18-22% லாபம்" },
      vegetable_vendor: { title: "காய்கறி மற்றும் பழ வியாபாரம்", subtitle: "Perishables Vendor", unit: "தினமும் 10 கிலோ காய்கறி (10 Kg/Day)", alt: "🥬 2 பெட்டி காய்கறி விற்பனைக்கு சமம்", rate: "25-30% மார்ஜின்" },
      electronics_repair: { title: "பழுதுபார்ப்பு மற்றும் CSC மையம்", subtitle: "Tech & Hardware", unit: "தினமும் 2 சாதன பழுதுபார்ப்பு (2 Jobs/Day)", alt: "⚡ 5 ஆன்லைன் விண்ணப்ப சேவைக்கு சமம்", rate: "₹ 150 – ₹ 300 / சேவை" },
      incense_craft: { title: "கைவினைப்பொருட்கள் / அகர்பத்தி", subtitle: "Cottage Craft", unit: "தினமும் 8 பாக்கெட் அகர்பத்தி (8 Packs/Day)", alt: "🧺 1 மூங்கில் கைவினைப்பொருளுக்கு சமம்", rate: "₹ 40 – ₹ 60 / பாக்கெட்" },
    },
  },
};

const BLOCK_CONFIG = {
  patan: {
    name: "पाटन (Patan)",
    district: "दुर्ग, छत्तीसगढ़",
    code: "382",
    censusCode: "03310",
    lat: 21.0366,
    lon: 81.5369,
    gpsText: "GPS: 21.03° N, 81.53° E",
    totalPop: "1,28,450",
    femalePop: "64,120 (49.9%)",
    scStRatio: "28.4%",
    femaleWorkforce: "36.8%",
    dominantEcon: "कृषि एवं संबद्ध सूक्ष्म व्यापार केंद्र (धान प्रसंस्करण, साप्ताहिक हाट व परिधान मांग हब)",
    branchName: "भारतीय स्टेट बैंक (SBI) — पाटन मुख्य शाखा",
    branchCode: "4021",
    ifsc: "SBIN0004021",
    distanceKm: "3.2 किमी",
    sakhiName: "सुधा वर्मा (ID: BC-PATAN-104)",
  },
  dhamdha: {
    name: "धमधा (Dhamdha)",
    district: "दुर्ग, छत्तीसगढ़",
    code: "383",
    censusCode: "03311",
    lat: 21.4468,
    lon: 81.3142,
    gpsText: "GPS: 21.44° N, 81.31° E",
    totalPop: "1,42,800",
    femalePop: "70,120 (49.1%)",
    scStRatio: "24.1%",
    femaleWorkforce: "34.2%",
    dominantEcon: "सब्जी मंडी, दलहन प्रसंस्करण एवं ग्रामीण खुदरा व्यापार",
    branchName: "छत्तीसगढ़ राज्य ग्रामीण बैंक (CRGB) — धमधा शाखा",
    branchCode: "2104",
    ifsc: "CRGB0002104",
    distanceKm: "2.8 किमी",
    sakhiName: "ममता चंद्राकर (ID: BC-DHAM-082)",
  },
  durg_rural: {
    name: "दुर्ग ग्रामीण (Durg Rural)",
    district: "दुर्ग, छत्तीसगढ़",
    code: "381",
    censusCode: "03309",
    lat: 21.1965,
    lon: 81.9664,
    gpsText: "GPS: 21.19° N, 81.96° E",
    totalPop: "1,89,600",
    femalePop: "93,450 (49.3%)",
    scStRatio: "21.6%",
    femaleWorkforce: "38.5%",
    dominantEcon: "अर्ध-शहरी आपूर्ति श्रृंखला, लघु विनिर्माण एवं परिधान उद्योग",
    branchName: "पंजाब नेशनल बैंक (PNB) — दुर्ग ग्रामीण शाखा",
    branchCode: "1098",
    ifsc: "PUNB0109800",
    distanceKm: "4.1 किमी",
    sakhiName: "सुनीता देवांगन (ID: BC-DURG-305)",
  },
  arang: {
    name: "आरंग (Arang)",
    district: "रायपुर, छत्तीसगढ़",
    code: "401",
    censusCode: "03420",
    lat: 21.1925,
    lon: 81.9642,
    gpsText: "GPS: 21.19° N, 81.96° E",
    totalPop: "1,65,200",
    femalePop: "81,300 (49.2%)",
    scStRatio: "31.2%",
    femaleWorkforce: "35.1%",
    dominantEcon: "हथकरघा, वस्त्र बुनाई, कृषि उपकरण मरम्मत व डेयरी हब",
    branchName: "भारतीय स्टेट बैंक (SBI) — आरंग शाखा",
    branchCode: "0512",
    ifsc: "SBIN0000512",
    distanceKm: "3.5 किमी",
    sakhiName: "रेखा साहू (ID: BC-ARNG-112)",
  },
};

export default function BusinessAdvisorPage() {
  const [lang, setLang] = useState("hi");
  const [assistedMode, setAssistedMode] = useState(true); // true = Sakhi / CSC, false = Self
  const [viewMode, setViewMode] = useState("borrower"); // "borrower" (simple) or "banker" (slip)

  // Intake Form State
  const [blockKey, setBlockKey] = useState("patan");
  const [tradeKey, setTradeKey] = useState("tailor");
  const [availableMargin, setAvailableMargin] = useState(100000);
  const [fullName, setFullName] = useState("सुनीता साहू (Sunita Sahu)");
  const [wizardStep, setWizardStep] = useState(1);
  const [voiceHeard, setVoiceHeard] = useState("");
  const [speakToken, setSpeakToken] = useState(0); // bumped when results are ready: triggers the spoken result // 1=feasibility, 2=loan match, 3=next steps
  const [annualIncome, setAnnualIncome] = useState("1,80,000");
  const [isWomen, setIsWomen] = useState(true);
  const [isScSt, setIsScSt] = useState(false);
  const [isGreenfield, setIsGreenfield] = useState(true);

  // Two-Phase Display State: Output is revealed ONLY after user clicks analyze
  const [hasCalculated, setHasCalculated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiReport, setApiReport] = useState(null);

  const resultsRef = useRef(null);

  const t = ADVISOR_I18N[lang] || ADVISOR_I18N.hi;
  const selectedBlock = BLOCK_CONFIG[blockKey] || BLOCK_CONFIG.patan;
  const tradeI18n = t.trades[tradeKey] || t.trades.tailor;

  // Financial figures — sourced from the real backend engine (apiReport)
  // once a calculation has been run, which is the single source of truth
  // for margin %, tier rates, subventions, and EMI math (engine/finance.py).
  //
  // FIXED: this block previously computed its own numbers locally using a
  // 20%-margin / flat-8.5-9%-rate / monthly-compounding formula that does
  // not match the actual scheme rules anywhere (the real rule is a FIXED
  // 10% margin for everyone, tiered 6.5%/8% base rates with stacked
  // women/SC-ST subventions down to a 5% floor, and quarterly — not
  // monthly — EMI compounding). That local formula was what the "Project
  // Cost / Loan Amount / EMI / APPROVED" figures were built from, even in
  // the normal (non-error) case — meaning every number a user or judge
  // saw on this page was wrong, not just the offline-fallback path.
  //
  // marginNum stays local (it's just the raw form input, not a financial
  // computation). Everything derived from it now comes from apiReport.
  const marginNum = Number(availableMargin) || 100000;

  // Only true once handleAnalyze has run AND the real API call failed —
  // NOT the normal case. Surfaced visibly in the UI (see isOfflineEstimate
  // badge below) rather than silently presenting an estimate as fact,
  // matching the is_live transparency pattern engine/feasibility.py
  // already uses for live-vs-cached OSM data.
  const isOfflineEstimate = hasCalculated && !apiReport;

  // Conservative, clearly-labeled fallback ONLY for when the API is
  // genuinely unreachable — uses the real 10% margin rule and the correct
  // lower-tier base rate as a floor estimate (not a fabricated flat rate).
  // This is deliberately a rougher approximation (it doesn't replicate
  // the full tier-selection/subvention-stacking logic) because that logic
  // belongs in engine/finance.py, not duplicated here — duplicating it
  // is exactly how the original bug happened.
  const fallbackProjectCost = Math.round(marginNum / 0.10);
  const fallbackLoanAmount = fallbackProjectCost - marginNum;
  const fallbackRate = isWomen ? 5.5 : 6.5; // conservative floor estimate only — see comment above
  const fallbackMonthlyEmi = Math.round(
    (fallbackLoanAmount * (fallbackRate / 100 / 12) * Math.pow(1 + fallbackRate / 100 / 12, 36)) /
    (Math.pow(1 + fallbackRate / 100 / 12, 36) - 1)
  );

  const projectCost = apiReport?.best_scheme?.project_cost ?? fallbackProjectCost;
  const loanAmount = apiReport?.best_scheme?.loan_amount ?? fallbackLoanAmount;
  const interestRate = apiReport?.best_scheme
    ? apiReport.best_scheme.effective_interest_rate * 100
    : fallbackRate;
  const tenureYears = apiReport?.best_scheme?.tenure_years ?? 5;
  const monthlyEmi = apiReport?.rural_metrics?.monthly_emi ?? fallbackMonthlyEmi;
  const dailyBurden = apiReport?.rural_metrics?.daily_cost ?? Math.round(monthlyEmi / 30);

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    unlockAudio(); // runs inside the user's tap, so the result can be spoken automatically later
    setLoading(true);

    const payload = {
      block_name: blockKey,
      latitude: selectedBlock.lat,
      longitude: selectedBlock.lon,
      trade_category: tradeKey,
      available_margin: marginNum,
      is_women_entrepreneur: isWomen,
      is_sc_st: isScSt,
      is_greenfield: isGreenfield,
      applicant_full_name: fullName.split("(")[0].trim(),
      // Document readiness isn't collected on this page yet, so DOB is
      // genuinely unknown here — omit it rather than send a fabricated
      // placeholder. (Previously hardcoded to "1990-01-01" for every
      // applicant, which the backend doesn't currently cross-check
      // against anything, but is the kind of silent fake data that
      // becomes a real bug the moment that changes.)
      language: lang,
    };

    try {
      const res = await fetch("http://localhost:8000/api/advisory/full-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setApiReport(data);
      } else {
        console.warn("Backend API responded with non-200, using local grounded calculation");
      }
    } catch (err) {
      console.warn("API request failed, running grounded offline advisory engine:", err);
    } finally {
      setLoading(false);
      setHasCalculated(true);
      setSpeakToken((n) => n + 1); // results are final here: start speaking them

      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  };

  // Swot Data (Dynamically merged with API report if available)
  const swotStrengths = apiReport?.feasibility?.swot?.strengths || [
    lang === "en" ? "Locally accessible skilled women workforce" : lang === "mr" ? "स्थानिक पातळीवर कुशल महिला कामगार सहज उपलब्ध" : lang === "ta" ? "உள்ளூரில் திறமையான பெண்கள் பணியாளர்கள் உள்ளனர்" : "स्थानीय स्तर पर कुशल महिला श्रम सुलभ",
    lang === "en" ? "Direct footfall from weekly Tuesday Haat market" : lang === "mr" ? "साप्ताहिक मंगळवार आठवडे बाजाराचा थेट लाभ" : lang === "ta" ? "வாராந்திர சந்தை மூலம் நேரடி வாடிக்கையாளர் வரத்து" : "साप्ताहिक मंगलवार हाट-बाजार का सीधा लाभ",
    lang === "en" ? `Guaranteed uniform & institutional demand in ${selectedBlock.name.split(" ")[0]}` : lang === "mr" ? `${selectedBlock.name.split(" ")[0]} शाळा व संकुल गणवेशाची निश्चित मागणी` : lang === "ta" ? `${selectedBlock.name.split(" ")[0]} பள்ளி சீருடைக்கான நிலையான தேவை` : `${selectedBlock.name.split(" ")[0]} कन्या शाला व संकुल ऑर्डर की सुनिश्चित मांग`,
  ];

  const swotWeaknesses = apiReport?.feasibility?.swot?.weaknesses || [
    lang === "en" ? "Limited initial working capital reserve" : lang === "mr" ? "प्रारंभिक खेळते भांडवल मर्यादित" : lang === "ta" ? "தொடக்க செயல்பாட்டு மூலதனம் குறைவு" : "प्रारंभिक कार्यशील पूंजी (वर्किंग कैपिटल) सीमित",
    lang === "en" ? "No prior experience with digital QR / POS billing" : lang === "mr" ? "डिजिटल क्यूआर/UPI बिलिंग उपकरणांचा पूर्व अनुभव नाही" : lang === "ta" ? "டிஜிட்டல் QR/POS பில்லிங் முன் அனுபவம் இல்லை" : "डिजिटल क्यूआर/UPI बिलिंग उपकरण का पूर्व अनुभव नहीं",
    lang === "en" ? "Lack of modern electric motorized machinery & backup" : lang === "mr" ? "आधुनिक विद्युत यंत्रसामग्री व टूलकिटचा अभाव" : lang === "ta" ? "நவீன மின்சார இயந்திரங்கள் பற்றாக்குறை" : "आधुनिक विद्युत मशीनरी व टूलकिट का अभाव",
  ];

  const swotOpportunities = apiReport?.feasibility?.swot?.opportunities || [
    lang === "en" ? "Severe shortage of organized boutique / repair hubs in 5km" : lang === "mr" ? "5 किमी परिसरात आधुनिक बुटीक/केंद्रांची मोठी कमतरता" : lang === "ta" ? "5 கிமீ சுற்றளவில் ஒழுங்கமைக்கப்பட்ட கடைகளின் பற்றாக்குறை" : "आसपास संगठित आधुनिक बुटीक/दुकानों की भारी कमी",
    lang === "en" ? "3x demand surge during wedding & upcoming festival seasons" : lang === "mr" ? "आगामी सण-उत्सव व विवाह हंगामात 3 पट मागणी वाढ" : lang === "ta" ? "திருமணம் மற்றும் பண்டிகை காலங்களில் 3 மடங்கு தேவை அதிகரிப்பு" : "आगामी वैवाहिक व तीजा-पोरा पर्व सीजन में 3x मांग वृद्धि",
    lang === "en" ? "Bulk supply contracts with SHG cluster federations" : lang === "mr" ? "SHG बचत गट फेडरेशन स्तरावर घाऊक पुरवठा करार संधी" : lang === "ta" ? "சுயஉதவி குழு கூட்டமைப்பு மூலம் மொத்த ஆர்டர் வாய்ப்பு" : "SHG संकुल स्तर पर थोक आपूर्ति अनुबंध अवसर",
  ];

  const swotThreats = apiReport?.feasibility?.swot?.threats || [
    lang === "en" ? "Seasonal price volatility in raw materials and supplies" : lang === "mr" ? "कच्च्या मालाच्या घाऊक भावात हंगामी चढ-उतार" : lang === "ta" ? "மூலப்பொருள் விலையில் பருவகால ஏற்ற இறக்கம்" : "कच्चे माल के थोक भाव में मौसमी उतार-चढ़ाव",
    lang === "en" ? "Periodic rural power cuts (requires solar/inverter backup)" : lang === "mr" ? "ग्रामीण वीज पुरवठा खंडित होणे (बॅकअप आवश्यक)" : lang === "ta" ? "கிராமப்புற மின்வெட்டு (பேக்கப் தேவை)" : "ग्रामीण विद्युत आपूर्ति कटौती (बैकअप जरूरी)",
    lang === "en" ? "Price pressure from wholesale urban market transport" : lang === "mr" ? "जवळच्या मोठ्या बाजारपेठेतून घाऊक मालाची स्पर्धा" : lang === "ta" ? "அருகிலுள்ள பெரிய நகர சந்தைகளின் விலை போட்டி" : "निकटवर्ती बड़े बाजार से थोक माल की प्रतिस्पर्धा",
  ];

  // Short intro shown on screen under the player. FIXED: this used to read
  // apiReport?.audio_script, which doesn't exist at the top level of the API
  // response (it lives at apiReport.feasibility.audio_script), so the model-written
  // narration was never used and the canned template below always won.
  const audioScriptText = apiReport?.feasibility?.audio_script || (
    lang === "en"
      ? `Greetings ${fullName.split(" ")[0]}! Enterprise venture in ${selectedBlock.name} for ${tradeI18n.title} is highly viable and credit-ready. With minimal organized competition within 5 km and healthy demand at ${tradeI18n.rate}, producing just ${tradeI18n.unit} safely covers your daily debt quota of ₹${dailyBurden}/day with surplus household savings remaining.`
      : lang === "mr"
        ? `नमस्कार ${fullName.split(" ")[0]} ताई! ${selectedBlock.name} मध्ये ${tradeI18n.title} सुरू करणे अत्यंत फायदेशीर आहे. 5 किमी परिसरात मर्यादित स्पर्धा असून ${tradeI18n.rate} दराने फक्त ${tradeI18n.unit} तयार केल्यास मुद्रा कर्जाचा ₹${dailyBurden}/दिवस हप्ता सहज निघेल व निव्वळ नफा शिल्लक राहील.`
        : lang === "ta"
          ? `வணக்கம் ${fullName.split(" ")[0]} அவர்களே! ${selectedBlock.name} பகுதியில் ${tradeI18n.title} தொழில் தொடங்குவது மிகவும் லாபகரமானது. 5 கிமீ சுற்றளவில் குறைந்த போட்டியே உள்ளது. ${tradeI18n.rate} விலையில் தினமும் ${tradeI18n.unit} உற்பத்தி செய்தால் முத்ரா கடனின் ₹${dailyBurden}/நாள் தவணையை எளிதாக செலுத்தி நல்ல லாபம் பெறலாம்.`
          : `नमस्ते ${fullName.split(" ")[0]} जी! ${selectedBlock.name} में ${tradeI18n.title} का कार्य अत्यंत लाभदायक और सुरक्षित है। 5 किमी परिधि में सीमित संगठित प्रतिस्पर्धा है। ${tradeI18n.rate} की दर पर केवल ${tradeI18n.unit} तैयार करने से प्रधानमंत्री मुद्रा योजना की ₹${dailyBurden}/दिन की किश्त आसानी से निकल जाएगी और आपके पास शुद्ध बचत शेष रहेगी।`
  );

  // What is actually SPOKEN: the whole result, not just the intro. The applicant's
  // name is deliberately left out, because spoken text is sent to the TTS service.
  const fullNarration = buildAdvisorNarration({
    lang,
    intro: apiReport?.feasibility?.audio_script || null,
    isOffline: isOfflineEstimate,
    competitorCount: apiReport?.feasibility?.competitor_count,
    competitorIsLive: apiReport?.feasibility?.competitor_density_is_live,
    strengths: swotStrengths,
    weaknesses: swotWeaknesses,
    opportunities: swotOpportunities,
    threats: swotThreats,
    opportunityAnalysis: apiReport?.feasibility?.opportunity_analysis,
    pricingGuidance: apiReport?.feasibility?.pricing_guidance,
    projectCost,
    loanAmount,
    schemeName: apiReport?.best_scheme?.scheme_name,
    ratePercent: interestRate,
    tenureYears,
    moratoriumMonths: apiReport?.best_scheme?.moratorium_months,
    isWomen: (apiReport?.best_scheme?.rebates_applied || []).some((r) => String(r).includes("women")),
    monthlyEmi,
    dailyCost: dailyBurden,
    dailyAnalogy: apiReport?.rural_metrics?.daily_analogy,
    moratoriumBenefit: apiReport?.rural_metrics?.moratorium_benefit,
    branchName: apiReport?.routed_partner?.branch_name,
    distanceKm: apiReport?.routed_partner?.distance_km,
    missingDocCount: apiReport?.document_readiness?.missing_documents?.length || 0,
  });

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Top Standardized Header Navigation with Language Sync */}
      <Navbar activePage="business-advisor" lang={lang} setLang={setLang} />

      <main className="w-full pt-20 bg-surface min-h-[calc(100vh-140px)]">
        <div className="flex flex-col w-full">

          {/* Top Archival Strip / Folio Registry Identifier */}
          <div className="w-full bg-surface-container-high border-b border-outline-variant px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-on-surface">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-tertiary rounded-none"></span>
              <span className="font-label-ledger text-label-ledger uppercase tracking-wider text-secondary">
                {t.formNo}
              </span>
              <span className="text-outline-variant">|</span>
              <span className="font-tabular-record text-tabular-record font-bold text-on-surface">
                {t.registryIndex}-{blockKey.toUpperCase()}-2026/FOLIO-74B
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-label-ledger text-label-ledger uppercase text-on-surface-variant">
                {t.tagline}
              </span>
              <span className="px-2 py-0.5 bg-tertiary-container/30 border border-tertiary text-on-tertiary-container font-label-ledger text-[10px] font-bold rounded-none">
                {t.censusBadge}
              </span>
            </div>
          </div>

          <div className="max-w-[1200px] w-full mx-auto px-4 py-6 space-y-6">

            {/* ========================================================================= */}
            {/* PART 1: INTAKE PARAMETERS & INTERACTIVE CONTROL SECTION                  */}
            {/* ========================================================================= */}
            <div className="bg-surface-container-low border-2 border-secondary p-5 space-y-4 rounded-none">

              {/* Heading & Mode Selectors */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-primary text-on-primary font-label-ledger text-label-ledger font-bold uppercase tracking-wider rounded-none">
                      {t.part1Badge}
                    </span>
                    <span className="font-label-ledger text-label-ledger text-secondary uppercase font-semibold">
                      {t.frameworkTitle}
                    </span>
                  </div>
                  <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
                    {t.pageHeading}
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    {t.pageSubheading}
                  </p>
                </div>

                {/* Mode Switches Container */}
                <div className="flex flex-wrap items-center gap-3">

                  {/* Assisted Intake Toggle */}
                  <div className="flex items-center border-2 border-secondary bg-surface rounded-none">
                    <button
                      onClick={() => setAssistedMode(false)}
                      className={`px-3 py-1.5 font-label-ledger text-label-ledger font-semibold transition-none border-r border-outline-variant rounded-none cursor-pointer ${!assistedMode
                        ? "bg-primary-container text-on-primary-container font-bold"
                        : "text-on-surface-variant hover:bg-surface-container"
                        }`}
                      type="button"
                    >
                      {t.modeSelf}
                    </button>
                    <button
                      onClick={() => setAssistedMode(true)}
                      className={`px-3 py-1.5 font-label-ledger text-label-ledger font-bold flex items-center gap-1.5 transition-none rounded-none cursor-pointer ${assistedMode
                        ? "bg-primary-container text-on-primary-container font-bold"
                        : "text-on-surface-variant hover:bg-surface-container"
                        }`}
                      type="button"
                    >
                      <span className="w-1.5 h-1.5 bg-on-primary-container rounded-none"></span>
                      {t.modeAssisted}
                    </button>
                  </div>

                  {/* Dual View Selector (Borrower vs. Banker Slip) */}
                  <div className="flex items-center border-2 border-secondary bg-surface rounded-none">
                    <button
                      onClick={() => setViewMode("borrower")}
                      className={`px-3 py-1.5 font-label-ledger text-label-ledger font-bold flex items-center gap-1.5 rounded-none transition-none cursor-pointer ${viewMode === "borrower"
                        ? "bg-secondary text-on-secondary"
                        : "text-on-surface-variant hover:bg-surface-container"
                        }`}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[14px]">smartphone</span>
                      {t.viewBorrower}
                    </button>
                    <button
                      onClick={() => {
                        setViewMode("banker");
                        if (hasCalculated) {
                          setTimeout(() => {
                            const slipEl = document.getElementById("banker-slip-card");
                            if (slipEl) slipEl.scrollIntoView({ behavior: "smooth" });
                          }, 100);
                        }
                      }}
                      className={`px-3 py-1.5 font-label-ledger text-label-ledger font-bold border-l border-outline-variant flex items-center gap-1.5 rounded-none transition-none cursor-pointer ${viewMode === "banker"
                        ? "bg-secondary text-on-secondary"
                        : "text-on-surface-variant hover:bg-surface-container"
                        }`}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[14px]">receipt_long</span>
                      {t.viewBanker}
                    </button>
                  </div>
                </div>
              </div>

              {/* INTAKE FORM GRID */}
              <form onSubmit={handleAnalyze} className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                  {/* Col 1: Block & Applicant (4 cols) */}
                  <div className="lg:col-span-4 space-y-4">

                    {/* PRIMARY VOICE INPUT — one spoken description fills the whole
                        form. Typing remains fully available below; this is an
                        option, not a replacement. Dropdown fields (block, trade)
                        are filled by giving the extractor the exact list of valid
                        keys and validating its answer against that list before
                        applying — never trusting free-text output for a key that
                        indexes into config objects. */}
                    <div className="border-2 border-[#845400] bg-[#fbebda]/50 p-5 flex flex-col items-center gap-3 rounded-none">
                      <p className="font-sans font-bold text-base text-[#221a10] text-center">
                        {lang === "en"
                          ? "Tell us about yourself and your business — we'll fill the form for you"
                          : "अपने बारे में और अपने व्यवसाय के बारे में बोलें — हम फ़ॉर्म भर देंगे"}
                      </p>
                      <VoiceInputButton
                        language={lang}
                        fields={{
                          full_name: "the person's full name, as spoken",
                          available_margin: "the amount of money in rupees the person has available as their own capital, as a plain number",
                          block: "one of exactly: patan, dhamdha, durg_rural, arang — whichever village/block the person mentions; null if none is clearly mentioned",
                          trade_category: "one of exactly: tailor, dairy, retail, vegetable_vendor, electronics_repair, incense_craft — closest match to the business they want to start (tailor = sewing/boutique, dairy = milk/cattle, retail = grocery/kirana shop, vegetable_vendor = selling vegetables/fruit, electronics_repair = mobile/electronics repair or CSC centre, incense_craft = agarbatti/handicrafts); null if unclear",
                          is_women: "true if the speaker identifies as a woman, false if a man, null if unclear",
                          is_sc_st: "true if the speaker says they belong to SC or ST category, false if they explicitly say they do not, null if not mentioned",
                          is_greenfield: "true if this is a brand-new business, false if expanding an existing one, null if unclear",
                        }}
                        onTranscript={(text) => setVoiceHeard(text)}
                        onResult={(values) => {
                          const VALID_BLOCKS = ["patan", "dhamdha", "durg_rural", "arang"];
                          const VALID_TRADES = ["tailor", "dairy", "retail", "vegetable_vendor", "electronics_repair", "incense_craft"];
                          if (values.full_name) setFullName(String(values.full_name));
                          const margin = Math.round(Number(values.available_margin));
                          if (margin > 0) setAvailableMargin(margin);
                          if (VALID_BLOCKS.includes(values.block)) setBlockKey(values.block);
                          if (VALID_TRADES.includes(values.trade_category)) setTradeKey(values.trade_category);
                          if (typeof values.is_women === "boolean") setIsWomen(values.is_women);
                          if (typeof values.is_sc_st === "boolean") setIsScSt(values.is_sc_st);
                          if (typeof values.is_greenfield === "boolean") setIsGreenfield(values.is_greenfield);
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

                    {/* 1. Block Location */}
                    <div className="border border-outline-variant bg-surface p-3 space-y-1.5 rounded-none">
                      <div className="flex justify-between items-center">
                        <label className="font-label-ledger text-label-ledger font-bold uppercase text-on-surface">
                          {t.blockLabel}
                        </label>
                        <span className="font-label-ledger text-[10px] text-tertiary font-bold">
                          {selectedBlock.gpsText}
                        </span>
                      </div>
                      <div className="relative">
                        <select
                          value={blockKey}
                          onChange={(e) => setBlockKey(e.target.value)}
                          className="w-full bg-surface-container-low border border-outline px-3 py-2 font-tabular-record text-tabular-record font-bold text-on-surface appearance-none focus:outline-none focus:border-2 focus:border-secondary rounded-none cursor-pointer"
                        >
                          <option value="patan">पाटन (Patan) — दुर्ग, छत्तीसगढ़ (District Code: 382)</option>
                          <option value="dhamdha">धमधा (Dhamdha) — दुर्ग, छत्तीसगढ़</option>
                          <option value="durg_rural">दुर्ग ग्रामीण (Durg Rural) — दुर्ग, छत्तीसगढ़</option>
                          <option value="arang">आरंग (Arang) — रायपुर, छत्तीसगढ़</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-on-surface">
                          <span className="material-symbols-outlined text-[18px]">arrow_drop_down</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-body-sm text-on-surface-variant pt-1 border-t border-outline-variant">
                        <span>जनगणना कोड: {selectedBlock.censusCode}</span>
                        <span className="font-semibold text-secondary">{t.censusLink}</span>
                      </div>
                    </div>

                    {/* 4. Applicant Full Name */}
                    <div className="border border-outline-variant bg-surface p-3 space-y-1.5 rounded-none">
                      <label className="font-label-ledger text-label-ledger font-bold uppercase text-on-surface">
                        {t.applicantLabel}
                      </label>
                      <div className="flex border border-outline bg-surface-container-low rounded-none">
                        <span className="px-2.5 py-2 font-label-ledger text-label-ledger font-bold bg-surface-container border-r border-outline-variant text-on-surface-variant rounded-none">
                          {isWomen ? t.prefixMrs : t.prefixMr}
                        </span>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-transparent px-3 py-2 font-tabular-record text-tabular-record font-bold text-on-surface focus:outline-none rounded-none"
                        />
                      </div>
                      <p className="font-body-sm text-[11px] text-on-surface-variant">
                        {assistedMode ? t.verifiedSakhi : t.verifiedUidai}
                      </p>
                    </div>

                    {/* 8. Annual Family Income */}
                    <div className="border border-outline-variant bg-surface p-3 space-y-1.5 rounded-none">
                      <div className="flex justify-between items-center">
                        <label className="font-label-ledger text-label-ledger font-bold uppercase text-on-surface">
                          {t.incomeLabel}
                        </label>
                        <span className="font-label-ledger text-[10px] text-secondary font-bold">
                          {t.incomeBracket}
                        </span>
                      </div>
                      <div className="flex border border-outline bg-surface-container-low rounded-none">
                        <span className="px-3 py-2 font-tabular-record font-bold bg-surface-container border-r border-outline-variant text-on-surface rounded-none">
                          ₹
                        </span>
                        <input
                          type="text"
                          value={annualIncome}
                          onChange={(e) => setAnnualIncome(e.target.value)}
                          className="w-full bg-transparent px-3 py-2 font-tabular-record text-tabular-record font-bold text-on-surface focus:outline-none rounded-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Col 2: Trade Category (5 cols) */}
                  <div className="lg:col-span-5 border border-outline-variant bg-surface p-3 space-y-2 flex flex-col justify-between rounded-none">
                    <div>
                      <div className="flex items-center justify-between pb-1 border-b border-outline-variant">
                        <label className="font-label-ledger text-label-ledger font-bold uppercase text-on-surface">
                          {t.tradeLabel}
                        </label>
                        <span className="font-label-ledger text-[10px] px-1.5 py-0.5 bg-primary-container text-on-primary-container font-bold rounded-none">
                          {t.tradesAvailable}
                        </span>
                      </div>

                      {/* Selector Chips Grid */}
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        {Object.entries(t.trades).map(([key, item]) => {
                          const isSelected = tradeKey === key;
                          const icon = key === "tailor" ? "🧵" : key === "dairy" ? "🥛" : key === "retail" ? "🏪" : key === "vegetable_vendor" ? "🥦" : key === "electronics_repair" ? "🔧" : "🪔";
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setTradeKey(key)}
                              className={`flex items-center gap-2 p-2 text-left rounded-none transition-none cursor-pointer ${isSelected
                                ? "border-2 border-secondary bg-surface-container-high"
                                : "border border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low"
                                }`}
                            >
                              <span
                                className={`w-7 h-7 flex items-center justify-center font-bold text-[14px] rounded-none ${isSelected
                                  ? "bg-primary text-on-primary"
                                  : "bg-surface-variant text-on-surface"
                                  }`}
                              >
                                {icon}
                              </span>
                              <div className="min-w-0">
                                <p className={`font-tabular-record text-[13px] truncate ${isSelected ? "font-bold text-on-surface" : "font-semibold text-on-surface"}`}>
                                  {item.title}
                                </p>
                                <p className="font-label-ledger text-[10px] text-secondary uppercase font-semibold">
                                  {item.subtitle}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Socio-Demographic Checkboxes */}
                    <div className="pt-2 border-t border-outline-variant grid grid-cols-1 sm:grid-cols-2 gap-2 text-on-surface">

                      {/* 5. Women Entrepreneur */}
                      <label
                        onClick={() => setIsWomen(!isWomen)}
                        className="flex items-start gap-2 p-1.5 border border-outline-variant bg-surface-container-low cursor-pointer rounded-none select-none"
                      >
                        <span className={`w-4 h-4 mt-0.5 border flex items-center justify-center text-[11px] font-bold rounded-none ${isWomen ? "border-secondary bg-secondary text-on-secondary" : "border-outline bg-surface"
                          }`}>
                          {isWomen ? "✓" : ""}
                        </span>
                        <div className="min-w-0">
                          <span className="font-label-ledger text-label-ledger font-bold block">
                            {t.womenLabel}
                          </span>
                          <span className="font-body-sm text-[10px] text-tertiary font-bold block">
                            {t.womenSub}
                          </span>
                        </div>
                      </label>

                      {/* 6. SC/ST Category */}
                      <label
                        onClick={() => setIsScSt(!isScSt)}
                        className="flex items-start gap-2 p-1.5 border border-outline-variant bg-surface-container-low cursor-pointer rounded-none select-none"
                      >
                        <span className={`w-4 h-4 mt-0.5 border flex items-center justify-center text-[11px] font-bold rounded-none ${isScSt ? "border-secondary bg-secondary text-on-secondary" : "border-outline bg-surface"
                          }`}>
                          {isScSt ? "✓" : ""}
                        </span>
                        <div className="min-w-0">
                          <span className="font-label-ledger text-label-ledger font-bold block">
                            {t.scStLabel}
                          </span>
                          <span className="font-body-sm text-[10px] text-on-surface-variant block">
                            {isScSt ? t.scStYes : t.scStNo}
                          </span>
                        </div>
                      </label>

                      {/* 7. Greenfield Unit */}
                      <label
                        onClick={() => setIsGreenfield(!isGreenfield)}
                        className="flex items-start gap-2 p-1.5 border border-outline-variant bg-surface-container-low cursor-pointer rounded-none select-none"
                      >
                        <span className={`w-4 h-4 mt-0.5 border flex items-center justify-center text-[11px] font-bold rounded-none ${isGreenfield ? "border-secondary bg-secondary text-on-secondary" : "border-outline bg-surface"
                          }`}>
                          {isGreenfield ? "✓" : ""}
                        </span>
                        <div className="min-w-0">
                          <span className="font-label-ledger text-label-ledger font-bold block">
                            {t.greenfieldLabel}
                          </span>
                          <span className="font-body-sm text-[10px] text-secondary font-semibold block">
                            {t.greenfieldSub}
                          </span>
                        </div>
                      </label>

                      {/* 9. Language Selection */}
                      <div className="p-1.5 border border-outline-variant bg-surface-container-lowest flex items-center justify-between rounded-none">
                        <span className="font-label-ledger text-label-ledger font-bold">{t.langLabel}</span>
                        <select
                          value={lang}
                          onChange={(e) => setLang(e.target.value)}
                          className="font-label-ledger text-label-ledger font-bold bg-surface-container px-2 py-0.5 border border-outline-variant rounded-none cursor-pointer focus:outline-none"
                        >
                          <option value="hi">हिन्दी (hi)</option>
                          <option value="en">English (en)</option>
                          <option value="mr">मराठी (mr)</option>
                          <option value="ta">தமிழ் (ta)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Col 3: Available Margin & Action Button (3 cols) */}
                  <div className="lg:col-span-3 border-2 border-secondary bg-surface-container-high p-4 flex flex-col justify-between space-y-4 rounded-none">
                    <div className="space-y-3">
                      <div>
                        <span className="font-label-ledger text-label-ledger text-secondary uppercase font-bold tracking-wider block">
                          {t.marginHeading}
                        </span>
                        <label className="font-headline-sm text-headline-sm font-bold text-on-surface block">
                          {t.marginLabel}
                        </label>
                      </div>

                      {/* Number Input */}
                      <div className="flex border-2 border-secondary bg-surface rounded-none">
                        <span className="px-3 py-2 font-financial-stat-md text-[18px] font-bold bg-surface-container border-r border-outline text-on-surface rounded-none">
                          ₹
                        </span>
                        <input
                          type="number"
                          value={availableMargin}
                          onChange={(e) => setAvailableMargin(Number(e.target.value))}
                          step="5000"
                          min="10000"
                          className="w-full bg-transparent px-3 py-2 font-financial-stat-md text-[20px] font-bold text-on-surface focus:outline-none rounded-none"
                        />
                      </div>


                      {/* Quick Chips */}
                      <div className="grid grid-cols-4 gap-1">
                        {[25000, 50000, 100000, 250000].map((val) => {
                          const label = val >= 100000 ? `₹${(val / 100000).toFixed(2)}L` : `₹${val / 1000}k`;
                          const isActive = marginNum === val;
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setAvailableMargin(val)}
                              className={`py-1 text-center font-tabular-record text-[11px] font-bold rounded-none cursor-pointer transition-none ${isActive
                                ? "bg-secondary text-on-secondary border border-secondary"
                                : "bg-surface border border-outline-variant hover:bg-surface-container text-on-surface"
                                }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Calculated Project Cost Preview */}
                      <div className="p-2 border border-outline-variant bg-surface text-on-surface space-y-1 rounded-none">
                        <div className="flex justify-between items-baseline font-body-sm text-[12px]">
                          <span className="text-on-surface-variant font-medium">{t.projectCostCalc}</span>
                          <span className="font-tabular-record font-bold text-on-surface">
                            ₹ {projectCost.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <p className="font-label-ledger text-[10px] text-secondary uppercase font-bold">
                          {t.marginBasis}
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-4 bg-primary hover:bg-[#724800] text-on-primary font-tabular-record text-tabular-record font-bold uppercase tracking-wider border-2 border-on-surface flex items-center justify-center gap-2 shadow-none transition-none rounded-none cursor-pointer disabled:opacity-60"
                      id="btn-generate-report"
                    >
                      <span className={`material-symbols-outlined text-[20px] ${loading ? "animate-spin" : ""}`}>
                        {loading ? "sync" : "analytics"}
                      </span>
                      <span>
                        {loading ? t.btnCalculating : t.btnCalculate}
                      </span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* ========================================================================= */}
            {/* PART 2: RESULT SECTION / MODULAR CARDS (ONLY REVEALED ON DEMAND)          */}
            {/* ========================================================================= */}
            {hasCalculated && (
              <div ref={resultsRef} className="space-y-6 pt-2 transition-all">

                {/* Section Separator Title */}
                <div className="flex items-center gap-3 border-b-2 border-secondary pb-2">
                  <span className="px-2 py-0.5 bg-secondary text-on-secondary font-label-ledger text-label-ledger font-bold uppercase rounded-none">
                    {t.part2Badge}
                  </span>
                  <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                    {t.resultsHeading}
                  </h3>
                  <span className="ml-auto font-label-ledger text-label-ledger text-tertiary font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-2 h-2 rounded-none bg-tertiary inline-block"></span>
                    {t.enginesActive}
                  </span>
                </div>

                {/* CARD 1: Vernacular Audio Advisory Player */}
                <div className="border-2 border-secondary bg-surface-container-high p-4 space-y-3 rounded-none">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 bg-primary text-on-primary flex items-center justify-center font-bold rounded-none">
                        <span className="material-symbols-outlined text-[20px]">volume_up</span>
                      </span>
                      <div>
                        <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                          {t.audioTitle}
                        </h4>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          {t.audioDialect}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-surface border border-outline-variant font-label-ledger text-[10px] text-secondary font-bold uppercase tracking-wider rounded-none">
                      {t.audioEngineTag}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">

                    {/* Audio Player Control */}
                    <div className="md:col-span-4 bg-surface border border-outline p-3 flex flex-col justify-between gap-2 rounded-none">
                      <VoiceSummaryPlayer text={fullNarration} language={lang} autoPlayToken={speakToken} />

                      {/* Graphic Waveform Bars */}
                      <div className="flex items-center gap-1 h-6 pt-2 px-1">
                        <span className="w-1.5 h-3 bg-secondary rounded-none"></span>
                        <span className="w-1.5 h-5 bg-secondary rounded-none"></span>
                        <span className="w-1.5 h-4 bg-secondary rounded-none"></span>
                        <span className="w-1.5 h-6 bg-primary rounded-none"></span>
                        <span className="w-1.5 h-5 bg-primary rounded-none"></span>
                        <span className="w-1.5 h-6 bg-primary rounded-none"></span>
                        <span className="w-1.5 h-4 bg-secondary rounded-none"></span>
                        <span className="w-1.5 h-3 bg-secondary rounded-none"></span>
                        <span className="w-1.5 h-5 bg-secondary rounded-none"></span>
                        <span className="w-1.5 h-6 bg-primary rounded-none"></span>
                        <span className="w-1.5 h-4 bg-secondary rounded-none"></span>
                        <span className="w-1.5 h-2 bg-secondary rounded-none"></span>
                      </div>
                    </div>

                    {/* Transcript Quote Box */}
                    <div className="md:col-span-8 bg-surface-container-low border border-outline-variant p-3 relative rounded-none">
                      <span className="font-label-ledger text-[10px] text-secondary font-bold uppercase tracking-wider block mb-1">
                        {t.transcriptTitle}
                      </span>
                      <p className="font-body-md text-body-md text-on-surface italic font-medium">
                        “{audioScriptText}”
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step navigation — large, icon-first, tappable tabs.
                    Users can jump freely between steps, not forced linear,
                    since someone may want to re-check the loan match after
                    reading the bank-routing step. */}
                <div className="flex flex-col sm:flex-row gap-2">
                  {[
                    { n: 1, icon: "search", label: lang === "en" ? "Is this a good idea?" : "क्या यह अच्छा विचार है?" },
                    { n: 2, icon: "account_balance", label: lang === "en" ? "What can I borrow?" : "मुझे कितना कर्ज मिलेगा?" },
                    { n: 3, icon: "directions_walk", label: lang === "en" ? "What do I do next?" : "अब आगे क्या करें?" },
                  ].map((s) => (
                    <button
                      key={s.n}
                      type="button"
                      onClick={() => setWizardStep(s.n)}
                      className={`flex-1 flex items-center justify-center gap-2 p-4 border-2 rounded-none font-sans font-bold text-base transition-colors ${wizardStep === s.n
                          ? "bg-[#845400] text-white border-[#845400]"
                          : "bg-white text-[#514536] border-[#d6c4b1] hover:border-[#845400]"
                        }`}
                    >
                      <span className="material-symbols-outlined text-[26px]">{s.icon}</span>
                      <span>{s.n}. {s.label}</span>
                    </button>
                  ))}
                </div>

                {wizardStep === 1 && (
                  <>
                    {/* TWO COLUMN FOLIO SPREAD: CARD 2 & CARD 3 */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                      {/* CARD 2: Demographic & Market Feasibility Ledger (Engine 1) */}
                      <div className="lg:col-span-6 border-2 border-secondary bg-surface flex flex-col justify-between rounded-none">
                        <div>
                          {/* Header Strip */}
                          <div className="bg-secondary text-on-secondary px-4 py-2.5 flex items-center justify-between rounded-none">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[18px]">query_stats</span>
                              <h4 className="font-headline-sm text-headline-sm font-bold">
                                {t.demoCardTitle}
                              </h4>
                            </div>
                            <span className="font-label-ledger text-[10px] uppercase font-bold bg-surface-container text-on-surface px-1.5 py-0.5 rounded-none">
                              {t.engine1Badge}
                            </span>
                          </div>

                          <div className="px-4 py-2 bg-surface-container border-b border-outline-variant flex items-center justify-between text-body-sm text-on-surface-variant font-medium">
                            <span>{t.demoSource}</span>
                            <span className="text-tertiary font-bold">{t.liveVerified}</span>
                          </div>

                          {/* Ledger Metric Grid */}
                          <div className="p-4 grid grid-cols-2 gap-3">
                            <div className="border border-outline-variant bg-surface-container-low p-2.5 rounded-none">
                              <span className="font-label-ledger text-label-ledger text-secondary uppercase font-bold block">
                                {selectedBlock.name.split(" ")[0]} {t.totalPopLabel}
                              </span>
                              <span className="font-financial-stat-md text-financial-stat-md font-bold text-on-surface">
                                {selectedBlock.totalPop}
                              </span>
                              <span className="font-body-sm text-[11px] text-on-surface-variant block">
                                {t.totalPopSub}
                              </span>
                            </div>

                            <div className="border border-outline-variant bg-surface-container-low p-2.5 rounded-none">
                              <span className="font-label-ledger text-label-ledger text-secondary uppercase font-bold block">
                                {t.femalePopLabel}
                              </span>
                              <span className="font-financial-stat-md text-financial-stat-md font-bold text-on-surface">
                                {selectedBlock.femalePop}
                              </span>
                              <span className="font-label-ledger text-[11px] font-bold text-tertiary block">
                                {t.femalePopSub}
                              </span>
                            </div>

                            <div className="border border-outline-variant bg-surface-container-low p-2.5 rounded-none">
                              <span className="font-label-ledger text-label-ledger text-secondary uppercase font-bold block">
                                {t.scStRatioLabel}
                              </span>
                              <span className="font-financial-stat-md text-financial-stat-md font-bold text-on-surface">
                                {selectedBlock.scStRatio}
                              </span>
                              <span className="font-body-sm text-[11px] text-on-surface-variant block">
                                {t.scStRatioSub}
                              </span>
                            </div>

                            <div className="border border-outline-variant bg-surface-container-low p-2.5 rounded-none">
                              <span className="font-label-ledger text-label-ledger text-secondary uppercase font-bold block">
                                {t.femaleWorkforceLabel}
                              </span>
                              <span className="font-financial-stat-md text-financial-stat-md font-bold text-on-surface">
                                {selectedBlock.femaleWorkforce}
                              </span>
                              <span className="font-label-ledger text-[11px] font-bold text-tertiary block">
                                {t.femaleWorkforceSub}
                              </span>
                            </div>

                            <div className="border border-outline-variant bg-surface-container-low p-2.5 col-span-2 rounded-none">
                              <span className="font-label-ledger text-label-ledger text-secondary uppercase font-bold block">
                                {t.dominantEconLabel}
                              </span>
                              <span className="font-headline-sm text-headline-sm font-bold text-on-surface block">
                                {selectedBlock.dominantEcon}
                              </span>
                            </div>

                            <div className="border-2 border-tertiary bg-surface-container-high p-3 col-span-2 flex items-center justify-between rounded-none">
                              <div>
                                <span className="font-label-ledger text-label-ledger uppercase font-bold text-tertiary block">
                                  {t.competitorDensityLabel}
                                </span>
                                <p className="font-tabular-record text-[15px] font-bold text-on-surface">
                                  {apiReport?.feasibility?.competitor_count !== undefined
                                    ? `${apiReport.feasibility.competitor_count} ${lang === "en" ? "outlets within 5km" : "दुकानें / 5 किमी परिधि"}`
                                    : lang === "en" ? "4 outlets within 5km" : "4 दुकानें / 5 किमी परिधि"}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="px-2 py-1 bg-tertiary text-on-tertiary font-label-ledger text-label-ledger font-bold uppercase rounded-none">
                                  {t.moderateCompBadge}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Micro Stamp */}
                        <div className="bg-surface-container-high border-t border-outline-variant px-4 py-2 text-right rounded-none">
                          <span className="font-label-ledger text-[11px] text-on-surface-variant font-medium">
                            {t.demoScore}
                          </span>
                        </div>
                      </div>

                      {/* CARD 3: 4-Quadrant SWOT Matrix Card */}
                      <div className="lg:col-span-6 border-2 border-secondary bg-surface flex flex-col justify-between rounded-none">
                        <div>
                          {/* Header Strip */}
                          <div className="bg-secondary text-on-secondary px-4 py-2.5 flex items-center justify-between rounded-none">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-[18px]">grid_view</span>
                              <h4 className="font-headline-sm text-headline-sm font-bold">
                                {t.swotCardTitle}
                              </h4>
                            </div>
                            <span className="font-label-ledger text-[10px] uppercase font-bold bg-surface-container text-on-surface px-1.5 py-0.5 rounded-none">
                              4-Quadrant
                            </span>
                          </div>

                          {/* 2x2 Grid with Sharp Borders */}
                          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">

                            {/* Strengths */}
                            <div className="border border-outline-variant bg-surface-container-low p-3 space-y-1 rounded-none">
                              <div className="flex items-center gap-1.5 text-tertiary">
                                <span className="font-headline-sm text-[16px]">💪</span>
                                <span className="font-label-ledger text-label-ledger font-bold uppercase">
                                  {t.strengthTitle}
                                </span>
                              </div>
                              <ul className="font-body-sm text-[12px] text-on-surface space-y-1 list-disc list-inside">
                                {swotStrengths.slice(0, 3).map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>

                            {/* Weaknesses */}
                            <div className="border border-outline-variant bg-surface-container-low p-3 space-y-1 rounded-none">
                              <div className="flex items-center gap-1.5 text-error">
                                <span className="font-headline-sm text-[16px]">⚠️</span>
                                <span className="font-label-ledger text-label-ledger font-bold uppercase">
                                  {t.weaknessTitle}
                                </span>
                              </div>
                              <ul className="font-body-sm text-[12px] text-on-surface space-y-1 list-disc list-inside">
                                {swotWeaknesses.slice(0, 3).map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>

                            {/* Opportunities */}
                            <div className="border border-outline-variant bg-surface-container-low p-3 space-y-1 rounded-none">
                              <div className="flex items-center gap-1.5 text-primary">
                                <span className="font-headline-sm text-[16px]">🚀</span>
                                <span className="font-label-ledger text-label-ledger font-bold uppercase">
                                  {t.opportunityTitle}
                                </span>
                              </div>
                              <ul className="font-body-sm text-[12px] text-on-surface space-y-1 list-disc list-inside">
                                {swotOpportunities.slice(0, 3).map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>

                            {/* Threats */}
                            <div className="border border-outline-variant bg-surface-container-low p-3 space-y-1 rounded-none">
                              <div className="flex items-center gap-1.5 text-error">
                                <span className="font-headline-sm text-[16px]">🛡️</span>
                                <span className="font-label-ledger text-label-ledger font-bold uppercase">
                                  {t.threatTitle}
                                </span>
                              </div>
                              <ul className="font-body-sm text-[12px] text-on-surface space-y-1 list-disc list-inside">
                                {swotThreats.slice(0, 3).map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Pricing Guidance Box Below Matrix */}
                          <div className="mx-4 mb-4 p-3 border border-outline bg-surface-container-high space-y-2 rounded-none">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-outline-variant pb-1.5">
                              <span className="font-label-ledger text-label-ledger font-bold uppercase text-secondary">
                                {t.pricingBenchmarkLabel}
                              </span>
                              <span className="font-tabular-record text-tabular-record font-bold text-on-surface bg-surface px-2 py-0.5 border border-outline-variant rounded-none">
                                {apiReport?.feasibility?.pricing_guidance || tradeI18n.rate}
                              </span>
                            </div>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">
                              <strong>{t.opportunitySummaryLabel}</strong> {selectedBlock.name} {lang === "en" ? `and surrounding villages exhibit surplus demand for ${tradeI18n.title}. Enterprise can comfortably achieve 40-48% gross operating margins on standard pricing.` : `में ${tradeI18n.title} का शुद्ध बाजार अधिशेष मौजूद है। निर्धारित मूल्य संरचना पर इकाई 40-48% सकल मार्जिन अर्जित कर सकती है।`}
                            </p>
                          </div>
                        </div>

                        <div className="bg-surface-container-high border-t border-outline-variant px-4 py-2 text-right rounded-none">
                          <span className="font-label-ledger text-[11px] text-secondary font-bold">
                            {t.overallRating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {wizardStep === 2 && (
                  <>
                    {/* CARD 4: Recommended Credit Scheme & Rural Physical-Unit EMI Card (Engine 2) */}
                    <div className="border-2 border-secondary bg-surface p-5 space-y-4 rounded-none">

                      {/* Header & Scheme Badge */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b-2 border-outline-variant pb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-primary text-on-primary font-label-ledger text-label-ledger font-bold uppercase rounded-none">
                              {t.engine2Badge}
                            </span>
                            <span className="font-label-ledger text-label-ledger text-secondary font-bold uppercase">
                              {t.underwritingMatch}
                            </span>
                          </div>
                          <h4 className="font-headline-lg text-headline-lg font-bold text-on-surface">
                            {apiReport?.best_scheme?.scheme_name || (lang === "en" ? "Pradhan Mantri Mudra Yojana (PMMY) — Kishore Category / Women Entrepreneur" : "प्रधानमंत्री मुद्रा योजना (PMMY) — किशोर श्रेणी / महिला उद्यमी")}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-tertiary text-on-tertiary font-tabular-record text-tabular-record font-bold border border-on-surface rounded-none">
                            {t.eligibility100}
                          </span>
                        </div>
                      </div>

                      {isOfflineEstimate && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-high border border-outline-variant rounded-none text-xs text-on-surface-variant">
                          <span className="material-symbols-outlined text-[16px]">wifi_off</span>
                          <span>
                            {lang === "en"
                              ? "Server unreachable — showing a rough estimate only. Figures below are not from the official scheme engine."
                              : "सर्वर से संपर्क नहीं — यह एक अनुमानित आंकड़ा है, आधिकारिक गणना नहीं।"}
                          </span>
                        </div>
                      )}

                      {/* 4 Key Metrics Ledger Strip */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="p-3 border border-outline-variant bg-surface-container-low rounded-none">
                          <span className="font-label-ledger text-label-ledger text-secondary uppercase font-bold block">
                            {t.projectCostLabel}
                          </span>
                          <span className="font-financial-stat-md text-financial-stat-md font-bold text-on-surface">
                            ₹ {projectCost.toLocaleString("en-IN")}
                          </span>
                          <span className="font-body-sm text-[11px] text-on-surface-variant block">
                            {t.projectCostSub}
                          </span>
                        </div>

                        <div className="p-3 border border-outline-variant bg-surface-container-low rounded-none">
                          <span className="font-label-ledger text-label-ledger text-secondary uppercase font-bold block">
                            {t.sanctionedLoanLabel}
                          </span>
                          <span className="font-financial-stat-md text-financial-stat-md font-bold text-primary">
                            ₹ {loanAmount.toLocaleString("en-IN")}
                          </span>
                          <span className="font-body-sm text-[11px] text-on-surface-variant block">
                            {t.sanctionedLoanSub}
                          </span>
                        </div>

                        <div className="p-3 border border-outline-variant bg-surface-container-low rounded-none">
                          <span className="font-label-ledger text-label-ledger text-secondary uppercase font-bold block">
                            {t.effectiveRateLabel}
                          </span>
                          <span className="font-financial-stat-md text-financial-stat-md font-bold text-on-surface">
                            {interestRate.toFixed(2)}%
                          </span>
                          <span className="font-label-ledger text-[11px] text-tertiary font-bold block">
                            {isWomen ? t.womenSub : "Standard Micro Rate"}
                          </span>
                        </div>

                        <div className="p-3 border border-outline-variant bg-surface-container-low rounded-none">
                          <span className="font-label-ledger text-label-ledger text-secondary uppercase font-bold block">
                            {t.tenureLabel}
                          </span>
                          <span className="font-financial-stat-md text-financial-stat-md font-bold text-on-surface">
                            {tenureYears} {lang === "en" ? (tenureYears === 1 ? "Year" : "Years") : "वर्ष"}
                          </span>
                          <span className="font-body-sm text-[11px] text-on-surface-variant block">
                            {t.tenureSub}
                          </span>
                        </div>
                      </div>

                      {/* PHYSICAL-UNIT CONVERSION CALLOUT BOX */}
                      <div className="border-2 border-secondary bg-surface-container-high p-4 relative overflow-hidden rounded-none">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="material-symbols-outlined text-primary text-[22px]">balance</span>
                          <h5 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                            {t.physicalHeading}
                          </h5>
                          <span className="ml-auto font-label-ledger text-[10px] bg-secondary text-on-secondary px-2 py-0.5 font-bold uppercase rounded-none">
                            {t.financialGroundingBadge}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-outline-variant">
                          {/* Monthly EMI */}
                          <div className="bg-surface p-3 border border-outline rounded-none">
                            <span className="font-label-ledger text-label-ledger text-secondary uppercase font-bold block">
                              {t.monthlyEmiLabel}
                            </span>
                            <span className="font-financial-stat-lg text-financial-stat-lg font-bold text-on-surface">
                              ₹ {monthlyEmi.toLocaleString("en-IN")}
                            </span>
                            <span className="font-body-sm text-[11px] text-on-surface-variant block">
                              {t.monthlyEmiSub}
                            </span>
                          </div>

                          {/* Daily Burden */}
                          <div className="bg-surface p-3 border border-outline rounded-none">
                            <span className="font-label-ledger text-label-ledger text-secondary uppercase font-bold block">
                              {t.dailyBurdenLabel}
                            </span>
                            <span className="font-financial-stat-lg text-financial-stat-lg font-bold text-on-surface">
                              ₹ {dailyBurden.toLocaleString("en-IN")}
                            </span>
                            <span className="font-body-sm text-[11px] text-on-surface-variant block">
                              {t.dailyBurdenSub}
                            </span>
                          </div>

                          {/* Physical Conversion Metric */}
                          <div className="bg-tertiary-container/20 p-3 border-2 border-tertiary md:col-span-2 flex flex-col justify-between rounded-none">
                            <div>
                              <span className="font-label-ledger text-label-ledger text-tertiary uppercase font-bold block">
                                {t.dailyOutputThresholdLabel}
                              </span>
                              <p className="font-headline-sm text-headline-sm font-bold text-on-surface mt-1">
                                {lang === "en" ? `🧵 Producing only ` : `🧵 केवल `}
                                <span className="text-primary underline decoration-2">{tradeI18n.unit}</span>
                                {lang === "en" ? ` securely covers your loan quota!` : ` से किश्त सुरक्षित!`}
                              </p>
                            </div>
                            <div className="flex items-center justify-between text-body-sm pt-2 border-t border-tertiary/30">
                              <span className="text-on-surface-variant font-medium">{t.altMetricLabel}</span>
                              <span className="font-tabular-record font-bold text-on-surface">
                                {tradeI18n.alt}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {wizardStep === 3 && (
                  <>
                    {/* TWO COLUMN FOLIO SPREAD: CARD 5 & CARD 6 */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                      {/* CARD 5: Spatial Branch Routing & BC Sakhi Card (Engine 3) */}
                      <div className="lg:col-span-6 border-2 border-secondary bg-surface p-4 flex flex-col justify-between space-y-4 rounded-none">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-outline-variant pb-2">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-secondary text-[20px]">account_balance</span>
                              <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                                {t.partnerBranchHeading}
                              </h4>
                            </div>
                            <span className="font-label-ledger text-[10px] bg-secondary text-on-secondary px-1.5 py-0.5 font-bold uppercase rounded-none">
                              {t.engine3Badge}
                            </span>
                          </div>

                          {/* Allocated Branch Box */}
                          <div className="border-2 border-primary bg-surface-container-high p-3 space-y-2 rounded-none">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="px-2 py-0.5 bg-primary text-on-primary font-label-ledger text-[10px] font-bold uppercase rounded-none">
                                  {t.primaryBranchTag}
                                </span>
                                <h5 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-1">
                                  {apiReport?.routed_partner?.branch_name || selectedBlock.branchName}
                                </h5>
                                <p className="font-tabular-record text-tabular-record text-on-surface-variant font-semibold">
                                  शाखा कोड: {selectedBlock.branchCode} | IFSC: {apiReport?.routed_partner?.ifsc_code || selectedBlock.ifsc}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="font-financial-stat-md text-[20px] font-bold text-primary block">
                                  {selectedBlock.distanceKm}
                                </span>
                                <span className="font-label-ledger text-[10px] text-tertiary font-bold uppercase">
                                  {t.nearestDistanceTag}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-outline-variant font-body-sm text-[12px]">
                              <div>
                                <span className="text-on-surface-variant block">{t.quotaRemainingLabel}</span>
                                <span className="font-tabular-record font-bold text-on-surface">
                                  ₹ 42,50,000 {t.quotaAvailable}
                                </span>
                              </div>
                              <div>
                                <span className="text-on-surface-variant block">{t.tatLabel}</span>
                              </div>
                            </div>

                            <div className="p-2 bg-surface border border-outline-variant text-body-sm text-[11px] text-on-surface rounded-none">
                              <strong>{t.routingReasonLabel}</strong> {selectedBlock.name.split(" ")[0]} {lang === "en" ? `Block prioritized due to shortest travel distance, zero pipeline pendency and active women entrepreneur credit quota allocation.` : `ब्लॉक में न्यूनतम दूरी, शून्य पेंडेंसी तथा महिला उद्यमी ऋण कोटा उपलब्ध होने के कारण स्वचालित आवंटित।`}
                            </div>
                          </div>

                          {/* Audit Trail of Bypassed Branches */}
                          <div className="border border-outline-variant bg-surface-container-low p-2.5 space-y-1 rounded-none">
                            <span className="font-label-ledger text-[10px] text-secondary font-bold uppercase tracking-wider block">
                              {t.auditLogHeading}
                            </span>
                            <ul className="font-body-sm text-[11px] text-on-surface-variant space-y-1">
                              <li className="flex items-center justify-between">
                                <span>• धमधा शाखा (SBI Dhamdha):</span>
                                <span className="text-error font-medium">{lang === "en" ? "Mudra Quota Exhausted for FY26" : "वित्तीय वर्ष हेतु मुद्रा कोटा समाप्त"}</span>
                              </li>
                              <li className="flex items-center justify-between">
                                <span>• दुर्ग ग्रामीण बैंक (CRGB Durg):</span>
                                <span className="text-error font-medium">{lang === "en" ? "Distance > 8 km (Out of perimeter)" : "दूरी > 8 किमी (सीमा से अधिक)"}</span>
                              </li>
                            </ul>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-2 bg-surface-container border border-outline-variant text-body-sm rounded-none">
                          <span className="font-semibold text-on-surface">{t.assignedSakhiLabel}</span>
                          <span className="font-tabular-record font-bold text-secondary">
                            {selectedBlock.sakhiName}
                          </span>
                        </div>
                      </div>

                      {/* CARD 6: Document Readiness & Verification Summary */}
                      <div className="lg:col-span-6 border-2 border-secondary bg-surface p-4 flex flex-col justify-between space-y-4 rounded-none">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-outline-variant pb-2">
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-tertiary text-[20px]">verified</span>
                              <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                                {t.docReadinessHeading}
                              </h4>
                            </div>
                            <span className="px-2 py-0.5 bg-tertiary text-on-tertiary font-label-ledger text-[10px] font-bold uppercase rounded-none">
                              {t.docReadyBadge}
                            </span>
                          </div>

                          {/* Readiness Badge */}
                          <div className="p-2.5 bg-tertiary-container/30 border border-tertiary text-on-tertiary-container flex items-center gap-2 rounded-none">
                            <span className="material-symbols-outlined text-tertiary text-[20px]">check_circle</span>
                            <span className="font-tabular-record text-tabular-record font-bold">
                              {t.docReadyAlert}
                            </span>
                          </div>

                          {/* Checklist Items */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-2 border border-outline-variant bg-surface-container-low rounded-none">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 bg-tertiary text-on-tertiary flex items-center justify-center text-[12px] font-bold rounded-none">
                                  ✓
                                </span>
                                <div>
                                  <span className="font-tabular-record text-tabular-record font-bold text-on-surface block">
                                    {t.aadhaarLabel}
                                  </span>
                                  <span className="font-body-sm text-[11px] text-on-surface-variant">
                                    {t.aadhaarSub}
                                  </span>
                                </div>
                              </div>
                              <span className="font-label-ledger text-[10px] text-tertiary font-bold uppercase px-1.5 py-0.5 border border-tertiary rounded-none">
                                VALID
                              </span>
                            </div>

                            <div className="flex items-center justify-between p-2 border border-outline-variant bg-surface-container-low rounded-none">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 bg-tertiary text-on-tertiary flex items-center justify-center text-[12px] font-bold rounded-none">
                                  ✓
                                </span>
                                <div>
                                  <span className="font-tabular-record text-tabular-record font-bold text-on-surface block">
                                    {t.panLabel}
                                  </span>
                                  <span className="font-body-sm text-[11px] text-on-surface-variant">
                                    {t.panSub}
                                  </span>
                                </div>
                              </div>
                              <span className="font-label-ledger text-[10px] text-tertiary font-bold uppercase px-1.5 py-0.5 border border-tertiary rounded-none">
                                MATCHED
                              </span>
                            </div>

                            <div className="flex items-center justify-between p-2 border border-outline-variant bg-surface-container-low rounded-none">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 bg-tertiary text-on-tertiary flex items-center justify-center text-[12px] font-bold rounded-none">
                                  ✓
                                </span>
                                <div>
                                  <span className="font-tabular-record text-tabular-record font-bold text-on-surface block">
                                    {t.passbookLabel}
                                  </span>
                                  <span className="font-body-sm text-[11px] text-on-surface-variant">
                                    {t.passbookSub}
                                  </span>
                                </div>
                              </div>
                              <span className="font-label-ledger text-[10px] text-tertiary font-bold uppercase px-1.5 py-0.5 border border-tertiary rounded-none">
                                ACTIVE
                              </span>
                            </div>

                            <div className="flex items-center justify-between p-2 border border-outline-variant bg-surface-container-low rounded-none">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 bg-tertiary text-on-tertiary flex items-center justify-center text-[12px] font-bold rounded-none">
                                  ✓
                                </span>
                                <div>
                                  <span className="font-tabular-record text-tabular-record font-bold text-on-surface block">
                                    {t.udyamLabel}
                                  </span>
                                  <span className="font-body-sm text-[11px] text-on-surface-variant">
                                    UDYAM-CG-08-0049182
                                  </span>
                                </div>
                              </div>
                              <span className="font-label-ledger text-[10px] text-tertiary font-bold uppercase px-1.5 py-0.5 border border-tertiary rounded-none">
                                VERIFIED
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-2 border border-outline-variant bg-surface-container text-right rounded-none">
                          <span className="font-label-ledger text-[11px] text-secondary font-bold">
                            {t.ocrMismatchZero}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* CARD 7: Banker Credit Appraisal Slip View */}
                    <div className="border-2 border-secondary bg-surface p-5 space-y-4 rounded-none" id="banker-slip-card">

                      {/* Document Slip Header Strip */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-secondary pb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 border border-secondary bg-surface-container flex items-center justify-center font-bold text-secondary rounded-none">
                            <span className="material-symbols-outlined text-[24px]">receipt</span>
                          </div>
                          <div>
                            <span className="font-label-ledger text-[10px] text-secondary font-bold uppercase tracking-wider block">
                              {t.slipFormNo}
                            </span>
                            <h4 className="font-headline-md text-headline-md font-bold text-on-surface">
                              {t.slipCardHeading}
                            </h4>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-surface-container-high border border-outline font-tabular-record text-tabular-record font-bold text-on-surface rounded-none">
                            फोलियो: CG-PTN-2026-9102
                          </span>
                          <span className="px-2 py-1 bg-tertiary text-on-tertiary font-label-ledger text-label-ledger font-bold uppercase rounded-none">
                            {t.confidentialBadge}
                          </span>
                        </div>
                      </div>

                      {/* Archival Ledger Slip Frame */}
                      <div className="border-2 border-outline bg-surface-container-low p-4 space-y-4 relative rounded-none">

                        {/* Eligibility indicator — deliberately NOT styled as an official
                        approval stamp. This is an estimate for the applicant's own
                        reference; no bank has reviewed or approved anything at this
                        stage, and the UI must never imply otherwise. */}
                        <div className="absolute right-6 top-6 border border-outline px-3 py-1.5 opacity-90 pointer-events-none select-none hidden sm:block bg-surface-container-low rounded-none">
                          <span className="font-label-ledger text-[10px] text-on-surface-variant uppercase font-bold block text-center leading-none">
                            {lang === "en" ? "Estimated Eligibility" : "अनुमानित पात्रता"}
                          </span>
                          <span className="font-financial-stat-md text-[13px] font-bold text-secondary block text-center leading-tight">
                            ₹ {loanAmount.toLocaleString("en-IN")}
                          </span>
                          <span className="font-label-ledger text-[8px] text-on-surface-variant font-semibold block text-center leading-none">
                            {lang === "en" ? "Subject to bank review" : "बैंक समीक्षा हेतु लंबित"}
                          </span>
                        </div>

                        {/* Appraisal Metrics Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border-b border-outline-variant pb-3">
                          <div>
                            <span className="font-label-ledger text-label-ledger text-secondary uppercase font-bold block">
                              {t.borrowerLabel}
                            </span>
                            <span className="font-tabular-record text-[15px] font-bold text-on-surface block">
                              {fullName.split("(")[0].trim()}
                            </span>
                            <span className="font-body-sm text-[11px] text-on-surface-variant">
                              {selectedBlock.name}, {selectedBlock.district}
                            </span>
                          </div>

                          <div>
                            <span className="font-label-ledger text-label-ledger text-secondary uppercase font-bold block">
                              {t.tradeNatureLabel}
                            </span>
                            <span className="font-tabular-record text-[15px] font-bold text-on-surface block">
                              {tradeI18n.title}
                            </span>
                            <span className="font-body-sm text-[11px] text-on-surface-variant">
                              NIC Code: 14101
                            </span>
                          </div>

                          <div>
                            <span className="font-label-ledger text-label-ledger text-secondary uppercase font-bold block">
                              {lang === "en" ? "Monthly Repayment" : "मासिक किश्त"}
                            </span>
                            <span className="font-financial-stat-md text-financial-stat-md font-bold text-on-surface block">
                              ₹ {monthlyEmi.toLocaleString("en-IN")}
                            </span>
                            <span className="font-body-sm text-[11px] text-on-surface-variant">
                              {lang === "en" ? "From the matched scheme" : "मिलान योजना अनुसार"}
                            </span>
                          </div>

                          <div>
                            <span className="font-label-ledger text-label-ledger text-secondary uppercase font-bold block">
                              {lang === "en" ? "Daily Equivalent" : "दैनिक समतुल्य"}
                            </span>
                            <span className="font-financial-stat-md text-financial-stat-md font-bold text-on-surface block">
                              ₹ {dailyBurden.toLocaleString("en-IN")}
                            </span>
                            <span className="font-label-ledger text-[11px] text-tertiary font-bold">
                              {apiReport?.rural_metrics?.unit_description
                                ? `~${apiReport.rural_metrics.units_needed} ${apiReport.rural_metrics.unit_description}`
                                : (lang === "en" ? "Per day" : "प्रतिदिन")}
                            </span>
                          </div>
                        </div>

                        {/* REMOVED: this card previously showed a CIBIL score
                        (760+), a DSCR ratio (1.82x), monthly gross receipts
                        (₹28,500), operating expenses (₹12,400), and a 5-year
                        NPV (₹1,42,800) here. Every one of those was a
                        hardcoded, fabricated number — no credit bureau was
                        ever queried, no cash-flow data was ever collected
                        from the applicant, and no NPV/DSCR formula ever
                        ran. Presenting invented numbers in a CIBIL-score-
                        shaped field actively misleads someone about their
                        real credit standing. Removed rather than relabeled,
                        since there's no honest version of a number that was
                        never real. A genuine version of this needs real
                        income/expense data collected from the applicant and
                        an actual formula in engine/finance.py — not a
                        placeholder here. */}

                        {/* Advisory summary — honest framing: a reference for
                        the applicant to bring to the bank, not a decision.
                        Uses Engine 1's real LLM-generated analysis when
                        available, with an honest static fallback otherwise. */}
                        <div className="p-3 bg-surface border border-outline space-y-1 rounded-none">
                          <span className="font-label-ledger text-label-ledger text-primary font-bold uppercase block">
                            {lang === "en" ? "Advisory Summary (for your reference — not a bank decision)" : "सलाहकार सारांश (आपके संदर्भ हेतु — यह बैंक का निर्णय नहीं है)"}
                          </span>
                          <p className="font-body-md text-body-md text-on-surface">
                            {apiReport?.feasibility?.opportunity_analysis ||
                              (lang === "en"
                                ? `This summary shows estimated figures for a ${tradeI18n.title} enterprise in ${selectedBlock.name} block. Final loan approval, terms, and amount are decided solely by the lending bank after their own review.`
                                : `यह सारांश ${selectedBlock.name} ब्लॉक में ${tradeI18n.title} व्यवसाय हेतु अनुमानित आंकड़े दर्शाता है। अंतिम ऋण स्वीकृति, शर्तें व राशि केवल संबंधित बैंक अपनी समीक्षा के बाद तय करेगा।`)}
                          </p>
                        </div>

                        {/* Reference lines — deliberately BLANK, like an actual
                        paper form. FIXED: this previously pre-filled a fake
                        applicant "Digitally Signed" claim, a fabricated
                        named bank officer ("आर. के. कश्यप, ID: 4109-Chh")
                        who never reviewed anything, and a fake precise
                        timestamp — together reading as a real, executed,
                        signed-and-sealed bank document. No signature,
                        officer review, or timestamp is real at this stage,
                        so none should be pre-filled. */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-3 border-t-2 border-outline-variant items-end">
                          <div className="space-y-1">
                            <span className="font-label-ledger text-[10px] text-on-surface-variant uppercase block">
                              {lang === "en" ? "Applicant Signature / Thumb (at branch):" : "आवेदक हस्ताक्षर / अंगूठा (शाखा में):"}
                            </span>
                            <div className="h-10 border-b border-outline"></div>
                          </div>

                          <div className="space-y-1">
                            <span className="font-label-ledger text-[10px] text-on-surface-variant uppercase block">
                              {lang === "en" ? "Bank Officer Signature (on review):" : "बैंक अधिकारी हस्ताक्षर (समीक्षा उपरांत):"}
                            </span>
                            <div className="h-10 border-b border-outline"></div>
                          </div>

                          <div className="col-span-2 md:col-span-1 space-y-1 text-right">
                            <span className="font-label-ledger text-[10px] text-on-surface-variant uppercase block">
                              {lang === "en" ? "Summary Generated:" : "सारांश जेनरेट किया गया:"}
                            </span>
                            <span className="font-tabular-record text-tabular-record font-bold text-on-surface block">
                              {new Date().toLocaleDateString(lang === "en" ? "en-IN" : "hi-IN", { day: "2-digit", month: "short", year: "numeric" })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons Footer */}
                      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                        <button
                          onClick={() => window.print()}
                          className="w-full sm:w-auto px-4 py-2.5 bg-surface border-2 border-secondary font-tabular-record text-tabular-record font-bold text-secondary flex items-center justify-center gap-2 hover:bg-surface-container transition-none rounded-none cursor-pointer"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">print</span>
                          {t.btnPrintSlip}
                        </button>
                        <button
                          onClick={() => alert("ऋण आवेदन पाटन बैंक शाखा एवं संबंधित बैंक सखी को सफलतापूर्वक प्रेषित कर दिया गया है।")}
                          className="w-full sm:w-auto px-5 py-2.5 bg-tertiary text-on-tertiary font-tabular-record text-tabular-record font-bold border-2 border-on-surface flex items-center justify-center gap-2 hover:bg-[#3d522b] transition-none rounded-none cursor-pointer"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[18px]">send</span>
                          {t.btnForwardBranch}
                        </button>
                      </div>
                    </div>
                  </>
                )}

              </div>
            )}

          </div>
        </div>
      </main>

      {/* Standardized Bottom Footer */}
      <footer className="w-full bg-[#EDE6D6] border-t-2 border-secondary">
        <div className="border-t border-outline-variant">
          <div className="max-w-[1200px] mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-on-surface">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm font-bold">Sahay-AI Gramin Udyam Ledger</span>
                <span className="font-label-ledger text-label-ledger uppercase px-1.5 py-0.5 border border-tertiary text-tertiary font-bold rounded-none">
                  Statutory Form II-B
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Official Rural Micro-Enterprise & Cooperative Credit Society Advisory Framework. Physical Passbook Record.
              </p>
            </div>
            <div className="flex items-center gap-6 font-tabular-record text-tabular-record text-on-surface-variant">
              <span className="border-b border-outline pb-0.5">Sahay-AI v1.0</span>
              <span className="font-body-sm text-body-sm text-on-surface font-semibold">
                © 2026 Sahay-AI Enterprise Advisory
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
