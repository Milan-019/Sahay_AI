import React, { useState, useEffect, useRef, useCallback } from "react";
import { getSharedAudio, unlockAudio, splitIntoChunks } from "../lib/voiceAudio";

const L = {
  hi: { loading: "तैयार हो रहा है...", stop: "आवाज़ बंद करें", listen: "सुनिए (Audio Summary)", tap: "नतीजा सुनने के लिए दबाएँ", speaking: "नतीजा सुनाया जा रहा है", bhashini: "🇮🇳 भाषिणी (Bhashini) प्रामाणिक भारतीय आवाज़", sub: "ग्रामीण बहनों एवं उद्यमियों के लिए सरल आवाज़ संदेश" },
  mr: { loading: "लोड होत आहे...", stop: "ऑडिओ थांबवा", listen: "ऐका (ऑडिओ)", tap: "निकाल ऐकण्यासाठी दाबा", speaking: "निकाल ऐकवला जात आहे", bhashini: "🇮🇳 भाषिणी (Bhashini) मूळ भारतीय आवाज", sub: "ग्रामीण उद्योजकांसाठी सोपा ऑडिओ संदेश" },
  ta: { loading: "ஏற்றுகிறது...", stop: "நிறுத்து", listen: "கேளுங்கள் (ஆடியோ)", tap: "முடிவைக் கேட்க தொடவும்", speaking: "முடிவு வாசிக்கப்படுகிறது", bhashini: "🇮🇳 பாஷினி (Bhashini) இந்திய குரல்", sub: "கிராமப்புற தொழில்முனைவோருக்கான குரல் செய்தி" },
  en: { loading: "Loading...", stop: "Stop Audio", listen: "Listen (Voice Summary)", tap: "Tap to hear your result", speaking: "Reading your result aloud", bhashini: "🇮🇳 Bhashini Indic AI Voice", sub: "Conversational voice guidance" },
};

const BROWSER_LANG = { hi: "hi-IN", mr: "mr-IN", ta: "ta-IN", en: "en-IN" };

/**
 * Speaks `text` aloud in short chunks: chunk N+1 is fetched from the TTS
 * service while chunk N plays, so speech starts after one short request
 * instead of waiting for the whole narration to synthesize (long single
 * requests time out). If Bhashini is unreachable, the rest is read with the
 * browser's own voice.
 *
 * autoPlayToken: change this value (e.g. increment a counter when results
 * arrive) and the narration starts by itself. If the browser refuses
 * autoplay, the button turns into a highlighted "Tap to hear your result"
 * instead of failing silently.
 */
export default function VoiceSummaryPlayer({ text, language = "hi", title = "", autoPlayToken = 0 }) {
  const [status, setStatus] = useState("idle"); // idle | loading | playing | blocked
  const [isBhashiniVoice, setIsBhashiniVoice] = useState(false);
  const [inView, setInView] = useState(true);

  const runIdRef = useRef(0);
  const resolveCurrentRef = useRef(null);
  const wrapRef = useRef(null);
  const textRef = useRef(text);
  const langRef = useRef(language);
  textRef.current = text;
  langRef.current = language;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const t = L[language] || L.hi;

  const stopAll = useCallback(() => {
    runIdRef.current += 1; // invalidates any running playback loop
    const audio = getSharedAudio();
    if (audio) {
      audio.onended = null;
      audio.onerror = null;
      try { audio.pause(); } catch (e) { /* ignore */ }
    }
    if (resolveCurrentRef.current) {
      resolveCurrentRef.current();
      resolveCurrentRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    setStatus("idle");
    setIsBhashiniVoice(false);
  }, []);

  // One chunk of text -> a playable blob URL, or null if the service can't do it.
  const fetchChunkAudio = useCallback(async (chunk, lang, attempt = 0) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(`${apiUrl}/api/voice/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: chunk, language: lang, gender: "female" }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data.available && data.audio_base64) {
          const bin = atob(data.audio_base64);
          const bytes = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
          return URL.createObjectURL(new Blob([bytes], { type: data.audio_format || "audio/wav" }));
        }
        return null; // service answered "not available": retrying won't help
      }
    } catch (err) {
      clearTimeout(timeoutId);
    }
    // Network error / timeout / server error: one retry, then give up on this chunk.
    return attempt < 1 ? fetchChunkAudio(chunk, lang, attempt + 1) : null;
  }, [apiUrl]);

  const playBlobUrl = (audio, url) =>
    new Promise((resolve, reject) => {
      resolveCurrentRef.current = resolve;
      audio.onended = () => { URL.revokeObjectURL(url); resolveCurrentRef.current = null; resolve(); };
      audio.onerror = () => { URL.revokeObjectURL(url); resolveCurrentRef.current = null; reject(new Error("decode")); };
      audio.src = url;
      const p = audio.play();
      if (p && p.catch) p.catch((err) => { resolveCurrentRef.current = null; reject(err); });
    });

  const speakWithBrowser = useCallback((chunkList, lang, myRun) => {
    if (typeof window === "undefined" || !window.speechSynthesis) { setStatus("idle"); return; }
    setIsBhashiniVoice(false);
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
      const target = BROWSER_LANG[lang] || "hi-IN";
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find((v) => v.lang === target) || voices.find((v) => v.lang.toLowerCase().startsWith(lang));
      chunkList.forEach((c, idx) => {
        const u = new SpeechSynthesisUtterance(c);
        u.lang = target;
        u.rate = 0.9;
        if (voice) u.voice = voice;
        if (idx === chunkList.length - 1) u.onend = () => { if (runIdRef.current === myRun) setStatus("idle"); };
        u.onerror = () => { if (runIdRef.current === myRun) setStatus("idle"); };
        window.speechSynthesis.speak(u);
      });
      setStatus("playing");
    } catch (e) {
      setStatus("idle");
    }
  }, []);

  const speak = useCallback(async () => {
    const full = textRef.current;
    const lang = langRef.current;
    const chunks = splitIntoChunks(full);
    if (!chunks.length) return;

    const myRun = ++runIdRef.current;
    setStatus("loading");
    setIsBhashiniVoice(false);
    const audio = getSharedAudio();
    if (!audio) { speakWithBrowser(chunks, lang, myRun); return; }

    let nextFetch = fetchChunkAudio(chunks[0], lang);
    for (let i = 0; i < chunks.length; i++) {
      const url = await nextFetch;
      if (runIdRef.current !== myRun) { if (url) URL.revokeObjectURL(url); return; }
      // Service unavailable for this chunk: switch to the browser voice for the
      // rest *before* prefetching, so we don't fire a pointless next request.
      if (!url) { speakWithBrowser(chunks.slice(i), lang, myRun); return; }
      if (i + 1 < chunks.length) nextFetch = fetchChunkAudio(chunks[i + 1], lang); // prefetch while this one plays

      try {
        setStatus("playing");
        setIsBhashiniVoice(true);
        await playBlobUrl(audio, url);
      } catch (err) {
        if (runIdRef.current !== myRun) return;
        if (err && err.name === "NotAllowedError") {
          runIdRef.current += 1; // stop the prefetch loop
          setStatus("blocked");  // browser refused autoplay: ask for one tap
          setIsBhashiniVoice(false);
          return;
        }
        speakWithBrowser(chunks.slice(i), lang, myRun);
        return;
      }
      if (runIdRef.current !== myRun) return;
    }
    setStatus("idle");
    setIsBhashiniVoice(false);
  }, [fetchChunkAudio, speakWithBrowser]);

  // Auto-start whenever the parent bumps autoPlayToken (i.e. new results exist).
  useEffect(() => {
    if (autoPlayToken) speak();
  }, [autoPlayToken, speak]);

  // Stop everything if the player unmounts.
  useEffect(() => () => stopAll(), [stopAll]);

  // Track whether the main button is on screen, so a floating Stop can appear when it isn't.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined" || !wrapRef.current) return undefined;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.1 });
    io.observe(wrapRef.current);
    return () => io.disconnect();
  }, []);

  const handleClick = () => {
    if (status === "playing" || status === "loading") { stopAll(); return; }
    unlockAudio(); // inside a real tap, so playback is permitted from here on
    speak();
  };

  const busy = status === "playing" || status === "loading";

  return (
    <>
      <div ref={wrapRef} className="inline-flex items-center gap-2 p-2 bg-[#fff8f3] border border-[#d6c4b1] rounded-none shadow-xs">
        <button
          onClick={handleClick}
          className={`px-4 py-2 rounded-none font-sans font-bold text-xs uppercase flex items-center gap-2 transition-all border border-[#221a10] ${status === "playing"
              ? "bg-[#ba1a1a] text-white animate-pulse"
              : status === "loading"
                ? "bg-[#6b4400] text-white opacity-90"
                : status === "blocked"
                  ? "bg-[#845400] text-white animate-pulse ring-2 ring-[#845400] ring-offset-2"
                  : "bg-[#845400] hover:bg-[#6b4400] text-white shadow-xs"
            }`}
        >
          <span>{status === "playing" ? "⏹️" : status === "loading" ? "⏳" : status === "blocked" ? "👆" : "🔊"}</span>
          <span>
            {status === "loading" ? t.loading
              : status === "playing" ? t.stop
                : status === "blocked" ? t.tap
                  : title || t.listen}
          </span>
        </button>
        <span className="text-xs text-[#514536] hidden sm:inline font-sans">
          {isBhashiniVoice ? t.bhashini : t.sub}
        </span>
      </div>

      {busy && !inView && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2 bg-[#221a10] text-white shadow-lg rounded-none border border-[#845400]">
          <span className="text-xs font-sans">🔊 {t.speaking}</span>
          <button onClick={stopAll} className="px-3 py-1 bg-[#ba1a1a] text-white text-xs font-bold uppercase rounded-none">
            ⏹️ {t.stop}
          </button>
        </div>
      )}
    </>
  );
}
