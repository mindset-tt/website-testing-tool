# Current State

Last updated: 2026-05-07

## Summary

The repository now has a working Electron + React + TypeScript MVP workbench with local project storage, recent-project quick-open, project rename, manual step editing, test-level management, recorder, runner, results, and documented Windows x64 packaging. The packaged missing-Chromium path is validated on the current Windows portable build, so MVP product capability work is back on workflow polish. Final publisher/legal metadata remains deferred and does not block feature development.

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
- Richer failed-step context in the Results panel currently comes from the current saved test case, not a historical step snapshot inside the run result. That means target, value, and timeout details can drift if the test is edited after the run.
- The 2026-05-07 packaged portable EXE validation confirmed the missing-Chromium path end to end: the app opens, Tests and Recorder show the missing-browser note, Run and Start Recording show user-safe install guidance, no raw Playwright stack trace is shown in the normal UI, and the app stays running.
- The packaged validation used the portable EXE plus a temporary user-data directory and a CDP attachment. In this Codex Windows shell, `ELECTRON_RUN_AS_NODE=1` had to be cleared before launching any Electron or packaged-app process.
- During the Windows missing-Chromium simulation, the local Playwright cache folder `C:\Users\khamp\AppData\Local\ms-playwright\chromium-1217` was renamed first, but the folder did not survive the probe intact and had to be restored with `npx playwright install chromium`.

## Current Focus

Packaged missing-Chromium validation, project rename, recent-project quick-open, forget-recent cleanup, test-level management, failure screenshot preview, and failure summary copy are complete on the current Windows portable build. The next smallest valuable work is to continue runner and results hardening with more stable historical failure context and richer evidence handling now that the core local workspace flows are in place. Final publisher/legal metadata remains deferred and should not block MVP feature work.

## Important Constraint

Development still happens cross-platform, but the shipping product targets Windows x86/x64 and Windows on ARM.
