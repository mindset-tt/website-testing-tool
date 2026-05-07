# Next Actions

Last updated: 2026-05-07

## Priority Order

1. Re-run `npm run package:win:portable` in a Windows session with symlink creation rights or a primed electron-builder `winCodeSign` cache, remove any local Playwright Chromium install, and confirm the packaged app shows the new missing-browser guidance for both Run and Recorder.
2. Decide the final publisher/legal entity for package `author` and copyright metadata before code signing or commercial installer branding work.
3. Consider project rename/delete flows after the packaging and first-run validation tasks are stable.
4. Continue recorder/runner hardening only after the packaging follow-up above is finished.

## Notes

- Packaging plan is documented in `docs/architecture/packaging-plan.md`.
- Historical Windows x64 validation already confirmed working installer and portable outputs plus portable EXE launch.
- Metadata warning cleanup is complete: author metadata, product metadata, and custom icon wiring are in place.
- The historical Node.js `DEP0190` warning did not reproduce during the 2026-05-07 re-check on Node.js `v22.17.1`.
- The current workspace package attempt is blocked by an electron-builder `winCodeSign` symlink extraction privilege issue, not by missing metadata.
- Playwright browsers are still not bundled. The app now shows a clear `npx playwright install chromium` message when Chromium is missing, but the packaged flow still needs hands-on validation on real Windows hardware.
- Step reordering is now implemented in the manual step editor with simple Move Up / Move Down controls. No drag-and-drop library was added.
- Code signing and auto-update remain deferred for MVP.
