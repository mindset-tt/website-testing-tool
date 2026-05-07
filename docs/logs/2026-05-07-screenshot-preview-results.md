# 2026-05-07: Failure Screenshot Preview In Results

## Summary

Added failure screenshot preview support to the Results panel for selected failed runs. The renderer now requests preview data through a validated main-process IPC path instead of reading project files directly.

## What Changed

- Added `result:readFailureScreenshot` IPC and preload support.
- Added result-storage validation that only allows `.png` paths inside the selected project's `artifacts/screenshots` directory.
- Returned failure screenshots to the renderer as `data:image/png;base64,...` URLs for MVP safety.
- Updated the Results panel to show a loading state, bounded preview frame, and user-safe preview errors while keeping the stored screenshot path visible.
- Added result-storage tests for valid screenshot paths, traversal rejection, non-screenshot directory rejection, non-PNG rejection, and successful PNG preview reads.

## Checks

- `npm run typecheck` — passed
- `npm run lint` — passed
- `npm run test` — passed (`84` tests)
- `npm run build` — passed

## Notes

- This task did not change runner capture behavior or result schema shape.
- Failure diagnostics are still MVP-level evidence: screenshot preview is available, but traces, console logs, and network logs are still absent.
