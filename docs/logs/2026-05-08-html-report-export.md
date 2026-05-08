# 2026-05-08 HTML Report Export

## Summary

- Added a pure shared HTML report renderer for saved `RunResult` objects.
- Added a project-scoped HTML export path that writes `reports/report-{runId}.html` inside the selected project only.
- Added a secondary **Export HTML report** action to the Results panel for the selected run.
- Updated docs and memory files to record the new local report-export capability.

## Implementation Notes

- Created `src/shared/htmlReport.ts` to render a complete standalone HTML document with escaped user-controlled text.
- Reused existing result diagnostics helpers so evidence counts and compact evidence lists stay aligned with the Results panel.
- Kept report content lightweight: no screenshot embedding, no full log dumps, no arbitrary output path picker, and no schema changes.
- Tightened result storage by validating run IDs before reading saved runs or exporting reports.

## Validation

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`

All checks passed on 2026-05-08.

## Follow-up

- The next small product improvement is a follow-through action for exported reports, such as revealing the generated file in the project folder or opening it directly after export without exposing arbitrary filesystem access.
