# 2026-05-07 Windows Dev Mode Fix

## Task

Fix the Windows `npm run dev` launch failure without changing recorder behavior, runner behavior, product features, or packaging scripts.

## Diagnosis

- Windows environment: Node.js v24.15.0, npm 11.12.1.
- Installed Electron: 42.0.0.
- Installed electron-vite: 5.0.0.
- Installed Vite: 7.3.2.
- Electron binary exists at `node_modules/electron/dist/electron.exe`.
- `require('electron')` resolves to the Electron executable path in a normal Node process, so reinstalling Electron was not needed.
- The parent shell had `ELECTRON_RUN_AS_NODE=1`.
- `electron-vite` starts Electron by spawning the Electron binary while inheriting the parent environment.
- With `ELECTRON_RUN_AS_NODE=1` inherited, Electron ran the built main bundle in Node mode. That made `require('electron')` resolve to the npm package helper instead of Electron's runtime API, causing `app.whenReady()` to be undefined.

## Change

- Updated `npm run dev` to call `scripts/run-electron-vite-dev.mjs`.
- Added `scripts/run-electron-vite-dev.mjs`, which clears inherited `ELECTRON_RUN_AS_NODE` before invoking `electron-vite dev`.
- Added a script-specific ESLint config for Node globals.
- Tightened package Node engine metadata from `>=22.0.0` to `>=22.12.0` to match the installed Electron/Vite/electron-vite engine requirements.

## Validation

- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run test`: PASS, 62 tests.
- `npm run build`: PASS.
- `npm run dev`: PASS. Validated with `ELECTRON_RUN_AS_NODE=1` set in the parent shell; Electron stayed running and emitted no `Electron uninstall` or `app.whenReady` failure.

## Next Action

Complete interactive Windows x64 workflow validation: project create/open, test creation, step editor, runner, screenshot-on-failure, recorder, and result panel.
