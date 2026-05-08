import { Copy, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';

import { toTestCaseFileName } from '../../shared/project-schema';
import type {
  BrowserConsoleMessage,
  HttpErrorRecord,
  NetworkFailureRecord,
  PageErrorRecord,
  RunResult,
  StepSnapshot,
  TestCase,
  TestStep
} from '../../shared/project-schema';
import {
  buildFailureSummary,
  formatBrowserEvidenceLocation,
  getFailureScreenshotPath,
  getPrimaryFailureStep,
  getBrowserEvidenceCounts,
  getConsoleMessagesForDisplay,
  getHttpErrorsForDisplay,
  getNetworkFailuresForDisplay,
  getPageErrorStackPreview,
  getPageErrorsForDisplay,
  getStepDefinitionForResult,
  getStepSnapshotForResult,
  hasBrowserEvidence
} from '../../shared/resultDiagnostics';

interface ReportPanelProps {
  readonly projectPath: string;
}

interface DiagnosticFieldProps {
  readonly label: string;
  readonly value: string;
  readonly mono?: boolean;
}

function DiagnosticField({ label, value, mono = false }: DiagnosticFieldProps): ReactElement {
  return (
    <div className="report-diagnostic-field">
      <dt>{label}</dt>
      <dd className={mono ? 'report-mono' : undefined}>{value}</dd>
    </div>
  );
}

function getStepValueLabel(step: TestStep): string {
  if (step.type === 'assertText') {
    return 'Expected value';
  }

  if (step.type === 'fill') {
    return 'Input value';
  }

  return 'Value';
}

function getSnapshotValueLabel(snapshot: StepSnapshot): string {
  if (snapshot.type === 'assertText') {
    return 'Expected value';
  }

  if (snapshot.type === 'fill') {
    return 'Input value';
  }

  return 'Value';
}

function formatEvidenceTimestamp(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString();
}

function getConsoleEvidenceTone(message: BrowserConsoleMessage): 'danger' | 'warning' | 'neutral' {
  const normalizedType = message.type.toLowerCase();

  if (normalizedType === 'error' || normalizedType === 'assert') {
    return 'danger';
  }

  if (normalizedType === 'warning') {
    return 'warning';
  }

  return 'neutral';
}

function getNetworkFailureMessage(networkFailure: NetworkFailureRecord): string {
  return networkFailure.failureText ?? 'Request failed without an error text.';
}

function getHttpErrorTone(httpError: HttpErrorRecord): 'danger' | 'warning' {
  return httpError.status >= 500 ? 'danger' : 'warning';
}

export function ReportPanel({ projectPath }: ReportPanelProps): ReactElement {
  const [results, setResults] = useState<readonly RunResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<RunResult | null>(null);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);
  const [stepContextLoading, setStepContextLoading] = useState(false);
  const [stepContextError, setStepContextError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [exportingReport, setExportingReport] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportedReportPath, setExportedReportPath] = useState<string | null>(null);
  const [reportActionMessage, setReportActionMessage] = useState<string | null>(null);
  const [reportActionError, setReportActionError] = useState<string | null>(null);
  const [openingReport, setOpeningReport] = useState(false);
  const [revealingReport, setRevealingReport] = useState(false);

  const failureStepResult = selectedResult ? getPrimaryFailureStep(selectedResult) : null;
  const failureStepSnapshot = selectedResult ? getStepSnapshotForResult(failureStepResult, selectedResult) : null;
  const failureTestStep = getStepDefinitionForResult(failureStepResult, selectedTestCase?.steps);
  const failureScreenshotPath = selectedResult ? getFailureScreenshotPath(selectedResult, failureStepResult) : null;
  const failureSummary = selectedResult && selectedResult.status !== 'passed'
    ? buildFailureSummary(selectedResult, {
        stepResult: failureStepResult,
        testStep: failureTestStep
      })
    : null;
  const browserEvidenceCounts = selectedResult ? getBrowserEvidenceCounts(selectedResult) : null;
  const browserEvidenceVisible = selectedResult ? hasBrowserEvidence(selectedResult) : false;
  const displayedConsoleMessages = selectedResult ? getConsoleMessagesForDisplay(selectedResult) : [];
  const displayedPageErrors = selectedResult ? getPageErrorsForDisplay(selectedResult) : [];
  const displayedNetworkFailures = selectedResult ? getNetworkFailuresForDisplay(selectedResult) : [];
  const displayedHttpErrors = selectedResult ? getHttpErrorsForDisplay(selectedResult) : [];

  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const result = await window.websiteTestingTool.result.listResults(projectPath);

        if (!cancelled) {
          if (result.ok) {
            setResults(result.results);
          } else {
            setError(result.error);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load results.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [projectPath]);

  useEffect(() => {
    const selectedRun = selectedResult;

    if (!selectedRun || selectedRun.status === 'passed') {
      return;
    }

    // If the run result already has step snapshots, we don't need to load
    // the current test case for context — snapshots are historically accurate.
    if (selectedRun.stepSnapshots && selectedRun.stepSnapshots.length > 0) {
      return;
    }

    let cancelled = false;

    const loadStepContext = async (): Promise<void> => {
      setStepContextLoading(true);
      setStepContextError(null);
      setSelectedTestCase(null);

      try {
        const result = await window.websiteTestingTool.testCase.readTestCase(
          projectPath,
          toTestCaseFileName(selectedRun.testId)
        );

        if (cancelled) {
          return;
        }

        if (result.ok) {
          setSelectedTestCase(result.testCase);
        } else {
          setStepContextError('Saved step details are unavailable for this result.');
        }
      } catch {
        if (!cancelled) {
          setStepContextError('Saved step details are unavailable for this result.');
        }
      } finally {
        if (!cancelled) {
          setStepContextLoading(false);
        }
      }
    };

    void loadStepContext();

    return () => {
      cancelled = true;
    };
  }, [projectPath, selectedResult]);

  useEffect(() => {
    if (!failureScreenshotPath) {
      return;
    }

    let cancelled = false;

    const loadPreview = async (): Promise<void> => {
      setPreviewLoading(true);
      setPreviewError(null);
      setPreviewSrc(null);

      try {
        const result = await window.websiteTestingTool.result.readFailureScreenshot(
          projectPath,
          failureScreenshotPath
        );

        if (cancelled) {
          return;
        }

        if (result.ok) {
          setPreviewSrc(result.dataUrl);
        } else {
          setPreviewError(result.error);
        }
      } catch (err) {
        if (!cancelled) {
          setPreviewError(err instanceof Error ? err.message : 'Failed to load failure screenshot preview.');
        }
      } finally {
        if (!cancelled) {
          setPreviewLoading(false);
        }
      }
    };

    void loadPreview();

    return () => {
      cancelled = true;
    };
  }, [failureScreenshotPath, projectPath, selectedResult?.runId]);

  const handleSelectResult = (result: RunResult): void => {
    setSelectedResult(result);
    setSelectedTestCase(null);
    setStepContextLoading(false);
    setStepContextError(null);
    setPreviewLoading(false);
    setPreviewError(null);
    setPreviewSrc(null);
    setCopyMessage(null);
    setCopyError(null);
    setExportingReport(false);
    setExportMessage(null);
    setExportError(null);
    setExportedReportPath(null);
    setReportActionMessage(null);
    setReportActionError(null);
    setOpeningReport(false);
    setRevealingReport(false);
  };

  const handleCopyFailureSummary = async (): Promise<void> => {
    if (!failureSummary) {
      return;
    }

    setCopyMessage(null);
    setCopyError(null);

    if (typeof navigator.clipboard?.writeText !== 'function') {
      setCopyError('Clipboard copy is unavailable in this app session.');
      return;
    }

    try {
      await navigator.clipboard.writeText(failureSummary);
      setCopyMessage('Failure summary copied.');
    } catch {
      setCopyError('Could not copy the failure summary. Try copying the visible details manually.');
    }
  };

  const handleExportHtmlReport = async (): Promise<void> => {
    if (!selectedResult) {
      return;
    }

    setExportingReport(true);
    setExportMessage(null);
    setExportError(null);
    setReportActionMessage(null);
    setReportActionError(null);
    setExportedReportPath(null);

    try {
      const result = await window.websiteTestingTool.result.exportRunHtmlReport(projectPath, selectedResult.runId);

      if (result.ok) {
        setExportedReportPath(result.reportPath);
        setExportMessage(`HTML report exported to ${result.reportPath}.`);
      } else {
        setExportError(result.error);
      }
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'HTML report export failed.');
    } finally {
      setExportingReport(false);
    }
  };

  const handleOpenExportedReport = async (): Promise<void> => {
    if (!selectedResult || !exportedReportPath) {
      return;
    }

    setOpeningReport(true);
    setReportActionMessage(null);
    setReportActionError(null);

    try {
      const result = await window.websiteTestingTool.result.openExportedReport(projectPath, exportedReportPath);

      if (result.ok) {
        setReportActionMessage('Report opened successfully.');
      } else {
        setReportActionError(result.error);
      }
    } catch (error) {
      setReportActionError(error instanceof Error ? error.message : 'Could not open the report.');
    } finally {
      setOpeningReport(false);
    }
  };

  const handleRevealExportedReport = async (): Promise<void> => {
    if (!selectedResult || !exportedReportPath) {
      return;
    }

    setRevealingReport(true);
    setReportActionMessage(null);
    setReportActionError(null);

    try {
      const result = await window.websiteTestingTool.result.revealExportedReport(projectPath, exportedReportPath);

      if (result.ok) {
        setReportActionMessage('Report revealed in folder.');
      } else {
        setReportActionError(result.error);
      }
    } catch (error) {
      setReportActionError(error instanceof Error ? error.message : 'Could not reveal the report.');
    } finally {
      setRevealingReport(false);
    }
  };

  return (
    <section className="report-panel" aria-label="Run results">
      <div className="report-header">
        <h2>Results</h2>
        <span className="report-count">
          {loading ? 'Loading…' : `${results.length} run${results.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      {error && (
        <p className="notice notice-error">{error}</p>
      )}

      {!loading && results.length === 0 && !error && (
        <p className="report-empty">
          No run results yet. Run a test to see results here.
        </p>
      )}

      {results.length > 0 && (
        <div className="report-list">
          {results.map((result) => (
            <button
              key={result.runId}
              type="button"
              className={`report-item ${selectedResult?.runId === result.runId ? 'selected' : ''}`}
              onClick={() => handleSelectResult(result)}
            >
              <span className={`report-item-badge report-item-badge-${result.status}`}>
                {result.status.toUpperCase()}
              </span>
              <span className="report-item-name">{result.testName}</span>
              <span className="report-item-meta">
                {result.browserName} · {result.durationMs}ms
              </span>
              <span className="report-item-date">
                {new Date(result.startedAt).toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      )}

      {selectedResult && (
        <div className="report-detail" aria-label="Run result detail">
          <div className="report-detail-header">
            <h3>{selectedResult.testName}</h3>
            <div className="report-detail-actions">
              <button
                type="button"
                className="button button-secondary compact-button"
                disabled={exportingReport}
                onClick={() => {
                  void handleExportHtmlReport();
                }}
              >
                <FileText size={15} />
                {exportingReport ? 'Exporting…' : 'Export HTML report'}
              </button>
            </div>
          </div>

          {(exportMessage || exportError) && (
            <div className="report-export-section">
              <p className={exportError ? 'notice notice-error report-export-notice' : 'notice report-export-notice'}>
                {exportError ?? exportMessage}
              </p>

              {exportedReportPath && !exportError && (
                <div className="report-export-actions">
                  <button
                    type="button"
                    className="inline-action"
                    disabled={openingReport}
                    onClick={() => {
                      void handleOpenExportedReport();
                    }}
                  >
                    {openingReport ? 'Opening…' : 'Open report'}
                  </button>
                  <button
                    type="button"
                    className="inline-action"
                    disabled={revealingReport}
                    onClick={() => {
                      void handleRevealExportedReport();
                    }}
                  >
                    {revealingReport ? 'Revealing…' : 'Reveal in folder'}
                  </button>
                </div>
              )}

              {(reportActionMessage || reportActionError) && (
                <p
                  className={
                    reportActionError
                      ? 'notice notice-error report-export-notice'
                      : 'notice report-export-notice'
                  }
                >
                  {reportActionError ?? reportActionMessage}
                </p>
              )}
            </div>
          )}

          <dl className="report-metadata">
            <div>
              <dt>Status</dt>
              <dd>
                <span className={`report-badge report-badge-${selectedResult.status}`}>
                  {selectedResult.status.toUpperCase()}
                </span>
              </dd>
            </div>
            <div>
              <dt>Browser</dt>
              <dd>{selectedResult.browserName}</dd>
            </div>
            <div>
              <dt>Duration</dt>
              <dd>{selectedResult.durationMs}ms</dd>
            </div>
            <div>
              <dt>Started</dt>
              <dd>{new Date(selectedResult.startedAt).toLocaleString()}</dd>
            </div>
            <div>
              <dt>Finished</dt>
              <dd>{new Date(selectedResult.finishedAt).toLocaleString()}</dd>
            </div>
            <div>
              <dt>Run ID</dt>
              <dd className="report-mono">{selectedResult.runId}</dd>
            </div>
          </dl>

          {selectedResult.status !== 'passed' && (
            <section className="report-failure-card" aria-label="Failure summary">
              <div className="report-failure-card-header">
                <div>
                  <p className="eyebrow">Failure summary</p>
                  <h4>What failed, where, and what evidence exists?</h4>
                </div>
                <button
                  type="button"
                  className="button button-secondary compact-button"
                  disabled={stepContextLoading || !failureSummary}
                  onClick={() => {
                    void handleCopyFailureSummary();
                  }}
                >
                  <Copy size={15} />
                  Copy failure summary
                </button>
              </div>

              {(copyMessage || copyError) && (
                <p className={copyError ? 'notice notice-error report-copy-notice' : 'notice report-copy-notice'}>
                  {copyError ?? copyMessage}
                </p>
              )}

              <div className="report-failure-sections">
                <section className="report-failure-section" aria-label="What failed">
                  <h5>What failed?</h5>
                  <dl className="report-diagnostic-grid">
                    <DiagnosticField
                      label="Step"
                      value={failureStepResult ? `Step ${failureStepResult.stepIndex + 1}` : 'Not recorded'}
                    />
                    <DiagnosticField
                      label="Label"
                      value={failureStepResult?.label ?? 'Not recorded'}
                    />
                    <DiagnosticField
                      label="Type"
                      value={failureStepResult?.type ?? 'Not recorded'}
                    />
                  </dl>
                  {!failureStepResult && (
                    <p className="report-diagnostic-note">
                      This run stopped before a failed step result was recorded.
                    </p>
                  )}
                </section>

                <section className="report-failure-section" aria-label="Where it failed">
                  <h5>Where did it fail?</h5>
                  {failureStepSnapshot && (
                    <>
                      <p className="report-diagnostic-note report-diagnostic-note-snapshot">
                        Captured at run time
                      </p>
                      <dl className="report-diagnostic-grid">
                        <DiagnosticField
                          label="Target"
                          value={failureStepSnapshot.target ?? 'Not recorded'}
                          mono={Boolean(failureStepSnapshot.target)}
                        />
                        {failureStepSnapshot.value && (
                          <DiagnosticField
                            label={getSnapshotValueLabel(failureStepSnapshot)}
                            value={failureStepSnapshot.value}
                          />
                        )}
                        {typeof failureStepSnapshot.timeoutMs === 'number' && (
                          <DiagnosticField
                            label="Timeout"
                            value={`${failureStepSnapshot.timeoutMs}ms`}
                          />
                        )}
                      </dl>
                    </>
                  )}
                  {!failureStepSnapshot && stepContextLoading && (
                    <p className="report-diagnostic-note">Loading saved step details…</p>
                  )}
                  {!failureStepSnapshot && !stepContextLoading && stepContextError && (
                    <p className="report-diagnostic-note report-diagnostic-note-error">{stepContextError}</p>
                  )}
                  {!failureStepSnapshot && !stepContextLoading && !stepContextError && failureTestStep && (
                    <dl className="report-diagnostic-grid">
                      <DiagnosticField
                        label="Target"
                        value={failureTestStep.target ?? 'Not recorded'}
                        mono={Boolean(failureTestStep.target)}
                      />
                      {failureTestStep.value && (
                        <DiagnosticField
                          label={getStepValueLabel(failureTestStep)}
                          value={failureTestStep.value}
                        />
                      )}
                      {typeof failureTestStep.timeoutMs === 'number' && (
                        <DiagnosticField
                          label="Timeout"
                          value={`${failureTestStep.timeoutMs}ms`}
                        />
                      )}
                    </dl>
                  )}
                  {!failureStepSnapshot && !stepContextLoading && !stepContextError && !failureTestStep && failureStepResult && (
                    <p className="report-diagnostic-note">
                      Saved target and timeout details are unavailable for this result.
                    </p>
                  )}
                </section>

                <section className="report-failure-section" aria-label="Failure evidence">
                  <h5>What evidence exists?</h5>
                  <div className="report-diagnostic-evidence">
                    <div className="report-diagnostic-field report-diagnostic-field-full">
                      <dt>Error</dt>
                      <dd>
                        {failureStepResult?.errorMessage ??
                          'No detailed error message was recorded for this run.'}
                      </dd>
                    </div>
                    {failureScreenshotPath && (
                      <div className="report-diagnostic-field report-diagnostic-field-full">
                        <dt>Screenshot path</dt>
                        <dd className="report-mono">{failureScreenshotPath}</dd>
                        <div className="report-screenshot-preview" aria-live="polite">
                          {previewLoading && (
                            <p className="report-screenshot-status">Loading preview…</p>
                          )}
                          {!previewLoading && previewError && (
                            <p className="report-screenshot-error">{previewError}</p>
                          )}
                          {!previewLoading && !previewError && previewSrc && (
                            <img
                              className="report-screenshot-image"
                              src={previewSrc}
                              alt={`Failure screenshot for ${selectedResult.testName}`}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </section>
          )}

          {browserEvidenceVisible && browserEvidenceCounts && (
            <section className="report-browser-evidence" aria-label="Browser evidence">
              <div className="report-browser-evidence-header">
                <div>
                  <p className="eyebrow">Browser evidence</p>
                  <h4>Console, page, and network signals captured during the run</h4>
                </div>
              </div>

              <div className="report-browser-evidence-counts" aria-label="Browser evidence counts">
                <div className="report-browser-evidence-count">
                  <span className="report-browser-evidence-count-value">
                    {browserEvidenceCounts.consoleMessages}
                  </span>
                  <span className="report-browser-evidence-count-label">Console messages</span>
                </div>
                <div className="report-browser-evidence-count">
                  <span className="report-browser-evidence-count-value">
                    {browserEvidenceCounts.consoleWarningsOrErrors}
                  </span>
                  <span className="report-browser-evidence-count-label">Warnings/errors</span>
                </div>
                <div className="report-browser-evidence-count">
                  <span className="report-browser-evidence-count-value">
                    {browserEvidenceCounts.pageErrors}
                  </span>
                  <span className="report-browser-evidence-count-label">Page errors</span>
                </div>
                <div className="report-browser-evidence-count">
                  <span className="report-browser-evidence-count-value">
                    {browserEvidenceCounts.networkFailures}
                  </span>
                  <span className="report-browser-evidence-count-label">Network failures</span>
                </div>
                <div className="report-browser-evidence-count">
                  <span className="report-browser-evidence-count-value">
                    {browserEvidenceCounts.httpErrors}
                  </span>
                  <span className="report-browser-evidence-count-label">HTTP errors</span>
                </div>
              </div>

              {displayedConsoleMessages.length > 0 && (
                <section className="report-browser-evidence-block" aria-label="Console messages">
                  <div className="report-browser-evidence-block-header">
                    <h5>Console messages</h5>
                    <span className="report-browser-evidence-note">
                      {browserEvidenceCounts.consoleWarningsOrErrors > 0
                        ? 'Latest warnings and errors'
                        : 'Latest messages'}
                    </span>
                  </div>
                  <div className="report-browser-evidence-list">
                    {displayedConsoleMessages.map((message, index) => {
                      const location = formatBrowserEvidenceLocation(message.location);

                      return (
                        <article
                          key={`${message.timestamp}-${message.type}-${index}`}
                          className="report-browser-evidence-entry"
                        >
                          <div className="report-browser-evidence-entry-header">
                            <span
                              className={
                                `report-browser-evidence-badge ` +
                                `report-browser-evidence-badge-${getConsoleEvidenceTone(message)}`
                              }
                            >
                              {message.type}
                            </span>
                            <span className="report-browser-evidence-meta">
                              {formatEvidenceTimestamp(message.timestamp)}
                            </span>
                            {typeof message.relatedStepIndex === 'number' && (
                              <span className="report-browser-evidence-meta">
                                Step {message.relatedStepIndex + 1}
                              </span>
                            )}
                          </div>
                          <p className="report-browser-evidence-text">{message.text}</p>
                          {location && (
                            <p className="report-browser-evidence-location report-mono">{location}</p>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </section>
              )}

              {displayedPageErrors.length > 0 && (
                <section className="report-browser-evidence-block" aria-label="Page errors">
                  <div className="report-browser-evidence-block-header">
                    <h5>Page errors</h5>
                    <span className="report-browser-evidence-note">Latest errors</span>
                  </div>
                  <div className="report-browser-evidence-list">
                    {displayedPageErrors.map((pageError: PageErrorRecord, index) => {
                      const stackPreview = getPageErrorStackPreview(pageError);

                      return (
                        <article
                          key={`${pageError.timestamp}-${pageError.message}-${index}`}
                          className="report-browser-evidence-entry report-browser-evidence-entry-danger"
                        >
                          <div className="report-browser-evidence-entry-header">
                            <span className="report-browser-evidence-badge report-browser-evidence-badge-danger">
                              page error
                            </span>
                            <span className="report-browser-evidence-meta">
                              {formatEvidenceTimestamp(pageError.timestamp)}
                            </span>
                            {typeof pageError.relatedStepIndex === 'number' && (
                              <span className="report-browser-evidence-meta">
                                Step {pageError.relatedStepIndex + 1}
                              </span>
                            )}
                          </div>
                          <p className="report-browser-evidence-text">{pageError.message}</p>
                          {(pageError.name || stackPreview) && (
                            <p className="report-browser-evidence-location report-mono">
                              {pageError.name ?? 'Error'}
                              {stackPreview ? ` - ${stackPreview}` : ''}
                            </p>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </section>
              )}

              {displayedNetworkFailures.length > 0 && (
                <section className="report-browser-evidence-block" aria-label="Network failures">
                  <div className="report-browser-evidence-block-header">
                    <h5>Network failures</h5>
                    <span className="report-browser-evidence-note">Latest failed requests</span>
                  </div>
                  <div className="report-browser-evidence-list">
                    {displayedNetworkFailures.map((networkFailure: NetworkFailureRecord, index) => (
                      <article
                        key={`${networkFailure.timestamp}-${networkFailure.url}-${index}`}
                        className="report-browser-evidence-entry report-browser-evidence-entry-warning"
                      >
                        <div className="report-browser-evidence-entry-header">
                          <span className="report-browser-evidence-badge report-browser-evidence-badge-warning">
                            request failed
                          </span>
                          <span className="report-browser-evidence-meta">
                            {formatEvidenceTimestamp(networkFailure.timestamp)}
                          </span>
                          {typeof networkFailure.relatedStepIndex === 'number' && (
                            <span className="report-browser-evidence-meta">
                              Step {networkFailure.relatedStepIndex + 1}
                            </span>
                          )}
                          {networkFailure.method && (
                            <span className="report-browser-evidence-meta">{networkFailure.method}</span>
                          )}
                          {networkFailure.resourceType && (
                            <span className="report-browser-evidence-meta">{networkFailure.resourceType}</span>
                          )}
                          {typeof networkFailure.status === 'number' && (
                            <span className="report-browser-evidence-meta">HTTP {networkFailure.status}</span>
                          )}
                        </div>
                        <p className="report-browser-evidence-text">
                          {getNetworkFailureMessage(networkFailure)}
                        </p>
                        <p className="report-browser-evidence-location report-mono">
                          {networkFailure.url}
                        </p>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {displayedHttpErrors.length > 0 && (
                <section className="report-browser-evidence-block" aria-label="HTTP errors">
                  <div className="report-browser-evidence-block-header">
                    <h5>HTTP errors</h5>
                    <span className="report-browser-evidence-note">Latest 4xx and 5xx responses</span>
                  </div>
                  <div className="report-browser-evidence-list">
                    {displayedHttpErrors.map((httpError: HttpErrorRecord, index) => (
                      <article
                        key={`${httpError.timestamp}-${httpError.url}-${httpError.status}-${index}`}
                        className={
                          `report-browser-evidence-entry ` +
                          `report-browser-evidence-entry-${getHttpErrorTone(httpError)}`
                        }
                      >
                        <div className="report-browser-evidence-entry-header">
                          <span
                            className={
                              `report-browser-evidence-badge ` +
                              `report-browser-evidence-badge-${getHttpErrorTone(httpError)}`
                            }
                          >
                            http {httpError.status}
                          </span>
                          <span className="report-browser-evidence-meta">
                            {formatEvidenceTimestamp(httpError.timestamp)}
                          </span>
                          {typeof httpError.relatedStepIndex === 'number' && (
                            <span className="report-browser-evidence-meta">
                              Step {httpError.relatedStepIndex + 1}
                            </span>
                          )}
                          {httpError.method && (
                            <span className="report-browser-evidence-meta">{httpError.method}</span>
                          )}
                          {httpError.resourceType && (
                            <span className="report-browser-evidence-meta">{httpError.resourceType}</span>
                          )}
                        </div>
                        <p className="report-browser-evidence-text">
                          {httpError.statusText ?? `HTTP ${httpError.status} response`}
                        </p>
                        <p className="report-browser-evidence-location report-mono">
                          {httpError.url}
                        </p>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </section>
          )}

          {selectedResult.stepResults.length > 0 && (
            <div className="report-steps">
              <h4>Steps</h4>
              {selectedResult.stepResults.map((sr) => (
                <div key={sr.stepId} className={`report-step report-step-${sr.status}`}>
                  <div className="report-step-header">
                    <span className="report-step-index">Step {sr.stepIndex + 1}</span>
                    <span className={`report-step-badge report-step-badge-${sr.status}`}>
                      {sr.status}
                    </span>
                    <span className="report-step-duration">{sr.durationMs}ms</span>
                  </div>
                  <p className="report-step-label">{sr.label}</p>
                  {sr.errorMessage && (
                    <p className="report-step-error">{sr.errorMessage}</p>
                  )}
                  {sr.screenshotPath && (
                    <p className="report-step-screenshot report-mono">
                      Screenshot: {sr.screenshotPath}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
