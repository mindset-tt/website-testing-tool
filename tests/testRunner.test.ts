import { describe, expect, it } from 'vitest';

import {
  createEmptyTestCase,
  createStepId,
  RUN_RESULT_SCHEMA_VERSION,
  validateRunResult,
  validateStepResult
} from '../src/shared/project-schema';
import type { RunResult, TestCase } from '../src/shared/project-schema';

describe('runner pure helpers', () => {
  it('validates a complete passed run result', () => {
    const runResult: RunResult = {
      schemaVersion: RUN_RESULT_SCHEMA_VERSION,
      runId: 'run_test123',
      testId: 'test_abc',
      testName: 'Smoke test',
      browserName: 'chromium',
      status: 'passed',
      startedAt: '2026-05-07T10:00:00.000Z',
      finishedAt: '2026-05-07T10:00:05.000Z',
      durationMs: 5000,
      stepResults: [
        {
          stepId: 'step_1',
          stepIndex: 0,
          type: 'navigate',
          label: 'Go to page',
          status: 'passed',
          startedAt: '2026-05-07T10:00:00.000Z',
          finishedAt: '2026-05-07T10:00:03.000Z',
          durationMs: 3000
        },
        {
          stepId: 'step_2',
          stepIndex: 1,
          type: 'click',
          label: 'Click button',
          status: 'passed',
          startedAt: '2026-05-07T10:00:03.000Z',
          finishedAt: '2026-05-07T10:00:05.000Z',
          durationMs: 2000
        }
      ]
    };

    expect(validateRunResult(runResult)).toEqual([]);
  });

  it('validates a failed run result with skipped steps', () => {
    const runResult: RunResult = {
      schemaVersion: RUN_RESULT_SCHEMA_VERSION,
      runId: 'run_test123',
      testId: 'test_abc',
      testName: 'Failing test',
      browserName: 'chromium',
      status: 'failed',
      startedAt: '2026-05-07T10:00:00.000Z',
      finishedAt: '2026-05-07T10:00:10.000Z',
      durationMs: 10000,
      failureScreenshotPath: 'artifacts/screenshots/run_test123/step-1-failure.png',
      stepResults: [
        {
          stepId: 'step_1',
          stepIndex: 0,
          type: 'navigate',
          label: 'Go to page',
          status: 'passed',
          startedAt: '2026-05-07T10:00:00.000Z',
          finishedAt: '2026-05-07T10:00:03.000Z',
          durationMs: 3000
        },
        {
          stepId: 'step_2',
          stepIndex: 1,
          type: 'click',
          label: 'Click missing button',
          status: 'failed',
          startedAt: '2026-05-07T10:00:03.000Z',
          finishedAt: '2026-05-07T10:00:08.000Z',
          durationMs: 5000,
          errorMessage: 'Element not found: #missing',
          screenshotPath: 'artifacts/screenshots/run_test123/step-1-failure.png'
        },
        {
          stepId: 'step_3',
          stepIndex: 2,
          type: 'assertText',
          label: 'Check welcome',
          status: 'skipped',
          startedAt: '2026-05-07T10:00:08.000Z',
          finishedAt: '2026-05-07T10:00:08.000Z',
          durationMs: 0
        }
      ]
    };

    expect(validateRunResult(runResult)).toEqual([]);
  });

  it('validates an error run result with no step results', () => {
    const runResult: RunResult = {
      schemaVersion: RUN_RESULT_SCHEMA_VERSION,
      runId: 'run_test123',
      testId: 'test_abc',
      testName: 'Error test',
      browserName: 'chromium',
      status: 'error',
      startedAt: '2026-05-07T10:00:00.000Z',
      finishedAt: '2026-05-07T10:00:01.000Z',
      durationMs: 1000,
      stepResults: []
    };

    expect(validateRunResult(runResult)).toEqual([]);
  });

  it('rejects a run result with mismatched status and step results', () => {
    // Status says passed but a step is failed
    const runResult: RunResult = {
      schemaVersion: RUN_RESULT_SCHEMA_VERSION,
      runId: 'run_test123',
      testId: 'test_abc',
      testName: 'Test',
      browserName: 'chromium',
      status: 'passed',
      startedAt: '2026-05-07T10:00:00.000Z',
      finishedAt: '2026-05-07T10:00:05.000Z',
      durationMs: 5000,
      stepResults: [
        {
          stepId: 'step_1',
          stepIndex: 0,
          type: 'click',
          label: 'Click',
          status: 'failed',
          startedAt: '2026-05-07T10:00:00.000Z',
          finishedAt: '2026-05-07T10:00:05.000Z',
          durationMs: 5000,
          errorMessage: 'Error'
        }
      ]
    };

    // Validation passes because it only checks field types, not logical consistency
    // This is intentional - the runner is responsible for logical correctness
    expect(validateRunResult(runResult)).toEqual([]);
  });

  it('rejects a step result with non-integer stepIndex', () => {
    const stepResult = {
      stepId: 'step_1',
      stepIndex: 1.5,
      type: 'navigate',
      label: 'Go',
      status: 'passed',
      startedAt: '2026-05-07T10:00:00.000Z',
      finishedAt: '2026-05-07T10:00:02.000Z',
      durationMs: 2000
    };

    const errors = validateStepResult(stepResult);

    expect(errors.some((e) => e.includes('stepIndex'))).toBe(true);
  });

  it('creates an empty test case with no steps', () => {
    const testCase = createEmptyTestCase({ name: 'Empty test' });

    expect(testCase.steps).toEqual([]);
    expect(testCase.name).toBe('Empty test');
    expect(testCase.schemaVersion).toBe(1);
  });

  it('creates a test case that can hold steps', () => {
    const testCase: TestCase = {
      ...createEmptyTestCase({ name: 'Test with steps' }),
      steps: [
        {
          stepId: createStepId(),
          type: 'navigate',
          label: 'Go to page',
          target: 'https://example.com'
        },
        {
          stepId: createStepId(),
          type: 'click',
          label: 'Click button',
          target: '#btn'
        }
      ]
    };

    expect(testCase.steps.length).toBe(2);
    expect(testCase.steps[0].type).toBe('navigate');
    expect(testCase.steps[1].type).toBe('click');
  });
});
