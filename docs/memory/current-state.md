# Current State

Last updated: 2026-05-08

## Summary

The repository now has a working Electron + React + TypeScript MVP workbench with local project storage, recent-project quick-open, project rename, manual step editing, test-level management, recorder, runner, results, lightweight HTML run-report export, and safe follow-through actions to open or reveal exported reports. Run results capture compact HTTP 4xx/5xx responses alongside request failures, browser console messages, and page errors, with selected saved runs exportable as standalone HTML summaries and immediately openable or revealable in file managers without exposing arbitrary filesystem access.

## Current Facts

- Accepted MVP stack: Electron, React, TypeScript, Node.js, Playwright, and local file storage.
- Product style direction is now documented in `docs/ux/product-style-direction.md` as **Local QA Workbench**: primarily Linear with secondary influence from Cursor, Raycast, Sentry, and Stripe.
- Windows x64 is the first packaging target. Windows ARM remains a validation risk and must not be marketed as supported yet.
- Core local workflow exists: create/open a project, create/edit/save tests, record browser actions, run tests, and review JSON-backed results.
- The current renderer shell follows the accepted `DESIGN.md` workbench direction and has already passed a Windows x64 hands-on UI workflow validation.
- Baseline checks remain healthy: `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run build` are part of the normal validation loop.
- `electron-builder` is configured for Windows x64 NSIS installer and portable builds.
- Safe packaging metadata now exists in `package.json`: `author.name`, a product-focused `description`, `build.productName`, `build.appId`, and a placeholder packaging copyright.
- Final publisher/legal entity selection is explicitly deferred. The current package `author` and copyright values remain placeholders until code signing, installer branding, or commercial release prep begins.
- Icon assets are kept under `resources/`: `icon.ico` is the Windows packaging asset and `icon.svg` is the readable source asset. `npm run icon:generate` can regenerate the ICO locally.
- Historical Windows 11 Pro validation already confirmed successful `npm run package:win`, successful `npm run package:win:portable`, and a working portable EXE launch.
- The historical Node.js `DEP0190` electron-builder shell-args warning was observed under Node.js `v24.15.0`, but it did not reproduce during a 2026-05-07 re-check on Node.js `v22.17.1`.
- The current Windows 11 / Node `v22.17.1` workspace now passes plain `npm run package:win:portable` again after deleting only `%LOCALAPPDATA%\\electron-builder\\Cache\\winCodeSign` and letting electron-builder rebuild a clean `winCodeSign-2.6.0` cache.
- The machine that passed the recovery was a non-admin PowerShell session with Windows Developer Mode enabled (`AllowDevelopmentWithoutDevLicense=1`).
- `docs/troubleshooting/windows-packaging.md` now records the exact `winCodeSign` failure signature, cache path, and recovery order.
- Playwright browsers are not bundled in the installer or portable EXE.
- Runner and recorder now share a Playwright Chromium availability helper. When Chromium is missing, the app surfaces a user-safe message that tells the user to run `npx playwright install chromium`.
- The Tests and Recorder sections now show a small missing-Chromium status note before the user tries to run or record.
- Project metadata rename is now supported through a preload-safe IPC path. It updates only `project.json` `name` plus `updatedAt`, preserves `projectId`, preserves `createdAt`, and does not rename the project folder on disk.
- The app now keeps a small recent-projects cache in Electron `userData` at `recent-projects.json`. The list is deduplicated by project path, sorted by `lastOpenedAt` descending, capped at eight items, and prunes missing or invalid project folders during refresh.
- Users can now manually forget a recent project entry without deleting any project files. Forget removes only the matching recent-project cache entry by path and leaves the underlying project folder plus `project.json` unchanged.
- Manual step editing now supports simple step reordering with Move Up and Move Down controls. The first step disables Move Up, the last step disables Move Down, and reordered steps save through the existing `saveTestCase` API without changing schema shape.
- The Tests workspace now supports test rename, duplicate, and guarded delete actions. Rename updates only the saved `name` through the existing `saveTestCase` flow, duplicate creates a new JSON-backed test with a new `testId` and regenerated step IDs, and delete requires inline confirmation before removing the test file.
- Test file names still stay stable and ID-based because they are derived from `testId`, not the human-readable test name.
- The Results panel now previews failure screenshots for selected failed runs through a preload-safe data URL bridge. The renderer never reads project files directly, and main-process validation only allows `.png` files inside the selected project's `artifacts/screenshots` tree.
- The Results panel now shows a compact failure summary card for failed and error runs, and it can copy a plain-text failure summary through the browser clipboard API when available.
- Run results now capture `stepSnapshots` as part of the saved result when the runner supports it, so target, value, timeout, and notes can remain historically accurate even if the test case edits later.
- Run results now also capture optional `consoleMessages` and `pageErrors` arrays. Collection is best-effort, messages are truncated, console/page-error counts are capped, and older result files without those fields remain valid with no migration.
- Run results now also capture optional `networkFailures` from Playwright `page.on('requestfailed')`. Capture stays narrow on purpose: failed requests only, capped at 50 entries, with truncated URLs/failure text and optional step association.
- Run results now also capture optional `httpErrors` from Playwright `page.on('response')` when the completed response status is `>= 400`. Only 4xx/5xx responses are stored, entries are capped at 50, internal schemes are ignored, and long URLs/status text are truncated.
- The Results panel now shows a compact **Browser evidence** section for selected runs when browser evidence exists. It shows console message count, warning/error count, page-error count, network failure count, HTTP error count, and small lists of the most relevant recent entries.
- Copied failure summaries now include browser evidence counts when present, including network failure and HTTP error counts, but they do not dump full console logs, page-error stacks, raw request lists, or full HTTP logs into the clipboard.
- Selected saved runs can now be exported through a preload-safe IPC path as standalone HTML reports under `reports/report-{runId}.html` inside the current project. The renderer cannot choose arbitrary output paths, and the report generator escapes user-controlled text instead of injecting raw values into HTML.
- Exported HTML reports include run metadata, failure summary details, step results, browser evidence counts, compact browser evidence sections, generated-at timestamp, and a local/offline note. Screenshot paths are included as text only for MVP.
- Exported HTML reports can now be opened in the default application or revealed in the file manager through preload-safe follow-through actions. Path validation prevents traversal, absolute paths, wrong extensions, and non-canonical filenames. Both open and reveal use Electron `shell` APIs called only from the main process.
- The 2026-05-08 open/reveal report feature uses a new `resolveExportedReportPath()` validator that rejects `..` traversal, absolute paths, URL schemes, non-HTML extensions, and filenames that don't match the `report-{runId}.html` pattern. It enforces root-level `reports/` directory containment.
- Selected saved runs can now also be exported as JUnit XML reports under `reports/junit-{runId}.xml` through a preload-safe IPC path. The JUnit report maps each step result to a `<testcase>` element with `<failure>`, `<error>`, or `<skipped>` children, and includes run metadata plus browser evidence counts in `<system-out>`. XML escaping is applied to both text nodes and attribute values. The same open/reveal follow-through actions work for JUnit exports.
- A minimal CLI runner (`src/cli/runTest.ts`) now exists for command-line and CI use. It wraps the existing runner and storage modules, accepts a project path and test identifier, runs the test, saves the JSON result, and optionally exports JUnit XML (`--junit`) and HTML (`--html`) reports. Exit codes: 0 for passed, 1 for failed/error, 2 for invalid usage. The runner now supports a `headed` option for visible browser mode.
- Recorded browser steps can now be saved directly into a selected or new test case, closing the no-code workflow loop. After recording stops, the Recorder panel shows three save options: Save as new test (always available), Append to selected test, and Replace selected test steps (both available when a test is selected). Replace requires inline confirmation. Step IDs are normalized before saving to ensure uniqueness. The app switches to the Tests section after saving as new test.
- Recorder selector generation now follows a priority order: data-testid → data-test → data-qa → id → name → aria-label → CSS class → tag. Each recorded step shows a confidence badge (High/Medium/Low) in the RecorderPanel preview. Selector confidence is stored as an optional `selectorConfidence` field on `TestStep`, backward-compatible with existing saved tests.
- The packaged validation used the portable EXE plus a temporary user-data directory and a CDP attachment. In this Codex Windows shell, `ELECTRON_RUN_AS_NODE=1` had to be cleared before launching any Electron or packaged-app process.
- During the Windows missing-Chromium simulation, the local Playwright cache folder `C:\Users\khamp\AppData\Local\ms-playwright\chromium-1217` was renamed first, but the folder did not survive the probe intact and had to be restored with `npx playwright install chromium`.

## Current Focus

Packaged missing-Chromium validation, project rename, recent-project quick-open, forget-recent cleanup, test-level management, failure screenshot preview, failure summary copy, historical step snapshots, compact browser evidence capture, lightweight HTML report export, and now safe follow-through actions to open or reveal exported reports are complete. The next smallest valuable work is to continue runner/results diagnostics with lightweight request/response context around captured network failures and HTTP errors while keeping evidence storage compact, or apply the `Local QA Workbench` design direction incrementally to shared surfaces.

## Important Constraint

Development still happens cross-platform, but the shipping product targets Windows x86/x64 and Windows on ARM.
