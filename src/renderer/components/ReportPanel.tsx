import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';

import type { RunResult } from '../../shared/project-schema';

interface ReportPanelProps {
  readonly projectPath: string;
}

export function ReportPanel({ projectPath }: ReportPanelProps): ReactElement {
  const [results, setResults] = useState<readonly RunResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<RunResult | null>(null);

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

  const handleSelectResult = (result: RunResult): void => {
    setSelectedResult(result);
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
          <h3>{selectedResult.testName}</h3>

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

          {selectedResult.failureScreenshotPath && (
            <div className="report-screenshot-info">
              <dt>Screenshot</dt>
              <dd className="report-mono">{selectedResult.failureScreenshotPath}</dd>
            </div>
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
