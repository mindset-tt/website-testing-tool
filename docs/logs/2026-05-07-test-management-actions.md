# 2026-05-07 Test Management Actions

## Summary

Added compact test rename, duplicate, and guarded delete actions to the Tests workspace so non-developers can manage saved tests without touching files on disk.

## What Changed

- Kept rename on the existing `saveTestCase` path so only the human-readable `name` changes while `testId`, `createdAt`, and the JSON file path remain stable.
- Added a main-process duplicate path that reads a saved test, creates a new `testId`, resets `createdAt` and `updatedAt`, prefixes the name with `Copy of `, and writes a new `.test.json` file.
- Regenerated step IDs on duplicate so the copied test has its own stable step identities for future diagnostics and editing.
- Added a preload-safe delete API that still validates project paths and file names in the main process.
- Added inline rename and delete-confirmation strips in the selected test header without introducing modal or drag-and-drop dependencies.
- Refreshed the suite list after rename, duplicate, step save, and delete so the visible test list stays aligned with disk state.
- Updated the step editor to resync its local editable state when the selected test changes.

## Validation

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`

## Follow-Up

- Add project-level rename and guarded delete or recovery flows so workspace management is not limited to test files.
