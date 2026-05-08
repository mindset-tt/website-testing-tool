# Next Actions

Last updated: 2026-05-08

## Priority Order

1. Continue runner/results evidence work by capturing compact HTTP error responses (for example 4xx/5xx) now that request failures, console messages, and page-error diagnostics exist.
2. Continue recorder/runner hardening after the evidence improvements above are complete.
3. Apply the new `Local QA Workbench` direction incrementally to shared renderer surfaces without changing product behavior.
4. Revisit broader project recovery or migration flows only after failure diagnostics and workflow clarity improve.
5. Return to final publisher/legal entity selection only when code signing, installer branding, or commercial release prep becomes active work.

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
- Run results now capture capped browser console messages, page errors, and request failures, and the Results panel now surfaces them in a compact Browser evidence section when present.
- Step reordering is now implemented in the manual step editor with simple Move Up / Move Down controls. No drag-and-drop library was added.
- Test rename, duplicate, and guarded delete are now implemented in the Tests workspace. Rename stays on the existing `saveTestCase` path, duplicates get a new `testId` and fresh step IDs, and delete uses inline confirmation before file removal.
- `docs/ux/product-style-direction.md` defines the chosen product direction: a Linear-led `Local QA Workbench` blend with Cursor, Raycast, Sentry, and Stripe as secondary references.
- Code signing and auto-update remain deferred for MVP.
