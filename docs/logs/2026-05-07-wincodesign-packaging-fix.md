# 2026-05-07 winCodeSign Packaging Recovery

## Task

Resolve or document the Windows `electron-builder` `winCodeSign` symlink packaging blocker without changing product behavior or packaging architecture.

## Review

- Reviewed `package.json`, `package-lock.json`, `electron.vite.config.ts`, packaging docs, validation docs, and current memory files.
- Confirmed there was no packaging config bug in the app itself that needed a product-code change.

## Reproduction

Plain `npm run package:win:portable` initially failed on Windows 11 Pro `10.0.26200` with:

- electron-builder `26.9.1`
- Node.js `v22.17.1`
- npm `10.9.2`
- `winCodeSign-2.6.0`
- cache root `C:\Users\khamp\AppData\Local\electron-builder\Cache\winCodeSign`
- failing archive paths such as `...\winCodeSign\869329607.7z`
- failing symlink entries:
  - `darwin\10.12\lib\libcrypto.dylib`
  - `darwin\10.12\lib\libssl.dylib`

The exact 7-Zip failure message was:

```text
ERROR: Cannot create symbolic link : A required privilege is not held by the client.
```

## Environment Findings

- Current shell was non-admin.
- `whoami /priv` did not show `SeCreateSymbolicLinkPrivilege`.
- Windows Developer Mode was enabled: `AllowDevelopmentWithoutDevLicense=1`.
- The downloaded `winCodeSign` archive itself was healthy and consistent.

## Recovery Tested

The verified recovery on this machine was:

```powershell
Remove-Item -LiteralPath "$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign" -Recurse -Force
npm run package:win:portable
```

That rebuilt a clean `winCodeSign-2.6.0` cache and restored plain portable packaging success without changing `package.json`.

## Result

- `npm run package:win:portable`: PASS after targeted cache reset
- Portable artifact produced: `dist\Website Testing Tool 0.0.0.exe`
- No runner, recorder, storage, or UI behavior changed

## Documentation Updates

- Added `docs/troubleshooting/windows-packaging.md`
- Updated packaging plan, runtime validation, and memory files to record the verified cache-reset recovery path

## Next Action

Use the current passing Windows portable build to validate the packaged missing-Chromium guidance on a machine without Playwright Chromium installed.
