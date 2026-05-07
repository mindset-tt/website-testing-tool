import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import type { OpenDialogOptions } from 'electron';

import { IPC_CHANNELS } from '../shared/ipc-channels';
import type {
  CreateProjectRequest,
  ProjectActionResult,
  RecentProjectsActionResult
} from '../shared/preload-api';
import {
  createProjectFolderStructure,
  forgetRecentProject,
  listRecentProjects,
  openProject,
  rememberRecentProject,
  renameProject
} from '../storage/projectStorage';

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
        await rememberRecentProject(app.getPath('userData'), project);

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
      await rememberRecentProject(app.getPath('userData'), project);

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

  ipcMain.handle(
    IPC_CHANNELS.projectOpenRecent,
    async (_event, projectPath: unknown): Promise<ProjectActionResult> => {
      if (typeof projectPath !== 'string' || projectPath.trim().length === 0) {
        return {
          ok: false,
          canceled: false,
          error: 'Project path is required.'
        };
      }

      const normalizedProjectPath = projectPath.trim();

      try {
        const project = await openProject(normalizedProjectPath);
        await rememberRecentProject(app.getPath('userData'), project);

        return {
          ok: true,
          project
        };
      } catch (error) {
        await forgetRecentProject(app.getPath('userData'), normalizedProjectPath);

        return {
          ok: false,
          canceled: false,
          error: getRecentProjectErrorMessage(error)
        };
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.projectRename,
    async (_event, projectPath: unknown, name: unknown): Promise<ProjectActionResult> => {
      if (typeof projectPath !== 'string' || projectPath.trim().length === 0) {
        return {
          ok: false,
          canceled: false,
          error: 'Project path is required.'
        };
      }

      if (typeof name !== 'string' || name.trim().length === 0) {
        return {
          ok: false,
          canceled: false,
          error: 'Project name is required.'
        };
      }

      try {
        const project = await renameProject(projectPath.trim(), name.trim());

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

  ipcMain.handle(
    IPC_CHANNELS.projectRecentList,
    async (): Promise<RecentProjectsActionResult> => {
      try {
        const items = await listRecentProjects(app.getPath('userData'));

        return {
          ok: true,
          items
        };
      } catch (error) {
        return {
          ok: false,
          error: getErrorMessage(error)
        };
      }
    }
  );

  ipcMain.handle(
    IPC_CHANNELS.projectRecentForget,
    async (_event, projectPath: unknown): Promise<RecentProjectsActionResult> => {
      if (typeof projectPath !== 'string' || projectPath.trim().length === 0) {
        return {
          ok: false,
          error: 'Project path is required.'
        };
      }

      try {
        const items = await forgetRecentProject(app.getPath('userData'), projectPath.trim());

        return {
          ok: true,
          items
        };
      } catch (error) {
        return {
          ok: false,
          error: getErrorMessage(error)
        };
      }
    }
  );
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

function getRecentProjectErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return `This recent project is no longer available. ${error.message}`;
  }

  return 'This recent project is no longer available.';
}
