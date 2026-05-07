import { describe, expect, it } from 'vitest';

import {
  createMissingChromiumActionMessage,
  createMissingChromiumStatusMessage,
  isMissingChromiumErrorMessage,
  normalizeChromiumLaunchError,
  PLAYWRIGHT_CHROMIUM_INSTALL_COMMAND
} from '../src/automation/playwrightBrowser';

describe('playwright browser helpers', () => {
  it('detects Playwright missing-browser launch errors', () => {
    const rawMessage = [
      "browserType.launch: Executable doesn't exist at C:\\Users\\Example\\ms-playwright\\chromium_headless_shell\\chrome-headless-shell.exe",
      'Please run the following command to download new browsers:'
    ].join('\n');

    expect(isMissingChromiumErrorMessage(rawMessage)).toBe(true);
  });

  it('ignores unrelated launch errors', () => {
    expect(isMissingChromiumErrorMessage('Navigation timeout of 30000ms exceeded.')).toBe(false);
  });

  it('creates a clear status message with the Chromium install command', () => {
    expect(createMissingChromiumStatusMessage()).toContain(PLAYWRIGHT_CHROMIUM_INSTALL_COMMAND);
    expect(createMissingChromiumStatusMessage()).toContain('before using Run or Recorder');
  });

  it('normalizes missing Chromium errors for test execution', () => {
    const error = normalizeChromiumLaunchError(
      new Error("browserType.launch: Failed to launch chromium because executable doesn't exist"),
      'run the selected test',
      'The test run failed.'
    );

    expect(error.message).toBe(createMissingChromiumActionMessage('run the selected test'));
  });

  it('preserves unrelated launch errors', () => {
    const originalError = new Error('The browser crashed unexpectedly.');
    const error = normalizeChromiumLaunchError(
      originalError,
      'start recording',
      'Failed to start recording.'
    );

    expect(error).toBe(originalError);
  });
});
