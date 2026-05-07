# Project Structure Plan

Last updated: 2026-05-06

This document proposes the expected source layout for the Electron + React + TypeScript MVP. The structure is intentionally simple so early implementation can move without hiding responsibilities.

## Proposed Source Tree

```text
src/
├─ main/
├─ preload/
├─ renderer/
├─ shared/
├─ automation/
├─ storage/
└─ reporting/
```

## Folder Responsibilities

### `src/main/`

Electron main process code.

Responsibilities:

- App lifecycle.
- Window creation.
- Native menus.
- File dialogs.
- IPC registration.
- Secure access to local filesystem operations.
- Coordination between renderer and automation runner.
- App-level error handling and logging.

Rules:

- Keep browser automation orchestration here or in `src/automation/`, not in the renderer.
- Do not expose broad filesystem or Node.js access directly to the renderer.

### `src/preload/`

Electron preload bridge code.

Responsibilities:

- Expose a narrow typed API from the main process to the renderer.
- Keep `contextIsolation` compatible APIs.
- Validate renderer inputs before forwarding where practical.
- Avoid leaking raw Electron or Node.js objects to UI code.

Rules:

- Treat the preload layer as a public contract.
- Keep API names task-focused, such as `project.create`, `project.open`, `tests.run`, and `recorder.start`.

### `src/renderer/`

React application code.

Responsibilities:

- App layout.
- Navigation shell.
- Empty states.
- Project screens.
- Test list and test editor screens.
- Recorder status UI.
- Run result and report UI.
- User-facing error messages.

Rules:

- Renderer code should not import Node.js filesystem APIs.
- Renderer code should call the typed preload API for privileged operations.
- Keep UI state separate from persisted project data.

### `src/shared/`

Shared TypeScript types, constants, and pure helpers.

Responsibilities:

- Project metadata types.
- Test case schema types.
- Step model types.
- Run result types.
- IPC request/response types.
- Pure validation helpers.
- Shared error shapes.

Rules:

- Keep this folder free of Electron, Playwright, and filesystem side effects.
- Anything imported by both renderer and main should usually live here.

### `src/automation/`

Playwright recording and running logic.

Responsibilities:

- Browser launch helpers.
- Browser discovery helpers.
- Recorder prototype.
- Step-to-Playwright action translation.
- Runner prototype.
- Failure screenshot capture.
- Raw automation error normalization.
- Browser cleanup.

Rules:

- Keep Playwright imports here.
- Keep automation errors structured so the UI can show plain-language summaries later.
- Do not couple automation code to React components.

### `src/storage/`

Local project file storage.

Responsibilities:

- Project folder creation.
- Project metadata read/write.
- Test case JSON read/write.
- Run result artifact creation.
- Screenshot path handling.
- Basic schema validation before persistence.

Rules:

- Keep storage paths predictable and portable.
- Avoid SQLite in the MVP unless local file storage becomes clearly insufficient.
- Do not store hidden state that users cannot back up with the project folder.

### `src/reporting/`

Run result formatting and report generation.

Responsibilities:

- Convert run artifacts into UI-ready summaries.
- Build simple in-app report data.
- Prepare future JSON export.
- Prepare future HTML export.
- Keep report output stable enough for later sharing.

Rules:

- Reporting should consume saved run artifacts, not internal runner state.
- Keep report generation deterministic and file-based.

## Future Folders To Consider Later

These should not be added until the MVP needs them:

- `src/components/` if renderer components need a shared UI library.
- `src/fixtures/` for sample projects or test assets.
- `src/integrations/` for CI/CD or external tool integrations.
- `src/licensing/` for commercial licensing.
- `src/plugins/` for a plugin system.

## Initial Non-Code Scaffolding Note

This document describes the expected structure only. The folders should be created during Phase A when the Electron + React + TypeScript tooling scaffold is initialized.
