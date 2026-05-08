# Console And Page Error Diagnostics

Recorded on: 2026-05-08

## Summary

Added compact browser-side evidence capture to runner results without changing project schema, test case schema, recorder behavior, packaging, or UI libraries. The runner now records capped browser console messages and unhandled page errors, stores them as optional fields in `RunResult`, and the Results panel shows that evidence in a compact Browser evidence section when present.

## Product Outcome

- Failed-run diagnostics now include browser console counts, warning/error counts, and page-error counts.
- Results detail now shows recent relevant console entries plus recent page errors without dumping huge raw logs.
- Copied failure summaries include evidence counts but not raw browser log dumps.
- Older result files remain valid because the new fields are optional.

## Implementation Notes

- Extended `RunResult` with optional `consoleMessages` and `pageErrors` arrays in the existing schema version.
- Added a pure runner evidence helper to truncate text, trim stacks, cap entries, and preserve only safe optional step-index associations.
- Attached Playwright `page.on('console')` and `page.on('pageerror')` listeners in the runner with best-effort error handling.
- Added diagnostics helpers for evidence counts, relevant-entry selection, location formatting, and compact page-error stack preview.
- Added a compact Results panel section and supporting CSS that fits the existing Local QA Workbench style.

## Validation

- `npm run typecheck`
- `npm run test`

Both passed during implementation before the final full validation pass.
