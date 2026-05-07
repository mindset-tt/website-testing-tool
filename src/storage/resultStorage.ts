import { readFile, readdir } from 'node:fs/promises';
import { extname, isAbsolute, join, normalize, relative, resolve } from 'node:path';

import type { RunResult } from '../shared/project-schema';
import { PROJECT_DIRECTORY_NAMES, validateRunResult } from '../shared/project-schema';

const RUN_RESULT_FILE_PREFIX = 'run-';
const RUN_RESULT_FILE_SUFFIX = '.json';
const FAILURE_SCREENSHOT_EXTENSION = '.png';

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
  assertProjectPath(projectPath);

  const filePath = join(projectPath, 'results', `run-${runId}.json`);
  const contents = await readFile(filePath, 'utf8');
  const parsed = JSON.parse(contents) as unknown;
  const errors = validateRunResult(parsed);

  if (errors.length > 0) {
    throw new Error(`Invalid run result: ${errors.join(' ')}`);
  }

  return parsed as RunResult;
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

function assertProjectPath(projectPath: string): void {
  if (typeof projectPath !== 'string' || projectPath.trim().length === 0) {
    throw new Error('Project path is required.');
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}
