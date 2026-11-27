# Phase 4.1 matching contract

Voice and Playwright can develop against the fictional exchange on `integration`. The frontend and backend owners can use the same contract to map their code during final integration. The field names and types are a proposed interface for that handoff. [Phase 4 plan](phase-4-voice-playwright-integration.md)

| File | Purpose |
| --- | --- |
| [Matching exchange schema](../data/integration/matching-exchange.schema.json) | Defines the request and response objects. The top-level wrapper validates a complete stored exchange. |
| [Kannada demo exchange](../data/integration/matching-exchange.example.json) | A fictional request and two expected results using the CSSS and PM YASASVI catalog records. |
| [Catalog contract](../data/catalog/README.md) | Defines the source data, eligibility fields, and document conditions that appear in the response. |

## Request

Pass typed text or the user-confirmed voice transcript in `query`. Send `language` as `kn`, `hi`, or `en`. There is one matching request shape for both inputs. Audio recording and transcription happen before matching.

`profile` holds the known, confirmed fields. Omit missing fields. Annual incomes are numbers in rupees, percentages and percentiles range from 0 to 100, and yes/no values are JSON Booleans. Treat a confirmed `false` or `0` as a supplied value.

## Response

`language` echoes the request and `asOfDate` records the date the response represents. The fixture uses November 27, 2026 so its recorded deadlines remain interpretable when reused offline. Return an empty `results` array when the query has no results. If the demo uses an open-schemes filter, use the applicable deadline and exclude historical cycles from that filter.

Each result contains one catalog `schemeId`, the scheme and portal names or identifiers, the official source link, the application cycle, the recorded deadline, the last-checked date, and the document checklist. Use each document's `condition` to explain when it applies. A `null` checklist means the documents are unknown. An empty list means the source confirms zero entries. A `null` deadline means the date is unavailable.

| Criterion status | Meaning |
| --- | --- |
| `pass` | The supplied value satisfies the rule. |
| `fail` | The supplied value fails the rule. |
| `missing_input` | The profile lacks the value needed to check the rule. Use `field` to tell the student what information is needed. |
| `manual_review` | A person needs to confirm the condition. Use `reason` to show what to check. |

The API supplies a reason for every criterion. A failed criterion takes precedence and yields `not_matched`. If there are no failures and a criterion is missing or manual, return `potential_match` and show **Potential match — needs confirmation**. If all criteria pass, return `matched` and show **Matches checked criteria**. Voice can explain those outcomes in the selected language while retaining their meaning. Use the same `schemeId` when the student opens a source or starts browser guidance. Resolve the browser destination from the catalog.

The demo profile passes three automated CSSS checks and two automated PM YASASVI checks. Both results remain potential matches because admission and other conditions need review. The fixture preserves the official checklists and contains fictional profile values only.

## Verification

Run from the repository root in PowerShell 7.

```powershell
$fixture = Get-Content data/integration/matching-exchange.example.json -Raw -Encoding utf8
Test-Json -Json $fixture -SchemaFile data/integration/matching-exchange.schema.json -ErrorAction Stop
```

Schema validation checks the exchange shape. During final integration, run the same request through the actual API and verify that it returns the two fixture IDs with the expected statuses and checklist conditions.
