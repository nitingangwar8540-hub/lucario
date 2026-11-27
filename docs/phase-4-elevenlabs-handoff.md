# Phase 4.2 ElevenLabs adapter

The adapter on `integration` is ready for the backend owner to connect to FastAPI. It exposes two asynchronous methods that operate independently of the matching engine. [Adapter source](../integrations/elevenlabs_voice.py)

| Method | Input | Output |
| --- | --- | --- |
| `transcribe` | Recording bytes, media type, and `kn`, `hi`, or `en` | Transcript text for the student to review and edit |
| `synthesize` | The explanation already shown to the student and its language | MP3 bytes for an `audio/mpeg` response |

The backend owner creates one `httpx.AsyncClient` at startup and closes it at shutdown. Instantiate `ElevenLabsVoice` with that client, the backend secret `ELEVENLABS_API_KEY`, and a configured `ELEVENLABS_VOICE_ID` for a stock voice that the team has checked in the three demo languages.

In the transcription route, enforce the adapter's 10 MiB upload limit before reading the full upload into memory. Pass the confirmed transcript through the [shared matching request](phase-4-matching-contract.md). On a validation error, let the student revise the input. On `VoiceServiceError`, keep typed input available and keep any existing explanation visible. For the demo, use fictional profile details and short sample recordings.

The backend and frontend owners can choose route paths and connect the recorder and playback controls during integration. An eligible teammate must verify live transcription and pronunciation before the demo. [ElevenLabs terms](https://elevenlabs.io/terms-of-use)

## Local verification

Run from the repository root in your development environment. The tests use an in-memory transport without credentials.

```powershell
python -m pip install -r integrations/requirements.txt
python -m unittest integrations.test_elevenlabs_voice
```
