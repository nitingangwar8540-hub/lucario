import json
import unittest
from pathlib import Path
from unittest.mock import AsyncMock, Mock, patch

from fastapi.testclient import TestClient
from backend.main import create_app

ROOT = Path(__file__).resolve().parents[2]
FIXTURE = json.loads((ROOT / "data/integration/matching-exchange.example.json").read_text("utf-8"))


class DiscoveryTest(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(create_app())
        self.addCleanup(self.client.close)
        keys = patch.dict("os.environ", {"GEMINI_API_KEY": "", "ELEVENLABS_API_KEY": ""})
        keys.start()
        self.addCleanup(keys.stop)

    def test_ten_fictional_profiles(self):
        base = FIXTURE["request"]["profile"]
        cases = [
            (base, "manual_review"),
            ({}, "needs_information"),
            ({**base, "class12BoardStreamPercentile": 80}, "fail"),
            ({**base, "class12BoardStreamPercentile": 81}, "manual_review"),
            ({**base, "annualFamilyIncomeInr": 450000}, "manual_review"),
            ({**base, "annualFamilyIncomeInr": 450001}, "fail"),
            ({**base, "annualFamilyIncomeInr": 0}, "manual_review"),
            ({**base, "receivesOtherScholarshipOrFeeReimbursement": True}, "fail"),
            ({**base, "receivesOtherScholarshipOrFeeReimbursement": None}, "needs_information"),
            ({"category": "st"}, "needs_information"),
        ]
        for profile, status in cases:
            with self.subTest(profile=profile):
                response = self.client.post("/api/discover", json={**FIXTURE["request"], "profile": profile})
                self.assertEqual(response.status_code, 200)
                results = {r["scholarship"]["id"]: r for r in response.json()["results"]}
                self.assertEqual(len(results), 10)
                self.assertEqual(results["nsp-pm-usp-csss"]["status"], status)
                for r in results.values():
                    self.assertRegex(r["scholarship"]["officialUrl"], r"^https://(scholarships\.gov\.in|bmsce\.ac\.in|[^/]+\.karnataka\.gov\.in)/")

    def test_translations_preserve_rules_sources_and_checklist(self):
        summaries = set()
        for language in ("kn", "hi", "en"):
            result = self.client.post("/api/discover", json={**FIXTURE["request"], "language": language}).json()
            summaries.add(result["explanation"])
            for fixture in FIXTURE["response"]["results"]:
                row = next(r for r in result["results"] if r["scholarship"]["id"] == fixture["schemeId"])
                self.assertEqual(row["status"], "manual_review")
                self.assertEqual(row["scholarship"]["requiredDocuments"], fixture["requiredDocuments"])
                self.assertEqual(row["scholarship"]["officialUrl"], fixture["officialUrl"])
        self.assertEqual(len(summaries), 3)

    def test_provider_unavailable_preserves_text_path(self):
        self.assertEqual(self.client.post("/api/transcribe?language=kn", content=b"demo",
                         headers={"Content-Type": "audio/webm"}).status_code, 503)
        self.assertEqual(self.client.post("/api/speech", json={"text": "demo", "language": "kn"}).status_code, 503)
        self.assertEqual(self.client.post("/api/guidance/unsupported").status_code, 404)

    def test_gemini_selection_is_bounded_by_real_catalog(self):
        with patch.dict("os.environ", {"GEMINI_API_KEY": "fixture", "GEMINI_MODEL": "fixture"}), \
             patch("backend.demo.httpx.AsyncClient.post", new_callable=AsyncMock) as post:
            for ids, mode, count in [(["nsp-pm-usp-csss"], "gemini", 1), ([], "gemini", 0),
                                     (["invented"], "catalog", 10)]:
                post.return_value = Mock(**{"json.return_value": {
                    "candidates": [{"content": {"parts": [{"text": json.dumps(ids)}]}}]}})
                payload = self.client.post("/api/discover", json=FIXTURE["request"]).json()
                self.assertEqual(payload["interpretation"], mode)
                self.assertEqual(len(payload["results"]), count)
