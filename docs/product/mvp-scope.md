# MVP Scope

Last updated: 2026-05-06

This MVP is the first commercial prototype scope, not the full product. It should prove that the product can deliver one trustworthy local website testing loop before expanding into suites, analytics, AI repair, enterprise features, or CI/CD.

## MVP Goal

Help a non-developer tester record a simple browser flow, review it as readable steps, run it locally, understand pass/fail status, and save the test for later reuse.

The MVP should answer one question:

Can this product make the first useful local website test easier to create, run, and understand than a code-first framework or fragile recorder-only tool?

## Primary User

The primary MVP user is a non-developer QA tester or manual tester on a small team.

Secondary users are startup founders, business analysts, automation engineers, and developers who may inspect the result, debug failures, or later help move tests toward CI/CD. The MVP must stay friendly to non-developers without hiding enough detail that technical users lose trust.

## Core User Journey

1. User creates or opens a local project.
2. User starts a new recording.
3. User enters a starting URL.
4. User performs a simple browser flow in Chromium or Edge.
5. User stops recording.
6. App displays recorded actions as human-readable steps.
7. User makes basic edits, such as renaming a step, editing an input value, deleting a noisy step, or adjusting a simple target label.
8. User runs the recorded test locally.
9. App shows a simple pass/fail result.
10. If the run fails, app captures and displays a screenshot for the failed step.
11. User saves the test locally and can reopen it later.

## Must-Have Features

- Create a local project.
- Open an existing local project.
- Record a simple browser flow.
- Display recorded steps in human-readable form.
- Allow basic step editing.
- Run the recorded test locally.
- Capture a screenshot on failure.
- Show a simple pass/fail result.
- Save tests locally.
- Support Chromium or Edge first.

## Must-Have Boundaries

- One local user.
- One local machine.
- One browser family at first: Chromium or Edge.
- One test at a time.
- Simple websites and common flows first: navigation, click, text entry, and basic page state.
- Local project storage only.
- Basic failure evidence only: failed step, screenshot, status, and raw error message if available.
- Basic step editing only: no full visual programming system, no scripting mode, no reusable components.

## Should-Have Features

These are valuable for a commercial prototype, but they should be cut before any must-have item is weakened.

- Basic locator quality rules that prefer stable, readable targets when available.
- Minimal run metadata, such as browser, start time, end time, duration, and failed step.
- Basic console log capture for failed runs.
- Simple HTML report export.
- Ability to duplicate or rename a saved test.
- A plain-language failure summary when the cause is obvious, such as target not found or navigation timeout.
- A small set of built-in example projects or sample tests for onboarding.

## Explicitly Not MVP

- Cloud execution.
- Enterprise RBAC.
- Full AI self-healing.
- Complex integrations marketplace.
- Mobile testing.
- Load testing.
- Full test management suite.
- Advanced analytics.
- Complex licensing.
- Multi-user collaboration.
- Advanced CI/CD integration.
- Visual diff testing.
- API testing.
- Desktop application testing.
- Cross-browser matrix execution.
- Video recording.
- Trace viewer.
- PDF reports.
- Reusable components.
- Variables, environments, and test data management.
- Optional developer scripting mode.

## Quality Bar

- The happy path must feel calm, local, and understandable.
- A first test should be created and run without command-line setup.
- Recorded steps must be readable by a manual tester.
- Basic step editing must not require writing selectors or code.
- A failed run must produce at least one useful screenshot tied to the failed step.
- Saved tests must reopen reliably.
- The app must clearly distinguish product errors from test failures where possible.
- The MVP must not claim self-healing, AI repair, flake detection, or broad browser support unless those behaviors are actually implemented and validated later.
- The user should never need to understand the final technical stack to complete the core journey.

## Success Criteria

The MVP is successful when a representative non-developer tester can:

- Create a local project.
- Record a simple browser flow.
- Understand the recorded steps without reading code.
- Make a basic edit to a recorded step.
- Run the test locally.
- Tell whether the run passed or failed.
- Use a failure screenshot to understand what happened.
- Save, close, reopen, and rerun the test.

Commercial prototype success also requires:

- The first-run experience is short enough to demo without setup drama.
- The product feels serious enough for paid software, even if the feature set is narrow.
- The core workflow exposes obvious architecture needs for the next phase.
- Test definitions and run artifacts are local and inspectable enough to reduce lock-in concerns.

## Risks

- Recorder output may be noisy, brittle, or hard to map into readable steps.
- Basic step editing may be too limited to repair real failures.
- Supporting both Chromium and Edge in the same MVP may be too much if packaging complexity is high.
- Browser automation packaging may dominate the MVP effort.
- Local storage format choices may become hard to migrate if rushed.
- Failure screenshots alone may not be enough for many debugging cases.
- A narrow MVP may look less impressive than broad competitor demos, so the prototype must be noticeably reliable and clear.
- Fedora development may hide Windows packaging problems until explicit Windows validation is scheduled.

## Validation Questions

- Should the first browser target be bundled Chromium, installed Edge, or user-selected Chromium-family browser?
- What is the minimum recording event set: navigation, click, fill, select, checkbox, keyboard, assertion?
- Which step edits are essential for non-developers in the first prototype?
- How should recorded steps be represented on disk so they remain local, inspectable, and migratable?
- What failure evidence is enough for a first commercial prototype: screenshot only, screenshot plus raw error, or screenshot plus console logs?
- What project-file layout makes saved tests easy to back up or version later?
- How much locator detail should be visible in the MVP UI?
- What Windows x86/x64 and Windows ARM packaging constraints affect the architecture choice?
- What can be validated on Fedora before Windows packaging is available?
