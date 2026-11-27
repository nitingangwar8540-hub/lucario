# Scholarship catalog format

`scholarships.schema.json` defines the shared format for the local JSON catalog and the hosted S3 copy. Use `scholarships.json` for the source-checked fixture and `scholarships.example.json` for the fictional example.

| Field | Convention |
| --- | --- |
| `id` | Stable, unique slug prefixed with the portal. Check ID uniqueness across the full catalog during verification. |
| `portal` and `officialUrl` | Use `nsp` or `karnataka-ssp` and link directly to the official scheme page or notice. |
| `applicationCycle` | Use the cycle label shown by the source. Use `null` if the source leaves it unspecified. |
| `deadline` and `lastCheckedDate` | Use `YYYY-MM-DD`. A `null` deadline means the date is unknown. Set `lastCheckedDate` to the actual verification date for every verified record. |
| `requiredDocuments` | Use `null` for an unknown list and `[]` when the source confirms zero documents. A document with a `null` condition applies to all applicants. |

Each machine-readable eligibility criterion names a proposed profile field and supplies an operator and value. In the example, `annualFamilyIncomeInr` uses rupees per year, and `studyLevel` uses a normalized string. Use `eq` for exact equality, `in` for membership, and `lt`, `lte`, `gt`, or `gte` for numeric comparisons. The example treats ₹250,000 as a match for an `lte` limit of ₹250,000. A missing profile field gives an unknown result for that criterion.

Use `manual` for exceptions or criteria that need a person to check. Keep the supporting rule in `sourceText` for every criterion.

## Frontend and API handoff

Load [scholarships.json](scholarships.json) as an array of scheme records and use `id` to select a scheme. Display `name`, `applicationCycle`, `deadline`, and `lastCheckedDate` as separate fields. Use `officialUrl` as the source link. Map each `requiredDocuments` entry to a checklist row using its `name` and show its `condition` when present. Show an unknown deadline as “Deadline unavailable.” The two 2025–26 Karnataka entries are historical examples.

The fixture uses these profile fields. The API team can map its own request names to these fields when it builds the matcher.

| Field | Type and meaning |
| --- | --- |
| `class12BoardStreamPercentile` | Number from 0 to 100. Percentile within the student's Class XII board and stream. |
| `annualFamilyIncomeInr` | Number. Annual family income in rupees. |
| `receivesOtherScholarshipOrFeeReimbursement` | Boolean. Whether the applicant currently receives either form of support. |
| `category` | Lowercase string. The current fixture uses `obc`, `ebc`, `dnt`, and `st`. |
| `nationality` | Lowercase string. The fixture checks for `indian`. |
| `disabilityPercent` | Number from 0 to 100. Certified disability percentage. |
| `annualParentalIncomeInr` | Number. Annual parental income in rupees, as required by the disability scholarship. |

For a smoke check, use a fictional CSSS applicant with a board-and-stream percentile of 86, annual family income of 450000, and the other-support field set to `false`. All three automated checks should pass, with degree admission still requiring manual review. At 450001 the income check should fail. With income omitted, it should return unknown. The fresh application checklist includes the Class XII marksheet and family income certificate, with the category and disability certificates shown only where applicable.

## Source notes

Sources checked on November 27, 2026. The three NSP dates are the student application deadlines in the 2026–27 listing. CSSS and the other NSP eligibility criteria provide initial screening for fresh applicants. Use the official pages for renewal, selection, and additional application requirements. [NSP scheme listing](https://scholarships.gov.in/All-Scholarships)

- **PM-USP CSSS.** The NSP FAQ covers the board-and-stream percentile, income ceiling, fresh eligibility, and documents. [Ministry of Education FAQ linked by NSP](https://scholarships.gov.in/public/schemeGuidelines/FAQ_DOHE_CSSS.pdf)
- **PM YASASVI college scholarship.** The specifications cover eligibility and supporting documents. For institution matching, use the list for the applicable cycle. [NSP specifications](https://scholarships.gov.in/public/schemeGuidelines/ApprovedmodifieddraftofTopClassCollege.pdf) and [2026–27 institutions and slots](https://socialjustice.gov.in/index.php/schemes/110)
- **Post-Matric Scholarship for Students with Disabilities.** Sections 2, 3, and 5 cover eligibility. The FAQ describes supporting documents and when the institution or portal collects them. [DEPwD specifications](https://scholarships.gov.in/public/schemeGuidelines/DEPDGuidelines_1.pdf) and [NSP FAQ](https://scholarships.gov.in/public/schemeGuidelines/DEPDFAQ.pdf)
- **Karnataka DTE reimbursement and defence scholarship.** Both records use the 2025–26 DTE circular, hosted by BMS College of Engineering. The circular refers applicants to SSP for the deadline, so both dates are `null`. Treat these records as historical examples and confirm current-cycle eligibility and deadlines before advertising either scheme as open. [DTE circular](https://bmsce.ac.in/assets/files/Scholarships/Circular%20for%20ST%20and%20Defence%20Scholarship%20for%20the%20year%202025-26.pdf)
