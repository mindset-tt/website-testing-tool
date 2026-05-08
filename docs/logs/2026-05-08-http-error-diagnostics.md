# HTTP Error Diagnostics

Recorded on: 2026-05-08

## Summary

Added compact completed HTTP error capture to the runner evidence pipeline without changing project schema, test case schema, recorder behavior, packaging, or UI libraries. The runner now records capped Playwright `response` events when the status is `>= 400`, stores them as optional `httpErrors` on `RunResult`, and surfaces them inside the existing Browser evidence section plus copied failure summaries.

## Product Outcome

- Failed-run diagnostics now include an HTTP error count alongside console, page-error, and failed-request counts.
- Results detail now shows a compact list of recent completed 4xx/5xx responses with status, method, resource type, safe URL display, and optional status text.
- Copied failure summaries include the HTTP error count but do not dump raw HTTP logs.
- Older result files remain valid because `httpErrors` is optional.

## Implementation Notes

- Extended `RunResult` with an optional `httpErrors` array in the existing schema version.
- Extended the shared evidence collector to store only completed 4xx/5xx responses, cap entries at 50, truncate long URLs/status text, and ignore internal URL schemes.
- Attached a best-effort Playwright `page.on('response')` listener in the runner.
- Extended shared diagnostics helpers and the compact Results Browser evidence section to count and display recent HTTP errors.

## Validation

- `npm run typecheck`
- `npm run test`

Both passed during implementation before the final full validation pass.
