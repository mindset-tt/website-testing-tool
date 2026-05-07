# Next Actions

Last updated: 2026-05-07

## Priority Order

1. Decide the final publisher/legal entity for package `author` and copyright metadata before code signing or commercial installer branding work.
2. Apply the new `Local QA Workbench` direction incrementally to shared renderer surfaces such as the sidebar, page headers, and panel/list styling without changing product behavior.
3. Consider project rename/delete flows after the packaging and shared shell styling tasks are stable.
4. Continue recorder/runner hardening only after the packaging follow-up above is finished.

## Notes

- Packaging plan is documented in `docs/architecture/packaging-plan.md`.
- `docs/troubleshooting/windows-packaging.md` documents the verified `winCodeSign` cache reset recovery path.
- Historical Windows x64 validation already confirmed working installer and portable outputs plus portable EXE launch.
- Metadata warning cleanup is complete: author metadata, product metadata, and custom icon wiring are in place.
- The historical Node.js `DEP0190` warning did not reproduce during the 2026-05-07 re-check on Node.js `v22.17.1`.
- The current Windows workspace now passes plain `npm run package:win:portable` again after deleting only `%LOCALAPPDATA%\\electron-builder\\Cache\\winCodeSign`.
- The packaged missing-Chromium flow is now validated on the 2026-05-07 portable EXE build: Tests and Recorder show the note, Run and Start Recording show the user-safe install error, and no raw Playwright stack trace reaches the normal UI.
- This Codex Windows shell exports `ELECTRON_RUN_AS_NODE=1`; clear it before launching Electron or packaged-app processes for runtime validation.
- Restoring the local Windows Playwright cache after the missing-Chromium probe required `npx playwright install chromium`.
- Step reordering is now implemented in the manual step editor with simple Move Up / Move Down controls. No drag-and-drop library was added.
- `docs/ux/product-style-direction.md` defines the chosen product direction: a Linear-led `Local QA Workbench` blend with Cursor, Raycast, Sentry, and Stripe as secondary references.
- Code signing and auto-update remain deferred for MVP.
