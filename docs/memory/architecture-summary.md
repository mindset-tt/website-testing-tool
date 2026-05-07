# Architecture Summary

Last updated: 2026-05-07

## Status

The MVP architecture is accepted in ADR-0002 and implemented far enough to support packaging validation work. The current effort is validating the Windows delivery path, not changing the chosen architecture.

## Current Accepted Architecture

- Electron
- React
- TypeScript
- Node.js
- Playwright
- Local file storage

## Packaging Notes

- Windows x64 is the first supported packaging target.
- `electron-builder` remains the accepted packaging tool for NSIS installer and portable EXE outputs.
- Package metadata and custom icon wiring are now present in `package.json`.
- Historical Windows packaging passes exist, and the current Windows 11 / Node `v22.17.1` workspace now reproduces `npm run package:win:portable` again after deleting only `%LOCALAPPDATA%\electron-builder\Cache\winCodeSign`.
- `docs/troubleshooting/windows-packaging.md` documents the exact `winCodeSign-2.6.0` cache failure signature and the recovery order.
- The app now checks for missing Playwright Chromium before runner and recorder launch and surfaces `npx playwright install chromium` guidance through existing UI error/status areas.
- The 2026-05-07 portable EXE validation confirmed that when Playwright Chromium is missing, the packaged app opens, shows the Tests and Recorder notes, surfaces user-safe Run and Start Recording errors, avoids raw Playwright stack traces in the normal UI, and stays running.
- Runtime validation from this Codex Windows shell requires clearing `ELECTRON_RUN_AS_NODE=1` before launching Electron or packaged-app processes.
- The manual step editor now supports simple step reordering through Move Up / Move Down controls while preserving the existing local storage schema and save flow.
- Windows ARM remains deferred until Playwright ARM64 browser support and real hardware validation are available.

## Main Risks

- Electron size and security hardening remain ongoing costs.
- Playwright browser discovery, first-run install behavior, and offline packaging strategy are still open product risks because the current fix is clear messaging, not a polished install flow.
- Final commercial publisher metadata, code signing, and update strategy are still undecided.

## Next Work

Decide the final Windows packaging publisher metadata and then return to the planned shared-shell polish and project-management workflow gaps such as rename/delete.
