import { describe, expect, it } from 'vitest';

import { renderRunHtmlReport } from '../src/shared/htmlReport';
import type { RunResult } from '../src/shared/project-schema';

const sampleRunResult: RunResult = {
  schemaVersion: 1,
  runId: 'run_html_report',
  testId: 'test_checkout',
  testName: 'Checkout flow',
  browserName: 'chromium',
  status: 'failed',
  startedAt: '2026-05-08T10:00:00.000Z',
  finishedAt: '2026-05-08T10:00:05.000Z',
  durationMs: 5000,
  failureScreenshotPath: 'artifacts/screenshots/run_html_report/step-1-failure.png',
  stepResults: [
    {
      stepId: 'step_1',
      stepIndex: 0,
      type: 'navigate',
      label: 'Open homepage',
      status: 'passed',
      startedAt: '2026-05-08T10:00:00.000Z',
      finishedAt: '2026-05-08T10:00:01.000Z',
      durationMs: 1000
    },
    {
      stepId: 'step_2',
      stepIndex: 1,
      type: 'assertText',
      label: 'Check confirmation text',
      status: 'failed',
      startedAt: '2026-05-08T10:00:01.000Z',
      finishedAt: '2026-05-08T10:00:05.000Z',
      durationMs: 4000,
      errorMessage: 'Expected text "Confirmed" not found.',
      screenshotPath: 'artifacts/screenshots/run_html_report/step-1-failure.png'
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
  ],
  consoleMessages: [
    {
      timestamp: '2026-05-08T10:00:02.000Z',
      type: 'warning',
      text: 'Slow network response.',
      relatedStepIndex: 1
    },
    {
      timestamp: '2026-05-08T10:00:03.000Z',
      type: 'error',
      text: 'Checkout widget crashed.',
      location: {
        url: 'https://example.com/app.js',
        lineNumber: 11,
        columnNumber: 3
      }
    }
  ],
  pageErrors: [
    {
      timestamp: '2026-05-08T10:00:03.500Z',
      message: 'Cannot read properties of undefined.',
      name: 'TypeError',
      stack: 'TypeError: Cannot read properties of undefined.\n    at app.js:24:2',
      relatedStepIndex: 1
    }
  ],
  networkFailures: [
    {
      timestamp: '2026-05-08T10:00:04.000Z',
      url: 'https://example.com/api/checkout',
      method: 'POST',
      resourceType: 'xhr',
      failureText: 'net::ERR_TIMED_OUT',
      relatedStepIndex: 1
    }
  ],
  httpErrors: [
    {
      timestamp: '2026-05-08T10:00:04.500Z',
      url: 'https://example.com/api/orders',
      method: 'GET',
      resourceType: 'fetch',
      status: 404,
      statusText: 'Not Found',
      relatedStepIndex: 1
    }
  ]
};

describe('HTML report rendering', () => {
  it('escapes user-controlled content before rendering it into HTML', () => {
    const reportHtml = renderRunHtmlReport(
      {
        ...sampleRunResult,
        testName: 'Checkout <script>alert("x")</script>',
        stepResults: sampleRunResult.stepResults.map((stepResult, index) =>
          index === 1
            ? {
                ...stepResult,
                label: 'Click <button>',
                errorMessage: 'Expected "<ok>" but got "<bad>".'
              }
            : stepResult
        ),
        consoleMessages: [
          {
            timestamp: '2026-05-08T10:00:02.000Z',
            type: 'error',
            text: '<img src=x onerror=alert(1)>'
          }
        ]
      },
      {
        generatedAt: '2026-05-08T12:30:00.000Z'
      }
    );

    expect(reportHtml).toContain('Checkout &lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
    expect(reportHtml).toContain('Click &lt;button&gt;');
    expect(reportHtml).toContain('Expected &quot;&lt;ok&gt;&quot; but got &quot;&lt;bad&gt;&quot;.');
    expect(reportHtml).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(reportHtml).not.toContain('<script>alert("x")</script>');
    expect(reportHtml).not.toContain('<img src=x onerror=alert(1)>');
  });

  it('includes the core run summary, failure details, and offline note', () => {
    const reportHtml = renderRunHtmlReport(sampleRunResult, {
      generatedAt: '2026-05-08T12:30:00.000Z'
    });

    expect(reportHtml).toContain('Website Testing Tool');
    expect(reportHtml).toContain('Checkout flow');
    expect(reportHtml).toContain('test_checkout');
    expect(reportHtml).toContain('run_html_report');
    expect(reportHtml).toContain('FAILED');
    expect(reportHtml).toContain('chromium');
    expect(reportHtml).toContain('2026-05-08T10:00:00.000Z');
    expect(reportHtml).toContain('2026-05-08T10:00:05.000Z');
    expect(reportHtml).toContain('2026-05-08T12:30:00.000Z');
    expect(reportHtml).toContain('Failure screenshot path');
    expect(reportHtml).toContain('artifacts/screenshots/run_html_report/step-1-failure.png');
    expect(reportHtml).toContain('Step results');
    expect(reportHtml).toContain('Step 2');
    expect(reportHtml).toContain(
      'This report is local and offline. Artifact paths stay project-relative'
    );
  });

  it('includes compact browser evidence counts and recent evidence sections', () => {
    const reportHtml = renderRunHtmlReport(sampleRunResult, {
      generatedAt: '2026-05-08T12:30:00.000Z'
    });

    expect(reportHtml).toContain('Console messages');
    expect(reportHtml).toContain('Warnings / errors');
    expect(reportHtml).toContain('Page errors');
    expect(reportHtml).toContain('Network failures');
    expect(reportHtml).toContain('HTTP errors');
    expect(reportHtml).toContain('Checkout widget crashed.');
    expect(reportHtml).toContain('Cannot read properties of undefined.');
    expect(reportHtml).toContain('net::ERR_TIMED_OUT');
    expect(reportHtml).toContain('Not Found');
    expect(reportHtml).toContain('https://example.com/api/checkout');
    expect(reportHtml).toContain('https://example.com/api/orders');
  });
});
