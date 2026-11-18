"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { translations } from "../locales/translations";
import Navbar from "../components/Navbar";
import { LeftLotus, RightLotus } from "../components/LotusAccents";

const BANNER_SLIDES = [
  {
    id: "pmegp",
    src: "/pmeg.png",
    alt: "PMEGP - Prime Minister's Employment Generation Programme",
    tabName: { hi: "PMEGP योजना", en: "PMEGP Scheme" },
    title: { hi: "प्रधानमंत्री रोजगार सृजन कार्यक्रम (PMEGP)", en: "Prime Minister's Employment Generation Programme (PMEGP)" },
    subtitle: {
      hi: "ग्रामीण व अर्ध-शहरी क्षेत्रों में नए विनिर्माण (Manufacturing) एवं सेवा उद्यमों की स्थापना हेतु 35% तक सीधी सरकारी सब्सिडी और आसान बैंक ऋण।",
      en: "Credit-linked subsidy scheme offering up to 35% capital subsidy for setting up new micro-enterprises in rural & semi-urban areas."
    },
    badgeLeft: { hi: "35% पूंजीगत सब्सिडी • PMEGP", en: "35% Capital Subsidy • PMEGP" },
    badgeRight: { hi: "अधिकतम ऋण ₹50 लाख // 10% मार्जिन", en: "Max Loan ₹50 Lakh // 10% Margin" },
    features: [
      { icon: "factory", label: { hi: "₹50 लाख तक परियोजना लागत", en: "Up to ₹50 Lakh Project Cost" } },
      { icon: "savings", label: { hi: "35% तक सरकारी सब्सिडी", en: "Up to 35% Govt Subsidy" } },
      { icon: "percent", label: { hi: "केवल 5%-10% स्व-पूंजी मार्जिन", en: "Only 5%-10% Own Margin" } },
      { icon: "verified", label: { hi: "KVIC / DIC द्वारा स्वीकृत", en: "KVIC / DIC Approved" } }
    ],
    link: "/scheme-matcher"
  },
  {
    id: "vishwakarma",
    src: "/vishwa.png",
    alt: "PM Vishwakarma Yojana",
    tabName: { hi: "पीएम विश्वकर्मा", en: "PM Vishwakarma" },
    title: { hi: "पीएम विश्वकर्मा योजना (PM Vishwakarma)", en: "PM Vishwakarma Scheme" },
    subtitle: {
      hi: "18 पारंपरिक व्यवसायों (दर्जी, बढ़ई, लोहार, कुम्हार आदि) के कारीगरों व दस्तकारों हेतु ₹3 लाख तक का संपार्श्विक-मुक्त ऋण केवल 5% रियायती ब्याज पर।",
      en: "Holistic support for 18 traditional trade artisans and craftspersons with collateral-free enterprise credit up to ₹3 Lakh at just 5% interest."
    },
    badgeLeft: { hi: "5% रियायती ब्याज दर • 18 पारंपरिक ट्रेड", en: "5% Concessional Interest • 18 Trades" },
    badgeRight: { hi: "₹3 लाख संपार्श्विक-मुक्त // टूलकिट प्रोत्साहन", en: "₹3 Lakh Collateral-Free // Toolkit Support" },
    features: [
      { icon: "handyman", label: { hi: "18 पारंपरिक शिल्प व व्यवसाय", en: "18 Traditional Crafts & Trades" } },
      { icon: "currency_rupee", label: { hi: "₹3 लाख तक दो चरणों में ऋण", en: "Up to ₹3 Lakh in 2 Tranches" } },
      { icon: "percent", label: { hi: "केवल 5% ब्याज दर (8% उपदान)", en: "Flat 5% Interest (8% Subvention)" } },
      { icon: "build", label: { hi: "₹15,000 टूलकिट ई-वाउचर", en: "₹15,000 Toolkit E-Voucher" } }
    ],
    link: "/scheme-matcher"
  },
  {
    id: "mudra",
    src: "/mudr.png",
    alt: "Pradhan Mantri MUDRA Yojana",
    tabName: { hi: "मुद्रा योजना (PMMY)", en: "MUDRA (PMMY)" },
    title: { hi: "प्रधानमंत्री मुद्रा योजना (PMMY)", en: "Pradhan Mantri MUDRA Yojana (PMMY)" },
    subtitle: {
      hi: "गैर-कृषि सूक्ष्म उद्यमों (दुकान, सिलाई, डेयरी, रिपेयरिंग आदि) हेतु शिशु, किशोर व तरुण श्रेणियों में बिना किसी बैंक गारंटी के ₹10 लाख तक का ऋण।",
      en: "Collateral-free institutional funding up to ₹10 Lakh across Shishu, Kishore, and Tarun categories for non-farm micro enterprises."
    },
    badgeLeft: { hi: "शिशु • किशोर • तरुण // बिना गारंटी", en: "Shishu • Kishore • Tarun // No Collateral" },
    badgeRight: { hi: "₹50,000 से ₹10 लाख // 5 वर्ष अवधि", en: "₹50,000 to ₹10 Lakh // 5 Year Tenure" },
    features: [
      { icon: "storefront", label: { hi: "शिशु, किशोर व तरुण ऋण", en: "Shishu, Kishore & Tarun Tiers" } },
      { icon: "shield_moon", label: { hi: "शून्य बैंक गारंटी (No Collateral)", en: "Zero Collateral Required" } },
      { icon: "account_balance", label: { hi: "सभी सरकारी व ग्रामीण बैंकों में उपलब्ध", en: "Available at All PSBs & RRBs" } },
      { icon: "trending_up", label: { hi: "महिला उद्यमियों को विशेष रियायत", en: "Special Rebate for Women" } }
    ],
    link: "/scheme-matcher"
  },
  {
    id: "standup",
    src: "/StandUp.jpg",
    alt: "Stand-Up India Scheme",
    tabName: { hi: "स्टैंड-अप इंडिया", en: "Stand-Up India" },
    title: { hi: "स्टैंड-अप इंडिया योजना (Stand-Up India)", en: "Stand-Up India Scheme" },
    subtitle: {
      hi: "अनुसूचित जाति (SC), अनुसूचित जनजाति (ST) एवं महिला उद्यमियों द्वारा नवीन (Greenfield) उद्यम स्थापित करने हेतु ₹10 लाख से ₹1 करोड़ तक का बैंक ऋण।",
      en: "Promotes entrepreneurship among Women and SC/ST categories with bank loans between ₹10 Lakh and ₹1 Crore for greenfield projects."
    },
    badgeLeft: { hi: "महिला व SC/ST उद्यमी • नवीन इकाई", en: "Women & SC/ST • Greenfield Unit" },
    badgeRight: { hi: "₹10 लाख से ₹1 करोड़ // 7 वर्ष अवधि", en: "₹10 Lakh to ₹1 Crore // 7 Year Tenure" },
    features: [
      { icon: "female", label: { hi: "महिला व SC/ST हेतु आरक्षित", en: "Dedicated for Women & SC/ST" } },
      { icon: "domain_add", label: { hi: "नवीन इकाई (Greenfield Enterprise)", en: "Greenfield Enterprise Support" } },
      { icon: "account_balance_wallet", label: { hi: "₹10 लाख से ₹1 करोड़ ऋण", en: "₹10 Lakh to ₹1 Crore Loan" } },
      { icon: "calendar_month", label: { hi: "7 वर्ष तक आसान किश्त व छूट", en: "Up to 7 Years Repayment" } }
    ],
    link: "/scheme-matcher"
  },
  {
    id: "svanidhi",
    src: "/Savnidhi.png",
    alt: "PM SVANidhi Scheme",
    tabName: { hi: "पीएम स्वनिधि", en: "PM SVANidhi" },
    title: { hi: "पीएम स्वनिधि योजना (PM SVANidhi)", en: "PM SVANidhi Scheme" },
    subtitle: {
      hi: "रेहड़ी-पटरी विक्रेताओं, सब्जी-फल विक्रेताओं एवं छोटे कारोबारियों हेतु 7% ब्याज सब्सिडी और डिजिटल लेनदेन कैशबैक के साथ ₹50,000 तक कार्यशील पूंजी ऋण।",
      en: "Micro-credit facility for street vendors & micro-retailers offering working capital loans up to ₹50,000 with 7% interest subsidy on timely repayment."
    },
    badgeLeft: { hi: "7% ब्याज अनुदान • डिजिटल कैशबैक", en: "7% Interest Subsidy • Digital Cashback" },
    badgeRight: { hi: "₹10k → ₹20k → ₹50k // आसान संवितरण", en: "₹10k → ₹20k → ₹50k // Instant Credit" },
    features: [
      { icon: "shopping_basket", label: { hi: "रेहड़ी-पटरी व लघु विक्रेता", en: "Street Vendors & Micro Retail" } },
      { icon: "payments", label: { hi: "₹10,000 से ₹50,000 कार्यशील पूंजी", en: "₹10,000 to ₹50,000 Working Capital" } },
      { icon: "redeem", label: { hi: "7% वार्षिक ब्याज सब्सिडी", en: "7% Annual Interest Subsidy" } },
      { icon: "qr_code_scanner", label: { hi: "₹1,200/वर्ष डिजिटल कैशबैक", en: "₹1,200/Yr Digital Cashback" } }
    ],
    link: "/scheme-matcher"
  }
];

const LANGUAGES = [
  { code: "en", label: "English", sub: "Official / Default", native: "English", flag: "🌐" },
  { code: "hi", label: "हिन्दी", sub: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  { code: "mr", label: "मराठी", sub: "Marathi", native: "मराठी", flag: "🇮🇳" },
  { code: "ta", label: "தமிழ்", sub: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
];

const HOME_I18N = {
  en: {
    heroTitle: "Loan Schemes & Business Advice for Rural Entrepreneurs",
    heroSub: "Find out which government loan scheme fits you, how much you can borrow, and whether your business idea will work in your area.",
    changeLang: "Language",
    visionBadge: "National Vision 2047",
    quoteHeading: "“One step towards Viksit Bharat”",
    quoteText: "“When the rural entrepreneur rises with dignity and financial self-reliance, the entire nation moves forward toward a developed India.”",
    servicesEyebrow: "Our Core Services",
    servicesTitle: "Direct Institutional Access",
    schemeCardDesc: "See which loan schemes you qualify for and your monthly payment.",
    schemeCardCta: "Check schemes",
    advisorCardDesc: "Check if your business idea will work in your area before you apply.",
    advisorCardCta: "Check my business idea",
    companionCardDesc: "Track your loan repayment and required documents after approval.",
    companionCardCta: "Open my loan tracker",
    privacyTitle: "Your documents stay private",
    privacyDesc: "Documents are processed on this device only. Nothing sensitive is sent to outside servers.",
    cscCta: "CSC Helpline: 14599"
  },
  hi: {
    heroTitle: "ग्रामीण उद्यमियों हेतु ऋण योजना एवं व्यापार सलाह",
    heroSub: "जानें कि आपके लिए कौन सी सरकारी ऋण योजना उपयुक्त है, आप कितना ऋण ले सकते हैं, और आपका व्यापार विचार आपके क्षेत्र में सफल होगा या नहीं।",
    changeLang: "भाषा",
    visionBadge: "विकसित भारत संकल्प 2047",
    quoteHeading: "“One step towards Viksit Bharat”",
    quoteText: "“जब गाँव का सूक्ष्म उद्यमी आत्मनिर्भरता और सम्मान के साथ आगे बढ़ता है, तभी विकसित भारत का संकल्प साकार होता है।”",
    servicesEyebrow: "सहाय-AI की प्रमुख सेवाएं",
    servicesTitle: "संस्थागत ऋण एवं व्यापार सुविधा",
    schemeCardDesc: "जानें आप किन ऋण योजनाओं के पात्र हैं और आपकी मासिक किश्त कितनी होगी।",
    schemeCardCta: "योजना मिलान करें",
    advisorCardDesc: "आवेदन करने से पहले जानें कि आपका व्यापार विचार आपके क्षेत्र में सफल होगा या नहीं।",
    advisorCardCta: "व्यापार विश्लेषण देखें",
    companionCardDesc: "स्वीकृति के बाद अपनी किश्त और आवश्यक दस्तावेज़ों पर नज़र रखें।",
    companionCardCta: "ऋण साथी खोलें",
    privacyTitle: "आपके दस्तावेज़ सुरक्षित हैं",
    privacyDesc: "आपके दस्तावेज केवल इसी उपकरण पर संसाधित होते हैं। कोई भी संवेदनशील जानकारी बाहरी सर्वर पर नहीं भेजी जाती।",
    cscCta: "सीएससी हेल्पलाइन: 14599"
  },
  mr: {
    heroTitle: "ग्रामीण उद्योजकांसाठी शासकीय कर्ज योजना आणि व्यवसाय सल्ला",
    heroSub: "आपल्यासाठी कोणती शासकीय कर्ज योजना योग्य आहे, किती कर्ज मिळू शकते आणि आपली व्यवसाय कल्पना यशस्वी होईल का ते जाणून घ्या.",
    changeLang: "भाषा",
    visionBadge: "विकसित भारत संकल्प 2047",
    quoteHeading: "“One step towards Viksit Bharat”",
    quoteText: "“जेव्हा ग्रामीण सूक्ष्म उद्योजक स्वाभिमानाने आणि आर्थिक स्वावलंबनाने पुढे येतो, तेव्हाच विकसित भारताचा संकल्प साकार होतो.”",
    servicesEyebrow: "सहाय-AI ची प्रमुख वैशिष्ट्ये",
    servicesTitle: "संस्थात्मक कर्ज आणि व्यवसाय मार्गदर्शन",
    schemeCardDesc: "तुम्ही कोणत्या कर्ज योजनांसाठी पात्र आहात आणि मासिक हप्ता किती असेल ते पहा.",
    schemeCardCta: "योजना तपासा",
    advisorCardDesc: "अर्ज करण्यापूर्वी तुमची व्यवसाय कल्पना स्थानिक भागात चालेल का ते तपासा.",
    advisorCardCta: "व्यवसाय कल्पना तपासा",
    companionCardDesc: "कर्ज मंजुरीनंतर हप्ता परतफेड आणि आवश्यक कागदपत्रांचा मागोवा घ्या.",
    companionCardCta: "कर्ज मित्र उघडा",
    privacyTitle: "तुमची कागदपत्रे पूर्णपणे सुरक्षित आहेत",
    privacyDesc: "कागदपत्रे फक्त याच उपकरणावर प्रक्रिया केली जातात. कोणतीही संवेदनशील माहिती बाहेरील सर्व्हरवर पाठवली जात नाही.",
    cscCta: "सीएससी हेल्पलाइन: 14599"
  },
  ta: {
    heroTitle: "கிராமப்புற தொழில்முனைவோருக்கான கடன் திட்டங்கள் & வணிக ஆலோசனை",
    heroSub: "உங்களுக்கு ஏற்ற அரசு கடன் திட்டம் எது, எவ்வளவு கடன் பெறலாம் மற்றும் உங்கள் தொழில் யோசனை உங்கள் பகுதியில் வெற்றிபெறுமா என்பதை அறியுங்கள்.",
    changeLang: "மொழி",
    visionBadge: "விக்சித் பாரத் தொலைநோக்கு 2047",
    quoteHeading: "“One step towards Viksit Bharat”",
    quoteText: "“கிராமப்புற சிறு தொழில்முனைவோர் சுயமரியாதையுடனும் பொருளாதார தன்னிறைவுடனும் முன்னேறும்போது, ஒட்டுமொத்த தேசமும் வளர்ந்த இந்தியாவை நோக்கி முன்னேறுகிறது.”",
    servicesEyebrow: "சஹாய்-AI இன் முக்கிய சேவைகள்",
    servicesTitle: "நேரடி நிறுவன கடன் மற்றும் தொழில் வழிகாட்டுதல்",
    schemeCardDesc: "நீங்கள் தகுதியான கடன் திட்டங்கள் மற்றும் உங்கள் மாதாந்திர தவணையை அறிந்து கொள்ளுங்கள்.",
    schemeCardCta: "திட்டங்களைச் சரிபார்க்கவும்",
    advisorCardDesc: "விண்ணப்பிக்கும் முன் உங்கள் தொழில் யோசனை உங்கள் பகுதியில் செயல்படுமா என்பதைச் சரிபார்க்கவும்.",
    advisorCardCta: "தொழில் யோசனையை ஆய்வு செய்க",
    companionCardDesc: "கடன் ஒப்புதலுக்குப் பின் மாதாந்திர தவணை மற்றும் ஆவணங்களை கண்காணிக்கவும்.",
    companionCardCta: "கடன் வழிகாட்டியைத் திறக்க",
    privacyTitle: "உங்கள் ஆவணங்கள் பாதுகாப்பாக உள்ளன",
    privacyDesc: "ஆவணங்கள் இந்த சாதனத்தில் மட்டுமே செயலாக்கப்படுகின்றன. வெளி சேவையகங்களுக்கு எந்த ரகசிய தகவலும் அனுப்பப்படுவதில்லை.",
    cscCta: "சி.எஸ்.சி உதவி எண்: 14599"
  }
};

export default function HomePage() {
  // Default to English as requested
  const [lang, setLang] = useState("en");
  const [showLangModal, setShowLangModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const t = translations[lang] || translations.en;
  const homeT = HOME_I18N[lang] || HOME_I18N.en;

  // On page load: everytime someone opens the website (a new session), prompt with centered popup
  useEffect(() => {
    try {
      const sessionChosen = sessionStorage.getItem("sahay-session-chosen");
      const sessionLang = sessionStorage.getItem("sahay-session-lang");
      if (sessionChosen && sessionLang) {
        setLang(sessionLang);
        setShowLangModal(false);
      } else {
        // Fresh opening of the site: default to English, prompt user with language selection popup
        setLang("en");
        setShowLangModal(true);
      }
    } catch (e) {
      setLang("en");
      setShowLangModal(true);
    }

    const handleLangChange = (e) => {
      if (e.detail) {
        setLang(e.detail);
      }
    };
    window.addEventListener("sahay-language-change", handleLangChange);
    return () => window.removeEventListener("sahay-language-change", handleLangChange);
  }, []);

  const handleSelectLanguage = (code) => {
    setLang(code);
    try {
      sessionStorage.setItem("sahay-session-lang", code);
      sessionStorage.setItem("sahay-session-chosen", "true");
      localStorage.setItem("sahay-preferred-lang", code);
      window.dispatchEvent(new CustomEvent("sahay-language-change", { detail: code }));
    } catch (e) {}
    setShowLangModal(false);
  };

  const handleCloseModal = () => {
    try {
      sessionStorage.setItem("sahay-session-lang", lang);
      sessionStorage.setItem("sahay-session-chosen", "true");
      localStorage.setItem("sahay-preferred-lang", lang);
      window.dispatchEvent(new CustomEvent("sahay-language-change", { detail: lang }));
    } catch (e) {}
    setShowLangModal(false);
  };

  // 3-second auto-slide interval
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [isPaused]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? BANNER_SLIDES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
  };

  const activeScheme = BANNER_SLIDES[currentSlide];

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans selection:bg-primary-fixed selection:text-on-primary-fixed relative overflow-hidden">
      <Navbar activePage="home" lang={lang} setLang={setLang} />

      {/* Upper Lotus Flower Accents framing the Hero */}
      <LeftLotus className="absolute -left-6 sm:left-0 top-24 sm:top-28 w-44 sm:w-64 md:w-80 lg:w-[420px] transition-opacity z-0 animate-fade-in pointer-events-none select-none" opacity={0.3} />
      <RightLotus className="absolute -right-8 sm:right-0 top-20 sm:top-24 w-52 sm:w-72 md:w-96 lg:w-[500px] transition-opacity z-0 animate-fade-in pointer-events-none select-none" opacity={0.3} />

      {/* Middle Lotus Flower Accents framing the Services Section */}
      <LeftLotus className="absolute -left-10 md:-left-6 lg:left-0 top-[46%] sm:top-[44%] w-48 sm:w-64 md:w-80 lg:w-[440px] transition-opacity z-0 animate-fade-in pointer-events-none select-none" opacity={0.25} />
      <RightLotus className="absolute -right-12 md:-right-8 lg:right-0 top-[64%] sm:top-[60%] w-56 sm:w-72 md:w-96 lg:w-[480px] transition-opacity z-0 animate-fade-in pointer-events-none select-none" opacity={0.25} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 sm:pt-44 lg:pt-48 pb-36 sm:pb-48 lg:pb-60 relative z-10">

        {/* Hero Top Title with generous breathing room and smooth entrance */}
        <div className="text-center max-w-4xl mx-auto mb-24 sm:mb-32 lg:mb-36 animate-fade-in-up">
          <h1 className="font-libertinus font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-normal tracking-tight text-[#221a10] leading-[1.14] mb-8">
            {homeT.heroTitle}
          </h1>

          <p className="font-sans text-base sm:text-lg lg:text-xl text-[#514536] max-w-2xl mx-auto leading-relaxed mb-8">
            {homeT.heroSub}
          </p>

          {/* Quick Language Switcher Trigger Pill */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => setShowLangModal(true)}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#fbebda]/80 hover:bg-[#fbebda] text-[#845400] border border-[#d6c4b1] rounded-full text-xs font-mono font-medium shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">translate</span>
              <span>{homeT.changeLang}: <strong className="text-[#221a10]">{LANGUAGES.find((l) => l.code === lang)?.native}</strong></span>
              <span className="material-symbols-outlined text-[14px]">expand_more</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* LARGE CINEMATIC SHOWCASE BANNER (Full Div, No Borders, Edge-to-Edge)      */}
        {/* ========================================================================= */}
        <section
          className="mb-32 sm:mb-40 lg:mb-52 flex flex-col gap-6 sm:gap-8 animate-fade-in-up delay-100"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* 1. Main Large Full-Div Banner Container with smooth image cross-fade */}
          <div className="relative w-full h-[320px] sm:h-[420px] md:h-[480px] lg:h-[520px] rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden flex items-center justify-center bg-stone-900">

            {/* Smooth Cross-Fade Image Slider */}
            {BANNER_SLIDES.map((slide, idx) => (
              <img
                key={slide.id}
                src={slide.src}
                alt={slide.alt}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-out ${
                  currentSlide === idx
                    ? "opacity-100 scale-100 z-10"
                    : "opacity-0 scale-105 pointer-events-none z-0"
                }`}
              />
            ))}

            {/* Subtle Gradient Overlay for Bottom Details Contrast */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/85 via-black/35 to-transparent z-20 pointer-events-none" />

            {/* Floating Circular Left Navigation Arrow */}
            <button
              onClick={prevSlide}
              aria-label="Previous Slide"
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white text-stone-900 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-110 z-30 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">chevron_left</span>
            </button>

            {/* Floating Circular Right Navigation Arrow */}
            <button
              onClick={nextSlide}
              aria-label="Next Slide"
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white text-stone-900 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-110 z-30 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">chevron_right</span>
            </button>

            {/* Bottom Floating Information Overlay Inside Banner Frame */}
            <div className="absolute inset-x-0 bottom-4 sm:bottom-6 px-4 sm:px-8 flex items-center justify-between z-30 pointer-events-none text-white text-xs font-mono">

              {/* Bottom Left Pill Badge */}
              <div className="hidden sm:flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full text-white font-bold tracking-wide shadow-md">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>{activeScheme.badgeLeft[lang] || activeScheme.badgeLeft.en || activeScheme.badgeLeft.hi}</span>
              </div>

              {/* Bottom Center Pagination Indicators */}
              <div className="flex items-center gap-2 pointer-events-auto bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md mx-auto sm:mx-0">
                {BANNER_SLIDES.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`transition-all duration-300 cursor-pointer rounded-full ${
                      currentSlide === idx
                        ? "w-7 h-2.5 bg-amber-400"
                        : "w-2.5 h-2.5 bg-white/50 hover:bg-white"
                    }`}
                  />
                ))}
              </div>

              {/* Bottom Right Specification Badge */}
              <div className="hidden md:flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full text-stone-100 font-semibold text-[11px] tracking-wider uppercase shadow-md">
                <span>{activeScheme.badgeRight[lang] || activeScheme.badgeRight.en || activeScheme.badgeRight.hi}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* INSPIRING VIKSIT BHARAT QUOTE SECTION (Spacious and Serene)               */}
        {/* ========================================================================= */}
        <section className="my-28 sm:my-36 lg:my-48 max-w-4xl mx-auto text-center px-4 sm:px-6 animate-fade-in-up delay-200">
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <span className="h-px w-12 bg-[#d6c4b1]"></span>
            <span className="font-mono text-xs uppercase tracking-widest text-[#845400] font-semibold">
              {homeT.visionBadge}
            </span>
            <span className="h-px w-12 bg-[#d6c4b1]"></span>
          </div>

          <h2 className="font-libertinus font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-normal text-[#221a10] tracking-tight leading-tight mb-6 sm:mb-8">
            {homeT.quoteHeading}
          </h2>

          <p className="font-serif italic text-base sm:text-lg lg:text-xl text-[#6b5e50] max-w-3xl mx-auto leading-relaxed">
            {homeT.quoteText}
          </p>
        </section>

        {/* ========================================================================= */}
        {/* THREE SERVICES SECTION HEADER                                             */}
        {/* ========================================================================= */}
        <div className="mt-32 sm:mt-40 lg:mt-48 mb-14 sm:mb-18 text-center max-w-2xl mx-auto animate-fade-in-up delay-300">
          <span className="px-3.5 py-1 bg-[#ffddb5] text-[#845400] text-[11px] sm:text-xs font-mono font-bold uppercase tracking-wider rounded-full inline-block mb-4">
            {homeT.servicesEyebrow}
          </span>
          <h3 className="font-libertinus font-serif text-3xl sm:text-4xl lg:text-[42px] font-normal text-[#221a10] tracking-tight">
            {homeT.servicesTitle}
          </h3>
        </div>

        {/* Three Services Feature Items in Natural 1-2-3 Workflow Order: Business -> Scheme -> Loan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-12 lg:gap-16">

          {/* STEP 1: Business Feasibility / Advisor */}
          <Link
            href="/business-advisor"
            className="group flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 animate-fade-in-up delay-300"
          >
            <div>
              {/* Image Container with rounded corners and subtle shadow */}
              <div className="relative w-full h-56 sm:h-60 lg:h-64 rounded-2xl overflow-hidden bg-stone-100 shadow-xs border border-[#e8dfcf]/60">
                <img
                  src="/business.jpg"
                  alt={t.navAdvisor}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-3 py-1 bg-[#4d6537] text-white text-[11px] font-mono font-bold uppercase rounded-full shadow-md">
                  {lang === "en" ? "Step 1: Business Feasibility" : "चरण 1: व्यवसाय व्यवहार्यता"}
                </span>
              </div>

              {/* Title & Description sitting directly on the page background */}
              <div className="pt-6 pb-3">
                <h3 className="font-libertinus font-serif text-2xl sm:text-[26px] font-normal text-[#221a10] mb-3 group-hover:text-[#4d6537] transition-colors">
                  {t.navAdvisor}
                </h3>
                <p className="text-sm sm:text-base text-[#514536] leading-relaxed font-sans">
                  {homeT.advisorCardDesc}
                </p>
              </div>
            </div>

            {/* Bottom Arrow Action directly on page background */}
            <div className="pt-3 flex items-center text-sm font-bold text-[#4d6537] font-sans group-hover:translate-x-1.5 transition-transform">
              <span>{homeT.advisorCardCta}</span>
              <span className="material-symbols-outlined text-[18px] ml-1.5">arrow_forward</span>
            </div>
          </Link>

          {/* STEP 2: Scheme Matcher */}
          <Link
            href="/scheme-matcher"
            className="group flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 animate-fade-in-up delay-400"
          >
            <div>
              {/* Image Container with rounded corners and subtle shadow */}
              <div className="relative w-full h-56 sm:h-60 lg:h-64 rounded-2xl overflow-hidden bg-stone-100 shadow-xs border border-[#e8dfcf]/60">
                <img
                  src="/Scheme.png"
                  alt={t.navSchemes}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-3 py-1 bg-[#845400] text-white text-[11px] font-mono font-bold uppercase rounded-full shadow-md">
                  {lang === "en" ? "Step 2: Scheme Matcher" : "चरण 2: योजना चयन"}
                </span>
              </div>

              {/* Title & Description sitting directly on the page background */}
              <div className="pt-6 pb-3">
                <h3 className="font-libertinus font-serif text-2xl sm:text-[26px] font-normal text-[#221a10] mb-3 group-hover:text-[#845400] transition-colors">
                  {t.navSchemes}
                </h3>
                <p className="text-sm sm:text-base text-[#514536] leading-relaxed font-sans">
                  {homeT.schemeCardDesc}
                </p>
              </div>
            </div>

            {/* Bottom Arrow Action directly on page background */}
            <div className="pt-3 flex items-center text-sm font-bold text-[#845400] font-sans group-hover:translate-x-1.5 transition-transform">
              <span>{homeT.schemeCardCta}</span>
              <span className="material-symbols-outlined text-[18px] ml-1.5">arrow_forward</span>
            </div>
          </Link>

          {/* STEP 3: Loan Companion */}
          <Link
            href="/companion"
            className="group flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 animate-fade-in-up delay-500"
          >
            <div>
              {/* Image Container with rounded corners and subtle shadow */}
              <div className="relative w-full h-56 sm:h-60 lg:h-64 rounded-2xl overflow-hidden bg-stone-100 shadow-xs border border-[#e8dfcf]/60">
                <img
                  src="/rup.jpg"
                  alt={t.navCompanion}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-3 py-1 bg-[#486172] text-white text-[11px] font-mono font-bold uppercase rounded-full shadow-md">
                  {lang === "en" ? "Step 3: Loan Companion" : "चरण 3: दैनिक ऋण साथी"}
                </span>
              </div>

              {/* Title & Description sitting directly on the page background */}
              <div className="pt-6 pb-3">
                <h3 className="font-libertinus font-serif text-2xl sm:text-[26px] font-normal text-[#221a10] mb-3 group-hover:text-[#486172] transition-colors">
                  {t.navCompanion}
                </h3>
                <p className="text-sm sm:text-base text-[#514536] leading-relaxed font-sans">
                  {homeT.companionCardDesc}
                </p>
              </div>
            </div>

            {/* Bottom Arrow Action directly on page background */}
            <div className="pt-3 flex items-center text-sm font-bold text-[#486172] font-sans group-hover:translate-x-1.5 transition-transform">
              <span>{homeT.companionCardCta}</span>
              <span className="material-symbols-outlined text-[18px] ml-1.5">arrow_forward</span>
            </div>
          </Link>

        </div>

      </main>

      {/* ========================================================================= */}
      {/* CENTERED LANGUAGE SELECTION POPUP MODAL                                   */}
      {/* ========================================================================= */}
      {showLangModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in"
        >
          {/* Backdrop click to dismiss */}
          <div
            className="absolute inset-0"
            onClick={handleCloseModal}
            aria-hidden="true"
          />

          <div
            className="relative w-full max-w-lg bg-[#fffdfa] rounded-3xl shadow-2xl border-2 border-[#d6c4b1] p-6 sm:p-8 z-10 animate-fade-in-up overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Subtle decorative radial gradients */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#ffddb5]/30 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-[#cbe3cb]/30 rounded-full blur-2xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 mb-6 relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#fbebda] border border-[#d6c4b1] flex items-center justify-center text-[#845400] shadow-xs shrink-0">
                  <span className="material-symbols-outlined text-[26px]">translate</span>
                </div>
                <div>
                  <h2 className="font-libertinus font-serif text-2xl sm:text-3xl font-normal text-[#221a10] leading-tight">
                    Select Your Language
                  </h2>
                  <p className="font-sans text-xs sm:text-sm text-[#726250] mt-0.5">
                    अपनी भाषा चुनें • Choose preferred language
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label="Close language selection modal"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Language Selection Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 relative z-10">
              {LANGUAGES.map((item) => {
                const isSelected = lang === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => handleSelectLanguage(item.code)}
                    className={`flex flex-col items-start p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer relative group ${
                      isSelected
                        ? "bg-[#fff5e9] border-[#845400] shadow-sm ring-1 ring-[#845400]"
                        : "bg-white border-[#e8dfcf] hover:border-[#845400]/60 hover:bg-[#fffbf6] hover:shadow-xs"
                    }`}
                  >
                    {/* Active Checkmark Pill */}
                    {isSelected && (
                      <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#845400] text-white flex items-center justify-center shadow-xs">
                        <span className="material-symbols-outlined text-[13px] font-bold">check</span>
                      </span>
                    )}

                    <span className="text-xl mb-1.5">{item.flag}</span>
                    <span className="font-serif text-lg sm:text-xl font-normal text-[#221a10] group-hover:text-[#845400] transition-colors leading-tight">
                      {item.native}
                    </span>
                    <span className="font-sans text-xs text-[#726250] mt-0.5">
                      {item.label} {item.code === "en" ? "(Default)" : ""}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Modal Bottom / Confirmation bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#e8dfcf] relative z-10">
              <span className="text-xs text-[#726250] font-sans text-center sm:text-left">
                Selected: <strong className="text-[#221a10]">{LANGUAGES.find((l) => l.code === lang)?.native}</strong> (Change anytime in top menu)
              </span>

              <button
                type="button"
                onClick={() => handleSelectLanguage(lang)}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#845400] hover:bg-[#6c4400] text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue • आगे बढ़ें</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}