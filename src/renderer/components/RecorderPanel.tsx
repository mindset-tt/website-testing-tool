import { useState } from 'react';
import type { ReactElement } from 'react';
import { CircleDot, FilePlus, ListPlus, Radio, RefreshCw } from 'lucide-react';

import type { TestStep } from '../../shared/project-schema';
import type { SelectorConfidence } from '../../shared/selectorGeneration';

interface RecorderPanelProps {
  readonly projectName: string;
  readonly chromiumStatusMessage?: string | null;
  readonly selectedTestName?: string | null;
  readonly hasSelectedTest: boolean;
  readonly onRecordingSaved: (steps: readonly TestStep[]) => void;
  readonly onSaveAsNewTest: (steps: readonly TestStep[]) => Promise<void>;
  readonly onAppendToTest: (steps: readonly TestStep[]) => Promise<void>;
  readonly onReplaceTestSteps: (steps: readonly TestStep[]) => Promise<void>;
}

function confidenceLabel(confidence: SelectorConfidence): string {
  if (confidence === 'high') return 'High';
  if (confidence === 'medium') return 'Medium';

  return 'Low';
}

export function RecorderPanel({
  projectName,
  chromiumStatusMessage,
  selectedTestName,
  hasSelectedTest,
  onRecordingSaved,
  onSaveAsNewTest,
  onAppendToTest,
  onReplaceTestSteps
}: RecorderPanelProps): ReactElement {
  const [recording, setRecording] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordedSteps, setRecordedSteps] = useState<readonly TestStep[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmReplace, setConfirmReplace] = useState(false);

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

  const handleSaveAsNewTest = async (): Promise<void> => {
    setSaving(true);
    setSaveMessage(null);
    setSaveError(null);

    try {
      await onSaveAsNewTest(recordedSteps);
      setSaveMessage('Saved as new test.');
      setRecordedSteps([]);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save as new test.');
    } finally {
      setSaving(false);
    }
  };

  const handleAppendToTest = async (): Promise<void> => {
    setSaving(true);
    setSaveMessage(null);
    setSaveError(null);

    try {
      await onAppendToTest(recordedSteps);
      setSaveMessage(`Appended to "${selectedTestName ?? 'selected test'}".`);
      setRecordedSteps([]);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to append steps.');
    } finally {
      setSaving(false);
    }
  };

  const handleReplaceTestSteps = async (): Promise<void> => {
    setSaving(true);
    setSaveMessage(null);
    setSaveError(null);
    setConfirmReplace(false);

    try {
      await onReplaceTestSteps(recordedSteps);
      setSaveMessage(`Replaced steps in "${selectedTestName ?? 'selected test'}".`);
      setRecordedSteps([]);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to replace steps.');
    } finally {
      setSaving(false);
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
                    {step.selectorConfidence && (
                      <span className={`recorder-confidence-badge recorder-confidence-${step.selectorConfidence}`}>
                        {confidenceLabel(step.selectorConfidence)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>

              <div className="recorder-save-actions">
                <p className="recorder-save-label">Save recorded steps</p>
                <div className="recorder-save-buttons">
                  <button
                    type="button"
                    className="button button-primary compact-button"
                    disabled={saving}
                    onClick={() => {
                      void handleSaveAsNewTest();
                    }}
                  >
                    <FilePlus size={15} />
                    {saving ? 'Saving…' : 'Save as new test'}
                  </button>
                  {hasSelectedTest && (
                    <>
                      <button
                        type="button"
                        className="button button-secondary compact-button"
                        disabled={saving}
                        onClick={() => {
                          void handleAppendToTest();
                        }}
                      >
                        <ListPlus size={15} />
                        Append to test
                      </button>
                      {!confirmReplace ? (
                        <button
                          type="button"
                          className="button button-secondary compact-button"
                          disabled={saving}
                          onClick={() => setConfirmReplace(true)}
                        >
                          <RefreshCw size={15} />
                          Replace test steps
                        </button>
                      ) : (
                        <div className="recorder-replace-confirm">
                          <span>Replace all steps in &quot;{selectedTestName}&quot;?</span>
                          <button
                            type="button"
                            className="button button-danger compact-button"
                            disabled={saving}
                            onClick={() => {
                              void handleReplaceTestSteps();
                            }}
                          >
                            Confirm replace
                          </button>
                          <button
                            type="button"
                            className="button button-secondary compact-button"
                            disabled={saving}
                            onClick={() => setConfirmReplace(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {(saveMessage || saveError) && (
                <p className={saveError ? 'notice notice-error recorder-save-notice' : 'notice recorder-save-notice'}>
                  {saveError ?? saveMessage}
                </p>
              )}
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
