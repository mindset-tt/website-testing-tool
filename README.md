# Website Testing Tool

Website Testing Tool is the early foundation for a commercial-grade Windows desktop application for website testing. The product is intended to combine browser recording, no-code test creation, visual editing, reliable local execution, and strong failure diagnostics in one professional desktop tool.

The project is currently in the research and planning phase. No implementation code exists yet, dependencies have not been installed, and the final technical stack has not been chosen.

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

- Project initialized.
- Documentation scaffold created.
- Source implementation has not started.
- Current phase: research and planning.
- Next focus: validate MVP scope and choose a technical architecture.

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
- `src/`: future source code after the architecture decision.
- `tests/`: future test suites after the stack decision.
- `scripts/`: future automation, build, packaging, and maintenance scripts.

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

Development is currently happening on Fedora Linux.

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

Only the Electron + React + TypeScript tooling scaffold exists. Recorder, runner, local project storage, reports, and product workflows have not started yet.
