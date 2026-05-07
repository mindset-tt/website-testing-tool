# Decision Log

This file records durable project decisions in short form. Larger architecture decisions should also be captured in `docs/architecture/architecture-decision-record.md`.

## 2026-05-06: Initial Project Decisions

### Decisions

- Use a local documentation-first workflow.
- Use the current Fedora Linux development environment for planning and early development.
- Target Windows x86/x64 and Windows on ARM for the final product.
- Perform research before implementation.
- Treat `AGENTS.md` as the required behavior contract for Codex and future AI coding agents.

### Rationale

The product scope is broad and commercially ambitious. Starting with documentation reduces wasted implementation work, keeps assumptions visible, and gives future agents a reliable handoff path.

### Consequences

- Implementation code must wait until MVP and architecture decisions are validated.
- Memory files must stay current.
- Research notes must clearly separate hypotheses from validated facts.
