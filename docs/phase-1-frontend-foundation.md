# Phase 1 engineering handoff — Frontend foundation

- **Project** · ScholarSaarthi
- **Branch** · `front-end`
- **Verification date** · November 27, 2026

Phase 1 delivered a working React and Vite landing page and student dashboard. A fictional student can enter a profile, see which scholarship rules apply, and track the documents for a selected scheme. The dashboard currently runs against three local demo records. [MVP Phase 1 scope](mvp.md#phase-1--frontend-foundation)

## Repository files

| File | Purpose |
| --- | --- |
| [App.jsx](../frontend/src/App.jsx) | Routes between the landing page and dashboard using the URL hash. |
| [HomePage.jsx](../frontend/src/pages/HomePage.jsx) and [Header.jsx](../frontend/src/components/layout/Header.jsx) | Implement the landing page, quick profile form, sample directory, source filters, and navigation. |
| [Dashboard.jsx](../frontend/src/pages/Dashboard.jsx) | Collects the profile, shows rule outcomes, and stores checklist progress by scheme ID. |
| [scholarships.js](../frontend/src/data/scholarships.js) | Contains three fictional schemes, a sample profile, and the temporary browser-side matcher. |
| [GlassCard.jsx](../frontend/src/components/GlassCard.jsx) and [index.css](../frontend/src/index.css) | Provide frosted cards, pointer highlights, shadows, and reduced-motion styling. |

## Implementation by subphase

### 1.1 — Restore the frontend build

The landing page previously imported a footer and six section components that were absent. It now renders its sections with working navigation. Material Symbols are styled directly in CSS so Tailwind can compile the stylesheet.

**What you learn.** Tailwind can expand its utilities with `@apply`. A class from an external font stylesheet needs to be used directly or styled in CSS.

### 1.2 — Connect the landing page and dashboard

The landing form carries study level and domicile to the dashboard in the URL hash. The dashboard validates those selections and keeps income and score in page state. Blank fields are supported, and the sample-profile button fills all four fields.

**What you learn.** A hash route supports direct dashboard links on a static host. Passing only study level and domicile avoids putting income or scores in browser history.

### 1.3 — Show results and track documents

The local matcher distinguishes satisfied, unmet, and unanswered rules. Results can be filtered by portal. The dashboard opens a checklist by scheme ID and keeps each scheme’s selections while the student moves between results.

**What you learn.** Stable IDs keep the right result, source, and checklist together. Separate rule outcomes tell a student whether to supply more information or review an unmet condition.

### 1.4 — Apply the Stitch styling and card motion

The landing page follows the centered headline and quick form in the Dynamic Motion HTML. Directory and result cards lift and tilt with a fine pointer. Forms and checklists stay steady. The hero uses CSS background motion, and the styles respect reduced-motion preferences. [Stitch project](https://stitch.google.com/projects/13550321336864567474)

**What you learn.** A stable wrapper gives pointer calculations consistent geometry while its child card tilts.

## Key snippets

The dashboard uses the selected result’s ID to find its scheme.

```jsx
const scheme = results.find(result => result.id === selectedId)
```

The active card uses pointer-driven CSS variables for its tilt.

```css
transform: translateY(-5px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg));
```

## Commands and verification

Run the checks from the frontend branch checkout.

```powershell
git status --short --branch
git diff --check
Set-Location frontend
npm.cmd ci
npm.cmd run lint
npm.cmd run build
```

Start the preview from `frontend/` with `npm.cmd run dev -- --host 127.0.0.1 --port 5173`. On [the landing page](http://127.0.0.1:5173/), choose **Undergraduate** and **Karnataka** and confirm that both selections carry into the dashboard. Then choose **Use a sample profile → Find scholarships**. The fixture returns two potential matches and one result with unmet criteria. Filter to **SSP**, open its checklist, and mark a document. Switching between schemes preserves separate counts during the session.

Lint and the production build passed. Browser checks covered the profile handoff, missing answers, filters, checklist progress, and mobile layout. The updated desktop preview also showed the glass-card effects while the checklist controls remained usable.

## MVP limitations

| Limitation | MVP impact and handling |
| --- | --- |
| The dashboard uses fictional schemes and local matching. | The current links lead to portal home pages. The Phase 2 and Phase 3 integration supplies verified records and scheme-specific links. |
| The profile form collects a generic exam score. | Add a separate Class XII board-and-stream percentile field for CSSS. Map the API’s income, other-support and additional scheme-specific fields with their documented types. |
| Checklist state is local to the dashboard session. | A page reload or departure from the dashboard clears selections. |
| The landing page uses CSS motion. | The Stitch WebGL shader remains outside the Phase 1 implementation. |

## Integration acceptance checks

- **Catalog display.** Show scheme-specific links, application cycles, deadlines, last-checked dates, and historical labels from the API.
- **Profile and results.** Run CSSS through the dashboard at the income limit, above the limit, and with missing income. Show manual checks, empty results, and API errors as distinct states.
- **Checklist.** Show conditional document rows and the official source when a checklist is unavailable. Use the scheme ID to keep checklist selections separate.
- **Final browser run.** Verify the combined profile → results → checklist flow before the final merge.
