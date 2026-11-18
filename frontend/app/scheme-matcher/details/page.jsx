"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import DocumentReadinessPanel from "../../../components/DocumentReadinessPanel";

const copy = {
  en: {
    eyebrow: "Your scheme details", title: "Understand your estimate",
    intro: "Here is the full breakdown based on the information you entered. This is an estimate, not a loan approval.",
    contribution: "Your contribution", project: "Estimated project cost", loan: "Estimated loan",
    recommended: "Recommended scheme", rate: "Interest rate", term: "Repayment period", pause: "Initial repayment pause",
    emi: "Repayment estimate", quarterly: "Every 3 months", monthly: "Monthly equivalent",
    available: "Other matching schemes", docs: "Documents to prepare", doc1: "Identity proof", doc2: "Bank account details or passbook", doc3: "Business plan and cost estimates", doc4: "Category certificate, if applicable",
    back: "Back to my answers", next: "Next: prepare my application", companion: "Open loan companion", noData: "No saved estimate found. Please start with the scheme matcher.",
    rateNote: "The lender confirms the final rate and repayment schedule.", scheme: "Scheme", perYear: "per year",
  },
  hi: {
    eyebrow: "आपकी योजना की जानकारी", title: "अपने अनुमान को समझें",
    intro: "आपकी दी गई जानकारी के आधार पर पूरा विवरण नीचे है। यह केवल अनुमान है, ऋण स्वीकृति नहीं।",
    contribution: "आपका अंशदान", project: "अनुमानित परियोजना लागत", loan: "अनुमानित ऋण",
    recommended: "अनुशंसित योजना", rate: "ब्याज दर", term: "भुगतान अवधि", pause: "शुरुआती भुगतान विराम",
    emi: "किश्त का अनुमान", quarterly: "हर 3 महीने", monthly: "मासिक समतुल्य",
    available: "अन्य मिलती-जुलती योजनाएँ", docs: "तैयार रखने वाले दस्तावेज़", doc1: "पहचान प्रमाण", doc2: "बैंक खाते का विवरण या पासबुक", doc3: "व्यवसाय योजना और लागत का अनुमान", doc4: "श्रेणी प्रमाणपत्र, यदि लागू हो",
    back: "अपने जवाबों पर वापस जाएँ", next: "आगे: आवेदन की तैयारी करें", companion: "ऋण साथी खोलें", noData: "कोई अनुमान नहीं मिला। कृपया पहले योजना मिलान करें।",
    rateNote: "अंतिम ब्याज दर और भुगतान तालिका ऋणदाता तय करेगा।", scheme: "योजना", perYear: "प्रति वर्ष",
  },
  mr: {
    eyebrow: "तुमच्या योजनेचा तपशील", title: "तुमचा अंदाज समजून घ्या",
    intro: "तुम्ही दिलेल्या माहितीवर आधारित संपूर्ण तपशील येथे आहे. हा अंदाज आहे, कर्ज मंजुरी नाही.",
    contribution: "तुमचे योगदान", project: "अंदाजित प्रकल्प खर्च", loan: "अंदाजित कर्ज",
    recommended: "शिफारस केलेली योजना", rate: "व्याजदर", term: "परतफेडीचा कालावधी", pause: "सुरुवातीचा परतफेड विराम",
    emi: "हप्त्याचा अंदाज", quarterly: "दर 3 महिन्यांनी", monthly: "मासिक समतुल्य",
    available: "इतर जुळणाऱ्या योजना", docs: "तयार ठेवायची कागदपत्रे", doc1: "ओळखपत्र", doc2: "बँक खाते तपशील किंवा पासबुक", doc3: "व्यवसाय योजना आणि खर्चाचा अंदाज", doc4: "लागू असल्यास प्रवर्ग प्रमाणपत्र",
    back: "माझ्या उत्तरांकडे परत जा", next: "पुढे: अर्जाची तयारी करा", companion: "कर्ज साथीदार उघडा", noData: "जतन केलेला अंदाज सापडला नाही. कृपया आधी योजना तपासा.",
    rateNote: "अंतिम व्याजदर आणि परतफेड वेळापत्रक कर्जदाता ठरवेल.", scheme: "योजना", perYear: "प्रतिवर्ष",
  },
  ta: {
    eyebrow: "உங்கள் திட்ட விவரங்கள்", title: "உங்கள் மதிப்பீட்டைப் புரிந்துகொள்ளுங்கள்",
    intro: "நீங்கள் வழங்கிய விவரங்களின் அடிப்படையிலான முழு விவரம் இதோ. இது ஒரு மதிப்பீடு மட்டுமே; கடன் ஒப்புதல் அல்ல.",
    contribution: "உங்கள் பங்களிப்பு", project: "மதிப்பிடப்பட்ட திட்டச் செலவு", loan: "மதிப்பிடப்பட்ட கடன்",
    recommended: "பரிந்துரைக்கப்படும் திட்டம்", rate: "வட்டி விகிதம்", term: "திருப்பிச் செலுத்தும் காலம்", pause: "தொடக்கத் தவணை இடைவேளை",
    emi: "தவணை மதிப்பீடு", quarterly: "ஒவ்வொரு 3 மாதமும்", monthly: "மாதாந்திர சமமதிப்பு",
    available: "பொருந்தக்கூடிய மற்ற திட்டங்கள்", docs: "தயாராக வைத்திருக்க வேண்டிய ஆவணங்கள்", doc1: "அடையாளச் சான்று", doc2: "வங்கிக் கணக்கு விவரம் அல்லது பாஸ்புக்", doc3: "வணிகத் திட்டம் மற்றும் செலவு மதிப்பீடு", doc4: "பொருந்தினால் பிரிவு சான்றிதழ்",
    back: "என் பதில்களுக்குத் திரும்பு", next: "அடுத்து: விண்ணப்பத்தைத் தயார் செய்", companion: "கடன் துணையைத் திற", noData: "சேமித்த மதிப்பீடு இல்லை. முதலில் திட்டப் பொருத்தத்தைப் பார்க்கவும்.",
    rateNote: "இறுதி வட்டி விகிதத்தையும் திருப்பிச் செலுத்தும் அட்டவணையையும் கடன் வழங்குநர் உறுதிப்படுத்துவார்.", scheme: "திட்டம்", perYear: "ஆண்டுக்கு",
  },
};

export default function SchemeDetailsPage() {
  const [data, setData] = useState(null);
  const [lang, setLang] = useState("en");

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem("sahay-scheme-result") || "null");
      setData(saved);
      const active = saved?.lang || sessionStorage.getItem("sahay-session-lang") || localStorage.getItem("sahay-preferred-lang");
      if (active) setLang(active);
    } catch { setData(null); }

    const handleLangEvent = (e) => {
      if (e.detail) setLang(e.detail);
    };
    window.addEventListener("sahay-language-change", handleLangEvent);
    return () => window.removeEventListener("sahay-language-change", handleLangEvent);
  }, []);

  const handleSetLang = (newLang) => {
    setLang(newLang);
    try {
      sessionStorage.setItem("sahay-session-lang", newLang);
      sessionStorage.setItem("sahay-session-chosen", "true");
      localStorage.setItem("sahay-preferred-lang", newLang);
      window.dispatchEvent(new CustomEvent("sahay-language-change", { detail: newLang }));
    } catch (e) {}
  };

  const t = copy[lang] || copy.hi;
  const money = (value) => `₹${Math.round(Number(value) || 0).toLocaleString("en-IN")}`;
  const lead = data?.offers?.[0];

  return <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
    <Navbar activePage="scheme-matcher" lang={lang} setLang={handleSetLang} />
    <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-16">
      {!data || !lead ? <section className="bg-[var(--paper-white)] p-8 border border-[var(--line)]"><p>{t.noData}</p><Link className="inline-block mt-5 text-[var(--accent)] font-bold underline" href="/scheme-matcher">{t.back}</Link></section> : <>
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-wider text-[var(--accent)]">{t.eyebrow}</p>
          <h1 className="text-3xl sm:text-4xl font-bold mt-2">{t.title}</h1>
          <p className="text-[var(--muted)] mt-3 max-w-3xl leading-relaxed">{t.intro}</p>
        </div>

        <section className="bg-[var(--paper-white)] border border-[var(--line)] p-5 sm:p-8 mb-5">
          <h2 className="text-xl font-bold mb-5">{t.recommended}</h2>
          <div className="bg-[var(--accent-strong)] text-white p-5 sm:p-7 mb-5">
            <p className="text-sm text-white/80">{t.scheme}</p>
            <h3 className="text-2xl font-bold mt-1">{lead.scheme_name}</h3>
            <p className="mt-4 text-3xl font-bold">{money(lead.loan_amount)} <span className="text-base font-medium">{t.loan}</span></p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              [t.contribution, money(data.margin)],
              [t.project, money(lead.project_cost || data.margin * 10)],
              [t.rate, `${(Number(lead.effective_interest_rate || 0) * 100).toFixed(2)}% ${t.perYear}`],
              [t.term, `${lead.tenure_years} ${lang === "en" ? "years" : "वर्ष"}`],
              [t.pause, `${lead.moratorium_months} ${lang === "en" ? "months" : "महीने"}`],
            ].map(([label, value]) => <div key={label} className="bg-[var(--paper)] p-4"><p className="text-sm text-[var(--muted)]">{label}</p><p className="text-xl font-bold mt-1">{value}</p></div>)}
          </div>
          <p className="text-sm text-[var(--muted)] mt-4">{t.rateNote}</p>
        </section>

        <section className="bg-[var(--paper-white)] border border-[var(--line)] p-5 sm:p-8 mb-5">
          <h2 className="text-xl font-bold mb-4">{t.emi}</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="border border-[var(--line)] p-5"><p className="text-sm text-[var(--muted)]">{t.quarterly}</p><p className="text-2xl font-bold mt-1">{data.emiSchedule ? money(data.emiSchedule.quarterly_emi) : "—"}</p></div>
            <div className="border border-[var(--line)] p-5"><p className="text-sm text-[var(--muted)]">{t.monthly}</p><p className="text-2xl font-bold mt-1">{data.emiSchedule ? money(data.emiSchedule.rural_metrics?.monthly_emi || data.emiSchedule.quarterly_emi / 3) : "—"}</p></div>
          </div>
        </section>

        {data.offers.length > 1 && <section className="bg-[var(--paper-white)] border border-[var(--line)] p-5 sm:p-8 mb-5">
          <h2 className="text-xl font-bold mb-4">{t.available}</h2>
          <div className="divide-y divide-[var(--line)]">{data.offers.slice(1).map((offer) => <div key={offer.scheme_code} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"><div><h3 className="font-bold">{offer.scheme_name}</h3><p className="text-sm text-[var(--muted)]">{(Number(offer.effective_interest_rate || 0) * 100).toFixed(2)}% · {offer.tenure_years} {lang === "en" ? "years" : "वर्ष"}</p></div><strong>{money(offer.loan_amount)}</strong></div>)}</div>
        </section>}

        <DocumentReadinessPanel schemeCode={lead.scheme_code} language={lang} isScSt={Boolean(data.isScSt)} />

        <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 print:hidden">
          <Link href="/scheme-matcher" className="px-5 py-3 border border-[var(--accent)] text-[var(--accent)] font-bold text-center">{t.back}</Link>
          <div className="flex flex-col sm:flex-row gap-3">
            <button type="button" onClick={() => window.print()} className="px-5 py-3 border border-[var(--accent)] text-[var(--accent)] font-bold">{lang === "en" ? "Print this summary" : lang === "mr" ? "हा सारांश प्रिंट करा" : lang === "ta" ? "இந்தச் சுருக்கத்தை அச்சிடு" : "इस सारांश को प्रिंट करें"}</button>
            <Link href="/companion" className="px-5 py-3 bg-[var(--accent)] hover:bg-[var(--accent-strong)] text-white font-bold text-center inline-flex justify-center items-center gap-2">{t.next}<span className="material-symbols-outlined">arrow_forward</span></Link>
          </div>
        </div>
      </>}
    </main>
  </div>;
}
