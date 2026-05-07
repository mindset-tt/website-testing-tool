import { ipcMain } from 'electron';

import { IPC_CHANNELS } from '../shared/ipc-channels';
import type { RecorderStartActionResult, RecorderStopActionResult } from '../shared/preload-api';
import { Recorder } from '../automation/recorder';

let activeRecorder: Recorder | null = null;

export function registerRecorderIpc(): void {
  ipcMain.handle(
    IPC_CHANNELS.recorderStart,
    async (): Promise<RecorderStartActionResult> => {
      if (activeRecorder?.isRunning) {
        return { ok: false, error: 'A recording session is already active.' };
      }

      try {
        const recorder = new Recorder();

        await recorder.start(() => {
          // Actions are collected; the renderer will poll or we send them via IPC
          // For MVP, we just collect and return on stop
        });

        activeRecorder = recorder;

        return { ok: true };
      } catch (error) {
        return { ok: false, error: getErrorMessage(error) };
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.recorderStop,
    async (): Promise<RecorderStopActionResult> => {
      if (!activeRecorder?.isRunning) {
        return { ok: false, error: 'No active recording session.' };
      }

      try {
        const actions = await activeRecorder.stop();
        const steps = Recorder.toTestSteps(actions);

        activeRecorder = null;

        return { ok: true, steps };
      } catch (error) {
        activeRecorder = null;

        return { ok: false, error: getErrorMessage(error) };
      }
    }
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return 'The recorder action failed.';
}
