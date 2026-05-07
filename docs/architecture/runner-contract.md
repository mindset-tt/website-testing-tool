# MVP Runner Contract

Last updated: 2026-05-07

This document defines the contract for the MVP test runner before Playwright is installed or any runner code is written. It is a design document, not implementation.

## 1. Purpose

The runner takes a saved `TestCase` (with manually authored steps) and executes each step against a real browser using Playwright. It produces a structured `RunResult` saved to the project's `results/` directory and writes failure screenshots to `artifacts/screenshots/`.

## 2. Runner Input

The runner receives:

| Input | Type | Source |
|---|---|---|
| `testCase` | `TestCase` | Loaded from `tests/*.test.json` via `readTestCase` |
| `projectPath` | `string` | The open project's root folder path |
| `browserName` | `'chromium' \| 'firefox' \| 'webkit'` | User preference or default. MVP default: `'chromium'` |

The runner is responsible for:
- Launching a Playwright browser and page.
- Executing each step in order.
- Capturing a screenshot on the first failure.
- Closing the browser after execution (success or failure).
- Writing the `RunResult` to disk.

## 3. Step Execution Semantics

Each MVP step type maps to a Playwright action:

### `navigate`

- **Playwright API:** `page.goto(target, { timeout })`
- **Requires:** `target` (URL string)
- **Fails if:** `target` is missing, navigation times out, or page fails to load.

### `click`

- **Playwright API:** `page.click(target, { timeout })`
- **Requires:** `target` (CSS selector or text selector)
- **Fails if:** `target` is missing, element not found, element not visible, or click times out.

### `fill`

- **Playwright API:** `page.fill(target, value, { timeout })`
- **Requires:** `target` (CSS selector), `value` (text to type)
- **Fails if:** `target` or `value` is missing, element not found, or fill times out.

### `assertText`

- **Playwright API:** `expect(page.locator(target)).toContainText(value, { timeout })`
- **Requires:** `target` (CSS selector), `value` (expected text)
- **Fails if:** `target` or `value` is missing, element not found, or text does not match within timeout.

### General Rules

- Steps execute sequentially in array order.
- **Fail-fast:** the first failed step stops the run. Remaining steps are marked `skipped`.
- If a step has `timeoutMs`, it overrides the default timeout for that action.
- Default timeout per step: **30,000 ms** (30 seconds).
- If `target` is missing for a step that requires it, the step fails immediately with a validation error (no browser interaction).

## 4. Run Result Schema

### `RunResult`

```typescript
interface RunResult {
  readonly schemaVersion: 1;
  readonly runId: string;          // "run_" + UUID
  readonly testId: string;         // from TestCase
  readonly testName: string;       // from TestCase
  readonly browserName: string;    // e.g. "chromium"
  readonly status: RunStatus;      // "passed" | "failed" | "error"
  readonly startedAt: string;      // ISO 8601
  readonly finishedAt: string;     // ISO 8601
  readonly durationMs: number;
  readonly stepResults: readonly StepResult[];
  readonly failureScreenshotPath?: string;  // relative to project root, only on failure
  readonly stepSnapshots?: readonly StepSnapshot[]; // historical test step data captured at run time
}
```

### `RunStatus`

```typescript
type RunStatus = 'passed' | 'failed' | 'error';
```

| Status | Meaning |
|---|---|
| `passed` | All steps executed successfully. |
| `failed` | One or more steps failed (assertion failure, element not found, timeout). |
| `error` | The runner itself failed (browser launch failure, unhandled exception). No step results may be available. |

### `StepResult`

```typescript
interface StepResult {
  readonly stepId: string;         // from TestStep
  readonly stepIndex: number;      // 0-based position in steps array
  readonly type: StepType;         // from TestStep
  readonly label: string;          // from TestStep
  readonly status: StepStatus;     // "passed" | "failed" | "skipped" | "error"
  readonly startedAt: string;      // ISO 8601
  readonly finishedAt: string;     // ISO 8601
  readonly durationMs: number;
  readonly errorMessage?: string;  // present on failed/error
  readonly screenshotPath?: string;// relative to project root, present on failed
}
```

### `StepSnapshot`

```typescript
interface StepSnapshot {
  readonly stepId: string;         // from TestStep
  readonly type: StepType;         // from TestStep
  readonly label: string;          // from TestStep
  readonly target?: string;
  readonly value?: string;
  readonly timeoutMs?: number;
  readonly notes?: string;
}
```

MVP note:

- `RunResult` now stores `stepSnapshots` when available.
- Snapshot data is captured at run time and preserved even if the saved test case changes later.
- The Results UI prefers snapshot data for target/value/timeout details and falls back to the current test case only for older run results without snapshots.

### `StepStatus`

```typescript
type StepStatus = 'passed' | 'failed' | 'skipped' | 'error';
```

| Status | Meaning |
|---|---|
| `passed` | Step executed successfully. |
| `failed` | Step assertion or action failed (expected behavior). |
| `skipped` | Step was not executed because a previous step failed. |
| `error` | Unexpected error during step execution (e.g., browser crash). |

## 5. Pass/Fail Rules

1. A run is `passed` if and only if **all** steps have status `passed`.
2. A run is `failed` if **any** step has status `failed`.
3. A run is `error` if the runner cannot start (browser launch failure) or an unhandled exception occurs outside step execution.
4. Execution stops at the first `failed` or `error` step. Remaining steps are marked `skipped`.
5. A step with missing required fields (`target` for navigate/click/fill/assertText, `value` for fill/assertText) fails immediately with a validation error before any browser interaction.

## 6. Artifact Storage

### Run Result File

```
{projectPath}/results/run-{runId}.json
```

Example: `results/run_550e8400-e29b-41d4-a716-446655440000.json`

### Failure Screenshots

```
{projectPath}/artifacts/screenshots/run-{runId}/step-{stepIndex}-failure.png
```

Example: `artifacts/screenshots/run_abc123/step-2-failure.png`

- Screenshots are only captured on step failure.
- The `screenshotPath` in `StepResult` and `RunResult` is relative to the project root.
- The screenshot directory is created on demand.
- Renderer screenshot previews must be loaded through a validated main-process bridge. The renderer must not read arbitrary project files directly.
- MVP screenshot previews are limited to `.png` files that resolve inside `{projectPath}/artifacts/screenshots/`.

## 7. Runner Lifecycle

```
1. Validate input (testCase has steps, projectPath exists).
2. Create run ID and result directory.
3. Launch browser (Playwright).
4. Create new page.
5. For each step:
   a. Record startedAt.
   b. Execute step action.
   c. If success: record passed, continue.
   d. If failure:
      i. Capture screenshot.
      ii. Record failed with error message and screenshot path.
      iii. Mark remaining steps as skipped.
      iv. Break loop.
   e. If unexpected error:
      i. Capture screenshot if possible.
      ii. Record error.
      iii. Mark remaining steps as skipped.
      iv. Break loop.
6. Close browser.
7. Record finishedAt and durationMs.
8. Determine overall status.
9. Write RunResult to results/.
10. Return RunResult.
```

## 8. IPC Contract

The runner will be invoked from the renderer via a new IPC channel:

### Channel: `runner:run`

**Request:**
```typescript
interface RunTestRequest {
  readonly projectPath: string;
  readonly testId: string;
  readonly browserName?: string;  // default: "chromium"
}
```

**Response:**
```typescript
type RunTestActionResult =
  | { readonly ok: true; readonly result: RunResult }
  | { readonly ok: false; readonly error: string };
```

The main process handler will:
1. Validate `projectPath` is a non-empty string.
2. Validate `testId` is a non-empty string.
3. Load the test case from disk using `readTestCase`.
4. Execute the runner.
5. Return the result.

## 9. Known Risks Before Adding Playwright

| Risk | Severity | Mitigation |
|---|---|---|
| Playwright browser download may fail on Fedora | Medium | Document manual browser install steps; test on clean Fedora |
| `page.goto` may hang on slow/flaky sites | Medium | Default 30s timeout; step-level `timeoutMs` override |
| CSS selectors from manual editing may be wrong | High | Show clear error message with selector in step result |
| Browser process may not clean up on crash | Medium | Use `try/finally` for browser.close(); add process kill fallback |
| Screenshot capture may fail if page is closed | Low | Wrap screenshot in try/catch; record error without screenshot |
| Large screenshots may fill disk | Low | Not an MVP concern; add cleanup later |
| Playwright ARM64 browser bundles not available | High | Document as known limitation; test on x64 only for MVP |
| Concurrent runs not supported | Low | Document as MVP limitation; single-run only |
| `assertText` with Playwright's `toContainText` is substring match | Low | Document behavior; exact match can be added later |

## 10. Out of Scope for MVP Runner

- Retries and flaky test detection.
- Parallel or concurrent runs.
- Video recording.
- Trace viewer.
- Network log capture.
- Console log capture.
- Browser context reuse across tests.
- Authentication state management.
- Environment variables in steps.
- CI/CD integration.
- JUnit/HTML report export.
- Step reordering during run.
- Conditional steps or control flow.

## 11. Next Steps After This Document

1. Install Playwright (`npm install playwright`).
2. Add `RunResult`, `StepResult`, `RunStatus`, `StepStatus` types to `src/shared/project-schema.ts`.
3. Add `runner:run` IPC channel and handler.
4. Implement the runner in `src/automation/runner.ts`.
5. Add a "Run" button in the renderer UI.
6. Add unit tests for runner logic (mocking Playwright where practical).
7. Run baseline checks.
