"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LeftLotus, RightLotus } from "./LotusAccents";

const FOOTER_I18N = {
  en: {
    ministry: "Ministry of MSME & Rural Development • Government of India",
    headlineMain: "Made for every Indian,",
    headlinePrefix: "wherever",
    headlineItalic: "they are.",
    subtext: "For every rural micro-entrepreneur, wherever they may be.",
    inputPlaceholder: "ENTER MOBILE OR AADHAAR",
    inputSubmitted: "THANK YOU • धन्यवाद",
    colServicesTitle: "Services",
    colToolsTitle: "Tools",
    colHelpTitle: "Help",
    navSchemeMatcher: "Scheme matcher",
    navBusinessAdvisor: "Business advisor",
    navLoanCompanion: "Loan companion",
    navDocReadiness: "Document readiness",
    toolEmiCalc: "Fee & EMI calculator",
    toolBranchRouter: "Spatial branch router",
    toolAppraisalSlip: "Banker appraisal slip",
    toolDigilocker: "DigiLocker sync",
    helpHelpline: "Helpline 14599",
    helpZeroPii: "Zero-PII guarantee",
    helpForm: "Statutory Form II-B",
    helpPrivacy: "Privacy policy",
    copyright: "© 2026 Sahay-AI • Rural Credit Navigation Platform",
    guidelines: "Government of India Guidelines Aligned",
    certified: "CSC-VERIFIED (Form II-B Compliant)"
  },
  hi: {
    ministry: "सूक्ष्म, लघु एवं मध्यम उद्यम तथा ग्रामीण विकास मंत्रालय • भारत सरकार",
    headlineMain: "हर भारतीय के लिए निर्मित,",
    headlinePrefix: "जहाँ भी",
    headlineItalic: "वे हों।",
    subtext: "हर ग्रामीण सूक्ष्म उद्यमी के लिए, जहाँ भी वे हों।",
    inputPlaceholder: "मोबाइल अथवा आधार संख्या दर्ज करें",
    inputSubmitted: "धन्यवाद • THANK YOU",
    colServicesTitle: "सेवाएं",
    colToolsTitle: "उपकरण",
    colHelpTitle: "सहायता",
    navSchemeMatcher: "योजना मिलान (Scheme Matcher)",
    navBusinessAdvisor: "व्यवसाय सलाहकार (Advisor)",
    navLoanCompanion: "ऋण साथी (Companion)",
    navDocReadiness: "दस्तावेज़ सत्यापन (Readiness)",
    toolEmiCalc: "शुल्क एवं किश्त कैलकुलेटर",
    toolBranchRouter: "निकटतम बैंक नेविगेटर",
    toolAppraisalSlip: "बैंक प्रबंधक प्रोजेक्ट स्लिप",
    toolDigilocker: "डिजीलॉकर सत्यापन",
    helpHelpline: "हेल्पलाइन 14599",
    helpZeroPii: "शून्य-डेटा गोपनीयता गारंटी",
    helpForm: "वैधानिक प्रपत्र II-B",
    helpPrivacy: "गोपनीयता नीति",
    copyright: "© 2026 सहाय-AI • ग्रामीण ऋण नेविगेशन मंच",
    guidelines: "भारत सरकार के दिशानिर्देशों के अनुरूप",
    certified: "सीएससी-सत्यापित (प्रपत्र II-B अनुपालित)"
  },
  mr: {
    ministry: "सूक्ष्म, लघु आणि मध्यम उद्योग व ग्रामीण विकास मंत्रालय • भारत सरकार",
    headlineMain: "प्रत्येक भारतीयासाठी निर्मित,",
    headlinePrefix: "जिथे",
    headlineItalic: "ते असतील.",
    subtext: "प्रत्येक ग्रामीण सूक्ष्म उद्योजकासाठी, ते जिथे असतील तिथे.",
    inputPlaceholder: "मोबाइल किंवा आधार क्रमांक प्रविष्ट करा",
    inputSubmitted: "धन्यवाद • THANK YOU",
    colServicesTitle: "सेवा",
    colToolsTitle: "साधने",
    colHelpTitle: "मदत",
    navSchemeMatcher: "योजना निवड (Scheme Matcher)",
    navBusinessAdvisor: "व्यवसाय सल्लागार (Advisor)",
    navLoanCompanion: "कर्ज मित्र (Companion)",
    navDocReadiness: "कागदपत्र पडताळणी (Readiness)",
    toolEmiCalc: "शुल्क व हप्ता कॅल्क्युलेटर",
    toolBranchRouter: "जवळची बँक शाखा मार्गदर्शक",
    toolAppraisalSlip: "बँक व्यवस्थापक प्रकल्प स्लिप",
    toolDigilocker: "डिजीलॉकर पडताळणी",
    helpHelpline: "हेल्पलाइन 14599",
    helpZeroPii: "शून्य-डेटा गोपनीयता हमी",
    helpForm: "वैधानिक प्रपत्र II-B",
    helpPrivacy: "गोपनीयता धोरण",
    copyright: "© 2026 सहाय-AI • ग्रामीण कर्ज नेव्हिगेशन मंच",
    guidelines: "भारत सरकार मार्गदर्शक तत्त्वांनुसार",
    certified: "सीएससी-पडताळलेले (प्रपत्र II-B सुसंगत)"
  },
  ta: {
    ministry: "சிறு, குறு மற்றும் நடுத்தர தொழில் & கிராமப்புற மேம்பாட்டு அமைச்சகம் • இந்திய அரசு",
    headlineMain: "ஒவ்வொரு இந்தியருக்காகவும் உருவாக்கப்பட்டது,",
    headlinePrefix: "எங்கு",
    headlineItalic: "அவர்கள் இருந்தாலும்.",
    subtext: "ஒவ்வொரு கிராமப்புற சிறு தொழில்முனைவோருக்கும், அவர்கள் எங்கிருந்தாலும்.",
    inputPlaceholder: "மொபைல் அல்லது ஆதார் எண்ணை உள்ளிடவும்",
    inputSubmitted: "நன்றி • THANK YOU",
    colServicesTitle: "சேவைகள்",
    colToolsTitle: "கருவிகள்",
    colHelpTitle: "உதவி",
    navSchemeMatcher: "திட்ட தேர்வு (Scheme Matcher)",
    navBusinessAdvisor: "தொழில் வழிகாட்டி (Advisor)",
    navLoanCompanion: "கடன் தோழன் (Companion)",
    navDocReadiness: "ஆவண சரிபார்ப்பு (Readiness)",
    toolEmiCalc: "கட்டணம் & EMI கால்குலேட்டர்",
    toolBranchRouter: "வங்கி கிளை வழிசெலுத்தல்",
    toolAppraisalSlip: "வங்கி மேலாளர் அறிக்கை",
    toolDigilocker: "டிஜிலாக்கர் இணைப்பு",
    helpHelpline: "உதவி எண் 14599",
    helpZeroPii: "பூஜ்ஜிய-தரவு தனியுரிமை உத்தரவாதம்",
    helpForm: "சட்டப்பூர்வ படிவம் II-B",
    helpPrivacy: "தனியுரிமைக் கொள்கை",
    copyright: "© 2026 சஹாய்-AI • கிராமப்புற கடன் வழிகாட்டி தளம்",
    guidelines: "இந்திய அரசு வழிகாட்டுதல்களுக்கு உட்பட்டது",
    certified: "சி.எஸ்.சி சரிபார்க்கப்பட்டது (படிவம் II-B)"
  }
};

const FOOTER_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "mr", label: "मराठी" },
  { code: "ta", label: "தமிழ்" },
];

export default function Footer({ lang: propLang, setLang: propSetLang }) {
  const [internalLang, setInternalLang] = useState("en");
  const lang = propLang || internalLang;
  const [inputValue, setInputValue] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("sahay-session-lang") || localStorage.getItem("sahay-preferred-lang");
      if (stored) {
        setInternalLang(stored);
      }
    } catch (e) {}

    const handleLangChange = (e) => {
      if (e.detail) {
        setInternalLang(e.detail);
      }
    };

    window.addEventListener("sahay-language-change", handleLangChange);
    return () => window.removeEventListener("sahay-language-change", handleLangChange);
  }, []);

  const handleToggleLang = (code) => {
    setInternalLang(code);
    if (propSetLang) {
      propSetLang(code);
    }
    try {
      sessionStorage.setItem("sahay-session-lang", code);
      sessionStorage.setItem("sahay-session-chosen", "true");
      localStorage.setItem("sahay-preferred-lang", code);
      window.dispatchEvent(new CustomEvent("sahay-language-change", { detail: code }));
    } catch (e) {}
  };

  const t = FOOTER_I18N[lang] || FOOTER_I18N.en;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <footer className="w-full bg-[#fbf8ee] border-t border-[#e8dfcf] text-[#1e293b] pt-12 sm:pt-16 lg:pt-20 overflow-hidden relative mt-auto">
      {/* Decorative Botanical Lotus Accents in the Footer Sky */}
      <LeftLotus className="absolute -left-10 -top-8 w-60 sm:w-72 md:w-88 pointer-events-none select-none z-0" opacity={0.2} />
      <RightLotus className="absolute -right-12 -top-10 w-72 sm:w-88 md:w-[420px] pointer-events-none select-none z-0" opacity={0.2} />

      {/* Top Content Area - Laid out in the open sky above the monuments */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start relative z-10">

        {/* Left Column: Official Identity, Serif Statement, and Pill Input */}
        <div className="lg:col-span-6 flex flex-col justify-start">
          {/* Logo & Government Affiliation */}
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-sm flex items-center justify-center">
              <img src="/S_logo.png" alt="Sahay Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg text-[#1e293b] block leading-tight">
                Sahay-AI • सहायता
              </span>
              <span className="text-[11px] text-[#6b5e50] block tracking-wide">
                {t.ministry}
              </span>
            </div>
          </Link>

          {/* Inspiring Statement Matching Reference */}
          <h2 className="mt-7 font-serif text-3xl sm:text-4xl lg:text-[44px] text-[#1e293b] font-normal leading-[1.18] tracking-tight">
            {t.headlineMain}<br />
            {t.headlinePrefix} <span className="italic font-serif">{t.headlineItalic}</span>
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#736555] font-sans">
            {t.subtext}
          </p>

          {/* Pill Input with Circle Arrow Button */}
          <form onSubmit={handleSubmit} className="mt-6 flex items-center w-full max-w-sm bg-white rounded-full border border-[#d8cdbc] shadow-xs pl-5 pr-1.5 py-1.5 focus-within:border-[#1e293b] focus-within:ring-2 focus-within:ring-[#1e293b]/10 transition-all">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={submitted ? t.inputSubmitted : t.inputPlaceholder}
              className="w-full bg-transparent text-[11px] sm:text-xs tracking-wider uppercase font-sans text-[#1e293b] placeholder-[#8c7f70] outline-none"
            />
            <button
              type="submit"
              aria-label="Submit"
              className="w-8 h-8 rounded-full bg-[#1e293b] hover:bg-[#0f172a] text-white flex items-center justify-center shrink-0 transition-transform hover:scale-105 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">
                {submitted ? "check" : "arrow_forward"}
              </span>
            </button>
          </form>
        </div>

        {/* Right Column: 3 Link Columns + Language Pill */}
        <div className="lg:col-span-6 flex flex-col justify-between h-full pt-1">
          {/* Minimalist Navigation Columns */}
          <div className="grid grid-cols-3 gap-6 sm:gap-8">
            <div>
              <h4 className="text-xs font-bold text-[#1e293b] uppercase tracking-wider mb-3">
                {t.colServicesTitle}
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-[#524638]">
                <li>
                  <Link href="/scheme-matcher" className="hover:text-[#1e293b] hover:underline transition-colors block">
                    {t.navSchemeMatcher}
                  </Link>
                </li>
                <li>
                  <Link href="/business-advisor" className="hover:text-[#1e293b] hover:underline transition-colors block">
                    {t.navBusinessAdvisor}
                  </Link>
                </li>
                <li>
                  <Link href="/companion" className="hover:text-[#1e293b] hover:underline transition-colors block">
                    {t.navLoanCompanion}
                  </Link>
                </li>
                <li>
                  <Link href="/scheme-matcher" className="hover:text-[#1e293b] hover:underline transition-colors block">
                    {t.navDocReadiness}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-[#1e293b] uppercase tracking-wider mb-3">
                {t.colToolsTitle}
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-[#524638]">
                <li>
                  <Link href="/scheme-matcher" className="hover:text-[#1e293b] hover:underline transition-colors block">
                    {t.toolEmiCalc}
                  </Link>
                </li>
                <li>
                  <Link href="/business-advisor" className="hover:text-[#1e293b] hover:underline transition-colors block">
                    {t.toolBranchRouter}
                  </Link>
                </li>
                <li>
                  <Link href="/business-advisor" className="hover:text-[#1e293b] hover:underline transition-colors block">
                    {t.toolAppraisalSlip}
                  </Link>
                </li>
                <li>
                  <Link href="/scheme-matcher" className="hover:text-[#1e293b] hover:underline transition-colors block">
                    {t.toolDigilocker}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-[#1e293b] uppercase tracking-wider mb-3">
                {t.colHelpTitle}
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-[#524638]">
                <li>
                  <a href="tel:14599" className="hover:text-[#1e293b] hover:underline transition-colors block">
                    {t.helpHelpline}
                  </a>
                </li>
                <li>
                  <span className="text-[#524638] block cursor-default">
                    {t.helpZeroPii}
                  </span>
                </li>
                <li>
                  <span className="text-[#524638] block cursor-default">
                    {t.helpForm}
                  </span>
                </li>
                <li>
                  <span className="text-[#524638] block cursor-default">
                    {t.helpPrivacy}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Language Switcher Pill with all 4 Languages: English, हिन्दी, मराठी, தமிழ் */}
          <div className="mt-8 sm:mt-10 flex justify-start lg:justify-end">
            <div className="inline-flex items-center bg-white border border-[#d8cdbc] rounded-full p-1 shadow-2xs flex-wrap gap-1">
              {FOOTER_LANGUAGES.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleToggleLang(item.code)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    lang === item.code
                      ? "bg-[#1e293b] text-white shadow-xs"
                      : "text-[#524638] hover:text-[#1e293b] hover:bg-stone-100"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Unobstructed Indian National Heritage Skyline Illustration Across the Bottom */}
      <div className="w-full mt-6 sm:mt-8 lg:mt-10 flex items-end justify-center select-none pointer-events-none relative z-0">
        <img
          src="/footer-monuments.png"
          alt="Indian National Heritage Monuments Skyline - Gateway of India, Taj Mahal, Red Fort, India Gate, Golden Temple"
          className="w-full max-w-7xl h-auto object-contain object-bottom block"
          loading="lazy"
        />
      </div>

      {/* Maroon Base Bar Matching Artwork Baseline */}
      <div className="w-full bg-[#611d32] py-2.5 px-4 text-[11px] text-white/90 text-center flex flex-wrap items-center justify-center gap-x-5 gap-y-1 relative z-10">
        <span>{t.copyright}</span>
        <span className="text-white/40">•</span>
        <span>{t.guidelines}</span>
        <span className="text-white/40">•</span>
        <span className="text-[#a7f3d0] font-semibold">{t.certified}</span>
      </div>
    </footer>
  );
}