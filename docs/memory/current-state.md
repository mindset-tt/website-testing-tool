# Current State

Last updated: 2026-05-07

## Summary

The repository now has a working Electron + React + TypeScript MVP workbench with local project storage, manual step editing, recorder, runner, results, and documented Windows x64 packaging. The current task stream is packaging validation and cleanup, not new product behavior.

## Current Facts

- Accepted MVP stack: Electron, React, TypeScript, Node.js, Playwright, and local file storage.
- Windows x64 is the first packaging target. Windows ARM remains a validation risk and must not be marketed as supported yet.
- Core local workflow exists: create/open a project, create/edit/save tests, record browser actions, run tests, and review JSON-backed results.
- The current renderer shell follows the accepted `DESIGN.md` workbench direction and has already passed a Windows x64 hands-on UI workflow validation.
- Baseline checks remain healthy: `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run build` are part of the normal validation loop.
- `electron-builder` is configured for Windows x64 NSIS installer and portable builds.
- Safe packaging metadata now exists in `package.json`: `author.name`, a product-focused `description`, `build.productName`, `build.appId`, and a placeholder packaging copyright.
- Icon assets are kept under `resources/`: `icon.ico` is the Windows packaging asset and `icon.svg` is the readable source asset. `npm run icon:generate` can regenerate the ICO locally.
- Historical Windows 11 Pro validation already confirmed successful `npm run package:win`, successful `npm run package:win:portable`, and a working portable EXE launch.
- The historical Node.js `DEP0190` electron-builder shell-args warning was observed under Node.js `v24.15.0`, but it did not reproduce during a 2026-05-07 re-check on Node.js `v22.17.1`.
- The current workspace package re-check hit a different Windows-only blocker: electron-builder's `winCodeSign` cache extraction can fail when the current Windows session lacks symlink creation rights.
- Playwright browsers are not bundled in the installer or portable EXE.
- Runner and recorder now share a Playwright Chromium availability helper. When Chromium is missing, the app surfaces a user-safe message that tells the user to run `npx playwright install chromium`.
- The Tests and Recorder sections now show a small missing-Chromium status note before the user tries to run or record.
- Manual step editing now supports simple step reordering with Move Up and Move Down controls. The first step disables Move Up, the last step disables Move Down, and reordered steps save through the existing `saveTestCase` API without changing schema shape.
- Packaged-app first-run browser install/launch behavior still needs hands-on validation.

## Current Focus

Re-run Windows portable packaging in a Windows session that can extract electron-builder's `winCodeSign` cache, then validate the new missing-Chromium message in the packaged app on a machine without Playwright browsers installed.

## Important Constraint

Development still happens cross-platform, but the shipping product targets Windows x86/x64 and Windows on ARM.
