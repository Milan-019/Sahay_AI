"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { translations } from "../locales/translations";
import Navbar from "../components/Navbar";

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

export default function HomePage() {
  const [lang, setLang] = useState("hi");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const t = translations[lang] || translations.hi;

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
    <div className="min-h-screen bg-surface text-on-surface font-sans selection:bg-primary-fixed selection:text-on-primary-fixed">
      <Navbar activePage="home" lang={lang} setLang={setLang} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">

        {/* Hero Top Title */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#221a10] leading-tight mb-4">
            {lang === "en"
              ? "Loan Schemes & Business Advice for Rural Entrepreneurs"
              : "ग्रामीण उद्यमियों हेतु ऋण योजना एवं व्यापार सलाह"}
          </h1>

          <p className="font-sans text-base text-[#514536] max-w-xl mx-auto leading-relaxed">
            {lang === "en"
              ? "Find out which government loan scheme fits you, how much you can borrow, and whether your business idea will work in your area."
              : "जानें कि आपके लिए कौन सी सरकारी ऋण योजना उपयुक्त है, आप कितना ऋण ले सकते हैं, और आपका व्यापार विचार आपके क्षेत्र में सफल होगा या नहीं।"}
          </p>
        </div>

        {/* ========================================================================= */}
        {/* LARGE CINEMATIC SHOWCASE BANNER (Full Div, No Borders, Edge-to-Edge)      */}
        {/* ========================================================================= */}
        <section
          className="mb-14 flex flex-col gap-4"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* 1. Main Large Full-Div Banner Container (No borders, 100% full cover) */}
          <div className="relative w-full h-[320px] sm:h-[420px] md:h-[480px] lg:h-[520px] rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden flex items-center justify-center bg-stone-900">

            {/* Main High-Resolution Banner Image filling 100% of the div */}
            <img
              key={activeScheme.src}
              src={activeScheme.src}
              alt={activeScheme.alt}
              className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out"
            />

            {/* Subtle Gradient Overlay for Bottom Details Contrast */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/85 via-black/35 to-transparent z-20 pointer-events-none" />

            {/* Floating Circular Left Navigation Arrow */}
            <button
              onClick={prevSlide}
              aria-label="Previous Slide"
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white text-stone-900 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-md transition-all duration-200 hover:scale-110 z-30 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">chevron_left</span>
            </button>

            {/* Floating Circular Right Navigation Arrow */}
            <button
              onClick={nextSlide}
              aria-label="Next Slide"
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 hover:bg-white text-stone-900 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-md transition-all duration-200 hover:scale-110 z-30 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">chevron_right</span>
            </button>

            {/* Bottom Floating Information Overlay Inside Banner Frame */}
            <div className="absolute inset-x-0 bottom-4 sm:bottom-6 px-4 sm:px-8 flex items-center justify-between z-30 pointer-events-none text-white text-xs font-mono">

              {/* Bottom Left Pill Badge */}
              <div className="hidden sm:flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full text-white font-bold tracking-wide shadow-md">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>{activeScheme.badgeLeft[lang] || activeScheme.badgeLeft.hi}</span>
              </div>

              {/* Bottom Center Pagination Indicators */}
              <div className="flex items-center gap-2 pointer-events-auto bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md mx-auto sm:mx-0">
                {BANNER_SLIDES.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`transition-all duration-300 cursor-pointer rounded-full ${currentSlide === idx
                      ? "w-7 h-2.5 bg-amber-400"
                      : "w-2.5 h-2.5 bg-white/50 hover:bg-white"
                      }`}
                  />
                ))}
              </div>

              {/* Bottom Right Specification Badge */}
              <div className="hidden md:flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full text-stone-100 font-semibold text-[11px] tracking-wider uppercase shadow-md">
                <span>{activeScheme.badgeRight[lang] || activeScheme.badgeRight.hi}</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. UNDER-THE-IMAGE SCHEME DETAILS STRIP (Updates Every 3 Seconds)         */}
          {/* ========================================================================= */}
          <div className="bg-[#fff8f3] rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-sm flex flex-col gap-5 transition-all duration-500">

            {/* Top Scheme Name & Action Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#d6c4b1]/60">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-[#845400] text-white text-[11px] font-mono font-bold uppercase tracking-wider rounded-full">
                    {lang === "en" ? "Active Scheme Details" : "वर्तमान चयनित योजना"}
                  </span>
                  <span className="text-xs font-mono text-[#845400] font-semibold">
                    [ {currentSlide + 1} of {BANNER_SLIDES.length} • Auto 3s ]
                  </span>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl font-black text-[#221a10] tracking-tight">
                  {activeScheme.title[lang] || activeScheme.title.hi}
                </h2>

                <p className="font-sans text-sm sm:text-base text-[#514536] max-w-3xl leading-relaxed">
                  {activeScheme.subtitle[lang] || activeScheme.subtitle.hi}
                </p>
              </div>

              {/* Primary Call to Action Button */}
              <div className="flex-shrink-0">
                <Link
                  href={activeScheme.link}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#845400] hover:bg-[#6b4400] text-white text-sm font-mono font-bold uppercase tracking-wider transition-all rounded-xl shadow-md hover:shadow-lg"
                >
                  <span>{lang === "en" ? "Check Eligibility & EMI" : "पात्रता व किश्त जांचें"}</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* Bottom 4 Feature Highlight Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {activeScheme.features.map((feat, idx) => (
                <div
                  key={idx}
                  className="bg-white hover:bg-[#fffae8] p-3.5 rounded-xl flex items-center gap-3 transition-colors shadow-xs"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#ffddb5] text-[#845400] flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[20px]">{feat.icon}</span>
                  </div>
                  <span className="font-sans text-xs sm:text-sm font-bold text-[#221a10] leading-snug">
                    {feat.label[lang] || feat.label.hi}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Scheme Jump Selector Ribbon */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#d6c4b1]/40 text-xs font-mono">
              <span className="text-[#845400] font-bold">
                {lang === "en" ? "Quick Schemes:" : "त्वरित योजना चयन:"}
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {BANNER_SLIDES.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlide(idx)}
                    className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${currentSlide === idx
                      ? "bg-[#845400] text-white shadow-xs"
                      : "bg-white text-[#514536] hover:bg-[#fbebda] shadow-2xs"
                      }`}
                  >
                    {slide.tabName[lang] || slide.tabName.hi}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* Three Services Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          <Link
            href="/scheme-matcher"
            className="bg-white border border-[#d6c4b1] hover:border-[#845400] p-7 rounded-none transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-none bg-[#ffddb5] text-[#845400] flex items-center justify-center mb-5 border border-[#d6c4b1]">
                <span className="material-symbols-outlined text-[28px]">account_balance</span>
              </div>
              <h2 className="font-serif text-xl font-bold text-[#221a10] mb-2">
                {t.navSchemes}
              </h2>
              <p className="text-sm text-[#514536] leading-relaxed mb-5 font-sans">
                {lang === "en"
                  ? "See which loan schemes you qualify for and your monthly payment."
                  : "जानें आप किन ऋण योजनाओं के पात्र हैं और आपकी मासिक किश्त कितनी होगी।"}
              </p>
            </div>
            <div className="flex items-center text-sm font-bold text-[#845400] font-sans">
              <span>{lang === "en" ? "Check schemes" : "योजना मिलान करें"}</span>
              <span className="material-symbols-outlined text-[18px] ml-1">arrow_forward</span>
            </div>
          </Link>

          <Link
            href="/business-advisor"
            className="bg-white border border-[#d6c4b1] hover:border-[#4d6537] p-7 rounded-none transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-none bg-[#cfecb1] text-[#4d6537] flex items-center justify-center mb-5 border border-[#d6c4b1]">
                <span className="material-symbols-outlined text-[28px]">trending_up</span>
              </div>
              <h2 className="font-serif text-xl font-bold text-[#221a10] mb-2">
                {t.navAdvisor}
              </h2>
              <p className="text-sm text-[#514536] leading-relaxed mb-5 font-sans">
                {lang === "en"
                  ? "Check if your business idea will work in your area before you apply."
                  : "आवेदन करने से पहले जानें कि आपका व्यापार विचार आपके क्षेत्र में सफल होगा या नहीं।"}
              </p>
            </div>
            <div className="flex items-center text-sm font-bold text-[#4d6537] font-sans">
              <span>{lang === "en" ? "Check my business idea" : "व्यापार विश्लेषण देखें"}</span>
              <span className="material-symbols-outlined text-[18px] ml-1">arrow_forward</span>
            </div>
          </Link>

          <Link
            href="/companion"
            className="bg-white border border-[#d6c4b1] hover:border-[#486172] p-7 rounded-none transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-none bg-[#cce6fa] text-[#486172] flex items-center justify-center mb-5 border border-[#d6c4b1]">
                <span className="material-symbols-outlined text-[28px]">handshake</span>
              </div>
              <h2 className="font-serif text-xl font-bold text-[#221a10] mb-2">
                {t.navCompanion}
              </h2>
              <p className="text-sm text-[#514536] leading-relaxed mb-5 font-sans">
                {lang === "en"
                  ? "Track your loan repayment and required documents after approval."
                  : "स्वीकृति के बाद अपनी किश्त और आवश्यक दस्तावेज़ों पर नज़र रखें।"}
              </p>
            </div>
            <div className="flex items-center text-sm font-bold text-[#486172] font-sans">
              <span>{lang === "en" ? "Open my loan tracker" : "ऋण साथी खोलें"}</span>
              <span className="material-symbols-outlined text-[18px] ml-1">arrow_forward</span>
            </div>
          </Link>

        </div>

        {/* Footer notice — kept (the privacy point is genuinely
            important), but without an unverified specific legal
            citation and with the CORRECT CSC helpline number
            (verified against the Dept. of Telecommunications' own
            short-code allocation — the figure previously here,
            1800-202-0044, was not the real CSC helpline and would
            have sent someone calling for help nowhere). */}
        <div className="mt-14 bg-[#fbebda] border border-[#d6c4b1] rounded-none p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#845400] text-[24px]">shield</span>
            <div>
              <p className="font-serif font-bold text-sm text-[#221a10]">
                {lang === "en" ? "Your documents stay private" : "आपके दस्तावेज़ सुरक्षित हैं"}
              </p>
              <p className="font-sans text-xs text-[#514536]">
                {lang === "en"
                  ? "Documents are processed on this device only. Nothing sensitive is sent to outside servers."
                  : "आपके दस्तावेज केवल इसी उपकरण पर संसाधित होते हैं। कोई भी संवेदनशील जानकारी बाहरी सर्वर पर नहीं भेजी जाती।"}
              </p>
            </div>
          </div>
          <a
            href="tel:14599"
            className="text-xs font-mono font-bold text-[#845400] bg-white px-4 py-2 rounded-none border border-[#d6c4b1] whitespace-nowrap hover:border-[#845400] transition-colors"
          >
            {lang === "en" ? "CSC Helpline: 14599" : "सीएससी हेल्पलाइन: 14599"}
          </a>
        </div>

      </main>
    </div>
  );
}