# Phase 3 engineering handoff — FastAPI and eligibility matching

- **Project** · ScholarSaarthi
- **Branch** · `back-end`
- **Verification date** · November 27, 2026

Phase 3 delivered FastAPI catalog search, scheme lookup, and transparent eligibility matching. It returns source wording and a status for every rule, and the selected scheme response includes the document checklist. The backend was tested independently. Connecting the dashboard and verifying the combined browser flow remain final integration checks. [MVP Phase 3 scope](mvp.md#phase-3--fastapi-and-eligibility-matching)

## Repository files

| File | Purpose |
| --- | --- |
| [main.py](../backend/main.py) | Defines the FastAPI endpoints, Vite origin access, and API error responses. |
| [models.py](../backend/models.py) | Defines the catalog shape, typed student profile, and matching responses. |
| [catalog.py](../backend/catalog.py) | Validates the fixture, checks unique IDs, labels historical records, and filters by search terms and portal. |
| [matching.py](../backend/matching.py) | Evaluates rules, preserves source text, and ranks results by cycle and status. |
| [test_api.py](../backend/tests/test_api.py) | Verifies HTTP responses, field types, rule boundaries, historical records, and errors. |
| [Backend README](../backend/README.md) | Documents setup, configuration, and the dashboard contract. |

## Implementation by subphase

### 3.1 — Load and search the shared catalog

The service defaults to `data/catalog/scholarships.json`. Set `SCHOLARSHIP_CATALOG_PATH` to the catalog team's fixture while the branches are separate. The loader validates the record shape and unique IDs. It compares each application cycle with the configured active cycle, which starts in 2026 for this prototype. [Catalog draft pull request](https://github.com/nitingangwar8540-hub/lucario/pull/1)

| Endpoint | Consumer use |
| --- | --- |
| `GET /api/scholarships` | Browse or search records with optional `q` and `portal` filters. |
| `GET /api/scholarships/{scheme_id}` | Read the chosen scheme's source, dates, and checklist. |
| `POST /api/matches` | Evaluate a typed profile and return the scheme, overall status, and rule outcomes. |

**What you learn.** A single record supports search, eligibility, and checklist views. The API can reject invalid catalog content before returning misleading partial results.

### 3.2 — Evaluate eligibility rules

The matcher supports equality, membership, numeric comparisons, and manual checks. Zero and Boolean false count as answers. Missing answers produce `unknown`, and the rule retains its `sourceText`. An overall result uses this precedence: failed rule, missing information, manual review, then pass. A pass is an automated screening result.

**What you learn.** An inclusive income limit and a strict percentile threshold require different comparisons. Testing both prevents a boundary error from giving the wrong screening result.

### 3.3 — Return the fields the dashboard needs

The matching response includes a `scholarship` object and a separate `criteria` list. The scheme response carries the official URL, application cycle, date fields, historical indicator, and `requiredDocuments`. Document rows keep their conditions. A `null` checklist means the requirements are unknown, while `[]` represents a known empty list.

**What you learn.** A missing document list and a completed checklist mean different things. Carrying the original conditions and source link lets students verify what applies.

### 3.4 — Test the API against the catalog handoff

Nine API tests passed, covering search, match status, input types, empty results, catalog failures, and the local Vite origin. A separate API smoke check passed against the ten-record PR #1 fixture. It confirmed unique IDs, two historical Karnataka records with unknown deadlines, the unavailable UGC checklist, and the CSSS source and conditional documents. [Verified catalog revision](https://github.com/nitingangwar8540-hub/lucario/blob/6cbccc1cb2ae9f2f01471be2702b92dd798655c0/data/catalog/scholarships.json)

**What you learn.** A contract can pass synthetic tests and still fail on real data. The latest shared fixture serves as a second check before the browser integration.

## Key snippets

Send this fictional profile to `POST /api/matches` to reproduce the CSSS income case.

```json
{
  "profile": {
    "class12BoardStreamPercentile": 86,
    "annualFamilyIncomeInr": 450000,
    "receivesOtherScholarshipOrFeeReimbursement": false
  },
  "portal": "nsp"
}
```

| Change to the CSSS profile | Income rule | Overall result |
| --- | --- | --- |
| Income of ₹4,50,000 | `pass` | `manual_review` for degree admission |
| Income of ₹4,50,001 | `fail` | `fail` |
| Income omitted or `null` | `unknown` | `needs_information` |

## Commands and verification

After creating the virtual environment, run these from the backend worktree root. [Environment setup](../backend/README.md)

```powershell
git status --short --branch
& backend/.venv/Scripts/python.exe -m pip install -r backend/requirements-dev.txt
& backend/.venv/Scripts/python.exe -m unittest discover -s backend/tests -v
& backend/.venv/Scripts/python.exe -m pip check
git diff --check
```

Point the API at a local copy of the catalog fixture before integration.

```powershell
$env:SCHOLARSHIP_CATALOG_PATH = 'C:\path\to\catalog\data\catalog\scholarships.json'
& backend/.venv/Scripts/python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

Open [the interactive API docs](http://127.0.0.1:8000/docs), submit the sample match, and look up `/api/scholarships/nsp-pm-usp-csss`. Verify the scheme link and conditional documents in the response.

## MVP limitations

| Limitation | MVP impact and handling |
| --- | --- |
| The branches are separate and the default catalog path depends on Phase 2. | Set `SCHOLARSHIP_CATALOG_PATH` to the shared fixture for local testing. A missing or invalid catalog returns HTTP 503. |
| The dashboard still uses the Phase 1 fixture. | Connect it to the matching and scheme endpoints. Render empty results and HTTP 422, 404, and 503 separately. |
| Matching is initial screening and the local service has no session persistence. | Surface manual criteria and official sources. Cloud catalog parity, session storage, and deployment belong to integration and release. |

## Integration acceptance checks

- **Catalog.** Confirm that all ten records load through the merged API. Preserve historical labels, unknown deadlines, and unknown checklists.
- **Dashboard.** Send typed profiles, render the source wording for each result, and show conditional checklist rows for the selected scheme. Recheck CSSS boundaries and API error handling in the browser.
- **Phase 4.** Use the same rule outcomes for voice explanations and browser guidance. Keep final submission under the student's control.
- **Final merge.** Run frontend lint and build, the backend API tests, and the combined demo before merging into `main`.
