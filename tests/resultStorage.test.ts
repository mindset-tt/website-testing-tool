import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { describe, expect, it } from 'vitest';

import type { RunResult } from '../src/shared/project-schema';
import {
  exportRunHtmlReport,
  readFailureScreenshot,
  resolveFailureScreenshotPath,
  resolveRunHtmlReportPath
} from '../src/storage/resultStorage';

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

  it('rejects invalid run IDs before exporting a report', async () => {
    const projectPath = await createTempProjectDir();

    await expect(exportRunHtmlReport(projectPath, '../bad-run')).rejects.toThrow('Run ID is invalid.');
  });
});
