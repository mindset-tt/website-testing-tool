# Windows Packaging Troubleshooting

Last updated: 2026-05-07

## Problem

`npm run package:win:portable` can fail on Windows while electron-builder prepares the legacy `winCodeSign` tool bundle that it uses for `rcedit`.

## Symptoms

The failure happens after the Electron app is built and while electron-builder is packaging Windows artifacts. The failing bundle in this workspace was:

- `winCodeSign-2.6.0`
- cache root: `C:\Users\khamp\AppData\Local\electron-builder\Cache\winCodeSign`
- failing archive path pattern: `C:\Users\khamp\AppData\Local\electron-builder\Cache\winCodeSign\<random>.7z`

Typical error:

```text
ERROR: Cannot create symbolic link : A required privilege is not held by the client.
...winCodeSign\<random>\darwin\10.12\lib\libcrypto.dylib
...winCodeSign\<random>\darwin\10.12\lib\libssl.dylib
```

## Root Cause

On this machine, the practical root cause was a stale or incomplete `winCodeSign` cache state under `%LOCALAPPDATA%\electron-builder\Cache\winCodeSign`.

Facts from the 2026-05-07 re-check:

- electron-builder version: `26.9.1`
- Node.js version: `v22.17.1`
- Windows version: `10.0.26200`
- Current shell: non-admin
- `whoami /priv` did not show `SeCreateSymbolicLinkPrivilege`
- Windows Developer Mode was enabled: `AllowDevelopmentWithoutDevLicense=1`

The package command failed repeatedly while extracting random cache folders, but the same non-admin machine succeeded immediately after deleting only the `winCodeSign` cache folder and letting electron-builder rebuild a clean `winCodeSign-2.6.0` directory.

Inference:

- The immediate blocker was not a bad download URL or broken package config.
- The underlying extraction step is sensitive to Windows symlink handling.
- If cache reset does not fix the issue on another machine, Developer Mode or an elevated Administrator shell are the next environment checks.

## Recovery Steps

### Recommended first fix

1. Close any packaging shells that may still be holding the cache.
2. Remove only the `winCodeSign` cache folder.
3. Re-run `npm run package:win:portable`.

Commands:

```powershell
Remove-Item -LiteralPath "$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign" -Recurse -Force
npm run package:win:portable
```

### If it still fails

1. Confirm Windows Developer Mode is enabled.
2. Re-run the package command from an Administrator PowerShell window.
3. Only if both still fail, use a manual `rcedit` override from a known-good extracted bundle.

Developer Mode check:

```powershell
Get-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\AppModelUnlock' |
  Select-Object AllowDevelopmentWithoutDevLicense, AllowAllTrustedApps
```

Expected useful value:

```text
AllowDevelopmentWithoutDevLicense : 1
```

Manual `rcedit` override fallback:

```powershell
$target = "$env:LOCALAPPDATA\electron-builder\Cache\manual-rcedit"
New-Item -ItemType Directory -Force -Path $target | Out-Null
Copy-Item "$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign\winCodeSign-2.6.0\rcedit-x64.exe" "$target\rcedit-x64.exe" -Force
Copy-Item "$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign\winCodeSign-2.6.0\rcedit-ia32.exe" "$target\rcedit-x86.exe" -Force
$env:ELECTRON_BUILDER_RCEDIT_PATH = $target
npm run package:win:portable
Remove-Item Env:\ELECTRON_BUILDER_RCEDIT_PATH
```

Use the manual override only as a fallback. It was not required once the stale cache was removed on this machine.

## What Not To Do

- Do not delete the entire `%LOCALAPPDATA%\electron-builder\Cache` tree unless a wider cache reset is actually needed.
- Do not delete unrelated `%LOCALAPPDATA%` content.
- Do not change app code, runner code, recorder code, or storage just to work around this packaging cache issue.
- Do not assume the historical Node.js `DEP0190` warning is the same problem. The `winCodeSign` extraction failure is separate.

## Expected Successful Output

After recovery, the portable package command should reach output similar to:

```text
• execute command  ...\winCodeSign\winCodeSign-2.6.0\rcedit-x64.exe ...
• building        target=portable file=dist\Website Testing Tool 0.0.0.exe archs=x64
• signing with signtool.exe  path=dist\Website Testing Tool 0.0.0.exe
```

Expected artifact:

- `dist\Website Testing Tool 0.0.0.exe`

## Result On This Machine

On 2026-05-07, the exact recovery that restored plain `npm run package:win:portable` was:

```powershell
Remove-Item -LiteralPath "$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign" -Recurse -Force
npm run package:win:portable
```
