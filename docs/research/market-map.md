# Market Map

Last researched: 2026-05-06

This is a starter market map for planning. It now includes an initial source-backed research pass, but category boundaries and buyer priorities still need validation.

## Categories

### No-Code Test Automation

Tools aimed at users who want to create automated tests without writing code. These often emphasize recording, visual editing, reusable steps, and plain-language flows.

Research questions:

- How reliable are generated tests in real teams?
- How easy is failure repair for non-developers?
- Where do users hit pricing or workflow limits?

MVP opportunity:

- Do not compete only on "no code." Compete on the complete non-developer loop: record, edit, run, understand, repair, and report.
- Use structured plain-language steps instead of unconstrained natural language in the first version.

### Low-Code Enterprise Testing

Platforms aimed at larger organizations with governance, reuse, integrations, and broader application coverage.

Research questions:

- Which features matter most to enterprise buyers?
- Which features create complexity for small teams?
- Where do users complain about setup, maintenance, or cost?

MVP opportunity:

- Stay smaller than enterprise platforms. A focused desktop product can be valuable if it is faster to adopt, easier to understand, and more transparent for small QA teams.
- Avoid early enterprise features such as RBAC, ALM replacement, large integration marketplaces, and complex governance.

### Developer-First Browser Automation

Frameworks and tools built primarily for developers and automation engineers. These usually provide strong control, CI/CD fit, and code-based workflows.

Research questions:

- What reliability features should a desktop product adopt?
- What setup complexity can be hidden without losing power?
- How can optional scripting coexist with no-code editing?

MVP opportunity:

- Borrow reliability patterns from developer-first tools: auto-waiting, robust locators, screenshots, traces or timelines, retries metadata, and JUnit/JSON outputs.
- Hide initial setup without hiding evidence or making the test model proprietary and opaque.

### Record-And-Playback Tools

Tools focused on capturing browser actions and replaying them later. These can be fast to start but often struggle with brittle selectors and poor maintainability.

Research questions:

- What makes recorder output maintainable?
- Which recorded steps should be normalized or simplified?
- How much selector detail should be exposed?

MVP opportunity:

- Treat recorder output as draft test intent, not final automation.
- Add a review stage where users can rename steps, add assertions, inspect locators, and remove noisy actions.
- Ensure the same engine that records can also run tests consistently.

### AI-Assisted Testing Tools

Tools using AI or natural language to create, heal, or explain tests. This category needs careful validation because claims may exceed real reliability.

Research questions:

- Which AI-assisted features are genuinely useful?
- Where do AI features create trust or repeatability problems?
- How can failure explanations remain accurate and auditable?

MVP opportunity:

- Delay broad AI promises.
- Start with deterministic diagnostics and transparent locator suggestions.
- If AI is introduced later, make suggestions reviewable, explainable, and reversible.

### Test Management / Reporting Tools

Tools focused on organizing test cases, results, evidence, and releases rather than directly automating browser actions.

Research questions:

- What reporting outputs do small QA teams need first?
- What formats are required for CI/CD and compliance?
- How much test management belongs in the MVP?

MVP opportunity:

- Start with simple local reports: pass/fail, failed step, screenshot, timestamps, browser/environment, and raw error.
- Add HTML, JSON, and JUnit before PDF or dashboard-heavy reporting.
- Make reports useful to both a manual tester and a developer receiving a bug report.

## Category Implications For MVP

- The first wedge should not be "all-in-one" breadth. It should be a trustworthy local website testing loop.
- The product can sit between Selenium IDE simplicity and Playwright reliability.
- The early commercial promise should be lower setup friction, better failure explanation, and reduced maintenance burden.
- The MVP should avoid cloud execution, mobile testing, load testing, enterprise RBAC, and broad AI self-healing.

## Sources Consulted

- Competitor positioning and review sources are listed in `docs/research/competitor-analysis.md`.
- Pain-point research sources are listed in `docs/research/user-pain-points.md`.
