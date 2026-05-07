import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  createProjectMetadata,
  isSupportedStepType,
  toProjectFolderName,
  validateProjectMetadata,
  validateTestCase,
  validateTestStep
} from '../src/shared/project-schema';

describe('tooling scaffold', () => {
  it('runs the baseline test command', () => {
    expect(true).toBe(true);
  });
});

describe('local project schema helpers', () => {
  it('creates MVP project metadata with expected local directories', () => {
    const metadata = createProjectMetadata({
      projectId: 'proj_test',
      name: '  Checkout Smoke Tests  ',
      createdAt: '2026-05-06T10:00:00.000Z',
      updatedAt: '2026-05-06T10:00:00.000Z',
      appVersion: '0.0.0'
    });

    expect(metadata).toMatchObject({
      schemaVersion: 1,
      projectId: 'proj_test',
      name: 'Checkout Smoke Tests',
      testsDirectory: 'tests',
      resultsDirectory: 'results',
      artifactsDirectory: 'artifacts'
    });
    expect(validateProjectMetadata(metadata)).toEqual([]);
  });

  it('creates safe project folder names for common Windows paths', () => {
    expect(toProjectFolderName('Checkout Smoke Tests')).toBe('checkout-smoke-tests');
    expect(toProjectFolderName('CON')).toBe('project-con');
  });

  it('validates the supported MVP step types', () => {
    expect(isSupportedStepType('navigate')).toBe(true);
    expect(isSupportedStepType('drag')).toBe(false);
    expect(
      validateTestStep({
        stepId: 'step_test',
        type: 'assertText',
        label: 'Assert welcome text',
        target: 'main',
        value: 'Welcome',
        timeoutMs: 5000
      })
    ).toEqual([]);
  });

  it('rejects unsupported test steps inside a test case', () => {
    const errors = validateTestCase({
      schemaVersion: 1,
      testId: 'test_invalid',
      name: 'Invalid test',
      description: '',
      createdAt: '2026-05-06T10:00:00.000Z',
      updatedAt: '2026-05-06T10:00:00.000Z',
      steps: [
        {
          stepId: 'step_invalid',
          type: 'drag',
          label: 'Drag item'
        }
      ]
    });

    expect(errors.some((error) => error.includes('type must be one of'))).toBe(true);
  });
});

describe('app shell', () => {
  it('renders the desktop workbench shell from the renderer entry point', () => {
    const appSource = readFileSync(resolve('src/renderer/App.tsx'), 'utf8');

    expect(appSource).toContain('<AppShell />');
  });

  it('does not render the old static placeholder card model', () => {
    const shellSource = readFileSync(resolve('src/renderer/components/AppShell.tsx'), 'utf8');

    expect(shellSource).not.toContain('workspaceCards');
  });
});
