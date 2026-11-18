"use client";

import { useState } from "react";
import MockDigiLockerModal from "./MockDigiLockerModal";

const TEXT = {
  en: {
    badge: "Document Verification",
    title: "Document Readiness & Verification",
    intro: "Check the documents needed for this scheme. You can verify automatically via DigiLocker or upload clear photo copies.",
    privacy: "Uploaded images are securely processed on-premise for identity verification and never shared with third parties.",
    name: "Full name (as printed on your documents)",
    dob: "Date of birth (optional)",
    type: "Document type",
    choose: "Choose document",
    upload: "Upload & Verify",
    locker: "Sync via DigiLocker",
    syncing: "Verifying…",
    connected: "DigiLocker documents linked",
    demo: "Use demo DigiLocker profile",
    demoInfo: "Demo Mode: Sourced pre-verified sample KYC documents.",
    code: "Authorization code",
    verifyCode: "Verify code",
    authInfo: "Sign in in the new tab. If a code appears on the page, paste it below to complete verification.",
    ready: "All required documents are verified and ready",
    incomplete: "Documents still needed for bank appraisal",
    required: "Required documents for this scheme:",
    missing: "Pending documents:",
    extracted: "Extracted details",
    raw: "View raw OCR text",
    noText: "Image received, but text could not be recognized clearly. Please upload a well-lit, close-up photo.",
    mismatch: "Name does not match declared name. Please review spelling.",
    match: "Name matched successfully",
    retry: "Re-check documents",
    errIdentity: "Please enter your name first.",
    errFile: "Please select an image smaller than 8 MB.",
    noFiles: "No documents uploaded yet.",
    remove: "Remove",
    offline: "Could not reach the document verification service. Please ensure the backend is running.",
    demoPassbook: "Load Sample Passbook (SBI Rural)",
    passbookNotice: "Bank Passbook requires a bank branch stamp and cannot be retrieved from DigiLocker. Please upload a photo or load a sample passbook for on-premise OCR.",
    digilockerVerified: "DigiLocker Verified ✓",
    ocrVerified: "OCR Matched ✓",
  },
  hi: {
    badge: "दस्तावेज़ सत्यापन",
    title: "दस्तावेज़ एवं पहचान स्थिति",
    intro: "इस योजना के लिए आवश्यक दस्तावेज़ों की स्थिति देखें। आप DigiLocker से तुरंत सत्यापित कर सकते हैं या साफ़ फोटो अपलोड कर सकते हैं।",
    privacy: "अपलोड किए गए दस्तावेज़ केवल पहचान जाँच हेतु सुरक्षित संसाधित होते हैं। किसी भी बाहरी AI मॉडल को नहीं भेजे जाते।",
    name: "दस्तावेज़ पर अंकित पूरा नाम",
    dob: "जन्म तिथि (वैकल्पिक)",
    type: "दस्तावेज़ का प्रकार",
    choose: "दस्तावेज़ चुनें",
    upload: "फोटो अपलोड व जाँच करें",
    locker: "DigiLocker से सत्यापित करें",
    syncing: "सत्यापन जारी है…",
    connected: "DigiLocker दस्तावेज़ जुड़े",
    demo: "डेमो DigiLocker प्रोफ़ाइल जोड़ें",
    demoInfo: "डेमो मोड: नमूना सरकारी ई-केवाईसी दस्तावेज़ लोड किए गए हैं।",
    code: "ऑथराइज़ेशन कोड",
    verifyCode: "कोड सत्यापित करें",
    authInfo: "नई टैब में साइन-इन करें। यदि स्क्रीन पर कोड दिखे तो उसे नीचे पेस्ट करें।",
    ready: "सभी आवश्यक दस्तावेज़ पूर्ण व सत्यापित हैं",
    incomplete: "बैंक आवेदन हेतु कुछ दस्तावेज़ अभी बाकी हैं",
    required: "इस योजना हेतु आवश्यक दस्तावेज़:",
    missing: "लंबित दस्तावेज़:",
    extracted: "पहचानी गई जानकारी",
    raw: "मूल OCR विवरण देखें",
    noText: "फोटो मिला, परंतु स्पष्ट नहीं पढ़ा जा सका। कृपया रोशनी में साफ़ व सीधा फोटो लें।",
    mismatch: "दस्तावेज़ पर नाम दर्ज नाम से मेल नहीं खा रहा है। कृपया स्पेलिंग जाँचें।",
    match: "नाम सफलतापूर्वक मेल खा गया",
    retry: "पुनः जाँच करें",
    errIdentity: "कृपया पहले अपना नाम दर्ज करें।",
    errFile: "कृपया 8 MB से छोटी फोटो चुनें।",
    noFiles: "अभी तक कोई दस्तावेज़ नहीं जाँचा गया है।",
    remove: "हटाएँ",
    offline: "दस्तावेज़ सत्यापन सेवा से संपर्क नहीं हो पाया। कृपया सुनिश्चित करें कि बैकएंड चालू है।",
    demoPassbook: "डेमो पासबुक लोड करें (SBI ग्रामीण)",
    passbookNotice: "बैंक पासबुक पर बैंक शाखा की मुहर आवश्यक होती है (यह डिजिलॉकर में उपलब्ध नहीं होती)। कृपया फोटो अपलोड करें या OCR हेतु डेमो पासबुक लोड करें।",
    digilockerVerified: "डिजिलॉकर सत्यापित ✓",
    ocrVerified: "OCR सत्यापित ✓",
  },
  mr: {
    badge: "कागदपत्र पडताळणी",
    title: "कागदपत्रे आणि ओळख स्थिती",
    intro: "या योजनेसाठी आवश्यक कागदपत्रे तपासा. तुम्ही DigiLocker द्वारे त्वरित पडताळू शकता किंवा स्पष्ट फोटो अपलोड करू शकता.",
    privacy: "अपलोड केलेले फोटो सुरक्षितपणे तपासले जातात; कोणाशीही सामायिक केले जात नाहीत.",
    name: "कागदपत्रावरील पूर्ण नाव",
    dob: "जन्मतारीख (पर्यायी)",
    type: "कागदपत्राचा प्रकार",
    choose: "कागदपत्र निवडा",
    upload: "अपलोड करा व तपासा",
    locker: "DigiLocker जोडा",
    syncing: "तपासत आहे…",
    connected: "DigiLocker जोडले गेले",
    demo: "डेमो प्रोफाइल वापरा",
    demoInfo: "डेमो मोड: नमुना शासकीय ई-केवायसी कागदपत्रे वापरली आहेत.",
    code: "अधिकृतता कोड",
    verifyCode: "कोड पडताळा",
    authInfo: "नव्या टॅबमध्ये साइन इन करा आणि कोड येथे टाका.",
    ready: "सर्व आवश्यक कागदपत्रे उपलब्ध व पडताळलेली आहेत",
    incomplete: "बँक अर्जासाठी काही कागदपत्रे बाकी आहेत",
    required: "या योजनेसाठी आवश्यक कागदपत्रे:",
    missing: "बाकी कागदपत्रे:",
    extracted: "वाचलेली माहिती",
    raw: "मूळ मजकूर पाहा",
    noText: "फोटो मिळाला पण मजकूर स्पष्ट वाचता आला नाही.",
    mismatch: "नाव जुळत नाही. कृपया स्पेलिंग तपासा.",
    match: "नाव जुळले आहे",
    retry: "पुन्हा तपासा",
    errIdentity: "आधी तुमचे नाव भरा.",
    errFile: "8 MB पेक्षा लहान फोटो निवडा.",
    noFiles: "अद्याप कोणताही फोटो तपासलेला नाही.",
    remove: "काढा",
    offline: "कागदपत्र सेवा उपलब्ध नाही.",
    demoPassbook: "डेमो पासबुक लोड करा (SBI)",
    passbookNotice: "बँक पासबुक प्रत्यक्ष बँकेचा शिक्का असणे आवश्यक आहे. कृपया फोटो अपलोड करा.",
    digilockerVerified: "डिजिलॉकर पडताळणी ✓",
    ocrVerified: "OCR पडताळणी ✓",
  },
  ta: {
    badge: "ஆவண சரிபார்ப்பு",
    title: "ஆவணங்கள் மற்றும் அடையாள நிலை",
    intro: "இந்தத் திட்டத்திற்குத் தேவையான ஆவணங்களைச் சரிபார்க்கவும். DigiLocker வழியாகவோ அல்லது புகைப்படத்தைப் பதிவேற்றியோ சரிபார்க்கலாம்.",
    privacy: "பதிவேற்றப்பட்ட ஆவணங்கள் பாதுகாப்பாகச் செயலாக்கப்படுகின்றன.",
    name: "ஆவணத்தில் உள்ள முழுப் பெயர்",
    dob: "பிறந்த தேதி (விருப்பம்)",
    type: "ஆவண வகை",
    choose: "ஆவணத்தைத் தேர்ந்தெடுக்கவும்",
    upload: "பதிவேற்றிச் சரிபார்க்கவும்",
    locker: "DigiLocker-ஐ இணைக்கவும்",
    syncing: "சரிபார்க்கிறது…",
    connected: "DigiLocker ஆவணங்கள் இணைக்கப்பட்டன",
    demo: "மாதிரி சுயவிவரத்தைப் பயன்படுத்து",
    demoInfo: "டெமோ முறை: மாதிரி அரசு இ-கேஒய்சி ஆவணங்கள் இணைக்கப்பட்டுள்ளன.",
    code: "அங்கீகாரக் குறியீடு",
    verifyCode: "குறியீட்டைச் சரிபார்க்கவும்",
    authInfo: "புதிய தாவலில் உள்நுழைந்து குறியீட்டை இங்கே உள்ளிடவும்.",
    ready: "அனைத்துத் தேவையான ஆவணங்களும் உள்ளன",
    incomplete: "சில ஆவணங்கள் இன்னும் தேவைப்படுகின்றன",
    required: "தேவையான ஆவணங்கள்:",
    missing: "மீதமுள்ள ஆவணங்கள்:",
    extracted: "படிக்கப்பட்ட விவரம்",
    raw: "முழு உரையைக் காட்டு",
    noText: "உரையைப் படிக்க முடியவில்லை. தெளிவான படத்தை முயற்சிக்கவும்.",
    mismatch: "பெயர் பொருந்தவில்லை. எழுத்துப்பிழையைச் சரிபார்க்கவும்.",
    match: "பெயர் வெற்றிகரமாகப் பொருந்தியது",
    retry: "மீண்டும் சரிபார்க்கவும்",
    errIdentity: "முதலில் உங்கள் பெயரை உள்ளிடவும்.",
    errFile: "8 MB-க்குக் குறைவான படத்தைத் தேர்ந்தெடுக்கவும்.",
    noFiles: "ஆவணங்கள் எதுவும் இதுவரை சரிபார்க்கப்படவில்லை.",
    remove: "நீக்கு",
    offline: "சேவையை அணுக முடியவில்லை.",
    demoPassbook: "மாதிரி பாஸ்புக் ஏற்றுக (SBI)",
    passbookNotice: "வங்கி பாஸ்புக் கிளை முத்திரை தேவைப்படும் ஆவணம். படத்தை பதிவேற்றவும்.",
    digilockerVerified: "டிஜிலாக்கர் சரிபார்ப்பு ✓",
    ocrVerified: "OCR சரிபார்ப்பு ✓",
  },
};

const DOCUMENTS = [
  ["AADHAAR", "आधार कार्ड (Aadhaar Card)"],
  ["PAN", "पैन कार्ड (PAN Card)"],
  ["BANK_PASSBOOK", "बैंक पासबुक (Bank Passbook / Statement)"],
  ["CASTE_CERTIFICATE", "जाति प्रमाण पत्र (Caste Certificate)"],
  ["INCOME_CERTIFICATE", "आय प्रमाण पत्र (Income Certificate)"],
  ["ADDRESS_PROOF", "निवास प्रमाण पत्र (Address Proof)"],
  ["PASSPORT_PHOTO", "पासपोर्ट फोटो (Passport Photo)"],
  ["BUSINESS_PLAN", "व्यवसाय योजना / प्राक्कलन (Business Plan / DPR)"],
];

function maskId(value) {
  if (!value) return "";
  const text = String(value);
  if (text.includes("IFSC:")) {
    return text.replace(/(A\/c:\s*)\d+/i, (_, prefix) => `${prefix}••••${text.match(/\d+/)?.[0].slice(-4) || ""}`);
  }
  return text.length > 6 ? `${"•".repeat(Math.min(8, text.length - 4))}${text.slice(-4)}` : text;
}

export default function DocumentReadinessPanel({ schemeCode, language = "hi", isScSt = false }) {
  const t = TEXT[language] || TEXT.hi;
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [docType, setDocType] = useState("BANK_PASSBOOK");
  const [documents, setDocuments] = useState([]);
  const [verifiedDocuments, setVerifiedDocuments] = useState({});
  const [issuedDocuments, setIssuedDocuments] = useState([]);
  const [readiness, setReadiness] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [lockerMode, setLockerMode] = useState("demo");
  const [codeVerifier, setCodeVerifier] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const api = (path, options = {}) => fetch(`http://localhost:8000/api/schemes${path}`, options);
  
  const refreshReadiness = async (nextDocuments = documents, nextVerified = verifiedDocuments, person = name, birth = dob) => {
    if (!person.trim()) { setError(t.errIdentity); return; }
    setBusy(true); setError("");
    try {
      const response = await api("/document-readiness", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheme_code: schemeCode, applicant_full_name: person.trim(), applicant_date_of_birth: birth,
          is_sc_st: isScSt, digilocker_verified_documents: nextVerified,
          submitted_documents: nextDocuments,
        }),
      });
      if (!response.ok) throw new Error(`Document check failed (${response.status})`);
      setReadiness(await response.json());
    } catch (err) { setError(err.message || t.offline); }
    finally { setBusy(false); }
  };

  const handleImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 8 * 1024 * 1024) { setError(t.errFile); return; }
    if (!name.trim()) { setError(t.errIdentity); return; }
    setBusy(true); setError("");
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file);
      });
      const imageBase64 = String(dataUrl).split(",")[1];
      const next = [...documents.filter((doc) => doc.document_type !== docType), { document_type: docType, image_base64: imageBase64, file_name: file.name }];
      setDocuments(next);
      await refreshReadiness(next, verifiedDocuments, name, dob);
    } catch (err) { setError(err.message || t.offline); setBusy(false); }
  };

  const handleLocker = async () => {
    setError("");
    try {
      const statusResponse = await api("/digilocker/status");
      if (statusResponse.ok) {
        const status = await statusResponse.json();
        if (!status.mock_mode) {
          // Real MeriPehchaan OAuth redirect
          const authResponse = await api("/digilocker/authorize");
          if (authResponse.ok) {
            const auth = await authResponse.json();
            setCodeVerifier(auth.code_verifier);
            window.open(auth.auth_url, "_blank", "noopener,noreferrer");
            setLockerMode("oauth");
            return;
          }
        }
      }
    } catch (e) {
      // Fallback directly to in-app simulation modal
    }
    setModalOpen(true);
  };

  const handleModalSuccess = async (result) => {
    setBusy(true);
    setError("");
    try {
      const nextName = result.user?.name || name;
      const nextDob = result.user?.dob || dob;
      if (nextName) setName(nextName);
      if (nextDob) setDob(nextDob);
      setVerifiedDocuments(result.verified_documents || {});
      setIssuedDocuments(result.issued_documents || []);
      setLockerMode("demo");
      if (nextName) {
        await refreshReadiness(documents, result.verified_documents || {}, nextName, nextDob || "");
      }
    } catch (err) {
      setError(err.message || t.offline);
    } finally {
      setBusy(false);
    }
  };

  const handleLoadDemoPassbook = async () => {
    if (!name.trim()) {
      setError(t.errIdentity);
      return;
    }
    setBusy(true);
    setError("");
    try {
      // Dynamically generate a sample rural bank passbook image on canvas
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 320;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");

      // Passbook background
      ctx.fillStyle = "#faf6ed";
      ctx.fillRect(0, 0, 600, 320);

      // Header bar
      ctx.fillStyle = "#1e3a8a";
      ctx.fillRect(0, 0, 600, 48);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 15px sans-serif";
      ctx.fillText("STATE BANK OF INDIA • RURAL REGIONAL BRANCH", 20, 30);

      // Account info
      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText("SAVINGS BANK PASSBOOK", 20, 80);
      ctx.font = "12px sans-serif";
      ctx.fillStyle = "#475569";
      ctx.fillText("Branch: Dhamdha Rural (IFSC: SBIN0001234)", 20, 105);
      ctx.fillText("CIF No: 89012345678", 20, 125);

      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("Account Holder: " + name.trim(), 20, 165);
      ctx.font = "12px sans-serif";
      ctx.fillText("Account Number: 30981245678", 20, 190);
      ctx.fillText("Address: Village Dhamdha, Ward 4, Durg, CG", 20, 215);

      // Branch Stamp & Seal
      ctx.strokeStyle = "#991b1b";
      ctx.lineWidth = 2;
      ctx.strokeRect(380, 80, 190, 140);
      ctx.fillStyle = "#991b1b";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText("STATE BANK OF INDIA", 400, 115);
      ctx.fillText("BRANCH STAMP & SEAL", 395, 140);
      ctx.fillText("VERIFIED & ATTESTED", 400, 165);
      ctx.fillText("Date: 14-Aug-2023", 420, 190);

      const base64Data = canvas.toDataURL("image/png").split(",")[1];
      const next = [
        ...documents.filter((doc) => doc.document_type !== "BANK_PASSBOOK"),
        {
          document_type: "BANK_PASSBOOK",
          image_base64: base64Data,
          file_name: "sbi_passbook_verified.png",
        },
      ];
      setDocuments(next);
      await refreshReadiness(next, verifiedDocuments, name, dob);
    } catch (err) {
      setError(err.message || t.offline);
    } finally {
      setBusy(false);
    }
  };

  const verifyAuthorizationCode = async () => {
    if (!authCode.trim() || !codeVerifier) return;
    setBusy(true); setError("");
    try {
      const response = await api("/digilocker/verify-and-sync", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: authCode.trim(), code_verifier: codeVerifier }),
      });
      if (!response.ok) throw new Error(`DigiLocker verification failed (${response.status}).`);
      const result = await response.json();
      const nextName = result.user?.name || name;
      const nextDob = result.user?.dob || dob;
      if (nextName) setName(nextName);
      if (nextDob) setDob(nextDob);
      setVerifiedDocuments(result.verified_documents || {});
      setIssuedDocuments(result.issued_documents || []);
      setAuthCode("");
      if (nextName) await refreshReadiness(documents, result.verified_documents || {}, nextName, nextDob || "");
    } catch (err) { setError(err.message || t.offline); }
    finally { setBusy(false); }
  };

  const missing = readiness?.missing_documents || [];
  const extracted = readiness?.extracted_documents || [];

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
      {/* Header with MyGov Style Tags */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-2 border border-emerald-200/60">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            {t.badge}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{t.title}</h2>
          <p className="mt-1.5 max-w-2xl text-sm text-slate-600 leading-relaxed">{t.intro}</p>
        </div>

        {/* MyGov-style Warm Saffron/Terracotta Button */}
        <button
          type="button"
          onClick={handleLocker}
          disabled={busy}
          className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#d95c2e] hover:bg-[#c24e23] text-white text-sm font-semibold shadow-sm transition-all disabled:opacity-60 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">lock</span>
          <span>{busy ? t.syncing : t.locker}</span>
        </button>
      </div>

      {lockerMode === "demo" && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-700 text-base">check_circle</span>
            <span>{t.demoInfo}</span>
          </div>
          <button type="button" onClick={() => refreshReadiness()} className="text-xs font-bold text-amber-900 underline hover:text-amber-950">
            {t.retry}
          </button>
        </div>
      )}

      {lockerMode === "oauth" && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-600">{t.authInfo}</p>
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <input
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value)}
              placeholder={t.code}
              className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#d95c2e]"
            />
            <button
              type="button"
              onClick={verifyAuthorizationCode}
              disabled={busy || !authCode.trim()}
              className="rounded-xl bg-[#d95c2e] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#c24e23] disabled:opacity-50"
            >
              {t.verifyCode}
            </button>
          </div>
        </div>
      )}

      {issuedDocuments.length > 0 && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-900">
          <div className="flex items-center gap-2 font-semibold mb-2">
            <span className="material-symbols-outlined text-emerald-700 text-lg">verified_user</span>
            <span>DigiLocker Issued Documents ({issuedDocuments.length} Retrieved)</span>
          </div>
          <div className="grid sm:grid-cols-3 gap-2.5 mt-2.5">
            {issuedDocuments.map((doc, idx) => (
              <div key={idx} className="bg-white rounded-lg p-3 border border-emerald-100 shadow-xs text-xs">
                <div className="font-bold text-slate-800 leading-snug">{doc.name}</div>
                <div className="text-slate-500 text-[11px] mt-1 truncate" title={doc.issuer}>{doc.issuer}</div>
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 text-[11px]">
                  <span className="font-mono text-slate-600 text-[10px]">{doc.doctype || doc.type}</span>
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded text-[10px]">
                    ✓ {doc.status || "VERIFIED"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Fields */}
      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            {t.name}
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#d95c2e]"
            placeholder="उदा. Sunita Sahu"
            autoComplete="name"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            {t.dob}
          </label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#d95c2e]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            {t.type}
          </label>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#d95c2e]"
          >
            {DOCUMENTS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            {t.upload}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            disabled={busy}
            className="block w-full cursor-pointer rounded-xl border border-slate-300 bg-white text-xs text-slate-600 file:mr-3 file:border-0 file:bg-slate-100 file:px-3 file:py-2.5 file:font-medium file:text-slate-800 hover:file:bg-slate-200"
          />
        </div>
      </div>

      {/* Privacy Guarantee Note */}
      <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 text-xs text-slate-600 leading-relaxed flex items-center gap-2.5">
        <span className="material-symbols-outlined text-slate-500 text-lg">shield</span>
        <span>{t.privacy}</span>
      </div>

      {lockerMode === "demo" && (
        <button
          type="button"
          onClick={handleLocker}
          disabled={busy}
          className="mt-3 inline-block text-xs font-semibold text-[#d95c2e] hover:underline"
        >
          {t.demo}
        </button>
      )}

      {error && (
        <div role="alert" className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3.5 text-sm text-red-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Readiness Status Block */}
      {readiness && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/60 p-5">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                readiness.is_ready ? "bg-emerald-600" : "bg-amber-500"
              }`}
            ></span>
            <p
              className={`font-bold text-base ${
                readiness.is_ready ? "text-emerald-800" : "text-amber-800"
              }`}
            >
              {readiness.is_ready ? t.ready : t.incomplete}
            </p>
          </div>

          <div className="mt-4 grid sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-800 mb-2 text-xs uppercase tracking-wider">
                {t.required}
              </p>
              <ul className="space-y-2 text-slate-600">
                {(readiness.required_documents || []).map((doc) => {
                  const isDigi = readiness.sourced_from_digilocker?.includes(doc) || 
                    (doc === "AADHAAR" && verifiedDocuments.aadhaar) ||
                    (doc === "PAN" && verifiedDocuments.pan) ||
                    (doc === "CASTE_CERTIFICATE" && verifiedDocuments.caste_certificate) ||
                    (doc === "INCOME_CERTIFICATE" && verifiedDocuments.income_certificate);
                  const isExtracted = extracted.some((e) => e.document_type === doc && e.name_matches_declared !== false);
                  const isMissing = missing.includes(doc);

                  return (
                    <li key={doc} className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-slate-50">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isMissing ? "text-amber-500" : "text-emerald-600"}`}>
                          {isMissing ? "!" : "✓"}
                        </span>
                        <span className="text-xs font-medium">{DOCUMENTS.find(([key]) => key === doc)?.[1] || doc}</span>
                      </div>
                      <div>
                        {isDigi ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {t.digilockerVerified}
                          </span>
                        ) : isExtracted ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                            {t.ocrVerified}
                          </span>
                        ) : isMissing ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            लंबित (Pending)
                          </span>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-800 mb-2 text-xs uppercase tracking-wider">
                {t.missing}
              </p>
              {missing.length ? (
                <div className="space-y-2">
                  <ul className="space-y-1.5 text-amber-700">
                    {missing.map((doc) => (
                      <li key={doc} className="flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-600 font-bold">!</span>
                          <span>{DOCUMENTS.find(([key]) => key === doc)?.[1] || doc}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {missing.includes("BANK_PASSBOOK") && (
                    <div className="mt-3 pt-3 border-t border-amber-200 bg-amber-50/50 p-3 rounded-lg text-xs">
                      <p className="text-[11px] text-amber-800 mb-2 leading-relaxed font-medium">
                        {t.passbookNotice}
                      </p>
                      <button
                        type="button"
                        onClick={handleLoadDemoPassbook}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d95c2e] hover:bg-[#c24e23] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">document_scanner</span>
                        <span>{t.demoPassbook}</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-emerald-700 font-medium text-xs">सभी आवश्यक दस्तावेज़ उपलब्ध एवं सत्यापित हैं।</p>
              )}
            </div>
          </div>

          {documents.length === 0 && (
            <p className="mt-3 text-xs text-slate-500">{t.noFiles}</p>
          )}

          {extracted.map((doc, index) => (
            <div
              key={`${doc.document_type}-${index}`}
              className="mt-4 bg-white p-4 rounded-xl border border-slate-200"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong className="text-slate-800">
                  {DOCUMENTS.find(([key]) => key === doc.document_type)?.[1] || doc.document_type}
                </strong>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    doc.name_matches_declared === false
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  }`}
                >
                  {doc.name_matches_declared === false
                    ? t.mismatch
                    : doc.name_matches_declared === true
                    ? t.match
                    : "सत्यापित"}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-700">
                {t.extracted}: <span className="font-semibold">{doc.extracted_name || "—"}</span>
                {doc.extracted_id_number ? ` · ${maskId(doc.extracted_id_number)}` : ""}
              </p>
              {!doc.extracted_name && !doc.extracted_id_number && (
                <p className="mt-2 text-xs text-amber-800">{t.noText}</p>
              )}
              {doc.raw_text && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs font-semibold text-[#d95c2e] hover:underline">
                    {t.raw}
                  </summary>
                  <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 font-mono">
                    {doc.raw_text}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Mock DigiLocker Modal */}
      <MockDigiLockerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
        language={language}
      />
    </section>
  );
}
