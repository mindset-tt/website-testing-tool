# Architecture Decision Records

This file stores architecture decision records, or ADRs. Each ADR should capture one important decision, the context that led to it, and the consequences of accepting it.

## ADR Format

Use this format for future records:

```text
## ADR-0000: Title

Status: proposed | accepted | superseded | rejected
Date: YYYY-MM-DD

### Context

What problem or decision point exists?

### Decision

What decision was made?

### Consequences

What tradeoffs, follow-up work, or constraints result from the decision?
```

## ADR-0001: Documentation-First And Agent-Guided Workflow

Status: accepted
Date: 2026-05-06

### Context

The product goal is broad: a commercial Windows desktop website testing tool for non-developers and developers. The project needs research, MVP discipline, architecture validation, and reliable handoff between AI agents before implementation begins.

### Decision

The project will begin with a documentation-first workflow. `AGENTS.md` defines the required agent behavior contract, and the memory files under `docs/memory/` are the starting point for every work session.

### Consequences

- Implementation must wait until research, MVP scope, and architecture decisions are validated.
- Future agents must update memory files and dated logs after meaningful work.
- Product and technical assumptions must be visible in markdown before they become code.
- The repository can support long-running planning and implementation without relying on chat history alone.

## ADR-0002: Initial MVP Application Architecture

Status: accepted
Date: 2026-05-06

### Context

The MVP is a local-first Windows desktop prototype for website testing. It must support one practical non-developer workflow:

1. Create or open a local project.
2. Record a simple Chromium or Edge-family browser flow.
3. Display recorded steps in human-readable form.
4. Allow basic step editing.
5. Run the recorded test locally.
6. Capture a screenshot on failure.
7. Show a simple pass/fail result.
8. Save tests locally.

Development is happening on Fedora Linux, but the final commercial product must target Windows x86/x64 and Windows on ARM.

Four architecture options were evaluated:

- Tauri + React + TypeScript + Rust shell + Playwright service/sidecar.
- Electron + React + TypeScript + Node.js + Playwright.
- .NET / WinUI + Playwright driver.
- Local web app + local runner service.

### Decision

Use Electron + React + TypeScript + Node.js + Playwright for the first MVP implementation stack.

Accepted initial architecture:

- React + TypeScript renderer for the user interface.
- Electron main process for desktop lifecycle, windows, menus, file dialogs, and local privileged operations.
- Typed preload bridge for constrained communication between renderer and main process.
- Node/TypeScript Playwright runner module or Electron utility process for recording and running tests.
- Local file storage for project files, test definitions, run results, screenshots, and simple report artifacts.
- Chromium or Edge-family browser support first, with browser discovery and packaging strategy decided during implementation.
- Windows x64 is the first packaging target.
- Windows on ARM remains a required validation target and known risk.

Tauri, .NET / WinUI, and local web app plus local runner service architectures are deferred for the MVP. They are not rejected forever and may be reconsidered after the Electron MVP proves the recorder-runner workflow.

### Rationale

Electron is recommended for the MVP because it minimizes the distance between the product's hardest requirements and the implementation stack:

- Playwright's primary ecosystem is Node.js.
- Recording, running, screenshot capture, browser channels, and report generation can be developed in TypeScript.
- Fedora development is practical for UI and automation work.
- The product can validate the local recorder-runner loop before investing in a smaller native shell or more complex service architecture.
- Electron has established Windows packaging paths for x64 and arm64, although those still require validation.

Tauri remains attractive for a later commercial shell because of app size and native-shell qualities, but it adds Rust plus Node sidecar complexity before the MVP has proven the workflow.

.NET / WinUI remains attractive for a Windows-native commercial app, but it is a poor fit for Fedora-first MVP iteration and less direct for Playwright recording.

A local web app plus runner service may be useful later for CI, team runners, or remote execution, but it adds service lifecycle and security friction too early.

### Consequences

- The MVP will likely have a larger app footprint than a Tauri or native WinUI app.
- Electron security hardening must be treated as architecture work, not cleanup. The renderer should not receive broad Node.js access.
- IPC contracts between UI, main process, and runner must be typed and narrow.
- Browser automation packaging remains a core risk.
- Windows on ARM is not solved merely by choosing Electron. Playwright has an open issue requesting native Windows Arm64 browser bundle support, so ARM validation must happen early.
- The first implementation plan must include Windows x64 and Windows ARM proof tasks before broad feature work.
- Local file format decisions should be kept simple and migratable.
- Windows x64 packaging should be validated first.
- Windows ARM should not block the first local MVP prototype if Playwright browser support remains unresolved, but the limitation must be documented clearly before commercial release claims.

### Follow-Up Validation Requirements

- Confirm Windows x64 packaging path first.
- Confirm Windows arm64 packaging path or document a validated limitation.
- Confirm Playwright can launch the chosen Chromium/Edge path on Windows x64.
- Confirm Playwright can launch the chosen Chromium/Edge path on Windows ARM or document a validated fallback.
- Confirm Fedora development setup is practical enough for early development.
- Decide whether the first browser target is Playwright-managed Chromium, installed Microsoft Edge, or both behind a simple browser discovery layer.
