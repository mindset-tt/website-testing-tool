import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import {
  createEmptyTestCase,
  createTestId,
  createStepId,
  isValidTestCaseFileName,
  TEST_CASE_SCHEMA_VERSION,
  toTestCaseFileName,
  validateTestCase
} from '../src/shared/project-schema';
import {
  createTestCase,
  deleteTestCase,
  duplicateTestCase,
  listTestCases,
  readTestCase,
  saveTestCase
} from '../src/storage/testCaseStorage';

async function createTempProjectDir(): Promise<string> {
  const dir = join(tmpdir(), `wtt-test-${randomUUID()}`);
  await mkdir(dir, { recursive: true });
  await mkdir(join(dir, 'tests'), { recursive: true });

  return dir;
}

describe('test case ID and step ID helpers', () => {
  it('creates a test ID with the test_ prefix', () => {
    const id = createTestId();

    expect(id).toMatch(/^test_/);
  });

  it('creates a step ID with the step_ prefix', () => {
    const id = createStepId();

    expect(id).toMatch(/^step_/);
  });

  it('creates unique test IDs', () => {
    const ids = new Set(Array.from({ length: 10 }, () => createTestId()));

    expect(ids.size).toBe(10);
  });
});

describe('createEmptyTestCase', () => {
  it('creates a test case with the given name', () => {
    const testCase = createEmptyTestCase({ name: 'My Test' });

    expect(testCase.name).toBe('My Test');
    expect(testCase.testId).toMatch(/^test_/);
    expect(testCase.schemaVersion).toBe(TEST_CASE_SCHEMA_VERSION);
    expect(testCase.steps).toEqual([]);
    expect(testCase.description).toBe('');
    expect(testCase.createdAt).toBeTruthy();
    expect(testCase.updatedAt).toBe(testCase.createdAt);
  });

  it('trims the name', () => {
    const testCase = createEmptyTestCase({ name: '  My Test  ' });

    expect(testCase.name).toBe('My Test');
  });

  it('accepts an optional description', () => {
    const testCase = createEmptyTestCase({ name: 'Test', description: 'A description' });

    expect(testCase.description).toBe('A description');
  });
});

describe('toTestCaseFileName', () => {
  it('converts a test ID to a safe file name', () => {
    const fileName = toTestCaseFileName('test_550e8400-e29b-41d4-a716-446655440000');

    expect(fileName).toMatch(/\.test\.json$/);
    expect(fileName).not.toContain('/');
    expect(fileName).not.toContain('\\');
  });

  it('handles reserved Windows names', () => {
    const fileName = toTestCaseFileName('con');

    expect(fileName).toMatch(/^test-con\.test\.json$/);
  });

  it('falls back to untitled-test for empty input', () => {
    const fileName = toTestCaseFileName('');

    expect(fileName).toBe('untitled-test.test.json');
  });
});

describe('isValidTestCaseFileName', () => {
  it('accepts valid test case file names', () => {
    expect(isValidTestCaseFileName('my-test.test.json')).toBe(true);
    expect(isValidTestCaseFileName('test_abc.test.json')).toBe(true);
  });

  it('rejects file names without .test.json extension', () => {
    expect(isValidTestCaseFileName('my-test.json')).toBe(false);
    expect(isValidTestCaseFileName('my-test.txt')).toBe(false);
  });

  it('rejects path traversal attempts', () => {
    expect(isValidTestCaseFileName('../foo.test.json')).toBe(false);
    expect(isValidTestCaseFileName('../../etc/passwd.test.json')).toBe(false);
    expect(isValidTestCaseFileName('sub/foo.test.json')).toBe(false);
  });

  it('rejects empty and dot file names', () => {
    expect(isValidTestCaseFileName('')).toBe(false);
    expect(isValidTestCaseFileName('.test.json')).toBe(false);
    expect(isValidTestCaseFileName('..test.json')).toBe(false);
  });
});

describe('validateTestCase', () => {
  it('returns no errors for a valid test case', () => {
    const testCase = createEmptyTestCase({ name: 'Valid Test' });

    expect(validateTestCase(testCase)).toEqual([]);
  });

  it('rejects a test case with wrong schema version', () => {
    const errors = validateTestCase({
      ...createEmptyTestCase({ name: 'Test' }),
      schemaVersion: 99
    });

    expect(errors.some((e) => e.includes('schemaVersion'))).toBe(true);
  });

  it('rejects a test case with missing name', () => {
    const errors = validateTestCase({
      ...createEmptyTestCase({ name: 'Test' }),
      name: ''
    });

    expect(errors.some((e) => e.includes('name'))).toBe(true);
  });
});

describe('test case storage', () => {
  it('creates a test case and writes it to disk', async () => {
    const projectPath = await createTempProjectDir();
    const testCase = await createTestCase(projectPath, 'Integration Test', 'A test');

    expect(testCase.name).toBe('Integration Test');
    expect(testCase.testId).toMatch(/^test_/);
    expect(testCase.steps).toEqual([]);
  });

  it('lists test cases in a project', async () => {
    const projectPath = await createTempProjectDir();

    await createTestCase(projectPath, 'Test A');
    await createTestCase(projectPath, 'Test B');

    const items = await listTestCases(projectPath);

    expect(items.length).toBe(2);
    expect(items.map((i) => i.name).sort()).toEqual(['Test A', 'Test B']);
  });

  it('reads a test case by file name', async () => {
    const projectPath = await createTempProjectDir();
    const created = await createTestCase(projectPath, 'Read Test');
    const fileName = toTestCaseFileName(created.testId);
    const loaded = await readTestCase(projectPath, fileName);

    expect(loaded.testId).toBe(created.testId);
    expect(loaded.name).toBe('Read Test');
  });

  it('saves (updates) a test case and updates updatedAt', async () => {
    const projectPath = await createTempProjectDir();
    const created = await createTestCase(projectPath, 'Save Test');
    const originalUpdatedAt = created.updatedAt;

    // Wait a tiny bit so timestamps differ
    await new Promise((resolve) => setTimeout(resolve, 10));

    const updated = await saveTestCase(projectPath, {
      ...created,
      name: 'Save Test Updated'
    });

    expect(updated.name).toBe('Save Test Updated');
    expect(updated.updatedAt).not.toBe(originalUpdatedAt);
    expect(updated.schemaVersion).toBe(TEST_CASE_SCHEMA_VERSION);
  });

  it('duplicates a test case with a new test ID, timestamps, and step IDs', async () => {
    const projectPath = await createTempProjectDir();
    const created = await createTestCase(projectPath, 'Checkout flow', 'Original description');
    const saved = await saveTestCase(projectPath, {
      ...created,
      steps: [
        {
          stepId: createStepId(),
          type: 'navigate',
          label: 'Go to homepage',
          target: 'https://example.com'
        },
        {
          stepId: createStepId(),
          type: 'click',
          label: 'Open pricing',
          target: '[data-testid="pricing-link"]'
        }
      ]
    });

    const duplicated = await duplicateTestCase(projectPath, toTestCaseFileName(saved.testId));

    expect(duplicated.name).toBe('Copy of Checkout flow');
    expect(duplicated.testId).not.toBe(saved.testId);
    expect(duplicated.createdAt).not.toBe(saved.createdAt);
    expect(duplicated.updatedAt).toBe(duplicated.createdAt);
    expect(duplicated.description).toBe(saved.description);
    expect(duplicated.steps).toHaveLength(saved.steps.length);
    expect(duplicated.steps.map((step) => step.stepId)).not.toEqual(saved.steps.map((step) => step.stepId));
    expect(duplicated.steps.map((step) => step.label)).toEqual(saved.steps.map((step) => step.label));

    const loadedDuplicate = await readTestCase(projectPath, toTestCaseFileName(duplicated.testId));

    expect(loadedDuplicate.testId).toBe(duplicated.testId);
    expect(loadedDuplicate.name).toBe('Copy of Checkout flow');
  });

  it('deletes a test case file by file name', async () => {
    const projectPath = await createTempProjectDir();
    const created = await createTestCase(projectPath, 'Delete me');

    await deleteTestCase(projectPath, toTestCaseFileName(created.testId));

    const items = await listTestCases(projectPath);

    expect(items).toEqual([]);
  });

  it('returns empty list when tests directory does not exist', async () => {
    const projectPath = await createTempProjectDir();
    const items = await listTestCases(projectPath);

    expect(items).toEqual([]);
  });

  it('rejects path traversal in readTestCase', async () => {
    const projectPath = await createTempProjectDir();

    await expect(
      readTestCase(projectPath, '../../etc/passwd.test.json')
    ).rejects.toThrow();
  });

  it('rejects invalid file names in readTestCase', async () => {
    const projectPath = await createTempProjectDir();

    await expect(
      readTestCase(projectPath, 'not-a-test.json')
    ).rejects.toThrow();
  });

  it('rejects path traversal in duplicateTestCase', async () => {
    const projectPath = await createTempProjectDir();

    await expect(
      duplicateTestCase(projectPath, '../../etc/passwd.test.json')
    ).rejects.toThrow();
  });

  it('rejects path traversal in deleteTestCase', async () => {
    const projectPath = await createTempProjectDir();

    await expect(
      deleteTestCase(projectPath, '../../etc/passwd.test.json')
    ).rejects.toThrow();
  });

  it('sorts listed test cases by updatedAt descending', async () => {
    const projectPath = await createTempProjectDir();

    await createTestCase(projectPath, 'Older Test');
    await new Promise((resolve) => setTimeout(resolve, 5));
    await createTestCase(projectPath, 'Newer Test');

    const items = await listTestCases(projectPath);

    expect(items[0].name).toBe('Newer Test');
    expect(items[1].name).toBe('Older Test');
  });

  it('skips non-test-case files in the tests directory', async () => {
    const projectPath = await createTempProjectDir();

    await createTestCase(projectPath, 'Real Test');
    await writeFile(join(projectPath, 'tests', 'readme.txt'), 'not a test', 'utf8');

    const items = await listTestCases(projectPath);

    expect(items.length).toBe(1);
    expect(items[0].name).toBe('Real Test');
  });
});
