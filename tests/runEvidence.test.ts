import { describe, expect, it } from 'vitest';

import {
  createRunEvidenceCollector,
  MAX_CONSOLE_MESSAGE_COUNT,
  MAX_PAGE_ERROR_COUNT,
  MAX_CONSOLE_TEXT_LENGTH,
  MAX_PAGE_ERROR_STACK_LENGTH
} from '../src/automation/runEvidence';

describe('run evidence collector', () => {
  it('caps console messages and keeps the newest entries', () => {
    const collector = createRunEvidenceCollector();

    for (let index = 0; index < MAX_CONSOLE_MESSAGE_COUNT + 2; index++) {
      collector.recordConsoleMessage({
        timestamp: `2026-05-07T10:00:${String(index).padStart(2, '0')}.000Z`,
        type: 'log',
        text: `message ${index}`
      });
    }

    const consoleMessages = collector.getConsoleMessages();

    expect(consoleMessages).toHaveLength(MAX_CONSOLE_MESSAGE_COUNT);
    expect(consoleMessages?.[0]?.text).toBe('message 2');
    expect(consoleMessages?.at(-1)?.text).toBe(`message ${MAX_CONSOLE_MESSAGE_COUNT + 1}`);
  });

  it('truncates long console text and page error stacks', () => {
    const collector = createRunEvidenceCollector();
    const longConsoleText = 'x'.repeat(MAX_CONSOLE_TEXT_LENGTH + 25);
    const longStack = 'stack-line'.repeat(MAX_PAGE_ERROR_STACK_LENGTH / 5);

    collector.recordConsoleMessage({
      timestamp: '2026-05-07T10:00:00.000Z',
      type: 'warning',
      text: longConsoleText
    });
    collector.recordPageError({
      timestamp: '2026-05-07T10:00:01.000Z',
      message: 'Boom',
      stack: longStack
    });

    const consoleMessages = collector.getConsoleMessages();
    const pageErrors = collector.getPageErrors();

    expect(consoleMessages?.[0]?.text.length).toBeLessThanOrEqual(MAX_CONSOLE_TEXT_LENGTH);
    expect(consoleMessages?.[0]?.text.endsWith('...')).toBe(true);
    expect(pageErrors?.[0]?.stack?.length).toBeLessThanOrEqual(MAX_PAGE_ERROR_STACK_LENGTH);
    expect(pageErrors?.[0]?.stack?.endsWith('...')).toBe(true);
  });

  it('caps page errors and preserves safe related step indexes', () => {
    const collector = createRunEvidenceCollector();

    for (let index = 0; index < MAX_PAGE_ERROR_COUNT + 3; index++) {
      collector.recordPageError({
        timestamp: `2026-05-07T10:01:${String(index).padStart(2, '0')}.000Z`,
        message: `error ${index}`,
        relatedStepIndex: index % 2 === 0 ? 1 : -1
      });
    }

    const pageErrors = collector.getPageErrors();

    expect(pageErrors).toHaveLength(MAX_PAGE_ERROR_COUNT);
    expect(pageErrors?.[0]?.message).toBe('error 3');
    expect(pageErrors?.[0]?.relatedStepIndex).toBeUndefined();
    expect(pageErrors?.[1]?.relatedStepIndex).toBe(1);
  });
});
