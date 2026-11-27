"""Open a public scholarship source and guide a fictional application to review."""

import argparse
import asyncio
import json
from pathlib import Path
from urllib.parse import urlsplit

from playwright.async_api import Browser, Error, Page, Route, async_playwright


CATALOG = Path(__file__).resolve().parents[1] / "data/catalog/scholarships.json"
DEMO_FORM = Path(__file__).with_name("demo_application.html")
SUPPORTED_SCHEMES = {"nsp-pm-usp-csss", "nsp-pm-yasasvi-top-class-college"}
PUBLIC_HOST = "scholarships.gov.in"


def get_scheme(scheme_id: str) -> dict:
    if scheme_id not in SUPPORTED_SCHEMES:
        raise ValueError("This scheme is unavailable in the browser demo.")
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    scheme = next((entry for entry in catalog if entry["id"] == scheme_id), None)
    if scheme is None:
        raise ValueError("The selected scheme is missing from the catalog.")
    url = urlsplit(scheme["officialUrl"])
    if url.scheme != "https" or url.netloc != PUBLIC_HOST:
        raise ValueError("The catalog source is outside the supported public portal.")
    return scheme


async def open_public_source(page: Page, source_url: str) -> bool:
    async def load_source(route: Route) -> None:
        if route.request.url != source_url or route.request.method != "GET":
            await route.abort()
            return
        try:
            response = await route.fetch(max_redirects=0, timeout=5_000)
        except Error:
            await route.abort()
            return
        if response.ok:
            await route.fulfill(response=response)
        else:
            await route.abort()

    await page.route("**/*", load_source)
    try:
        response = await page.goto(source_url, wait_until="domcontentloaded", timeout=8_000)
    except Error:
        return False
    return response is not None and response.ok


async def run_guidance(browser: Browser, scheme_id: str, *, offline: bool = False) -> dict:
    scheme = get_scheme(scheme_id)
    documents = scheme["requiredDocuments"]
    checklist = "Checklist unavailable" if documents is None else "\n".join(
        f'{item["name"]} ({item["condition"]})' if item["condition"] else item["name"]
        for item in documents
    )
    if documents == []:
        checklist = "No documents listed"

    if offline:
        source_opened = False
    else:
        source_context = await browser.new_context(service_workers="block", accept_downloads=False)
        try:
            source_opened = await open_public_source(await source_context.new_page(), scheme["officialUrl"])
        finally:
            await source_context.close()

    demo_context = await browser.new_context(offline=True, service_workers="block")
    try:
        demo = await demo_context.new_page()
        await demo.set_content(DEMO_FORM.read_text(encoding="utf-8"))
        await demo.get_by_label("Scholarship", exact=True).evaluate("(field, name) => field.value = name", scheme["name"])
        await demo.get_by_label("Applicant name").fill("Demo Student")
        await demo.get_by_label("Annual family income in rupees").fill("200000")
        await demo.get_by_label("Document checklist").evaluate("(field, text) => field.value = text", checklist)
        await demo.get_by_role("button", name="Review application").click()
        review = demo.get_by_role("region", name="Review fictional application")
        await review.wait_for(state="visible")
        return {
            "schemeId": scheme_id,
            "officialUrl": scheme["officialUrl"],
            "sourceStatus": "opened" if source_opened else "catalog_fallback",
            "review": {
                "scholarship": await review.locator("#review-scheme").inner_text(),
                "applicant": await review.locator("#review-applicant").inner_text(),
                "annualFamilyIncomeInr": await review.locator("#review-income").inner_text(),
                "documentChecklist": await review.locator("#review-documents").inner_text(),
            },
        }
    finally:
        await demo_context.close()


async def main(scheme_id: str, offline: bool) -> None:
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch()
        try:
            print(json.dumps(await run_guidance(browser, scheme_id, offline=offline), indent=2))
        finally:
            await browser.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("scheme_id", choices=sorted(SUPPORTED_SCHEMES))
    parser.add_argument("--offline", action="store_true", help="Exercise the local catalog fallback.")
    arguments = parser.parse_args()
    asyncio.run(main(arguments.scheme_id, arguments.offline))
