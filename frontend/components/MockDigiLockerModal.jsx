"use client";

import { useState } from "react";

const PERSONAS = [
  {
    id: "sunita_sahu",
    name: "Sunita Sahu",
    role: "Rural Tailor & Artisan",
    scheme: "PMEGP / NSFDC Mahila Samridhi",
    mockAadhaar: "2341-8901-5678",
    caste: "OBC",
    gender: "F",
    dob: "1988-06-15",
    avatar: "👩‍🌾",
    docs: [
      { name: "Aadhaar Card", issuer: "UIDAI", code: "ADHAR" },
      { name: "PAN Card", issuer: "Income Tax Dept", code: "PANCR" },
      { name: "OBC Caste Certificate", issuer: "Govt of Chhattisgarh", code: "CASTC" },
      { name: "Ration Card (NFSA)", issuer: "Food & Civil Supplies", code: "RATION" },
    ],
    missingHint: "Bank Passbook (Physical branch stamp) & Equipment Quotation",
  },
  {
    id: "priya_sharma",
    name: "Priya Sharma",
    role: "Boutique & Textile Entrepreneur",
    scheme: "Stand-Up India / PMEGP",
    mockAadhaar: "9876-5432-1012",
    caste: "SC",
    gender: "F",
    dob: "1992-08-15",
    avatar: "👩‍💼",
    docs: [
      { name: "Aadhaar Card", issuer: "UIDAI", code: "ADHAR" },
      { name: "PAN Card", issuer: "Income Tax Dept", code: "PANCR" },
      { name: "SC Caste Certificate", issuer: "Govt of Maharashtra", code: "CASTC" },
      { name: "Income Certificate", issuer: "Revenue Dept", code: "INCER" },
      { name: "Udyam MSME Certificate", issuer: "Ministry of MSME", code: "UDYAM" },
    ],
    missingHint: "Bank Passbook (6-month statement) & Detailed Project Report (DPR)",
  },
  {
    id: "ramesh_kumar",
    name: "Ramesh Kumar",
    role: "Street Food & Micro-Retailer",
    scheme: "PM SVANidhi / Mudra Shishu",
    mockAadhaar: "4512-7890-3456",
    caste: "General",
    gender: "M",
    dob: "1982-11-20",
    avatar: "👨‍🍳",
    docs: [
      { name: "Aadhaar Card", issuer: "UIDAI", code: "ADHAR" },
      { name: "PAN Card", issuer: "Income Tax Dept", code: "PANCR" },
    ],
    missingHint: "Bank Passbook with UPI QR code & ULB Vending Certificate",
  },
];

const MODAL_TEXT = {
  en: {
    header: "DigiLocker • MeriPehchaan",
    subHeader: "National Single Sign-On (Sandbox Simulation)",
    step1Title: "Select Citizen Persona or Enter Mock Aadhaar",
    step1Desc: "Choose a pre-configured beneficiary profile for testing scheme rules & document verification.",
    aadhaarLabel: "Aadhaar Number (Virtual Mock ID)",
    sendOtp: "Generate OTP",
    step2Title: "Enter 6-Digit Verification OTP",
    step2Desc: "A one-time password has been sent to the registered mobile number linked with Aadhaar.",
    demoOtpBtn: "Auto-fill Demo OTP (123456)",
    verifyOtp: "Verify & Review Consent",
    step3Title: "Consent for Data Sharing",
    step3Desc: "Sahay-AI is requesting cryptographic access to the following documents from your DigiLocker repository:",
    consentCheckbox: "I hereby grant consent to DigiLocker to share the selected government-issued documents with Sahay-AI for the sole purpose of loan appraisal and scheme subsidy eligibility assessment.",
    grantConsent: "Grant Consent & Transfer Documents",
    cancel: "Cancel",
    syncing: "Verifying Cryptographic Government Signatures…",
    successMsg: "Authenticated via DigiLocker Sandbox!",
  },
  hi: {
    header: "डिजिलॉकर • मेरी पहचान",
    subHeader: "राष्ट्रीय एकल साइन-ऑन (सैंडबॉक्स सिमुलेशन)",
    step1Title: "लाभार्थी प्रोफ़ाइल चुनें या मॉक आधार दर्ज करें",
    step1Desc: "योजना नियमों एवं ई-दस्तावेज़ सत्यापन के त्वरित परीक्षण हेतु किसी एक नागरिक प्रोफ़ाइल का चयन करें।",
    aadhaarLabel: "आधार संख्या (मॉक वर्चुअल पहचान)",
    sendOtp: "OTP भेजें",
    step2Title: "6-अंकों का सत्यापन OTP दर्ज करें",
    step2Desc: "आधार से जुड़े पंजीकृत मोबाइल नंबर पर एक बार का पासवर्ड (OTP) भेजा गया है।",
    demoOtpBtn: "डेमो OTP भरें (123456)",
    verifyOtp: "OTP सत्यापित करें व सहमति देखें",
    step3Title: "दस्तावेज़ साझाकरण सहमति",
    step3Desc: "सहाय-AI आपके डिजिलॉकर से निम्नलिखित प्रमाणित सरकारी दस्तावेज़ प्राप्त करने हेतु अनुमति मांग रहा है:",
    consentCheckbox: "मैं प्रमाणित करता/करती हूँ कि मैं ऋण मूल्यांकन एवं सरकारी सब्सिडी पात्रता जाँच हेतु चयनित सरकारी दस्तावेज़ों को सहाय-AI के साथ साझा करने की सहमति देता/देती हूँ।",
    grantConsent: "सहमति दें एवं दस्तावेज़ भेजें",
    cancel: "रद्द करें",
    syncing: "सरकारी डिजिटल हस्ताक्षरों का सत्यापन जारी है…",
    successMsg: "डिजिलॉकर सैंडबॉक्स से सफलतापूर्वक सत्यापित!",
  },
  mr: {
    header: "डिजिलॉकर • माझी ओळख",
    subHeader: "राष्ट्रीय सिंगल साइन-ऑन (सँडबॉक्स सिम्युलेशन)",
    step1Title: "लाभार्थी प्रोफाइल निवडा किंवा मॉक आधार प्रविष्ट करा",
    step1Desc: "योजना पडताळणीसाठी खालीलपैकी एक नमुना नागरिक प्रोफाइल निवडा.",
    aadhaarLabel: "आधार क्रमांक (मॉक आयडी)",
    sendOtp: "OTP पाठवा",
    step2Title: "6-अंकी OTP प्रविष्ट करा",
    step2Desc: "आधारशी जोडलेल्या मोबाईलवर OTP पाठवला आहे.",
    demoOtpBtn: "डेमो OTP भरा (123456)",
    verifyOtp: "सहमती तपासा",
    step3Title: "माहिती शेअर करण्यासाठी संमती",
    step3Desc: "सहाय-AI खालील शासकीय कागदपत्रे मिळवण्यासाठी संमती मागत आहे:",
    consentCheckbox: "मी कर्ज मंजुरीसाठी ही कागदपत्रे सहाय-AI ला देण्यास संमती देतो.",
    grantConsent: "संमती द्या आणि कागदपत्रे पाठवा",
    cancel: "रद्द करा",
    syncing: "डिजिटल स्वाक्षरी तपासत आहे…",
    successMsg: "डिजिलॉकर द्वारे यशस्वीरीत्या पडताळले!",
  },
  ta: {
    header: "டிஜிலாக்கர் • மேரி பெஹ்சான்",
    subHeader: "தேசிய ஒற்றை உள்நுழைவு (மாதிரி செயல்முறை)",
    step1Title: "பயனாளர் விவரத்தைத் தேர்ந்தெடுக்கவும்",
    step1Desc: "சரிபார்ப்பு சோதனைக்காக மாதிரி சுயவிவரத்தைத் தேர்வுசெய்க.",
    aadhaarLabel: "ஆதார் எண் (மாதிரி ஐடி)",
    sendOtp: "OTP பெறுக",
    step2Title: "6-இலக்க OTP உள்ளிடவும்",
    step2Desc: "ஆதாருடன் இணைக்கப்பட்ட மொபைலுக்கு OTP அனுப்பப்பட்டது.",
    demoOtpBtn: "மாதிரி OTP (123456) பயன்படுத்தவும்",
    verifyOtp: "சரிபார்க்கவும்",
    step3Title: "தரவு பகிர்வுக்கான ஒப்புதல்",
    step3Desc: "சகாய்-AI உங்கள் ஆவணங்களை அணுக அனுமதி கோருகிறது:",
    consentCheckbox: "கடன் மதிப்பீட்டுக்காக இந்த ஆவணங்களை பகிர ஒப்புக்கொள்கிறேன்.",
    grantConsent: "ஒப்புதல் வழங்கி இணைக்கவும்",
    cancel: "ரத்து செய்",
    syncing: "சரிபார்க்கிறது…",
    successMsg: "டிஜிலாக்கர் மூலம் சரிபார்க்கப்பட்டது!",
  },
};

export default function MockDigiLockerModal({
  isOpen,
  onClose,
  onSuccess,
  language = "en",
}) {
  const t = MODAL_TEXT[language] || MODAL_TEXT.en;

  const [step, setStep] = useState(1); // 1: Select Persona/Aadhaar, 2: OTP, 3: Consent, 4: Success
  const [selectedPersona, setSelectedPersona] = useState(PERSONAS[0]);
  const [aadhaarInput, setAadhaarInput] = useState(PERSONAS[0].mockAadhaar);
  const [otp, setOtp] = useState("");
  const [selectedDocs, setSelectedDocs] = useState(
    PERSONAS[0].docs.map((d) => d.code)
  );
  const [consentGranted, setConsentGranted] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSelectPersona = (p) => {
    setSelectedPersona(p);
    setAadhaarInput(p.mockAadhaar);
    setSelectedDocs(p.docs.map((d) => d.code));
    setErrorMsg("");
  };

  const handleSendOtp = () => {
    if (!aadhaarInput.trim()) {
      setErrorMsg("Please enter a valid Aadhaar number.");
      return;
    }
    setErrorMsg("");
    setStep(2);
  };

  const handleFillDemoOtp = () => {
    setOtp("123456");
    setErrorMsg("");
  };

  const handleVerifyOtp = () => {
    if (otp !== "123456" && otp.length < 6) {
      setErrorMsg("Invalid OTP. For demo purposes, use '123456'.");
      return;
    }
    setErrorMsg("");
    setStep(3);
  };

  const toggleDoc = (code) => {
    if (selectedDocs.includes(code)) {
      setSelectedDocs(selectedDocs.filter((c) => c !== code));
    } else {
      setSelectedDocs([...selectedDocs, code]);
    }
  };

  const handleFinalConsent = async () => {
    if (!consentGranted) {
      setErrorMsg("Please grant consent to transfer documents.");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch("http://localhost:8000/api/schemes/digilocker/verify-and-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: `mock_${selectedPersona.id}`,
          code_verifier: "sandbox_verifier_123",
          persona_id: selectedPersona.id,
          selected_doctypes: selectedDocs,
        }),
      });

      if (!response.ok) {
        throw new Error(`Sync failed (${response.status})`);
      }

      const data = await response.json();
      setStep(4);
      setTimeout(() => {
        onSuccess(data);
        onClose();
        setStep(1);
        setLoading(false);
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || "Could not complete DigiLocker handshake.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
        {/* National Tricolor Top Strip */}
        <div className="h-1.5 w-full flex">
          <div className="w-1/3 bg-[#FF9933]"></div>
          <div className="w-1/3 bg-white"></div>
          <div className="w-1/3 bg-[#138808]"></div>
        </div>

        {/* MeriPehchaan / DigiLocker Header */}
        <div className="bg-[#0b3a75] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center font-bold text-lg border border-white/20">
              🇮🇳
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-wide">{t.header}</span>
                <span className="rounded bg-amber-400 text-slate-900 text-[10px] font-extrabold px-1.5 py-0.5 tracking-wider uppercase">
                  Sandbox
                </span>
              </div>
              <p className="text-xs text-blue-200">{t.subHeader}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Step Indicator */}
        <div className="bg-slate-50 px-6 py-2.5 border-b border-slate-200/80 flex items-center justify-between text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${step >= 1 ? "bg-[#0b3a75] text-white" : "bg-slate-200 text-slate-600"}`}>1</span>
            <span className={step === 1 ? "text-[#0b3a75] font-bold" : ""}>Citizen</span>
          </div>
          <span className="text-slate-300">→</span>
          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${step >= 2 ? "bg-[#0b3a75] text-white" : "bg-slate-200 text-slate-600"}`}>2</span>
            <span className={step === 2 ? "text-[#0b3a75] font-bold" : ""}>OTP</span>
          </div>
          <span className="text-slate-300">→</span>
          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${step >= 3 ? "bg-[#0b3a75] text-white" : "bg-slate-200 text-slate-600"}`}>3</span>
            <span className={step === 3 ? "text-[#0b3a75] font-bold" : ""}>Consent</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[72vh] overflow-y-auto">
          {errorMsg && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-800 flex items-center gap-2">
              <span className="font-bold">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Select Persona or Aadhaar */}
          {step === 1 && (
            <div>
              <h3 className="text-base font-bold text-slate-900">{t.step1Title}</h3>
              <p className="text-xs text-slate-600 mt-1 mb-4">{t.step1Desc}</p>

              <div className="space-y-2.5 mb-5">
                {PERSONAS.map((p) => {
                  const isSelected = selectedPersona.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPersona(p)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isSelected
                          ? "border-[#0b3a75] bg-blue-50/70 shadow-xs ring-1 ring-[#0b3a75]"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl mt-0.5">{p.avatar}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">{p.name}</span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                              {p.caste} • {p.gender === "F" ? "Woman" : "Male"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">{p.role}</p>
                          <p className="text-[11px] text-emerald-700 font-medium mt-1">
                            Target Scheme: {p.scheme}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                            Mock Aadhaar: {p.mockAadhaar}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 mt-1">
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "border-[#0b3a75] bg-[#0b3a75] text-white text-[10px]" : "border-slate-300"}`}>
                          {isSelected ? "✓" : ""}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {t.aadhaarLabel}
                </label>
                <input
                  type="text"
                  value={aadhaarInput}
                  onChange={(e) => setAadhaarInput(e.target.value)}
                  placeholder="XXXX-XXXX-XXXX"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0b3a75]"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="px-5 py-2.5 rounded-xl bg-[#0b3a75] hover:bg-[#082a54] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {t.sendOtp} →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: OTP Verification */}
          {step === 2 && (
            <div>
              <h3 className="text-base font-bold text-slate-900">{t.step2Title}</h3>
              <p className="text-xs text-slate-600 mt-1 mb-4">{t.step2Desc}</p>

              <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 mb-5 flex items-center justify-between text-xs text-blue-900">
                <div className="flex items-center gap-2">
                  <span>📱</span>
                  <span>Mock Mobile: +91 ••••••{selectedPersona.mobile?.slice(-4) || "3210"}</span>
                </div>
                <button
                  type="button"
                  onClick={handleFillDemoOtp}
                  className="px-2.5 py-1 rounded bg-[#0b3a75] text-white text-[11px] font-bold hover:bg-[#082a54] cursor-pointer"
                >
                  {t.demoOtpBtn}
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  6-Digit OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full text-center tracking-[0.5em] font-mono text-xl py-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0b3a75]"
                />
              </div>

              <div className="mt-6 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  ← Change Persona
                </button>
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className="px-5 py-2.5 rounded-xl bg-[#0b3a75] hover:bg-[#082a54] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {t.verifyOtp} →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Consent & Scope Transfer */}
          {step === 3 && (
            <div>
              <h3 className="text-base font-bold text-slate-900">{t.step3Title}</h3>
              <p className="text-xs text-slate-600 mt-1 mb-4">{t.step3Desc}</p>

              {/* Documents to be shared */}
              <div className="space-y-2 mb-4">
                {selectedPersona.docs.map((doc) => {
                  const isChecked = selectedDocs.includes(doc.code);
                  return (
                    <label
                      key={doc.code}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleDoc(doc.code)}
                          className="h-4 w-4 rounded text-[#0b3a75] focus:ring-[#0b3a75]"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900">{doc.name}</div>
                          <div className="text-[11px] text-slate-500">{doc.issuer}</div>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                        ✓ VERIFIED
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Missing Physical Document Notice */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 mb-4 text-xs text-amber-900">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <span>ℹ️</span>
                  <span>Physical Documents (Not in DigiLocker):</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  {selectedPersona.missingHint}. These will be requested via photo upload for local on-premise OCR.
                </p>
              </div>

              {/* Consent Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-white mb-5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentGranted}
                  onChange={(e) => setConsentGranted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded text-[#0b3a75] focus:ring-[#0b3a75]"
                />
                <span className="text-[11px] text-slate-700 leading-relaxed">
                  {t.consentCheckbox}
                </span>
              </label>

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleFinalConsent}
                  disabled={loading || !consentGranted}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>{t.syncing}</span>
                    </>
                  ) : (
                    <>
                      <span>🔒</span>
                      <span>{t.grantConsent}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Success Animation */}
          {step === 4 && (
            <div className="py-8 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl mb-4 animate-bounce">
                ✓
              </div>
              <h4 className="text-lg font-bold text-slate-900">{t.successMsg}</h4>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                {selectedDocs.length} Government Authenticated Records retrieved for {selectedPersona.name}. Updating Sahay-AI readiness checklist…
              </p>
            </div>
          )}
        </div>

        {/* Footer Security Badge */}
        <div className="bg-slate-100/80 px-6 py-2.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span>🛡️</span>
            <span>256-Bit SSL Encrypted • Government of India e-Governance Standard</span>
          </div>
          <span className="font-mono text-[10px]">ISO 27001 Certified</span>
        </div>
      </div>
    </div>
  );
}

