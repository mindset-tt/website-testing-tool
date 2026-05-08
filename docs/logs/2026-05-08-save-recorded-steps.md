# Save Recorded Steps to Test — 2026-05-08

## Summary

Added the ability to save recorded browser steps directly into a selected or new test case, closing the no-code workflow loop: record → save → edit → run.

## Changes

### New Files
- `src/shared/recordedSteps.ts` — Helpers for generating recorded test names and normalizing step IDs
  - `generateRecordedTestName()` — returns "Recorded test YYYY-MM-DD HH-mm"
  - `normalizeRecordedSteps(steps)` — ensures all steps have valid unique stepId values
- `tests/recordedSteps.test.ts` — 8 tests for name generation and step normalization

### Modified Files
- `src/renderer/components/RecorderPanel.tsx` — Added save options UI after recording stops:
  - Save as new test (always available)
  - Append to selected test (when a test is selected)
  - Replace selected test steps (when a test is selected, with inline confirmation)
  - Save state management (saving, saveMessage, saveError, confirmReplace)
- `src/renderer/components/AppShell.tsx` — Added three save handlers:
  - `handleSaveRecordedAsNewTest` — creates a new test with timestamped name, populates steps, switches to Tests
  - `handleAppendRecordedToTest` — appends normalized steps after existing steps
  - `handleReplaceRecordedSteps` — replaces all steps in selected test with recorded steps
- `src/renderer/styles.css` — Added CSS for `.recorder-save-actions`, `.recorder-save-label`, `.recorder-save-buttons`, `.recorder-replace-confirm`, `.recorder-save-notice`

### Documentation Updates
- `docs/validation/manual-runner-recorder-validation.md` — Added "Saving Recorded Steps" section with validation steps for all three save modes
- `docs/memory/current-state.md` — Noted save-recorded-steps capability
- `docs/memory/next-actions.md` — Noted save-recorded-steps completion
- `docs/memory/known-issues.md` — Noted assertText not captured by recorder
- `docs/memory/architecture-summary.md` — Added save-recorded-steps entry

## Save Behaviors

### Save as new test
- Creates a new test case with name "Recorded test YYYY-MM-DD HH-mm"
- Normalizes step IDs before saving
- Switches to Tests section with the new test selected
- Clears recorded steps from the preview

### Append to selected test
- Appends normalized recorded steps after existing steps
- Preserves all existing steps
- Saves through existing `saveTestCase` path
- Clears recorded steps from the preview

### Replace selected test steps
- Shows inline confirmation: "Replace all steps in \"Test Name\"?"
- On confirm, replaces all steps with normalized recorded steps
- Preserves testId, name, description, createdAt
- Updates updatedAt through existing save path
- Clears recorded steps from the preview

## Validation

- `npm run typecheck` — passed
- `npm run lint` — passed
- `npm run test` — 183 tests passed (8 new)
- `npm run build` — passed
