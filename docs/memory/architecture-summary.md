# Architecture Summary

Last updated: 2026-05-07

## Status

Architecture for the MVP is finalized at the planning level.

`docs/architecture/architecture-decision-record.md` contains ADR-0002 with status `accepted`.

Phase A tooling scaffold, Phase B app shell, local project/test storage, manual step editing, runner, recorder, simple results, Windows x64 validation, and packaging metadata/icon cleanup are complete. Product workflow features should stay scoped to the implementation plan phases.

## Current Accepted Architecture

Accepted first MVP stack:

- Electron.
- React.
- TypeScript.
- Node.js.
- Playwright.
- Local file storage.

Why this is currently recommended:

- It is the most direct path to a local recorder-runner MVP.
- Playwright fits naturally with Node.js and TypeScript.
- Fedora development is practical for the UI and automation layers.
- It avoids Tauri sidecar complexity and WinUI's Windows-only development loop for the first prototype.
- It lets the project validate the product loop before optimizing app size or native shell polish.
- Windows x64 is the first packaging target.
- Windows ARM remains a validation risk.

## Candidate Technologies Evaluated And Deferred

- Tauri + React + TypeScript + Rust shell + Playwright service/sidecar.
- Electron + React + TypeScript + Node.js + Playwright.
- .NET / WinUI + Playwright driver.
- Local web app + local runner service.

Tauri, .NET / WinUI, and local-service architectures are deferred for MVP, not rejected forever.

## Main Risks

- Electron app size and memory footprint will be larger than lighter shell options.
- Electron security must be designed carefully: context isolation, narrow typed IPC, no broad Node.js access in the renderer.
- Playwright browser packaging and update behavior remain major product risks.
- Windows on ARM is not fully de-risked. Playwright has an open issue requesting native Windows Arm64 browser bundle support.
- Fedora is practical for development, but final Windows packaging and signing still require Windows validation.

## Remaining Questions

- Should the first browser target be Playwright-managed Chromium, installed Microsoft Edge, or both through browser discovery?
- What is the minimal recording implementation: reuse Playwright codegen concepts, build a custom recorder, or start from generated actions?
- What Windows ARM fallback is acceptable if native Playwright-managed browser bundles are unavailable?
- What packaging path should be used for Electron x64 and arm64 builds?

## Runner Contract

The MVP runner contract is documented in `docs/architecture/runner-contract.md`. Key decisions:

- **Fail-fast:** first failed step stops the run; remaining steps marked `skipped`.
- **Default timeout:** 30 seconds per step, overridable via `timeoutMs`.
- **Screenshots:** captured only on step failure, stored under `artifacts/screenshots/run-{runId}/`.
- **Results:** saved as JSON under `results/run-{runId}.json`.
- **IPC:** single `runner:run` channel with validated input.

## Current Recommendation Status

Accepted for MVP in ADR-0002.

## Next Work

Confirm packaged-app Playwright browser first-run behavior, then continue Phase 2 test designer completion with step reordering.
