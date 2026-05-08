# Manual Runner & Recorder Validation

Last updated: 2026-05-08

This document describes how to manually validate the runner and recorder features in the current build.

## Prerequisites

- Node.js >= 22.0.0
- npm >= 10.0.0
- Playwright with Chromium installed (`npx playwright install chromium`)
- Fedora Linux (or compatible) development environment

If Chromium is missing, the app should now show a clear message telling the user to run `npx playwright install chromium` before using Run or Recorder.

## Starting the App

```bash
cd website-testing-tool
npm run dev
```

The Electron app window opens with the "Website Testing Tool" shell.

## Creating a Project

1. In the "No project open" section, enter a project name (e.g., "Validation Tests").
2. Click **Create local project**.
3. Choose a parent folder in the file dialog.
4. The app creates a project folder with `project.json`, `tests/`, `results/`, `artifacts/`, and `logs/` directories.
5. The header updates to show the project name and path.

## Opening A Recent Project

1. Launch the app with no project open.
2. In the **Recent projects** section, choose a saved workspace row.
3. Confirm the project opens without using the folder picker.
4. If the folder was deleted or moved, confirm the app shows a clear error and the stale recent item is no longer offered.

## Forgetting A Recent Project

1. Launch the app with no project open.
2. In the **Recent projects** section, click **Forget** on one saved workspace row.
3. Confirm that row disappears from the list.
4. Confirm the app shows that the recent entry was removed without deleting project files.
5. Confirm the project folder still exists on disk and can still be reopened manually.

## Renaming A Project

1. Open an existing project.
2. In the project strip, click **Rename**.
3. Enter a new project name and click **Save name**.
4. Confirm the visible project name updates.
5. Confirm the folder path on disk does not change.
6. Confirm `project.json` preserves `projectId` and `createdAt` while updating `name` and `updatedAt`.

## Creating a Manual Test

1. With a project open, click **New test** in the "Saved Tests" section.
2. A "Sample test" appears in the test list and is selected.
3. In the step editor below, click **+ Add step**.
4. Configure the step:
   - **Type:** `navigate`
   - **Label:** `Go to example.com`
   - **Target:** `https://example.com`
5. Add another step:
   - **Type:** `assertText`
   - **Label:** `Check page heading`
   - **Target:** `h1`
   - **Value:** `Example Domain`
6. Use **Move Up** or **Move Down** on a step card to confirm the step order changes without losing any field values.
7. Click **Save** to persist the test case.

## Managing Saved Tests

1. Select a saved test in the suite list.
2. Click **Rename**, enter a new test name, and click **Save name**.
3. Confirm the selected test name updates while the test ID, created timestamp, and steps remain unchanged.
4. Click **Duplicate**.
5. Confirm a new test named `Copy of <original name>` appears as a separate saved test.
6. Confirm the duplicate preserves the description and step content while using a new test ID.
7. Click **Delete** on the duplicate.
8. Confirm the inline warning appears before deletion completes.
9. Click **Delete test**.
10. Confirm the duplicate is removed, the suite list refreshes, and the next available test is selected when one exists.

## Running a Manual Test

1. Select the test from the test list.
2. Click **Run test**.
3. The button shows "Running…" while the test executes.
4. After completion, a result badge appears:
   - **PASSED** (green) — all steps succeeded
   - **FAILED** (red) — a step failed
   - **ERROR** (amber) — browser launch or runner error
5. Step-level results show each step's status and duration.
6. Failed steps show the error message.

## Inspecting Run Result JSON

Run results are saved to `{projectPath}/results/run-{runId}.json`.

Example path: `results/run-550e8400-e29b-41d4-a716-446655440000.json`

The JSON contains:
- `schemaVersion`, `runId`, `testId`, `testName`, `browserName`
- `status` (`passed` | `failed` | `error`)
- `startedAt`, `finishedAt`, `durationMs`
- `stepResults` array with per-step status, timing, and error details
- `failureScreenshotPath` (relative path, only on failure)
- optional `consoleMessages` array with timestamp, type, text, safe location details, and optional related step index
- optional `pageErrors` array with timestamp, message, optional name/stack, and optional related step index
- optional `networkFailures` array with timestamp, URL, optional method/resource type/failure text/status, and optional related step index
- optional `httpErrors` array with timestamp, URL, optional method/resource type, required 4xx/5xx status, optional status text, and optional related step index
- `stepSnapshots` array with targeted historical step details captured at run time

## Inspecting Failure Screenshot Path

When a step fails, a screenshot is saved to:
`{projectPath}/artifacts/screenshots/run-{runId}/step-{index}-failure.png`

The path is shown in the run result UI and stored in the result JSON.

## Inspecting Failure Screenshot Preview

1. Run or open a failed result that has a `failureScreenshotPath`.
2. Open the **Results** section and select that run.
3. Confirm the screenshot path text remains visible.
4. Confirm a bordered screenshot preview loads below the path.
5. Confirm a missing or invalid screenshot shows a user-safe preview error instead of a raw filesystem path or stack trace.

## Inspecting Failed-Step Diagnostics

1. Open a failed or error run in the **Results** section.
2. Confirm the failure summary card clearly shows the failed step number, label, and type.
3. Confirm the card shows target and timeout details when the saved test definition is still available.
4. Confirm the error message is readable and no raw stack trace is shown in the normal UI.
5. Confirm the screenshot path remains visible and the preview still loads when a screenshot exists.

## Inspecting Browser Evidence

1. Run or open a result that produced browser console messages, unhandled page errors, or failed requests.
2. Select the run in the **Results** section.
3. Confirm a compact **Browser evidence** section appears only when evidence exists.
4. Confirm the section shows counts for console messages, warnings/errors, page errors, network failures, and HTTP errors.
5. Confirm the console list prefers recent warnings/errors when present and stays compact.
6. Confirm page errors show readable message text and compact stack/name context without dumping huge raw logs.
7. Confirm network failures show a compact failed-request list with safe URL display plus method/resource type/failure text when available.
8. Confirm HTTP errors show a compact latest-errors list with status, method, resource type, safe URL display, and optional status text.
9. Confirm runs with no browser evidence do not show an empty browser evidence panel.

## Copying A Failure Summary

1. Open a failed or error run in the **Results** section.
2. Click **Copy failure summary**.
3. Confirm the app shows a success message.
4. Paste the clipboard contents into a text editor.
5. Confirm the summary includes the test name or ID, run status, browser, duration, failed step details, browser evidence counts when present, error message, and screenshot path when present.
6. Confirm the clipboard summary does not dump full console logs or full page-error stacks.
7. Confirm the clipboard summary includes the network failure count when request failures were captured, but not the raw failed-request list.
8. Confirm the clipboard summary includes the HTTP error count when completed 4xx/5xx responses were captured, but not the raw HTTP error list.

## Exporting An HTML Report

1. Open any saved run in the **Results** section.
2. Click **Export HTML report**.
3. Confirm the app shows a success message with a project-relative `reports/...html` path.
4. Confirm the project now contains `reports/report-<runId>.html`.
5. Open the exported file in a browser.
6. Confirm the report shows run metadata, failure details when applicable, a step results table, browser evidence counts, compact evidence sections, and a local/offline note.
7. Confirm screenshot information is shown as a relative path, not as an arbitrary filesystem picker result.

## Starting Recording

1. With a project open, locate the **Recorder** panel.
2. Click **Start Recording**.
3. A Chromium browser window opens (non-headless).
4. The recorder panel shows a pulsing red dot and "Recording" status.

## Stopping Recording

1. Interact with the browser: navigate to URLs, click elements, fill forms.
2. Click **Stop Recording** in the recorder panel.
3. The browser closes.
4. Recorded steps appear in a preview list showing type, label, and target.
5. Steps can be saved to a test case via the step editor.

## Expected Results

| Action | Expected |
|---|---|
| Create project | `project.json` written, directories created |
| Open recent project | Recent row opens project directly; missing folders show safe error and are removed from recents |
| Forget recent project | Recent row disappears, project files stay untouched, manual reopen still works |
| Rename project | `project.json` name changes, folder path stays unchanged, recent list reflects new name |
| Create test | `.test.json` file in `tests/` |
| Edit steps | Steps saved with validation |
| Reorder steps | Step order changes and all step data stays intact after save |
| Rename test | Test name changes through save flow, file remains tied to test ID |
| Duplicate test | New `.test.json` file created with `Copy of <original name>` and a new test ID |
| Delete test | Inline confirmation appears, file is removed only after confirmation, selection updates safely |
| Run passing test | Green PASSED badge, result JSON in `results/` |
| Run failing test | Red FAILED badge, screenshot in `artifacts/screenshots/` |
| View failed result in Results | Screenshot path stays visible and a preview loads when the PNG still exists |
| Inspect failed result details | Failure summary card shows step number, label, type, error, saved step context when available, and compact browser evidence when it exists, including failed requests and HTTP 4xx/5xx responses |
| Copy failure summary | Clipboard gets a compact plain-text failure summary with browser evidence counts but no JSON dump, full logs, raw request list, or absolute artifact path |
| Export HTML report | `reports/report-<runId>.html` is created inside the project and shows compact run, step, and browser-evidence diagnostics |
| Run test with missing Chromium | Error message tells the user to run `npx playwright install chromium` |
| Start recording | Chromium window opens, status shows "Recording" |
| Start recording with missing Chromium | Error message tells the user to run `npx playwright install chromium` |
| Stop recording | Browser closes, steps preview appears |
| Stop recording with no browser | Error message shown |

## Known Limitations

- **assertText not captured by recorder:** Must be added manually in the step editor.
- **Basic selectors only:** Recorder uses id, data-testid, name, or tag+class. No smart locator generation.
- **Single run only:** No concurrent or parallel test execution.
- **Chromium only:** No Firefox or WebKit support in MVP.
- **Fedora fallback:** Playwright uses Ubuntu 24.04 fallback build on Fedora.
- **File names not human-readable:** Test case file names are derived from test IDs (UUID-based).
- **No project delete or folder rename:** Projects can be renamed in metadata only, but not deleted or renamed on disk through the UI.
- **Failure evidence is still MVP-limited:** The Results panel now shows failure screenshots, browser console messages, page errors, request failures, and compact HTTP 4xx/5xx responses, but traces, videos, full HAR capture, and broader network captures are still out of scope.
- **Network evidence is still selective:** Only `requestfailed` events plus completed 4xx/5xx responses are captured. Successful 2xx/3xx traffic is intentionally excluded in MVP.
- **HTML export is intentionally lightweight:** The exported report is a standalone local HTML summary. It does not bundle screenshots, traces, headers, bodies, PDF output, or JUnit output yet.
- **Older historical results may be thinner:** Older run result files created before step snapshots or browser evidence existed will still load, but they may lack historical step detail or browser evidence sections.
