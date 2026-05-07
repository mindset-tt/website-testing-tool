# AGENTS.md

This file is the operating contract for Codex and any future AI coding agent working in this repository.

## 1. Mission

Build the foundation for a commercial-grade, all-in-one Windows desktop application for website testing. The product should help teams create, maintain, run, debug, and report browser-based tests with lower setup friction and fewer flaky failures than typical record-and-playback tools.

The repository is currently documentation-first. Implementation must wait until the MVP scope and technical architecture are validated.

## 2. Product Vision

The product should become a serious, paid desktop tool for website testing that is easy enough for non-developer QA testers and powerful enough for developers and automation engineers.

It should eventually support:

- Browser recording.
- No-code test creation.
- Visual test editing.
- Human-readable steps.
- Smart locator generation.
- Self-healing selector assistance.
- Playwright-style auto-waiting.
- Screenshots, video, traces, console logs, and network logs.
- Failure diagnostics.
- Flaky test detection.
- Reusable components.
- Variables, test data, environments, suites, and tags.
- HTML, JSON, and JUnit reports.
- Optional PDF reports later.
- Optional scripting mode for developers.
- Optional CI/CD integration later.

## 3. Target Users

Design and engineering decisions must consider these users:

- Non-developer QA testers.
- Manual testers.
- Business analysts.
- Small QA teams.
- Startup founders.
- Automation engineers.
- Developers.
- DevOps engineers.
- QA leads.

The product must not assume every user can read code, understand CSS selectors, or debug browser automation internals.

## 4. Commercial Thinking Rules

- Treat reliability, trust, and low maintenance as product features.
- Prefer workflows users would pay for over demos that only look impressive.
- Avoid flashy features that increase support burden without solving a real testing pain.
- Keep the UI clean, serious, and professional; avoid overly glossy, toy-like, or obviously AI-generated design.
- Preserve a path toward licensing, packaging, onboarding, and support.
- Consider Windows installer quality, update experience, offline behavior, and logs as part of the commercial product.
- Do not copy competitors feature-for-feature. Learn from them, then choose the smallest valuable product path.

## 5. Development Rules

- Do not start implementation before the MVP and architecture are intentionally chosen.
- Keep work small and reversible.
- Prefer simple, inspectable local-first behavior.
- Use existing project decisions before inventing new patterns.
- Write code only when it directly serves an accepted plan.
- Keep platform compatibility visible in every architecture decision.
- Avoid hidden cloud dependencies unless explicitly approved.
- Keep source, scripts, tests, and generated artifacts separated.
- Document assumptions in the relevant docs file instead of burying them in chat history.

## 6. Research Rules

- Validate market, competitor, and user-pain assumptions with real sources before treating them as facts.
- Date research notes and distinguish evidence from hypothesis.
- Prefer primary sources, product documentation, release notes, public issue trackers, support forums, and user reviews when appropriate.
- Capture links and short summaries rather than pasting long copied text.
- When research changes product direction, update the decision log and memory files.
- Do not use outdated market claims without checking whether they are still true.

## 7. Token / Context Reduction Rules

- Start each work session by reading the memory files, not the entire repository.
- Keep memory files concise and current.
- Summarize long discussions into `docs/memory/current-state.md`, `docs/memory/next-actions.md`, and `docs/memory/known-issues.md`.
- Prefer updating focused docs over duplicating the same information in many files.
- Do not paste full documents into chat unless explicitly requested.
- When handing off work, record the next useful action and any blockers.
- Remove stale assumptions from memory files when they are superseded.

## 8. Required Work Loop

Every agent must follow this loop:

1. Read `docs/memory/current-state.md`.
2. Read `docs/memory/next-actions.md`.
3. Read `docs/memory/known-issues.md`.
4. Choose the next smallest valuable task.
5. Implement only that task.
6. Run relevant checks.
7. Fix failures.
8. Update docs.
9. Update memory files.
10. Write a dated log in `docs/logs/`.
11. Stop after one meaningful unit of work unless explicitly asked to continue.

## 9. Documentation Update Rules

- Update documentation in the same change as any meaningful product, architecture, UX, or process decision.
- Keep `docs/memory/current-state.md` accurate enough for a new agent to resume quickly.
- Keep `docs/memory/next-actions.md` prioritized.
- Keep `docs/memory/known-issues.md` focused on risks and blockers.
- Record durable decisions in `docs/memory/decision-log.md` or `docs/architecture/architecture-decision-record.md`.
- Add dated work logs under `docs/logs/` for meaningful work units.
- Do not let implementation drift ahead of documentation during planning phases.

## 10. Accuracy Rules

- Separate fact, assumption, recommendation, and open question.
- Do not claim a technology supports Windows ARM packaging until it has been validated.
- Do not claim competitor behavior, pricing, or feature gaps without recent evidence.
- Do not claim performance, reliability, or flake reduction without tests or research.
- If uncertain, say what needs validation and where to validate it.
- Use exact dates for research, roadmap, and decision records.

## 11. Testing Rules

- Testing strategy must be defined after the stack decision.
- Once implementation begins, every meaningful feature should include relevant automated checks.
- Prefer tests that validate user workflows and failure diagnostics, not just internal helpers.
- Browser automation tests must account for timing, auto-waiting, screenshots, traces, and reproducibility.
- Packaging and installer tests must eventually cover Windows x86/x64 and Windows on ARM.
- If checks cannot be run on Fedora, document the limitation and the required Windows validation step.

## 12. Git / Change Safety Rules

- Assume the working tree may contain user changes.
- Never revert user changes unless explicitly instructed.
- Keep edits scoped to the current task.
- Review existing file content before editing.
- Avoid destructive Git commands.
- Do not create large unrelated refactors.
- Do not commit unless the user asks.
- Explain any generated files or artifacts.

## 13. Final Product Compatibility Requirement

- Development currently happens on Fedora Linux.
- The final product targets Windows x86/x64 and Windows on ARM.
- Architecture, dependencies, packaging, automation engines, installers, and update mechanisms must be evaluated against those Windows targets before a final stack is chosen.
