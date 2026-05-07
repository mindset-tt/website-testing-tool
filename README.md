# Website Testing Tool

Website Testing Tool is the early foundation for a commercial-grade Windows desktop application for website testing. The product is intended to combine browser recording, no-code test creation, visual editing, reliable local execution, and strong failure diagnostics in one professional desktop tool.

The project is currently in MVP implementation and Windows validation. The first technical stack has been accepted, dependencies are installed, and the core local prototype workflow is being validated.

## Who It Is For

The product is being designed for:

- Non-developer QA testers.
- Manual testers.
- Business analysts.
- Small QA teams.
- Startup founders.
- Automation engineers.
- Developers.
- DevOps engineers.
- QA leads.

The goal is to make simple website tests approachable for non-developers while preserving enough power, observability, and extensibility for technical users.

## Intended Features

Future versions may include:

- Browser recording.
- No-code test creation.
- Visual test editor.
- Human-readable test steps.
- Smart locator generation.
- Self-healing selector assistance.
- Playwright-style auto-waiting.
- Screenshots, video recording, trace capture, console logs, and network logs.
- Failure diagnostics and flaky test detection.
- Reusable components, variables, test data, environments, suites, and tags.
- HTML, JSON, and JUnit reports.
- Optional PDF reports later.
- Optional scripting mode for developers.
- Optional CI/CD integration later.

## Current Status

- **MVP workflow implemented:** project create/open, manual step editor, browser recording, test runner, and simple result view.
- **Shell:** design-md-inspired desktop workbench with a dark enterprise QA surface, focused project, tests, recorder, and results sections, and compact operational panels.
- **Stack:** Electron + React + TypeScript + Node.js + Playwright (accepted in ADR-0002).
- **Storage:** Local file-based (JSON) with path traversal protection.
- **Tests:** 62 unit tests passing.
- **Packaging:** electron-builder configured for Windows x64 (NSIS installer + portable). See `docs/architecture/packaging-plan.md`.
- **Next focus:** Interactive Windows x64 workflow validation now that packaging and dev launch are working on Windows.

## Packaging Status

| Target | Status |
|---|---|
| Windows x64 (NSIS installer) | Builds successfully on Windows 11 Pro |
| Windows x64 (portable) | Builds and launches successfully on Windows 11 Pro |
| Windows ARM64 | Deferred — Playwright ARM64 browser support pending |
| Code signing | Deferred for MVP |
| Auto-update | Deferred for MVP |

### Build Commands

```bash
npm run dev              # Start development server and Electron app
npm run build            # Typecheck + production build
npm run test             # Run 62 unit tests
npm run package:win      # Build + package for Windows x64
npm run package:win:portable  # Build + portable Windows x64
```

## Repository Structure

```text
website-testing-tool/
├─ AGENTS.md
├─ README.md
├─ docs/
│  ├─ memory/
│  ├─ product/
│  ├─ research/
│  ├─ architecture/
│  ├─ ux/
│  └─ logs/
├─ src/
├─ tests/
└─ scripts/
```

Key areas:

- `AGENTS.md`: required behavior contract for Codex and future AI coding agents.
- `docs/memory/`: compact project memory for handoff and continuation.
- `docs/product/`: product vision, MVP scope, roadmap, and non-goals.
- `docs/research/`: market, competitor, and user-pain research notes.
- `docs/architecture/`: stack evaluation and architecture decision records.
- `docs/ux/`: UX principles and non-developer workflows.
- `src/`: Electron, React, storage, automation, and shared TypeScript source.
- `tests/`: unit tests for implemented MVP behavior.
- `scripts/`: automation, build, packaging, and maintenance scripts.

## How AI Agents Should Work Here

AI agents must follow `AGENTS.md`. In short:

1. Read the memory files first.
2. Choose the next smallest valuable task.
3. Implement only that task.
4. Run relevant checks.
5. Update documentation and memory.
6. Write a dated log in `docs/logs/`.
7. Stop after one meaningful unit of work unless explicitly asked to continue.

Agents must not start implementation code until research, MVP scope, and technical architecture are intentionally validated.

## Development Environment

Development is currently happening on Fedora Linux, with Windows validation on Windows 11 Pro.

Required local tool versions:

- Node.js `>=22.12.0`.
- npm `>=10.0.0`.

Node.js v24.15.0/npm 11.12.1 were validated on Windows x64 for dev launch. The Windows dev launch issue was caused by an inherited `ELECTRON_RUN_AS_NODE=1` environment variable, not by Node v24; `npm run dev` clears that variable before invoking `electron-vite dev`.

The final commercial product is intended to target:

- Windows x86/x64.
- Windows on ARM.

All architecture, dependency, packaging, installer, browser automation, and update decisions must be validated against those Windows targets.

## Development Commands

The initial tooling scaffold uses npm.

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run test
npm run build
```

## Implementation Warning

This is still an MVP prototype. Keep changes aligned with the accepted Electron + React + TypeScript + Node.js + Playwright architecture and avoid adding product features before the next validation task calls for them.
