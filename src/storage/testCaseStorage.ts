import { mkdir, readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import { join, normalize, relative } from 'node:path';

import {
  createEmptyTestCase,
  isValidTestCaseFileName,
  TEST_CASE_SCHEMA_VERSION,
  toTestCaseFileName,
  validateTestCase
} from '../shared/project-schema';
import type { TestCase } from '../shared/project-schema';
import type { TestCaseListItem } from '../shared/preload-api';

/**
 * Creates a new empty test case and writes it to the project's tests directory.
 * Returns the created TestCase.
 */
export async function createTestCase(
  projectPath: string,
  name: string,
  description?: string
): Promise<TestCase> {
  await assertProjectPath(projectPath);

  const testCase = createEmptyTestCase({ name, description });
  const testsDir = join(projectPath, 'tests');
  await mkdir(testsDir, { recursive: true });

  const fileName = toTestCaseFileName(testCase.testId);
  const filePath = join(testsDir, fileName);

  await writeFile(filePath, `${JSON.stringify(testCase, null, 2)}\n`, 'utf8');

  return testCase;
}

/**
 * Reads a test case from the project's tests directory by file name.
 * The file name must be a valid test case file name (no path traversal).
 */
export async function readTestCase(
  projectPath: string,
  fileName: string
): Promise<TestCase> {
  await assertProjectPath(projectPath);
  assertSafeFileName(fileName);

  const filePath = join(projectPath, 'tests', fileName);
  await assertFileWithinProject(projectPath, filePath);

  const contents = await readFile(filePath, 'utf8');
  const parsed = parseTestCaseJson(contents);
  const errors = validateTestCase(parsed);

  if (errors.length > 0) {
    throw new Error(`Invalid test case: ${errors.join(' ')}`);
  }

  return parsed as TestCase;
}

/**
 * Saves (overwrites) a test case to the project's tests directory.
 * The testId is used to derive the file name.
 * Automatically updates updatedAt and preserves schemaVersion.
 */
export async function saveTestCase(
  projectPath: string,
  testCase: TestCase
): Promise<TestCase> {
  await assertProjectPath(projectPath);

  const errors = validateTestCase(testCase);

  if (errors.length > 0) {
    throw new Error(`Cannot save invalid test case: ${errors.join(' ')}`);
  }

  const now = new Date().toISOString();
  const updated: TestCase = {
    ...testCase,
    schemaVersion: TEST_CASE_SCHEMA_VERSION,
    updatedAt: now
  };

  const testsDir = join(projectPath, 'tests');
  await mkdir(testsDir, { recursive: true });

  const fileName = toTestCaseFileName(updated.testId);
  assertSafeFileName(fileName);

  const filePath = join(testsDir, fileName);
  await assertFileWithinProject(projectPath, filePath);

  await writeFile(filePath, `${JSON.stringify(updated, null, 2)}\n`, 'utf8');

  return updated;
}

/**
 * Lists all test cases in the project's tests directory.
 * Returns an array of TestCaseListItem with testId, name, and updatedAt.
 */
export async function listTestCases(projectPath: string): Promise<readonly TestCaseListItem[]> {
  await assertProjectPath(projectPath);

  const testsDir = join(projectPath, 'tests');

  let entries: string[];

  try {
    entries = await readdir(testsDir);
  } catch {
    // tests directory does not exist yet
    return [];
  }

  const items: TestCaseListItem[] = [];

  for (const entry of entries) {
    if (!isValidTestCaseFileName(entry)) {
      continue;
    }

    try {
      const testCase = await readTestCase(projectPath, entry);

      items.push({
        testId: testCase.testId,
        name: testCase.name,
        updatedAt: testCase.updatedAt
      });
    } catch {
      // Skip files that cannot be read or are invalid
      continue;
    }
  }

  // Sort by updatedAt descending (most recent first)
  items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return items;
}

/**
 * Deletes a test case file from the project's tests directory.
 */
export async function deleteTestCase(
  projectPath: string,
  fileName: string
): Promise<void> {
  await assertProjectPath(projectPath);
  assertSafeFileName(fileName);

  const filePath = join(projectPath, 'tests', fileName);
  await assertFileWithinProject(projectPath, filePath);

  await unlink(filePath);
}

function assertSafeFileName(fileName: string): void {
  if (!isValidTestCaseFileName(fileName)) {
    throw new Error(`Invalid test case file name: ${fileName}`);
  }
}

async function assertProjectPath(projectPath: string): Promise<void> {
  if (typeof projectPath !== 'string' || projectPath.length === 0) {
    throw new Error('Project path is required.');
  }
}

async function assertFileWithinProject(projectPath: string, filePath: string): Promise<void> {
  const normalizedProject = normalize(projectPath);
  const normalizedFile = normalize(filePath);
  const relativePath = relative(normalizedProject, normalizedFile);

  if (relativePath.startsWith('..') || relativePath.startsWith('/') || relativePath.startsWith('\\')) {
    throw new Error('File path is outside the project directory.');
  }
}

function parseTestCaseJson(contents: string): unknown {
  try {
    return JSON.parse(contents) as unknown;
  } catch {
    throw new Error('Test case is not valid JSON.');
  }
}
