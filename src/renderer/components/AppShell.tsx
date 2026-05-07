import { useCallback, useEffect, useState } from 'react';
import type { ChangeEvent, ReactElement } from 'react';

import type { OpenedProject, ProjectActionResult, TestCaseListItem } from '../../shared/preload-api';
import type { RunResult, TestCase } from '../../shared/project-schema';
import { toTestCaseFileName } from '../../shared/project-schema';
import { navigationItems, workspaceCards } from '../shellModel';
import { RecorderPanel } from './RecorderPanel';
import { ReportPanel } from './ReportPanel';
import { StepEditor } from './StepEditor';

interface AppShellProps {
  readonly platform: string;
}

export function AppShell({ platform }: AppShellProps): ReactElement {
  const activeItem = navigationItems[0];
  const [projectName, setProjectName] = useState('Website Test Project');
  const [currentProject, setCurrentProject] = useState<OpenedProject | null>(null);
  const [projectMessage, setProjectMessage] = useState<string | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [projectActionPending, setProjectActionPending] = useState(false);

  // Test case state
  const [testCases, setTestCases] = useState<readonly TestCaseListItem[]>([]);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);
  const [testCaseError, setTestCaseError] = useState<string | null>(null);
  const [testCasePending, setTestCasePending] = useState(false);

  // Runner state
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [runPending, setRunPending] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);

  const handleProjectNameChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setProjectName(event.target.value);
  };

  const handleCreateProject = async (): Promise<void> => {
    await runProjectAction(() => window.websiteTestingTool.project.createProject({ name: projectName }));
  };

  const handleOpenProject = async (): Promise<void> => {
    await runProjectAction(() => window.websiteTestingTool.project.openProject());
  };

  const runProjectAction = async (action: () => Promise<ProjectActionResult>): Promise<void> => {
    setProjectActionPending(true);
    setProjectMessage(null);
    setProjectError(null);

    try {
      const result = await action();

      if (result.ok) {
        setCurrentProject(result.project);
        setProjectName(result.project.metadata.name);
        setProjectMessage(`Project open: ${result.project.metadata.name}`);
        setSelectedTestCase(null);
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

  // Load test cases when project changes
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
        // Silently handle - project may not have tests dir yet
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [currentProject]);

  const handleCreateSampleTest = async (): Promise<void> => {
    if (!currentProject) {
      return;
    }

    setTestCasePending(true);
    setTestCaseError(null);

    try {
      const result = await window.websiteTestingTool.testCase.createTestCase(
        currentProject.projectPath,
        'Sample test',
        'A sample test case with placeholder steps.'
      );

      if (result.ok) {
        // Reload the list
        const listResult = await window.websiteTestingTool.testCase.listTestCases(currentProject.projectPath);

        if (listResult.ok) {
          setTestCases(listResult.items);
        }

        setSelectedTestCase(result.testCase);
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

  const handleSelectTestCase = useCallback(
    async (fileName: string): Promise<void> => {
      if (!currentProject) {
        return;
      }

      setTestCasePending(true);
      setTestCaseError(null);
      setRunResult(null);
      setRunError(null);

      try {
        const result = await window.websiteTestingTool.testCase.readTestCase(currentProject.projectPath, fileName);

        if (result.ok) {
          setSelectedTestCase(result.testCase);
        } else {
          setTestCaseError(result.error);
        }
      } catch (error) {
        setTestCaseError(error instanceof Error ? error.message : 'Failed to read test.');
      } finally {
        setTestCasePending(false);
      }
    },
    [currentProject]
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

  return (
    <div className="app-frame">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand-block">
          <div className="brand-mark" aria-hidden="true">
            WT
          </div>
          <div>
            <p className="brand-name">Website Testing Tool</p>
            <p className="brand-context">Local workspace</p>
          </div>
        </div>

        <nav className="nav-list">
          {navigationItems.map((item) => (
            <button
              aria-current={item.id === activeItem.id ? 'page' : undefined}
              className="nav-item"
              key={item.id}
              type="button"
            >
              <span className="nav-icon" aria-hidden="true">
                {item.shortLabel}
              </span>
              <span>
                <span className="nav-label">{item.label}</span>
                <span className="nav-status">{item.status}</span>
              </span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="status-dot" aria-hidden="true" />
          <span>Desktop shell ready</span>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Local desktop</p>
            <h1>Workspace</h1>
          </div>
          <dl className="environment-strip" aria-label="Runtime">
            <div>
              <dt>Stack</dt>
              <dd>Electron + React</dd>
            </div>
            <div>
              <dt>Platform</dt>
              <dd>{platform}</dd>
            </div>
          </dl>
        </header>

        <section className="empty-state" aria-labelledby="empty-state-title">
          <div>
            <p className="eyebrow">Workspace</p>
            <h2 id="empty-state-title">
              {currentProject ? currentProject.metadata.name : 'No project open'}
            </h2>
            <p>
              {currentProject
                ? currentProject.projectPath
                : 'Create a local project or open a folder that contains project.json.'}
            </p>
          </div>
          <div className="empty-state-actions" aria-label="Project actions">
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
              disabled={projectActionPending || projectName.trim().length === 0}
              onClick={handleCreateProject}
            >
              Create local project
            </button>
            <button type="button" disabled={projectActionPending} onClick={handleOpenProject}>
              Open project
            </button>
          </div>
          {(projectMessage || projectError) && (
            <p className={projectError ? 'project-status error' : 'project-status'}>
              {projectError ?? projectMessage}
            </p>
          )}
        </section>

        {currentProject && (
          <section className="test-case-section" aria-label="Test cases">
            <div className="test-case-header">
              <h2>Saved Tests</h2>
              <button
                type="button"
                disabled={testCasePending}
                onClick={handleCreateSampleTest}
                className="create-test-button"
              >
                New test
              </button>
            </div>

            {testCaseError && (
              <p className="project-status error">{testCaseError}</p>
            )}

            {testCases.length === 0 && !testCasePending && (
              <p className="test-case-empty">
                No saved tests yet. Create a new test to get started.
              </p>
            )}

            {testCases.length > 0 && (
              <div className="test-case-list">
                {testCases.map((item) => (
                  <button
                    key={item.testId}
                    type="button"
                    className={`test-case-item ${selectedTestCase?.testId === item.testId ? 'selected' : ''}`}
                    onClick={() => {
                      void handleSelectTestCase(toTestCaseFileName(item.testId));
                    }}
                  >
                    <span className="test-case-name">{item.name}</span>
                    <span className="test-case-date">
                      Updated: {new Date(item.updatedAt).toLocaleDateString()}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {selectedTestCase && (
              <article className="test-case-detail" aria-label="Test case detail">
                <h3>{selectedTestCase.name}</h3>
                <dl className="test-case-metadata">
                  <div>
                    <dt>Test ID</dt>
                    <dd>{selectedTestCase.testId}</dd>
                  </div>
                  <div>
                    <dt>Description</dt>
                    <dd>{selectedTestCase.description || '(none)'}</dd>
                  </div>
                  <div>
                    <dt>Steps</dt>
                    <dd>{selectedTestCase.steps.length}</dd>
                  </div>
                  <div>
                    <dt>Created</dt>
                    <dd>{new Date(selectedTestCase.createdAt).toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt>Updated</dt>
                    <dd>{new Date(selectedTestCase.updatedAt).toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt>Schema version</dt>
                    <dd>{selectedTestCase.schemaVersion}</dd>
                  </div>
                </dl>

                <div className="run-actions">
                  <button
                    type="button"
                    className="run-test-button"
                    disabled={runPending || selectedTestCase.steps.length === 0}
                    onClick={handleRunTest}
                  >
                    {runPending ? 'Running…' : 'Run test'}
                  </button>
                </div>

                {runError && (
                  <p className="project-status error">{runError}</p>
                )}

                {runResult && (
                  <div className={`run-result run-result-${runResult.status}`} aria-label="Run result">
                    <div className="run-result-header">
                      <span className={`run-badge run-badge-${runResult.status}`}>
                        {runResult.status.toUpperCase()}
                      </span>
                      <span className="run-duration">
                        {runResult.durationMs}ms
                      </span>
                    </div>

                    {runResult.failureScreenshotPath && (
                      <p className="run-screenshot">
                        Screenshot: {runResult.failureScreenshotPath}
                      </p>
                    )}

                    {runResult.stepResults.length > 0 && (
                      <div className="run-step-results">
                        {runResult.stepResults.map((sr) => (
                          <div key={sr.stepId} className={`run-step run-step-${sr.status}`}>
                            <span className="run-step-label">
                              Step {sr.stepIndex + 1}: {sr.label}
                            </span>
                            <span className={`run-step-status run-step-status-${sr.status}`}>
                              {sr.status}
                            </span>
                            {sr.errorMessage && (
                              <p className="run-step-error">{sr.errorMessage}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <StepEditor
                  testCase={selectedTestCase}
                  projectPath={currentProject.projectPath}
                  onSaved={(updated) => {
                    setSelectedTestCase(updated);
                    setProjectMessage(`Test saved: ${updated.name}`);
                  }}
                  onError={(message) => {
                    setTestCaseError(message);
                  }}
                />
              </article>
            )}
          </section>
        )}

        {currentProject && (
          <RecorderPanel
            projectName={currentProject.metadata.name}
            onRecordingSaved={(steps) => {
              setProjectMessage(`Recording saved: ${steps.length} step${steps.length !== 1 ? 's' : ''}`);
            }}
          />
        )}

        {currentProject && (
          <ReportPanel projectPath={currentProject.projectPath} />
        )}

        <section className="card-grid" aria-label="Workspace areas">
          {workspaceCards.map((card) => (
            <article className="workspace-card" key={card.id}>
              <div className="card-header">
                <span className="card-icon" aria-hidden="true">
                  {card.shortLabel}
                </span>
                <span className="card-status">{card.status}</span>
              </div>
              <h2>{card.title}</h2>
              <p>{card.description}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
