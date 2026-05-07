export const IPC_CHANNELS = {
  projectCreate: 'project:create',
  projectOpen: 'project:open',
  testCaseCreate: 'testCase:create',
  testCaseList: 'testCase:list',
  testCaseRead: 'testCase:read',
  testCaseSave: 'testCase:save',
  testCaseDuplicate: 'testCase:duplicate',
  testCaseDelete: 'testCase:delete',
  runnerRun: 'runner:run',
  recorderStart: 'recorder:start',
  recorderStop: 'recorder:stop',
  browserChromiumAvailability: 'browser:chromiumAvailability',
  resultList: 'result:list',
  resultRead: 'result:read'
} as const;
