# 2026-05-07 Workspace Shell UX Cleanup

## Task

Respond to Windows dev-mode screenshots showing that the app shell looked like an internal scaffold rather than a credible desktop testing tool.

## Scope

- Changed renderer shell presentation and navigation only.
- Did not change recorder internals.
- Did not change runner internals.
- Did not change storage schema or packaging.

## Problem

The Windows screenshots showed several user-facing issues:

- Static placeholder cards remained visible after a project opened.
- Sidebar statuses did not reflect the real project/test state.
- Sidebar items looked like navigation but did not switch views.
- The top bar exposed technical stack/platform badges.
- Tests, recorder, and results were stacked into one long page.
- The step editor layout was too tall for a desktop workbench.
- The create-test button produced repeated `Sample test` labels.

## Change

- Removed the static `workspaceCards` shell model and its stale placeholder UI.
- Made the existing sidebar switch between Project, Tests, Recorder, and Results sections.
- Updated sidebar statuses dynamically from current project state and test count.
- Removed public stack/platform badges from the header.
- Split Tests into a focused list/detail workbench.
- Moved Recorder and Results into their own sidebar sections.
- Tightened the step editor field grid.
- Changed new test defaults from duplicate `Sample test` names to unique `Untitled test` names.

## Validation

- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run test`: PASS, 62 tests.
- `npm run build`: PASS.
- `npm run dev`: PASS, confirmed with the inherited `ELECTRON_RUN_AS_NODE=1` guard still in place.
- Browser visual sanity check with mocked preload APIs confirmed the stale cards are gone and Tests/Recorder render as separate focused sections.

## Next Action

Run a fresh hands-on Windows Electron workflow validation pass using the cleaned-up shell.
