import { ipcMain, shell } from 'electron';

import { IPC_CHANNELS } from '../shared/ipc-channels';
import type {
  ResultExportActionResult,
  FailureScreenshotReadActionResult,
  ResultListActionResult,
  ResultReadActionResult
} from '../shared/preload-api';
import {
  exportRunHtmlReport,
  exportRunJunitReport,
  listRunResults,
  readFailureScreenshot,
  readRunResult,
  resolveExportedReportPath
} from '../storage/resultStorage';

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

  ipcMain.handle(
    IPC_CHANNELS.resultReadFailureScreenshot,
    async (
      _event,
      projectPath: unknown,
      screenshotPath: unknown
    ): Promise<FailureScreenshotReadActionResult> => {
      if (typeof projectPath !== 'string' || projectPath.trim().length === 0) {
        return { ok: false, error: 'Project path is required.' };
      }

      if (typeof screenshotPath !== 'string' || screenshotPath.trim().length === 0) {
        return { ok: false, error: 'Failure screenshot path is required.' };
      }

      try {
        const dataUrl = await readFailureScreenshot(projectPath.trim(), screenshotPath.trim());

        return { ok: true, dataUrl };
      } catch (error) {
        return { ok: false, error: getErrorMessage(error) };
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.resultExportHtmlReport,
    async (_event, projectPath: unknown, runId: unknown): Promise<ResultExportActionResult> => {
      if (typeof projectPath !== 'string' || projectPath.trim().length === 0) {
        return { ok: false, error: 'Project path is required.' };
      }

      if (typeof runId !== 'string' || runId.trim().length === 0) {
        return { ok: false, error: 'Run ID is required.' };
      }

      try {
        const exported = await exportRunHtmlReport(projectPath.trim(), runId.trim());

        return {
          ok: true,
          reportPath: exported.reportPath
        };
      } catch (error) {
        return { ok: false, error: getErrorMessage(error) };
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.resultExportJunitReport,
    async (_event, projectPath: unknown, runId: unknown): Promise<ResultExportActionResult> => {
      if (typeof projectPath !== 'string' || projectPath.trim().length === 0) {
        return { ok: false, error: 'Project path is required.' };
      }

      if (typeof runId !== 'string' || runId.trim().length === 0) {
        return { ok: false, error: 'Run ID is required.' };
      }

      try {
        const exported = await exportRunJunitReport(projectPath.trim(), runId.trim());

        return {
          ok: true,
          reportPath: exported.reportPath
        };
      } catch (error) {
        return { ok: false, error: getErrorMessage(error) };
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.resultOpenExportedReport,
    async (_event, projectPath: unknown, reportPath: unknown): Promise<ResultExportActionResult> => {
      if (typeof projectPath !== 'string' || projectPath.trim().length === 0) {
        return { ok: false, error: 'Project path is required.' };
      }

      if (typeof reportPath !== 'string' || reportPath.trim().length === 0) {
        return { ok: false, error: 'HTML report path is required.' };
      }

      try {
        const resolvedPath = resolveExportedReportPath(projectPath.trim(), reportPath.trim());
        const openError = await shell.openPath(resolvedPath);

        if (openError && openError.length > 0) {
          return { ok: false, error: `Could not open the report. ${openError}` };
        }

        return { ok: true, reportPath };
      } catch (error) {
        return { ok: false, error: getErrorMessage(error) };
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.resultRevealExportedReport,
    async (_event, projectPath: unknown, reportPath: unknown): Promise<ResultExportActionResult> => {
      if (typeof projectPath !== 'string' || projectPath.trim().length === 0) {
        return { ok: false, error: 'Project path is required.' };
      }

      if (typeof reportPath !== 'string' || reportPath.trim().length === 0) {
        return { ok: false, error: 'HTML report path is required.' };
      }

      try {
        const resolvedPath = resolveExportedReportPath(projectPath.trim(), reportPath.trim());
        shell.showItemInFolder(resolvedPath);

        return { ok: true, reportPath };
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
