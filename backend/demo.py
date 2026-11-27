"""Local demo routes. Eligibility and source data always come from the catalog."""
import asyncio
import json
import os
from typing import Literal
from urllib.parse import quote

import httpx
from fastapi import APIRouter, HTTPException, Request, Response
from playwright.async_api import Error as BrowserError, async_playwright
from pydantic import BaseModel, Field

from integrations.elevenlabs_voice import ElevenLabsVoice, MAX_AUDIO_BYTES, VoiceServiceError
from integrations.playwright_guidance import SUPPORTED_SCHEMES, run_guidance
from .matching import match_profile
from .models import StudentProfile

Language = Literal["kn", "hi", "en"]
SUMMARIES = {
    "en": "Matches requiring confirmation: {}. More profile information needed: {}. Criteria not met: {}. All checked rules passed: {}.",
    "hi": "पुष्टि आवश्यक: {}। अधिक जानकारी आवश्यक: {}। मानदंड पूरे नहीं हुए: {}। सभी जाँचे गए नियम पूरे हुए: {}।",
    "kn": "ದೃಢೀಕರಣ ಅಗತ್ಯ: {}. ಹೆಚ್ಚಿನ ಮಾಹಿತಿ ಅಗತ್ಯ: {}. ಮಾನದಂಡಗಳನ್ನು ಪೂರೈಸಿಲ್ಲ: {}. ಪರಿಶೀಲಿಸಿದ ಎಲ್ಲಾ ನಿಯಮಗಳನ್ನು ಪೂರೈಸಿದೆ: {}.",
}
REVIEW_NOTES = {
    "nsp-pm-usp-csss": {
        "en": "CSSS: confirm first-year admission to a regular degree.",
        "hi": "CSSS के लिए नियमित डिग्री के पहले वर्ष में प्रवेश की पुष्टि करें।",
        "kn": "CSSS ಗಾಗಿ ನಿಯಮಿತ ಪದವಿ ಕೋರ್ಸ್‌ನ ಮೊದಲ ವರ್ಷಕ್ಕೆ ಪ್ರವೇಶವನ್ನು ದೃಢಪಡಿಸಿ.",
    },
    "nsp-pm-yasasvi-top-class-college": {
        "en": "PM YASASVI: verify that the institution and course are eligible.",
        "hi": "PM YASASVI के लिए संस्थान और पाठ्यक्रम की पात्रता जाँचें।",
        "kn": "PM YASASVI ಗಾಗಿ ಸಂಸ್ಥೆ ಮತ್ತು ಕೋರ್ಸ್ ಅರ್ಹವಾಗಿವೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ.",
    },
}


class Discovery(BaseModel):
    query: str = Field(min_length=1, max_length=500)
    language: Language
    profile: StudentProfile


class Speech(BaseModel):
    text: str = Field(min_length=1, max_length=2000)
    language: Language


async def interpret(query, matches):
    # The model can select catalog IDs only. It cannot supply facts or change a rule.
    names = {r.scholarship.id: r.scholarship.name for r in matches}
    key, model = os.getenv("GEMINI_API_KEY"), os.getenv("GEMINI_MODEL")
    if key and model:
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.post(
                    "https://generativelanguage.googleapis.com/v1beta/models/"
                    + quote(model, safe="") + ":generateContent",
                    headers={"x-goog-api-key": key},
                    json={
                        "systemInstruction": {"parts": [{"text": "Select catalog IDs explicitly requested by name. For a general scholarship request return all IDs. For an unlisted named scheme return []. Order the IDs by relevance for a spoken explanation using the supplied rule outcomes. Output a JSON array of IDs."}]},
                        "contents": [{"parts": [{"text": json.dumps({"request": query, "names": names,
                            "outcomes": {r.scholarship.id: r.status for r in matches}})}]}],
                        "generationConfig": {"responseMimeType": "application/json"},
                    },
                )
                response.raise_for_status()
                ids = json.loads(response.json()["candidates"][0]["content"]["parts"][0]["text"])
                if isinstance(ids, list) and all(isinstance(i, str) and i in names for i in ids):
                    return list(dict.fromkeys(ids)), "gemini"
        except (httpx.HTTPError, ValueError, KeyError, IndexError, TypeError):
            pass
    query = query.strip().casefold()
    ids = [i for i, name in names.items() if query in name.casefold() or i in query]
    return ids or list(names), "catalog"


def voice(client):
    try:
        return ElevenLabsVoice(client, api_key=os.getenv("ELEVENLABS_API_KEY", ""),
                               voice_id=os.getenv("ELEVENLABS_VOICE_ID", ""))
    except ValueError:
        raise HTTPException(503, "Voice is unavailable. Continue with text.") from None


def demo_router(current_catalog):
    router = APIRouter(prefix="/api")

    @router.post("/discover")
    async def discover(body: Discovery):
        catalog = current_catalog()
        if not body.query.strip():
            raise HTTPException(422, "Enter a request.")
        matches = match_profile(catalog, body.profile)
        ids, mode = await interpret(body.query, matches)
        results = [r for r in matches if r.scholarship.id in ids]
        counts = [sum(r.status == status for r in results) for status in
                  ("manual_review", "needs_information", "fail", "pass")]
        review_ids = {r.scholarship.id for r in results if r.status == "manual_review"}
        notes = [REVIEW_NOTES[i][body.language] for i in ids if i in review_ids and i in REVIEW_NOTES]
        return {"results": results, "interpretation": mode,
                "explanation": " ".join([SUMMARIES[body.language].format(*counts), *notes])}

    @router.post("/transcribe")
    async def transcribe(request: Request, language: Language):
        audio = bytearray()
        async for chunk in request.stream():
            if len(audio) + len(chunk) > MAX_AUDIO_BYTES:
                raise HTTPException(413, "Recording exceeds 10 MiB.")
            audio.extend(chunk)
        async with httpx.AsyncClient() as client:
            try:
                transcript = await voice(client).transcribe(bytes(audio), language=language,
                    media_type=request.headers.get("content-type", ""))
                return {"text": transcript}
            except ValueError as exc:
                raise HTTPException(422, str(exc)) from None
            except VoiceServiceError as exc:
                raise HTTPException(503, str(exc)) from None

    @router.post("/speech")
    async def speech(body: Speech):
        async with httpx.AsyncClient() as client:
            try:
                audio = await voice(client).synthesize(body.text, language=body.language)
                return Response(audio, media_type="audio/mpeg")
            except ValueError as exc:
                raise HTTPException(422, str(exc)) from None
            except VoiceServiceError as exc:
                raise HTTPException(503, str(exc)) from None

    @router.post("/guidance/{scheme_id}")
    def guidance(scheme_id: str):
        if scheme_id not in SUPPORTED_SCHEMES:
            raise HTTPException(404, "Guidance is unavailable for this scheme.")
        scheme = next((s for s in current_catalog() if s.id == scheme_id), None)
        if scheme is None:
            raise HTTPException(404, "Scheme missing from the current catalog.")
        async def run():
            async with async_playwright() as pw:
                browser = await pw.chromium.launch(channel=os.getenv("PLAYWRIGHT_CHANNEL") or None)
                try:
                    return await run_guidance(browser, scheme_id, offline=os.getenv("GUIDANCE_OFFLINE") == "1",
                                              record=scheme.model_dump(mode="json"))
                finally:
                    await browser.close()
        try:
            return asyncio.run(run())
        except (BrowserError, OSError, ValueError):
            raise HTTPException(503, "Browser guidance is unavailable. Use the source and checklist.") from None

    return router
