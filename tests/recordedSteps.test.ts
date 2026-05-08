import { describe, expect, it } from 'vitest';

import { generateRecordedTestName, normalizeRecordedSteps } from '../src/shared/recordedSteps';
import type { TestStep } from '../src/shared/project-schema';

describe('generateRecordedTestName', () => {
  it('returns a name starting with "Recorded test"', () => {
    const name = generateRecordedTestName();

    expect(name).toMatch(/^Recorded test \d{4}-\d{2}-\d{2} \d{2}-\d{2}$/);
  });

  it('returns a different name on subsequent calls', () => {
    const name1 = generateRecordedTestName();
    const name2 = generateRecordedTestName();

    // Names could be the same if called in the same minute, but the format should be consistent
    expect(name1).toMatch(/^Recorded test \d{4}-\d{2}-\d{2} \d{2}-\d{2}$/);
    expect(name2).toMatch(/^Recorded test \d{4}-\d{2}-\d{2} \d{2}-\d{2}$/);
  });
});

describe('normalizeRecordedSteps', () => {
  function makeStep(stepId: string, label: string): TestStep {
    return {
      stepId,
      type: 'navigate',
      label,
      target: 'https://example.com'
    };
  }

  it('preserves valid unique step IDs', () => {
    const steps: TestStep[] = [
      makeStep('step_abc', 'Step 1'),
      makeStep('step_def', 'Step 2')
    ];

    const normalized = normalizeRecordedSteps(steps);

    expect(normalized).toHaveLength(2);
    expect(normalized[0].stepId).toBe('step_abc');
    expect(normalized[1].stepId).toBe('step_def');
  });

  it('regenerates empty step IDs', () => {
    const steps: TestStep[] = [
      makeStep('', 'Step 1'),
      makeStep('step_def', 'Step 2')
    ];

    const normalized = normalizeRecordedSteps(steps);

    expect(normalized).toHaveLength(2);
    expect(normalized[0].stepId).not.toBe('');
    expect(normalized[0].stepId).toMatch(/^step_/);
    expect(normalized[1].stepId).toBe('step_def');
  });

  it('regenerates duplicate step IDs', () => {
    const steps: TestStep[] = [
      makeStep('step_dup', 'Step 1'),
      makeStep('step_dup', 'Step 2'),
      makeStep('step_uniq', 'Step 3')
    ];

    const normalized = normalizeRecordedSteps(steps);

    expect(normalized).toHaveLength(3);
    // First occurrence preserved
    expect(normalized[0].stepId).toBe('step_dup');
    // Duplicate gets a new ID
    expect(normalized[1].stepId).not.toBe('step_dup');
    expect(normalized[1].stepId).toMatch(/^step_/);
    // Unique preserved
    expect(normalized[2].stepId).toBe('step_uniq');
  });

  it('preserves all other step properties', () => {
    const steps: TestStep[] = [
      {
        stepId: 'step_abc',
        type: 'click',
        label: 'Click button',
        target: '#submit',
        value: 'click me',
        timeoutMs: 5000,
        notes: 'Important step'
      }
    ];

    const normalized = normalizeRecordedSteps(steps);

    expect(normalized).toHaveLength(1);
    expect(normalized[0].stepId).toBe('step_abc');
    expect(normalized[0].type).toBe('click');
    expect(normalized[0].label).toBe('Click button');
    expect(normalized[0].target).toBe('#submit');
    expect(normalized[0].value).toBe('click me');
    expect(normalized[0].timeoutMs).toBe(5000);
    expect(normalized[0].notes).toBe('Important step');
  });

  it('handles empty array', () => {
    const normalized = normalizeRecordedSteps([]);

    expect(normalized).toHaveLength(0);
  });

  it('ensures all IDs are unique after normalization', () => {
    const steps: TestStep[] = [
      makeStep('', 'Step 1'),
      makeStep('', 'Step 2'),
      makeStep('', 'Step 3')
    ];

    const normalized = normalizeRecordedSteps(steps);
    const ids = normalized.map((s) => s.stepId);

    expect(new Set(ids).size).toBe(3);
  });
});
