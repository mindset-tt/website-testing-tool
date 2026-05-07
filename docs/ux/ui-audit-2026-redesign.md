# UI Audit — 2026 Redesign

Date: 2026-05-07  
Auditor: Codex (reviewing current renderer shell against DESIGN.md direction)

---

## What feels weird

### 1. Sidebar is too wide and blocky
- Current sidebar width: 280px. Too wide for 4 nav items. Should be 240px.
- Nav items are 58px tall — too tall. Feels like a mobile touch target, not a desktop workbench.
- Nav icons are in a 36x36px bordered box, which adds visual weight. This pattern looks like a dashboard widget, not navigation.
- Active item has a purple-filled icon box (`#6f63ff`) — too much colored surface. Accent should be subtle.
- Missing left-edge accent indicator bar (3px strip) for active nav — a common desktop pattern.

### 2. Brand block is heavy
- Brand mark is white-filled (`#f3f5ff`) which competes visually with everything.
- "WT" inside a white box reads more like a component library demo than a shipped product.

### 3. Workspace header has duplicate controls
- The top header always shows "Open" and "New test" buttons, even when a project is open and the overview/project-strip already has the same controls.
- "New test" button is always present but disabled when no project is open — should be hidden.
- Header actions compete with the project strip actions.

### 4. Project strip repeats create/open aggressively
- When a project is open, the project strip (banner) shows the project info AND the project creation controls (name input + Create + Open).
- This means: user already has a project open, but the UI still offers "Create new project" and "Open project" right next to the current project name. Confusing.
- The project strip should show project info + contextual actions (e.g., "Switch project"), not full project creation controls.

### 5. Overview page layout is unbalanced
- Left panel "Validation cockpit" takes 1fr, right panel "Recent tests" takes 360px.
- The left panel has a metrics grid (4 cards) and a workflow board (3 rows). Both are very flat and similar-looking.
- The right panel shows a compact test list — useful but cramped.
- At 1366px, the left panel gets squished while the right stays 360px.
- The metrics cards feel like a dashboard, not a workbench. They'd be more useful as a quick-status row.

### 6. Tests page three-column layout is fragile
- Grid: 320px | 1fr | 320px.
- At comfortable widths the center is spacious but the side panels feel narrow.
- At 1400px breakpoint, the right panel drops to grid-column: 2 (below center), which feels disconnected.
- The right "Run" panel has a single Run button and three inspector cards — lots of space for minimal info.
- The test list (left panel) scrolls independently — at 320px it's tight for longer test names.

### 7. Step editor fields are cramped
- 4-column grid: 112px | 1fr | 1fr | 112px for type/label/target/timeout.
- "Notes" field spans 2 columns but sits on a separate row, making each step card tall.
- "Label" spans 2 columns (because "step-field-label" class) but that's inconsistent with the other field widths.
- 112px for "Type" dropdown is tight — the select text "assertText" may truncate.
- 112px for "Timeout (ms)" is fine but the narrow label wraps unnecessarily.
- Delete button is "Delete" text in a colored border — should be a ghost icon button (trash icon).

### 8. Recorder page has giant empty browser placeholder
- The canvas area is `min-height: 390px`, filled with a centered placeholder when idle.
- This is the worst offender for "giant empty black space."
- The URL bar is a decorative mock (no real URL input, just ellipsis text).
- The placeholder icon is purple accent — should be muted gray for idle.
- No clear instructions on what recording does or how to use it.

### 9. Results page empty state is too plain
- Empty state is a single line of text: "No run results yet. Run a test to see results here."
- No icon, no structure, no visual container — just text floating in the panel.
- When results DO exist, the report items are compact but the detail section below feels bolted on.

### 10. General color issues
- Too many purple touches: nav active icon background, empty space icons, metric card icons, recorder placeholder icon, compact list icons.
- The accent color (`#6f63ff`) appears on 6+ different types of elements, diluting its meaning.
- Background `#07080b` is dangerously close to pure black — should be `#0b0d12`.
- Panel background `#10131a` is very close to canvas `#0b0d12` — distinction is barely visible.

### 11. Typography is inconsistent
- Page title: 1.72rem (~27.5px) — not a clean number. Should be 28px.
- Section headings: some are 1rem (16px), some are 1.45rem (23px), some are 0.98rem (~15.7px).
- Status text in nav: 0.76rem (~12.2px) — too small.
- Brand name: 0.95rem (~15.2px). Brand context: 0.78rem (~12.5px). Both slightly off.
- No consistent type scale.

### 12. Borders and radii are inconsistent
- Panel radius: 8px in some places, 14px in the DESIGN.md spec.
- Nav items: 8px radius. Buttons: also 8px. Should be 10px.
- Some borders are `#20242d`, some are `#242a36`, some are `#222835`. Three subtly different border blues.

---

## Layout problems

1. **Sidebar too wide (280px → 240px).**
2. **Workspace padding 26px 28px — not on 8px grid.** Should be 24px (sp-6).
3. **Project strip padding 16px 18px — not on grid.** Should be 16px (sp-4).
4. **Empty workspace height 240px min — arbitrary.** Should be 200px.
5. **Test workbench side columns 320px — reasonable but the center column gets squeezed at common widths.**
6. **Overview grid right panel fixed 360px — should use minmax or be flexible.**
7. **Media query at 1400px drops right panel awkwardly.**

---

## Hierarchy problems

1. **Page header duplicates project controls from the project strip.**
2. **Project strip shows creation controls even when a project is open.**
3. **"New test" button in header is always visible, disabled when no project.**
4. **Overview page has "Open" links in workflow rows AND top header AND project strip.**
5. **Run panel has both a "Run test" button and inspector cards — the button competes with the cards for attention.**
6. **Step editor "Add step" and "Save" are both in the header — equal weight. Save should be primary.**

---

## Spacing problems

1. **Gap between step cards: 10px instead of 8px.**
2. **Step card padding: 12px (close to sp-3).**
3. **Panel padding inconsistent: sometimes 18px, sometimes 16px.**
4. **Metric card padding: 14px — not on grid.**
5. **Compct list row padding: 9px 10px — not on grid.**
6. **Step field labels are `gap: 5px` — should be 6px or 8px.**

---

## Component problems

1. **StatusBadge needs a standalone component file rather than being defined inside AppShell.**
2. **No reusable Button component — button styles are CSS class-based, which works but makes it easy to miss hover/focus/disabled.**
3. **No PageHeader component — each section manually constructs its title area.**
4. **No EmptyState component — empty states are a mix of div.patterns.**
5. **StepEditor is a single large component — could extract StepCard, StepFieldRow.**
6. **RecorderPanel mixes layout, state, and placeholder rendering in one component.**

---

## What should be improved first

1. **CSS design tokens** — consolidate all colors, spacing, typography into :root variables.
2. **Sidebar** — reduce width, tighten nav items, add accent bar, clean up brand.
3. **Project banner** — remove create/open controls when project is open; show project info compactly.
4. **Page headers** — consistent pattern across all pages.
5. **Empty states** — consistent component with icon + title + description + action.
6. **Step editor** — cleaner field grid, ghost delete button, consistent spacing.
7. **Recorder** — better idle state with instructions, cleaner URL bar.
8. **Results** — proper empty state, more scannable list.
9. **Button consistency** — normalize heights (36px standard), radii (10px), padding.

---

## What must not change

- **Recorder behavior** — start/stop IPC, Chromium launch, step capture logic.
- **Runner behavior** — test execution, screenshot-on-failure, result storage.
- **IPC channels** — `project:*`, `testCase:*`, `runner:run`, `recorder:*`, `result:*`.
- **Storage schemas** — `project.json`, test case JSON, run result JSON formats.
- **Packaging** — `electron-builder` config, `package.json` build scripts.
- **Test case creation logic** — unique naming, file naming via `toTestCaseFileName`.
- **All 62 unit tests** — must continue passing.
