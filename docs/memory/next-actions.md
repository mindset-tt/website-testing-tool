# Next Actions

Last updated: 2026-05-07

## Priority Order

1. Validate Windows x64 packaging on real hardware (Windows machine or VM).
2. Run through the validation checklist in `docs/architecture/packaging-plan.md`.
3. Confirm app launches, project create/open works, runner executes, recorder captures.
4. Document any issues found during validation.
5. Run baseline checks: `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run build`.
6. Update docs, memory files, and dated logs.

## Notes

- Packaging plan is documented in `docs/architecture/packaging-plan.md`. Recommends `electron-builder` for Windows x64.
- `electron-builder` installed as dev dependency with `build` config in `package.json`.
- Scripts added: `package:win` (NSIS installer), `package:win:portable` (portable EXE).
- Playwright browsers are NOT bundled in the installer — downloaded on first use.
- Code signing and auto-update are deferred for MVP.
- README.md updated with packaging status and build commands.
- Simple report view is implemented. `ReportPanel` lists all run results.
- Browser recording is implemented. `Recorder` class launches Chromium.
- Minimal test runner is implemented in `src/automation/testRunner.ts`.
- 62 total unit tests passing.
- Phase A-G are complete: tooling, app shell, project model, step editor, recorder, runner, simple report.
- Phase H packaging plan is complete; validation on Windows hardware is next.
- Windows x64 is the first packaging target.
- Windows ARM remains a validation risk.
