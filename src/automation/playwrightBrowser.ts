import { access } from 'node:fs/promises';

import { chromium } from 'playwright';

export const PLAYWRIGHT_CHROMIUM_INSTALL_COMMAND = 'npx playwright install chromium';

type ChromiumAction = 'run the selected test' | 'start recording';

export interface ChromiumAvailability {
  readonly available: boolean;
  readonly message?: string;
}

export async function getChromiumAvailability(): Promise<ChromiumAvailability> {
  try {
    await access(chromium.executablePath());

    return { available: true };
  } catch {
    return {
      available: false,
      message: createMissingChromiumStatusMessage()
    };
  }
}

export async function assertChromiumAvailable(action: ChromiumAction): Promise<void> {
  const availability = await getChromiumAvailability();

  if (!availability.available) {
    throw new Error(createMissingChromiumActionMessage(action));
  }
}

export function normalizeChromiumLaunchError(
  error: unknown,
  action: ChromiumAction,
  fallbackMessage: string
): Error {
  const errorMessage = getErrorMessage(error);

  if (errorMessage && isMissingChromiumErrorMessage(errorMessage)) {
    return new Error(createMissingChromiumActionMessage(action));
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error(fallbackMessage);
}

export function createMissingChromiumStatusMessage(): string {
  return `Playwright Chromium is not installed. Run ${PLAYWRIGHT_CHROMIUM_INSTALL_COMMAND} before using Run or Recorder.`;
}

export function createMissingChromiumActionMessage(action: ChromiumAction): string {
  return `Playwright Chromium is not installed on this machine. Run ${PLAYWRIGHT_CHROMIUM_INSTALL_COMMAND}, then try again to ${action}.`;
}

export function isMissingChromiumErrorMessage(message: string): boolean {
  const normalizedMessage = message.toLowerCase();

  return normalizedMessage.includes("executable doesn't exist")
    || normalizedMessage.includes('failed to launch chromium because executable doesn\'t exist')
    || normalizedMessage.includes('download new browsers')
    || normalizedMessage.includes('please run the following command');
}

function getErrorMessage(error: unknown): string | null {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  if (typeof error === 'string' && error.trim().length > 0) {
    return error;
  }

  return null;
}
