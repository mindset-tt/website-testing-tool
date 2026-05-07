# MVP Implementation Plan

Last updated: 2026-05-06

This plan translates the accepted MVP architecture into implementation phases. It is not implementation code. It should guide the next work units after ADR-0002.

Accepted MVP stack:

- Electron.
- React.
- TypeScript.
- Node.js.
- Playwright.
- Local file storage.

Primary MVP workflow:

1. Create or open a local project.
2. Record a simple Chromium or Edge-family browser flow.
3. Display recorded steps in human-readable form.
4. Allow basic step editing.
5. Run the recorded test locally.
6. Capture screenshot on failure.
7. Show simple pass/fail result.
8. Save tests locally.

## Implementation Rules

- Keep each phase small and independently verifiable.
- Do not add product features during tooling setup.
- Keep the UI calm, serious, and practical.
- Prefer local, inspectable files over hidden state.
- Add only the tests/checks needed for the current phase.
- Preserve a clear path to Windows x64 packaging first.
- Track Windows ARM as an explicit validation risk, not as an assumed capability.

## Phase A: Repository And Tooling Setup

Goal: create the basic development foundation without product features.

Tasks:

- Initialize Git if missing.
- Initialize the package manager and package metadata.
- Create the Electron + React + TypeScript app scaffold.
- Add development scripts for app startup, linting, typechecking, formatting, and tests.
- Add initial TypeScript configuration for main, preload, renderer, and shared code.
- Add basic folder structure matching `docs/architecture/project-structure-plan.md`.
- Add minimal test framework setup only if it does not pull the project into product implementation.
- Add baseline README updates for local development commands after scripts exist.

Checks:

- Repository has Git initialized.
- App scaffold starts to an empty shell or placeholder screen.
- Typecheck script runs.
- Lint script runs.
- Test script runs, even if only against a trivial placeholder test.

Out of scope:

- No recorder.
- No project model.
- No Playwright automation feature.
- No report UI.
- No packaging attempt yet.

## Phase B: App Shell

Goal: create the first usable desktop shell for the MVP workflow.

Tasks:

- Create a basic desktop window.
- Create a clean restrained layout suitable for a commercial QA tool.
- Create a navigation shell for project, tests, runs, and settings placeholders.
- Create helpful empty states for no project, no tests, and no runs.
- Add error boundary or top-level failure state for renderer errors.
- Keep all text plain and task-oriented.

Checks:

- App opens on Fedora.
- Window shows stable layout at desktop size.
- Navigation areas do not imply unavailable product features.
- Empty states are useful without marketing copy.

Out of scope:

- No recorder yet.
- No local project creation yet.
- No browser automation yet.

## Phase C: Local Project Model

Goal: define and implement local project persistence.

Tasks:

- Define local project folder structure.
- Define project metadata file.
- Define test case JSON format.
- Define run artifact folder format.
- Implement create project.
- Implement open project.
- Implement save project metadata.
- Implement save/load test definitions.
- Add a sample project only if it helps verify storage without creating fake product scope.

Suggested project layout:

```text
project-name/
├─ project.json
├─ tests/
│  └─ example-test.json
├─ runs/
│  └─ run-YYYYMMDD-HHMMSS/
│     ├─ result.json
│     └─ screenshots/
└─ assets/
```

Checks:

- A new project can be created in a chosen folder.
- An existing project can be opened.
- Test JSON can be saved and loaded.
- Invalid project folders produce clear errors.

Out of scope:

- No SQLite.
- No cloud sync.
- No multi-user collaboration.
- No full test management suite.

## Phase D: Recorder Prototype

Goal: prove that the app can launch a browser and capture a simple flow.

Tasks:

- Launch Chromium or Edge-family browser through Playwright.
- Decide first browser path for implementation: Playwright-managed Chromium, installed Microsoft Edge, or browser discovery with a default.
- Record basic navigation.
- Record basic click actions.
- Record basic fill/text-entry actions.
- Convert captured actions to human-readable test steps.
- Store recorded test locally using the test case JSON format.
- Preserve raw automation details needed to rerun the step.

Initial action scope:

- `navigate`.
- `click`.
- `fill`.

Checks:

- User can start recording.
- Browser launches.
- User can perform a simple flow.
- App receives recorded actions.
- App shows readable steps.
- Recorded test saves locally.

Out of scope:

- Assertions, unless nearly free from Playwright recorder behavior.
- Advanced locator healing.
- Cross-browser matrix.
- Authentication-state management.
- Video or trace capture.

## Phase E: Step Editor

Goal: make recorded steps minimally editable by a non-developer.

Tasks:

- Display steps in order.
- Edit step label.
- Edit step target where safe.
- Edit step value for fill/input steps.
- Delete noisy steps.
- Reorder steps if feasible without delaying runner work.
- Validate step schema before saving.
- Show validation errors in plain language.

Checks:

- User can edit a fill value.
- User can rename a step.
- User can delete an unwanted step.
- Invalid step data cannot be saved silently.
- Saved edits persist after project reopen.

Out of scope:

- Full visual programming.
- Selector expert mode.
- Reusable components.
- Variables and environments.
- Developer scripting mode.

## Phase F: Runner Prototype

Goal: run saved steps locally and produce useful failure evidence.

Tasks:

- Load saved test definition.
- Launch Chromium or Edge-family browser through Playwright.
- Execute supported steps in order.
- Show in-progress status.
- Show final pass/fail result.
- Capture screenshot on failure.
- Save result artifact locally.
- Save failed step id/name and raw error message if available.
- Handle browser launch failure separately from test failure.

Checks:

- A saved passing test can run locally.
- A failing test produces a failed result.
- Failure screenshot is written to the run artifact folder.
- UI links the failed result to the failed step.
- Browser closes cleanly after run or failure.

Out of scope:

- Retries.
- Flaky test detection.
- Parallel runs.
- CI/CD integration.
- Full trace viewer.

## Phase G: Simple Report

Goal: make the latest run result understandable inside the app.

Tasks:

- Display latest result.
- Show test name, run status, browser, start time, end time, and duration.
- Show failed step when applicable.
- Show screenshot path or preview for failure.
- Show raw error message behind a technical details affordance.
- Add basic JSON report export if it fits naturally.
- Add basic HTML export later if feasible after the in-app report is useful.

Checks:

- User can find the latest run result.
- Failed run clearly identifies the failed step.
- Screenshot path or preview is visible.
- Result artifact can be found on disk.

Out of scope:

- PDF reports.
- Advanced analytics.
- JUnit output.
- Dashboard reporting.
- Historical trend analysis.

## Phase H: Packaging Validation

Goal: validate packaging assumptions before treating the MVP as commercially shippable.

Tasks:

- Validate Windows x64 packaging plan first.
- Document expected packaging tool and target artifacts.
- Confirm app launches on Windows x64.
- Confirm Playwright can launch the chosen Chromium/Edge path on Windows x64.
- Confirm local project read/write behavior on Windows x64.
- Document Windows ARM risk clearly.
- Attempt Windows ARM validation when hardware or representative VM is available.
- Do not block the MVP prototype on Windows ARM if Playwright browser support remains unresolved.
- Do not make commercial Windows ARM support claims until validated.

Checks:

- Windows x64 packaging path is documented.
- Windows ARM status is documented as validated, blocked, or pending.
- Any unsupported ARM behavior is captured in `docs/memory/known-issues.md`.

Out of scope:

- Production code signing.
- Auto-update.
- Licensing and activation.
- Microsoft Store submission.
- Enterprise deployment policy.

## First Implementation Slice

The first implementation slice should be Phase A only:

Initialize Git and create the Electron + React + TypeScript tooling scaffold.

Stop after that slice, run the new checks, update memory files, and write a dated log.
