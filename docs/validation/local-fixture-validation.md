# Local Fixture Validation Guide

Last updated: 2026-05-07

This guide explains how to use the local validation fixtures to test the runner and recorder without relying on external websites.

## Fixtures Available

| File | Purpose |
|---|---|
| `docs/validation/fixtures/basic-form.html` | Self-contained HTML page with form fields, button, and result message |
| `docs/validation/fixtures/sample-basic-form-test.json` | Pre-built test case JSON for the basic form fixture |

## Opening the Fixture in a Browser

The fixture is a standalone HTML file. Open it directly:

```bash
# From the project root:
chromium docs/validation/fixtures/basic-form.html
# or
firefox docs/validation/fixtures/basic-form.html
# or double-click in your file manager
```

The page shows a "Contact Form" with:
- A heading: "Contact Form"
- A "Need help?" link
- Name input (`#name-input`, `data-testid="name-input"`)
- Email input (`#email-input`, `data-testid="email-input"`)
- Message textarea (`#message-textarea`, `data-testid="message-textarea"`)
- Submit button (`#submit-button`, `data-testid="submit-button"`)
- Hidden result message (`#result-message`, `data-testid="result-message"`)

## Stable Selectors

All interactive elements have both `id` and `data-testid` attributes:

| Element | CSS Selector | data-testid |
|---|---|---|
| Page heading | `h1` | `page-heading` |
| Help link | `#help-link` | `help-link` |
| Name input | `#name-input` | `name-input` |
| Email input | `#email-input` | `email-input` |
| Message textarea | `#message-textarea` | `message-textarea` |
| Submit button | `#submit-button` | `submit-button` |
| Result message | `#result-message` | `result-message` |

## Using with the Recorder

1. Start the app: `npm run dev`
2. Create or open a project
3. Click **Start Recording** in the Recorder panel
4. In the Chromium window that opens, navigate to the fixture file:
   - Type the full `file://` path in the address bar, e.g. `file:///home/ferdoraserver/Documents/website-testing-tool/docs/validation/fixtures/basic-form.html`
5. Interact with the page:
   - Fill in the name field
   - Fill in the email field
   - Type a message in the textarea
   - Click Submit
6. Click **Stop Recording**
7. Review the captured steps in the preview list

**Expected captured actions:**
- `navigate` — Go to the fixture URL
- `fill` — Enter name
- `fill` — Enter email
- `fill` — Enter message
- `click` — Click Submit

## Using with Manually Created Steps

### Option A: Use the sample test JSON

1. Copy `docs/validation/fixtures/sample-basic-form-test.json` to your project's `tests/` directory
2. **Important:** Edit the `target` of the `navigate` step to use your actual file path:
   ```json
   "target": "file:///home/your-username/Documents/website-testing-tool/docs/validation/fixtures/basic-form.html"
   ```
3. Open the project in the app
4. The test appears in the test list
5. Select it and click **Run test**

### Option B: Create steps manually in the editor

1. Create a new test in the app
2. Add steps in the step editor:

| Step | Type | Label | Target | Value |
|---|---|---|---|---|
| 1 | navigate | Open basic form fixture | `file:///path/to/basic-form.html` | — |
| 2 | fill | Enter full name | `#name-input` | `Jane Doe` |
| 3 | fill | Enter email address | `#email-input` | `jane@example.com` |
| 4 | fill | Enter message text | `#message-textarea` | `Hello, this is a test message.` |
| 5 | click | Click Submit button | `#submit-button` | — |
| 6 | assertText | Check confirmation message | `#result-message` | `Thank you, Jane Doe! Your message has been received.` |

3. Click **Save**
4. Click **Run test**

## Expected Results

### Passing run

If all steps execute correctly:
- The run badge shows **PASSED** (green)
- All 6 steps show `passed` status
- Duration is displayed
- A result JSON is saved to `results/run-{id}.json`

### Failing run (example)

To test failure behavior, change the `assertText` value to something that won't match:
- Set value to `"Wrong text"`
- Run the test
- The run badge shows **FAILED** (red)
- Step 6 shows `failed` with an error message
- A screenshot is saved to `artifacts/screenshots/run-{id}/step-5-failure.png`

## Inspecting Run Results

1. After running, the result appears inline in the test detail view
2. The **Results** panel at the bottom of the workspace lists all runs
3. Click a run to see full details: status, browser, duration, timestamps, step results
4. Result JSON files are at `{projectPath}/results/run-{id}.json`
5. Failure screenshots are at `{projectPath}/artifacts/screenshots/run-{id}/step-{n}-failure.png`

## Known Limitations

- The `file://` URL in the sample test JSON must be updated to match your local path
- The recorder may not capture the initial `navigate` to a `file://` URL as cleanly as an `http://` URL
- The fixture does not test network-dependent behavior (slow loads, timeouts, redirects)
- The fixture is intentionally simple — it does not test complex selectors, iframes, or shadow DOM
- `assertText` steps must be added manually; the recorder does not capture assertions
