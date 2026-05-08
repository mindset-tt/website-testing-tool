# CLI Runner — 2026-05-08

## Summary

Added a minimal CLI runner for saved local test cases, allowing developers and CI systems to run tests from the command line and produce JUnit XML or HTML reports.

## Changes

### New Files
- `src/cli/runTest.ts` — CLI entry point that wraps existing runner and storage modules
- `src/cli/parseArgs.ts` — Argument parser for CLI options (`--junit`, `--html`, `--headed`, `--browser`)
- `src/cli/exitCodes.ts` — Exit code constants and `runStatusToExitCode()` helper
- `tests/cli.test.ts` — 17 tests for argument parsing and exit code logic
- `docs/usage/cli-runner.md` — Full CLI usage documentation

### Modified Files
- `src/automation/testRunner.ts` — Added `headed` option to `RunnerOptions`; browser launches with `headless: !headed`
- `package.json` — Added `tsx` dev dependency and `cli` npm script
- `tsconfig.node.json` — Added `src/cli/**/*.ts` to includes
- `docs/architecture/runner-contract.md` — Added CLI runner note
- `docs/memory/current-state.md` — Noted CLI runner existence
- `docs/memory/next-actions.md` — Noted CLI runner completion
- `docs/memory/known-issues.md` — Noted CLI runner limitations
- `docs/memory/architecture-summary.md` — Added CLI runner entry

## CLI Behavior

```
npm run cli -- <project-path> <test-file-or-test-id> [--junit] [--html] [--headed] [--browser chromium]
```

- Validates project path by reading `project.json`
- Resolves test by file name, test ID, or search
- Runs the test using existing `runTestCase()`
- Saves JSON run result to `results/run-{runId}.json`
- Optionally exports JUnit XML (`--junit`) and HTML (`--html`)
- Prints concise output to stdout, errors to stderr
- Exit codes: 0 (passed), 1 (failed/error), 2 (invalid usage)

## Validation

- `npm run typecheck` — passed
- `npm run lint` — passed
- `npm run test` — 175 tests passed (17 new)
- `npm run build` — passed
