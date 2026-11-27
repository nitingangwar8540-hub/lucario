# Phase 5 · Integrated Round 1 demo

The release target is a local presentation of the ten-record catalog. FastAPI serves eligibility decisions, React presents their reasons, and Playwright rehearses two fictional applications through review. The walkthrough never sends applicant details to an official portal.

## Phase 4.4 · Connect the interaction

Both typed text and the editable transcript enter `POST /api/discover` with the selected language and confirmed profile. The server evaluates the Phase 3 rules. When configured, Gemini selects catalog IDs and orders the explanation notes. FastAPI validates the IDs, counts actual outcomes and uses reviewed Kannada, Hindi or English wording. The profile form supplies eligibility values. Free-text requests select schemes, and users enter income and other eligibility facts in the form.

`POST /api/transcribe` accepts recording bytes. `POST /api/speech` reads back the visible explanation. The frontend retains typed input and readable results after provider errors. With providers disabled, a recognized scheme name or ID narrows the catalog and a general request returns every record. The UI identifies this mode.

**What you learn.** A voice transcript can contain a mistaken number. Editing the request and confirming the structured profile gives the student control over what enters the rules engine.

## Phase 5 · Run the combined demo

From the repository root in PowerShell, install once and start FastAPI in one terminal.

```powershell
python -m venv backend/.venv
backend/.venv/Scripts/python -m pip install -r backend/requirements-dev.txt
npm.cmd ci --prefix frontend
$env:PLAYWRIGHT_CHANNEL = 'chrome'
backend/.venv/Scripts/python -m uvicorn backend.main:app --port 8000
```

Start Vite in a second terminal with `npm.cmd run dev --prefix frontend` and open its localhost URL. The dev proxy sends API requests to port 8000. The Chrome channel requires an installed Chrome browser. Alternatively install bundled Chromium with `backend/.venv/Scripts/python -m playwright install chromium` and omit the channel setting.

1. Choose **Use a sample profile** on the dashboard. Review the percentile, family income, category and other-scholarship answer. Select Kannada and confirm the request.
2. Open the CSSS and PM YASASVI College results. Both require manual confirmation. Compare the criteria, dates, official links and conditional documents.
3. Run the fictional walkthrough from either checklist. The worker resolves the selected catalog ID, opens the allowlisted public source, fills an isolated form with fictional data, and returns the review to the dashboard.
4. To rehearse a portal outage, start FastAPI with `GUIDANCE_OFFLINE=1`. The official link and checklist remain available.

The 2026–27 student application deadline shown for both demo schemes was November 30, 2026 when checked November 27. Recheck before presenting a later cycle. [NSP scheme listing](https://scholarships.gov.in/All-Scholarships)

**What you learn.** Following one scheme ID through matching, explanation, checklist and browser review catches integration errors that a successful API response alone can hide.

## Verification

```powershell
backend/.venv/Scripts/python -m unittest discover -s backend/tests -v
backend/.venv/Scripts/python -m unittest discover -s integrations -v
npm.cmd run lint --prefix frontend
npm.cmd run build --prefix frontend
$env:PLAYWRIGHT_CHANNEL = 'chrome'
backend/.venv/Scripts/python integrations/smoke_dashboard.py
$env:REHEARSE_PUBLIC_SOURCE = '1'
backend/.venv/Scripts/python integrations/smoke_dashboard.py
```

The smoke script starts the built frontend and API on ports 15173 and 18000 and closes them on exit. It exercises recording with a synthetic microphone, a replayed transcript, editing, typed equivalence, denied microphone access, service errors, checklist provenance and both real browser walkthroughs. In the offline rehearsal the two reviews took 9.2 seconds. With public navigation enabled, both official sources opened and the reviews took 13.5 seconds. These are automated local timings. Ten fictional profiles covered inclusive and exclusive boundaries, missing information and failed criteria. The voice adapter tests use simulated provider responses.

## Release limits

Live Gemini interpretation and ElevenLabs transcription, pronunciation and playback still need a credentialed rehearsal by an eligible operator in an eligible audience setting. Backend configuration uses `GEMINI_API_KEY`, `GEMINI_MODEL`, `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID`. Keep credentials outside the repository. The verified release uses local JSON and local services. AWS hosting, persistent sessions and hosted smoke checks have separate deployment requirements.
