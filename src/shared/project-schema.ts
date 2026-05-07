export const PROJECT_SCHEMA_VERSION = 1;
export const TEST_CASE_SCHEMA_VERSION = 1;
export const RUN_RESULT_SCHEMA_VERSION = 1;

export const PROJECT_DIRECTORY_NAMES = {
  tests: 'tests',
  results: 'results',
  artifacts: 'artifacts',
  logs: 'logs',
  screenshots: 'screenshots',
  videos: 'videos',
  traces: 'traces'
} as const;

export const SUPPORTED_STEP_TYPES = ['navigate', 'click', 'fill', 'assertText'] as const;

export type StepType = (typeof SUPPORTED_STEP_TYPES)[number];

const RESERVED_WINDOWS_FILENAMES = new Set([
  'con', 'prn', 'aux', 'nul',
  'com1', 'com2', 'com3', 'com4', 'com5', 'com6', 'com7', 'com8', 'com9',
  'lpt1', 'lpt2', 'lpt3', 'lpt4', 'lpt5', 'lpt6', 'lpt7', 'lpt8', 'lpt9'
]);

const TEST_CASE_FILE_EXTENSION = '.test.json';

export interface ProjectMetadata {
  readonly schemaVersion: typeof PROJECT_SCHEMA_VERSION;
  readonly projectId: string;
  readonly name: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly appVersion: string;
  readonly testsDirectory: string;
  readonly resultsDirectory: string;
  readonly artifactsDirectory: string;
}

export interface TestStep {
  readonly stepId: string;
  readonly type: StepType;
  readonly label: string;
  readonly target?: string;
  readonly value?: string;
  readonly timeoutMs?: number;
  readonly notes?: string;
}

export interface TestCase {
  readonly schemaVersion: typeof TEST_CASE_SCHEMA_VERSION;
  readonly testId: string;
  readonly name: string;
  readonly description: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly steps: readonly TestStep[];
}

export interface CreateProjectMetadataInput {
  readonly projectId: string;
  readonly name: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly appVersion: string;
}

// ── Runner result types ──

export type RunStatus = 'passed' | 'failed' | 'error';

export type StepStatus = 'passed' | 'failed' | 'skipped' | 'error';

export interface StepResult {
  readonly stepId: string;
  readonly stepIndex: number;
  readonly type: StepType;
  readonly label: string;
  readonly status: StepStatus;
  readonly startedAt: string;
  readonly finishedAt: string;
  readonly durationMs: number;
  readonly errorMessage?: string;
  readonly screenshotPath?: string;
}

export interface RunResult {
  readonly schemaVersion: typeof RUN_RESULT_SCHEMA_VERSION;
  readonly runId: string;
  readonly testId: string;
  readonly testName: string;
  readonly browserName: string;
  readonly status: RunStatus;
  readonly startedAt: string;
  readonly finishedAt: string;
  readonly durationMs: number;
  readonly stepResults: readonly StepResult[];
  readonly failureScreenshotPath?: string;
}

export function normalizeProjectName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

export function toProjectFolderName(name: string): string {
  const normalizedName = normalizeProjectName(name);
  const slug = normalizedName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const folderName = slug || 'website-test-project';

  if (RESERVED_WINDOWS_FILENAMES.has(folderName)) {
    return `project-${folderName}`;
  }

  return folderName;
}

export function createProjectMetadata(input: CreateProjectMetadataInput): ProjectMetadata {
  return {
    schemaVersion: PROJECT_SCHEMA_VERSION,
    projectId: input.projectId,
    name: normalizeProjectName(input.name),
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
    appVersion: input.appVersion,
    testsDirectory: PROJECT_DIRECTORY_NAMES.tests,
    resultsDirectory: PROJECT_DIRECTORY_NAMES.results,
    artifactsDirectory: PROJECT_DIRECTORY_NAMES.artifacts
  };
}

export function isSupportedStepType(value: unknown): value is StepType {
  return typeof value === 'string' && SUPPORTED_STEP_TYPES.includes(value as StepType);
}

export function validateProjectMetadata(value: unknown): string[] {
  if (!isRecord(value)) {
    return ['Project metadata must be an object.'];
  }

  const errors: string[] = [];

  if (value.schemaVersion !== PROJECT_SCHEMA_VERSION) {
    errors.push(`Project schemaVersion must be ${PROJECT_SCHEMA_VERSION}.`);
  }

  for (const key of ['projectId', 'name', 'createdAt', 'updatedAt', 'appVersion'] as const) {
    if (!isNonEmptyString(value[key])) {
      errors.push(`Project ${key} must be a non-empty string.`);
    }
  }

  for (const key of ['testsDirectory', 'resultsDirectory', 'artifactsDirectory'] as const) {
    if (!isSafeRelativeDirectoryName(value[key])) {
      errors.push(`Project ${key} must be a safe relative directory name.`);
    }
  }

  return errors;
}

export function validateTestCase(value: unknown): string[] {
  if (!isRecord(value)) {
    return ['Test case must be an object.'];
  }

  const errors: string[] = [];

  if (value.schemaVersion !== TEST_CASE_SCHEMA_VERSION) {
    errors.push(`Test case schemaVersion must be ${TEST_CASE_SCHEMA_VERSION}.`);
  }

  for (const key of ['testId', 'name', 'createdAt', 'updatedAt'] as const) {
    if (!isNonEmptyString(value[key])) {
      errors.push(`Test case ${key} must be a non-empty string.`);
    }
  }

  if (typeof value.description !== 'string') {
    errors.push('Test case description must be a string.');
  }

  if (!Array.isArray(value.steps)) {
    errors.push('Test case steps must be an array.');
  } else {
    for (const [index, step] of value.steps.entries()) {
      for (const error of validateTestStep(step)) {
        errors.push(`Step ${index + 1}: ${error}`);
      }
    }
  }

  return errors;
}

export function validateTestStep(value: unknown): string[] {
  if (!isRecord(value)) {
    return ['Step must be an object.'];
  }

  const errors: string[] = [];

  if (!isNonEmptyString(value.stepId)) {
    errors.push('stepId must be a non-empty string.');
  }

  if (!isSupportedStepType(value.type)) {
    errors.push(`type must be one of: ${SUPPORTED_STEP_TYPES.join(', ')}.`);
  }

  if (!isNonEmptyString(value.label)) {
    errors.push('label must be a non-empty string.');
  }

  for (const key of ['target', 'value', 'notes'] as const) {
    if (value[key] !== undefined && typeof value[key] !== 'string') {
      errors.push(`${key} must be a string when present.`);
    }
  }

  if (
    value.timeoutMs !== undefined &&
    (typeof value.timeoutMs !== 'number' || !Number.isFinite(value.timeoutMs) || value.timeoutMs <= 0)
  ) {
    errors.push('timeoutMs must be a positive number when present.');
  }

  return errors;
}

export function validateRunResult(value: unknown): string[] {
  if (!isRecord(value)) {
    return ['Run result must be an object.'];
  }

  const errors: string[] = [];

  if (value.schemaVersion !== RUN_RESULT_SCHEMA_VERSION) {
    errors.push(`Run result schemaVersion must be ${RUN_RESULT_SCHEMA_VERSION}.`);
  }

  for (const key of ['runId', 'testId', 'testName', 'browserName'] as const) {
    if (!isNonEmptyString(value[key])) {
      errors.push(`Run result ${key} must be a non-empty string.`);
    }
  }

  const validRunStatuses: readonly RunStatus[] = ['passed', 'failed', 'error'];

  if (!validRunStatuses.includes(value.status as RunStatus)) {
    errors.push(`Run result status must be one of: ${validRunStatuses.join(', ')}.`);
  }

  for (const key of ['startedAt', 'finishedAt'] as const) {
    if (!isNonEmptyString(value[key])) {
      errors.push(`Run result ${key} must be a non-empty string.`);
    }
  }

  if (typeof value.durationMs !== 'number' || !Number.isFinite(value.durationMs) || value.durationMs < 0) {
    errors.push('Run result durationMs must be a non-negative number.');
  }

  if (!Array.isArray(value.stepResults)) {
    errors.push('Run result stepResults must be an array.');
  } else {
    for (const [index, stepResult] of value.stepResults.entries()) {
      for (const error of validateStepResult(stepResult)) {
        errors.push(`Step result ${index + 1}: ${error}`);
      }
    }
  }

  if (value.failureScreenshotPath !== undefined && typeof value.failureScreenshotPath !== 'string') {
    errors.push('Run result failureScreenshotPath must be a string when present.');
  }

  return errors;
}

export function validateStepResult(value: unknown): string[] {
  if (!isRecord(value)) {
    return ['Step result must be an object.'];
  }

  const errors: string[] = [];

  if (!isNonEmptyString(value.stepId)) {
    errors.push('stepId must be a non-empty string.');
  }

  if (typeof value.stepIndex !== 'number' || !Number.isInteger(value.stepIndex) || value.stepIndex < 0) {
    errors.push('stepIndex must be a non-negative integer.');
  }

  if (!isSupportedStepType(value.type)) {
    errors.push(`type must be one of: ${SUPPORTED_STEP_TYPES.join(', ')}.`);
  }

  if (!isNonEmptyString(value.label)) {
    errors.push('label must be a non-empty string.');
  }

  const validStepStatuses: readonly StepStatus[] = ['passed', 'failed', 'skipped', 'error'];

  if (!validStepStatuses.includes(value.status as StepStatus)) {
    errors.push(`status must be one of: ${validStepStatuses.join(', ')}.`);
  }

  for (const key of ['startedAt', 'finishedAt'] as const) {
    if (!isNonEmptyString(value[key])) {
      errors.push(`Step result ${key} must be a non-empty string.`);
    }
  }

  if (typeof value.durationMs !== 'number' || !Number.isFinite(value.durationMs) || value.durationMs < 0) {
    errors.push('Step result durationMs must be a non-negative number.');
  }

  if (value.errorMessage !== undefined && typeof value.errorMessage !== 'string') {
    errors.push('Step result errorMessage must be a string when present.');
  }

  if (value.screenshotPath !== undefined && typeof value.screenshotPath !== 'string') {
    errors.push('Step result screenshotPath must be a string when present.');
  }

  return errors;
}

export function createTestId(): string {
  return `test_${globalThis.crypto.randomUUID()}`;
}

export function createStepId(): string {
  return `step_${globalThis.crypto.randomUUID()}`;
}

export function createEmptyTestCase(input: {
  readonly name: string;
  readonly description?: string;
}): TestCase {
  const now = new Date().toISOString();

  return {
    schemaVersion: TEST_CASE_SCHEMA_VERSION,
    testId: createTestId(),
    name: input.name.trim(),
    description: input.description?.trim() ?? '',
    createdAt: now,
    updatedAt: now,
    steps: []
  };
}

/**
 * Derives a safe file name from a test case name or test ID.
 * The result is a slug with .test.json extension.
 */
export function toTestCaseFileName(nameOrId: string): string {
  const slug = nameOrId
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const base = slug || 'untitled-test';

  if (RESERVED_WINDOWS_FILENAMES.has(base)) {
    return `test-${base}${TEST_CASE_FILE_EXTENSION}`;
  }

  return `${base}${TEST_CASE_FILE_EXTENSION}`;
}

/**
 * Validates that a file name is a safe test case file name and rejects
 * path traversal attempts (e.g. "../../foo").
 */
export function isValidTestCaseFileName(fileName: string): boolean {
  if (typeof fileName !== 'string' || fileName.length === 0) {
    return false;
  }

  // Reject path separators and traversal
  if (fileName.includes('/') || fileName.includes('\\')) {
    return false;
  }

  if (fileName === '.' || fileName === '..') {
    return false;
  }

  if (!fileName.endsWith(TEST_CASE_FILE_EXTENSION)) {
    return false;
  }

  const base = fileName.slice(0, -TEST_CASE_FILE_EXTENSION.length);

  if (base.length === 0 || base.startsWith('.')) {
    return false;
  }

  return true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isSafeRelativeDirectoryName(value: unknown): value is string {
  if (!isNonEmptyString(value)) {
    return false;
  }

  return !value.includes('/') && !value.includes('\\') && value !== '.' && value !== '..';
}
