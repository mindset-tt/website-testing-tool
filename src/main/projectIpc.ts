import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import type { OpenDialogOptions } from 'electron';

import { IPC_CHANNELS } from '../shared/ipc-channels';
import type { CreateProjectRequest, ProjectActionResult } from '../shared/preload-api';
import { createProjectFolderStructure, openProject } from '../storage/projectStorage';

export function registerProjectIpc(): void {
  ipcMain.handle(
    IPC_CHANNELS.projectCreate,
    async (event, request: unknown): Promise<ProjectActionResult> => {
      if (!isCreateProjectRequest(request)) {
        return {
          ok: false,
          canceled: false,
          error: 'Project name is required.'
        };
      }

      const browserWindow = BrowserWindow.fromWebContents(event.sender) ?? undefined;
      const dialogOptions: OpenDialogOptions = {
        title: 'Choose where to create the project',
        buttonLabel: 'Create here',
        properties: ['openDirectory', 'createDirectory']
      };
      const dialogResult = browserWindow
        ? await dialog.showOpenDialog(browserWindow, dialogOptions)
        : await dialog.showOpenDialog(dialogOptions);

      if (dialogResult.canceled || dialogResult.filePaths.length === 0) {
        return {
          ok: false,
          canceled: true
        };
      }

      try {
        const project = await createProjectFolderStructure(
          dialogResult.filePaths[0],
          request.name,
          app.getVersion()
        );

        return {
          ok: true,
          project
        };
      } catch (error) {
        return {
          ok: false,
          canceled: false,
          error: getErrorMessage(error)
        };
      }
    }
  );

  ipcMain.handle(IPC_CHANNELS.projectOpen, async (event): Promise<ProjectActionResult> => {
    const browserWindow = BrowserWindow.fromWebContents(event.sender) ?? undefined;
    const dialogOptions: OpenDialogOptions = {
      title: 'Open a project folder',
      buttonLabel: 'Open project',
      properties: ['openDirectory']
    };
    const dialogResult = browserWindow
      ? await dialog.showOpenDialog(browserWindow, dialogOptions)
      : await dialog.showOpenDialog(dialogOptions);

    if (dialogResult.canceled || dialogResult.filePaths.length === 0) {
      return {
        ok: false,
        canceled: true
      };
    }

    try {
      const project = await openProject(dialogResult.filePaths[0]);

      return {
        ok: true,
        project
      };
    } catch (error) {
      return {
        ok: false,
        canceled: false,
        error: getErrorMessage(error)
      };
    }
  });
}

function isCreateProjectRequest(value: unknown): value is CreateProjectRequest {
  return (
    typeof value === 'object' &&
    value !== null &&
    'name' in value &&
    typeof value.name === 'string' &&
    value.name.trim().length > 0
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return 'The project action failed.';
}
