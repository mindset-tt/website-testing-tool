import { ipcMain } from 'electron';

import { getChromiumAvailability } from '../automation/playwrightBrowser';
import { IPC_CHANNELS } from '../shared/ipc-channels';
import type { ChromiumAvailabilityActionResult } from '../shared/preload-api';

export function registerBrowserIpc(): void {
  ipcMain.handle(
    IPC_CHANNELS.browserChromiumAvailability,
    async (): Promise<ChromiumAvailabilityActionResult> => {
      try {
        const availability = await getChromiumAvailability();

        return { ok: true, availability };
      } catch (error) {
        return { ok: false, error: getErrorMessage(error) };
      }
    }
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return 'Failed to check Playwright Chromium availability.';
}
