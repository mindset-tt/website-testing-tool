# Non-Developer Workflows

These workflows describe the early product experience for users who do not primarily write code.

## 1. Record First Test

### User Goal

Create a useful automated website test by performing the workflow once in a browser.

### Ideal Steps

1. Create or open a local project.
2. Choose "Record test".
3. Enter the starting URL.
4. Perform actions in the browser.
5. Stop recording.
6. Review generated human-readable steps.
7. Save the test with a clear name.

### UX Risks

- The recorder may capture noisy or irrelevant actions.
- Generated step names may be too technical.
- Login flows, popups, and dynamic content may confuse new users.
- Users may not understand what was saved or how to rerun it.

## 2. Edit Recorded Step

### User Goal

Fix or clarify a recorded action without writing code.

### Ideal Steps

1. Select a recorded step.
2. View plain-language action details.
3. Edit target, value, wait behavior, or description.
4. Preview the selected page element where possible.
5. Save changes.

### UX Risks

- Selector details can overwhelm non-developers.
- Too much abstraction can hide important debugging information.
- Editing a step may accidentally change test meaning.

## 3. Add Assertion

### User Goal

Confirm that the page reached the expected state.

### Ideal Steps

1. Choose where to add an assertion.
2. Pick a simple assertion type, such as text visible, URL contains, element visible, or value equals.
3. Select or enter the expected target.
4. Run the step or test to confirm.

### UX Risks

- Users may not know the difference between an action and an assertion.
- Assertion failures may be hard to interpret.
- Dynamic text or delayed UI updates may create false failures.

## 4. Run Test

### User Goal

Run a saved test locally and know whether it passed.

### Ideal Steps

1. Open a saved test.
2. Select browser and environment if needed.
3. Click run.
4. Watch progress step by step.
5. Review pass/fail status and evidence.

### UX Risks

- Browser launch problems can look like test failures.
- Progress indicators may not explain waiting.
- Users may need clear cancellation and retry behavior.

## 5. Understand Failure

### User Goal

Understand why a test failed and what to do next.

### Ideal Steps

1. Open the failed run result.
2. See the failed step highlighted.
3. View screenshot and plain-language explanation.
4. Expand technical details only if needed.
5. Choose a repair action or rerun.

### UX Risks

- Raw stack traces can intimidate non-developers.
- Screenshots without context may be insufficient.
- The tool may suggest a repair with low confidence.

## 6. Fix Broken Selector

### User Goal

Repair a test when the website changed.

### Ideal Steps

1. Open the failed step.
2. See the old target and why it was not found.
3. Pick the correct element in the browser or screenshot-assisted view.
4. Save the updated locator.
5. Rerun the test or failed step.

### UX Risks

- Users may choose a visually similar but wrong element.
- The tool may hide too much locator detail.
- Automatic repair may reduce trust if it changes behavior silently.

## 7. Export Report

### User Goal

Share test results with teammates, managers, or CI/CD systems.

### Ideal Steps

1. Open a run result or suite result.
2. Choose export format.
3. Generate HTML, JSON, or JUnit output.
4. Save the report locally.
5. Confirm where the report was written.

### UX Risks

- Reports may omit evidence needed to understand failures.
- Technical formats may confuse non-developers.
- Large screenshots, videos, or traces may make reports hard to share.
