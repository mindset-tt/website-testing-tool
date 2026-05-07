import type { ProjectMetadata, RunResult, TestCase, TestStep } from './project-schema';

export interface CreateProjectRequest {
  readonly name: string;
}

export interface OpenedProject {
  readonly projectPath: string;
  readonly metadata: ProjectMetadata;
}

export type ProjectActionResult =
  | {
      readonly ok: true;
      readonly project: OpenedProject;
    }
  | {
      readonly ok: false;
      readonly canceled: boolean;
      readonly error?: string;
    };

export interface TestCaseListItem {
  readonly testId: string;
  readonly name: string;
  readonly updatedAt: string;
}

export type TestCaseActionResult =
  | {
      readonly ok: true;
      readonly testCase: TestCase;
    }
  | {
      readonly ok: false;
      readonly error: string;
    };

export type TestCaseListActionResult =
  | {
      readonly ok: true;
      readonly items: readonly TestCaseListItem[];
    }
  | {
      readonly ok: false;
      readonly error: string;
    };

export interface TestCaseApi {
  readonly createTestCase: (projectPath: string, name: string, description?: string) => Promise<TestCaseActionResult>;
  readonly listTestCases: (projectPath: string) => Promise<TestCaseListActionResult>;
  readonly readTestCase: (projectPath: string, fileName: string) => Promise<TestCaseActionResult>;
  readonly saveTestCase: (projectPath: string, testCase: TestCase) => Promise<TestCaseActionResult>;
}

export interface ProjectApi {
  readonly createProject: (request: CreateProjectRequest) => Promise<ProjectActionResult>;
  readonly openProject: () => Promise<ProjectActionResult>;
}

export type RunTestActionResult =
  | {
      readonly ok: true;
      readonly result: RunResult;
    }
  | {
      readonly ok: false;
      readonly error: string;
    };

export interface RunnerApi {
  readonly runTestCase: (projectPath: string, testId: string) => Promise<RunTestActionResult>;
}

export interface ChromiumAvailability {
  readonly available: boolean;
  readonly message?: string;
}

export type ChromiumAvailabilityActionResult =
  | {
      readonly ok: true;
      readonly availability: ChromiumAvailability;
    }
  | {
      readonly ok: false;
      readonly error: string;
    };

export interface BrowserApi {
  readonly getChromiumAvailability: () => Promise<ChromiumAvailabilityActionResult>;
}

export interface RecordedActionItem {
  readonly type: string;
  readonly label: string;
  readonly target: string;
  readonly value?: string;
}

export type RecorderStartActionResult =
  | {
      readonly ok: true;
    }
  | {
      readonly ok: false;
      readonly error: string;
    };

export type RecorderStopActionResult =
  | {
      readonly ok: true;
      readonly steps: readonly TestStep[];
    }
  | {
      readonly ok: false;
      readonly error: string;
    };

export interface RecorderApi {
  readonly startRecording: () => Promise<RecorderStartActionResult>;
  readonly stopRecording: () => Promise<RecorderStopActionResult>;
}

export type ResultListActionResult =
  | {
      readonly ok: true;
      readonly results: readonly RunResult[];
    }
  | {
      readonly ok: false;
      readonly error: string;
    };

export type ResultReadActionResult =
  | {
      readonly ok: true;
      readonly result: RunResult;
    }
  | {
      readonly ok: false;
      readonly error: string;
    };

export interface ResultApi {
  readonly listResults: (projectPath: string) => Promise<ResultListActionResult>;
  readonly readResult: (projectPath: string, runId: string) => Promise<ResultReadActionResult>;
}

export interface WebsiteTestingToolApi {
  readonly platform: string;
  readonly project: ProjectApi;
  readonly testCase: TestCaseApi;
  readonly runner: RunnerApi;
  readonly browser: BrowserApi;
  readonly recorder: RecorderApi;
  readonly result: ResultApi;
}
