import { useState } from 'react';
import type { ChangeEvent, ReactElement } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';

import type { TestCase, TestStep, StepType } from '../../shared/project-schema';
import { createStepId, SUPPORTED_STEP_TYPES } from '../../shared/project-schema';
import { reorderItems } from '../../shared/reorder';

interface StepEditorProps {
  readonly testCase: TestCase;
  readonly projectPath: string;
  readonly onSaved: (updated: TestCase) => void;
  readonly onError: (message: string) => void;
}

interface EditableStep {
  stepId: string;
  type: StepType;
  label: string;
  target: string;
  value: string;
  timeoutMs: string;
  notes: string;
}

function toEditableStep(step: TestStep): EditableStep {
  return {
    stepId: step.stepId,
    type: step.type,
    label: step.label,
    target: step.target ?? '',
    value: step.value ?? '',
    timeoutMs: step.timeoutMs !== undefined ? String(step.timeoutMs) : '',
    notes: step.notes ?? ''
  };
}

function toTestStep(editable: EditableStep): TestStep {
  const timeoutMs = editable.timeoutMs.trim()
    ? Number(editable.timeoutMs.trim())
    : undefined;

  return {
    stepId: editable.stepId,
    type: editable.type,
    label: editable.label.trim(),
    target: editable.target.trim() || undefined,
    value: editable.value.trim() || undefined,
    timeoutMs: timeoutMs !== undefined && Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : undefined,
    notes: editable.notes.trim() || undefined
  };
}

function createEmptyEditableStep(): EditableStep {
  return {
    stepId: createStepId(),
    type: 'navigate',
    label: '',
    target: '',
    value: '',
    timeoutMs: '',
    notes: ''
  };
}

export function StepEditor({ testCase, projectPath, onSaved, onError }: StepEditorProps): ReactElement {
  const [steps, setSteps] = useState<EditableStep[]>(testCase.steps.map(toEditableStep));
  const [saving, setSaving] = useState(false);

  const handleFieldChange = (
    index: number,
    field: keyof EditableStep,
    value: string
  ): void => {
    setSteps((prev) => {
      const next = [...prev];
      const current = next[index];

      if (!current) {
        return prev;
      }

      next[index] = { ...current, [field]: value };

      return next;
    });
  };

  const handleTypeChange = (index: number, event: ChangeEvent<HTMLSelectElement>): void => {
    const value = event.target.value;

    if (SUPPORTED_STEP_TYPES.includes(value as StepType)) {
      handleFieldChange(index, 'type', value);
    }
  };

  const handleAddStep = (): void => {
    setSteps((prev) => [...prev, createEmptyEditableStep()]);
  };

  const handleDeleteStep = (index: number): void => {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveStep = (index: number, direction: -1 | 1): void => {
    setSteps((prev) => reorderItems(prev, index, index + direction));
  };

  const handleSave = async (): Promise<void> => {
    setSaving(true);

    try {
      const testSteps = steps.map(toTestStep);
      const updated: TestCase = {
        ...testCase,
        steps: testSteps
      };

      const result = await window.websiteTestingTool.testCase.saveTestCase(projectPath, updated);

      if (result.ok) {
        onSaved(result.testCase);
      } else {
        onError(result.error);
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to save test.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="step-editor" aria-label="Step editor">
      <div className="step-editor-header">
        <h4>Steps</h4>
        <div className="step-editor-actions">
          <button
            type="button"
            className="add-step-button"
            onClick={handleAddStep}
            disabled={saving}
          >
            + Add step
          </button>
          <button
            type="button"
            className="save-steps-button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {steps.length === 0 && (
        <p className="step-editor-empty">No steps yet. Add a step to get started.</p>
      )}

      <div className="step-list">
        {steps.map((step, index) => (
          <div className="step-card" key={step.stepId}>
            <div className="step-card-header">
              <span className="step-number">Step {index + 1}</span>
              <div className="step-card-actions">
                <button
                  type="button"
                  className="reorder-step-button"
                  onClick={() => handleMoveStep(index, -1)}
                  disabled={saving || index === 0}
                  aria-label={`Move step ${index + 1} up`}
                >
                  <ArrowUp size={14} />
                  Move Up
                </button>
                <button
                  type="button"
                  className="reorder-step-button"
                  onClick={() => handleMoveStep(index, 1)}
                  disabled={saving || index === steps.length - 1}
                  aria-label={`Move step ${index + 1} down`}
                >
                  <ArrowDown size={14} />
                  Move Down
                </button>
                <button
                  type="button"
                  className="delete-step-button"
                  onClick={() => handleDeleteStep(index)}
                  disabled={saving}
                  aria-label={`Delete step ${index + 1}`}
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="step-fields">
              <label className="step-field">
                <span>Type</span>
                <select
                  value={step.type}
                  onChange={(e) => handleTypeChange(index, e)}
                  disabled={saving}
                >
                  {SUPPORTED_STEP_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>

              <label className="step-field step-field-label">
                <span>Label</span>
                <input
                  type="text"
                  value={step.label}
                  onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
                  disabled={saving}
                  placeholder="e.g. Go to homepage"
                />
              </label>

              <label className="step-field">
                <span>Target</span>
                <input
                  type="text"
                  value={step.target}
                  onChange={(e) => handleFieldChange(index, 'target', e.target.value)}
                  disabled={saving}
                  placeholder="e.g. #login-button"
                />
              </label>

              <label className="step-field">
                <span>Value</span>
                <input
                  type="text"
                  value={step.value}
                  onChange={(e) => handleFieldChange(index, 'value', e.target.value)}
                  disabled={saving}
                  placeholder="e.g. Hello World"
                />
              </label>

              <label className="step-field step-field-narrow">
                <span>Timeout (ms)</span>
                <input
                  type="number"
                  value={step.timeoutMs}
                  onChange={(e) => handleFieldChange(index, 'timeoutMs', e.target.value)}
                  disabled={saving}
                  placeholder="5000"
                  min="1"
                />
              </label>

              <label className="step-field step-field-notes">
                <span>Notes</span>
                <input
                  type="text"
                  value={step.notes}
                  onChange={(e) => handleFieldChange(index, 'notes', e.target.value)}
                  disabled={saving}
                  placeholder="Optional notes"
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
