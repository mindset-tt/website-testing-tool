# Windows x64 Runtime Validation

Last updated: 2026-05-07

## Status: PENDING — Requires Windows Hardware

This document records the Windows x64 runtime validation results. The packages were built successfully from Fedora, but runtime testing requires a Windows x64 machine or VM which is not currently available in this development environment.

## Build Verification (Fedora — Verified)

| Check | Result |
|---|---|
| `npm run build` succeeds | ✅ Passed |
| `npm run typecheck` passes | ✅ Passed |
| `npm run lint` passes | ✅ Passed |
| `npm run test` passes (62 tests) | ✅ Passed |
| `npm run package:win` produces installer | ✅ `dist/Website Testing Tool Setup 0.0.0.exe` (99 MB) |
| `npm run package:win` produces portable | ✅ `dist/Website Testing Tool 0.0.0.exe` (99 MB) |
| `npm run package:win:portable` produces portable | ✅ Same as above |

## Runtime Validation Checklist (Requires Windows)

The following checklist must be completed on a Windows x64 machine or VM.

### Machine Information

| Field | Value |
|---|---|
| Machine/VM | `TBD` |
| Windows version | `TBD` (e.g., Windows 11 24H2) |
| Architecture | x64 |
| Package tested | `TBD` (installer or portable EXE) |
| Date tested | `TBD` |

### Launch

| Check | Expected | Result |
|---|---|---|
| Installer runs without errors | Setup wizard appears | `TBD` |
| App launches after install | Shell UI visible | `TBD` |
| Portable EXE launches directly | Shell UI visible | `TBD` |
| Window title shows "Website Testing Tool" | Correct title | `TBD` |
| Window is resizable | Min 960×640 | `TBD` |
| SmartScreen warning (expected — no code signing) | Warning may appear | `TBD` |

### Project Create/Open

| Check | Expected | Result |
|---|---|---|
| Create project with name | `project.json` written, directories created | `TBD` |
| Project name appears in header | Name visible | `TBD` |
| Open existing project | Project loads, tests listed | `TBD` |
| Invalid folder shows error | Clear error message | `TBD` |

### Manual Step Editor

| Check | Expected | Result |
|---|---|---|
| Create new test case | Test appears in list | `TBD` |
| Add step (navigate) | Step card appears | `TBD` |
| Add step (click) | Step card appears | `TBD` |
| Add step (fill) | Step card appears | `TBD` |
| Add step (assertText) | Step card appears | `TBD` |
| Edit step fields | Fields update | `TBD` |
| Delete step | Step removed | `TBD` |
| Save test case | Saved confirmation | `TBD` |
| Reopen test after save | Steps persist | `TBD` |

### Runner

| Check | Expected | Result |
|---|---|---|
| Run test with valid steps | PASSED badge (green) | `TBD` |
| Run test with failing assertText | FAILED badge (red) | `TBD` |
| Run test with no steps | Error message | `TBD` |
| Result JSON saved to `results/` | File exists | `TBD` |
| Failure screenshot saved | File in `artifacts/screenshots/` | `TBD` |
| Screenshot path shown in UI | Path visible | `TBD` |
| Step-level results shown | Per-step status | `TBD` |
| Error message shown for failed step | Message visible | `TBD` |
| Run button disabled during run | "Running…" shown | `TBD` |
| Browser closes after run | No orphan processes | `TBD` |

### Recorder

| Check | Expected | Result |
|---|---|---|
| Start Recording launches Chromium | Browser window opens | `TBD` |
| Status shows "Recording" | Red pulsing dot | `TBD` |
| Navigate to URL in browser | Navigate action captured | `TBD` |
| Click element in browser | Click action captured | `TBD` |
| Fill form in browser | Fill action captured | `TBD` |
| Stop Recording closes browser | Browser closes | `TBD` |
| Recorded steps appear in preview | Steps listed | `TBD` |
| Start while already recording | Error message | `TBD` |
| Stop while not recording | Error message | `TBD` |

### Result Panel

| Check | Expected | Result |
|---|---|---|
| Results panel shows after runs | Run list visible | `TBD` |
| Results sorted by date (newest first) | Correct order | `TBD` |
| Click result shows detail | Detail view opens | `TBD` |
| Pass/fail/error badges correct | Correct colors | `TBD` |
| Duration, browser, timestamps shown | All fields visible | `TBD` |
| Screenshot path shown for failures | Path visible | `TBD` |

### App Close/Reopen

| Check | Expected | Result |
|---|---|---|
| App closes cleanly | No errors | `TBD` |
| Reopen and project state persists | Tests and results visible | `TBD` |
| Uninstaller removes app | App removed | `TBD` |

## Issues Found

| # | Issue | Severity | Status |
|---|---|---|---|
| — | No runtime testing performed yet | — | Pending Windows hardware |

## Pass/Fail Decision

**PENDING** — Runtime validation cannot be completed from Fedora Linux. All build-time checks pass. Runtime testing requires a Windows x64 machine or VM.

## Next Steps

1. Obtain access to a Windows x64 machine or VM
2. Copy the `dist/` folder to the Windows machine
3. Run through the checklist above
4. Record results in this document
5. Report any issues found
