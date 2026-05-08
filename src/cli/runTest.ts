import { runTestCase } from '../automation/testRunner';
import { runStatusToExitCode } from './exitCodes';
import { parseCliArgs } from './parseArgs';
import { readProjectMetadata } from '../storage/projectStorage';
import { listTestCases, readTestCase } from '../storage/testCaseStorage';
import { exportRunHtmlReport, exportRunJunitReport } from '../storage/resultStorage';
import { isValidTestCaseFileName, toTestCaseFileName } from '../shared/project-schema';
import type { TestCase } from '../shared/project-schema';

async function main(): Promise<void> {
  const parseResult = parseCliArgs(process.argv.slice(2));

  if (!parseResult.ok) {
    process.stderr.write(`${parseResult.error}\n`);
    process.exit(2);
  }

  const { projectPath, testIdentifier, junit, html, headed } = parseResult.args;

  // 1. Validate project path and read metadata
  try {
    await readProjectMetadata(projectPath);
  } catch (error) {
    process.stderr.write(`Invalid project: ${getErrorMessage(error)}\n`);
    process.exit(2);
  }

  // 2. Read the test case
  let testCase: TestCase;

  try {
    testCase = await resolveTestCase(projectPath, testIdentifier);
  } catch (error) {
    process.stderr.write(`Could not read test case: ${getErrorMessage(error)}\n`);
    process.exit(2);
  }

  // 3. Run the test
  process.stdout.write(`Running: ${testCase.name}\n`);

  const runResult = await runTestCase({
    testCase,
    projectPath,
    headed
  });

  // 4. Print result
  const statusLabel = runResult.status.toUpperCase();

  process.stdout.write(`Status:   ${statusLabel}\n`);
  process.stdout.write(`Duration: ${runResult.durationMs}ms\n`);
  process.stdout.write(`Result:   results/run-${runResult.runId}.json\n`);

  // 5. Optional exports
  if (junit) {
    try {
      const exported = await exportRunJunitReport(projectPath, runResult.runId);

      process.stdout.write(`JUnit:    ${exported.reportPath}\n`);
    } catch (error) {
      process.stderr.write(`JUnit export failed: ${getErrorMessage(error)}\n`);
    }
  }

  if (html) {
    try {
      const exported = await exportRunHtmlReport(projectPath, runResult.runId);

      process.stdout.write(`HTML:     ${exported.reportPath}\n`);
    } catch (error) {
      process.stderr.write(`HTML export failed: ${getErrorMessage(error)}\n`);
    }
  }

  // 6. Exit with correct code
  process.exit(runStatusToExitCode(runResult.status));
}

async function resolveTestCase(projectPath: string, identifier: string): Promise<TestCase> {
  // Try as a file name first
  if (isValidTestCaseFileName(identifier)) {
    return await readTestCase(projectPath, identifier);
  }

  // Try as a test ID — derive the expected file name
  const derivedFileName = toTestCaseFileName(identifier);

  if (isValidTestCaseFileName(derivedFileName)) {
    try {
      return await readTestCase(projectPath, derivedFileName);
    } catch {
      // Fall through to search
    }
  }

  // Search tests directory for matching testId
  const items = await listTestCases(projectPath);

  for (const item of items) {
    if (item.testId === identifier) {
      return await readTestCase(projectPath, toTestCaseFileName(item.testId));
    }
  }

  throw new Error(`Test "${identifier}" not found.`);
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return 'An unexpected error occurred.';
}

void main();
