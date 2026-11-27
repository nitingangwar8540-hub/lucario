"""ElevenLabs transport for the server-side ScholarSaarthi voice flow."""

from urllib.parse import quote

import httpx


MAX_AUDIO_BYTES = 10 * 1024 * 1024
MAX_SPEECH_CHARACTERS = 2_000
SUPPORTED_LANGUAGES = {"kn", "hi", "en"}
AUDIO_EXTENSIONS = {
    "audio/webm": "webm",
    "audio/ogg": "ogg",
    "audio/mp4": "m4a",
    "audio/wav": "wav",
    "audio/mpeg": "mp3",
}
BASE_URL = "https://api.elevenlabs.io/v1"


class VoiceServiceError(RuntimeError):
    """A provider error that callers can handle with the typed or text fallback."""


class ElevenLabsVoice:
    def __init__(self, client: httpx.AsyncClient, *, api_key: str, voice_id: str):
        self._client = client
        self._api_key = api_key.strip()
        self._voice_id = voice_id.strip()
        if not self._api_key or not self._voice_id:
            raise ValueError("ElevenLabs API key and voice ID are required.")

    async def transcribe(self, audio: bytes, *, media_type: str, language: str) -> str:
        self._validate_language(language)
        media_type = media_type.partition(";")[0].strip().lower()
        extension = AUDIO_EXTENSIONS.get(media_type)
        if extension is None:
            raise ValueError("Unsupported recording format.")
        if not 0 < len(audio) <= MAX_AUDIO_BYTES:
            raise ValueError("The recording must contain audio and be at most 10 MiB.")

        response = await self._post(
            "/speech-to-text",
            accept="application/json",
            data={
                "model_id": "scribe_v3",
                "language_code": language,
                "timestamps_granularity": "none",
                "tag_audio_events": "false",
            },
            files={"file": (f"recording.{extension}", audio, media_type)},
        )
        try:
            payload = response.json()
        except (ValueError, UnicodeError):
            raise VoiceServiceError("Transcription returned an unreadable response.") from None
        transcript = payload.get("text") if isinstance(payload, dict) else None
        if not isinstance(transcript, str) or not transcript.strip():
            raise VoiceServiceError("No transcript was returned. Try again or type your request.")
        return transcript.strip()

    async def synthesize(self, explanation: str, *, language: str) -> bytes:
        self._validate_language(language)
        explanation = explanation.strip()
        if not 0 < len(explanation) <= MAX_SPEECH_CHARACTERS:
            raise ValueError("Speech text must contain 1 to 2,000 characters.")

        response = await self._post(
            f"/text-to-speech/{quote(self._voice_id, safe='')}",
            accept="audio/mpeg",
            params={"output_format": "mp3_44100_128"},
            json={"text": explanation, "model_id": "eleven_v3", "language_code": language},
        )
        media_type = response.headers.get("content-type", "").partition(";")[0].lower()
        if media_type != "audio/mpeg" or not response.content:
            raise VoiceServiceError("Speech playback returned no playable audio.")
        return response.content

    @staticmethod
    def _validate_language(language: str) -> None:
        if language not in SUPPORTED_LANGUAGES:
            raise ValueError("Select Kannada, Hindi, or English.")

    async def _post(self, path: str, *, accept: str, **request_options) -> httpx.Response:
        try:
            response = await self._client.post(
                f"{BASE_URL}{path}",
                headers={"xi-api-key": self._api_key, "Accept": accept},
                timeout=30.0,
                follow_redirects=False,
                **request_options,
            )
            response.raise_for_status()
        except httpx.HTTPError:
            raise VoiceServiceError("The voice service is unavailable. Continue with text.") from None
        return response
