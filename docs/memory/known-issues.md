# Known Issues

Last updated: 2026-05-07

## Risks And Open Problems

- Windows ARM compatibility is still unvalidated and must not be marketed as supported.
- Browser automation packaging remains a product risk because Playwright browsers are not bundled and missing-browser recovery still depends on a manual `npx playwright install chromium` step.
- The legacy electron-builder `winCodeSign-2.6.0` bundle still contains macOS symlinks. If the local cache becomes stale or incomplete again, clear only `%LOCALAPPDATA%\\electron-builder\\Cache\\winCodeSign` and retry. Detailed recovery steps live in `docs/troubleshooting/windows-packaging.md`.
- The current package author and copyright values are placeholders (`Website Testing Tool Team`) until the real publisher/legal entity is chosen. This is a deferred business/legal decision and does not block MVP feature development.
- Code signing, SmartScreen reputation, and auto-update remain unresolved commercial packaging work.
- Missing Chromium is now explained clearly in the app, but recovery still depends on a manual `npx playwright install chromium` step. There is no supported in-app browser installer yet.
- This Codex Windows shell exports `ELECTRON_RUN_AS_NODE=1`, so direct Electron or packaged-app launches from automation will exit immediately unless that environment variable is cleared first.
- Recorder selectors are still basic (`id`, `data-testid`, `name`, `tag + class`) and can remain brittle on real sites.
- Destructive project delete, project folder rename, migration, and fuller recovery flows do not exist yet.
- Failure screenshots now preview in the Results panel, but they are still the MVP minimum. Traces, console logs, network logs, and richer failure evidence are still absent for some real QA workflows.
- The accepted Electron stack still carries app-size and security-hardening costs that need ongoing review.
- Fedora remains workable for development, but final packaging and runtime validation still depend on Windows sessions.

## Current Blockers

- Windows ARM packaging remains deferred until Playwright ARM64 browser support is proven.
