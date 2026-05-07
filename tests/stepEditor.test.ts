import { describe, expect, it } from 'vitest';

import {
  createStepId,
  SUPPORTED_STEP_TYPES,
  validateTestStep
} from '../src/shared/project-schema';
import type { TestStep, StepType } from '../src/shared/project-schema';

describe('step editor helpers', () => {
  it('creates unique step IDs', () => {
    const ids = new Set(Array.from({ length: 10 }, () => createStepId()));

    expect(ids.size).toBe(10);
  });

  it('validates a complete navigate step', () => {
    const step: TestStep = {
      stepId: createStepId(),
      type: 'navigate',
      label: 'Go to homepage',
      target: 'https://example.com',
      timeoutMs: 10000
    };

    expect(validateTestStep(step)).toEqual([]);
  });

  it('validates a complete click step', () => {
    const step: TestStep = {
      stepId: createStepId(),
      type: 'click',
      label: 'Click login button',
      target: '#login',
      timeoutMs: 5000
    };

    expect(validateTestStep(step)).toEqual([]);
  });

  it('validates a complete fill step', () => {
    const step: TestStep = {
      stepId: createStepId(),
      type: 'fill',
      label: 'Enter username',
      target: '#username',
      value: 'testuser',
      timeoutMs: 3000
    };

    expect(validateTestStep(step)).toEqual([]);
  });

  it('validates a complete assertText step', () => {
    const step: TestStep = {
      stepId: createStepId(),
      type: 'assertText',
      label: 'Check welcome message',
      target: '.welcome',
      value: 'Welcome back!',
      timeoutMs: 5000
    };

    expect(validateTestStep(step)).toEqual([]);
  });

  it('rejects a step with empty label', () => {
    const step: TestStep = {
      stepId: createStepId(),
      type: 'navigate',
      label: '',
      target: 'https://example.com'
    };

    const errors = validateTestStep(step);

    expect(errors.some((e) => e.includes('label'))).toBe(true);
  });

  it('rejects a step with invalid type', () => {
    const step = {
      stepId: createStepId(),
      type: 'drag',
      label: 'Drag item'
    };

    const errors = validateTestStep(step);

    expect(errors.some((e) => e.includes('type must be one of'))).toBe(true);
  });

  it('rejects a step with negative timeoutMs', () => {
    const step: TestStep = {
      stepId: createStepId(),
      type: 'navigate',
      label: 'Go',
      timeoutMs: -1
    };

    const errors = validateTestStep(step);

    expect(errors.some((e) => e.includes('timeoutMs'))).toBe(true);
  });

  it('rejects a step with zero timeoutMs', () => {
    const step: TestStep = {
      stepId: createStepId(),
      type: 'navigate',
      label: 'Go',
      timeoutMs: 0
    };

    const errors = validateTestStep(step);

    expect(errors.some((e) => e.includes('timeoutMs'))).toBe(true);
  });

  it('accepts a step without optional fields', () => {
    const step: TestStep = {
      stepId: createStepId(),
      type: 'navigate',
      label: 'Minimal step'
    };

    expect(validateTestStep(step)).toEqual([]);
  });

  it('accepts a step with notes', () => {
    const step: TestStep = {
      stepId: createStepId(),
      type: 'click',
      label: 'Click button',
      notes: 'This button may be slow to appear'
    };

    expect(validateTestStep(step)).toEqual([]);
  });

  it('all supported step types are valid', () => {
    for (const type of SUPPORTED_STEP_TYPES) {
      const step: TestStep = {
        stepId: createStepId(),
        type: type as StepType,
        label: `Test ${type}`
      };

      expect(validateTestStep(step)).toEqual([]);
    }
  });
});
