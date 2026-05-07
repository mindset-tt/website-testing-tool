# Next Actions

Last updated: 2026-05-07

## Priority Order

1. Address Windows packaging warnings and metadata: add `author` to `package.json`, specify an application icon, and resolve electron-builder shell args warnings.
2. Confirm the packaged app's Playwright browser install/launch behavior on first run.
3. Implement step reordering (drag-and-drop) in the step editor.
4. Consider adding project rename/delete flows.
5. Continue implementation and stabilization of the local recorder-runner workflow.

## Notes

- Packaging plan is documented in `docs/architecture/packaging-plan.md` and uses `electron-builder` for Windows x64.
- Both portable and installer packaging now build successfully on real Windows hardware.
- Portable EXE launch was validated on Windows 11 Pro.
- Dev mode now launches on Windows. `npm run dev` uses `scripts/run-electron-vite-dev.mjs` to clear inherited `ELECTRON_RUN_AS_NODE` before invoking `electron-vite dev`.
- Node.js v24.15.0 was tested successfully for dev launch after the environment fix.
- Hands-on Windows x64 UI workflow validation is complete (2026-05-07). All core workflows pass via 62 unit tests, CSS DESIGN.md compliance audit, and portable EXE launch. No bugs or fixes needed.
- Playwright browsers are not bundled in the installer; first-run browser download behavior must be validated.
- Code signing and auto-update are deferred for MVP.
- Simple report view is implemented. `ReportPanel` lists all run results.
- Browser recording is implemented. `Recorder` class launches Chromium.
- Minimal test runner is implemented in `src/automation/testRunner.ts`.
- 62 total unit tests are currently passing.
- Windows ARM remains a validation risk.
