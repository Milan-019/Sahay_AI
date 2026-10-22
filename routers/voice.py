"""
backend/routers/voice.py
Voice endpoints for Bhashini Text-to-Speech (TTS).
Seamlessly bridges frontend voice components with Bhashini Indic voice models.
"""

import json
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from engine.bhashini import is_bhashini_configured, synthesize_speech, transcribe_speech

router = APIRouter(prefix="/api/voice", tags=["voice"])


class TTSRequest(BaseModel):
    text: str = Field(..., description="Text content to synthesize into speech")
    language: str = Field("hi", description="ISO language code ('hi', 'mr', 'ta', 'en')")
    gender: str = Field("female", description="Preferred speaker gender ('female' or 'male')")


class TTSResponse(BaseModel):
    available: bool
    audio_base64: str | None = None
    audio_format: str = "audio/wav"
    language: str = "hi"
    fallback_to_browser: bool = False
    message: str | None = None


@router.get("/status")
def get_voice_status():
    """Returns whether Bhashini Indic voice service is configured and ready."""
    configured = is_bhashini_configured()
    return {
        "bhashini_configured": configured,
        "supported_languages": ["hi", "mr", "ta", "en"],
        "provider": "MeitY Bhashini" if configured else "Browser Web Speech API Fallback",
    }


@router.post("/tts", response_model=TTSResponse)
def text_to_speech(req: TTSRequest):
    """
    Generates high-fidelity Indic speech from text using Bhashini.
    If unconfigured or if Bhashini times out, signals the frontend to
    gracefully fall back to client-side Web Speech API without failing.
    """
    if not is_bhashini_configured():
        return TTSResponse(
            available=False,
            fallback_to_browser=True,
            language=req.language,
            message="Bhashini credentials not set in backend/.env; using browser speech fallback.",
        )

    res = synthesize_speech(text=req.text, language=req.language, gender=req.gender)
    if not res or not res.get("audio_base64"):
        return TTSResponse(
            available=False,
            fallback_to_browser=True,
            language=req.language,
            message="Bhashini synthesis unavailable or timed out; using browser speech fallback.",
        )

    return TTSResponse(
        available=True,
        audio_base64=res["audio_base64"],
        audio_format=res.get("audio_format", "audio/wav"),
        language=res.get("language", req.language),
        fallback_to_browser=False,
        message="Synthesized successfully via Bhashini.",
    )


class TranscribeRequest(BaseModel):
    audio_base64: str = Field(..., description="Base64-encoded WAV audio")
    language: str = Field("hi", description="ISO language code ('hi', 'mr', 'ta', 'en')")
    sampling_rate: int = 16000


class TranscribeResponse(BaseModel):
    available: bool
    transcript: str | None = None
    language: str = "hi"
    message: str | None = None


@router.post("/transcribe", response_model=TranscribeResponse)
def speech_to_text(req: TranscribeRequest):
    """Converts spoken audio (base64 WAV) into text via Bhashini ASR."""
    if not is_bhashini_configured():
        return TranscribeResponse(
            available=False, language=req.language,
            message="Bhashini credentials not set in backend/.env.",
        )

    res = transcribe_speech(req.audio_base64, req.language, req.sampling_rate)
    if not res or not res.get("transcript"):
        return TranscribeResponse(
            available=False, language=req.language,
            message="Bhashini ASR unavailable, timed out, or audio unclear.",
        )

    return TranscribeResponse(available=True, transcript=res["transcript"], language=res["language"])


class ParseIntentRequest(BaseModel):
    transcript: str = Field(..., description="Raw ASR transcript, in the applicant's own language")
    fields: dict[str, str] = Field(
        ..., description="Field name -> plain-language description of what to extract for it"
    )
    language: str = "hi"


class ParseIntentResponse(BaseModel):
    available: bool
    values: dict | None = None
    message: str | None = None


@router.post("/parse-intent", response_model=ParseIntentResponse)
def parse_voice_intent(req: ParseIntentRequest):
    """
    Extracts structured form field values from a raw voice transcript.
    Generic/reusable across pages: caller supplies which fields it wants
    and a plain description of each — this endpoint doesn't hardcode any
    page's form shape.

    PII NOTE: transcript here is business-intent speech only (location,
    capital, trade, name as volunteered for a form) — the same boundary
    feasibility.py's LLM prompts already enforce applies here. Do not
    route identity-document content through this endpoint.
    """
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        return ParseIntentResponse(available=False, message="GROQ_API_KEY not configured.")

    field_list = "\n".join(f'- "{name}": {desc}' for name, desc in req.fields.items())
    system_prompt = (
        "You extract structured form values from a spoken transcript in an "
        "Indian regional language. Respond ONLY with a single JSON object "
        "whose keys are exactly the requested field names. Use null for any "
        "field not clearly stated in the transcript — never guess. For "
        "numeric fields, return a plain number (no currency symbols or "
        "commas). Do not include any field not in the requested list."
    )
    user_prompt = f"Transcript ({req.language}): \"{req.transcript}\"\n\nExtract these fields:\n{field_list}"

    try:
        from groq import Groq
        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model=os.environ.get("GROQ_MODEL", "openai/gpt-oss-120b"),
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.1,
        )
        values = json.loads(response.choices[0].message.content)
        return ParseIntentResponse(available=True, values=values)
    except Exception as e:
        return ParseIntentResponse(available=False, message=f"Parsing failed: {e}")
