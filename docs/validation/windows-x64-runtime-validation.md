# Windows x64 Runtime Validation

Last updated: 2026-05-07

## Environment

- Windows 11 Pro 10.0.26200
- Node.js v24.15.0
- npm v11.12.1

## Packages Tested

- `npm run package:win:portable` — Windows x64 portable EXE
- `npm run package:win` — Windows x64 NSIS installer
- `npm run build` — production build
- `npm run typecheck`, `npm run lint`, `npm run test`

## Validation Results

- Build: PASS
- Typecheck: PASS
- Lint: PASS
- Test suite: PASS (62 tests)
- Portable package generation: PASS
- Installer package generation: PASS
- Portable EXE launch: PASS
- Dev mode launch: PASS

## Interactive Workflow Validation

- App launch: PASS (portable EXE), PASS (dev mode)
- Project create/open: NOT VERIFIED
- Test creation: NOT VERIFIED
- Step editor: NOT VERIFIED
- Runner: NOT VERIFIED
- Screenshot-on-failure: NOT VERIFIED
- Recorder: NOT VERIFIED
- Result panel: NOT VERIFIED

## Bugs / Issues Found

- Fixed on 2026-05-07: dev mode failed when `ELECTRON_RUN_AS_NODE=1` was inherited by `electron-vite`, causing Electron to run the app main bundle in Node mode. The `npm run dev` script now launches through `scripts/run-electron-vite-dev.mjs`, which clears `ELECTRON_RUN_AS_NODE` before running `electron-vite dev`.
- Fixed on 2026-05-07: Windows dev-mode screenshots exposed a workspace shell UX failure. The app displayed static placeholder cards after a project opened, showed technical stack/platform badges, stacked Tests/Recorder/Results into one long page, and created duplicate-looking `Sample test` rows. The shell now uses focused sidebar sections, dynamic statuses, no public stack/platform badge, a compact step editor layout, and `Untitled test` default names.
- Fixed on 2026-05-07: follow-up UI review rejected the cleaned-up shell as still too scaffold-like. The renderer shell was redesigned against `design-md` references, primarily Linear, Raycast, Stripe, and Superhuman: dark surface ladder, real lucide icons, compact workbench navigation, overview metrics, a three-column test designer, a focused recorder panel, and a denser results surface. This was a UI shell change only; recorder and runner behavior were not changed.
- Packaging warning: `author` metadata missing from `package.json`
- Packaging warning: default Electron icon is used
- Packaging warning: `electron-builder` emits a DeprecationWarning about shell args when building on Windows
- Interactive project/test/runner/recorder workflows still require hands-on Windows verification

## Fixes Needed

- Add package metadata and explicit application icon before release
- Review and resolve electron-builder warnings on Windows x64
- Complete manual Windows x64 validation for core workflows using the cleaned-up shell
- Confirm Playwright browser first-run or bundled browser behavior for packaged Windows app

## Dev Mode Diagnostic Notes

- `node -v`: v24.15.0.
- `npm -v`: 11.12.1.
- Installed Electron: 42.0.0.
- Installed electron-vite: 5.0.0.
- Installed Vite: 7.3.2.
- Electron binary path exists: `node_modules/electron/dist/electron.exe`.
- Reinstalling Electron was not needed.
- Node v24 was not the root cause. Local package metadata now requires Node `>=22.12.0`, matching the installed Electron/Vite toolchain requirements.
- `npm run dev` was validated with `ELECTRON_RUN_AS_NODE=1` set in the parent shell; the app stayed running and emitted no `Electron uninstall` or `app.whenReady` error.
- After the `design-md` shell redesign, `npm run dev` was smoke-tested again with `ELECTRON_RUN_AS_NODE=1`; Electron stayed running and the old launch failure did not return. The smoke run emitted Chromium GPU cache access warnings, but they did not prevent launch.
- A browser-level mocked renderer sanity pass covered the redesigned test designer, recorder, and results surfaces on `http://localhost:5173/`; no renderer console errors were observed except a missing favicon request.

## Pass/Fail Decision

- Packaging/runtime launch validation: PASS for Windows x64 portable launch and dev mode launch.
- Full Windows x64 feature workflow validation: PENDING (core workflows still need hands-on validation).
- Overall status: Windows x64 packaging and dev launch are validated; interactive workflow validation can continue.
