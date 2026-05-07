# 2026-05-07 Design-md Workbench Redesign

## Summary

Redesigned the renderer shell after Windows screenshots showed that the previous UI still looked like a low-grade scaffold. The new shell uses the supplied `design-md` folder as direction, primarily Linear, Raycast, Stripe, and Superhuman references.

## Root Cause

The previous UI had functional MVP pieces, but it did not communicate a commercial testing product. It had too much empty space, weak hierarchy, scaffold-like panels, repeated card blocks, and generic text-heavy states.

## Changes

- Reworked `src/renderer/components/AppShell.tsx` into a dark enterprise QA workbench with compact navigation, project overview metrics, a three-column test designer, run inspector, focused recorder entry point, and results surface.
- Replaced the renderer CSS with a dark surface ladder, restrained accent color, hairline borders, compact controls, and responsive workbench panels.
- Added `lucide-react` icons for product-grade navigation and actions.
- Trimmed recorder placeholder copy and replaced text glyphs with lucide icons.
- Removed the obsolete `shellModel` test target after the shell became stateful UI rather than static model data.

## Scope Guardrails

- No new product features were added.
- Recorder behavior was not changed.
- Runner behavior was not changed.
- Packaging behavior was not changed beyond the already-existing dev launch fix.
- Step reordering and smart selectors were not implemented.

## Checks

- `npm run typecheck`: PASS
- `npm run lint`: PASS
- `npm run test`: PASS, 62 tests
- `npm run build`: PASS
- `npm run dev`: PASS, Electron stayed running with `ELECTRON_RUN_AS_NODE=1` set in the parent shell and no `Electron uninstall` or `app.whenReady` error
- Browser-level mocked renderer sanity pass: PASS for redesigned test designer, recorder, and results surfaces

## Notes

The dev smoke emitted Chromium GPU cache access warnings, but the app launched and stayed running. Fresh hands-on Windows workflow validation is still required before claiming the redesigned shell is validated for real use.
