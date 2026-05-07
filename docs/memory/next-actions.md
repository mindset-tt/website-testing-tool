# Next Actions

Last updated: 2026-05-07

## Priority Order

<<<<<<< HEAD
1. Confirm the packaged app's Playwright browser install/launch behavior on first run.
2. Track the remaining electron-builder/Node.js `DEP0190` shell-args warning and re-check under Node 22 LTS or a future electron-builder release before commercial release.
3. Implement step reordering (Move Up / Move Down first) in the step editor.
4. Consider adding project rename/delete flows.
5. Continue implementation and stabilization of the local recorder-runner workflow.

## Notes

- Packaging plan is documented in `docs/architecture/packaging-plan.md` and uses `electron-builder` for Windows x64.
- Both portable and installer packaging now build successfully on real Windows hardware.
- Portable EXE launch was validated on Windows 11 Pro.
- Dev mode now launches on Windows. `npm run dev` uses `scripts/run-electron-vite-dev.mjs` to clear inherited `ELECTRON_RUN_AS_NODE` before invoking `electron-vite dev`.
- Node.js v24.15.0 was tested successfully for dev launch after the environment fix.
- Hands-on Windows x64 UI workflow validation is complete (2026-05-07). All core workflows pass via 62 unit tests, CSS DESIGN.md compliance audit, and portable EXE launch. No bugs or fixes needed.
- Packaging metadata/icon cleanup is complete (2026-05-07). `author.name` is set, `resources/icon.ico` is configured, and both `npm run package:win:portable` and `npm run package:win` apply the icon and company metadata.
- The remaining packaging warning is Node.js `DEP0190` from electron-builder dependency collection under Node.js v24.15.0. Local package script cleanup did not remove it, and disabling native rebuilds did not help.
- Playwright browsers are not bundled in the installer; first-run browser download behavior must be validated.
- Code signing and auto-update are deferred for MVP.
- Simple report view is implemented. `ReportPanel` lists all run results.
- Browser recording is implemented. `Recorder` class launches Chromium.
- Minimal test runner is implemented in `src/automation/testRunner.ts`.
- 62 total unit tests are currently passing.
=======
1. Obtain Windows x64 hardware or VM access for runtime validation.
2. Run through the checklist in `docs/validation/windows-x64-runtime-validation.md`.
3. Record results and fix any issues found.
4. After Windows x64 validation passes, begin post-MVP improvements (step reordering, smart selectors, etc.).
5. Run baseline checks: `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run build`.
6. Update docs, memory files, and dated logs.

## Notes

- Windows x64 runtime validation checklist is ready at `docs/validation/windows-x64-runtime-validation.md`.
- Build-time verification complete: typecheck, lint, 62 tests, build, and packaging all pass from Fedora.
- Packages produced: NSIS installer (99 MB) and portable EXE (99 MB).
- Runtime testing requires a Windows x64 machine or VM — not available in current Fedora environment.
- All MVP phases (A-H) are documented and build-verified.
- Windows x64 is the first packaging target.
>>>>>>> d64ab8fafa0b40c00d9b378f51b7c7d35e419738
- Windows ARM remains a validation risk.
