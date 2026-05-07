# Next Actions

Last updated: 2026-05-07

## Priority Order

1. Complete interactive Windows x64 workflow validation for project create/open, test creation, step editor, runner, screenshot-on-failure, recorder, and result panel.
2. Address Windows packaging warnings and metadata: add `author` to `package.json`, specify an application icon, and resolve electron-builder shell args warnings.
3. Confirm the packaged app's Playwright browser install/launch behavior on first run.
4. Update validation documentation and memory files with the results.
5. Continue implementation and stabilization of the local recorder-runner workflow after Windows runtime validation is complete.

## Notes

- Packaging plan is documented in `docs/architecture/packaging-plan.md` and uses `electron-builder` for Windows x64.
- Both portable and installer packaging now build successfully on real Windows hardware.
- Portable EXE launch was validated on Windows 11 Pro.
- Playwright browsers are not bundled in the installer; first-run browser download behavior must be validated.
- Code signing and auto-update are deferred for MVP.
- Simple report view is implemented. `ReportPanel` lists all run results.
- Browser recording is implemented. `Recorder` class launches Chromium.
- Minimal test runner is implemented in `src/automation/testRunner.ts`.
- 62 total unit tests are currently passing.
- Phase H packaging validation is in progress; Windows x64 runtime launch is confirmed, but feature workflows remain pending.
- Windows ARM remains a validation risk.
