# ScholarSaarthi architecture and team workflow

ScholarSaarthi helps students discover scholarships and fellowships and explore opportunities that fit their profiles. The first milestone is a runnable React landing page based on the Stitch design. The frontend baseline is present locally, but Phase 1 remains open until the page renders and the production build passes. [Project idea and design discussion](https://chatgpt.com/share/6b091a2c-36d4-83e8-8c3d-be89a07fe912)

## Phase 1 audit

### 1. Files and folders created

The Phase 1 scaffold contains 20 local files under `frontend/`.

| Folder | Files |
| --- | --- |
| `frontend/` | `.gitignore`, `.oxlintrc.json`, `README.md`, `index.html`, `package.json`, `package-lock.json`, `vite.config.js`, `postcss.config.js`, `tailwind.config.js` |
| `frontend/public/` | `favicon.svg`, `icons.svg` |
| `frontend/src/` | `main.jsx`, `App.jsx`, `App.css`, `index.css` |
| `frontend/src/assets/` | `hero.png`, `react.svg`, `vite.svg` |
| `frontend/src/pages/` | `HomePage.jsx` |
| `frontend/src/components/layout/` | `Header.jsx` |

The install also populated `frontend/node_modules/`, which Git ignores. `src/components/` is the parent directory for layout and future section components.

### 2. Dependencies installed

| Purpose | Installed versions |
| --- | --- |
| Application | `react@19.3.1`, `react-dom@19.3.1` |
| Build | `vite@8.4.0`, `@vitejs/plugin-react@6.3.0` |
| Styling | `tailwindcss@3.4.19`, `postcss@8.5.33`, `autoprefixer@10.7.0`, `@tailwindcss/forms@0.5.11`, `@tailwindcss/container-queries@0.1.1` |
| Lint and editor support | `oxlint@1.95.0`, `@types/react@19.3.3`, `@types/react-dom@19.3.0` |

### 3. Configuration completed

- Vite loads its React plugin. `index.html` mounts `src/main.jsx`, which imports the global stylesheet and renders `App.jsx` in React Strict Mode. npm scripts cover development, build, preview and lint.
- Tailwind v3 is wired through PostCSS and Autoprefixer. The config defines content paths, class-based dark mode, typography, spacing, radii, and four motion utilities. Core colors are deep navy `#091722`, forest green `#2c694e`, mint `#b1f0ce`, and near-white `#f7f9ff`.
- The HTML links Google Fonts for Newsreader, Plus Jakarta Sans and Material Symbols Outlined. The two Material Symbols stylesheet links overlap. The header's navigation and CTA links are placeholders. Its language menu opens and closes, with English fixed as active.
- The scaffold contains CSS motion tokens and a `hero.png` asset. The hero canvas, shader source and WebGL lifecycle hook are pending.

### 4. React and Vite runtime

A temporary Vite server returned HTTP 200 for `/` and `src/main.jsx`. `HomePage.jsx` returned HTTP 500, which blocks the React page from rendering. The temporary server was stopped after verification. The audit used Node.js `25.8.1` and npm `11.11.0`.

### 5. Tailwind CSS runtime

Vite reaches the Tailwind PostCSS plugin, but the stylesheet request returned HTTP 500. `src/index.css` line 41 tries `@apply material-symbols-outlined`. That class comes from the linked Google Fonts stylesheet and is unavailable as a Tailwind utility during compilation.

### 6. Errors and warnings

- `HomePage.jsx` imports seven missing modules: `Footer`, `HeroSection`, `CopilotSection`, `ScholarshipDirectory`, `HowItWorks`, `TestimonialsSection` and `CtaBanner`.
- The in-memory production build reported eight errors across the missing modules and the stylesheet compilation. `npm run lint` exited successfully and reported zero warnings.
- The temporary dev audit also encountered an optimizer cache URL issue caused by a `#` in the sandbox temp path. The independent production build reproduced the source blockers.

### 7. GitHub status

Local `main` had zero commits and zero tracked files. All 20 scaffold files were untracked. GitHub reported a repository size of zero and returned no branches. The audit added this local document. No files were committed or pushed. [GitHub repository](https://github.com/nitingangwar8540-hub/lucario)

## Architecture and data flow

The browser entry point is `index.html` → `main.jsx` → `App.jsx` → `HomePage.jsx`. Keep the page responsible for composing the sections and keep interaction state in the section that owns it. The page order is Header → Hero → AI Copilot Showcase → Scholarship Directory → How It Works → Testimonials → CTA Banner → Footer. Use the Dynamic Motion Stitch screen as the primary reference and the static landing page as the fallback reference.

| Stitch reference | ID |
| --- | --- |
| Project | `13550321336864567474` |
| Dynamic Motion | `7e990c12182f4640b1e5bf2708ef4ba1` |
| Static landing page | `7634ea242f964d4ca3a04acbd426bb73` |
| Shader preview | `a3770f55ed0043028fa77b0890d575f4` |

1. **Landing page and demo.** Put shared layout in `components/layout/` and feature UI under the corresponding section folders in `components/`. Use local scholarship fixtures for the directory chips, copilot tabs and Instant Match feedback. Keep the mock data interface stable so the UI can consume an API later.
2. **Motion.** Extract the GLSL embedded in the Dynamic Motion screen into local frontend files and import it with Vite's `?raw` suffix. The standalone shader preview is a design reference only. Let a hero component and hook own canvas setup, pointer and resize listeners, the animation frame loop and resource cleanup. Use the static gradient for reduced motion or unavailable WebGL.
3. **Live search and matching.** The directory requests filtered scholarship records from a server-side API. Each record carries its source URL, deadline and eligibility criteria. The matcher uses the student's volunteered preferences, applies explicit eligibility rules and returns candidates with reasons. If a language model is added, use it to explain results in the selected language and keep the source eligibility rules authoritative.
4. **Optional product features.** The original discussion also explored browser-based assistance. Scope that and the Document Vault with the project owner after the core demo. A future vault needs authenticated access and private file storage. Keep student documents out of public assets and demo fixtures.

## Technology stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, JavaScript and Vite 8. Use the Node.js and npm versions above as the verification baseline and install from `package-lock.json`. |
| Styling and motion | Tailwind CSS 3 with PostCSS and Autoprefixer. Newsreader, Plus Jakarta Sans and Material Symbols Outlined. Native WebGL with GLSL and CSS animation. |
| Code checks | Oxlint, Vite production builds and browser smoke checks. |
| Proposed for live data | Node.js and Express for the JSON API and PostgreSQL for scholarship records. Choose an AI provider only if the matching and multilingual explanation demo needs one. |
| Proposed for delivery | GitHub pull requests and GitHub Actions for lint and build checks. Choose hosting when the demo is ready to deploy. |

## Proposed phases and owners

| Phase | Work split | Completion check | Commit example |
| --- | --- | --- | --- |
| 1. Frontend foundation | Frontend owner resolves the seven imports, fixes icon CSS and verifies the scaffold. | The landing page renders, a Tailwind theme utility is visible, and lint and build pass. | `fix(p1-foundation): resolve icon stylesheet compilation` |
| 2. Landing page and interactive demo | UI owners divide header and footer, landing sections, and directory and copilot interactions. A motion owner integrates the hero canvas. | All six sections follow the Stitch order, demo filters and Instant Match respond, and the static fallback works with reduced motion and without WebGL. | `feat(p2-directory): add scholarship filter chips` |
| 3. Scholarship data and matching | Data owner prepares source-linked records. API owner builds directory and matching endpoints. Frontend owner integrates live data and handles loading, empty and error states. | Search and sample match results link back to source records. The UI explains the match and handles unavailable data. | `feat(p3-matching): return eligibility reasons` |
| 4. Integration and demo release | QA checks the student journeys, keyboard use, mobile layout and reduced-motion mode. Release owner wires build checks and publishes the approved demo. | The deployed demo passes smoke checks, and the team records the demo flow and known limitations. | `test(p4-release): cover the scholarship discovery flow` |

## Day-to-day workflow and commit rules

1. The repository owner approves the initial baseline commit and push so teammates can branch from `main`. For each later task, agree on its phase, owner and acceptance checks, then branch from the latest `main`. Example branch name: `phase-2/directory-filters`.
2. From `frontend/`, use `npm ci` to install from the lockfile and `npm run dev` to preview. Before review, run `npm run lint` and `npm run build`, then exercise the changed flow locally. Add the checks and, for UI changes, screenshots to the PR description.
3. Use `type(pN-area): imperative summary` for each commit and squash title. Use `feat` for new behavior, `fix` for corrections, `docs` for documentation, `test` for tests, `refactor` for behavior-preserving changes, and `chore` for tooling or setup. Keep one logical change per commit, use a short verb-led subject, and include ticket references or migration details in the body when relevant.
4. Match each scope to the phase of the work, such as `p1-foundation`, `p2-landing`, `p2-motion`, `p3-data`, `p3-matching` or `p4-release`. Assign the handoff document to `docs(p1-foundation): document architecture and team workflow`. Have a teammate review the PR before merging.
