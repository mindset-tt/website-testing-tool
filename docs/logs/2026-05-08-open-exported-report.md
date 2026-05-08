# Open/Reveal Exported HTML Report

**Date:** 2026-05-08

## Summary

Implemented safe follow-through actions for exported HTML run reports. Users can now open or reveal exported reports immediately after exporting, with secure path validation preventing arbitrary filesystem access.

## Changes

### Storage & Path Validation

- Added `resolveExportedReportPath()` in `src/storage/resultStorage.ts` to safely validate and resolve exported report paths.
- Validation enforces:
  - Absolute path rejection (prevents escape from project)
  - Traversal rejection (`..` patterns)
  - URL scheme rejection (`://` patterns)
  - `.html` file extension requirement
  - `report-{runId}.html` filename pattern (canonical form)
  - Root-level `reports/` directory containment (no subdirectories)
- Imported `shell` from Electron in main IPC handler for safe file operations.
- Added `basename` and `dirname` imports in result storage to support filename validation.

### IPC Channels & Preload API

- Added two new IPC channels in `src/shared/ipc-channels.ts`:
  - `resultOpenExportedReport` — open report in default application
  - `resultRevealExportedReport` — reveal report in file manager
- Extended `ResultApi` interface in `src/shared/preload-api.ts` with matching methods.
- Wired preload bridging in `src/preload/index.ts` for both new handlers.

### Main Process IPC Handlers

- Registered two new handlers in `src/main/resultIpc.ts`:
  - `resultOpenExportedReport`: calls `shell.openPath()` after validating the report path.
  - `resultRevealExportedReport`: calls `shell.showItemInFolder()` after validating the report path.
- Both handlers:
  - Validate project path and report path inputs
  - Call `resolveExportedReportPath()` to ensure path safety
  - Return user-safe error messages (no raw stack traces)
  - Preserve the secure IPC boundary (renderer supplies paths; main process validates and executes)

### Renderer UI

- Extended `ReportPanel.tsx` state:
  - `exportedReportPath` — persists the export path for follow-through actions
  - `openingReport` / `revealingReport` — disable buttons during async operations
  - `reportActionMessage` / `reportActionError` — separate messaging for open/reveal feedback
- New event handlers:
  - `handleOpenExportedReport()` — invoke open action via IPC
  - `handleRevealExportedReport()` — invoke reveal action via IPC
- UI updates:
  - Wrapped export status message and follow-through actions in a new `.report-export-section` container
  - Show inline-action buttons for "Open report" and "Reveal in folder" only when export succeeds
  - Buttons disabled during async operations to prevent double-clicks
  - Display success/error feedback from open/reveal actions below the action buttons
  - Clean up exported report state when switching between results

### Styling

- Added `.report-export-actions` class for a compact horizontal flex layout of follow-through buttons
- Added `.report-export-section` class to group export message and action buttons into a logical section

### Testing

- Added 5 new test cases in `tests/resultStorage.test.ts`:
  - `validates a safe exported report path` — happy path for a valid report path
  - `rejects traversal attempts in exported report paths` — prevents `../` escapes
  - `rejects absolute exported report paths` — prevents absolute or rooted paths (cross-platform)
  - `rejects exported report paths with the wrong extension` — prevents non-HTML file access
  - `rejects exported report paths that do not use the canonical report filename pattern` — prevents arbitrary filenames
- All tests pass deterministically and use temporary directories.

## Security Validation

- Renderer never receives filesystem APIs or shell APIs.
- Main process validates all inputs before invoking Electron `shell` methods.
- Path resolution stays inside project `reports/` folder (no traversal allowed).
- Only `.html` files with the `report-{runId}.html` pattern can be opened.
- Invalid project paths, missing report paths, and wrong extensions all return safe user-facing errors.

## Checks Passed

- ✓ `npm run typecheck` — no TypeScript errors
- ✓ `npm run lint` — no linting errors
- ✓ `npm run test` — 140 tests pass, including 5 new validation tests
- ✓ `npm run build` — production build succeeds

## Behavior

### Export Success

1. User selects a run and clicks "Export HTML report".
2. Report writes to `{projectPath}/reports/report-{runId}.html`.
3. Success message shows project-relative path.
4. Two secondary inline actions appear: **Open report** and **Reveal in folder**.

### Open Report

1. User clicks "Open report".
2. Button shows "Opening…" while async.
3. `shell.openPath()` launches the report in the default browser or viewer.
4. Success message confirms report opened.

### Reveal in Folder

1. User clicks "Reveal in folder".
2. Button shows "Revealing…" while async.
3. `shell.showItemInFolder()` opens the file manager with the report selected/highlighted.
4. Success message confirms report revealed.

### Error Handling

- Invalid project path: "Project path is required."
- Missing report path: "HTML report path is required."
- Traversal attempt: "HTML report path must stay inside the project reports folder."
- Invalid filename pattern: "HTML report filename is invalid."
- Shell operation failure: "Could not open the report." or "Could not reveal the report in folder."

## Known Limitations & Notes

- Report paths must match the `report-{runId}.html` pattern generated by export. Manual edits to the filename on disk will prevent opening/revealing (by design).
- If a report file is deleted after export but before opening, `shell.openPath()` will fail with a user-safe message.
- The feature is now Windows-ready. Electron `shell` APIs work across macOS, Windows, and Linux.
- This feature does NOT expose arbitrary filesystem browsing or file picking. It only acts on paths generated by the safe export flow.

## Next Steps

- Packaging and runtime validation on Windows portable EXE.
- Continue runner/results evidence work (lightweight request/response context).
- Incremental application of the `Local QA Workbench` design direction.
