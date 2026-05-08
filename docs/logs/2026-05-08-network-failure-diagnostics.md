# Network Failure Diagnostics

Recorded on: 2026-05-08

## Summary

Added compact network request-failure capture to the existing runner evidence pipeline without changing project schema, test case schema, recorder behavior, packaging, or UI libraries. The runner now records capped Playwright `requestfailed` events, stores them as optional `networkFailures` on `RunResult`, and surfaces them inside the existing Browser evidence section plus copied failure summaries.

## Product Outcome

- Failed-run diagnostics now include a network failure count alongside console and page-error counts.
- Results detail now shows a compact list of recent failed requests with safe URL display plus method, resource type, failure text, and optional status when available.
- Copied failure summaries include the network failure count but do not dump raw request logs.
- Older result files remain valid because `networkFailures` is optional.

## Implementation Notes

- Extended `RunResult` with an optional `networkFailures` array in the existing schema version.
- Extended the shared evidence collector to normalize failed-request URLs and text, cap entries at 50, preserve safe optional method/resource type/status fields, and ignore only obviously internal URL schemes.
- Attached a best-effort Playwright `page.on('requestfailed')` listener in the runner.
- Extended shared diagnostics helpers and the compact Results Browser evidence section to count and display recent failed requests.

## Validation

- `npm run typecheck`
- `npm run test`

Both passed during implementation before the final full validation pass.
