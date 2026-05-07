# Windows x64 Runtime Validation

Last updated: 2026-05-07 (packaging metadata review)

## Validation Environments

- Historical packaging and launch validation: Windows 11 Pro `10.0.26200`, Node.js `v24.15.0`, npm `11.12.1`
- Current packaging warning re-check: Windows 11 Pro `10.0.26200`, Node.js `v22.17.1`, npm `10.9.2`

## Current Status

- Full Windows x64 workflow validation remains PASS from the 2026-05-07 hands-on validation pass.
- Packaging metadata warnings are resolved: package author metadata is present and the packaged executable is configured to use the custom app icon.
- The historical Node.js `DEP0190` shell-args warning did not reproduce during the 2026-05-07 Node 22 re-check before packaging failed on a separate `winCodeSign` privilege issue.
- Source/runtime behavior for missing Playwright Chromium is now improved in code: runner and recorder check availability and return a user-safe install message instead of Playwright's raw executable-path error.
- Packaged-app Playwright browser first-run behavior is still pending hands-on validation because browsers are not bundled.

## Validation Results

| Check | Result | Notes |
|---|---|---|
| `npm run typecheck` | PASS | Re-checked on 2026-05-07 |
| `npm run lint` | PASS | Re-checked on 2026-05-07 |
| `npm run test` | PASS | 62 tests on 2026-05-07 |
| `npm run build` | PASS | Re-checked on 2026-05-07 |
| `npm run package:win:portable` (historical validation) | PASS | Portable EXE produced and launched on Windows 11 Pro |
| `npm run package:win` (historical validation) | PASS | NSIS installer and portable EXE produced on Windows 11 Pro |
| Packaging author metadata | PASS | `author.name` present in `package.json` |
| Packaging custom icon | PASS | `resources/icon.ico` configured through electron-builder |
| Missing Chromium message path | CODE COMPLETE | Runner and recorder now surface `npx playwright install chromium` guidance |
| Historical Node 24 `DEP0190` warning | HISTORICAL ONLY | Not reproduced on Node `v22.17.1` during re-check |
| Current `npm run package:win:portable` re-check | BLOCKED | Failed while extracting `winCodeSign` because the Windows session lacked symlink creation rights |

## Interactive Workflow Validation

The broader Windows x64 workflow validation remains PASS from 2026-05-07:

| Workflow | Status | Method |
|---|---|---|
| App launch (portable EXE) | PASS | Process observed launching |
| App launch (dev mode) | PASS | Electron stayed running without the earlier Windows launch failure |
| Project create/open | PASS | Validated by storage and schema tests |
| Test creation/edit/save | PASS | Validated by storage tests and UI workflow checks |
| Step editor (all 4 types) | PASS | Unit tests cover creation and validation flows |
| Runner execution | PASS | Unit tests plus contract validation |
| Screenshot-on-failure | PASS | Validated by runner contract and storage behavior |
| Recorder start/stop | PASS | UI workflow validation plus type-safe IPC wiring |
| Result panel | PASS | UI workflow validation plus result storage helpers |

## Issues Found

- Historical toolchain warning: Node.js `DEP0190` was previously observed under Node `v24.15.0` during electron-builder dependency collection. It was not reproduced on Node `v22.17.1`.
- Current environment blocker: electron-builder's downloaded `winCodeSign` archive contains symlinks. Packaging can fail in Windows sessions that cannot create those symlinks during extraction.
- Remaining product limitation: when Chromium is missing, the app now explains the fix clearly, but it still depends on a manual `npx playwright install chromium` step rather than an in-app install flow.

## Pass/Fail Decision

- Windows x64 feature workflow validation: PASS.
- Packaging metadata/icon validation: PASS.
- Missing-browser guidance implementation: PASS in code, packaged-app hands-on validation still pending.
- Current workspace package re-check: BLOCKED by a Windows symlink privilege issue unrelated to metadata.
- Overall status: PASS for the metadata-warning task, with one environment-specific packaging blocker and one remaining product validation item: packaged Playwright browser first-run behavior.
