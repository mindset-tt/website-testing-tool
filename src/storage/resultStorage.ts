import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { basename, dirname, extname, isAbsolute, join, normalize, relative, resolve } from 'node:path';

import type { RunResult } from '../shared/project-schema';
import { PROJECT_DIRECTORY_NAMES, validateRunResult } from '../shared/project-schema';
import { renderRunHtmlReport } from '../shared/htmlReport';
import { renderRunJunitReport } from '../shared/junitReport';

const RUN_RESULT_FILE_PREFIX = 'run-';
const RUN_RESULT_FILE_SUFFIX = '.json';
const FAILURE_SCREENSHOT_EXTENSION = '.png';
const REPORTS_DIRECTORY_NAME = 'reports';
const HTML_REPORT_FILE_PREFIX = 'report-';
const HTML_REPORT_FILE_SUFFIX = '.html';
const JUNIT_REPORT_FILE_PREFIX = 'junit-';
const JUNIT_REPORT_FILE_SUFFIX = '.xml';
const RUN_ID_PATTERN = /^run_[a-z0-9_-]+$/i;

export async function listRunResults(projectPath: string): Promise<readonly RunResult[]> {
  assertProjectPath(projectPath);

  const resultsDir = join(projectPath, 'results');

  let entries: string[];

  try {
    entries = await readdir(resultsDir);
  } catch {
    return [];
  }

  const results: RunResult[] = [];

  for (const entry of entries) {
    if (!entry.startsWith(RUN_RESULT_FILE_PREFIX) || !entry.endsWith(RUN_RESULT_FILE_SUFFIX)) {
      continue;
    }

    try {
      const filePath = join(resultsDir, entry);
      const contents = await readFile(filePath, 'utf8');
      const parsed = JSON.parse(contents) as unknown;
      const errors = validateRunResult(parsed);

      if (errors.length === 0) {
        results.push(parsed as RunResult);
      }
    } catch {
      // Skip unreadable files
    }
  }

  // Sort by startedAt descending (most recent first)
  results.sort((a, b) => b.startedAt.localeCompare(a.startedAt));

  return results;
}

export async function readRunResult(projectPath: string, runId: string): Promise<RunResult> {
  const filePath = resolveRunResultPath(projectPath, runId);

  try {
    const contents = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(contents) as unknown;
    const errors = validateRunResult(parsed);

    if (errors.length > 0) {
      throw new Error('Saved run result is invalid.');
    }

    return parsed as RunResult;
  } catch (error) {
    if (error instanceof Error && error.message === 'Saved run result is invalid.') {
      throw error;
    }

    if (isNodeError(error) && error.code === 'ENOENT') {
      throw new Error('Saved run result was not found.', { cause: error });
    }

    if (error instanceof SyntaxError) {
      throw new Error('Saved run result could not be parsed.', { cause: error });
    }

    throw new Error('Saved run result could not be read.', { cause: error });
  }
}

export async function exportRunHtmlReport(
  projectPath: string,
  runId: string
): Promise<{ readonly reportPath: string }> {
  const normalizedProjectPath = normalizeProjectPath(projectPath);
  const normalizedRunId = normalizeRunId(runId);
  const runResult = await readRunResult(normalizedProjectPath, normalizedRunId);
  const reportPath = resolveRunHtmlReportPath(normalizedProjectPath, normalizedRunId);
  const reportDirectoryPath = resolve(normalizedProjectPath, REPORTS_DIRECTORY_NAME);
  const reportHtml = renderRunHtmlReport(runResult);

  try {
    await mkdir(reportDirectoryPath, { recursive: true });
    await writeFile(reportPath, reportHtml, 'utf8');
  } catch (error) {
    throw new Error('HTML report could not be written.', { cause: error });
  }

  return {
    reportPath: getRunHtmlReportRelativePath(normalizedRunId)
  };
}

export async function exportRunJunitReport(
  projectPath: string,
  runId: string
): Promise<{ readonly reportPath: string }> {
  const normalizedProjectPath = normalizeProjectPath(projectPath);
  const normalizedRunId = normalizeRunId(runId);
  const runResult = await readRunResult(normalizedProjectPath, normalizedRunId);
  const reportPath = resolveRunJunitReportPath(normalizedProjectPath, normalizedRunId);
  const reportDirectoryPath = resolve(normalizedProjectPath, REPORTS_DIRECTORY_NAME);
  const reportXml = renderRunJunitReport(runResult);

  try {
    await mkdir(reportDirectoryPath, { recursive: true });
    await writeFile(reportPath, reportXml, 'utf8');
  } catch (error) {
    throw new Error('JUnit report could not be written.', { cause: error });
  }

  return {
    reportPath: getRunJunitReportRelativePath(normalizedRunId)
  };
}

export async function readFailureScreenshot(projectPath: string, screenshotPath: string): Promise<string> {
  const resolvedScreenshotPath = resolveFailureScreenshotPath(projectPath, screenshotPath);

  try {
    const fileContents = await readFile(resolvedScreenshotPath);

    return `data:image/png;base64,${fileContents.toString('base64')}`;
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      throw new Error('Failure screenshot file was not found.', { cause: error });
    }

    throw new Error('Failure screenshot file could not be read.', { cause: error });
  }
}

export function resolveFailureScreenshotPath(projectPath: string, screenshotPath: string): string {
  assertProjectPath(projectPath);

  if (typeof screenshotPath !== 'string' || screenshotPath.trim().length === 0) {
    throw new Error('Failure screenshot path is required.');
  }

  const normalizedProjectPath = normalize(projectPath);
  const trimmedScreenshotPath = screenshotPath.trim();

  if (isAbsolute(trimmedScreenshotPath)) {
    throw new Error('Failure screenshot path must stay inside the project artifacts folder.');
  }

  if (extname(trimmedScreenshotPath).toLowerCase() !== FAILURE_SCREENSHOT_EXTENSION) {
    throw new Error('Only PNG failure screenshots can be previewed.');
  }

  const screenshotsDirectory = resolve(
    normalizedProjectPath,
    PROJECT_DIRECTORY_NAMES.artifacts,
    PROJECT_DIRECTORY_NAMES.screenshots
  );
  const resolvedScreenshotPath = resolve(normalizedProjectPath, trimmedScreenshotPath);
  const relativeToScreenshots = relative(screenshotsDirectory, resolvedScreenshotPath);

  if (
    relativeToScreenshots.length === 0 ||
    relativeToScreenshots.startsWith('..') ||
    isAbsolute(relativeToScreenshots)
  ) {
    throw new Error('Failure screenshot path must stay inside the project artifacts folder.');
  }

  return resolvedScreenshotPath;
}

export function resolveRunHtmlReportPath(projectPath: string, runId: string): string {
  const normalizedProjectPath = normalizeProjectPath(projectPath);
  const normalizedRunId = normalizeRunId(runId);
  const reportsDirectory = resolve(normalizedProjectPath, REPORTS_DIRECTORY_NAME);
  const resolvedReportPath = resolve(normalizedProjectPath, getRunHtmlReportRelativePath(normalizedRunId));
  const relativeToReports = relative(reportsDirectory, resolvedReportPath);

  if (
    relativeToReports.length === 0 ||
    relativeToReports.startsWith('..') ||
    isAbsolute(relativeToReports)
  ) {
    throw new Error('HTML report path must stay inside the project reports folder.');
  }

  return resolvedReportPath;
}

export function resolveExportedReportPath(projectPath: string, reportPath: string): string {
  assertProjectPath(projectPath);

  if (typeof reportPath !== 'string' || reportPath.trim().length === 0) {
    throw new Error('HTML report path is required.');
  }

  const normalizedProjectPath = normalizeProjectPath(projectPath);
  const normalizedReportPath = normalize(reportPath.trim());

  if (isAbsolute(normalizedReportPath)) {
    throw new Error('HTML report path must stay inside the project reports folder.');
  }

  if (normalizedReportPath.includes('://')) {
    throw new Error('HTML report path must stay inside the project reports folder.');
  }

  if (extname(normalizedReportPath).toLowerCase() !== HTML_REPORT_FILE_SUFFIX) {
    throw new Error('Only HTML report files can be opened.');
  }

  const reportsDirectory = resolve(normalizedProjectPath, REPORTS_DIRECTORY_NAME);
  const resolvedReportPath = resolve(normalizedProjectPath, normalizedReportPath);
  const relativeToReports = relative(reportsDirectory, resolvedReportPath);

  if (
    relativeToReports.length === 0 ||
    relativeToReports.startsWith('..') ||
    isAbsolute(relativeToReports)
  ) {
    throw new Error('HTML report path must stay inside the project reports folder.');
  }

  if (dirname(relativeToReports) !== '.') {
    throw new Error('HTML report path must stay at the root of the project reports folder.');
  }

  const fileName = basename(resolvedReportPath);

  if (!/^report-[a-z0-9_-]+\.html$/i.test(fileName)) {
    throw new Error('HTML report filename is invalid.');
  }

  return resolvedReportPath;
}

function assertProjectPath(projectPath: string): void {
  if (typeof projectPath !== 'string' || projectPath.trim().length === 0) {
    throw new Error('Project path is required.');
  }
}

function resolveRunResultPath(projectPath: string, runId: string): string {
  const normalizedProjectPath = normalizeProjectPath(projectPath);
  const normalizedRunId = normalizeRunId(runId);
  const resultsDirectory = resolve(normalizedProjectPath, PROJECT_DIRECTORY_NAMES.results);
  const resolvedRunResultPath = resolve(
    resultsDirectory,
    `${RUN_RESULT_FILE_PREFIX}${normalizedRunId}${RUN_RESULT_FILE_SUFFIX}`
  );
  const relativeToResults = relative(resultsDirectory, resolvedRunResultPath);

  if (
    relativeToResults.length === 0 ||
    relativeToResults.startsWith('..') ||
    isAbsolute(relativeToResults)
  ) {
    throw new Error('Run ID is invalid.');
  }

  return resolvedRunResultPath;
}

function normalizeProjectPath(projectPath: string): string {
  assertProjectPath(projectPath);

  return normalize(projectPath);
}

function normalizeRunId(runId: string): string {
  if (typeof runId !== 'string') {
    throw new Error('Run ID is required.');
  }

  const trimmedRunId = runId.trim();

  if (trimmedRunId.length === 0) {
    throw new Error('Run ID is required.');
  }

  if (!RUN_ID_PATTERN.test(trimmedRunId)) {
    throw new Error('Run ID is invalid.');
  }

  return trimmedRunId;
}

function getRunHtmlReportRelativePath(runId: string): string {
  return join(REPORTS_DIRECTORY_NAME, `${HTML_REPORT_FILE_PREFIX}${runId}${HTML_REPORT_FILE_SUFFIX}`);
}

export function resolveRunJunitReportPath(projectPath: string, runId: string): string {
  const normalizedProjectPath = normalizeProjectPath(projectPath);
  const normalizedRunId = normalizeRunId(runId);
  const reportsDirectory = resolve(normalizedProjectPath, REPORTS_DIRECTORY_NAME);
  const resolvedReportPath = resolve(normalizedProjectPath, getRunJunitReportRelativePath(normalizedRunId));
  const relativeToReports = relative(reportsDirectory, resolvedReportPath);

  if (
    relativeToReports.length === 0 ||
    relativeToReports.startsWith('..') ||
    isAbsolute(relativeToReports)
  ) {
    throw new Error('JUnit report path must stay inside the project reports folder.');
  }

  return resolvedReportPath;
}

function getRunJunitReportRelativePath(runId: string): string {
  return join(REPORTS_DIRECTORY_NAME, `${JUNIT_REPORT_FILE_PREFIX}${runId}${JUNIT_REPORT_FILE_SUFFIX}`);
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}
