# Recorder Selector Generation — 2026-05-08

## Summary

Improved recorder selector generation with a deterministic priority order and added selector confidence metadata. Recorded steps now show confidence badges (High/Medium/Low) in the RecorderPanel preview.

## Changes

### New Files
- `src/shared/selectorGeneration.ts` — Pure selector generation helper
  - `generateSelector(attrs)` — generates a CSS selector using priority order with confidence
  - `escapeSelectorValue(value)` — escapes values for CSS selector safety
  - `SelectorConfidence` type: `'high' | 'medium' | 'low'`
  - `SelectorResult` type: `{ selector, confidence }`
- `tests/selectorGeneration.test.ts` — 20 tests for selector priority, escaping, and confidence

### Modified Files
- `src/automation/recorder.ts` — Updated `INIT_SCRIPT` with new selector priority:
  1. `data-testid` (high)
  2. `data-test` (high)
  3. `data-qa` (high)
  4. `id` (high)
  5. `name` (medium)
  6. `aria-label` (medium)
  7. CSS class fallback (low)
  8. tag fallback (low)
  - Added `selectorConfidence` to `RecordedAction` interface
  - Updated `toTestSteps()` to include confidence in output
- `src/shared/project-schema.ts` — Added optional `selectorConfidence?: SelectorConfidence` to `TestStep` interface (backward-compatible, no schema version bump needed)
- `src/renderer/components/RecorderPanel.tsx` — Added confidence badges to recorded steps preview list
- `src/renderer/styles.css` — Added CSS for `.recorder-confidence-badge`, `.recorder-confidence-high`, `.recorder-confidence-medium`, `.recorder-confidence-low`; updated grid to 4 columns

### Documentation Updates
- `docs/validation/manual-runner-recorder-validation.md` — Updated known limitations
- `docs/memory/current-state.md` — Noted selector priority and confidence
- `docs/memory/next-actions.md` — Noted selector generation completion
- `docs/memory/known-issues.md` — Updated selector brittleness note
- `docs/memory/architecture-summary.md` — Added selector generation entry

## Selector Priority Behavior

| Priority | Attribute | Confidence |
|---|---|---|
| 1 | `data-testid` | High |
| 2 | `data-test` | High |
| 3 | `data-qa` | High |
| 4 | `id` | High |
| 5 | `name` | Medium |
| 6 | `aria-label` | Medium |
| 7 | CSS class (up to 2, no `_` prefix) | Low |
| 8 | Tag name | Low |

## Saved Step Compatibility

- `selectorConfidence` is an optional field on `TestStep`
- Existing saved tests without this field remain valid
- The `validateTestStep` function is permissive about extra fields
- No schema version bump required
- Runner ignores the field (no behavior change)

## Validation

- `npm run typecheck` — passed
- `npm run lint` — passed
- `npm run test` — 203 tests passed (20 new)
- `npm run build` — passed
