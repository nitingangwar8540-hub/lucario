# Phase 2 engineering handoff — Scholarship catalog

**Project** · ScholarSaarthi
**Branch** · `catalog`
**Catalog source review** · November 27, 2026

Phase 2 delivered a local JSON catalog of 10 scholarship schemes for the MVP. The dashboard can use it to display scheme details and document checklists. The FastAPI team can use the same records to evaluate structured eligibility criteria and show the source behind each result. All 10 records passed schema validation and the unique-ID check. The frontend dashboard check and hosted S3 parity check remain integration work. [Catalog draft pull request](https://github.com/nitingangwar8540-hub/lucario/pull/1)

## Repository files

| File | Purpose |
| --- | --- |
| [scholarships.json](../data/catalog/scholarships.json) | Canonical local demo fixture. Contains eight NSP records for 2026–27 and two historical Karnataka SSP records for 2025–26. Use this file for local integration and as the source for any hosted copy. |
| [scholarships.schema.json](../data/catalog/scholarships.schema.json) | JSON Schema Draft 7 contract for the catalog array, record fields, eligibility operators, dates, and document rows. Use it to validate fixture changes before review. |
| [scholarships.example.json](../data/catalog/scholarships.example.json) | Fictional fixture for learning and early UI development. It demonstrates an income threshold, categorical equality, a manual rule, and a conditional document. |
| [Catalog README](../data/catalog/README.md) | Consumer reference for field meanings, profile types, the fictional CSSS smoke case, and primary source notes. |
| [MVP plan](mvp.md#phase-2--verified-scholarship-catalog) | Tracks the four catalog subphases and the remaining integration checks. |

## Implementation by subphase

### 2.1 — Define the catalog contract

The catalog is an array of records with nine required keys. `id` is a stable slug for selection and lookup. `name`, `portal`, and `officialUrl` identify the scheme and its source. `applicationCycle`, `deadline`, and `lastCheckedDate` provide timing and provenance. `eligibilityCriteria` and `requiredDocuments` support the matching and checklist views.

The schema sets `additionalProperties: false` on records, criteria, and document rows. Inside a criterion, `oneOf` selects the shape for the operator. An `eq` rule takes a scalar, an `in` rule takes an array of strings, and numeric comparison rules take a number. A `manual` rule has no `field` or `value`. Every rule carries `sourceText` for the person reading the result.

**What you learn.** A schema checks how values are represented. Two otherwise valid records can still share the same ID, so we check catalog-wide ID uniqueness separately.

### 2.2 — Source and verify the first five schemes

The first batch covered PM-USP CSSS, PM YASASVI Top Class College Education, the NSP Post-Matric Scholarship for Students with Disabilities, and two Karnataka DTE schemes. For each record, we reviewed the official guideline, FAQ, or department circular and stored the link and date of review. For dated NSP records, we used the **student application** deadline from the scheme listing. The historical Karnataka circular directed applicants to SSP for its deadline, so those records retain their original cycle and a `null` deadline. [Catalog source notes](../data/catalog/README.md#source-notes)

**What you learn.** An application deadline, an institution verification deadline, and a source review date refer to different events. A recent review can confirm what a historical circular said while leaving current-cycle availability unresolved.

### 2.3 — Hand off and test the fixture

The first five records went to draft PR #1 with the field mapping and a fictional CSSS profile. The check exercised three automated criteria, one manual criterion, and the checklist data. Changing the income from ₹450,000 to ₹450,001 changed the income result from pass to fail. Omitting income produced an unknown result for that criterion. Dashboard rendering remains open in the MVP plan.

**What you learn.** A boundary case turns the phrase “up to” into testable behavior. A missing input gives the UI a reason to ask for more information.

### 2.4 — Complete the 10-scheme demo catalog

The second batch added the AICTE Pragati, Saksham, and Swanath technical degree schemes, the UGC National Scholarship for Post Graduate Studies, and the National Scholarship for Higher Education of ST Students. We validated the expanded fixture and compared it with the prior revision to confirm the first five records were preserved. The UGC application checklist is `null` because the public sources reviewed did not specify it.

**What you learn.** A shared contract can represent incomplete source data. `null` tells a consumer that a checklist is unknown, while `[]` represents a source-confirmed checklist with zero entries.

## Key snippets

This CSSS rule in the fixture uses the proposed profile field `annualFamilyIncomeInr`. Its number is expressed in rupees per year. The operator `lte` makes the upper bound inclusive.

```json
{
  "field": "annualFamilyIncomeInr",
  "operator": "lte",
  "value": 450000,
  "sourceText": "The annual family income ceiling is ₹4.5 lakh."
}
```

The schema branch below enforces the presence of a profile field and a numeric value for comparison rules. It catches typos such as entering the limit as the JSON string `"450000"`.

```json
{
  "required": ["field", "value"],
  "properties": {
    "operator": { "enum": ["lt", "lte", "gt", "gte"] },
    "value": { "type": "number" }
  }
}
```

A document row carries the text to show beside its name. Here the condition belongs to the document and applies only to the stated application type.

```json
{
  "name": "Category or caste certificate",
  "condition": "Fresh application in a reserved category."
}
```

## Commands and verification

Run the commands from the repository root. The validation blocks use PowerShell 7 with `Test-Json`. The following commands cover the original branch inspection, schema validation, and fixture checks.

```powershell
git status --short --branch
rg --files data/catalog docs
git log --oneline -4

$schema = 'data/catalog/scholarships.schema.json'
foreach ($path in 'data/catalog/scholarships.json', 'data/catalog/scholarships.example.json') {
    $json = Get-Content -LiteralPath $path -Raw -Encoding utf8
    if (-not (Test-Json -Json $json -SchemaFile $schema -ErrorAction Stop)) {
        throw "Schema validation failed for $path"
    }
}

$catalog = Get-Content 'data/catalog/scholarships.json' -Raw -Encoding utf8 | ConvertFrom-Json
if ($catalog.Count -ne 10 -or @($catalog.id | Sort-Object -Unique).Count -ne 10) {
    throw 'Expected 10 records with unique IDs'
}
$catalog | Group-Object portal, applicationCycle | Select-Object Count, Name
git diff --check
```

The expected groups are eight `nsp, 2026-27` records and two `karnataka-ssp, 2025-26` records. Schema validation confirms structure and value types. The primary source review is what supports the eligibility and deadline data.

Run this shorter reproduction of the CSSS handoff check in the same PowerShell session. It reads the actual rule and confirms the source and checklist fields available to a dashboard.

```powershell
$csss = $catalog | Where-Object id -eq 'nsp-pm-usp-csss'
$income = $csss.eligibilityCriteria | Where-Object field -eq 'annualFamilyIncomeInr'
$profile = @{ annualFamilyIncomeInr = 450000 }
$passes = $profile[$income.field] -le $income.value
$profile.annualFamilyIncomeInr = 450001
$fails = $profile[$income.field] -gt $income.value
$profile.Remove($income.field)
$unknown = -not $profile.ContainsKey($income.field)

if ($income.operator -ne 'lte' -or -not ($passes -and $fails -and $unknown)) {
    throw 'Unexpected CSSS income behavior'
}
if (([uri]$csss.officialUrl).Scheme -ne 'https' -or
    'Class XII marksheet' -notin $csss.requiredDocuments.name -or
    'Family income certificate' -notin $csss.requiredDocuments.name) {
    throw 'Expected the CSSS source link and fresh application documents'
}
```

This check exercised the data contract directly. The application matcher and dashboard must exercise the same cases through their own entry points during integration.

### Git and review history

We used `git add -- <paths>` and `git diff --cached --check` for the initial commit, then `git commit` and `git push origin catalog`. We used `gh pr create --base main --head catalog --draft` with a title and body file to open the handoff, then `gh pr view` and `gh pr edit --body-file <file>` to verify the draft and update its description. Read-only review commands are below.

```powershell
git show --stat 6460583
git show --stat 923f8e6
git show --stat 4813bda
gh pr view 1 --repo nitingangwar8540-hub/lucario --json url,isDraft,baseRefName,headRefName
```

## MVP limitations

| Limitation | MVP impact and handling |
| --- | --- |
| All 10 records include at least one manual eligibility criterion. | Passing the automated checks gives a **potential match**. Surface the outstanding checks beside the result and keep the same wording in typed, spoken, and translated responses. |
| Both Karnataka SSP records use the historical 2025–26 cycle and have unknown deadlines. | Label them as historical during browsing and exclude them from an open-schemes filter. Verify a current-cycle Karnataka SSP record before presenting that portal as a source of open opportunities. |
| All eight NSP records have a recorded student deadline of November 30, 2026. | A date-aware search can return zero open schemes after that date. Recheck the recorded deadlines before the demo and prepare a clearly labeled example walkthrough if live opportunities are unavailable. |
| The UGC postgraduate record has an unknown document checklist. | Display “Checklist unavailable” and show the official source link. Use one of the records with a documented checklist for the live walkthrough. |

The fixture-level review exercised CSSS and PM YASASVI with the same fictional profile. Both passed the automated criteria and retained manual checks. The combined dashboard and API still need an end-to-end run.

## Integration acceptance checks

- **Frontend.** Load the fixture and select records by ID. Verify source links, conditional document rows, the unavailable UGC checklist, and historical Karnataka display.
- **API.** Map the profile fields listed in the catalog README. Preserve numeric and Boolean types. Return missing inputs and manual checks as items that need review, even when the automated checks pass.
- **Hosted demo, if used.** Publish the same fixture through the agreed S3 setup. Validate the hosted copy with the same schema and compare its parsed records with the local fixture. Rehearse the local fallback during demo testing.
