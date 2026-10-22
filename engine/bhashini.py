"""
backend/engine/bhashini.py
Bhashini Indic Voice Integration (TTS - Text-to-Speech & ASR - Speech-to-Text).
Integrates with MeitY Bhashini / ULCA / Dhruva inference pipelines.

Supports:
  - Language codes: 'hi' (Hindi), 'mr' (Marathi), 'ta' (Tamil), 'en' (English).
  - Credentials: BHASHINI_USER_ID, BHASHINI_API_KEY, BHASHINI_INFERENCE_API_KEY, BHASHINI_PIPELINE_ID.
  - In-memory pipeline configuration caching to avoid redundant roundtrips.
"""

import os
import logging
import requests
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

# Bhashini Configuration Endpoints
BHASHINI_AUTH_URL = os.getenv(
    "BHASHINI_AUTH_URL",
    "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline"
)
DEFAULT_COMPUTE_URL = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"
DEFAULT_PIPELINE_ID = "64392f96daac500b55c543cd"

# In-memory cache for pipeline configs by language
_PIPELINE_CONFIG_CACHE: Dict[str, Dict[str, Any]] = {}

# Fallback service IDs (t4 inference cluster)
DEFAULT_TTS_SERVICES = {
    "hi": "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4",
    "mr": "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4",
    "ta": "ai4bharat/indic-tts-coqui-dravidian-gpu--t4",
    "en": "ai4bharat/indic-tts-coqui-indo_aryan-gpu--t4",
}
DEFAULT_ASR_SERVICES = {
    "hi": "ai4bharat/conformer-hi-gpu--t4",
    "mr": "ai4bharat/conformer-multilingual-indo_aryan-gpu--t4",
    "ta": "ai4bharat/conformer-multilingual-dravidian-gpu--t4",
    "en": "ai4bharat/whisper-medium-en--gpu--t4",
}


def is_bhashini_configured() -> bool:
    """Check if minimum required credentials for Bhashini exist."""
    user_id = os.getenv("BHASHINI_USER_ID")
    api_key = os.getenv("BHASHINI_API_KEY")
    inf_key = os.getenv("BHASHINI_INFERENCE_API_KEY")
    return bool((user_id and api_key) or inf_key)


def get_pipeline_details(language: str = "hi", task_type: str = "tts") -> Optional[Dict[str, Any]]:
    """
    Queries Bhashini's getModelsPipeline to dynamically retrieve the
    serviceId, compute endpoint, and inference authorization token.
    Caches results per (language, task_type) pair. task_type is 'tts' or 'asr'.
    """
    lang_code = language.lower()[:2]
    cache_key = f"{task_type}:{lang_code}"
    if cache_key in _PIPELINE_CONFIG_CACHE:
        return _PIPELINE_CONFIG_CACHE[cache_key]

    user_id = os.getenv("BHASHINI_USER_ID")
    api_key = os.getenv("BHASHINI_API_KEY")
    inf_api_key = os.getenv("BHASHINI_INFERENCE_API_KEY")
    pipeline_id = os.getenv("BHASHINI_PIPELINE_ID") or DEFAULT_PIPELINE_ID

    headers = {
        "Content-Type": "application/json",
    }
    if user_id:
        headers["userID"] = user_id
    if api_key:
        headers["ulcaApiKey"] = api_key

    req_payload: Dict[str, Any] = {
        "pipelineTasks": [
            {
                "taskType": task_type,
                "config": {
                    "language": {
                        "sourceLanguage": lang_code
                    }
                }
            }
        ],
        "pipelineRequestConfig": {
            "pipelineId": pipeline_id
        }
    }

    service_id = None
    compute_url = DEFAULT_COMPUTE_URL
    auth_token = inf_api_key or ""

    if user_id and api_key:
        try:
            resp = requests.post(BHASHINI_AUTH_URL, json=req_payload, headers=headers, timeout=12)
            if resp.status_code == 200:
                data = resp.json()
                
                # Extract compute endpoint (Bhashini returns 'callbackUrl')
                inference_endpoint = data.get("pipelineInferenceAPIEndPoint", {})
                compute_url = (
                    inference_endpoint.get("callbackUrl")
                    or inference_endpoint.get("endpoint")
                    or DEFAULT_COMPUTE_URL
                )

                inf_token_obj = inference_endpoint.get("inferenceApiKey", {})
                if inf_token_obj.get("value"):
                    auth_token = inf_token_obj.get("value")

                # Extract service ID matching the requested language
                pipeline_configs = data.get("pipelineResponseConfig", [])
                for p in pipeline_configs:
                    if p.get("taskType") == task_type:
                        for c in p.get("config", []):
                            lang_obj = c.get("language", {})
                            if lang_obj.get("sourceLanguage") == lang_code:
                                service_id = c.get("serviceId")
                                break
                        if not service_id and p.get("config"):
                            service_id = p["config"][0].get("serviceId")
            else:
                logger.warning("Bhashini getModelsPipeline returned %s: %s", resp.status_code, resp.text)
        except Exception as e:
            logger.warning("Failed to fetch Bhashini pipeline config: %s", e)

    # Fallback to verified service ID if not resolved dynamically
    if not service_id:
        defaults = DEFAULT_TTS_SERVICES if task_type == "tts" else DEFAULT_ASR_SERVICES
        service_id = defaults.get(lang_code, defaults["hi"])

    if not auth_token and inf_api_key:
        auth_token = inf_api_key

    config = {
        "service_id": service_id,
        "compute_url": compute_url,
        "auth_token": auth_token,
    }
    _PIPELINE_CONFIG_CACHE[cache_key] = config
    return config


MAX_TTS_CHARS = int(os.getenv("BHASHINI_MAX_TTS_CHARS", "4000"))


def _clean_tts_text(text: str, language: str) -> str:
    """
    Pre-processes text for Indic TTS. FIXED: this previously hard-capped
    ALL text to ~220 characters (~1-2 sentences) regardless of what was
    passed in, "for fast <4s audio synthesis" — which is why TTS only
    ever spoke a short summary no matter how much detail the frontend
    sent. Raised to MAX_TTS_CHARS (4000 by default, ~2-3 min of speech),
    overridable via BHASHINI_MAX_TTS_CHARS. Only trims if text exceeds
    that much higher ceiling, and still snaps to the nearest sentence
    boundary rather than cutting mid-word.
    """
    cleaned = text.replace("₹", "रुपये ").replace("$", "").replace("&", "और")
    cleaned = cleaned.replace("“", "").replace("”", "").replace('"', "")

    if len(cleaned) > MAX_TTS_CHARS:
        truncated = cleaned[:MAX_TTS_CHARS]
        for delimiter in ["। ", ". ", "! "]:
            idx = truncated.rfind(delimiter)
            if idx > MAX_TTS_CHARS * 0.6:  # don't snap back too aggressively
                return truncated[: idx + len(delimiter)].strip()
        cleaned = truncated.strip()
    return cleaned.strip()


def synthesize_speech(text: str, language: str = "hi", gender: str = "female") -> Optional[Dict[str, Any]]:
    """
    Calls Bhashini TTS compute pipeline to convert text into authentic Indic audio.
    Returns dict: {"audio_base64": str, "audio_format": "audio/wav", "language": str}
    or None if unconfigured / failed.
    """
    if not text or not text.strip():
        return None

    lang_code = language.lower()[:2]
    if lang_code not in ["hi", "mr", "ta", "en"]:
        lang_code = "hi"

    pipeline = get_pipeline_details(lang_code)
    if not pipeline or not pipeline.get("auth_token"):
        logger.info("Bhashini auth token missing; cannot synthesize audio.")
        return None

    compute_url = pipeline.get("compute_url", DEFAULT_COMPUTE_URL)
    service_id = pipeline.get("service_id")
    auth_token = pipeline.get("auth_token")

    headers = {
        "Content-Type": "application/json",
        "Authorization": auth_token,
    }

    clean_source = _clean_tts_text(text, lang_code)

    payload = {
        "pipelineTasks": [
            {
                "taskType": "tts",
                "config": {
                    "language": {
                        "sourceLanguage": lang_code
                    },
                    "serviceId": service_id,
                    "gender": gender
                }
            }
        ],
        "inputData": {
            "input": [
                {
                    "source": clean_source
                }
            ]
        }
    }

    try:
        # Set 30s timeout to allow large audio generation if needed
        resp = requests.post(compute_url, json=payload, headers=headers, timeout=30)
        if resp.status_code == 200:
            data = resp.json()
            pipeline_resp = data.get("pipelineResponse", [])
            for item in pipeline_resp:
                if item.get("taskType") == "tts":
                    audios = item.get("audio", [])
                    if audios and audios[0].get("audioContent"):
                        return {
                            "audio_base64": audios[0]["audioContent"],
                            "audio_format": "audio/wav",
                            "language": lang_code,
                            "service_id": service_id,
                        }
        else:
            logger.warning("Bhashini TTS compute returned %s: %s", resp.status_code, resp.text)
    except Exception as e:
        logger.error("Bhashini TTS compute exception: %s", e)

    return None


def transcribe_speech(audio_base64: str, language: str = "hi", sampling_rate: int = 16000) -> Optional[Dict[str, Any]]:
    """
    Calls Bhashini ASR compute pipeline to convert spoken audio (base64 WAV)
    into text. Mirrors synthesize_speech's pipeline-config pattern.
    Returns dict: {"transcript": str, "language": str} or None if
    unconfigured / failed.

    PII NOTE: this is a transcription service for BUSINESS-INTENT speech
    (location, capital, trade category) ONLY — the same boundary that
    governs feasibility.py's LLM calls elsewhere in this codebase applies
    here. Do not route identity-document audio through this function.
    """
    if not audio_base64:
        return None

    lang_code = language.lower()[:2]
    if lang_code not in ["hi", "mr", "ta", "en"]:
        lang_code = "hi"

    pipeline = get_pipeline_details(lang_code, task_type="asr")
    if not pipeline or not pipeline.get("auth_token"):
        logger.info("Bhashini auth token missing; cannot transcribe audio.")
        return None

    compute_url = pipeline.get("compute_url", DEFAULT_COMPUTE_URL)
    service_id = pipeline.get("service_id")
    auth_token = pipeline.get("auth_token")

    headers = {
        "Content-Type": "application/json",
        "Authorization": auth_token,
    }

    payload = {
        "pipelineTasks": [
            {
                "taskType": "asr",
                "config": {
                    "language": {"sourceLanguage": lang_code},
                    "serviceId": service_id,
                    "audioFormat": "wav",
                    "samplingRate": sampling_rate,
                },
            }
        ],
        "inputData": {"audio": [{"audioContent": audio_base64}]},
    }

    try:
        resp = requests.post(compute_url, json=payload, headers=headers, timeout=30)
        if resp.status_code == 200:
            data = resp.json()
            pipeline_resp = data.get("pipelineResponse", [])
            for item in pipeline_resp:
                if item.get("taskType") == "asr":
                    outputs = item.get("output", [])
                    if outputs and outputs[0].get("source"):
                        return {"transcript": outputs[0]["source"], "language": lang_code}
        else:
            logger.warning("Bhashini ASR compute returned %s: %s", resp.status_code, resp.text)
    except Exception as e:
        logger.error("Bhashini ASR compute exception: %s", e)

    return None
