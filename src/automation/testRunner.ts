import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

import { chromium } from 'playwright';
import type { Browser, Page } from 'playwright';

import type { TestCase, TestStep, RunResult, StepResult, StepStatus } from '../shared/project-schema';
import { RUN_RESULT_SCHEMA_VERSION, validateRunResult, createStepSnapshot } from '../shared/project-schema';
import { assertChromiumAvailable, normalizeChromiumLaunchError } from './playwrightBrowser';
import { createRunEvidenceCollector } from './runEvidence';

const DEFAULT_TIMEOUT_MS = 30000;

interface RunnerOptions {
  readonly testCase: TestCase;
  readonly projectPath: string;
  readonly browserName?: string;
}

export async function runTestCase(options: RunnerOptions): Promise<RunResult> {
  const { testCase, projectPath } = options;
  const runId = randomUUID();
  const startedAt = new Date().toISOString();

  if (testCase.steps.length === 0) {
    throw new Error('Test case has no steps to run.');
  }

  let browser: Browser | null = null;
  let currentStepIndex: number | undefined;
  const evidenceCollector = createRunEvidenceCollector();

  try {
    await assertChromiumAvailable('run the selected test');

    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    attachRunDiagnostics(page, evidenceCollector, () => currentStepIndex);
    const stepResults: StepResult[] = [];
    let runFailed = false;
    let failureScreenshotPath: string | undefined;

    for (let i = 0; i < testCase.steps.length; i++) {
      if (runFailed) {
        stepResults.push(createSkippedStepResult(testCase.steps[i], i));
        continue;
      }

      let stepResult: StepResult;

      currentStepIndex = i;

      try {
        stepResult = await executeStep(page, testCase.steps[i], i, projectPath, runId);
      } finally {
        currentStepIndex = undefined;
      }

      stepResults.push(stepResult);

      if (stepResult.status === 'failed' || stepResult.status === 'error') {
        runFailed = true;

        if (stepResult.screenshotPath) {
          failureScreenshotPath = stepResult.screenshotPath;
        }
      }
    }

    const finishedAt = new Date().toISOString();
    const durationMs = new Date(finishedAt).getTime() - new Date(startedAt).getTime();
    const status = runFailed ? 'failed' : 'passed';

    const runResult: RunResult = {
      schemaVersion: RUN_RESULT_SCHEMA_VERSION,
      runId,
      testId: testCase.testId,
      testName: testCase.name,
      browserName: 'chromium',
      status,
      startedAt,
      finishedAt,
      durationMs,
      stepResults,
      failureScreenshotPath,
      consoleMessages: evidenceCollector.getConsoleMessages(),
      pageErrors: evidenceCollector.getPageErrors(),
      stepSnapshots: testCase.steps.map(createStepSnapshot)
    };

    const errors = validateRunResult(runResult);

    if (errors.length > 0) {
      throw new Error(`Invalid run result: ${errors.join(' ')}`);
    }

    await saveRunResult(projectPath, runResult);

    return runResult;
  } catch (error) {
    const normalizedError = normalizeChromiumLaunchError(error, 'run the selected test', 'The test run failed.');

    // If browser launch itself failed, return an error result
    const finishedAt = new Date().toISOString();
    const durationMs = new Date(finishedAt).getTime() - new Date(startedAt).getTime();

    const runResult: RunResult = {
      schemaVersion: RUN_RESULT_SCHEMA_VERSION,
      runId,
      testId: testCase.testId,
      testName: testCase.name,
      browserName: 'chromium',
      status: 'error',
      startedAt,
      finishedAt,
      durationMs,
      stepResults: [],
      consoleMessages: evidenceCollector.getConsoleMessages(),
      pageErrors: evidenceCollector.getPageErrors(),
      stepSnapshots: testCase.steps.map(createStepSnapshot)
    };

    try {
      await saveRunResult(projectPath, runResult);
    } catch {
      // Best effort - if we can't save, still throw the original error
    }

    throw normalizedError;
  } finally {
    if (browser) {
      await browser.close().catch(() => {
        // Best effort cleanup
      });
    }
  }
}

function attachRunDiagnostics(
  page: Page,
  evidenceCollector: ReturnType<typeof createRunEvidenceCollector>,
  getCurrentStepIndex: () => number | undefined
): void {
  page.on('console', (message) => {
    try {
      evidenceCollector.recordConsoleMessage({
        timestamp: new Date().toISOString(),
        type: message.type(),
        text: message.text(),
        location: message.location(),
        relatedStepIndex: getCurrentStepIndex()
      });
    } catch {
      // Console capture is best-effort and must not fail the run.
    }
  });

  page.on('pageerror', (error) => {
    try {
      evidenceCollector.recordPageError({
        timestamp: new Date().toISOString(),
        message: error instanceof Error ? error.message : String(error),
        name: error instanceof Error ? error.name : undefined,
        stack: error instanceof Error ? error.stack : undefined,
        relatedStepIndex: getCurrentStepIndex()
      });
    } catch {
      // Page error capture is best-effort and must not fail the run.
    }
  });
}

async function executeStep(
  page: Page,
  step: TestStep,
  index: number,
  projectPath: string,
  runId: string
): Promise<StepResult> {
  const startedAt = new Date().toISOString();
  const timeout = step.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  try {
    switch (step.type) {
      case 'navigate':
        await executeNavigate(page, step, timeout);
        break;
      case 'click':
        await executeClick(page, step, timeout);
        break;
      case 'fill':
        await executeFill(page, step, timeout);
        break;
      case 'assertText':
        await executeAssertText(page, step, timeout);
        break;
      default:
        throw new Error(`Unknown step type: ${step.type as string}`);
    }

    const finishedAt = new Date().toISOString();
    const durationMs = new Date(finishedAt).getTime() - new Date(startedAt).getTime();

    return {
      stepId: step.stepId,
      stepIndex: index,
      type: step.type,
      label: step.label,
      status: 'passed',
      startedAt,
      finishedAt,
      durationMs
    };
  } catch (error) {
    const finishedAt = new Date().toISOString();
    const durationMs = new Date(finishedAt).getTime() - new Date(startedAt).getTime();
    const errorMessage = getErrorMessage(error);

    let screenshotPath: string | undefined;

    try {
      screenshotPath = await captureFailureScreenshot(page, projectPath, runId, index);
    } catch {
      // Screenshot capture is best-effort
    }

    return {
      stepId: step.stepId,
      stepIndex: index,
      type: step.type,
      label: step.label,
      status: 'failed',
      startedAt,
      finishedAt,
      durationMs,
      errorMessage,
      screenshotPath
    };
  }
}

async function executeNavigate(page: Page, step: TestStep, timeout: number): Promise<void> {
  if (!step.target) {
    throw new Error('Navigate step requires a target URL.');
  }

  await page.goto(step.target, { timeout, waitUntil: 'domcontentloaded' });
}

async function executeClick(page: Page, step: TestStep, timeout: number): Promise<void> {
  if (!step.target) {
    throw new Error('Click step requires a target selector.');
  }

  await page.click(step.target, { timeout });
}

async function executeFill(page: Page, step: TestStep, timeout: number): Promise<void> {
  if (!step.target) {
    throw new Error('Fill step requires a target selector.');
  }

  if (!step.value) {
    throw new Error('Fill step requires a value.');
  }

  await page.fill(step.target, step.value, { timeout });
}

async function executeAssertText(page: Page, step: TestStep, timeout: number): Promise<void> {
  if (!step.target) {
    throw new Error('AssertText step requires a target selector.');
  }

  if (!step.value) {
    throw new Error('AssertText step requires an expected value.');
  }

  const locator = page.locator(step.target);

  await locator.waitFor({ state: 'visible', timeout });

  const textContent = await locator.textContent({ timeout });

  if (!textContent || !textContent.includes(step.value)) {
    throw new Error(
      `Expected text "${step.value}" not found in element "${step.target}". ` +
      `Actual text: "${textContent ?? '(empty)'}"`
    );
  }
}

async function captureFailureScreenshot(
  page: Page,
  projectPath: string,
  runId: string,
  stepIndex: number
): Promise<string> {
  const screenshotDir = join(projectPath, 'artifacts', 'screenshots', `run-${runId}`);

  await mkdir(screenshotDir, { recursive: true });

  const fileName = `step-${stepIndex}-failure.png`;
  const filePath = join(screenshotDir, fileName);

  await page.screenshot({ path: filePath, fullPage: false });

  return relative(projectPath, filePath);
}

function createSkippedStepResult(step: TestStep, index: number): StepResult {
  const now = new Date().toISOString();

  return {
    stepId: step.stepId,
    stepIndex: index,
    type: step.type,
    label: step.label,
    status: 'skipped' as StepStatus,
    startedAt: now,
    finishedAt: now,
    durationMs: 0
  };
}

async function saveRunResult(projectPath: string, runResult: RunResult): Promise<void> {
  const resultsDir = join(projectPath, 'results');

  await mkdir(resultsDir, { recursive: true });

  const filePath = join(resultsDir, `run-${runResult.runId}.json`);

  await writeFile(filePath, `${JSON.stringify(runResult, null, 2)}\n`, 'utf8');
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return 'Unknown error during step execution.';
}
