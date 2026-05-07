# Current State

Last updated: 2026-05-07

## Summary

The `website-testing-tool` project has been initialized as a documentation-first foundation for a future commercial Windows desktop application for website testing.

## Current Facts

- Project directory created.
- Documentation scaffold created.
- `AGENTS.md` created as the behavior contract for Codex and future AI coding agents.
- Product, research, architecture, UX, and memory documents have starter content.
- Research documents now include an initial source-backed expansion of competitor pain points, cross-market pain themes, and MVP opportunity hypotheses.
- MVP scope has been tightened for a realistic first commercial prototype focused on one local recorder-runner workflow.
- Phase 1 roadmap now directly follows the tightened MVP: local project, simple browser recording, readable steps, basic editing, local run, failure screenshot, pass/fail result, and local saving.
- Technical stack evaluation has been expanded with the accepted first MVP stack: Electron + React + TypeScript + Node.js + Playwright with local file storage.
- ADR-0002 has been accepted: Electron + React + TypeScript + Node.js + Playwright with local file storage for the MVP.
- Windows x64 is the first packaging target.
- Windows ARM remains a validation risk and must not be claimed as commercially supported until validated.
- First MVP implementation plan and source structure plan have been created under `docs/architecture/`.
- Git has been initialized for this repository.
- npm has been selected as the package manager because no existing package manager config was present and npm is available on Fedora.
- Initial Electron + React + TypeScript tooling scaffold has been created.
- Source structure now includes `src/main/`, `src/preload/`, `src/renderer/`, `src/shared/`, `src/automation/`, `src/storage/`, and `src/reporting/`.
- Dependencies have been installed through npm.
- Baseline `typecheck`, `lint`, `test`, and `build` scripts pass.
- Basic app shell layout and empty states have been created in the React renderer.
- The renderer now has a left sidebar, top header, main workspace, "No project open" empty state, and placeholder cards for Projects, Tests, Recorder, Results, and Settings.
- Local project model documentation has been added in `docs/architecture/local-project-model.md`.
- Shared TypeScript schema types and validators exist for project metadata, test cases, and MVP step types.
- Minimal local project create/open behavior is wired through Electron main-process dialogs, storage functions, preload-safe IPC, and renderer buttons.
- Project creation writes `project.json` and creates `tests/`, `results/`, `artifacts/`, `artifacts/screenshots/`, `artifacts/videos/`, `artifacts/traces/`, and `logs/`.
- Test case JSON save/load/list helpers are implemented. The `src/storage/testCaseStorage.ts` module provides `createTestCase`, `readTestCase`, `saveTestCase`, `listTestCases`, and `deleteTestCase` with path traversal protection and input validation.
- Shared helpers in `project-schema.ts`: `createTestId`, `createStepId`, `createEmptyTestCase`, `toTestCaseFileName`, `isValidTestCaseFileName`.
- IPC channels `testCase:create`, `testCase:list`, `testCase:read`, `testCase:save` are wired through preload.
- **Manual step editor is now implemented.** The `StepEditor` component in `src/renderer/components/StepEditor.tsx` supports adding, editing, and deleting steps for all 4 MVP step types (`navigate`, `click`, `fill`, `assertText`). Saves through the preload-safe `saveTestCase` API.
- **12 step editor unit tests** cover step ID creation, validation of all 4 step types, rejection of invalid types, empty labels, and invalid timeout values.
- **MVP runner contract documented** in `docs/architecture/runner-contract.md`. Defines step execution semantics, `RunResult`/`StepResult` schemas, pass/fail rules, artifact storage paths, IPC contract, and known risks before Playwright.
- **Runner TypeScript types added** to `src/shared/project-schema.ts`: `RunStatus`, `StepStatus`, `StepResult`, `RunResult`, `validateRunResult`, `validateStepResult`.
- **11 runner contract unit tests** cover validation of step results and run results including edge cases.
- **Playwright installed** (`npm install playwright`) with Chromium browser. Fedora uses Ubuntu fallback build (expected).
- **Minimal test runner implemented** in `src/automation/testRunner.ts`. Supports all 4 MVP step types with fail-fast execution, 30s default timeout, failure screenshots, and result JSON storage.
- **Runner IPC wired** through `runner:run` channel in `src/main/runnerIpc.ts`, preload bridge, and `RunnerApi` type.
- **Run button added to UI** — selected test shows "Run test" button, running state, and pass/fail/error result with step-level details and screenshot paths.
- **7 runner unit tests** cover pure helpers, run result validation, and test case creation.
- **Browser recording implemented** — `Recorder` class in `src/automation/recorder.ts` launches Chromium, injects recording script, captures navigate/click/fill actions, and converts to `TestStep` format. `RecorderPanel` UI has Start/Stop buttons with live status.
- **Recorder IPC wired** through `recorder:start` and `recorder:stop` channels in `src/main/recorderIpc.ts`, preload bridge, and `RecorderApi` type.
- **Runner and recorder stabilized** — Fixed double `run_` prefix in result filenames, added browser cleanup on recorder start failure, clear stale run results when selecting a new test.
- **Manual validation document created** at `docs/validation/manual-runner-recorder-validation.md`.
- **Simple report view implemented** — `ReportPanel` component lists all run results sorted by date, shows pass/fail/error badges, and displays detailed step results with error messages and screenshot paths. `resultStorage.ts` provides `listRunResults` and `readRunResult` helpers.
- **Result IPC wired** through `result:list` and `result:read` channels in `src/main/resultIpc.ts`, preload bridge, and `ResultApi` type.
- No advanced reports, packaging, retries, or parallel execution exists yet.
- The MVP technical stack has been accepted in ADR-0002.
- Current phase: Simple report view implemented; ready for packaging validation.

## Current Focus

The next focus is packaging validation (Phase H). The core MVP workflow (project, test editing, recording, running, results) is now implemented.

## Important Constraint

Development is happening on Fedora Linux, but the final product targets Windows x86/x64 and Windows on ARM.
