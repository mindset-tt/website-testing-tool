import { ipcMain } from 'electron';

import { IPC_CHANNELS } from '../shared/ipc-channels';
import type { ResultListActionResult, ResultReadActionResult } from '../shared/preload-api';
import { listRunResults, readRunResult } from '../storage/resultStorage';

export function registerResultIpc(): void {
  ipcMain.handle(
    IPC_CHANNELS.resultList,
    async (_event, projectPath: unknown): Promise<ResultListActionResult> => {
      if (typeof projectPath !== 'string' || projectPath.length === 0) {
        return { ok: false, error: 'Project path is required.' };
      }

      try {
        const results = await listRunResults(projectPath);

        return { ok: true, results };
      } catch (error) {
        return { ok: false, error: getErrorMessage(error) };
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.resultRead,
    async (_event, projectPath: unknown, runId: unknown): Promise<ResultReadActionResult> => {
      if (typeof projectPath !== 'string' || projectPath.length === 0) {
        return { ok: false, error: 'Project path is required.' };
      }

      if (typeof runId !== 'string' || runId.length === 0) {
        return { ok: false, error: 'Run ID is required.' };
      }

      try {
        const result = await readRunResult(projectPath, runId);

        return { ok: true, result };
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

  return 'The result action failed.';
}
