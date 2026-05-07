# 2026-05-07 Step Reordering

## Task

Add simple step reordering to the manual step editor without changing the storage schema, recorder behavior, or runner behavior.

## Changes

- Added `src/renderer/stepEditorHelpers.ts` with a pure `reorderItems` helper for step list movement.
- Updated `StepEditor` to show `Move Up` and `Move Down` controls on every step card.
- Disabled `Move Up` for the first step and `Move Down` for the last step.
- Kept all step data intact during reordering by moving full step objects in local editor state.
- Preserved the existing save path: reordered steps are persisted only through the current `saveTestCase` preload API.
- Added helper tests for reorder behavior and updated manual validation docs and memory files.

## Validation

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`

## Expected Behavior

- Reordering changes only the step order, not step content.
- Save continues to use the existing `saveTestCase` flow and existing schema.
- No drag-and-drop library or schema change was introduced.

## Next Action

Return to the Windows packaged-app validation task: confirm the missing-Chromium guidance in a real packaged Windows app after `package:win:portable` can run successfully in a session with the required `winCodeSign` extraction privileges.
