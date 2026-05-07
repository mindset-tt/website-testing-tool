import { app, BrowserWindow } from 'electron';
import { join } from 'node:path';

import { registerProjectIpc } from './projectIpc';
import { registerTestCaseIpc } from './testCaseIpc';
import { registerRunnerIpc } from './runnerIpc';
import { registerRecorderIpc } from './recorderIpc';
import { registerResultIpc } from './resultIpc';
import { registerBrowserIpc } from './browserIpc';

const createMainWindow = (): void => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 760,
    minWidth: 960,
    minHeight: 640,
    show: false,
    title: 'Website Testing Tool',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: join(__dirname, '../preload/index.js')
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  const rendererUrl = process.env.ELECTRON_RENDERER_URL;

  if (rendererUrl) {
    void mainWindow.loadURL(rendererUrl);
    return;
  }

  void mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
};

void app.whenReady().then(() => {
  registerProjectIpc();
  registerTestCaseIpc();
  registerRunnerIpc();
  registerRecorderIpc();
  registerResultIpc();
  registerBrowserIpc();
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
