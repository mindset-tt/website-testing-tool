import { contextBridge, ipcRenderer } from 'electron';

import { IPC_CHANNELS } from '../shared/ipc-channels';
import type { WebsiteTestingToolApi } from '../shared/preload-api';

const api: WebsiteTestingToolApi = {
  platform: process.platform,
  project: {
    createProject: (request) =>
      ipcRenderer.invoke(IPC_CHANNELS.projectCreate, request) as Promise<
        Awaited<ReturnType<WebsiteTestingToolApi['project']['createProject']>>
      >,
    openProject: () =>
      ipcRenderer.invoke(IPC_CHANNELS.projectOpen) as Promise<
        Awaited<ReturnType<WebsiteTestingToolApi['project']['openProject']>>
      >
  },
  testCase: {
    createTestCase: (projectPath, name, description) =>
      ipcRenderer.invoke(IPC_CHANNELS.testCaseCreate, projectPath, name, description) as Promise<
        Awaited<ReturnType<WebsiteTestingToolApi['testCase']['createTestCase']>>
      >,
    listTestCases: (projectPath) =>
      ipcRenderer.invoke(IPC_CHANNELS.testCaseList, projectPath) as Promise<
        Awaited<ReturnType<WebsiteTestingToolApi['testCase']['listTestCases']>>
      >,
    readTestCase: (projectPath, fileName) =>
      ipcRenderer.invoke(IPC_CHANNELS.testCaseRead, projectPath, fileName) as Promise<
        Awaited<ReturnType<WebsiteTestingToolApi['testCase']['readTestCase']>>
      >,
    saveTestCase: (projectPath, testCase) =>
      ipcRenderer.invoke(IPC_CHANNELS.testCaseSave, projectPath, testCase) as Promise<
        Awaited<ReturnType<WebsiteTestingToolApi['testCase']['saveTestCase']>>
      >
  },
  runner: {
    runTestCase: (projectPath, testId) =>
      ipcRenderer.invoke(IPC_CHANNELS.runnerRun, projectPath, testId) as Promise<
        Awaited<ReturnType<WebsiteTestingToolApi['runner']['runTestCase']>>
      >
  },
  browser: {
    getChromiumAvailability: () =>
      ipcRenderer.invoke(IPC_CHANNELS.browserChromiumAvailability) as Promise<
        Awaited<ReturnType<WebsiteTestingToolApi['browser']['getChromiumAvailability']>>
      >
  },
  recorder: {
    startRecording: () =>
      ipcRenderer.invoke(IPC_CHANNELS.recorderStart) as Promise<
        Awaited<ReturnType<WebsiteTestingToolApi['recorder']['startRecording']>>
      >,
    stopRecording: () =>
      ipcRenderer.invoke(IPC_CHANNELS.recorderStop) as Promise<
        Awaited<ReturnType<WebsiteTestingToolApi['recorder']['stopRecording']>>
      >
  },
  result: {
    listResults: (projectPath) =>
      ipcRenderer.invoke(IPC_CHANNELS.resultList, projectPath) as Promise<
        Awaited<ReturnType<WebsiteTestingToolApi['result']['listResults']>>
      >,
    readResult: (projectPath, runId) =>
      ipcRenderer.invoke(IPC_CHANNELS.resultRead, projectPath, runId) as Promise<
        Awaited<ReturnType<WebsiteTestingToolApi['result']['readResult']>>
      >
  }
};

contextBridge.exposeInMainWorld('websiteTestingTool', api);
