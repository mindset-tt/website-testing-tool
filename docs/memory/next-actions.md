# Next Actions

Last updated: 2026-05-07

## Priority Order

1. Packaging validation (Phase H) — validate Windows x64 packaging assumptions.
2. Document expected packaging tool and target artifacts.
3. Confirm app launches on Windows x64.
4. Confirm Playwright can launch Chromium on Windows x64.
5. Document Windows ARM risk clearly.
6. Run baseline checks: `npm run typecheck`, `npm run lint`, `npm run test`, and `npm run build`.
7. Update docs, memory files, and dated logs.

## Notes

- Simple report view is implemented. `ReportPanel` lists all run results with pass/fail/error badges and step-level details.
- Result storage (`resultStorage.ts`) provides `listRunResults` and `readRunResult`.
- Result IPC is wired through `result:list` and `result:read` channels.
- Browser recording is implemented. `Recorder` class launches Chromium, injects recording script, captures navigate/click/fill actions.
- Recorder IPC is wired through `recorder:start` and `recorder:stop` channels.
- Playwright is installed with Chromium. Fedora uses Ubuntu fallback build (expected).
- Minimal test runner is implemented in `src/automation/testRunner.ts`. Supports all 4 MVP step types.
- Runner IPC is wired through `runner:run` channel, preload bridge, and `RunnerApi`.
- 62 total unit tests (7 tooling + 25 storage + 12 step editor + 11 runner contract + 7 runner).
- MVP runner contract is documented in `docs/architecture/runner-contract.md`.
- Phase D step editor is complete. `StepEditor` component supports add/edit/delete for all 4 MVP step types.
- Test case JSON save/load/list helpers are implemented (Phase C complete).
- IPC channels for project, test case, runner, recorder, and results are all wired through preload.
- Treat current competitor analysis as an initial research-backed hypothesis, not a final market conclusion.
- MVP scope is now intentionally narrow: local project, simple browser recording, readable steps, basic editing, local run, failure screenshot, pass/fail result, local saving, and Chromium or Edge first.
- ADR-0002 accepts Electron + React + TypeScript + Node.js + Playwright with local file storage for the MVP.
- Follow `docs/architecture/mvp-implementation-plan.md`, continuing with Phase H (packaging validation).
- Follow `docs/architecture/project-structure-plan.md` for source layout.
- Phase A-G are complete: tooling, app shell, project model, step editor, recorder, runner, simple report.
- Windows x64 is the first packaging target.
- Windows ARM remains a validation risk.
