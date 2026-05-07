# Packaging Plan

Last updated: 2026-05-07

This document defines the packaging strategy for the Website Testing Tool MVP. It is a planning document, not a completed implementation.

## 1. Packaging Goals

- Produce a working Windows x64 build that non-developer testers can install and run.
- Keep the packaging toolchain simple and well-documented.
- Preserve a clear path to Windows ARM packaging later.
- Avoid over-engineering the first build pipeline.

## 2. Packaging Tool: electron-builder

**Recommendation:** Use `electron-builder` for the first MVP packaging.

**Why electron-builder:**

- Most mature and widely-used Electron packaging tool.
- Supports Windows x64, Windows ARM64, macOS, and Linux from a single config.
- Handles NSIS installer generation, portable builds, and auto-update infrastructure.
- Integrates naturally with `electron-vite` (the project's current build tool).
- Can be configured to include or exclude Playwright browser binaries.
- Active maintenance and large community.

**Alternatives considered:**

| Tool | Verdict |
|---|---|
| `electron-forge` | Good alternative; slightly more opinionated. electron-builder chosen for flexibility. |
| `electron-packager` | Lower-level; requires more manual config. Not recommended for MVP. |
| Manual ZIP | Too primitive for commercial distribution. |

## 3. First Target: Windows x64

| Property | Value |
|---|---|
| Architecture | x64 (x86_64) |
| Installer format | NSIS (`.exe` installer) |
| Portable format | Portable `.exe` (single-file, no install) |
| Output directory | `dist/` |
| App ID | `com.website-testing-tool.app` |
| Product name | `Website Testing Tool` |
| Current author metadata | `Website Testing Tool Team` placeholder until final publisher/legal entity is chosen |
| Current copyright metadata | `Copyright © 2026 Website Testing Tool Team` placeholder until final publisher/legal entity is chosen |
| Build resources directory | `resources/` |
| Windows icon | `resources/icon.ico` generated from local project assets |

## 4. Later Target: Windows ARM

| Property | Value |
|---|---|
| Architecture | ARM64 |
| Status | **Deferred — validation risk** |
| Blocker | Playwright has an open issue requesting native Windows Arm64 browser bundles |
| Fallback | If Playwright ARM64 browsers are unavailable, document limitation and require x64 emulation |

Windows ARM packaging will be added to `electron-builder` config once:
1. Playwright confirms Windows ARM64 browser support.
2. ARM64 hardware or VM is available for validation.
3. A minimal ARM64 smoke test passes (launch browser, record, run, screenshot).

## 5. Fedora Development Constraints

- **Cross-compilation from Fedora to Windows x64 is possible** with electron-builder using Wine or Docker.
- **Code signing is not possible from Fedora** — Windows Authenticode signing requires Windows.
- **First validation should happen on a real Windows x64 machine or VM.**
- **Recommended approach:** Build on Fedora, test on Windows. Add signing later on a Windows CI runner.

## 6. Expected Package Outputs

After running `npm run package:win`, the `dist/` directory will contain:

```
dist/
├─ Website Testing Tool Setup 0.0.0.exe   (NSIS installer)
├─ Website Testing Tool 0.0.0.exe         (portable)
├─ win-unpacked/                          (unpacked app for debugging)
└─ builder-effective-config.yaml          (resolved config)
```

## 7. Playwright Browser Packaging Risk

This is the single largest packaging risk. Playwright's Chromium browser is ~150 MB compressed.

**Decision for MVP:** Do **not** bundle Playwright browsers in the installer.

**Rationale:**
- Keeps the installer small (~100 MB vs ~300+ MB).
- Avoids forcing every Windows download to include Chromium when some validation environments will preinstall it.
- Avoids bundling a browser that may be outdated by the time the user installs.

**Current first-run behavior:** the app does not bundle Chromium and does not yet download it automatically. When Chromium is missing, the runner and recorder now show a clear message telling the user to run `npx playwright install chromium`.

**Future consideration:** Bundle Chromium for offline/enterprise deployments or add a supported in-app install flow once the tradeoff is intentionally accepted.

## 8. Chromium Dependency Strategy

| Scenario | Approach |
|---|---|
| First run, no browser found | Show a clear missing-browser message with `npx playwright install chromium` and stop before runner/recorder launch |
| Browser already installed | Use cached Playwright browser |
| Enterprise/offline | Document manual browser install path or accept a bundled-browser size increase later |
| Windows ARM | Use installed Microsoft Edge if Playwright ARM64 Chromium unavailable |

Current limitation:

- The packaged app now explains the missing-browser problem clearly, but it still relies on a manual external install command. A supported in-app browser installer does not exist yet.

## 9. Code Signing — Deferred

- Windows Authenticode code signing is **deferred** for MVP.
- Unsigned apps trigger SmartScreen warnings on Windows.
- For internal/testing distribution, this is acceptable.
- For commercial release, code signing must be added with an EV certificate.

## 10. Auto-Update — Deferred

- Auto-update via `electron-updater` is **deferred** for MVP.
- electron-builder produces update artifacts (`.yml` files, blockmaps) compatible with `electron-updater`.
- Can be added later without changing the packaging config.

## 11. Installer vs Portable Build Tradeoff

| Format | Pros | Cons |
|---|---|---|
| NSIS Installer | Familiar Windows experience, Start Menu shortcuts, uninstaller | Requires admin rights, larger distribution |
| Portable EXE | No install needed, runs from USB/network drive | No Start Menu integration, no file associations |

**MVP decision:** Produce both. Default download is the installer; portable for advanced users.

## 12. electron-builder Configuration

Minimal config in `package.json`:

```json
{
  "author": {
    "name": "Website Testing Tool Team"
  },
  "build": {
    "appId": "com.website-testing-tool.app",
    "productName": "Website Testing Tool",
    "copyright": "Copyright © 2026 Website Testing Tool Team",
    "directories": {
      "output": "dist",
      "buildResources": "resources"
    },
    "files": [
      "out/**/*",
      "package.json"
    ],
    "win": {
      "icon": "icon.ico",
      "target": [
        {
          "target": "nsis",
          "arch": ["x64"]
        },
        {
          "target": "portable",
          "arch": ["x64"]
        }
      ]
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true
    }
  }
}
```

## 13. Icon Asset Requirements

electron-builder's Windows default is `build/icon.ico`, but this repository overrides `directories.buildResources` to `resources/`. In this project the effective required Windows icon path is therefore `resources/icon.ico`.

Current icon assets:

- Required for Windows packaging: `resources/icon.ico`
- Current readable source asset: `resources/icon.svg`
- Optional future raster source: `resources/icon.png`

Notes:

- `npm run icon:generate` regenerates `resources/icon.ico` from local project drawing code in `scripts/generate-app-icon.mjs`.
- Do not add font files to generate the app icon. Keep the source in SVG, PNG, or drawing code that stays local to the repository.

## 14. Package Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "icon:generate": "node scripts/generate-app-icon.mjs",
    "package:win": "npm run build && electron-builder --win=nsis:x64 --win=portable:x64",
    "package:win:portable": "npm run build && electron-builder --win=portable:x64"
  }
}
```

## 15. Current Warning Status

As of 2026-05-07:

- Missing `author` metadata warning: resolved.
- Default Electron icon warning: resolved; `resources/icon.ico` is applied with `rcedit --set-icon` for the packaged executable.
- Historical Node.js `DEP0190` shell-args warning: previously observed under Node.js `v24.15.0` during electron-builder dependency collection.
- 2026-05-07 re-check on Node.js `v22.17.1`: the `DEP0190` warning did not reproduce before packaging failed later on a separate `winCodeSign` cache extraction privilege error.
- 2026-05-07 follow-up on the same Windows 11 machine: deleting only `%LOCALAPPDATA%\electron-builder\Cache\winCodeSign` allowed electron-builder to rebuild a clean `winCodeSign-2.6.0` cache and restored plain `npm run package:win:portable` success.
- Current recovery guidance is documented in `docs/troubleshooting/windows-packaging.md`.

## 16. winCodeSign Cache Recovery

The legacy `winCodeSign` bundle used by electron-builder can surface symlink extraction errors on Windows. On this machine the practical recovery was a targeted cache reset, not a package.json change.

Recommended recovery order:

1. Remove only `%LOCALAPPDATA%\electron-builder\Cache\winCodeSign`.
2. Re-run `npm run package:win:portable`.
3. If the error persists, confirm Developer Mode or retry from an Administrator PowerShell session.
4. Use a manual `ELECTRON_BUILDER_RCEDIT_PATH` override only as a fallback.

Verified recovery command:

```powershell
Remove-Item -LiteralPath "$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign" -Recurse -Force
npm run package:win:portable
```

## 17. Validation Checklist

### Pre-validation (Fedora)

- [ ] `npm run build` succeeds
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run test` passes (70 tests)
- [ ] `electron-builder` installed as dev dependency
- [ ] `npm run icon:generate` can regenerate `resources/icon.ico`
- [ ] Package output uses custom icon and author metadata
- [ ] If `winCodeSign` extraction fails, targeted cache reset procedure is documented and verified

### Windows x64 Validation (on Windows machine/VM)

- [ ] Installer runs without errors
- [ ] App launches and shows the shell UI
- [ ] Can create a new project
- [ ] Can open an existing project
- [ ] Can create a test case with steps
- [ ] Can edit and save steps
- [ ] Can run a test (requires Playwright Chromium)
- [ ] Run result appears in the Results panel
- [ ] Failure screenshot is captured (if test fails)
- [ ] Can start and stop recording
- [ ] Recorder captures browser actions
- [ ] App closes cleanly
- [ ] Uninstaller removes the app

### Windows ARM Validation (deferred)

- [ ] Playwright ARM64 browser support confirmed
- [ ] ARM64 build produces valid installer
- [ ] App launches on ARM64 hardware
- [ ] Browser automation works on ARM64
- [ ] All x64 validation steps pass on ARM64

## 18. Out of Scope for MVP Packaging

- Code signing (Authenticode)
- Auto-update infrastructure
- Microsoft Store submission
- Enterprise MSI packaging
- macOS packaging
- Linux packaging (beyond development)
- Playwright browser bundling in installer
- Installer customization (banners, license UI, EULA)
