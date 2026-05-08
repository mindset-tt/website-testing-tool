# Architecture Summary

Last updated: 2026-05-08

## Status

The MVP architecture is accepted in ADR-0002 and implemented far enough to support Windows packaging validation plus the core local authoring workflow. The current effort is product capability polish within that accepted architecture, not a stack change.

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
- The Results panel now previews failure screenshots through a validated preload/main-process bridge that only allows `.png` files inside the selected project's `artifacts/screenshots` directory.
- The Results panel now also renders a compact failed-step summary and can copy a plain-text failure summary for failed and error runs by using the browser clipboard API from the renderer.
- Run results now capture historical `stepSnapshots`, preserving the exact step target, value, timeout, and notes at run time while still falling back safely for older results.
- Run results now also capture capped browser console messages and page errors through Playwright `page.on('console')` and `page.on('pageerror')` listeners. Those fields are optional so older saved results remain valid with no migration.
- Run results now also capture capped request failures through Playwright `page.on('requestfailed')`. Capture is intentionally narrow for MVP: failed requests only, no full HAR, and simple filtering of obviously internal URL schemes.
- The Results panel now renders a compact Browser evidence section for selected runs when evidence exists, showing counts plus a small list of the latest relevant console, page-error, and failed-request entries.
- Project metadata rename now updates only `project.json` `name` and `updatedAt`, preserving the stable `projectId`, `createdAt`, and folder path.
- Recent projects are now cached outside project folders in Electron `userData` as `recent-projects.json`, with a small deduplicated quick-open list for the no-project startup state.
- The no-project startup state now supports a non-destructive forget action for recent-project entries. It removes only the matching cache entry by project path and does not touch project folders or project metadata.
- The manual step editor now supports simple step reordering through Move Up / Move Down controls while preserving the existing local storage schema and save flow.
- The test designer now supports rename, duplicate, and guarded delete actions without changing the project schema, exposing raw filesystem APIs, or renaming test files away from their stable `testId`-derived paths.
- Windows ARM remains deferred until Playwright ARM64 browser support and real hardware validation are available.

## Main Risks

- Electron size and security hardening remain ongoing costs.
- Playwright browser discovery, first-run install behavior, and offline packaging strategy are still open product risks because the current fix is clear messaging, not a polished install flow.
- Results diagnostics are stronger now, but richer browser/network evidence such as HTTP error responses, traces, or navigable artifact bundles are still open product work.
- Final commercial publisher metadata, code signing, and update strategy are still undecided.

## Next Work

Continue improving runner and results diagnostics now that historical failed-step context plus console/page-error/request-failure evidence are covered, starting with the next compact high-signal gap such as HTTP error responses, while keeping the accepted local-first architecture intact.
