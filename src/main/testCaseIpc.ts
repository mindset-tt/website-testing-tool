import { ipcMain } from 'electron';

import { IPC_CHANNELS } from '../shared/ipc-channels';
import type { TestCase } from '../shared/project-schema';
import { validateTestCase } from '../shared/project-schema';
import type {
  TestCaseActionResult,
  TestCaseDeleteActionResult,
  TestCaseListActionResult
} from '../shared/preload-api';
import {
  createTestCase as storageCreateTestCase,
  deleteTestCase as storageDeleteTestCase,
  duplicateTestCase as storageDuplicateTestCase,
  listTestCases as storageListTestCases,
  readTestCase as storageReadTestCase,
  saveTestCase as storageSaveTestCase
} from '../storage/testCaseStorage';

export function registerTestCaseIpc(): void {
  ipcMain.handle(
    IPC_CHANNELS.testCaseCreate,
    async (_event, projectPath: unknown, name: unknown, description: unknown): Promise<TestCaseActionResult> => {
      if (typeof projectPath !== 'string' || projectPath.length === 0) {
        return { ok: false, error: 'Project path is required.' };
      }

      if (typeof name !== 'string' || name.trim().length === 0) {
        return { ok: false, error: 'Test case name is required.' };
      }

      try {
        const testCase = await storageCreateTestCase(
          projectPath,
          name.trim(),
          typeof description === 'string' ? description : undefined
        );

        return { ok: true, testCase };
      } catch (error) {
        return { ok: false, error: getErrorMessage(error) };
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.testCaseList,
    async (_event, projectPath: unknown): Promise<TestCaseListActionResult> => {
      if (typeof projectPath !== 'string' || projectPath.length === 0) {
        return { ok: false, error: 'Project path is required.' };
      }

      try {
        const items = await storageListTestCases(projectPath);

        return { ok: true, items };
      } catch (error) {
        return { ok: false, error: getErrorMessage(error) };
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.testCaseRead,
    async (_event, projectPath: unknown, fileName: unknown): Promise<TestCaseActionResult> => {
      if (typeof projectPath !== 'string' || projectPath.length === 0) {
        return { ok: false, error: 'Project path is required.' };
      }

      if (typeof fileName !== 'string' || fileName.length === 0) {
        return { ok: false, error: 'File name is required.' };
      }

      try {
        const testCase = await storageReadTestCase(projectPath, fileName);

        return { ok: true, testCase };
      } catch (error) {
        return { ok: false, error: getErrorMessage(error) };
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.testCaseSave,
    async (_event, projectPath: unknown, testCase: unknown): Promise<TestCaseActionResult> => {
      if (typeof projectPath !== 'string' || projectPath.length === 0) {
        return { ok: false, error: 'Project path is required.' };
      }

      const validationErrors = validateTestCase(testCase);
      if (validationErrors.length > 0) {
        return { ok: false, error: `Invalid test case data: ${validationErrors.join(' ')}` };
      }

      try {
        const updated = await storageSaveTestCase(projectPath, testCase as TestCase);

        return { ok: true, testCase: updated };
      } catch (error) {
        return { ok: false, error: getErrorMessage(error) };
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.testCaseDuplicate,
    async (_event, projectPath: unknown, fileName: unknown): Promise<TestCaseActionResult> => {
      if (typeof projectPath !== 'string' || projectPath.length === 0) {
        return { ok: false, error: 'Project path is required.' };
      }

      if (typeof fileName !== 'string' || fileName.length === 0) {
        return { ok: false, error: 'File name is required.' };
      }

      try {
        const testCase = await storageDuplicateTestCase(projectPath, fileName);

        return { ok: true, testCase };
      } catch (error) {
        return { ok: false, error: getErrorMessage(error) };
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.testCaseDelete,
    async (_event, projectPath: unknown, fileName: unknown): Promise<TestCaseDeleteActionResult> => {
      if (typeof projectPath !== 'string' || projectPath.length === 0) {
        return { ok: false, error: 'Project path is required.' };
      }

      if (typeof fileName !== 'string' || fileName.length === 0) {
        return { ok: false, error: 'File name is required.' };
      }

      try {
        await storageDeleteTestCase(projectPath, fileName);

        return { ok: true };
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

  return 'The test case action failed.';
}
