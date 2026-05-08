import type { RunResult, StepResult } from './project-schema';

export function renderRunJunitReport(runResult: RunResult): string {
  const durationSeconds = (runResult.durationMs / 1000).toFixed(3);

  // Count failures and errors
  let failures = 0;
  let errors = 0;

  for (const stepResult of runResult.stepResults) {
    if (stepResult.status === 'failed') {
      failures += 1;
    } else if (stepResult.status === 'error') {
      errors += 1;
    }
  }

  // Add run-level error if status is error
  if (runResult.status === 'error' && failures === 0 && errors === 0) {
    errors = 1;
  }

  const timestamp = new Date(runResult.startedAt).toISOString();
  const testcasesXml = runResult.stepResults
    .map((step) => renderStepResultAsTestcase(step, runResult))
    .join('\n  ');

  return `<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
  <testsuite
    name="${escapeXmlAttribute(runResult.testName)}"
    tests="${runResult.stepResults.length}"
    failures="${failures}"
    errors="${errors}"
    skipped="0"
    time="${durationSeconds}"
    timestamp="${escapeXmlAttribute(timestamp)}"
    hostname="local"
  >
    ${testcasesXml}
    <system-out>${escapeXmlText(formatSystemOut(runResult))}</system-out>
  </testsuite>
</testsuites>`;
}

function renderStepResultAsTestcase(stepResult: StepResult, runResult: RunResult): string {
  const durationSeconds = (stepResult.durationMs / 1000).toFixed(3);
  const classname = `${runResult.testName}.${stepResult.type}`;
  const testcaseName = `${stepResult.label} [step ${stepResult.stepIndex + 1}]`;

  let element = `<testcase
      classname="${escapeXmlAttribute(classname)}"
      name="${escapeXmlAttribute(testcaseName)}"
      time="${durationSeconds}"
    >`;

  if (stepResult.status === 'failed') {
    const message = stepResult.errorMessage || 'Assertion failed';
    element += `
      <failure type="AssertionError" message="${escapeXmlAttribute(message)}">
${escapeXmlText(message)}
      </failure>`;
  } else if (stepResult.status === 'error') {
    const message = stepResult.errorMessage || 'Step execution error';
    element += `
      <error type="RuntimeError" message="${escapeXmlAttribute(message)}">
${escapeXmlText(message)}
      </error>`;
  } else if (stepResult.status === 'skipped') {
    element += `
      <skipped/>`;
  }

  element += '\n    </testcase>';

  return element;
}

function formatSystemOut(runResult: RunResult): string {
  const lines: string[] = [];

  lines.push(`Run ID: ${runResult.runId}`);
  lines.push(`Test ID: ${runResult.testId}`);
  lines.push(`Browser: ${runResult.browserName}`);
  lines.push(`Status: ${runResult.status.toUpperCase()}`);
  lines.push(`Duration: ${runResult.durationMs}ms`);

  const consoleCount = runResult.consoleMessages?.length ?? 0;
  const pageErrorCount = runResult.pageErrors?.length ?? 0;
  const networkFailureCount = runResult.networkFailures?.length ?? 0;
  const httpErrorCount = runResult.httpErrors?.length ?? 0;

  if (consoleCount > 0 || pageErrorCount > 0 || networkFailureCount > 0 || httpErrorCount > 0) {
    lines.push('');
    lines.push('Browser evidence:');

    if (consoleCount > 0) {
      lines.push(`  - ${consoleCount} console message${consoleCount !== 1 ? 's' : ''}`);
    }

    if (pageErrorCount > 0) {
      lines.push(`  - ${pageErrorCount} page error${pageErrorCount !== 1 ? 's' : ''}`);
    }

    if (networkFailureCount > 0) {
      lines.push(`  - ${networkFailureCount} network failure${networkFailureCount !== 1 ? 's' : ''}`);
    }

    if (httpErrorCount > 0) {
      lines.push(`  - ${httpErrorCount} HTTP error${httpErrorCount !== 1 ? 's' : ''}`);
    }
  }

  if (runResult.failureScreenshotPath) {
    lines.push('');
    lines.push(`Failure screenshot: ${runResult.failureScreenshotPath}`);
  }

  return lines.join('\n');
}

export function escapeXmlText(text: string): string {
  if (typeof text !== 'string') {
    return '';
  }

  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\r/g, '&#xD;');
}

export function escapeXmlAttribute(text: string): string {
  if (typeof text !== 'string') {
    return '';
  }

  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/\r/g, '&#xD;')
    .replace(/\n/g, '&#xA;');
}
