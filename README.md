# ScholarSaarthi

ScholarSaarthi is a scholarship discovery prototype. Use a fictional student profile to compare eligibility rules across ten catalog records, review document checklists, and try a guided application walkthrough.

## Run locally on Windows

Use Git, Python 3.14, Node.js 24 with npm, and PowerShell. Install Google Chrome if you want to run the Playwright walkthrough. The typed demo uses a local catalog and works without API keys.

### 1. Clone and install

```powershell
git clone https://github.com/nitingangwar8540-hub/lucario.git
cd lucario
python -m venv backend/.venv
backend/.venv/Scripts/python.exe -m pip install -r backend/requirements-dev.txt
npm.cmd ci --prefix frontend
```

If you already cloned the repo, update your `main` checkout and run the install commands from its root.

### 2. Start the API

In the first terminal, start FastAPI from the repository root. The first line selects an installed copy of Chrome for Playwright.

```powershell
$env:PLAYWRIGHT_CHANNEL = 'chrome'
backend/.venv/Scripts/python.exe -m uvicorn backend.main:app --port 8000
```

If you prefer Playwright's bundled browser, run `backend/.venv/Scripts/python.exe -m playwright install chromium` once and start the API in a fresh terminal without setting `PLAYWRIGHT_CHANNEL`.

### 3. Start the dashboard

Open a second terminal at the repository root and leave both terminals running.

```powershell
npm.cmd run dev --prefix frontend -- --host 127.0.0.1 --strictPort
```

Open the dashboard at [localhost:5173](http://127.0.0.1:5173/#dashboard). The frontend forwards API requests to port 8000. You can confirm the backend is running by opening [FastAPI's interactive docs](http://127.0.0.1:8000/docs).

## Try the demo

1. Select **Use a sample profile** and **Find scholarships**.
2. Look for CSSS or PM YASASVI in the results. Both sample results show criteria that still need manual confirmation.
3. Open **View document checklist** to see the required documents, catalog deadline, and official source.
4. Select **Run fictional walkthrough** to reach a local application review with sample data. The walkthrough ends at review.

Live Gemini and ElevenLabs still require a credentialed rehearsal by an eligible operator. The local typed demo and Playwright walkthrough are ready for rehearsal. See the [Phase 5 runbook](docs/phase-5-demo.md) for details.

## Checks

Run these from the repository root with the dependencies installed.

```powershell
backend/.venv/Scripts/python.exe -m unittest discover -s backend/tests -v
backend/.venv/Scripts/python.exe -m unittest discover -s integrations -v
npm.cmd run lint --prefix frontend
npm.cmd run build --prefix frontend
```
