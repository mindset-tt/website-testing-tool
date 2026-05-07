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

## 2026-05-07: Product Style Direction

### Decisions

- Use **Local QA Workbench** as the final product style direction for the desktop app.
- Treat Linear as the primary visual/product reference.
- Use Cursor, Raycast, Sentry, and Stripe as secondary references for workstation framing, control density, diagnostic clarity, and polish.
- Do not copy any reference brand directly.

### Rationale

The product needs to feel trustworthy, local, fast, and commercially serious for QA testers and engineers. A Linear-led blend best supports a dark professional desktop shell, clear workflow structure, and failure-first diagnostic views without drifting into marketing-site styling, AI-brand theatrics, or lifestyle branding.

### Consequences

- Future UI polish should move toward the documented `docs/ux/product-style-direction.md` direction in small, behavior-preserving passes.
- Layout discipline, calm surfaces, and diagnostic clarity should be prioritized over decorative visuals.
- Brand-specific fonts, colors, and signature compositions from reference products should not be copied.
