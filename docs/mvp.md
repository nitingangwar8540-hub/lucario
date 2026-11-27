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

Assign a lead and agree on the completion check before starting each phase. Use draft pull requests for feedback, with check results and screenshots for visible changes. Keep phase branches open until final integration. Follow the [team commit conventions](architecture-workflow.md#day-to-day-workflow-and-commit-rules).

### Phase 1 — Frontend foundation

**Lead** · Frontend

**Stack requirements** · Node.js and npm, React, Vite, Tailwind CSS, PostCSS, and Oxlint. Install the existing dependencies with `npm ci` in `frontend/`.

- [ ] Resolve the missing landing-page imports and the Tailwind icon stylesheet error.
- [ ] Build the student profile form, scholarship results view, and document checklist view.
- [ ] Connect the views with local fixtures so a fictional profile can complete the flow.
- [ ] Run `npm run lint` and `npm run build`. Verify that the landing page and dashboard render.

### Phase 2 — Verified scholarship catalog

**Lead** · Data

**Stack requirements** · Local JSON fixtures, official NSP and Karnataka SSP sources, and AWS S3 for the hosted catalog.

Work on the `catalog` branch. After each subphase, record what changed, how you checked it, and what you learned.

#### 2.1 — Define the catalog format

- [x] Define a JSON record with a unique scheme ID, name, source portal, official URL, application cycle, deadline, eligibility criteria, required documents, and last-checked date.
- [x] Document the proposed field names, types, date format, and unknown values. Store eligibility rules in fields the API can evaluate and retain source wording for exceptions.
- [x] Add a fictional example and validate it independently against the schema. Review the contract with the frontend and API owners during the fixture handoff.

See the [catalog format and example](../data/catalog/README.md).

**What you learn.** A shared data format lets the dashboard and matching API use the same record. Keeping the deadline and last-checked date separate tells a student both when to apply and when the team verified the details.

#### 2.2 — Verify the first five schemes

- [x] Find at least five schemes across official NSP and Karnataka SSP sources.
- [x] Check eligibility, required documents, and the deadline against the official scheme page or notice for the same application cycle. Record the link and verification date. Mark undisclosed values as unknown.
- [x] Add the five records to the [local JSON catalog](../data/catalog/scholarships.json) and check that the file parses and every ID is unique.

**What you learn.** Checking the application cycle prevents mixing last year's deadline with this year's rules. An explicit unknown value lets the dashboard flag a missing detail and direct the student to the official source.

#### 2.3 — Hand off and test the fixture

- [x] Share the fixture path and field definitions in the [catalog draft pull request](https://github.com/nitingangwar8540-hub/lucario/pull/1).
- [ ] Check that the dashboard displays a source link and document checklist once the frontend is ready.
- [x] Verify the source and checklist data independently, and exercise eligibility rules with a fictional profile. Resolve any fixture field or type mismatches.

**What you learn.** A handoff tests the format against how teammates actually use it. A case such as an income exactly at the published limit can reveal whether the rule needs an inclusive or exclusive comparison.

#### 2.4 — Complete the demo catalog

- [ ] Expand to 10 verified schemes and repeat the source and format checks on every added record.
- [ ] Make the 10-record fixture available for demo testing. For hosted delivery, verify that the S3 copy and the local fallback load with the same fields and value types.

**What you learn.** Adding records tests whether the format covers differences across schemes. Keeping the hosted and local catalog shapes identical lets the matching flow use either source.

### Phase 3 — FastAPI and eligibility matching

**Leads** · Backend and frontend

**Stack requirements** · Python, FastAPI, a Python rules engine, the Phase 2 catalog, and the React dashboard.

- [ ] Implement catalog search and profile matching endpoints.
- [ ] Evaluate each scheme's published criteria and return reasons for criteria that pass, fail, or need more information.
- [ ] Connect the dashboard to the API and generate the checklist from the selected scheme record.
- [ ] Verify that a typed profile receives source-linked results. Check missing inputs, empty results, and API errors in the UI.

### Phase 4 — Voice and browser guidance

**Leads** · Voice and browser integration

**Stack requirements** · Gemini API, ElevenLabs speech-to-text and text-to-speech, Playwright with a supported browser installed, and the Phase 3 API. Configure API credentials on the backend.

- [ ] Use Gemini to interpret requests and explain the Python rule results in Kannada, Hindi, and English.
- [ ] Connect ElevenLabs input and output to the same flow as typed requests. Test a Kannada voice request and the typed fallback.
- [ ] Use Playwright to open a supported public scheme page and demonstrate form guidance with fictional values on the demo form.
- [ ] Verify that the browser demo stops at student review and that catalog records remain accessible when the portal is unavailable.

### Phase 5 — Integration readiness and demo sign-off

**Leads** · QA and release

**Stack requirements** · React and FastAPI builds, Playwright, GitHub pull requests and checks, and fictional test profiles. Hosted delivery uses AWS Amplify for the frontend, ECS for the API and browser worker, S3 for scheme records, and DynamoDB for session and checklist state.

- [ ] Test 10 fictional profiles, including matches, failed criteria, and missing information.
- [ ] Confirm all recommendations link to official sources and measure the shortlist and checklist flow against the five-minute target.
- [ ] Rehearse microphone and portal fallbacks and verify zero automatic submissions.
- [ ] Verify the local demo environment. For hosted delivery, prepare the AWS resources and test the preview environment.

### Final integration and merge

- [ ] After all five phases pass their checks, combine the reviewed phase branches on a single integration branch. Bring in the frontend and catalog first, then matching, voice and browser guidance, and release changes.
- [ ] Resolve conflicts on the integration branch and run the frontend lint and build, API and matching checks, and Playwright demo smoke check on the combined code.
- [ ] Rehearse the full Round 1 demo on the combined build with a fictional profile. Open one final pull request into `main` with the check results and any known demo limitations.
- [ ] Merge the final pull request after review and passing checks. Verify the demo from `main`, including a smoke check on the hosted build if used.

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
