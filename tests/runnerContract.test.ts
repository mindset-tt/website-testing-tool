import { describe, expect, it } from 'vitest';

import {
  RUN_RESULT_SCHEMA_VERSION,
  validateBrowserConsoleMessage,
  validateHttpErrorRecord,
  validateNetworkFailureRecord,
  validatePageErrorRecord,
  validateRunResult,
  validateStepResult,
  validateStepSnapshot
} from '../src/shared/project-schema';
import type {
  BrowserConsoleMessage,
  HttpErrorRecord,
  NetworkFailureRecord,
  PageErrorRecord,
  RunResult,
  StepResult,
  StepSnapshot
} from '../src/shared/project-schema';

describe('validateStepResult', () => {
  it('accepts a valid passed step result', () => {
    const stepResult: StepResult = {
      stepId: 'step_abc',
      stepIndex: 0,
      type: 'navigate',
      label: 'Go to homepage',
      status: 'passed',
      startedAt: '2026-05-07T10:00:00.000Z',
      finishedAt: '2026-05-07T10:00:02.000Z',
      durationMs: 2000
    };

    expect(validateStepResult(stepResult)).toEqual([]);
  });

  it('accepts a valid failed step result with error and screenshot', () => {
    const stepResult: StepResult = {
      stepId: 'step_abc',
      stepIndex: 1,
      type: 'click',
      label: 'Click login',
      status: 'failed',
      startedAt: '2026-05-07T10:00:02.000Z',
      finishedAt: '2026-05-07T10:00:07.000Z',
      durationMs: 5000,
      errorMessage: 'Element not found: #login',
      screenshotPath: 'artifacts/screenshots/run_xyz/step-1-failure.png'
    };

    expect(validateStepResult(stepResult)).toEqual([]);
  });

  it('accepts a skipped step result', () => {
    const stepResult: StepResult = {
      stepId: 'step_abc',
      stepIndex: 2,
      type: 'fill',
      label: 'Enter email',
      status: 'skipped',
      startedAt: '2026-05-07T10:00:07.000Z',
      finishedAt: '2026-05-07T10:00:07.000Z',
      durationMs: 0
    };

    expect(validateStepResult(stepResult)).toEqual([]);
  });

  it('rejects a step result with invalid status', () => {
    const stepResult = {
      stepId: 'step_abc',
      stepIndex: 0,
      type: 'navigate',
      label: 'Go',
      status: 'unknown',
      startedAt: '2026-05-07T10:00:00.000Z',
      finishedAt: '2026-05-07T10:00:02.000Z',
      durationMs: 2000
    };

    const errors = validateStepResult(stepResult);

    expect(errors.some((e) => e.includes('status must be one of'))).toBe(true);
  });

  it('rejects a step result with negative stepIndex', () => {
    const stepResult: StepResult = {
      stepId: 'step_abc',
      stepIndex: -1,
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

  it('rejects a step result with negative durationMs', () => {
    const stepResult: StepResult = {
      stepId: 'step_abc',
      stepIndex: 0,
      type: 'navigate',
      label: 'Go',
      status: 'passed',
      startedAt: '2026-05-07T10:00:00.000Z',
      finishedAt: '2026-05-07T10:00:02.000Z',
      durationMs: -1
    };

    const errors = validateStepResult(stepResult);

    expect(errors.some((e) => e.includes('durationMs'))).toBe(true);
  });
});

describe('validateBrowserConsoleMessage', () => {
  it('accepts a browser console message with location and related step', () => {
    const message: BrowserConsoleMessage = {
      timestamp: '2026-05-07T10:00:02.000Z',
      type: 'warning',
      text: 'Slow network request detected.',
      location: {
        url: 'https://example.com/app.js',
        lineNumber: 14,
        columnNumber: 7
      },
      relatedStepIndex: 1
    };

    expect(validateBrowserConsoleMessage(message)).toEqual([]);
  });

  it('rejects a browser console message with invalid location fields', () => {
    const message = {
      timestamp: '2026-05-07T10:00:02.000Z',
      type: 'warning',
      text: 'Problem',
      location: {
        url: 123,
        lineNumber: -1
      }
    };

    const errors = validateBrowserConsoleMessage(message);

    expect(errors.some((e) => e.includes('location url'))).toBe(true);
    expect(errors.some((e) => e.includes('location lineNumber'))).toBe(true);
  });
});

describe('validatePageErrorRecord', () => {
  it('accepts a page error record with name, stack, and related step', () => {
    const pageError: PageErrorRecord = {
      timestamp: '2026-05-07T10:00:03.000Z',
      message: 'Cannot read properties of undefined.',
      name: 'TypeError',
      stack: 'TypeError: Cannot read properties of undefined.\n    at app.js:2:10',
      relatedStepIndex: 1
    };

    expect(validatePageErrorRecord(pageError)).toEqual([]);
  });

  it('rejects a page error record with invalid relatedStepIndex', () => {
    const pageError = {
      timestamp: '2026-05-07T10:00:03.000Z',
      message: 'Boom',
      relatedStepIndex: -1
    };

    const errors = validatePageErrorRecord(pageError);

    expect(errors.some((e) => e.includes('relatedStepIndex'))).toBe(true);
  });
});

describe('validateNetworkFailureRecord', () => {
  it('accepts a network failure record with optional fields', () => {
    const networkFailure: NetworkFailureRecord = {
      timestamp: '2026-05-07T10:00:05.000Z',
      url: 'https://example.com/api/checkout',
      method: 'POST',
      resourceType: 'xhr',
      failureText: 'net::ERR_TIMED_OUT',
      status: 503,
      relatedStepIndex: 1
    };

    expect(validateNetworkFailureRecord(networkFailure)).toEqual([]);
  });

  it('rejects a network failure record with invalid status', () => {
    const networkFailure = {
      timestamp: '2026-05-07T10:00:05.000Z',
      url: 'https://example.com/api/checkout',
      status: 99
    };

    const errors = validateNetworkFailureRecord(networkFailure);

    expect(errors.some((e) => e.includes('status'))).toBe(true);
  });
});

describe('validateHttpErrorRecord', () => {
  it('accepts an HTTP error record with optional fields', () => {
    const httpError: HttpErrorRecord = {
      timestamp: '2026-05-07T10:00:06.000Z',
      url: 'https://example.com/api/orders',
      method: 'GET',
      resourceType: 'fetch',
      status: 404,
      statusText: 'Not Found',
      relatedStepIndex: 1
    };

    expect(validateHttpErrorRecord(httpError)).toEqual([]);
  });

  it('rejects an HTTP error record with a non-error status', () => {
    const httpError = {
      timestamp: '2026-05-07T10:00:06.000Z',
      url: 'https://example.com/api/orders',
      status: 200
    };

    const errors = validateHttpErrorRecord(httpError);

    expect(errors.some((e) => e.includes('status'))).toBe(true);
  });
});

describe('validateRunResult', () => {
  it('accepts a valid passed run result', () => {
    const runResult: RunResult = {
      schemaVersion: RUN_RESULT_SCHEMA_VERSION,
      runId: 'run_abc',
      testId: 'test_xyz',
      testName: 'Smoke test',
      browserName: 'chromium',
      status: 'passed',
      startedAt: '2026-05-07T10:00:00.000Z',
      finishedAt: '2026-05-07T10:00:10.000Z',
      durationMs: 10000,
      stepResults: [
        {
          stepId: 'step_1',
          stepIndex: 0,
          type: 'navigate',
          label: 'Go to homepage',
          status: 'passed',
          startedAt: '2026-05-07T10:00:00.000Z',
          finishedAt: '2026-05-07T10:00:05.000Z',
          durationMs: 5000
        }
      ]
    };

    expect(validateRunResult(runResult)).toEqual([]);
  });

  it('accepts a valid failed run result with screenshot', () => {
    const runResult: RunResult = {
      schemaVersion: RUN_RESULT_SCHEMA_VERSION,
      runId: 'run_abc',
      testId: 'test_xyz',
      testName: 'Smoke test',
      browserName: 'chromium',
      status: 'failed',
      startedAt: '2026-05-07T10:00:00.000Z',
      finishedAt: '2026-05-07T10:00:10.000Z',
      durationMs: 10000,
      failureScreenshotPath: 'artifacts/screenshots/run_abc/step-0-failure.png',
      stepResults: [
        {
          stepId: 'step_1',
          stepIndex: 0,
          type: 'click',
          label: 'Click missing button',
          status: 'failed',
          startedAt: '2026-05-07T10:00:05.000Z',
          finishedAt: '2026-05-07T10:00:10.000Z',
          durationMs: 5000,
          errorMessage: 'Element not found',
          screenshotPath: 'artifacts/screenshots/run_abc/step-0-failure.png'
        }
      ]
    };

    expect(validateRunResult(runResult)).toEqual([]);
  });

  it('accepts a run result with optional browser evidence arrays', () => {
    const runResult: RunResult = {
      schemaVersion: RUN_RESULT_SCHEMA_VERSION,
      runId: 'run_browser_evidence',
      testId: 'test_xyz',
      testName: 'Smoke test',
      browserName: 'chromium',
      status: 'failed',
      startedAt: '2026-05-07T10:00:00.000Z',
      finishedAt: '2026-05-07T10:00:10.000Z',
      durationMs: 10000,
      stepResults: [],
      consoleMessages: [
        {
          timestamp: '2026-05-07T10:00:03.000Z',
          type: 'error',
          text: 'Failed to load resource.',
          location: {
            url: 'https://example.com/app.js',
            lineNumber: 1,
            columnNumber: 2
          },
          relatedStepIndex: 0
        }
      ],
      pageErrors: [
        {
          timestamp: '2026-05-07T10:00:04.000Z',
          message: 'Unhandled TypeError',
          name: 'TypeError',
          stack: 'TypeError: Unhandled TypeError\n    at app.js:10:2',
          relatedStepIndex: 0
        }
      ],
      networkFailures: [
        {
          timestamp: '2026-05-07T10:00:05.000Z',
          url: 'https://example.com/api/checkout',
          method: 'POST',
          resourceType: 'xhr',
          failureText: 'net::ERR_TIMED_OUT',
          relatedStepIndex: 0
        }
      ],
      httpErrors: [
        {
          timestamp: '2026-05-07T10:00:06.000Z',
          url: 'https://example.com/api/orders',
          method: 'GET',
          resourceType: 'fetch',
          status: 404,
          statusText: 'Not Found',
          relatedStepIndex: 0
        }
      ]
    };

    expect(validateRunResult(runResult)).toEqual([]);
  });

  it('rejects a run result with wrong schema version', () => {
    const runResult = {
      schemaVersion: 99,
      runId: 'run_abc',
      testId: 'test_xyz',
      testName: 'Test',
      browserName: 'chromium',
      status: 'passed',
      startedAt: '2026-05-07T10:00:00.000Z',
      finishedAt: '2026-05-07T10:00:10.000Z',
      durationMs: 10000,
      stepResults: []
    };

    const errors = validateRunResult(runResult);

    expect(errors.some((e) => e.includes('schemaVersion'))).toBe(true);
  });

  it('rejects a run result with invalid status', () => {
    const runResult = {
      schemaVersion: RUN_RESULT_SCHEMA_VERSION,
      runId: 'run_abc',
      testId: 'test_xyz',
      testName: 'Test',
      browserName: 'chromium',
      status: 'unknown',
      startedAt: '2026-05-07T10:00:00.000Z',
      finishedAt: '2026-05-07T10:00:10.000Z',
      durationMs: 10000,
      stepResults: []
    };

    const errors = validateRunResult(runResult);

    expect(errors.some((e) => e.includes('status must be one of'))).toBe(true);
  });

  it('rejects a run result with missing testName', () => {
    const runResult = {
      schemaVersion: RUN_RESULT_SCHEMA_VERSION,
      runId: 'run_abc',
      testId: 'test_xyz',
      testName: '',
      browserName: 'chromium',
      status: 'passed',
      startedAt: '2026-05-07T10:00:00.000Z',
      finishedAt: '2026-05-07T10:00:10.000Z',
      durationMs: 10000,
      stepResults: []
    };

    const errors = validateRunResult(runResult);

    expect(errors.some((e) => e.includes('testName'))).toBe(true);
  });

  it('rejects invalid browser evidence entries', () => {
    const runResult = {
      schemaVersion: RUN_RESULT_SCHEMA_VERSION,
      runId: 'run_abc',
      testId: 'test_xyz',
      testName: 'Test',
      browserName: 'chromium',
      status: 'failed',
      startedAt: '2026-05-07T10:00:00.000Z',
      finishedAt: '2026-05-07T10:00:10.000Z',
      durationMs: 10000,
      stepResults: [],
      consoleMessages: [
        {
          timestamp: '',
          type: '',
          text: ''
        }
      ],
      pageErrors: [
        {
          timestamp: '',
          message: ''
        }
      ],
      networkFailures: [
        {
          timestamp: '',
          url: ''
        }
      ],
      httpErrors: [
        {
          timestamp: '',
          url: '',
          status: 200
        }
      ]
    };

    const errors = validateRunResult(runResult);

    expect(errors.some((e) => e.includes('Console message 1'))).toBe(true);
    expect(errors.some((e) => e.includes('Page error 1'))).toBe(true);
    expect(errors.some((e) => e.includes('Network failure 1'))).toBe(true);
    expect(errors.some((e) => e.includes('HTTP error 1'))).toBe(true);
  });
});

describe('validateStepSnapshot', () => {
  it('accepts a valid step snapshot with all fields', () => {
    const snapshot: StepSnapshot = {
      stepId: 'step_abc',
      type: 'click',
      label: 'Click login',
      target: '#login',
      value: 'submit',
      timeoutMs: 5000,
      notes: 'Main login button'
    };

    expect(validateStepSnapshot(snapshot)).toEqual([]);
  });

  it('accepts a valid step snapshot with only required fields', () => {
    const snapshot: StepSnapshot = {
      stepId: 'step_abc',
      type: 'navigate',
      label: 'Go to homepage'
    };

    expect(validateStepSnapshot(snapshot)).toEqual([]);
  });

  it('rejects a step snapshot with invalid type', () => {
    const snapshot = {
      stepId: 'step_abc',
      type: 'invalid',
      label: 'Bad step'
    };

    const errors = validateStepSnapshot(snapshot);

    expect(errors.some((e) => e.includes('type must be one of'))).toBe(true);
  });

  it('rejects a step snapshot with missing label', () => {
    const snapshot = {
      stepId: 'step_abc',
      type: 'navigate',
      label: ''
    };

    const errors = validateStepSnapshot(snapshot);

    expect(errors.some((e) => e.includes('label'))).toBe(true);
  });

  it('rejects a step snapshot with negative timeoutMs', () => {
    const snapshot = {
      stepId: 'step_abc',
      type: 'navigate',
      label: 'Go',
      timeoutMs: -1
    };

    const errors = validateStepSnapshot(snapshot);

    expect(errors.some((e) => e.includes('timeoutMs'))).toBe(true);
  });
});

describe('validateRunResult with stepSnapshots', () => {
  it('accepts a run result with valid stepSnapshots', () => {
    const runResult: RunResult = {
      schemaVersion: RUN_RESULT_SCHEMA_VERSION,
      runId: 'run_abc',
      testId: 'test_xyz',
      testName: 'Smoke test',
      browserName: 'chromium',
      status: 'failed',
      startedAt: '2026-05-07T10:00:00.000Z',
      finishedAt: '2026-05-07T10:00:10.000Z',
      durationMs: 10000,
      stepResults: [
        {
          stepId: 'step_1',
          stepIndex: 0,
          type: 'click',
          label: 'Click missing button',
          status: 'failed',
          startedAt: '2026-05-07T10:00:05.000Z',
          finishedAt: '2026-05-07T10:00:10.000Z',
          durationMs: 5000,
          errorMessage: 'Element not found'
        }
      ],
      stepSnapshots: [
        {
          stepId: 'step_1',
          type: 'click',
          label: 'Click missing button',
          target: '#missing',
          timeoutMs: 5000
        }
      ]
    };

    expect(validateRunResult(runResult)).toEqual([]);
  });

  it('accepts a run result without stepSnapshots (old result file)', () => {
    const runResult: RunResult = {
      schemaVersion: RUN_RESULT_SCHEMA_VERSION,
      runId: 'run_abc',
      testId: 'test_xyz',
      testName: 'Smoke test',
      browserName: 'chromium',
      status: 'passed',
      startedAt: '2026-05-07T10:00:00.000Z',
      finishedAt: '2026-05-07T10:00:10.000Z',
      durationMs: 10000,
      stepResults: [
        {
          stepId: 'step_1',
          stepIndex: 0,
          type: 'navigate',
          label: 'Go to homepage',
          status: 'passed',
          startedAt: '2026-05-07T10:00:00.000Z',
          finishedAt: '2026-05-07T10:00:05.000Z',
          durationMs: 5000
        }
      ]
    };

    expect(validateRunResult(runResult)).toEqual([]);
  });

  it('rejects a run result with invalid stepSnapshots', () => {
    const runResult = {
      schemaVersion: RUN_RESULT_SCHEMA_VERSION,
      runId: 'run_abc',
      testId: 'test_xyz',
      testName: 'Test',
      browserName: 'chromium',
      status: 'passed',
      startedAt: '2026-05-07T10:00:00.000Z',
      finishedAt: '2026-05-07T10:00:10.000Z',
      durationMs: 10000,
      stepResults: [],
      stepSnapshots: [
        {
          stepId: 'step_1',
          type: 'invalid',
          label: ''
        }
      ]
    };

    const errors = validateRunResult(runResult);

    expect(errors.some((e) => e.includes('Step snapshot'))).toBe(true);
  });
});
