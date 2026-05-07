import { describe, expect, it } from 'vitest';

import type { RunResult, TestStep } from '../src/shared/project-schema';
import {
  buildFailureSummary,
  getFailureScreenshotPath,
  getPrimaryFailureStep,
  getStepDefinitionForResult,
  getStepSnapshotForResult
} from '../src/shared/resultDiagnostics';

const sampleRunResult: RunResult = {
  schemaVersion: 1,
  runId: 'run_123',
  testId: 'test_checkout',
  testName: 'Checkout flow',
  browserName: 'chromium',
  status: 'failed',
  startedAt: '2026-05-07T10:00:00.000Z',
  finishedAt: '2026-05-07T10:00:05.000Z',
  durationMs: 5000,
  failureScreenshotPath: 'artifacts/screenshots/run_123/step-1-failure.png',
  stepResults: [
    {
      stepId: 'step_1',
      stepIndex: 0,
      type: 'navigate',
      label: 'Open homepage',
      status: 'passed',
      startedAt: '2026-05-07T10:00:00.000Z',
      finishedAt: '2026-05-07T10:00:01.000Z',
      durationMs: 1000
    },
    {
      stepId: 'step_2',
      stepIndex: 1,
      type: 'assertText',
      label: 'Check confirmation text',
      status: 'failed',
      startedAt: '2026-05-07T10:00:01.000Z',
      finishedAt: '2026-05-07T10:00:05.000Z',
      durationMs: 4000,
      errorMessage: 'Expected text "Confirmed" not found in element "[data-testid=\\"status\\"]".',
      screenshotPath: 'artifacts/screenshots/run_123/step-1-failure.png'
    }
  ]
};

const sampleSteps: readonly TestStep[] = [
  {
    stepId: 'step_1',
    type: 'navigate',
    label: 'Open homepage',
    target: 'https://example.com'
  },
  {
    stepId: 'step_2',
    type: 'assertText',
    label: 'Check confirmation text',
    target: '[data-testid="status"]',
    value: 'Confirmed',
    timeoutMs: 5000
  }
];

describe('result diagnostics helpers', () => {
  it('finds the first failed or error step result', () => {
    expect(getPrimaryFailureStep(sampleRunResult)?.stepId).toBe('step_2');
  });

  it('matches a step definition by step ID and falls back to step index', () => {
    const matchedStep = getStepDefinitionForResult(getPrimaryFailureStep(sampleRunResult), sampleSteps);

    expect(matchedStep?.target).toBe('[data-testid="status"]');
  });

  it('prefers the failed step screenshot path when present', () => {
    expect(getFailureScreenshotPath(sampleRunResult)).toBe('artifacts/screenshots/run_123/step-1-failure.png');
  });

  it('builds a readable failure summary with step context', () => {
    const summary = buildFailureSummary(sampleRunResult, {
      stepResult: getPrimaryFailureStep(sampleRunResult),
      testStep: sampleSteps[1]
    });

    expect(summary).toContain('What failed');
    expect(summary).toContain('Test: Checkout flow (test_checkout)');
    expect(summary).toContain('Status: FAILED');
    expect(summary).toContain('Step: Step 2');
    expect(summary).toContain('Label: Check confirmation text');
    expect(summary).toContain('Type: assertText');
    expect(summary).toContain('Target: [data-testid="status"]');
    expect(summary).toContain('Expected value: Confirmed');
    expect(summary).toContain('Timeout: 5000ms');
    expect(summary).toContain('Error: Expected text "Confirmed" not found');
    expect(summary).toContain('Screenshot: artifacts/screenshots/run_123/step-1-failure.png');
  });

  it('builds a safe error summary when no failed step details were recorded', () => {
    const summary = buildFailureSummary({
      ...sampleRunResult,
      status: 'error',
      failureScreenshotPath: undefined,
      stepResults: []
    });

    expect(summary).toContain('Step: Not recorded');
    expect(summary).toContain('Label: Not recorded');
    expect(summary).toContain('Type: Not recorded');
    expect(summary).toContain('Error: No detailed error message was recorded for this run.');
    expect(summary).not.toContain('Screenshot:');
  });
});

describe('step snapshot diagnostics', () => {
  const runResultWithSnapshots: RunResult = {
    schemaVersion: 1,
    runId: 'run_snap',
    testId: 'test_checkout',
    testName: 'Checkout flow',
    browserName: 'chromium',
    status: 'failed',
    startedAt: '2026-05-07T10:00:00.000Z',
    finishedAt: '2026-05-07T10:00:05.000Z',
    durationMs: 5000,
    stepResults: [
      {
        stepId: 'step_1',
        stepIndex: 0,
        type: 'navigate',
        label: 'Open homepage',
        status: 'passed',
        startedAt: '2026-05-07T10:00:00.000Z',
        finishedAt: '2026-05-07T10:00:01.000Z',
        durationMs: 1000
      },
      {
        stepId: 'step_2',
        stepIndex: 1,
        type: 'assertText',
        label: 'Check confirmation text',
        status: 'failed',
        startedAt: '2026-05-07T10:00:01.000Z',
        finishedAt: '2026-05-07T10:00:05.000Z',
        durationMs: 4000,
        errorMessage: 'Expected text "Confirmed" not found.',
        screenshotPath: 'artifacts/screenshots/run_snap/step-1-failure.png'
      }
    ],
    stepSnapshots: [
      {
        stepId: 'step_1',
        type: 'navigate',
        label: 'Open homepage',
        target: 'https://example.com'
      },
      {
        stepId: 'step_2',
        type: 'assertText',
        label: 'Check confirmation text',
        target: '[data-testid="status"]',
        value: 'Confirmed',
        timeoutMs: 5000
      }
    ]
  };

  it('returns snapshot for a failed step result when snapshots exist', () => {
    const failureStep = getPrimaryFailureStep(runResultWithSnapshots);
    const snapshot = getStepSnapshotForResult(failureStep, runResultWithSnapshots);

    expect(snapshot).not.toBeNull();
    expect(snapshot?.target).toBe('[data-testid="status"]');
    expect(snapshot?.value).toBe('Confirmed');
    expect(snapshot?.timeoutMs).toBe(5000);
  });

  it('returns null when snapshots are absent (old result file)', () => {
    const failureStep = getPrimaryFailureStep(sampleRunResult);
    const snapshot = getStepSnapshotForResult(failureStep, sampleRunResult);

    expect(snapshot).toBeNull();
  });

  it('returns null when stepResult is null', () => {
    const snapshot = getStepSnapshotForResult(null, runResultWithSnapshots);

    expect(snapshot).toBeNull();
  });

  it('failure summary uses snapshot data when available', () => {
    const summary = buildFailureSummary(runResultWithSnapshots, {
      stepResult: getPrimaryFailureStep(runResultWithSnapshots),
      // Pass stale test step data to prove snapshot is preferred
      testStep: {
        stepId: 'step_2',
        type: 'assertText',
        label: 'EDITED label',
        target: '[data-testid="edited"]',
        value: 'EDITED',
        timeoutMs: 9999
      }
    });

    // Should use snapshot data, not the stale testStep
    expect(summary).toContain('Target: [data-testid="status"]');
    expect(summary).toContain('Expected value: Confirmed');
    expect(summary).toContain('Timeout: 5000ms');
    // Should NOT contain the edited values
    expect(summary).not.toContain('[data-testid="edited"]');
    expect(summary).not.toContain('EDITED');
    expect(summary).not.toContain('9999ms');
  });

  it('failure summary falls back to testStep when snapshots are absent', () => {
    const summary = buildFailureSummary(sampleRunResult, {
      stepResult: getPrimaryFailureStep(sampleRunResult),
      testStep: sampleSteps[1]
    });

    // Should use testStep data (fallback for old results)
    expect(summary).toContain('Target: [data-testid="status"]');
    expect(summary).toContain('Expected value: Confirmed');
    expect(summary).toContain('Timeout: 5000ms');
  });

  it('failure summary shows "unavailable" when neither snapshot nor testStep exists', () => {
    const summary = buildFailureSummary(sampleRunResult, {
      stepResult: getPrimaryFailureStep(sampleRunResult),
      testStep: null
    });

    expect(summary).toContain('Saved step context: unavailable');
  });
});
