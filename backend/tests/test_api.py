import json
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory

from fastapi.testclient import TestClient

from backend.main import create_app


def scheme(scheme_id, portal="nsp", cycle="2026-27"):
    return {
        "id": scheme_id,
        "name": "Fictional Central Education Award" if portal == "nsp" else "Fictional Karnataka Award",
        "portal": portal,
        "officialUrl": "https://example.invalid/scheme",
        "applicationCycle": cycle,
        "deadline": "2026-11-30" if portal == "nsp" else None,
        "eligibilityCriteria": [
            {
                "field": "class12BoardStreamPercentile",
                "operator": "gt",
                "value": 80,
                "sourceText": "Board and stream percentile must exceed 80.",
            },
            {
                "field": "annualFamilyIncomeInr",
                "operator": "lte",
                "value": 450000,
                "sourceText": "Annual family income must be at most ₹4.5 lakh.",
            },
            {
                "field": "receivesOtherScholarshipOrFeeReimbursement",
                "operator": "eq",
                "value": False,
                "sourceText": "Fresh applicants cannot receive other scholarship support.",
            },
            {"operator": "manual", "sourceText": "Confirm regular degree admission."},
        ],
        "requiredDocuments": [
            {"name": "Class XII marksheet", "condition": None},
            {"name": "Category certificate", "condition": "Where applicable."},
        ],
        "lastCheckedDate": "2026-11-27",
    }


class MatchingApiTest(unittest.TestCase):
    def setUp(self):
        self.temp_directory = TemporaryDirectory()
        self.addCleanup(self.temp_directory.cleanup)
        self.path = Path(self.temp_directory.name) / "catalog.json"
        self.records = [
            scheme("ssp-example", "karnataka-ssp", "2025–26"),
            scheme("nsp-example"),
        ]
        self.write_catalog()
        self.client = TestClient(create_app(self.path, active_cycle_start=2026))
        self.addCleanup(self.client.close)
        self.profile = {
            "class12BoardStreamPercentile": 86,
            "annualFamilyIncomeInr": 450000,
            "receivesOtherScholarshipOrFeeReimbursement": False,
        }

    def write_catalog(self):
        self.path.write_text(json.dumps(self.records), encoding="utf-8")

    def match(self, profile, **filters):
        response = self.client.post("/api/matches", json={"profile": profile, **filters})
        self.assertEqual(response.status_code, 200, response.text)
        return response.json()

    def test_search_and_details_include_catalog_metadata(self):
        response = self.client.get("/api/scholarships", params={"q": "central  award", "portal": "nsp"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual([record["id"] for record in response.json()], ["nsp-example"])
        detail = self.client.get("/api/scholarships/nsp-example").json()
        self.assertEqual(detail["officialUrl"], "https://example.invalid/scheme")
        self.assertEqual(detail["deadline"], "2026-11-30")
        self.assertEqual(detail["lastCheckedDate"], "2026-11-27")
        self.assertEqual(detail["requiredDocuments"][1]["condition"], "Where applicable.")
        self.assertFalse(detail["isHistorical"])
        self.assertEqual(self.client.get("/api/scholarships/unknown").status_code, 404)

    def test_historical_records_keep_unknown_deadlines_and_sort_after_current_records(self):
        current, historic = self.match(self.profile)
        self.assertEqual(current["scholarship"]["id"], "nsp-example")
        self.assertEqual(historic["scholarship"]["id"], "ssp-example")
        self.assertTrue(historic["scholarship"]["isHistorical"])
        self.assertIsNone(historic["scholarship"]["deadline"])

    def test_csss_inclusive_income_and_manual_review(self):
        result, = self.match(self.profile, portal="nsp")
        self.assertEqual(result["status"], "manual_review")
        self.assertEqual([rule["status"] for rule in result["criteria"]],
                         ["pass", "pass", "pass", "manual_review"])
        self.assertEqual(result["criteria"][1]["sourceText"],
                         "Annual family income must be at most ₹4.5 lakh.")
        self.assertEqual(result["scholarship"]["requiredDocuments"][0]["name"], "Class XII marksheet")

    def test_failed_rules_take_precedence_and_missing_values_stay_unknown(self):
        result, = self.match({**self.profile, "annualFamilyIncomeInr": 450001}, portal="nsp")
        self.assertEqual(result["status"], "fail")
        self.assertEqual(result["criteria"][1]["status"], "fail")
        result, = self.match({**self.profile, "annualFamilyIncomeInr": None}, portal="nsp")
        self.assertEqual(result["status"], "needs_information")
        self.assertEqual(result["criteria"][1]["status"], "unknown")
        result, = self.match({**self.profile, "class12BoardStreamPercentile": 80}, portal="nsp")
        self.assertEqual(result["criteria"][0]["status"], "fail")

    def test_zero_is_an_answer_and_wrong_types_are_rejected(self):
        result, = self.match({**self.profile, "annualFamilyIncomeInr": 0}, portal="nsp")
        self.assertEqual(result["criteria"][1]["status"], "pass")
        for key, value in [("annualFamilyIncomeInr", False), ("class12BoardStreamPercentile", 101),
                           ("receivesOtherScholarshipOrFeeReimbursement", "false")]:
            with self.subTest(key=key):
                response = self.client.post("/api/matches", json={"profile": {**self.profile, key: value}})
                self.assertEqual(response.status_code, 422)

    def test_additional_catalog_fields_support_membership_and_numeric_rules(self):
        self.records[1]["eligibilityCriteria"] = [
            {"field": "studyLevel", "operator": "in", "value": ["diploma"], "sourceText": "Diploma."},
            {"field": "customScore", "operator": "gte", "value": 40, "sourceText": "At least 40."},
            {"field": "years", "operator": "lt", "value": 5, "sourceText": "Fewer than five years."},
        ]
        self.records[1]["requiredDocuments"] = None
        self.write_catalog()
        result, = self.match({"studyLevel": "diploma", "customScore": 40, "years": 4}, portal="nsp")
        self.assertEqual(result["status"], "pass")
        self.assertIsNone(result["scholarship"]["requiredDocuments"])
        result, = self.match({"studyLevel": "diploma", "customScore": True, "years": 4}, portal="nsp")
        self.assertEqual(result["criteria"][1]["status"], "unknown")

    def test_no_results_returns_an_empty_list(self):
        self.assertEqual(self.match(self.profile, q="not a scheme"), [])
        self.assertEqual(self.client.get("/api/scholarships?q=not+a+scheme").json(), [])

    def test_missing_invalid_and_duplicate_catalogs_return_503(self):
        self.path.unlink()
        self.assertEqual(self.client.get("/api/scholarships").json()["detail"]["code"], "catalog_unavailable")
        self.path.write_text("bad JSON", encoding="utf-8")
        self.assertEqual(self.client.get("/api/scholarships").status_code, 503)
        self.records.append(self.records[0])
        self.write_catalog()
        self.assertEqual(self.client.post("/api/matches", json={"profile": {}}).status_code, 503)

    def test_vite_can_make_cross_origin_requests(self):
        response = self.client.options("/api/matches", headers={
            "Origin": "http://127.0.0.1:5173",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["access-control-allow-origin"], "http://127.0.0.1:5173")
