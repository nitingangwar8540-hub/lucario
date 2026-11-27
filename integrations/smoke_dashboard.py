"""Rehearse the built dashboard with isolated local services and fixture audio."""
import os
import subprocess
import sys
import time
from contextlib import ExitStack
from pathlib import Path
from urllib.request import urlopen

from playwright.sync_api import expect, sync_playwright


def rehearse():
    with sync_playwright() as pw:
        browser = pw.chromium.launch(channel=os.getenv("PLAYWRIGHT_CHANNEL") or None,
            args=["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"])
        page = browser.new_page()
        errors = []
        page.on("pageerror", lambda exc: errors.append(str(exc)))
        page.goto("http://127.0.0.1:15173/#dashboard", wait_until="domcontentloaded")
        start = time.monotonic()
        page.get_by_role("button", name="Use a sample profile").click()
        record = page.get_by_role("button", name="Record request")
        record.click()
        page.get_by_role("button", name="Stop recording").click()
        expect(page.get_by_text("Voice is unavailable. Continue with text.")).to_be_visible()
        # Replay a provider transcript through the real recorder UI and edit it.
        page.route("**/api/transcribe?*", lambda route: route.fulfill(json={"text": "demo transcript"}))
        record.click()
        page.get_by_role("button", name="Stop recording").click()
        transcript = page.get_by_label("Request or editable transcript")
        expect(transcript).to_have_value("demo transcript")
        transcript.fill("ವಿದ್ಯಾರ್ಥಿವೇತನಗಳನ್ನು ಹುಡುಕಿ.")
        with page.expect_response("**/api/discover") as first:
            page.get_by_role("button", name="Find scholarships", exact=True).click()
        matches = first.value.json()["results"]
        page.get_by_role("button", name="Listen to explanation").click()
        expect(page.get_by_text("Voice is unavailable. Continue with text.")).to_be_visible()
        page.get_by_role("button", name="Your profile").click()
        page.evaluate("() => { navigator.mediaDevices.getUserMedia = async () => {throw new Error('denied')} }")
        record.click()
        expect(page.get_by_text("Microphone unavailable. Type your request below.")).to_be_visible()
        with page.expect_response("**/api/discover") as second:
            page.get_by_role("button", name="Find scholarships", exact=True).click()
        assert second.value.json()["results"] == matches
        for scheme_id in ("nsp-pm-usp-csss", "nsp-pm-yasasvi-top-class-college"):
            result = next(r for r in matches if r["scholarship"]["id"] == scheme_id)
            assert result["status"] == "manual_review"
            scheme = result["scholarship"]
            page.get_by_role("button", name="View document checklist for " + scheme["name"], exact=True).click()
            expect(page.get_by_role("link", name="Open official source")).to_have_attribute("href", scheme["officialUrl"])
            expect(page.get_by_role("checkbox")).to_have_count(len(scheme["requiredDocuments"]))
            page.get_by_role("button", name="Run fictional walkthrough").click()
            review = page.get_by_role("region", name="Walkthrough review")
            expect(review).to_contain_text("Walkthrough stopped at review.", timeout=30000)
            if not os.getenv("REHEARSE_PUBLIC_SOURCE"):
                expect(review).to_contain_text("Portal unavailable")
            else:
                print(scheme_id, review.locator("p").first.inner_text())
            expect(review).to_contain_text(scheme["name"])
            page.get_by_role("button", name="Scholarship results").click()
        elapsed = time.monotonic() - start
        assert elapsed < 300 and not errors, (elapsed, errors)
        print(f"Both schemes reached review in {elapsed:.1f}s.")
        page.get_by_role("button", name="Your profile").click()
        page.route("**/api/discover", lambda route: route.fulfill(status=503, json={"detail": "Catalog unavailable"}))
        page.get_by_role("button", name="Find scholarships", exact=True).click()
        expect(page.get_by_role("alert")).to_have_text("Catalog unavailable")
        page.unroute("**/api/discover")
        page.route("**/api/discover", lambda route: route.fulfill(json={
            "results": [], "interpretation": "gemini", "explanation": "No results."}))
        page.get_by_role("button", name="Find scholarships", exact=True).click()
        expect(page.get_by_text("No schemes found for this request and source.")).to_be_visible()
        assert not errors, errors
        browser.close()


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    env = {**os.environ, "GEMINI_API_KEY": "", "ELEVENLABS_API_KEY": "",
           "GUIDANCE_OFFLINE": "0" if os.getenv("REHEARSE_PUBLIC_SOURCE") else "1",
           "DEMO_API_TARGET": "http://127.0.0.1:18000"}
    with ExitStack() as services:
        for command, cwd, url in [
            ([sys.executable, "-m", "uvicorn", "backend.main:app", "--port", "18000"], root,
             "http://127.0.0.1:18000/api/scholarships"),
            (["node", "node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1",
              "--port", "15173", "--strictPort"], root / "frontend", "http://127.0.0.1:15173/api/scholarships"),
        ]:
            process = subprocess.Popen(command, cwd=cwd, env=env)
            services.callback(process.wait)
            services.callback(process.terminate)
            for attempt in range(50):
                if process.poll() is not None:
                    raise RuntimeError("Local demo service exited during startup")
                try:
                    with urlopen(url, timeout=1) as response:
                        if response.status == 200:
                            break
                except OSError:
                    time.sleep(.2)
            else:
                raise RuntimeError("Local demo service did not become ready")
        rehearse()
