# Known Issues

Last updated: 2026-05-07

## Risks And Open Problems

- Product scope is large and must be narrowed before implementation.
- Windows ARM compatibility must be validated before making commercial support claims.
- Browser automation packaging can be complex, especially when bundling browsers, drivers, traces, video, and logs.
- MVP technical stack is accepted, but packaging and browser automation validation are still unresolved.
- Only early scaffold, local project metadata, and test case storage exist; MVP workflow is not complete.
- Market research is needed before building.
- Recorder output can become brittle if locator and step models are not designed carefully.
- Non-developer workflows need validation before UI patterns are finalized.
- Commercial packaging, licensing, and update strategy are not defined.
- Initial research uses a mix of official product sources, public reviews, forums, issue trackers, and papers; buyer priorities still need validation.
- Pricing, licensing, and Windows packaging details for competitors are unevenly public and may require deeper research.
- MVP scope is now narrower, but recorder quality, basic step editing, and recorder/runner parity are still core risks.
- Failure screenshots may not be enough diagnostic evidence for real users, even though screenshots are the MVP minimum.
- Supporting Chromium or Edge first still requires a concrete browser packaging and discovery strategy.
- Accepted Electron stack increases app size and requires deliberate security hardening.
- Playwright has an open issue requesting native Windows Arm64 browser bundle support, so Windows ARM browser automation must be validated early.
- Fedora development is practical for the accepted MVP stack, but Playwright's official Linux system requirements focus on Debian/Ubuntu; Fedora browser dependency setup may need manual documentation.
- npm latest initially tried Vite 8, but `electron-vite` currently supports Vite 5/6/7. The scaffold is pinned to Vite 7 and `@vitejs/plugin-react` 5; avoid blind Vite major upgrades until compatibility is verified.
- App shell has been redesigned from the rejected scaffold UI using `design-md` references, but it still needs hands-on UX validation with real Windows project/test/recorder/result workflows before it can be considered product-grade.
- Manual step editor is implemented for all 4 MVP step types, but there is no step reordering (drag-and-drop) yet.
- Browser recording is implemented but selectors are basic (id, data-testid, name, tag+class). No self-healing or smart locator generation yet.
- Project creation currently chooses a parent folder and creates a generated project folder name; there is no project rename, delete, migration, or recovery flow yet.
- The renderer test case list uses `toTestCaseFileName` to derive file names from test IDs, which is correct but means the file name is not human-readable.
- Windows x64 package build succeeds, but installer and portable packaging emit warnings for missing `author` metadata, default Electron icon, and electron-builder shell args deprecation.
- Dev mode launch on Windows is fixed by clearing inherited `ELECTRON_RUN_AS_NODE` before running `electron-vite dev`; if the failure returns, first verify that script still strips the variable and that `node_modules/electron/dist/electron.exe` exists.
- Interactive Windows x64 workflow validation is now complete (2026-05-07). All 62 unit tests pass and the redesigned shell passes CSS DESIGN.md compliance. No failures found.
- The current UI is now a more serious MVP workbench. Further UX work should follow real user feedback, not decorative redesign.

## Current Blockers

- Windows ARM packaging deferred — Playwright ARM64 browser support pending.
- No user interview data exists yet.
