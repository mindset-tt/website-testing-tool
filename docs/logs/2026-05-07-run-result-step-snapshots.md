# 2026-05-07 — Run Result Step Snapshots

## Summary

Implemented historical step snapshots in run results so failure diagnostics do not drift when a test case is edited after a run.

## What changed

- Extended `RunResult` with an optional `stepSnapshots` array.
- Added `StepSnapshot` to the shared project schema.
- Updated the runner to capture snapshot data from `TestCase` at run time.
- Updated failure diagnostics to prefer snapshot data and fall back to current test case data only for older results.
- Updated the Results panel to show snapshot-based step details without redesigning the UI.
- Added validation and tests for new snapshot behavior and backward compatibility.

## Validation

- `npm run typecheck` ✅
- `npm run lint` ✅
- `npm run test` ✅
- `npm run build` ✅

## Notes

- Existing run results without `stepSnapshots` remain valid and continue to work.
- The Results panel now shows historical run-time context when available.
