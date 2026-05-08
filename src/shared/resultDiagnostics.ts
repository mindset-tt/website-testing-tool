import type {
  BrowserConsoleLocation,
  BrowserConsoleMessage,
  NetworkFailureRecord,
  PageErrorRecord,
  RunResult,
  StepResult,
  StepSnapshot,
  TestStep
} from './project-schema';

export interface FailureSummaryOptions {
  readonly stepResult?: StepResult | null;
  readonly testStep?: TestStep | null;
}

export interface BrowserEvidenceCounts {
  readonly consoleMessages: number;
  readonly consoleWarningsOrErrors: number;
  readonly pageErrors: number;
  readonly networkFailures: number;
}

const RELEVANT_CONSOLE_TYPES = new Set(['warning', 'error', 'assert']);

export function getPrimaryFailureStep(runResult: RunResult): StepResult | null {
  return runResult.stepResults.find((stepResult) =>
    stepResult.status === 'failed' || stepResult.status === 'error'
  ) ?? null;
}

export function hasBrowserEvidence(runResult: RunResult): boolean {
  return (
    (runResult.consoleMessages?.length ?? 0) > 0 ||
    (runResult.pageErrors?.length ?? 0) > 0 ||
    (runResult.networkFailures?.length ?? 0) > 0
  );
}

export function getBrowserEvidenceCounts(runResult: RunResult): BrowserEvidenceCounts {
  const consoleMessages = runResult.consoleMessages ?? [];
  const pageErrors = runResult.pageErrors ?? [];
  const networkFailures = runResult.networkFailures ?? [];

  return {
    consoleMessages: consoleMessages.length,
    consoleWarningsOrErrors: consoleMessages.filter(isConsoleWarningOrError).length,
    pageErrors: pageErrors.length,
    networkFailures: networkFailures.length
  };
}

export function isConsoleWarningOrError(message: BrowserConsoleMessage): boolean {
  return RELEVANT_CONSOLE_TYPES.has(message.type.toLowerCase());
}

export function getConsoleMessagesForDisplay(
  runResult: RunResult,
  limit = 4
): readonly BrowserConsoleMessage[] {
  const consoleMessages = runResult.consoleMessages ?? [];

  if (consoleMessages.length === 0 || limit <= 0) {
    return [];
  }

  const relevantMessages = consoleMessages.filter(isConsoleWarningOrError);
  const source = relevantMessages.length > 0 ? relevantMessages : consoleMessages;

  return source.slice(-limit).reverse();
}

export function getPageErrorsForDisplay(runResult: RunResult, limit = 3): readonly PageErrorRecord[] {
  const pageErrors = runResult.pageErrors ?? [];

  if (pageErrors.length === 0 || limit <= 0) {
    return [];
  }

  return pageErrors.slice(-limit).reverse();
}

export function getNetworkFailuresForDisplay(runResult: RunResult, limit = 3): readonly NetworkFailureRecord[] {
  const networkFailures = runResult.networkFailures ?? [];

  if (networkFailures.length === 0 || limit <= 0) {
    return [];
  }

  return networkFailures.slice(-limit).reverse();
}

export function formatBrowserEvidenceLocation(location: BrowserConsoleLocation | null | undefined): string | null {
  if (!location) {
    return null;
  }

  const lineNumber = location.lineNumber === undefined ? null : location.lineNumber + 1;
  const columnNumber = location.columnNumber === undefined ? null : location.columnNumber + 1;
  const position = lineNumber === null
    ? null
    : columnNumber === null
      ? `:${lineNumber}`
      : `:${lineNumber}:${columnNumber}`;

  if (location.url && position) {
    return `${location.url}${position}`;
  }

  if (location.url) {
    return location.url;
  }

  if (position) {
    return `line${position}`;
  }

  return null;
}

export function getPageErrorStackPreview(pageError: PageErrorRecord): string | null {
  if (!pageError.stack) {
    return null;
  }

  return pageError.stack.split(/\r?\n/, 2).join(' | ');
}

/**
 * Returns the historical step snapshot for a given step result, if available.
 * Snapshots are captured at run time and do not drift after test edits.
 * Returns null for older run result files that do not contain snapshots.
 */
export function getStepSnapshotForResult(
  stepResult: StepResult | null,
  runResult: RunResult
): StepSnapshot | null {
  if (!stepResult || !runResult.stepSnapshots || runResult.stepSnapshots.length === 0) {
    return null;
  }

  return (
    runResult.stepSnapshots.find((s) => s.stepId === stepResult.stepId) ??
    runResult.stepSnapshots[stepResult.stepIndex] ??
    null
  );
}

/**
 * Returns the step definition for a given step result.
 * Prefers historical snapshot data when available (does not drift after test edits).
 * Falls back to current test case data only for older run results without snapshots.
 */
export function getStepDefinitionForResult(
  stepResult: StepResult | null,
  steps: readonly TestStep[] | null | undefined
): TestStep | null {
  if (!stepResult || !steps || steps.length === 0) {
    return null;
  }

  return steps.find((step) => step.stepId === stepResult.stepId) ?? steps[stepResult.stepIndex] ?? null;
}

export function getFailureScreenshotPath(
  runResult: RunResult,
  stepResult: StepResult | null = getPrimaryFailureStep(runResult)
): string | null {
  return stepResult?.screenshotPath ?? runResult.failureScreenshotPath ?? null;
}

export function buildFailureSummary(
  runResult: RunResult,
  options: FailureSummaryOptions = {}
): string {
  const stepResult = options.stepResult ?? getPrimaryFailureStep(runResult);
  const stepSnapshot = getStepSnapshotForResult(stepResult, runResult);
  // Fall back to current test case data only for older results without snapshots
  const testStep = stepSnapshot ? null : (options.testStep ?? null);
  const screenshotPath = getFailureScreenshotPath(runResult, stepResult);
  const errorMessage = stepResult?.errorMessage ?? (
    runResult.status === 'error'
      ? 'No detailed error message was recorded for this run.'
      : 'No error message was recorded for this failure.'
  );
  const stepNumber = stepResult ? `Step ${stepResult.stepIndex + 1}` : 'Not recorded';
  const stepLabel = stepResult?.label ?? 'Not recorded';
  const stepType = stepResult?.type ?? 'Not recorded';
  const lines = [
    'What failed',
    `Test: ${formatTestName(runResult)}`,
    `Status: ${runResult.status.toUpperCase()}`,
    `Browser: ${runResult.browserName}`,
    `Duration: ${runResult.durationMs}ms`,
    '',
    'Where it failed',
    `Step: ${stepNumber}`,
    `Label: ${stepLabel}`,
    `Type: ${stepType}`
  ];

  // Prefer snapshot data (captured at run time, does not drift)
  if (stepSnapshot) {
    if (stepSnapshot.target) {
      lines.push(`Target: ${stepSnapshot.target}`);
    }

    if (stepSnapshot.value) {
      lines.push(`${getSnapshotValueLabel(stepSnapshot)}: ${stepSnapshot.value}`);
    }

    if (typeof stepSnapshot.timeoutMs === 'number') {
      lines.push(`Timeout: ${stepSnapshot.timeoutMs}ms`);
    }
  } else if (testStep) {
    // Fallback: reconstruct from current test case (may drift after edits)
    if (testStep.target) {
      lines.push(`Target: ${testStep.target}`);
    }

    if (testStep.value) {
      lines.push(`${getStepValueLabel(testStep)}: ${testStep.value}`);
    }

    if (typeof testStep.timeoutMs === 'number') {
      lines.push(`Timeout: ${testStep.timeoutMs}ms`);
    }
  } else if (stepResult) {
    lines.push('Saved step context: unavailable');
  }

  const browserEvidenceCounts = getBrowserEvidenceCounts(runResult);

  lines.push('', 'Evidence');

  if (browserEvidenceCounts.consoleMessages > 0) {
    lines.push(
      `Console messages: ${browserEvidenceCounts.consoleMessages} total` +
      ` (${browserEvidenceCounts.consoleWarningsOrErrors} warnings/errors)`
    );
  }

  if (browserEvidenceCounts.pageErrors > 0) {
    lines.push(`Page errors: ${browserEvidenceCounts.pageErrors}`);
  }

  if (browserEvidenceCounts.networkFailures > 0) {
    lines.push(`Network failures: ${browserEvidenceCounts.networkFailures}`);
  }

  lines.push(`Error: ${errorMessage}`);

  if (screenshotPath) {
    lines.push(`Screenshot: ${screenshotPath}`);
  }

  return lines.join('\n');
}

function formatTestName(runResult: RunResult): string {
  if (runResult.testName.trim().length > 0) {
    return `${runResult.testName} (${runResult.testId})`;
  }

  return runResult.testId;
}

function getStepValueLabel(step: TestStep): string {
  if (step.type === 'assertText') {
    return 'Expected value';
  }

  if (step.type === 'fill') {
    return 'Input value';
  }

  return 'Value';
}

function getSnapshotValueLabel(snapshot: StepSnapshot): string {
  if (snapshot.type === 'assertText') {
    return 'Expected value';
  }

  if (snapshot.type === 'fill') {
    return 'Input value';
  }

  return 'Value';
}
