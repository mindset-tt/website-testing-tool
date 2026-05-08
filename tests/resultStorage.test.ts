import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { describe, expect, it } from 'vitest';

import type { RunResult } from '../src/shared/project-schema';
import {
  exportRunHtmlReport,
  exportRunJunitReport,
  readFailureScreenshot,
  resolveExportedReportPath,
  resolveFailureScreenshotPath,
  resolveRunHtmlReportPath,
  resolveRunJunitReportPath
} from '../src/storage/resultStorage';
import {
  escapeXmlAttribute,
  escapeXmlText,
  renderRunJunitReport
} from '../src/shared/junitReport';

async function createTempProjectDir(): Promise<string> {
  const projectPath = join(tmpdir(), `wtt-results-${randomUUID()}`);

  await mkdir(join(projectPath, 'artifacts', 'screenshots', 'run-1'), { recursive: true });
  await mkdir(join(projectPath, 'artifacts', 'videos'), { recursive: true });
  await mkdir(join(projectPath, 'results'), { recursive: true });

  return projectPath;
}

function createSampleRunResult(runId = 'run_html_export'): RunResult {
  return {
    schemaVersion: 1,
    runId,
    testId: 'test_checkout',
    testName: 'Checkout flow',
    browserName: 'chromium',
    status: 'failed',
    startedAt: '2026-05-08T10:00:00.000Z',
    finishedAt: '2026-05-08T10:00:05.000Z',
    durationMs: 5000,
    failureScreenshotPath: 'artifacts/screenshots/run_html_export/step-1-failure.png',
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
        errorMessage: 'Expected text "Confirmed" not found.'
      }
    ],
    consoleMessages: [
      {
        timestamp: '2026-05-08T10:00:03.000Z',
        type: 'error',
        text: 'Checkout widget crashed.'
      }
    ]
  };
}

describe('result storage screenshot preview guards', () => {
  it('accepts a valid relative failure screenshot path inside artifacts/screenshots', async () => {
    const projectPath = await createTempProjectDir();
    const screenshotPath = join('artifacts', 'screenshots', 'run-1', 'step-0-failure.png');

    const resolvedPath = resolveFailureScreenshotPath(projectPath, screenshotPath);

    expect(resolvedPath).toBe(join(projectPath, 'artifacts', 'screenshots', 'run-1', 'step-0-failure.png'));
  });

  it('rejects traversal outside the screenshots directory', async () => {
    const projectPath = await createTempProjectDir();

    expect(() =>
      resolveFailureScreenshotPath(projectPath, join('artifacts', 'screenshots', '..', 'videos', 'clip.png'))
    ).toThrow('Failure screenshot path must stay inside the project artifacts folder.');
  });

  it('rejects paths outside artifacts/screenshots even when they stay inside the project', async () => {
    const projectPath = await createTempProjectDir();

    expect(() =>
      resolveFailureScreenshotPath(projectPath, join('artifacts', 'videos', 'clip.png'))
    ).toThrow('Failure screenshot path must stay inside the project artifacts folder.');
  });

  it('rejects non-PNG screenshot extensions', async () => {
    const projectPath = await createTempProjectDir();

    expect(() =>
      resolveFailureScreenshotPath(projectPath, join('artifacts', 'screenshots', 'run-1', 'step-0-failure.jpg'))
    ).toThrow('Only PNG failure screenshots can be previewed.');
  });

  it('returns a PNG data URL for a valid failure screenshot file', async () => {
    const projectPath = await createTempProjectDir();
    const screenshotPath = join('artifacts', 'screenshots', 'run-1', 'step-0-failure.png');

    await writeFile(join(projectPath, screenshotPath), Buffer.from('fake-png-bits'));

    const dataUrl = await readFailureScreenshot(projectPath, screenshotPath);

    expect(dataUrl).toBe(`data:image/png;base64,${Buffer.from('fake-png-bits').toString('base64')}`);
  });
});

describe('result storage HTML export', () => {
  it('writes a report HTML file inside the project reports directory', async () => {
    const projectPath = await createTempProjectDir();
    const runResult = createSampleRunResult();
    const runResultPath = join(projectPath, 'results', `run-${runResult.runId}.json`);

    await writeFile(runResultPath, JSON.stringify(runResult, null, 2), 'utf8');

    const exported = await exportRunHtmlReport(projectPath, runResult.runId);
    const htmlPath = join(projectPath, exported.reportPath);
    const htmlContents = await readFile(htmlPath, 'utf8');

    expect(exported.reportPath).toBe(join('reports', `report-${runResult.runId}.html`));
    expect(htmlContents).toContain('Website Testing Tool');
    expect(htmlContents).toContain(runResult.runId);
    expect(htmlContents).toContain('Checkout widget crashed.');
  });

  it('resolves a valid report path inside the project reports directory', async () => {
    const projectPath = await createTempProjectDir();

    const resolvedPath = resolveRunHtmlReportPath(projectPath, 'run_safe_export');

    expect(resolvedPath).toBe(join(projectPath, 'reports', 'report-run_safe_export.html'));
  });

  it('validates a safe exported report path', async () => {
    const projectPath = await createTempProjectDir();
    const resolvedPath = resolveExportedReportPath(projectPath, join('reports', 'report-run_safe_export.html'));

    expect(resolvedPath).toBe(join(projectPath, 'reports', 'report-run_safe_export.html'));
  });

  it('rejects traversal attempts in exported report paths', async () => {
    const projectPath = await createTempProjectDir();

    expect(() =>
      resolveExportedReportPath(projectPath, join('reports', '..', 'results', 'run-run_safe_export.html'))
    ).toThrow('HTML report path must stay inside the project reports folder.');
  });

  it('rejects absolute exported report paths', async () => {
    const projectPath = await createTempProjectDir();
    const absolutePath = process.platform === 'win32'
      ? 'C:\\reports\\report-run_safe_export.html'
      : '/tmp/reports/report-run_safe_export.html';

    expect(() => resolveExportedReportPath(projectPath, absolutePath)).toThrow(
      'HTML report path must stay inside the project reports folder.'
    );
  });

  it('rejects exported report paths with the wrong extension', async () => {
    const projectPath = await createTempProjectDir();

    expect(() =>
      resolveExportedReportPath(projectPath, join('reports', 'report-run_safe_export.txt'))
    ).toThrow('Only HTML report files can be opened.');
  });

  it('rejects exported report paths that do not use the canonical report filename pattern', async () => {
    const projectPath = await createTempProjectDir();

    expect(() =>
      resolveExportedReportPath(projectPath, join('reports', 'other-run_safe_export.html'))
    ).toThrow('HTML report filename is invalid.');
  });

  it('rejects invalid run IDs before exporting a report', async () => {
    const projectPath = await createTempProjectDir();

    await expect(exportRunHtmlReport(projectPath, '../bad-run')).rejects.toThrow('Run ID is invalid.');
  });
});

describe('JUnit XML escaping', () => {
  it('escapes &, <, > in text nodes', () => {
    const input = 'a < b & c > d';
    const escaped = escapeXmlText(input);

    expect(escaped).toBe('a &lt; b &amp; c &gt; d');
  });

  it('escapes carriage returns in text nodes', () => {
    const input = 'line1\rline2';
    const escaped = escapeXmlText(input);

    expect(escaped).toBe('line1&#xD;line2');
  });

  it('escapes quotes and apostrophes in attribute values', () => {
    const input = 'he said "hello" and it\'s fine';
    const escaped = escapeXmlAttribute(input);

    expect(escaped).toBe('he said &quot;hello&quot; and it&apos;s fine');
  });

  it('escapes newlines in attribute values', () => {
    const input = 'line1\nline2';
    const escaped = escapeXmlAttribute(input);

    expect(escaped).toBe('line1&#xA;line2');
  });

  it('returns empty string for non-string input', () => {
    expect(escapeXmlText(undefined as unknown as string)).toBe('');
    expect(escapeXmlAttribute(null as unknown as string)).toBe('');
  });
});

describe('JUnit report rendering', () => {
  function createJunitRunResult(overrides: Partial<RunResult> = {}): RunResult {
    return {
      schemaVersion: 1,
      runId: 'run_junit_test',
      testId: 'test_login',
      testName: 'Login flow',
      browserName: 'chromium',
      status: 'passed',
      startedAt: '2026-05-08T10:00:00.000Z',
      finishedAt: '2026-05-08T10:00:03.000Z',
      durationMs: 3000,
      stepResults: [
        {
          stepId: 'step_1',
          stepIndex: 0,
          type: 'navigate',
          label: 'Open login page',
          status: 'passed',
          startedAt: '2026-05-08T10:00:00.000Z',
          finishedAt: '2026-05-08T10:00:01.000Z',
          durationMs: 1000
        },
        {
          stepId: 'step_2',
          stepIndex: 1,
          type: 'fill',
          label: 'Enter username',
          status: 'passed',
          startedAt: '2026-05-08T10:00:01.000Z',
          finishedAt: '2026-05-08T10:00:02.000Z',
          durationMs: 1000
        },
        {
          stepId: 'step_3',
          stepIndex: 2,
          type: 'click',
          label: 'Click submit',
          status: 'passed',
          startedAt: '2026-05-08T10:00:02.000Z',
          finishedAt: '2026-05-08T10:00:03.000Z',
          durationMs: 1000
        }
      ],
      ...overrides
    };
  }

  it('renders a testsuite with correct attributes for all-passed run', () => {
    const runResult = createJunitRunResult();
    const xml = renderRunJunitReport(runResult);

    expect(xml).toContain('<testsuite');
    expect(xml).toContain('name="Login flow"');
    expect(xml).toContain('tests="3"');
    expect(xml).toContain('failures="0"');
    expect(xml).toContain('errors="0"');
    expect(xml).toContain('skipped="0"');
    expect(xml).toContain('time="3.000"');
    expect(xml).toContain('hostname="local"');
  });

  it('renders testcase elements for each step', () => {
    const runResult = createJunitRunResult();
    const xml = renderRunJunitReport(runResult);

    expect(xml).toContain('classname="Login flow.navigate"');
    expect(xml).toContain('name="Open login page [step 1]"');
    expect(xml).toContain('classname="Login flow.fill"');
    expect(xml).toContain('name="Enter username [step 2]"');
    expect(xml).toContain('classname="Login flow.click"');
    expect(xml).toContain('name="Click submit [step 3]"');
  });

  it('renders failure element for failed steps', () => {
    const runResult = createJunitRunResult({
      status: 'failed',
      stepResults: [
        {
          stepId: 'step_1',
          stepIndex: 0,
          type: 'assertText',
          label: 'Check welcome text',
          status: 'failed',
          startedAt: '2026-05-08T10:00:00.000Z',
          finishedAt: '2026-05-08T10:00:01.000Z',
          durationMs: 1000,
          errorMessage: 'Expected "Welcome" but found "Error"'
        }
      ]
    });
    const xml = renderRunJunitReport(runResult);

    expect(xml).toContain('failures="1"');
    expect(xml).toContain('<failure type="AssertionError"');
    expect(xml).toContain('Expected &quot;Welcome&quot; but found &quot;Error&quot;');
  });

  it('renders error element for error steps', () => {
    const runResult = createJunitRunResult({
      status: 'error',
      stepResults: [
        {
          stepId: 'step_1',
          stepIndex: 0,
          type: 'navigate',
          label: 'Open page',
          status: 'error',
          startedAt: '2026-05-08T10:00:00.000Z',
          finishedAt: '2026-05-08T10:00:01.000Z',
          durationMs: 1000,
          errorMessage: 'net::ERR_CONNECTION_REFUSED'
        }
      ]
    });
    const xml = renderRunJunitReport(runResult);

    expect(xml).toContain('errors="1"');
    expect(xml).toContain('<error type="RuntimeError"');
    expect(xml).toContain('net::ERR_CONNECTION_REFUSED');
  });

  it('renders skipped element for skipped steps', () => {
    const runResult = createJunitRunResult({
      stepResults: [
        {
          stepId: 'step_1',
          stepIndex: 0,
          type: 'navigate',
          label: 'Open page',
          status: 'skipped',
          startedAt: '2026-05-08T10:00:00.000Z',
          finishedAt: '2026-05-08T10:00:00.000Z',
          durationMs: 0
        }
      ]
    });
    const xml = renderRunJunitReport(runResult);

    expect(xml).toContain('<skipped/>');
  });

  it('includes system-out with run metadata', () => {
    const runResult = createJunitRunResult();
    const xml = renderRunJunitReport(runResult);

    expect(xml).toContain('<system-out>');
    expect(xml).toContain('Run ID: run_junit_test');
    expect(xml).toContain('Test ID: test_login');
    expect(xml).toContain('Browser: chromium');
    expect(xml).toContain('Status: PASSED');
    expect(xml).toContain('Duration: 3000ms');
  });

  it('includes browser evidence counts in system-out', () => {
    const runResult = createJunitRunResult({
      consoleMessages: [
        { timestamp: '2026-05-08T10:00:01.000Z', type: 'error', text: 'JS error' },
        { timestamp: '2026-05-08T10:00:02.000Z', type: 'warning', text: 'Deprecated API' }
      ],
      pageErrors: [
        { timestamp: '2026-05-08T10:00:01.000Z', message: 'Uncaught TypeError', stack: 'at app.js:10' }
      ],
      networkFailures: [
        { url: 'https://example.com/api', failureText: 'net::ERR_FAILED', timestamp: '2026-05-08T10:00:01.000Z' }
      ],
      httpErrors: [
        { url: 'https://example.com/data', status: 500, statusText: 'Internal Server Error', timestamp: '2026-05-08T10:00:01.000Z' }
      ]
    });
    const xml = renderRunJunitReport(runResult);

    expect(xml).toContain('2 console messages');
    expect(xml).toContain('1 page error');
    expect(xml).toContain('1 network failure');
    expect(xml).toContain('1 HTTP error');
  });

  it('does not include raw console message text in system-out', () => {
    const runResult = createJunitRunResult({
      consoleMessages: [
        { timestamp: '2026-05-08T10:00:01.000Z', type: 'error', text: 'Sensitive user data: token=abc123' }
      ]
    });
    const xml = renderRunJunitReport(runResult);

    expect(xml).not.toContain('token=abc123');
    expect(xml).toContain('1 console message');
  });

  it('includes failure screenshot path in system-out when present', () => {
    const runResult = createJunitRunResult({
      status: 'failed',
      failureScreenshotPath: 'artifacts/screenshots/run_junit_test/step-0-failure.png',
      stepResults: [
        {
          stepId: 'step_1',
          stepIndex: 0,
          type: 'assertText',
          label: 'Check text',
          status: 'failed',
          startedAt: '2026-05-08T10:00:00.000Z',
          finishedAt: '2026-05-08T10:00:01.000Z',
          durationMs: 1000,
          errorMessage: 'Text mismatch'
        }
      ]
    });
    const xml = renderRunJunitReport(runResult);

    expect(xml).toContain('Failure screenshot: artifacts/screenshots/run_junit_test/step-0-failure.png');
  });

  it('escapes special characters in test names and labels', () => {
    const runResult = createJunitRunResult({
      testName: 'Login & "Logout" flow',
      stepResults: [
        {
          stepId: 'step_1',
          stepIndex: 0,
          type: 'assertText',
          label: 'Check <Welcome> text',
          status: 'passed',
          startedAt: '2026-05-08T10:00:00.000Z',
          finishedAt: '2026-05-08T10:00:01.000Z',
          durationMs: 1000
        }
      ]
    });
    const xml = renderRunJunitReport(runResult);

    expect(xml).toContain('name="Login &amp; &quot;Logout&quot; flow"');
    expect(xml).toContain('name="Check &lt;Welcome&gt; text [step 1]"');
  });
});

describe('result storage JUnit export', () => {
  it('writes a JUnit XML file inside the project reports directory', async () => {
    const projectPath = await createTempProjectDir();
    const runResult = createSampleRunResult('run_junit_export');
    const runResultPath = join(projectPath, 'results', `run-run_junit_export.json`);

    await writeFile(runResultPath, JSON.stringify(runResult, null, 2), 'utf8');

    const exported = await exportRunJunitReport(projectPath, 'run_junit_export');
    const xmlPath = join(projectPath, exported.reportPath);
    const xmlContents = await readFile(xmlPath, 'utf8');

    expect(exported.reportPath).toBe(join('reports', 'junit-run_junit_export.xml'));
    expect(xmlContents).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xmlContents).toContain('<testsuites>');
    expect(xmlContents).toContain('<testsuite');
    expect(xmlContents).toContain('name="Checkout flow"');
    expect(xmlContents).toContain('failures="1"');
  });

  it('resolves a valid JUnit report path inside the project reports directory', async () => {
    const projectPath = await createTempProjectDir();

    const resolvedPath = resolveRunJunitReportPath(projectPath, 'run_junit_path');

    expect(resolvedPath).toBe(join(projectPath, 'reports', 'junit-run_junit_path.xml'));
  });

  it('rejects invalid run IDs before exporting a JUnit report', async () => {
    const projectPath = await createTempProjectDir();

    await expect(exportRunJunitReport(projectPath, '../bad-run')).rejects.toThrow('Run ID is invalid.');
  });
});
