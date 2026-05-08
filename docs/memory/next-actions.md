# Next Actions

Last updated: 2026-05-08

## Priority Order

1. Continue runner/results evidence work by adding lightweight request/response context around captured network failures and HTTP errors while keeping storage compact.
2. Apply the new `Local QA Workbench` direction incrementally to shared renderer surfaces without changing product behavior.
3. Continue recorder/runner hardening after the evidence improvements above are complete.
4. Revisit broader project recovery or migration flows only after failure diagnostics and workflow clarity improve.

## Notes

- Packaging plan is documented in `docs/architecture/packaging-plan.md`.
- `docs/troubleshooting/windows-packaging.md` documents the verified `winCodeSign` cache reset recovery path.
- Historical Windows x64 validation already confirmed working installer and portable outputs plus portable EXE launch.
- Metadata warning cleanup is complete: author metadata, product metadata, and custom icon wiring are in place.
- Final publisher/legal metadata is now an explicitly deferred business decision, not the next engineering blocker.
- The historical Node.js `DEP0190` warning did not reproduce during the 2026-05-07 re-check on Node.js `v22.17.1`.
- The current Windows workspace now passes plain `npm run package:win:portable` again after deleting only `%LOCALAPPDATA%\\electron-builder\\Cache\\winCodeSign`.
- The packaged missing-Chromium flow is now validated on the 2026-05-07 portable EXE build: Tests and Recorder show the note, Run and Start Recording show the user-safe install error, and no raw Playwright stack trace reaches the normal UI.
- This Codex Windows shell exports `ELECTRON_RUN_AS_NODE=1`; clear it before launching Electron or packaged-app processes for runtime validation.
- Restoring the local Windows Playwright cache after the missing-Chromium probe required `npx playwright install chromium`.
- Project rename is now implemented through `project.json` metadata only. It preserves the folder path and stable `projectId`.
- Recent projects are now cached in Electron `userData` as `recent-projects.json`, capped at eight entries, and shown in the no-project startup state.
- Users can now manually forget recent project entries without deleting project files.
- Failed run results now preview their saved screenshot through a validated main-process PNG reader instead of exposing raw filesystem access to the renderer.
- Failed and error runs now show a copyable failure summary, and the summary now includes browser evidence counts without dumping raw logs.
- Run results now capture capped browser console messages, page errors, request failures, and compact HTTP errors, and the Results panel now surfaces them in a compact Browser evidence section when present.
- Selected saved runs can now be exported as standalone HTML reports under `reports/` through a main-process path that validates run IDs and keeps writes inside the current project.
- Selected saved runs can now also be exported as JUnit XML reports under `reports/` for CI/CD consumption. Each step maps to a `<testcase>` with appropriate `<failure>`, `<error>`, or `<skipped>` elements, and `<system-out>` includes run metadata and browser evidence counts.
- Step reordering is now implemented in the manual step editor with simple Move Up / Move Down controls. No drag-and-drop library was added.
- Test rename, duplicate, and guarded delete are now implemented in the Tests workspace. Rename stays on the existing `saveTestCase` path, duplicates get a new `testId` and fresh step IDs, and delete uses inline confirmation before file removal.
- `docs/ux/product-style-direction.md` defines the chosen product direction: a Linear-led `Local QA Workbench` blend with Cursor, Raycast, Sentry, and Stripe as secondary references.
- Code signing and auto-update remain deferred for MVP.
- Exported HTML reports can now be opened or revealed in a file manager through safe preload-bridged IPC actions. Path validation prevents traversal, absolute paths, wrong extensions, and non-canonical filenames.
