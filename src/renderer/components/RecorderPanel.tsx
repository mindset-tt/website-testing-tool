import { useState } from 'react';
import type { ReactElement } from 'react';
import { CircleDot, Radio } from 'lucide-react';

import type { TestStep } from '../../shared/project-schema';

interface RecorderPanelProps {
  readonly projectName: string;
  readonly chromiumStatusMessage?: string | null;
  readonly onRecordingSaved: (steps: readonly TestStep[]) => void;
}

export function RecorderPanel({
  projectName,
  chromiumStatusMessage,
  onRecordingSaved
}: RecorderPanelProps): ReactElement {
  const [recording, setRecording] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordedSteps, setRecordedSteps] = useState<readonly TestStep[]>([]);

  const handleStartRecording = async (): Promise<void> => {
    setPending(true);
    setError(null);

    try {
      const result = await window.websiteTestingTool.recorder.startRecording();

      if (result.ok) {
        setRecording(true);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording.');
    } finally {
      setPending(false);
    }
  };

  const handleStopRecording = async (): Promise<void> => {
    setPending(true);
    setError(null);

    try {
      const result = await window.websiteTestingTool.recorder.stopRecording();

      if (result.ok) {
        setRecording(false);
        setRecordedSteps(result.steps);
        onRecordingSaved(result.steps);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setRecording(false);
      setError(err instanceof Error ? err.message : 'Failed to stop recording.');
    } finally {
      setPending(false);
    }
  };

  const statusClass = recording ? 'recording' : 'idle';
  const statusText = recording ? 'Recording' : 'Ready';
  const showChromiumStatusMessage = !error && !recording && recordedSteps.length === 0 && chromiumStatusMessage;

  return (
    <section className="recorder-panel" aria-label="Recorder">
      <div className="recorder-header">
        <div>
          <h2>Recorder</h2>
          <p className="recorder-project-label">Project: {projectName}</p>
        </div>
        <div className="recorder-status-row">
          <span
            className={`recorder-status-dot recorder-status-${statusClass}`}
            aria-hidden="true"
          />
          <span className="recorder-status-text">{statusText}</span>
        </div>
      </div>

      <div className="recorder-viewport" aria-label="Browser viewport">
        <div className="recorder-toolbar">
          <div className="recorder-url-bar">
            <span className="recorder-url-icon" aria-hidden="true" />
            <span className="recorder-url-text">
              {recording ? 'Recording browser actions…' : 'https://'}
            </span>
          </div>
          <div className="recorder-toolbar-actions">
            {!recording ? (
              <button
                type="button"
                className="recorder-action-button"
                disabled={pending}
                onClick={handleStartRecording}
              >
                {pending ? 'Starting…' : 'Start Recording'}
              </button>
            ) : (
              <button
                type="button"
                className="recorder-action-button recorder-stop-button"
                disabled={pending}
                onClick={handleStopRecording}
              >
                {pending ? 'Stopping…' : 'Stop Recording'}
              </button>
            )}
          </div>
        </div>

        <div className="recorder-canvas">
          {!recording && recordedSteps.length === 0 && (
            <div className="recorder-placeholder">
              <div className="recorder-placeholder-icon" aria-hidden="true">
                <CircleDot size={28} strokeWidth={1.8} />
              </div>
              <p className="recorder-placeholder-title">Browser session</p>
              <p className="recorder-placeholder-text">Idle. No capture is active.</p>
            </div>
          )}

          {recording && (
            <div className="recorder-placeholder">
              <div className="recorder-placeholder-icon recorder-pulse" aria-hidden="true">
                <Radio size={28} strokeWidth={1.8} />
              </div>
              <p className="recorder-placeholder-title">Capture active</p>
              <p className="recorder-placeholder-text">Browser actions are being recorded.</p>
            </div>
          )}

          {!recording && recordedSteps.length > 0 && (
            <div className="recorder-steps-preview">
              <p className="recorder-steps-title">
                Recorded {recordedSteps.length} step{recordedSteps.length !== 1 ? 's' : ''}
              </p>
              <ul className="recorder-steps-list">
                {recordedSteps.map((step, i) => (
                  <li key={step.stepId} className="recorder-step-item">
                    <span className="recorder-step-index">{i + 1}.</span>
                    <span className="recorder-step-type-badge">{step.type}</span>
                    <span className="recorder-step-label">{step.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="recorder-footer recorder-footer-error">
          <span className="recorder-footer-text">{error}</span>
        </div>
      )}

      {showChromiumStatusMessage && (
        <div className="recorder-footer recorder-footer-error">
          <span className="recorder-footer-text">{chromiumStatusMessage}</span>
        </div>
      )}

      {!error && !showChromiumStatusMessage && (
        <div className="recorder-footer">
          <span className="recorder-footer-text">
            {recording
              ? 'Recording browser actions.'
              : recordedSteps.length > 0
                ? 'Captured steps are ready for review.'
                : 'Recorder idle.'}
          </span>
        </div>
      )}
    </section>
  );
}
