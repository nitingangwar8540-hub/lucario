# Phase 4.3 Playwright handoff

The standalone runner accepts the CSSS or PM YASASVI scheme ID from the matching fixture. It reads the exact public source URL from the catalog. Redirects and failed requests use the catalog fallback. The fallback result includes the official URL and checklist. [Browser runner](../integrations/playwright_guidance.py)

Public navigation uses its own browser context. The project-owned application demo runs in a separate offline context. It displays fictional values and document placeholders and ends at review. Both contexts close after use. [Local demo form](../integrations/demo_application.html)

Run from the repository root after installing the dependencies and Chromium.

```powershell
python -m pip install -r integrations/requirements.txt
python -m playwright install chromium
python -m integrations.playwright_guidance nsp-pm-usp-csss --offline
python -m integrations.playwright_guidance nsp-pm-yasasvi-top-class-college
```

The program prints the selected scheme ID, source status, official URL, and review values. An unavailable or unsupported public page returns `catalog_fallback`. The frontend can still display the official link and the checklist. The dashboard connection and live site rehearsal belong to the combined build.

The standalone smoke test opened the official CSSS source and exercised offline review for both fixture schemes. It checked the selected scheme, source URL, fictional applicant, income, checklist, and browser context cleanup.

For a provider-independent rehearsal, use the [matching example](../data/integration/matching-exchange.example.json) and the [sample voice explanations](../data/integration/voice-explanations.example.json). The explanations preserve the potential-match status in Kannada, Hindi, and English.
