import { useCallback, useEffect, useState } from 'react';
import type { ChangeEvent, ReactElement } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock3,
  FileText,
  FolderOpen,
  FolderPlus,
  Gauge,
  LayoutDashboard,
  ListChecks,
  Play,
  Plus,
  Radio,
  ShieldCheck
} from 'lucide-react';

import type {
  OpenedProject,
  ProjectActionResult,
  RecentProjectItem,
  TestCaseListItem
} from '../../shared/preload-api';
import type { RunResult, TestCase } from '../../shared/project-schema';
import { toTestCaseFileName } from '../../shared/project-schema';
import { RecorderPanel } from './RecorderPanel';
import { ReportPanel } from './ReportPanel';
import { StepEditor } from './StepEditor';

type ActiveSection = 'projects' | 'tests' | 'recorder' | 'results';

interface NavigationItem {
  readonly id: ActiveSection;
  readonly label: string;
  readonly status: string;
  readonly icon: LucideIcon;
}

const sectionTitles: Record<ActiveSection, string> = {
  projects: 'Project overview',
  tests: 'Test designer',
  recorder: 'Recorder',
  results: 'Run reports'
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString();
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString();
}

function StatusBadge({
  tone,
  children
}: {
  readonly tone: 'neutral' | 'success' | 'warning' | 'danger' | 'accent';
  readonly children: string;
}): ReactElement {
  return <span className={`status-badge status-badge-${tone}`}>{children}</span>;
}

export function AppShell(): ReactElement {
  const [activeSection, setActiveSection] = useState<ActiveSection>('projects');
  const [projectName, setProjectName] = useState('Website Test Project');
  const [currentProject, setCurrentProject] = useState<OpenedProject | null>(null);
  const [projectMessage, setProjectMessage] = useState<string | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [projectActionPending, setProjectActionPending] = useState(false);
  const [recentProjects, setRecentProjects] = useState<readonly RecentProjectItem[]>([]);
  const [isRenamingProject, setIsRenamingProject] = useState(false);
  const [projectRenameDraft, setProjectRenameDraft] = useState('');

  const [testCases, setTestCases] = useState<readonly TestCaseListItem[]>([]);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);
  const [testCaseError, setTestCaseError] = useState<string | null>(null);
  const [testCasePending, setTestCasePending] = useState(false);
  const [isRenamingTestCase, setIsRenamingTestCase] = useState(false);
  const [renameDraft, setRenameDraft] = useState('');
  const [confirmDeleteTestCase, setConfirmDeleteTestCase] = useState(false);

  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [runPending, setRunPending] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [chromiumStatusMessage, setChromiumStatusMessage] = useState<string | null>(null);

  const hasProject = currentProject !== null;
  const selectedStepCount = selectedTestCase?.steps.length ?? 0;
  const projectRenameDraftValue = projectRenameDraft.trim();
  const renameDraftValue = renameDraft.trim();
  const runBadgeTone = runPending
    ? 'warning'
    : runResult?.status === 'passed'
      ? 'success'
      : runResult
        ? 'danger'
        : 'neutral';
  const runBadgeText = runPending ? 'Running' : runResult ? runResult.status : 'No run';

  const navigationItems: readonly NavigationItem[] = [
    {
      id: 'projects',
      label: 'Overview',
      status: hasProject ? currentProject.metadata.name : 'No project open',
      icon: LayoutDashboard
    },
    {
      id: 'tests',
      label: 'Tests',
      status: hasProject ? `${testCases.length} saved` : 'Open a project',
      icon: ListChecks
    },
    {
      id: 'recorder',
      label: 'Recorder',
      status: hasProject ? 'Ready' : 'Open a project',
      icon: Radio
    },
    {
      id: 'results',
      label: 'Results',
      status: hasProject ? 'Run history' : 'Open a project',
      icon: BarChart3
    }
  ];

  const handleProjectNameChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setProjectName(event.target.value);
  };

  const handleProjectRenameDraftChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setProjectRenameDraft(event.target.value);
  };

  const handleRenameDraftChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setRenameDraft(event.target.value);
  };

  const handleCreateProject = async (): Promise<void> => {
    await runProjectAction(() => window.websiteTestingTool.project.createProject({ name: projectName }));
  };

  const handleOpenProject = async (): Promise<void> => {
    await runProjectAction(() => window.websiteTestingTool.project.openProject());
  };

  const refreshRecentProjects = useCallback(async (): Promise<void> => {
    const result = await window.websiteTestingTool.project.listRecentProjects();

    if (result.ok) {
      setRecentProjects(result.items);
      return;
    }

    throw new Error(result.error);
  }, []);

  const runProjectAction = async (action: () => Promise<ProjectActionResult>): Promise<void> => {
    setProjectActionPending(true);
    setProjectMessage(null);
    setProjectError(null);

    try {
      const result = await action();

      if (result.ok) {
        setCurrentProject(result.project);
        setProjectName(result.project.metadata.name);
        setProjectRenameDraft(result.project.metadata.name);
        setProjectMessage(`Project open: ${result.project.metadata.name}`);
        setTestCases([]);
        setSelectedTestCase(null);
        setRenameDraft('');
        setIsRenamingProject(false);
        setIsRenamingTestCase(false);
        setConfirmDeleteTestCase(false);
        setRunResult(null);
        setRunError(null);
        setActiveSection('tests');
        try {
          await refreshRecentProjects();
        } catch {
          // Keep project opening usable even if recent-project refresh fails.
        }
        return;
      }

      if (!result.canceled) {
        setProjectError(result.error ?? 'Project action failed.');
      }
    } catch (error) {
      setProjectError(error instanceof Error ? error.message : 'Project action failed.');
    } finally {
      setProjectActionPending(false);
    }
  };

  const refreshTestCases = useCallback(async (projectPath: string): Promise<readonly TestCaseListItem[]> => {
    const result = await window.websiteTestingTool.testCase.listTestCases(projectPath);

    if (!result.ok) {
      throw new Error(result.error);
    }

    setTestCases(result.items);

    return result.items;
  }, []);

  const loadTestCase = useCallback(async (projectPath: string, fileName: string): Promise<TestCase | null> => {
    try {
      const result = await window.websiteTestingTool.testCase.readTestCase(projectPath, fileName);

      if (result.ok) {
        return result.testCase;
      }

      setTestCaseError(result.error);
    } catch (error) {
      setTestCaseError(error instanceof Error ? error.message : 'Failed to read test.');
    }

    return null;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      try {
        const result = await window.websiteTestingTool.project.listRecentProjects();

        if (!cancelled && result.ok) {
          setRecentProjects(result.items);
        }
      } catch {
        if (!cancelled) {
          setRecentProjects([]);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!currentProject) {
      return;
    }

    let cancelled = false;

    const load = async (): Promise<void> => {
      try {
        const result = await window.websiteTestingTool.testCase.listTestCases(currentProject.projectPath);

        if (!cancelled && result.ok) {
          setTestCases(result.items);
        }
      } catch {
        // Project may not have a tests directory yet.
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [currentProject]);

  useEffect(() => {
    if (!currentProject || (activeSection !== 'tests' && activeSection !== 'recorder')) {
      return;
    }

    let cancelled = false;

    const loadAvailability = async (): Promise<void> => {
      try {
        const result = await window.websiteTestingTool.browser.getChromiumAvailability();

        if (!cancelled) {
          if (result.ok) {
            setChromiumStatusMessage(result.availability.available ? null : result.availability.message ?? null);
          } else {
            setChromiumStatusMessage(null);
          }
        }
      } catch {
        if (!cancelled) {
          setChromiumStatusMessage(null);
        }
      }
    };

    void loadAvailability();

    return () => {
      cancelled = true;
    };
  }, [activeSection, currentProject]);

  const handleCreateTest = async (): Promise<void> => {
    if (!currentProject) {
      return;
    }

    setTestCasePending(true);
    setTestCaseError(null);

    try {
      const existingNames = new Set(testCases.map((item) => item.name.trim().toLowerCase()));
      let nextName = 'Untitled test';
      let suffix = 2;

      while (existingNames.has(nextName.toLowerCase())) {
        nextName = `Untitled test ${suffix}`;
        suffix += 1;
      }

      const result = await window.websiteTestingTool.testCase.createTestCase(
        currentProject.projectPath,
        nextName,
        ''
      );

      if (result.ok) {
        await refreshTestCases(currentProject.projectPath);
        setSelectedTestCase(result.testCase);
        setRenameDraft(result.testCase.name);
        setIsRenamingTestCase(false);
        setConfirmDeleteTestCase(false);
        setRunResult(null);
        setRunError(null);
        setActiveSection('tests');
        setProjectMessage(`Test created: ${result.testCase.name}`);
      } else {
        setTestCaseError(result.error);
      }
    } catch (error) {
      setTestCaseError(error instanceof Error ? error.message : 'Failed to create test.');
    } finally {
      setTestCasePending(false);
    }
  };

  const handleOpenRecentProject = async (projectPath: string): Promise<void> => {
    await runProjectAction(() => window.websiteTestingTool.project.openRecentProject(projectPath));

    try {
      await refreshRecentProjects();
    } catch {
      // Recent-project cleanup should not block project opening feedback.
    }
  };

  const handleSelectTestCase = useCallback(
    async (fileName: string): Promise<void> => {
      if (!currentProject) {
        return;
      }

      setTestCasePending(true);
      setTestCaseError(null);
      setRunResult(null);
      setRunError(null);
      setIsRenamingTestCase(false);
      setConfirmDeleteTestCase(false);

      try {
        const testCase = await loadTestCase(currentProject.projectPath, fileName);

        if (testCase) {
          setSelectedTestCase(testCase);
          setRenameDraft(testCase.name);
        }
      } finally {
        setTestCasePending(false);
      }
    },
    [currentProject, loadTestCase]
  );

  const handleRunTest = async (): Promise<void> => {
    if (!currentProject || !selectedTestCase) {
      return;
    }

    setRunPending(true);
    setRunError(null);
    setRunResult(null);

    try {
      const result = await window.websiteTestingTool.runner.runTestCase(
        currentProject.projectPath,
        selectedTestCase.testId
      );

      if (result.ok) {
        setRunResult(result.result);
        setChromiumStatusMessage(null);
        setProjectMessage(`Run complete: ${result.result.status}`);
      } else {
        setRunError(result.error);
      }
    } catch (error) {
      setRunError(error instanceof Error ? error.message : 'Run failed.');
    } finally {
      setRunPending(false);
    }
  };

  const handleStartRenameProject = (): void => {
    if (!currentProject) {
      return;
    }

    setProjectRenameDraft(currentProject.metadata.name);
    setIsRenamingProject(true);
  };

  const handleCancelRenameProject = (): void => {
    setProjectRenameDraft(currentProject?.metadata.name ?? '');
    setIsRenamingProject(false);
  };

  const handleRenameProject = async (): Promise<void> => {
    if (!currentProject) {
      return;
    }

    if (projectRenameDraftValue.length === 0) {
      setProjectError('Project name is required.');
      return;
    }

    if (projectRenameDraftValue === currentProject.metadata.name) {
      setIsRenamingProject(false);
      return;
    }

    setProjectActionPending(true);
    setProjectMessage(null);
    setProjectError(null);

    try {
      const result = await window.websiteTestingTool.project.renameProject(
        currentProject.projectPath,
        projectRenameDraftValue
      );

      if (result.ok) {
        setCurrentProject(result.project);
        setProjectName(result.project.metadata.name);
        setProjectRenameDraft(result.project.metadata.name);
        setIsRenamingProject(false);
        setProjectMessage(`Project renamed: ${result.project.metadata.name}`);

        try {
          await refreshRecentProjects();
        } catch {
          // Keep rename usable even if the recent-project cache cannot refresh.
        }
      } else {
        setProjectError(result.error ?? 'Project rename failed.');
      }
    } catch (error) {
      setProjectError(error instanceof Error ? error.message : 'Project rename failed.');
    } finally {
      setProjectActionPending(false);
    }
  };

  const handleStartRenameTestCase = (): void => {
    if (!selectedTestCase) {
      return;
    }

    setRenameDraft(selectedTestCase.name);
    setConfirmDeleteTestCase(false);
    setIsRenamingTestCase(true);
  };

  const handleCancelRenameTestCase = (): void => {
    setRenameDraft(selectedTestCase?.name ?? '');
    setIsRenamingTestCase(false);
  };

  const handleRenameTestCase = async (): Promise<void> => {
    if (!currentProject || !selectedTestCase) {
      return;
    }

    if (renameDraftValue.length === 0) {
      setTestCaseError('Test name is required.');
      return;
    }

    if (renameDraftValue === selectedTestCase.name) {
      setIsRenamingTestCase(false);
      return;
    }

    setTestCasePending(true);
    setProjectMessage(null);
    setTestCaseError(null);

    try {
      const result = await window.websiteTestingTool.testCase.saveTestCase(currentProject.projectPath, {
        ...selectedTestCase,
        name: renameDraftValue
      });

      if (result.ok) {
        setSelectedTestCase(result.testCase);
        setRenameDraft(result.testCase.name);
        setIsRenamingTestCase(false);
        await refreshTestCases(currentProject.projectPath);
        setProjectMessage(`Test renamed: ${result.testCase.name}`);
      } else {
        setTestCaseError(result.error);
      }
    } catch (error) {
      setTestCaseError(error instanceof Error ? error.message : 'Failed to rename test.');
    } finally {
      setTestCasePending(false);
    }
  };

  const handleDuplicateTestCase = async (): Promise<void> => {
    if (!currentProject || !selectedTestCase) {
      return;
    }

    setTestCasePending(true);
    setProjectMessage(null);
    setTestCaseError(null);

    try {
      const result = await window.websiteTestingTool.testCase.duplicateTestCase(
        currentProject.projectPath,
        toTestCaseFileName(selectedTestCase.testId)
      );

      if (result.ok) {
        setSelectedTestCase(result.testCase);
        setRenameDraft(result.testCase.name);
        setIsRenamingTestCase(false);
        setConfirmDeleteTestCase(false);
        await refreshTestCases(currentProject.projectPath);
        setRunResult(null);
        setRunError(null);
        setProjectMessage(`Test duplicated: ${result.testCase.name}`);
      } else {
        setTestCaseError(result.error);
      }
    } catch (error) {
      setTestCaseError(error instanceof Error ? error.message : 'Failed to duplicate test.');
    } finally {
      setTestCasePending(false);
    }
  };

  const handleDeleteTestCase = async (): Promise<void> => {
    if (!currentProject || !selectedTestCase) {
      return;
    }

    const deletedName = selectedTestCase.name;
    const currentIndex = testCases.findIndex((item) => item.testId === selectedTestCase.testId);

    setTestCasePending(true);
    setProjectMessage(null);
    setTestCaseError(null);

    try {
      const result = await window.websiteTestingTool.testCase.deleteTestCase(
        currentProject.projectPath,
        toTestCaseFileName(selectedTestCase.testId)
      );

      if (!result.ok) {
        setTestCaseError(result.error);
        return;
      }

      const items = await refreshTestCases(currentProject.projectPath);
      const nextItem = items[currentIndex] ?? items[currentIndex - 1] ?? null;

      if (nextItem) {
        const nextTestCase = await loadTestCase(
          currentProject.projectPath,
          toTestCaseFileName(nextItem.testId)
        );

        setSelectedTestCase(nextTestCase);
        setRenameDraft(nextTestCase?.name ?? '');
      } else {
        setSelectedTestCase(null);
        setRenameDraft('');
      }

      setRunResult(null);
      setRunError(null);
      setIsRenamingTestCase(false);
      setConfirmDeleteTestCase(false);
      setProjectMessage(`Test deleted: ${deletedName}`);
    } catch (error) {
      setTestCaseError(error instanceof Error ? error.message : 'Failed to delete test.');
    } finally {
      setTestCasePending(false);
    }
  };

  const renderProjectActions = (): ReactElement => (
    <div className="project-actions" aria-label="Project actions">
      <label className="project-name-field">
        <span>Project name</span>
        <input
          onChange={handleProjectNameChange}
          type="text"
          value={projectName}
          disabled={projectActionPending}
        />
      </label>
      <button
        type="button"
        className="button button-primary"
        disabled={projectActionPending || projectName.trim().length === 0}
        onClick={handleCreateProject}
      >
        <FolderPlus size={16} />
        Create
      </button>
      <button type="button" className="button button-secondary" disabled={projectActionPending} onClick={handleOpenProject}>
        <FolderOpen size={16} />
        Open
      </button>
    </div>
  );

  const renderProjectStrip = (): ReactElement => {
    if (!currentProject) {
      return (
        <section className="empty-workspace" aria-labelledby="empty-workspace-title">
          <div className="empty-workspace-copy">
            <p className="eyebrow">Local project</p>
            <h2 id="empty-workspace-title">Open or create a testing workspace</h2>
            <p>Local projects keep tests, results, screenshots, traces, videos, and logs together on disk.</p>
          </div>
          {renderProjectActions()}
          <div className="empty-workspace-section" aria-label="Recent projects">
            <div className="panel-header compact">
              <div>
                <p className="eyebrow">Recent projects</p>
                <h2>Continue a workspace</h2>
              </div>
            </div>

            {recentProjects.length === 0 ? (
              <p className="empty-copy">Projects you create or open will appear here for quick access.</p>
            ) : (
              <div className="compact-list">
                {recentProjects.map((item) => (
                  <button
                    key={item.projectPath}
                    type="button"
                    className="recent-project-row"
                    disabled={projectActionPending}
                    onClick={() => {
                      void handleOpenRecentProject(item.projectPath);
                    }}
                  >
                    <span className="test-row-icon">
                      <FolderOpen size={15} />
                    </span>
                    <span className="recent-project-copy">
                      <strong>{item.name}</strong>
                      <span className="recent-project-path">{item.projectPath}</span>
                    </span>
                    <small className="recent-project-meta">Opened {formatDate(item.lastOpenedAt)}</small>
                  </button>
                ))}
              </div>
            )}
          </div>
          {(projectMessage || projectError) && (
            <p className={projectError ? 'notice notice-error' : 'notice'}>
              {projectError ?? projectMessage}
            </p>
          )}
        </section>
      );
    }

    return (
      <section className="project-strip" aria-label="Open project">
        <div className="project-strip-main">
          <span className="project-icon">
            <ShieldCheck size={18} />
          </span>
          <div>
            <p className="eyebrow">Project</p>
            <h2>{currentProject.metadata.name}</h2>
          </div>
        </div>
        <div className="project-strip-meta">
          <div className="project-strip-actions">
            <span className="status-badge status-badge-accent">Workspace ready</span>
            <button
              type="button"
              className="button button-secondary compact-button"
              disabled={projectActionPending}
              onClick={handleStartRenameProject}
            >
              Rename
            </button>
          </div>
          <p className="project-path project-path-meta">{currentProject.projectPath}</p>
        </div>
        {isRenamingProject && (
          <form
            className="project-management-strip"
            onSubmit={(event) => {
              event.preventDefault();
              void handleRenameProject();
            }}
          >
            <label className="project-rename-field">
              <span>Project name</span>
              <input
                type="text"
                value={projectRenameDraft}
                onChange={handleProjectRenameDraftChange}
                disabled={projectActionPending}
              />
            </label>
            <div className="project-management-actions">
              <button
                type="button"
                className="button button-secondary compact-button"
                onClick={handleCancelRenameProject}
                disabled={projectActionPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="button button-primary compact-button"
                disabled={
                  projectActionPending ||
                  projectRenameDraftValue.length === 0 ||
                  projectRenameDraftValue === currentProject.metadata.name
                }
              >
                Save name
              </button>
            </div>
          </form>
        )}
        {(projectMessage || projectError) && (
          <p className={projectError ? 'notice notice-error' : 'notice'}>
            {projectError ?? projectMessage}
          </p>
        )}
      </section>
    );
  };

  const renderOverview = (): ReactElement => (
    <section className="overview-grid" aria-label="Project overview">
      <article className="command-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Validation cockpit</p>
            <h2>Current workspace</h2>
          </div>
          <StatusBadge tone="success">Local ready</StatusBadge>
        </div>

        <div className="metrics-grid">
          <div className="metric-card">
            <FileText size={18} />
            <span>{testCases.length}</span>
            <p>Saved tests</p>
          </div>
          <div className="metric-card">
            <ListChecks size={18} />
            <span>{selectedStepCount}</span>
            <p>Selected steps</p>
          </div>
          <div className="metric-card">
            <Activity size={18} />
            <span>{runPending ? 'Live' : runResult ? runResult.status : 'None'}</span>
            <p>Last run</p>
          </div>
          <div className="metric-card">
            <Radio size={18} />
            <span>Ready</span>
            <p>Recorder</p>
          </div>
        </div>

        <div className="workflow-board" aria-label="Workflow status">
          <div className="workflow-row">
            <CircleDot size={16} />
            <div>
              <strong>Design tests</strong>
              <span>{selectedTestCase ? selectedTestCase.name : 'No test selected'}</span>
            </div>
            <button type="button" className="inline-action" onClick={() => setActiveSection('tests')}>
              Open
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="workflow-row">
            <Radio size={16} />
            <div>
              <strong>Record flows</strong>
              <span>{hasProject ? 'Recorder is available' : 'Open a project first'}</span>
            </div>
            <button type="button" className="inline-action" onClick={() => setActiveSection('recorder')} disabled={!hasProject}>
              Open
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="workflow-row">
            <BarChart3 size={16} />
            <div>
              <strong>Review results</strong>
              <span>{runResult ? `Last run ${runResult.status}` : 'No completed run loaded'}</span>
            </div>
            <button type="button" className="inline-action" onClick={() => setActiveSection('results')} disabled={!hasProject}>
              Open
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </article>

      <aside className="side-panel">
        <div className="panel-header compact">
          <div>
            <p className="eyebrow">Recent tests</p>
            <h2>{testCases.length} saved</h2>
          </div>
          <button type="button" className="icon-button" onClick={handleCreateTest} disabled={!hasProject || testCasePending} aria-label="Create test">
            <Plus size={16} />
          </button>
        </div>

        {testCases.length === 0 ? (
          <p className="empty-copy">No tests in this project.</p>
        ) : (
          <div className="compact-list">
            {testCases.slice(0, 6).map((item) => (
              <button
                key={item.testId}
                type="button"
                className="compact-list-row"
                onClick={() => {
                  setActiveSection('tests');
                  void handleSelectTestCase(toTestCaseFileName(item.testId));
                }}
              >
                <FileText size={15} />
                <span>{item.name}</span>
                <small>{formatDate(item.updatedAt)}</small>
              </button>
            ))}
          </div>
        )}
      </aside>
    </section>
  );

  const renderTests = (): ReactElement => (
    <section className="test-workbench" aria-label="Test designer">
      <aside className="suite-panel" aria-label="Saved tests">
        <div className="panel-header compact">
          <div>
            <p className="eyebrow">Suite</p>
            <h2>Tests</h2>
          </div>
          <button
            type="button"
            className="button button-primary compact-button"
            disabled={testCasePending}
            onClick={handleCreateTest}
          >
            <Plus size={15} />
            New
          </button>
        </div>

        {testCaseError && <p className="notice notice-error">{testCaseError}</p>}

        <div className="test-list">
          {testCases.length === 0 && !testCasePending && (
            <p className="empty-copy">No tests in this project.</p>
          )}

          {testCases.map((item) => (
            <button
              key={item.testId}
              type="button"
              className={`test-row ${selectedTestCase?.testId === item.testId ? 'selected' : ''}`}
              onClick={() => {
                void handleSelectTestCase(toTestCaseFileName(item.testId));
              }}
            >
              <span className="test-row-icon">
                <FileText size={15} />
              </span>
              <span className="test-row-copy">
                <strong>{item.name}</strong>
                <small>Updated {formatDate(item.updatedAt)}</small>
              </span>
            </button>
          ))}
        </div>
      </aside>

      <section className="designer-panel" aria-label="Selected test">
        {testCaseError && <p className="notice notice-error test-detail-notice">{testCaseError}</p>}

        {selectedTestCase ? (
          <article className="test-detail">
            <div className="test-detail-header">
              <div>
                <p className="eyebrow">Test case</p>
                <h2>{selectedTestCase.name}</h2>
                <p>{selectedTestCase.description || 'No description'}</p>
              </div>
              <div className="test-detail-controls">
                <StatusBadge tone={selectedStepCount > 0 ? 'accent' : 'neutral'}>
                  {`${selectedStepCount} step${selectedStepCount !== 1 ? 's' : ''}`}
                </StatusBadge>
                <div className="test-detail-actions">
                  <button
                    type="button"
                    className="button button-secondary compact-button"
                    disabled={testCasePending}
                    onClick={handleStartRenameTestCase}
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    className="button button-secondary compact-button"
                    disabled={testCasePending}
                    onClick={() => {
                      setIsRenamingTestCase(false);
                      setConfirmDeleteTestCase(false);
                      void handleDuplicateTestCase();
                    }}
                  >
                    Duplicate
                  </button>
                  <button
                    type="button"
                    className="button button-danger compact-button"
                    disabled={testCasePending}
                    onClick={() => {
                      setIsRenamingTestCase(false);
                      setConfirmDeleteTestCase((current) => !current);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>

            {isRenamingTestCase && (
              <form
                className="test-management-strip"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleRenameTestCase();
                }}
              >
                <label className="test-rename-field">
                  <span>Test name</span>
                  <input
                    type="text"
                    value={renameDraft}
                    onChange={handleRenameDraftChange}
                    disabled={testCasePending}
                  />
                </label>
                <div className="test-management-actions">
                  <button
                    type="button"
                    className="button button-secondary compact-button"
                    onClick={handleCancelRenameTestCase}
                    disabled={testCasePending}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="button button-primary compact-button"
                    disabled={testCasePending || renameDraftValue.length === 0 || renameDraftValue === selectedTestCase.name}
                  >
                    Save name
                  </button>
                </div>
              </form>
            )}

            {confirmDeleteTestCase && (
              <div className="test-management-strip test-management-strip-danger">
                <p>Delete this test? This removes its saved JSON file from the project.</p>
                <div className="test-management-actions">
                  <button
                    type="button"
                    className="button button-secondary compact-button"
                    onClick={() => setConfirmDeleteTestCase(false)}
                    disabled={testCasePending}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="button button-danger compact-button"
                    onClick={() => {
                      void handleDeleteTestCase();
                    }}
                    disabled={testCasePending}
                  >
                    Delete test
                  </button>
                </div>
              </div>
            )}

            <dl className="metadata-grid">
              <div>
                <dt>Updated</dt>
                <dd>{formatDateTime(selectedTestCase.updatedAt)}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{formatDateTime(selectedTestCase.createdAt)}</dd>
              </div>
              <div>
                <dt>Test ID</dt>
                <dd>{selectedTestCase.testId}</dd>
              </div>
            </dl>

            <StepEditor
              key={selectedTestCase.testId}
              testCase={selectedTestCase}
              projectPath={currentProject?.projectPath ?? ''}
              onSaved={(updated) => {
                setSelectedTestCase(updated);
                setRenameDraft(updated.name);
                setProjectMessage(`Test saved: ${updated.name}`);
                if (currentProject) {
                  void refreshTestCases(currentProject.projectPath).catch((error: unknown) => {
                    setTestCaseError(error instanceof Error ? error.message : 'Failed to refresh tests.');
                  });
                }
              }}
              onError={(message) => {
                setTestCaseError(message);
              }}
            />
          </article>
        ) : (
          <div className="empty-panel">
            <FileText size={28} />
            <h2>Select a test</h2>
            <p>Choose a test from the suite list or create a new one.</p>
          </div>
        )}
      </section>

      <aside className="run-inspector" aria-label="Run inspector">
        <div className="panel-header compact">
          <div>
            <p className="eyebrow">Execution</p>
            <h2>Run</h2>
          </div>
          <StatusBadge tone={runBadgeTone}>{runBadgeText}</StatusBadge>
        </div>

        <button
          type="button"
          className="button button-run"
          disabled={runPending || !selectedTestCase || selectedStepCount === 0}
          onClick={handleRunTest}
        >
          <Play size={16} />
          {runPending ? 'Running' : 'Run selected test'}
        </button>

        {!runError && !runResult && chromiumStatusMessage && (
          <p className="notice notice-error">{chromiumStatusMessage}</p>
        )}

        {runError && <p className="notice notice-error">{runError}</p>}

        <div className="inspector-stack">
          <div className="inspector-card">
            <Clock3 size={16} />
            <div>
              <span>Duration</span>
              <strong>{runResult ? `${runResult.durationMs}ms` : 'Not run'}</strong>
            </div>
          </div>
          <div className="inspector-card">
            <Gauge size={16} />
            <div>
              <span>Browser</span>
              <strong>{runResult?.browserName ?? 'Chromium'}</strong>
            </div>
          </div>
          <div className="inspector-card">
            <CheckCircle2 size={16} />
            <div>
              <span>Steps</span>
              <strong>{selectedStepCount}</strong>
            </div>
          </div>
        </div>

        {runResult && (
          <div className={`run-result run-result-${runResult.status}`} aria-label="Run result">
            <div className="run-result-header">
              <StatusBadge tone={runResult.status === 'passed' ? 'success' : 'danger'}>
                {runResult.status}
              </StatusBadge>
              <span>{runResult.durationMs}ms</span>
            </div>

            {runResult.failureScreenshotPath && (
              <p className="run-screenshot">Screenshot: {runResult.failureScreenshotPath}</p>
            )}

            {runResult.stepResults.length > 0 && (
              <div className="run-step-results">
                {runResult.stepResults.map((sr) => (
                  <div key={sr.stepId} className={`run-step run-step-${sr.status}`}>
                    <span>Step {sr.stepIndex + 1}</span>
                    <strong>{sr.label}</strong>
                    <small>{sr.status}</small>
                    {sr.errorMessage && <p>{sr.errorMessage}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </aside>
    </section>
  );

  const renderActiveSection = (): ReactElement | null => {
    if (!currentProject) {
      return null;
    }

    if (activeSection === 'projects') {
      return renderOverview();
    }

    if (activeSection === 'tests') {
      return renderTests();
    }

    if (activeSection === 'recorder') {
      return (
        <RecorderPanel
          projectName={currentProject.metadata.name}
          chromiumStatusMessage={chromiumStatusMessage}
          onRecordingSaved={(steps) => {
            setProjectMessage(`Recording saved: ${steps.length} step${steps.length !== 1 ? 's' : ''}`);
          }}
        />
      );
    }

    return <ReportPanel projectPath={currentProject.projectPath} />;
  };

  return (
    <div className="app-frame">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand-block">
          <div className="brand-mark" aria-hidden="true">
            WT
          </div>
          <div>
            <p className="brand-name">Website Testing Tool</p>
            <p className="brand-context">Local QA workbench</p>
          </div>
        </div>

        <nav className="nav-list">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const disabled = !hasProject && item.id !== 'projects';

            return (
              <button
                aria-current={item.id === activeSection ? 'page' : undefined}
                className="nav-item"
                disabled={disabled}
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                type="button"
              >
                <span className="nav-icon" aria-hidden="true">
                  <Icon size={18} />
                </span>
                <span className="nav-copy">
                  <span className="nav-label">{item.label}</span>
                  <span className="nav-status">{item.status}</span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <span className="status-dot" aria-hidden="true" />
          <span>Local runtime ready</span>
        </div>
      </aside>

      <main className="workspace">
        <header className="workspace-header">
          <div>
            <p className="eyebrow">Website validation</p>
            <h1>{hasProject ? sectionTitles[activeSection] : 'Start a workspace'}</h1>
            <p className="workspace-copy">
              {hasProject
                ? 'Manage local tests, record browser flows, and review results in one trusted workspace.'
                : 'Open or create a local project to keep your tests, artifacts, and results together on disk.'}
            </p>
          </div>
          {hasProject ? (
            <div className="header-actions">
              <button type="button" className="button button-secondary" onClick={handleOpenProject} disabled={projectActionPending}>
                <FolderOpen size={16} />
                Open
              </button>
              <button type="button" className="button button-primary" onClick={handleCreateTest} disabled={!hasProject || testCasePending}>
                <Plus size={16} />
                New test
              </button>
            </div>
          ) : null}
        </header>

        {renderProjectStrip()}
        {renderActiveSection()}
      </main>
    </div>
  );
}
