import { createStepId } from './project-schema';
import type { TestStep } from './project-schema';

/**
 * Generates a default name for a recorded test.
 * Format: "Recorded test YYYY-MM-DD HH-mm"
 */
export function generateRecordedTestName(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return `Recorded test ${year}-${month}-${day} ${hours}-${minutes}`;
}

/**
 * Ensures recorded steps have valid unique stepId values.
 * Steps that already have valid-looking IDs are preserved;
 * steps with missing or empty IDs get new ones.
 */
export function normalizeRecordedSteps(steps: readonly TestStep[]): TestStep[] {
  const seenIds = new Set<string>();

  return steps.map((step) => {
    const hasValidId = typeof step.stepId === 'string' && step.stepId.trim().length > 0;

    if (hasValidId && !seenIds.has(step.stepId)) {
      seenIds.add(step.stepId);

      return step;
    }

    const newId = createStepId();

    seenIds.add(newId);

    return {
      ...step,
      stepId: newId
    };
  });
}
