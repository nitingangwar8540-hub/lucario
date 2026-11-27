# ScholarSaarthi Phase 3 backend

Run these commands from the repository root with Python 3.12.

```text
python -m venv backend/.venv
```

On Windows, run `backend\.venv\Scripts\Activate.ps1` in PowerShell. On macOS or Linux, run `source backend/.venv/bin/activate`. Then run:

```text
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

Open [the interactive API documentation](http://127.0.0.1:8000/docs).

The API reads `data/catalog/scholarships.json` by default. While the catalog phase is on its own branch, set `SCHOLARSHIP_CATALOG_PATH` to the absolute path of that team's fixture. Set `SCHOLARSHIP_ACTIVE_CYCLE_START` when the active application cycle changes. Its prototype default is `2026`. To allow a different web origin, set `SCHOLARSHIP_WEB_ORIGINS` to a comma-separated list. The default allows the Vite development server on port 5173.

## Dashboard contract

| Endpoint | Response |
| --- | --- |
| `GET /api/scholarships?q=central&portal=nsp` | Scheme records matching optional search terms and portal. |
| `GET /api/scholarships/{id}` | The selected scheme, including its checklist as `requiredDocuments`. |
| `POST /api/matches` | An array of results with `scholarship`, overall `status`, and per-rule `criteria`. Optional `q` and `portal` use the same filtering as catalog search. |

The following CSSS request uses fictional details.

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

Use the board-and-stream percentile as a separate profile field. Send rupee amounts as integers and the other-support answer as a boolean. Omit unknown fields or send `null`. Each criterion includes the published rule text and a status of `pass`, `fail`, `unknown`, or `manual_review`. The overall status is `fail` if a criterion fails, then `needs_information` if an answer is missing, then `manual_review` if a person needs to confirm any rule. A `pass` means the initial automated screening passed.

Display the application cycle, deadline, last-checked date and official link from the result. When `isHistorical` is true, label the listing as historical. Preserve a null deadline as “Deadline unavailable.” For the selected scheme, use each document’s `name` and display its `condition` when present. A null document list means the requirements are unknown. An empty list means the catalog contains no documents for that scheme.

A successful response can be an empty array. Use a separate error state for a `503` catalog outage, a `404` missing scheme, or a `422` invalid request. Keep checklist selections in the dashboard during the prototype. The API processes profiles in memory for each request.

## Verification

```text
python -m pip install -r backend/requirements-dev.txt
python -m unittest discover -s backend/tests -v
```
