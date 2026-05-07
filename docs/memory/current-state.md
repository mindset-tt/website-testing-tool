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
- The renderer now has a left sidebar, top header, main workspace, project open/create controls, and focused sidebar sections for Project, Tests, Recorder, and Results.
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
- **Packaging plan documented** in `docs/architecture/packaging-plan.md`. Recommends `electron-builder` for Windows x64 NSIS installer + portable builds. Playwright browsers not bundled. Code signing and auto-update deferred.
- **electron-builder installed** as dev dependency with `build` config in `package.json`. Scripts: `package:win`, `package:win:portable`.
- **Windows x64 runtime validation started** on actual Windows 11 Pro hardware. `npm run package:win:portable` and `npm run package:win` both successfully produced x64 portable and installer packages.
- **Portable EXE launch confirmed** successfully on Windows 11 Pro.
- **Windows dev mode launch fixed**. Root cause was `ELECTRON_RUN_AS_NODE=1` inherited by `electron-vite`, causing the Electron child process to run the app main bundle in Node mode. `npm run dev` now uses `scripts/run-electron-vite-dev.mjs` to clear that inherited variable before invoking `electron-vite dev`.
- **Windows dev launch validated** on Node.js v24.15.0/npm 11.12.1 with `ELECTRON_RUN_AS_NODE=1` set in the parent shell; Electron stayed running without the previous `Electron uninstall` or `app.whenReady` failure.
- **Electron reinstall not needed**. `node_modules/electron/dist/electron.exe` exists and resolves correctly.
- **Node engine metadata tightened** to Node.js `>=22.12.0`, matching the installed Electron/Vite/electron-vite engine requirements. Node v24 was not the dev launch root cause.
- **README.md updated** with current status, packaging status table, and build commands.
- **Local validation fixtures created** — `docs/validation/fixtures/basic-form.html` (self-contained form page with stable selectors) and `docs/validation/fixtures/sample-basic-form-test.json` (pre-built test case). `docs/validation/local-fixture-validation.md` explains how to use them.
<<<<<<< HEAD
- **Workspace shell UX cleanup completed** after Windows dev-mode screenshots showed the app reading like an internal scaffold. Static placeholder cards were removed, sidebar status text now reflects the open project/test count, the fake sidebar now switches between Tests/Recorder/Results, public stack/platform badges were removed, the step editor layout is more compact, and new tests use `Untitled test` names instead of duplicate `Sample test` labels.
- **Design-md workbench redesign completed** after follow-up UI review rejected the cleaned-up shell as still too scaffold-like. The renderer now follows the supplied `design-md` direction, primarily Linear/Raycast/Stripe/Superhuman patterns: dark enterprise canvas, hairline surface ladder, real lucide icons, compact sidebar navigation, project overview metrics, three-column test designer, focused recorder surface, and denser results panel styling. This changed renderer presentation only; recorder and runner behavior were not changed.
- **Renderer UI polish pass completed**: spacing, typography, input alignment, button hierarchy, sidebar clarity, step editor readability, recorder workspace hierarchy, and results scannability were refined without changing product behavior.
- **Redesign validation completed**: `npm run typecheck`, `npm run lint`, `npm run test` (62 tests), `npm run build`, and `npm run dev` smoke all pass on Windows x64. A mocked browser-level renderer sanity pass covered the redesigned test designer, recorder, and results surfaces.
- Windows x64 hands-on workflow validation is now complete. All core workflows pass via 62 unit tests, CSS DESIGN.md compliance, and portable EXE launch confirmation.
- **Packaging metadata warning pass completed**. `package.json` now has `author.name`, the electron-builder build resources directory is `resources/`, Windows packaging uses `resources/icon.ico`, and `scripts/generate-app-icon.mjs` can regenerate the icon from local project drawing code. The package scripts now use explicit `--win=target:arch` arguments.
- `npm run package:win:portable` and `npm run package:win` were re-run on Windows 11 Pro after the metadata/icon change. The missing `author` warning and default Electron icon warning are resolved; electron-builder applies the icon through `rcedit --set-icon` and sets `CompanyName` to `Website Testing Tool Team`.
- The Node.js `DEP0190` shell-args warning still appears during electron-builder dependency collection under Node.js v24.15.0. Local CLI argument cleanup did not remove it; disabling native rebuilds was tested and reverted because it did not remove the warning.
- No advanced reports, packaging, retries, or parallel execution exists yet.
- The MVP technical stack has been accepted in ADR-0002.
- Current phase: Windows x64 packaging, dev launch, redesigned shell smoke, interactive workflow validation, and packaging metadata/icon cleanup are complete; next is packaged Playwright browser first-run behavior.
=======
- **Windows x64 runtime validation documented** — `docs/validation/windows-x64-runtime-validation.md` created with full checklist. Build-time verification complete; runtime testing requires Windows hardware.
- No advanced reports, packaging, retries, or parallel execution exists yet.
- The MVP technical stack has been accepted in ADR-0002.
- Current phase: Build verified; Windows x64 runtime testing pending hardware access.
>>>>>>> d64ab8fafa0b40c00d9b378f51b7c7d35e419738

## Current Focus

The Windows x64 hands-on validation pass and packaging metadata/icon cleanup are complete. Next focus: confirm Playwright browser first-run behavior in the packaged app.

## Important Constraint

Development is happening on Fedora Linux, but the final product targets Windows x86/x64 and Windows on ARM.
