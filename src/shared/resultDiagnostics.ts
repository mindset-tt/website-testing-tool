import type { RunResult, StepResult, TestStep } from './project-schema';

export interface FailureSummaryOptions {
  readonly stepResult?: StepResult | null;
  readonly testStep?: TestStep | null;
}

export function getPrimaryFailureStep(runResult: RunResult): StepResult | null {
  return runResult.stepResults.find((stepResult) =>
    stepResult.status === 'failed' || stepResult.status === 'error'
  ) ?? null;
}

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
  const testStep = options.testStep ?? null;
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

  if (testStep?.target) {
    lines.push(`Target: ${testStep.target}`);
  }

  if (testStep?.value) {
    lines.push(`${getStepValueLabel(testStep)}: ${testStep.value}`);
  }

  if (typeof testStep?.timeoutMs === 'number') {
    lines.push(`Timeout: ${testStep.timeoutMs}ms`);
  }

  if (!testStep && stepResult) {
    lines.push('Saved step context: unavailable');
  }

  lines.push('', 'Evidence', `Error: ${errorMessage}`);

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
