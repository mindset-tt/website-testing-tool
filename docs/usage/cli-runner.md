# CLI Runner

Last updated: 2026-05-08

The CLI runner lets developers and CI systems run saved test cases from the command line and optionally produce JUnit XML or HTML reports.

## Prerequisites

- Node.js >= 22.12.0
- Playwright Chromium installed (`npx playwright install chromium`)
- A project created with the Website Testing Tool desktop app containing saved test cases

## Command

```bash
npm run cli -- <project-path> <test-file-or-test-id> [options]
```

### Positional Arguments

| Argument | Description |
|---|---|
| `project-path` | Absolute or relative path to the project folder (must contain a valid `project.json`) |
| `test-file-or-test-id` | Either the test case file name (e.g. `checkout-flow.test.json`) or the test ID (e.g. `test_550e8400-e29b-41d4-a716-446655440000`) |

### Options

| Option | Description |
|---|---|
| `--junit` | Export a JUnit XML report to `reports/junit-{runId}.xml` after the run |
| `--html` | Export an HTML report to `reports/report-{runId}.html` after the run |
| `--headed` | Run the browser in headed (visible) mode instead of headless |
| `--browser <name>` | Browser to use (default: `chromium`). MVP supports `chromium` only |

## Examples

### Basic run

```bash
npm run cli -- "C:\Projects\my-website-tests" "checkout-flow.test.json"
```

### Run with JUnit export

```bash
npm run cli -- "C:\Projects\my-website-tests" "checkout-flow.test.json" --junit
```

### Run with both JUnit and HTML export

```bash
npm run cli -- "C:\Projects\my-website-tests" "checkout-flow.test.json" --junit --html
```

### Run by test ID

```bash
npm run cli -- "C:\Projects\my-website-tests" "test_550e8400-e29b-41d4-a716-446655440000" --junit
```

### Run in headed mode (visible browser)

```bash
npm run cli -- "C:\Projects\my-website-tests" "checkout-flow.test.json" --headed
```

## Console Output

The CLI prints concise output to stdout:

```
Running: Checkout flow
Status:   PASSED
Duration: 5234ms
Result:   results/run-run_abc123.json
JUnit:    reports/junit-run_abc123.xml
HTML:     reports/report-run_abc123.html
```

Errors and invalid usage messages go to stderr.

## Exit Codes

| Code | Meaning |
|---|---|
| `0` | Test passed |
| `1` | Test failed or encountered an error |
| `2` | Invalid usage or configuration (missing arguments, invalid project, test not found, etc.) |

## Limitations

- Only Chromium is supported for MVP. Firefox and WebKit are not yet available.
- The CLI does not support suites, tags, parallel execution, or environment variables.
- The CLI does not bundle Playwright browsers. Chromium must be installed separately.
- The CLI does not support custom output paths. Reports are always written to the project's `reports/` directory.
- The CLI does not support step-level filtering or test data parameterization.
- The CLI is a thin wrapper around the existing runner and storage modules. It does not introduce new execution semantics.
