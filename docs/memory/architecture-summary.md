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
- Historical Windows packaging passes exist, but the current workspace still needs a Windows session with symlink creation rights to reproduce `npm run package:win:portable` end to end.
- The app now checks for missing Playwright Chromium before runner and recorder launch and surfaces `npx playwright install chromium` guidance through existing UI error/status areas.
- The manual step editor now supports simple step reordering through Move Up / Move Down controls while preserving the existing local storage schema and save flow.
- Windows ARM remains deferred until Playwright ARM64 browser support and real hardware validation are available.

## Main Risks

- Electron size and security hardening remain ongoing costs.
- Playwright browser discovery, first-run install behavior, and offline packaging strategy are still open product risks because the current fix is clear messaging, not a polished install flow.
- Final commercial publisher metadata, code signing, and update strategy are still undecided.

## Next Work

Re-run portable packaging in a Windows session that can extract electron-builder's `winCodeSign` cache, then validate the packaged missing-Chromium flow on real Windows hardware before returning to project-management workflow gaps such as rename/delete.
