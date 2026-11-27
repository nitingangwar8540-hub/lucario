# ScholarSaarthi MVP

**Team Lucario · wHACKiest 2026 · Track 2, Beyond the Browser · Round 1**

ScholarSaarthi helps students find scholarships they may qualify for, understand why they match, and prepare to apply on the official portal. The first prototype focuses on students seeking higher education funding in Karnataka.

## Problem and proposed solution

Students must search across government portals, colleges, and private providers, then interpret different eligibility rules, deadlines, and document requirements. Language barriers can make that process harder. ScholarSaarthi brings discovery, comparison, and guided application into one student journey, with source links and explanations in Kannada, Hindi, or English.

## 24-hour prototype scope

| Capability | What the prototype should demonstrate |
| --- | --- |
| Student dashboard | Enter a sample profile in React and browse schemes from the National Scholarship Portal (NSP) and Karnataka State Scholarship Portal (SSP). Curate 5–10 schemes for the initial build and target 10 for the demo. |
| Eligibility and comparison | Check profile fields against published scheme rules. Show which conditions match, which fail, and which need more information. |
| Application preparation | Show the official scheme link, deadline, last-checked date, and required documents. Use these records to build a checklist for the selected scheme. |
| Multilingual assistance | Use ElevenLabs speech-to-text and text-to-speech to demonstrate a voice request and response. Provide a typed path and explanations in Kannada, Hindi, and English. |
| Browser guidance | Use Playwright to open a supported official scheme page and demonstrate form guidance with fictional values on a demo form. The student reviews and submits any real application on the official portal. |

## End-to-end architecture

1. **Student input.** The React and Vite dashboard captures a student profile and scholarship request. ElevenLabs transcribes voice input and reads the resulting guidance aloud.
2. **Orchestration.** A Python FastAPI backend coordinates the request, eligibility checks, and browser worker. Gemini interprets natural-language requests and explains rule results in the student's selected language.
3. **Discovery and verification.** Playwright navigates supported public portal pages. The team verifies scheme records against official sources and stores the curated catalog in S3. The wider architecture supports other state portals, colleges, and trusted private, NGO, and CSR sources.
4. **Matching.** A Python rules engine evaluates the supplied profile against the curated criteria. The API returns matches with reasons, official links, deadlines, and the fields that still need confirmation.
5. **Guided application.** The dashboard shows the selected scheme's checklist and opens the guided application flow. DynamoDB is the planned store for session and checklist state. AWS Amplify hosts the frontend in the proposed deployment, with ECS running the API and Playwright worker.

## Phase workflow

Start catalog verification alongside the frontend foundation. Build the typed discovery and matching flow first so it can support the voice and browser demos.

| Phase | Lead role | Work | Completion check |
| --- | --- | --- | --- |
| 1. Frontend foundation | Frontend | Resolve the missing landing-page imports and icon CSS build issue. Add the React student profile form, results view, and checklist view using sample data. | The landing page and dashboard render. Lint and the production build pass. A fictional profile reaches a sample result and checklist. |
| 2. Verified scholarship catalog | Data | Curate NSP and Karnataka SSP schemes. Record official URLs, eligibility criteria, deadlines, required documents, and last-checked dates. Start with local fixtures and use the same record format for S3. | At least five schemes have complete, source-checked records for API integration. Reach the 10-scheme target before demo sign-off. |
| 3. FastAPI and eligibility matching | Backend and frontend | Build catalog and matching endpoints, implement the Python eligibility rules, and connect the dashboard. Generate the checklist from the selected scheme record. | A typed profile returns source-linked results. The UI explains matched and failed criteria, flags missing information, and handles empty results and API errors. |
| 4. Voice and browser guidance | Voice and browser integration | Use Gemini for request interpretation and explanations, and ElevenLabs for speech input and output. Add Playwright navigation to one supported public scheme page and guide the student through a demo form. | A Kannada voice request reaches the same matching flow as typed input. Explanations are available in Kannada, Hindi, and English. The browser demo stops at student review, and typed input works if voice is unavailable. |
| 5. Integration and demo sign-off | QA and release | Test the demo with fictional profiles, rehearse the typed and curated-catalog fallbacks, and verify the demo environment. For hosted delivery, configure Amplify, ECS, S3, and DynamoDB, then smoke-test the hosted flow. | The team tests 10 profiles, confirms every result links to an official source, completes the shortlist and checklist flow in under five minutes, and verifies zero automatic submissions. |

Before starting a phase, assign the lead and agree on its completion check. Open a pull request with the checks run and screenshots for visible changes. Have a teammate review it before merging. See the [team workflow and commit rules](architecture-workflow.md#day-to-day-workflow-and-commit-rules).

## Round 1 demo

1. Open the dashboard and use a fictional Karnataka undergraduate profile to request scholarships in Kannada. Keep the typed request ready as a fallback.
2. Compare two sample results. Explain one matching rule and one requirement the student still needs to verify.
3. Open a selected scheme's official link and show its deadline and document checklist.
4. Demonstrate Playwright navigation and one form guidance step using the demo form. End at student review.

Use the curated catalog if a portal is unavailable. Show the last-checked date so judges can tell when the team verified the information. Use fictional profiles and document placeholders throughout the demo.

## Prototype targets

- Include 10 verified schemes and link every recommendation to an official source.
- Generate a scholarship shortlist and checklist in under five minutes.
- Test 10 sample profiles, including profiles with missing information and profiles that fail an eligibility rule.
- Record zero automatic final submissions.

## Repository status

The checkout contains a React/Vite landing-page scaffold. The student dashboard, FastAPI services, catalog, rules engine, voice integration, browser worker, and AWS deployment are planned prototype work. The hackathon architecture uses the stack from the wHACKiest 2026 submission deck. See the [frontend foundation and team workflow](architecture-workflow.md) for scaffold details and the earlier stack proposal.
