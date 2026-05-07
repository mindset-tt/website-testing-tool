# Known Issues

Last updated: 2026-05-07

## Risks And Open Problems

- Windows ARM compatibility is still unvalidated and must not be marketed as supported.
- Browser automation packaging remains a product risk because Playwright browsers are not bundled and packaged first-run install/launch behavior is still unverified on a real packaged app.
- The current Windows packaging session can fail while extracting electron-builder's downloaded `winCodeSign` cache if the session lacks symlink creation rights.
- The current package author and copyright values are placeholders (`Website Testing Tool Team`) until the real publisher/legal entity is chosen.
- Code signing, SmartScreen reputation, and auto-update remain unresolved commercial packaging work.
- Missing Chromium is now explained clearly in the app, but recovery still depends on a manual `npx playwright install chromium` step. There is no supported in-app browser installer yet.
- Recorder selectors are still basic (`id`, `data-testid`, `name`, `tag + class`) and can remain brittle on real sites.
- Project rename, delete, migration, and recovery flows do not exist yet.
- Failure screenshots are the MVP minimum, but they may be insufficient diagnostic evidence for some real QA workflows.
- The accepted Electron stack still carries app-size and security-hardening costs that need ongoing review.
- Fedora remains workable for development, but final packaging and runtime validation still depend on Windows sessions.

## Current Blockers

- Packaged Playwright browser first-run behavior is still unvalidated on real Windows package output.
- Windows ARM packaging remains deferred until Playwright ARM64 browser support is proven.
