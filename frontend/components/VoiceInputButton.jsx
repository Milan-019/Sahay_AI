import React, { useState, useRef } from "react";
import { blobToWavBase64 } from "../lib/wavEncoder";

const LABELS = {
    hi: { idle: "बोलकर भरें", recording: "सुन रहे हैं...", busy: "समझ रहे हैं...", err: "सुन नहीं पाए, फिर कोशिश करें" },
    mr: { idle: "बोलून भरा", recording: "ऐकत आहोत...", busy: "समजून घेत आहोत...", err: "ऐकू आले नाही, पुन्हा प्रयत्न करा" },
    ta: { idle: "பேசவும்", recording: "கேட்கிறோம்...", busy: "புரிந்துகொள்கிறோம்...", err: "கேட்கவில்லை, மீண்டும் முயற்சிக்கவும்" },
    en: { idle: "Tap & Speak", recording: "Listening...", busy: "Understanding...", err: "Didn't hear that, try again" },
};

/**
 * Large, icon-first mic button for low-literacy/first-time users — the
 * tap target and icon size carry the meaning, text is a secondary label
 * underneath, not the primary cue. Records -> Bhashini ASR -> Groq field
 * extraction -> onResult(values) with keys matching the `fields` schema.
 */
export default function VoiceInputButton({ fields, language = "hi", onResult, onTranscript, size = "large" }) {
    const [state, setState] = useState("idle"); // idle | recording | busy | error
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const maxTimerRef = useRef(null);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const t = LABELS[language] || LABELS.hi;

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // Use a format this browser can actually record: Chrome/Firefox do WebM, Safari
            // only does MP4. Forcing "audio/webm" made recording fail outright on iPhones.
            const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"].find(
                (m) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)
            );
            const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
            chunksRef.current = [];
            recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
            recorder.onstop = () => handleRecordingComplete(stream, recorder.mimeType || mime || "audio/webm");
            recorder.start();
            mediaRecorderRef.current = recorder;
            // Safety cap: a spoken form answer never needs more than 30 seconds.
            maxTimerRef.current = setTimeout(() => {
                if (recorder.state === "recording") recorder.stop();
            }, 30000);
            setState("recording");
        } catch (e) {
            console.error("Microphone access failed:", e);
            setState("error");
            setTimeout(() => setState("idle"), 2500);
        }
    };

    const stopRecording = () => {
        clearTimeout(maxTimerRef.current);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") mediaRecorderRef.current.stop();
    };

    const handleRecordingComplete = async (stream, mimeType) => {
        clearTimeout(maxTimerRef.current);
        stream.getTracks().forEach((tr) => tr.stop());
        setState("busy");
        try {
            const blob = new Blob(chunksRef.current, { type: mimeType });
            if (blob.size < 1500) throw new Error("Recording too short"); // tapped start/stop with nothing said
            // Bhashini is told the audio is 16 kHz WAV, so convert before sending.
            const base64Audio = await blobToWavBase64(blob, 16000);

            const transcribeRes = await fetch(`${apiUrl}/api/voice/transcribe`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ audio_base64: base64Audio, language }),
            });
            const transcribeData = await transcribeRes.json();
            if (!transcribeData.available || !transcribeData.transcript) {
                throw new Error(transcribeData.message || "No transcript returned");
            }
            if (onTranscript) onTranscript(transcribeData.transcript);

            const parseRes = await fetch(`${apiUrl}/api/voice/parse-intent`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ transcript: transcribeData.transcript, fields, language }),
            });
            const parseData = await parseRes.json();
            if (!parseData.available || !parseData.values) {
                throw new Error(parseData.message || "Could not extract fields");
            }

            onResult(parseData.values);
            setState("idle");
        } catch (e) {
            console.warn("Voice input failed:", e.message);
            setState("error");
            setTimeout(() => setState("idle"), 2500);
        }
    };

    const dim = size === "large" ? "w-20 h-20" : "w-12 h-12";
    const iconSize = size === "large" ? "text-[36px]" : "text-[22px]";

    const colorClasses =
        state === "recording"
            ? "bg-[#ba1a1a] animate-pulse"
            : state === "busy"
                ? "bg-[#845400] opacity-80 cursor-wait"
                : state === "error"
                    ? "bg-[#ba1a1a]/70"
                    : "bg-[#845400] hover:bg-[#6b4400] active:scale-95";

    const icon = state === "recording" ? "stop" : state === "busy" ? "hourglass_empty" : state === "error" ? "mic_off" : "mic";

    return (
        <div className="flex flex-col items-center gap-2">
            <button
                type="button"
                aria-label={t.idle}
                onClick={state === "recording" ? stopRecording : state === "idle" || state === "error" ? startRecording : undefined}
                disabled={state === "busy"}
                className={`${dim} rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white transition-all ${colorClasses}`}
            >
                <span className={`material-symbols-outlined ${iconSize}`}>{icon}</span>
            </button>
            <span className="text-sm font-bold text-[#514536] text-center">
                {state === "error" ? t.err : state === "recording" ? t.recording : state === "busy" ? t.busy : t.idle}
            </span>
        </div>
    );
}
