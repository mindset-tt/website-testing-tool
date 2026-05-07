# 2026-05-07 Forget Recent Project

## Summary

Added a non-destructive **Forget** action for recent-project entries so users can clean up quick-open items without deleting any project files.

## What Changed

- Updated the recent-project storage helper to remove one entry by project path and return the updated sorted list.
- Added a preload-safe IPC path for forgetting recent projects with main-process input validation.
- Split the no-project recent-project row into separate **Open** and **Forget** actions so forgetting cannot accidentally open a workspace.
- Kept the underlying project folder and `project.json` untouched when a recent entry is forgotten.
- Added deterministic storage tests for removing a matching path, preserving sorted order, and handling absent paths safely.

## Validation

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`

## Follow-Up

- Continue runner and results diagnostics work now that the core local workspace-management flows are in place.
