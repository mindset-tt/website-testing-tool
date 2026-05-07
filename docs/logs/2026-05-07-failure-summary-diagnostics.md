# 2026-05-07: Failed-Step Diagnostics And Copy Failure Summary

## Summary

Improved the Results panel for failed and error runs by adding a compact failure summary card and a **Copy failure summary** action. The card now explains what failed, where it failed, and what evidence exists without exposing raw filesystem access or large debug dumps.

## What Changed

- Added shared pure helpers for:
  - finding the primary failed step
  - matching that step back to the saved test definition
  - building a plain-text failure summary for clipboard sharing
- Updated the Results panel to:
  - load the current saved test case for richer step context
  - show failed step number, label, type, target, value, timeout, error, and screenshot evidence when available
  - keep the project-relative screenshot path visible
  - copy a concise text summary with browser clipboard support
- Added tests for failure summary behavior and fallback behavior when no failed-step details were recorded.

## Notes

- This task did not change runner execution flow, recorder behavior, or any schema.
- Historical target/value/timeout details in the Results panel are still reconstructed from the current saved test case, so they can drift if the test is edited after the run.

## Checks

- `npm run typecheck` — passed
- `npm run lint` — passed
- `npm run test` — passed (`89` tests)
- `npm run build` — passed
