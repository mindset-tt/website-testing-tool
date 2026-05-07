# User Pain Points

Last researched: 2026-05-06

This is a starter list of pain points to validate through research and user interviews. Public sources currently support the broad shape of the pain, but not yet the priority order for this product's target buyers.

## Common Pain Points To Investigate

- Flaky tests.
- Brittle selectors.
- Hard setup.
- Confusing UI.
- Expensive or opaque licensing.
- Hard debugging.
- Weak reports.
- Bad recorder output.
- Test maintenance burden.
- Poor CI/CD setup.
- Non-developers unable to fix failures.
- Poor Windows packaging.
- Slow test execution.
- Unclear error messages.
- Vendor lock-in.
- Cloud dependency when teams want local control.
- AI/self-healing changes that users cannot inspect or approve.
- Recorder/runner mismatch, where tests pass in the recorder but fail in the command-line runner.

## Research-Backed Pain Themes

### 1. Flakiness And Timing

Public research and community discussions consistently frame flaky tests as a major cost. JavaScript-specific flake research points to async waits, race conditions, operating-system differences, and network stability as common causes. Browser-test tools address this differently through retries, auto-waiting, traces, videos, and cloud flake dashboards.

MVP opportunity:

- Use reliable auto-waiting behavior from the beginning.
- Store enough run metadata to distinguish an application failure from timing, environment, or selector failure.
- Show the failed step, wait condition, timeout, screenshot, and raw technical message together.

### 2. Brittle Selectors And Locator Maintenance

Selector fragility appears across tool categories. Cypress documentation explicitly recommends stable `data-*` attributes and warns against brittle selectors tied to CSS or text that changes. Playwright emphasizes locators and retryability. Testim and testRigor position smart or natural-language locators as a way to reduce element-not-found failures.

MVP opportunity:

- Generate locators with a visible ranking strategy.
- Prefer role, label, accessible name, stable test IDs, and durable attributes before raw CSS/XPath.
- Save alternative locators and explain why the chosen locator is expected to be stable.
- Provide a guided repair workflow instead of silently changing selectors.

### 3. Setup And Packaging Friction

Selenium IDE is easy to start as a browser extension, but command-line execution requires Node, npm, side-runner, and browser drivers. Commercial tools often solve setup through larger platforms, cloud services, or enterprise installers. For this product, Windows packaging quality is itself a product feature.

MVP opportunity:

- Make local setup boring: install app, create project, launch browser, record, run.
- Detect missing browser/runtime dependencies with plain-language fix steps.
- Avoid requiring the first user to configure CI, grids, drivers, or cloud accounts.

### 4. Weak Failure Evidence

Several product pages emphasize screenshots, videos, traces, console logs, DOM data, and root-cause analysis because users need evidence to understand failures. Review signals also show frustration when a tool reports only an element-not-found style message without enough context.

MVP opportunity:

- Capture screenshot on failure in the MVP.
- Add console logs as an early should-have.
- Keep raw technical detail available, but lead with a normal-language explanation.
- Design the report around the question "what happened and what should I try next?"

### 5. No-Code Ceiling And Maintenance Burden

No-code and low-code tools reduce initial creation friction, but public discussions repeatedly warn that maintenance can become expensive when suites grow or when complex scenarios require hidden scripting. This is the central product tension: make creation easy without making ownership opaque.

MVP opportunity:

- Use a constrained, inspectable step model rather than fully free-form natural language.
- Keep each step editable as structured data.
- Leave room for optional scripting later, but do not require scripting for the first simple flow.
- Make reuse and components a post-MVP reliability feature, not a flashy demo feature.

### 6. Pricing, Licensing, And Lock-In Anxiety

Commercial testing tools often sell through enterprise pricing, cloud execution, or feature-gated plans. Public review signals mention price increases, unclear pricing, limited free tiers, and vendor lock-in concerns. These are commercial risks even before implementation.

MVP opportunity:

- Keep local project files portable and inspectable.
- Avoid cloud dependency in the early product.
- Design reports and test definitions so future users do not feel trapped.
- Defer licensing design, but preserve a path toward transparent small-team packaging.

### 7. Non-Developer Repair Gap

Non-developers may be able to record a test, but they often cannot repair failures involving selectors, waits, authentication, environment state, or browser logs. A no-code tool that still requires automation expertise at failure time does not solve the full workflow.

MVP opportunity:

- Build failure repair around user intent: "the login button moved" is more useful than "CSS selector timed out."
- Show screenshot-assisted element selection for broken targets later.
- Explain whether the likely issue is missing element, changed text, navigation, timeout, console error, or environment setup.

## Persona-Specific Hypotheses

### Non-Developer QA Testers

- Need plain-language steps and guided repair workflows.
- May not know how to inspect selectors or browser logs.
- Need failure explanations that identify what changed and what to try next.
- Need confidence that automatic repair will not change test intent without approval.

### Manual Testers

- Need to turn repetitive manual flows into automation without learning a full framework.
- Need confidence that recorded tests are not fragile.
- Need simple reports they can share with teammates.
- Need onboarding that starts with a real recorded flow, not architecture terms.

### Automation Engineers And Developers

- Need access to logs, traces, selectors, source-like structure, and exportable results.
- Need optional scripting and CI/CD paths later.
- Need no-code layers to remain inspectable and deterministic.
- Need local files that can be reviewed, backed up, diffed, and possibly versioned.

### QA Leads

- Need maintainability, reporting, and team-level reuse.
- Need predictable licensing and low onboarding burden.
- Need confidence that early tests can scale into a more serious workflow.
- Need evidence that failures are actionable instead of noisy.

## Sources Consulted

- Flaky test research: <https://arxiv.org/abs/2212.00908>, <https://arxiv.org/abs/2207.01047>, and <https://arxiv.org/abs/2310.05223>
- Selector/self-healing research signal: <https://arxiv.org/abs/2603.20358>
- Playwright official positioning: <https://playwright.dev/>
- Cypress selector and evidence docs: <https://docs.cypress.io/app/core-concepts/best-practices>, <https://docs.cypress.io/app/guides/screenshots-and-videos>, and <https://docs.cypress.io/cloud/features/flaky-test-management>
- Selenium IDE setup and runner docs: <https://www.selenium.dev/selenium-ide/> and <https://www.selenium.dev/selenium-ide/docs/en/introduction/command-line-runner>
- Selenium IDE public issue signal: <https://github.com/SeleniumHQ/selenium-ide/issues/996>
- Testim diagnostics and smart locator docs: <https://docs.tricentis.com/testim/content/overview/testim-overview/testim-automate.htm>
- testRigor plain-English and self-healing positioning: <https://testrigor.com/blog/self-healing-tests/>
- Qualitative no-code maintenance discussion: <https://www.reddit.com/r/softwaretesting/comments/1g4ubfw/has_anybody_tried_nocodelow_code_tool_for_ui/>
