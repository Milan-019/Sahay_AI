"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

const NAVBAR_I18N = {
  hi: {
    appTitle: "सहाय",
    subTitle: "Sahay-AI",
    folio: "Khatiyan Folio: 2024-SU/RUR-9021",
    navHome: "होम",
    nav1: "योजना चयन",
    nav2: "व्यापार सलाहकार",
    nav3: "ऋण साथी",
    cscHelpline: "CSC हेल्पलाइन",
    phone: "1800-202-0044",
  },
  mr: {
    appTitle: "सहाय",
    subTitle: "Sahay-AI",
    folio: "Khatiyan Folio: 2024-SU/RUR-9021",
    navHome: "मुख्यपृष्ठ",
    nav1: "योजना निवड",
    nav2: "व्यवसाय सल्लागार",
    nav3: "कर्ज मित्र",
    cscHelpline: "CSC हेल्पलाइन",
    phone: "1800-202-0044",
  },
  ta: {
    appTitle: "सहाय",
    subTitle: "Sahay-AI",
    folio: "Khatiyan Folio: 2024-SU/RUR-9021",
    navHome: "முகப்பு",
    nav1: "திட்ட தேர்வு",
    nav2: "வணிக ஆலோசகர்",
    nav3: "கடன் தோழன்",
    cscHelpline: "CSC உதவி எண்",
    phone: "1800-202-0044",
  },
  en: {
    appTitle: "Sahay",
    subTitle: "Sahay-AI",
    folio: "Khatiyan Folio: 2024-SU/RUR-9021",
    navHome: "Home",
    nav1: "Scheme Matcher",
    nav2: "Business Advisor",
    nav3: "Loan Companion",
    cscHelpline: "CSC Helpline",
    phone: "1800-202-0044",
  },
};

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "mr", label: "मराठी" },
  { code: "ta", label: "தமிழ்" },
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

    const handleLangChange = (e) => {
      if (e.detail && setLang) {
        setLang(e.detail);
      }
    };
    window.addEventListener("sahay-language-change", handleLangChange);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("sahay-language-change", handleLangChange);
    };
  }, [setLang]);

  const handleSelectLanguage = (code) => {
    if (setLang) {
      setLang(code);
    }
    try {
      sessionStorage.setItem("sahay-session-lang", code);
      sessionStorage.setItem("sahay-session-chosen", "true");
      localStorage.setItem("sahay-preferred-lang", code);
      window.dispatchEvent(new CustomEvent("sahay-language-change", { detail: code }));
    } catch (e) {}
    setLangMenuOpen(false);
  };

  const navItems = [
    { key: "business-advisor", href: "/business-advisor", label: t.nav2 },
    { key: "scheme-matcher", href: "/scheme-matcher", label: t.nav1 },
    { key: "companion", href: "/companion", label: t.nav3 },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#fffbf7]/90 backdrop-blur-md border-b border-[#e8dfcf]/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-20 flex items-center justify-between gap-6 sm:gap-8">

          {/* Clean Brand Identity (No enclosing box border) */}
          <Link
            href="/"
            className="flex items-center gap-3.5 group flex-shrink-0 p-1.5 rounded-2xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(217,119,6,0.25)] hover:bg-[#fff4e8]/60"
          >
            <img
              src="/S_logo.png"
              alt="Sahay-AI Logo"
              className="w-10 h-10 object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="font-serif text-xl sm:text-2xl font-normal text-[#221a10] tracking-tight group-hover:text-[#845400] transition-colors leading-tight">
                {t.appTitle}
              </span>
              <span className="text-[11px] uppercase font-sans tracking-wider text-[#736555] font-medium mt-0.5">
                {t.subTitle}
              </span>
            </div>
          </Link>

          {/* Clean Desktop Navigation Links (No box divs, no icons, ambient glow on hover) */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-4">
            {navItems.map((item) => {
              const isActive = activePage === item.key;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`px-4 xl:px-5 py-2 rounded-full text-xs xl:text-sm font-sans font-medium tracking-wide transition-all duration-300 ${
                    isActive
                      ? "text-[#845400] bg-[#fff0db] font-semibold shadow-[0_0_18px_rgba(217,119,6,0.3)] ring-1 ring-[#845400]/25"
                      : "text-[#514536] hover:text-[#845400] hover:bg-[#fff4e8] hover:shadow-[0_0_20px_rgba(217,119,6,0.35)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Utilities: CSC Helpline & Language Dropdown */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">

            {/* CSC Helpline Call Link (Clean, no icons or boxy divs, glowing on hover) */}
            <a
              href="tel:18002020044"
              className="hidden md:flex flex-col text-right px-3.5 py-1.5 rounded-xl transition-all duration-300 hover:bg-[#fff4e8] hover:shadow-[0_0_20px_rgba(217,119,6,0.35)] group"
            >
              <span className="text-[10px] uppercase font-sans font-semibold text-[#8c7a6b] tracking-wider group-hover:text-[#845400] transition-colors">
                {t.cscHelpline}
              </span>
              <span className="font-mono font-bold text-xs text-[#221a10] group-hover:text-[#845400] transition-colors">
                {t.phone}
              </span>
            </a>

            {/* Language Selector Dropdown (Clean pill, no icons/emojis, glowing on hover) */}
            <div className="relative inline-block text-left" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-sans font-semibold text-[#845400] rounded-full transition-all duration-300 hover:bg-[#fff0db] hover:shadow-[0_0_22px_rgba(217,119,6,0.4)] focus:outline-none cursor-pointer"
                aria-haspopup="true"
                aria-expanded={langMenuOpen}
              >
                <span>
                  {LANGUAGES.find((l) => l.code === lang)?.label || "English"}
                </span>
                <span
                  className="text-[9px] text-[#845400] transition-transform duration-200 inline-block ml-0.5"
                  style={{ transform: langMenuOpen ? "rotate(180deg)" : "none" }}
                >
                  ▼
                </span>
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md border border-[#e8dfcf] rounded-2xl shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8c7a6b]">
                    Language
                  </div>
                  <div className="py-1">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => handleSelectLanguage(l.code)}
                        className={`w-full text-left px-3.5 py-2 text-xs font-sans font-medium rounded-xl mx-auto transition-all duration-200 cursor-pointer ${
                          lang === l.code
                            ? "bg-[#fff0db] text-[#845400] font-bold shadow-[0_0_12px_rgba(217,119,6,0.25)]"
                            : "text-[#221a10] hover:bg-[#fff4e8] hover:text-[#845400] hover:shadow-[0_0_16px_rgba(217,119,6,0.3)]"
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle (Clean 3-line CSS bars, no font icons, glowing on hover) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-full text-[#514536] hover:text-[#845400] transition-all duration-300 hover:bg-[#fff0db] hover:shadow-[0_0_20px_rgba(217,119,6,0.35)] cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span
                  className={`block h-0.5 w-full bg-current transition-all duration-200 ${
                    mobileMenuOpen ? "rotate-45 translate-y-1.5" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 w-full bg-current transition-opacity duration-200 ${
                    mobileMenuOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 w-full bg-current transition-all duration-200 ${
                    mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
                  }`}
                />
              </div>
            </button>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#e8dfcf]/60 py-4 bg-[#fffbf7]/95 space-y-1.5 animate-in fade-in duration-150">
            {navItems.map((item) => {
              const isActive = activePage === item.key;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-sm font-sans font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-[#fff0db] text-[#845400] font-semibold shadow-[0_0_16px_rgba(217,119,6,0.3)]"
                      : "text-[#514536] hover:text-[#845400] hover:bg-[#fff4e8] hover:shadow-[0_0_18px_rgba(217,119,6,0.3)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Helpline on Mobile (Clean text, no emojis) */}
            <div className="pt-3 border-t border-[#e8dfcf]/60 px-4 flex items-center justify-between text-xs text-[#514536]">
              <span className="text-[#8c7a6b] uppercase font-semibold text-[10px] tracking-wider">
                {t.cscHelpline}
              </span>
              <a
                href="tel:18002020044"
                className="font-mono font-bold text-[#845400] hover:underline"
              >
                {t.phone}
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}