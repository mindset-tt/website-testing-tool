# 2026-05-07 Packaged Missing Chromium Validation

## Task

Validate the packaged Windows app when Playwright Chromium is missing, without adding product features, redesigning the UI, changing recorder or runner behavior unless validation failed, or bundling Chromium into the package.

## What I Did

- Built the portable Windows package with `npm run package:win:portable`.
- Identified the expected Windows Playwright Chromium path as `C:\Users\khamp\AppData\Local\ms-playwright\chromium-1217\chrome-win64\chrome.exe`.
- Renamed the local Chromium cache folder from `C:\Users\khamp\AppData\Local\ms-playwright\chromium-1217` to `C:\Users\khamp\AppData\Local\ms-playwright\chromium-1217.__packaged_missing_chromium_validation__`.
- Launched the packaged portable EXE with a temporary user-data directory and `--remote-debugging-port` so the packaged UI could be inspected safely.
- Seeded a temporary validation project into the live packaged React shell, created a minimal one-step test through the real UI, and exercised the packaged Tests and Recorder flows.
- Restored the local Chromium cache after validation with `npx playwright install chromium`.

## Important Validation Notes

- This Codex Windows shell exports `ELECTRON_RUN_AS_NODE=1`. That variable had to be cleared before launching Electron or packaged-app processes, otherwise the app exited immediately as a Node process.
- The renamed Chromium folder did not survive the packaged missing-browser probe as a simple rename-only backup. After the probe, `chromium-1217` was absent and the temporary renamed folder was no longer present, so restoration required a fresh local `npx playwright install chromium`.
- Playwright browsers are still not bundled into the Windows package. The missing-browser validation exercised the packaged app against a real missing local Chromium state.

## Packaged-App Results

- App open: passed. The portable packaged app opened successfully and stayed responsive.
- Tests page note: passed. The packaged Tests page showed `Playwright Chromium is not installed. Run npx playwright install chromium before using Run or Recorder.`
- Run selected test: passed. The packaged runner showed `Playwright Chromium is not installed on this machine. Run npx playwright install chromium, then try again to run the selected test.`
- Recorder page note: passed. The packaged Recorder page showed `Playwright Chromium is not installed. Run npx playwright install chromium before using Run or Recorder.`
- Start Recording: passed. The packaged recorder showed `Playwright Chromium is not installed on this machine. Run npx playwright install chromium, then try again to start recording.`
- Raw stack trace exposure: passed. No raw Playwright executable-path stack trace or module-path noise reached the normal packaged UI during the validation.
- Crash behavior: passed. The packaged app stayed running through both the Run and Recorder error paths.

## Commands Run

```powershell
npm run package:win:portable
npx playwright install chromium
npm run typecheck
npm run lint
npm run test
npm run build
```

## Checks

- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run test`: passed (`6` files, `70` tests)
- `npm run build`: passed

## Next Recommended Task

Decide the final publisher/legal entity for package metadata before code signing or commercial installer branding work, then return to the planned shared-shell `Local QA Workbench` polish.
