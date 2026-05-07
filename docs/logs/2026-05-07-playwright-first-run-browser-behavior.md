# 2026-05-07 Playwright First-Run Browser Behavior

## Task

Validate and improve Playwright Chromium first-run behavior without redesigning the UI, changing recorder or runner behavior beyond missing-browser handling, or bundling browsers into the Windows package.

## Current Behavior Found

Before this change:

- The runner and recorder called `chromium.launch()` directly.
- If Chromium was missing, the app surfaced Playwright's raw executable-path error.
- The raw error mentioned a generic browser install command, but it was not phrased for non-developer users and there was no proactive status note in the app.

Observed local missing-browser message:

`browserType.launch: Executable doesn't exist ... Please run the following command to download new browsers: npx playwright install`

## Changes

- Added `src/automation/playwrightBrowser.ts` for shared Chromium availability checks and missing-browser error normalization.
- Runner and recorder now convert missing-browser launch failures into user-safe messages that explicitly tell the user to run `npx playwright install chromium`.
- Added a small browser availability IPC path and preload API so the renderer can check Chromium status safely through the main process.
- Added a small missing-Chromium note to the Tests run inspector and Recorder panel, shown only when Chromium is missing.
- Updated packaging and validation docs to describe the real current behavior: clear manual recovery guidance, but no in-app browser download flow yet.
- Added pure helper tests for missing-browser detection and message normalization.

## User-Facing Message

- Runner: `Playwright Chromium is not installed on this machine. Run npx playwright install chromium, then try again to run the selected test.`
- Recorder: `Playwright Chromium is not installed on this machine. Run npx playwright install chromium, then try again to start recording.`
- Status note: `Playwright Chromium is not installed. Run npx playwright install chromium before using Run or Recorder.`

## Commands Run

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`

## Results

- `npm run typecheck`: PASS
- `npm run lint`: PASS
- `npm run test`: PASS (67 tests)
- `npm run build`: PASS

## Next Action

Re-run `npm run package:win:portable` in a Windows session with symlink creation rights or a primed `winCodeSign` cache, remove local Playwright Chromium, and validate that the packaged app shows the new missing-browser guidance for both Run and Recorder.
