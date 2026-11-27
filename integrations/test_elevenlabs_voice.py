import json
import unittest

import httpx

from integrations.elevenlabs_voice import ElevenLabsVoice, VoiceServiceError


class ElevenLabsVoiceTests(unittest.IsolatedAsyncioTestCase):
    def adapter(self, handler):
        client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
        self.addAsyncCleanup(client.aclose)
        return ElevenLabsVoice(client, api_key="mock-key", voice_id="demo-voice")

    async def test_transcribes_kannada_recording(self):
        transcript = "ವಿದ್ಯಾರ್ಥಿವೇತನಗಳನ್ನು ಹುಡುಕಿ."

        def handle(request):
            self.assertEqual(request.url.path, "/v1/speech-to-text")
            self.assertEqual(request.headers["xi-api-key"], "mock-key")
            self.assertIn(b"scribe_v3", request.content)
            self.assertIn(b'name="language_code"\r\n\r\nkn', request.content)
            self.assertIn(b'filename="recording.webm"', request.content)
            return httpx.Response(200, json={"text": transcript})

        voice = self.adapter(handle)
        result = await voice.transcribe(b"example recording", media_type="audio/webm;codecs=opus", language="kn")
        self.assertEqual(result, transcript)

    async def test_synthesizes_supported_languages(self):
        for language, explanation in {"kn": "ಪರಿಶೀಲನೆ ಅಗತ್ಯ.", "hi": "पुष्टि आवश्यक है।", "en": "Review needed."}.items():
            with self.subTest(language=language):
                def handle(request):
                    self.assertEqual(request.url.path, "/v1/text-to-speech/demo-voice")
                    self.assertEqual(request.url.params["output_format"], "mp3_44100_128")
                    self.assertEqual(json.loads(request.content), {
                        "text": explanation, "model_id": "eleven_v3", "language_code": language,
                    })
                    return httpx.Response(200, content=b"mock mp3", headers={"content-type": "audio/mpeg"})

                voice = self.adapter(handle)
                self.assertEqual(await voice.synthesize(explanation, language=language), b"mock mp3")

    async def test_rejects_invalid_input_before_calling_provider(self):
        voice = self.adapter(lambda request: self.fail("Unexpected provider call"))
        with self.assertRaises(ValueError):
            await voice.transcribe(b"", media_type="audio/webm", language="kn")
        with self.assertRaises(ValueError):
            await voice.transcribe(b"recording", media_type="application/pdf", language="kn")
        with self.assertRaises(ValueError):
            await voice.synthesize("Review needed.", language="de")

    async def test_provider_errors_allow_text_fallback(self):
        voice = self.adapter(lambda request: httpx.Response(429, text="provider details"))
        with self.assertRaisesRegex(VoiceServiceError, "Continue with text"):
            await voice.synthesize("Review needed.", language="en")

    async def test_empty_transcript_allows_typed_fallback(self):
        voice = self.adapter(lambda request: httpx.Response(200, json={"text": " "}))
        with self.assertRaisesRegex(VoiceServiceError, "type your request"):
            await voice.transcribe(b"recording", media_type="audio/wav", language="kn")
