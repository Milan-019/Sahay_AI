"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

const NAVBAR_I18N = {
  hi: {
    appTitle: "सहाय",
    subTitle: "Sahay-AI",
    folio: "Khatiyan Folio: 2024-SU/RUR-9021",
    navHome: "होम (Home)",
    nav1: "1. योजना चयन (Scheme Matcher)",
    nav2: "2. व्यापार सलाहकार (Business Advisor)",
    nav3: "3. ऋण साथी (Companion)",
    cscHelpline: "CSC हेल्पलाइन",
    phone: "1800-202-0044",
  },
  mr: {
    appTitle: "सहाय",
    subTitle: "Sahay-AI",
    folio: "Khatiyan Folio: 2024-SU/RUR-9021",
    navHome: "मुख्यपृष्ठ (Home)",
    nav1: "1. योजना निवड (Scheme Matcher)",
    nav2: "2. व्यवसाय सल्लागार (Business Advisor)",
    nav3: "3. कर्ज मित्र (Companion)",
    cscHelpline: "CSC हेल्पलाइन",
    phone: "1800-202-0044",
  },
  ta: {
    appTitle: "सहाय",
    subTitle: "Sahay-AI",
    folio: "Khatiyan Folio: 2024-SU/RUR-9021",
    navHome: "முகப்பு (Home)",
    nav1: "1. திட்ட தேர்வு (Scheme Matcher)",
    nav2: "2. வணிக ஆலோசகர் (Business Advisor)",
    nav3: "3. கடன் தோழன் (Companion)",
    cscHelpline: "CSC உதவி எண்",
    phone: "1800-202-0044",
  },
  en: {
    appTitle: "Sahay",
    subTitle: "Sahay-AI",
    folio: "Khatiyan Folio: 2024-SU/RUR-9021",
    navHome: "Home",
    nav1: "1. Scheme Matcher",
    nav2: "2. Business Advisor",
    nav3: "3. Loan Companion",
    cscHelpline: "CSC Helpline",
    phone: "1800-202-0044",
  },
};

const LANGUAGES = [
  { code: "hi", label: "🌐 हिन्दी (Hindi)" },
  { code: "mr", label: "🌐 मराठी (Marathi)" },
  { code: "ta", label: "🌐 தமிழ் (Tamil)" },
  { code: "en", label: "🌐 English (Official)" },
];

export default function Navbar({ activePage = "", lang = "hi", setLang }) {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const t = NAVBAR_I18N[lang] || NAVBAR_I18N.hi;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectLanguage = (code) => {
    if (setLang) {
      setLang(code);
    }
    setLangMenuOpen(false);
  };

  const navItems = [
    { key: "scheme-matcher", href: "/scheme-matcher", label: t.nav1, icon: "account_balance" },
    { key: "business-advisor", href: "/business-advisor", label: t.nav2, icon: "trending_up" },
    { key: "companion", href: "/companion", label: t.nav3, icon: "handshake" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#fff8f3]/95 backdrop-blur-md border-b border-[#d6c4b1] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-20 flex items-center justify-between gap-6 sm:gap-8">

          {/* Brand Logo & Title */}
          <Link href="/" className="flex items-center gap-3.5 group flex-shrink-0">
            <div className="flex items-center justify-center w-12 h-12 rounded-none overflow-hidden border border-[#d6c4b1] shadow-xs bg-white group-hover:border-[#845400] group-hover:shadow-sm transition-all p-1">
              <img
                src="/S_logo.png"
                alt="Sahay-AI Logo"
                className="w-full h-full object-contain rounded-none"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl sm:text-2xl font-bold text-[#221a10] tracking-tight group-hover:text-[#845400] transition-colors">
                  {t.appTitle}
                </span>
              </div>
              <span className="text-xs uppercase font-sans tracking-wider text-[#514536] font-medium">
                {t.subTitle}
              </span>
            </div>
          </Link>

          {/* Navigation Links - Desktop with Generous Spacing & Sharp Square Corners */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
            {navItems.map((item) => {
              const isActive = activePage === item.key;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 xl:px-5 py-2.5 rounded-none text-xs xl:text-sm font-sans font-semibold tracking-wide transition-all ${
                    isActive
                      ? "bg-[#f5e6d4] text-[#845400] border border-[#845400]/30 shadow-xs ring-1 ring-[#845400]/20"
                      : "text-[#514536] hover:text-[#221a10] hover:bg-[#fbebda] border border-transparent"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[18px] ${isActive ? "text-[#845400]" : "text-[#486172]"}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Utilities: CSC Helpline & Language Dropdown */}
          <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">

            {/* CSC Helpline Pill (Square) */}
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-[#fbebda] border border-[#d6c4b1] rounded-none shadow-2xs">
              <div className="w-8 h-8 rounded-none bg-[#486172]/10 flex items-center justify-center text-[#486172]">
                <span className="material-symbols-outlined text-[18px]">support_agent</span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] uppercase font-sans font-semibold text-[#514536] tracking-wider">
                  {t.cscHelpline}
                </span>
                <span className="font-mono font-bold text-xs text-[#221a10]">
                  {t.phone}
                </span>
              </div>
            </div>

            {/* Language Selector Dropdown (Square) */}
            <div className="relative inline-block text-left" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-[#fff8f3] border border-[#d6c4b1] text-[#221a10] rounded-none shadow-xs hover:bg-[#fff1e3] transition-colors focus:outline-none focus:ring-2 focus:ring-[#845400]/30"
                aria-haspopup="true"
                aria-expanded={langMenuOpen}
              >
                <span className="material-symbols-outlined text-[18px] text-[#845400]">translate</span>
                <span className="font-sans text-xs sm:text-sm font-bold text-[#845400]">
                  {LANGUAGES.find((l) => l.code === lang)?.label || "🌐 हिन्दी"}
                </span>
                <span className="material-symbols-outlined text-[18px] text-[#514536] transition-transform duration-200" style={{ transform: langMenuOpen ? 'rotate(180deg)' : 'none' }}>
                  arrow_drop_down
                </span>
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-[#ffffff] border border-[#d6c4b1] rounded-none shadow-xl z-50 py-2 divide-y divide-[#f5e6d4] animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#514536]">
                    भाषा चुनें / Select Language
                  </div>
                  <div className="py-1">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => handleSelectLanguage(l.code)}
                        className={`w-full text-left px-4 py-2.5 text-xs font-sans font-semibold rounded-none flex items-center justify-between hover:bg-[#fff1e3] transition-colors ${
                          lang === l.code ? "bg-[#f5e6d4] text-[#845400] font-bold" : "text-[#221a10]"
                        }`}
                      >
                        <span>{l.label}</span>
                        {lang === l.code && (
                          <span className="material-symbols-outlined text-[16px] text-[#845400]">check</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button (Square) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-none text-[#514536] hover:text-[#221a10] hover:bg-[#fbebda] border border-[#d6c4b1] transition-colors"
              aria-label="Toggle navigation menu"
            >
              <span className="material-symbols-outlined text-[24px]">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#d6c4b1] py-4 bg-[#fff8f3] space-y-2 animate-in fade-in duration-150">
            {navItems.map((item) => {
              const isActive = activePage === item.key;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-none text-sm font-sans font-semibold transition-all ${
                    isActive
                      ? "bg-[#f5e6d4] text-[#845400] border border-[#845400]/30 shadow-xs"
                      : "text-[#514536] hover:text-[#221a10] hover:bg-[#fbebda]"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${isActive ? "text-[#845400]" : "text-[#486172]"}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Helpline on Mobile */}
            <div className="pt-2 border-t border-[#d6c4b1]/60 px-4 flex items-center justify-between text-xs text-[#514536]">
              <span>📞 {t.cscHelpline}:</span>
              <span className="font-mono font-bold text-[#221a10]">{t.phone}</span>
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
