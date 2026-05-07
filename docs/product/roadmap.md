# Roadmap

Last updated: 2026-05-06

This roadmap is directional and should evolve as research, architecture validation, and user feedback improve. Phase 1 is intentionally narrow so the first commercial prototype can prove the local recorder-runner loop before broader platform features are added.

## Phase 0: Research And Architecture

- Validate competitor and community pain points.
- Refine target personas and top workflows.
- Refine MVP scope for a realistic first commercial prototype.
- Evaluate desktop technology options.
- Validate Windows x86/x64 and Windows ARM feasibility.
- Choose initial architecture.
- Create first implementation plan.

## Phase 1: MVP Recorder And Local Runner

Goal: prove one complete local workflow for a non-developer tester.

- Create and open a local project.
- Record a simple browser flow.
- Support Chromium or Edge first.
- Convert recorded actions into human-readable steps.
- Allow basic step editing.
- Save and load one or more local test cases.
- Run a recorded test locally.
- Show simple pass/fail status.
- Capture and display a screenshot on failure.
- Store basic run result metadata locally.

Phase 1 should not include:

- Cloud execution.
- Enterprise RBAC.
- Complex integrations marketplace.
- Full test management.
- Advanced analytics.
- Full AI self-healing.
- Mobile or load testing.
- Complex licensing.

## Phase 2: Reporting And Reliability

- Add HTML report.
- Add JSON and JUnit outputs.
- Capture console logs.
- Improve screenshots and failure context.
- Add basic trace or step timeline.
- Improve locator generation.
- Add initial flaky test signals after enough run data exists.
- Add guided selector repair workflow.

## Phase 3: Non-Developer UX Polish

- Improve onboarding.
- Polish visual test editor.
- Add clearer assertion flows.
- Improve empty states and error messages.
- Add keyboard navigation and accessibility passes.
- Validate workflows with non-developer users.
- Add simple test organization if Phase 1 usage shows it is needed.

## Phase 4: Advanced Developer Features

- Add optional scripting mode.
- Add reusable components.
- Add variables, environments, and test data.
- Add suites and tags.
- Add advanced debugging tools.
- Explore plugin architecture.
- Add optional CI/CD integration.

## Phase 5: Commercial Packaging And Licensing

- Build Windows installers.
- Validate Windows x86/x64 packaging.
- Validate Windows on ARM packaging.
- Add licensing and activation model.
- Add update mechanism.
- Add crash and diagnostic log collection strategy.
- Prepare commercial documentation and support workflows.
