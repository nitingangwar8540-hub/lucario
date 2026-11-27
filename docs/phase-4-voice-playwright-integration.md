# Phase 4 engineering plan — Voice and Playwright integration

**Branch** · `integration`
**MVP outcome** · A student can speak a scholarship request in Kannada, hear the results, inspect a matching scheme, and review fictional values on a local demo form.

The Phase 3 FastAPI matcher supplies the result IDs, eligibility outcomes, official source links, dates, and checklists. Gemini interprets the request and explains those results in Kannada, Hindi, or English. ElevenLabs handles speech input and output. Playwright opens a supported public scheme page and guides the user through the project-owned demo form.

The `integration` branch starts from `catalog` so the existing fixture and handoff travel with it. Voice and Playwright can be developed in parallel using fixtures for the Phase 3 response. Verify against the real matcher and dashboard after those changes are available. Use the same branch for the final combined build and bring in the remaining reviewed changes before opening the final PR into `main`. [MVP workflow](mvp.md)

## 4.1 — Shared request and result contract

**Lead** · API owner with the frontend owner
**Stack** · FastAPI, existing Python eligibility rules, React, and the catalog JSON fixture.

- [x] Define a proposed shared request for typed text or confirmed voice transcripts, the selected language, and the known profile fields.
- [x] Define the result fields and status behavior for failed, missing, and manual criteria. A result with passing automated criteria and open manual checks is a **potential match**.
- [x] Build and validate the CSSS and PM YASASVI exchange fixture so voice and browser work can proceed before the live API is ready.

The frontend and backend owners review the mapping during final integration. [Matching contract and demo exchange](phase-4-matching-contract.md)

**Done when** · A single fictional request has a documented input and result that the voice UI and browser action can both consume.

**What you learn.** A shared contract keeps typed requests, voice requests, and browser guidance tied to the same eligibility result.

## 4.2 — Voice input and multilingual explanation

**Lead** · Voice owner with the frontend owner
**Stack** · ElevenLabs speech-to-text and text-to-speech, Gemini API, FastAPI, and browser microphone permissions.

Use ElevenLabs Scribe v3 for recorded requests and Eleven v3 for spoken playback in Kannada, Hindi, and English. Keep `ELEVENLABS_API_KEY` in the FastAPI server environment. An eligible team member can run live credentialed checks. The integration branch can exercise the same flow with a sample transcript and visible text. [Speech-to-text documentation](https://elevenlabs.io/docs/overview/capabilities/speech-to-text) · [Speech models](https://elevenlabs.io/docs/overview/models#eleven-v3) · [ElevenLabs terms](https://elevenlabs.io/terms-of-use)

- [x] Build the standalone Python adapter for transcription and MP3 playback and verify its requests with a mocked provider. [ElevenLabs handoff](phase-4-elevenlabs-handoff.md)
- [x] Add fixture-based explanations in Kannada, Hindi, and English for an offline rehearsal. [Sample explanations](../data/integration/voice-explanations.example.json)
- [x] Add language selection, an explicit record/stop control, and an editable transcript. Send the confirmed text through the shared request path.
- [x] Keep provider credentials on the backend. Validate the supported audio type and size and return understandable errors for provider failures and denied microphone access.
- [x] Have Gemini interpret the request and describe the rule engine's results using the selected language. Preserve the scheme ID, dates, and rule outcomes from the API, including manual review and missing inputs.
- [x] Display the explanation as text and play the same explanation through ElevenLabs. Keep typed input available during transcription errors and visible text available during speech playback errors.
- [x] Test an end-to-end Kannada request and verify Hindi and English explanations against the same structured result.

**Done when** · A Kannada voice request and its typed equivalent return the same scheme IDs and statuses. The user can correct the transcript before matching and finish the flow with text if a voice service fails.

**What you learn.** Speech recognition can mishear a scheme name or income amount. Reviewing the transcript before matching keeps the student in control of what the system evaluates.

## 4.3 — Public navigation and demo form guidance

**Lead** · Browser integration owner
**Stack** · Python Playwright, an installed Chromium browser, the catalog and Phase 3 result IDs, and a project-owned demo form.

- [x] Resolve supported CSSS and PM YASASVI catalog IDs to exact public source URLs. Require HTTPS on the NSP host and fall back on redirects.
- [x] Implement public navigation with timeouts and a fallback that retains the source link and checklist.
- [x] Populate fictional values and document placeholders in a separate offline demo form using labeled controls. Stop at the review screen and close both browser contexts.
- [x] Rehearse public navigation and the fallback from the integrated dashboard.

[Playwright handoff and demo commands](phase-4-playwright-handoff.md)

**Done when** · A selected scheme opens its supported public page or shows the fallback, and the local form reaches review with the expected fictional values.

**What you learn.** A public portal and a project-owned form serve different parts of the demo. The official page verifies provenance, and the local form gives the team a stable way to rehearse guidance.

## Phase 5 handoff — Former Phase 4.4

**Lead** · Integration owner with QA

**Stack** · React, FastAPI, the verified catalog, Gemini, ElevenLabs, and Playwright.

- [x] Connect the voice and browser flows to the real Phase 3 matcher and dashboard.
- [x] Recheck scheme dates before rehearsal and choose two records with usable checklists. Make historical or example results clear in the demo.
- [x] Rehearse simulated Kannada voice → editable transcript → two potential matches → source and checklist → public page → local form review.
- [x] Exercise typed fallback, denied microphone, transcription or playback failure, missing profile inputs, and portal timeout. Confirm the user can still reach the relevant source or checklist.
- [x] Run the frontend lint and build, the API checks, and the Playwright smoke test. Record the commands and results for demo sign-off.

**Done when** · The team can rehearse the full path and the fallbacks, confirm accurate eligibility wording in the UI and spoken output, and verify zero final submissions. [Phase 2 MVP limitations](phase-2-scholarship-catalog.md#mvp-limitations)

**What you learn.** An integration check follows the same record through each component. That catches problems that individual tests miss, such as voice describing one scheme while the browser opens another.

See the [Phase 5 checklist](mvp.md#phase-5--integration-readiness-and-demo-sign-off) for the combined build and release checks.

- [ ] Complete the eligible live-provider rehearsal. See the [Phase 5 runbook](phase-5-demo.md) for the scope of local verification.
