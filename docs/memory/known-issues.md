# Known Issues

Last updated: 2026-05-08

## Risks And Open Problems

- Windows ARM compatibility is still unvalidated and must not be marketed as supported.
- Browser automation packaging remains a product risk because Playwright browsers are not bundled and missing-browser recovery still depends on a manual `npx playwright install chromium` step.
- The legacy electron-builder `winCodeSign-2.6.0` bundle still contains macOS symlinks. If the local cache becomes stale or incomplete again, clear only `%LOCALAPPDATA%\\electron-builder\\Cache\\winCodeSign` and retry. Detailed recovery steps live in `docs/troubleshooting/windows-packaging.md`.
- The current package author and copyright values are placeholders (`Website Testing Tool Team`) until the real publisher/legal entity is chosen. This is a deferred business/legal decision and does not block MVP feature development.
- Code signing, SmartScreen reputation, and auto-update remain unresolved commercial packaging work.
- Missing Chromium is now explained clearly in the app, but recovery still depends on a manual `npx playwright install chromium` step. There is no supported in-app browser installer yet.
- This Codex Windows shell exports `ELECTRON_RUN_AS_NODE=1`, so direct Electron or packaged-app launches from automation will exit immediately unless that environment variable is cleared first.
- Recorder selectors now follow a priority order (data-testid → data-test → data-qa → id → name → aria-label → class → tag) with confidence badges, but they can still be brittle on sites without data attributes or stable IDs.
- Recorded steps can now be saved to new or existing tests, but assertText steps are not captured by the recorder and must be added manually in the step editor.
- Destructive project delete, project folder rename, migration, and fuller recovery flows do not exist yet.
- Failure screenshots, browser console messages, page errors, request failures, and compact HTTP errors now appear in Results diagnostics, but traces, full HAR/network captures, and richer artifact navigation are still absent for some real QA workflows.
- Network evidence is intentionally compact and selective. Successful 2xx/3xx responses are not captured, and no headers or bodies are stored yet.
- HTML report export is now followed by safe open/reveal actions that do not expose arbitrary filesystem browsing. Reports are read-only presentation of captured evidence; screenshot artifacts remain as relative path text only.
- The CLI runner (`src/cli/runTest.ts`) is a thin wrapper around existing runner and storage modules. It does not bundle Playwright browsers, does not support suites/tags/parallel execution, and does not allow custom output paths. Reports are always written to the project's `reports/` directory.
- Run results now support historical `stepSnapshots` to preserve target, value, and timeout details as they existed at run time. Older run results without snapshots still fall back to reconstructing details from the current saved test case.
- The accepted Electron stack still carries app-size and security-hardening costs that need ongoing review.
- Fedora remains workable for development, but final packaging and runtime validation still depend on Windows sessions.

## Current Blockers

- Windows ARM packaging remains deferred until Playwright ARM64 browser support is proven.
