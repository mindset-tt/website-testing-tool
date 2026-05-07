import { ipcMain } from 'electron';

import { IPC_CHANNELS } from '../shared/ipc-channels';
import { toTestCaseFileName } from '../shared/project-schema';
import type { RunTestActionResult } from '../shared/preload-api';
import { readTestCase } from '../storage/testCaseStorage';
import { runTestCase } from '../automation/testRunner';

export function registerRunnerIpc(): void {
  ipcMain.handle(
    IPC_CHANNELS.runnerRun,
    async (_event, projectPath: unknown, testId: unknown): Promise<RunTestActionResult> => {
      if (typeof projectPath !== 'string' || projectPath.length === 0) {
        return { ok: false, error: 'Project path is required.' };
      }

      if (typeof testId !== 'string' || testId.length === 0) {
        return { ok: false, error: 'Test ID is required.' };
      }

      try {
        // Load the test case from disk
        const fileName = toTestCaseFileName(testId);
        const testCase = await readTestCase(projectPath, fileName);

        // Run it
        const result = await runTestCase({
          testCase,
          projectPath
        });

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

  return 'The test run failed.';
}
