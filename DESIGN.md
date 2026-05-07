# DESIGN.md

Visual system for the Website Testing Tool — a local QA workbench for Windows.

---

## 1. Product design identity

**Who we are:** A serious, paid Windows desktop application for QA testers and engineers.  
**What we feel like:** A professional workbench — calm, fast, precise, restrained.  
**What we do not feel like:** A sci-fi dashboard, a game, a toy, a generic AI-generated dark UI, a copy of Linear/Raycast/Vercel.

The product must earn trust through visual discipline, not decoration. Every pixel should communicate reliability.

---

## 2. Design principles

1. **Restraint over decoration.** Use fewer colors, fewer fills, fewer borders. Let space do the work.
2. **Clear hierarchy.** Every page has one primary action, one primary content area, and deliberate secondary zones.
3. **Intentional spacing.** Everything sits on an 8px grid. Nothing is "roughly spaced."
4. **Calm dark canvas.** Backgrounds recede. Content and controls advance. No strong glow.
5. **Controlled accent.** One accent color used only for: primary action, selected state, focus rings. Never decorative.
6. **Readable typography.** Font sizes follow a strict scale. No tiny critical text.
7. **Professional, not glossy.** Subtle 1px borders. Soft 10–14px radii. No gradients, no glow, no glassmorphism.
8. **Accessible by default.** All interactive elements have focus, hover, disabled states. Contrast meets WCAG AA.

---

## 3. Color tokens

All colors are expressed as CSS custom properties on `:root`.

```css
:root {
  /* Canvas */
  --color-canvas-default: #0b0d12;
  --color-canvas-inset: #080a0f;
  --color-canvas-raised: #11141c;

  /* Surfaces */
  --color-surface-default: #131620;
  --color-surface-raised: #181c26;
  --color-surface-overlay: #1c2030;

  /* Borders */
  --color-border-default: #1f2533;
  --color-border-subtle: #1a1e28;
  --color-border-strong: #2a3140;
  --color-border-accent: #4a4580;

  /* Text */
  --color-text-primary: #e8ecf4;
  --color-text-secondary: #8b95a8;
  --color-text-dim: #5a6270;
  --color-text-inverse: #0b0d12;

  /* Accent */
  --color-accent-default: #7b6ff0;
  --color-accent-hover: #8e84f4;
  --color-accent-pressed: #6a5edb;
  --color-accent-subtle: rgba(123, 111, 240, 0.12);
  --color-accent-subtle-hover: rgba(123, 111, 240, 0.20);

  /* Semantic */
  --color-success-default: #45c980;
  --color-success-subtle: rgba(69, 201, 128, 0.12);
  --color-warning-default: #e8b44f;
  --color-warning-subtle: rgba(232, 180, 79, 0.12);
  --color-danger-default: #ef5a6b;
  --color-danger-subtle: rgba(239, 90, 107, 0.12);
  --color-info-default: #5b9cf0;
  --color-info-subtle: rgba(91, 156, 240, 0.12);

  /* Focus */
  --color-focus-ring: #7b6ff0;
}
```

### Usage rules

| Token | Where |
|-------|-------|
| `canvas-default` | Page background, main workspace |
| `canvas-inset` | Sidebar background |
| `canvas-raised` | Cards, panels, dialogs (resting surface) |
| `surface-default` | Elevated cards, dropdown surfaces |
| `surface-raised` | Hover states on cards |
| `surface-overlay` | Modal backdrops, tooltip backgrounds |
| `border-default` | Default element borders |
| `border-subtle` | Between sections in same surface |
| `border-strong` | Focused input borders, active states |
| `border-accent` | Selected item borders |
| `text-primary` | Headings, body text, labels |
| `text-secondary` | Descriptions, metadata, placeholder text |
| `text-dim` | Disabled text, timestamps, non-critical info |
| `accent-default` | Primary buttons, selected nav items, links |
| `accent-hover` | Primary button hover |
| `accent-pressed` | Primary button active |
| `accent-subtle` | Selected row background, accent badge bg |
| `semantic colors` | Status badges, icons, alerts |

---

## 4. Typography rules

Font stack: `Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`  
Monospace stack: `ui-monospace, "SF Mono", "Cascadia Code", "Consolas", monospace`

### Type scale

| Token | Size | Weight | Line-height | Use |
|-------|------|--------|-------------|-----|
| `text-2xl` | 28px | 700 | 1.2 | Page titles |
| `text-xl` | 20px | 680 | 1.25 | Section headings |
| `text-lg` | 16px | 650 | 1.35 | Card titles, dialog titles |
| `text-base` | 14px | 500 | 1.45 | Body text, input text, list items |
| `text-sm` | 13px | 500 | 1.4 | Metadata, descriptions, secondary info |
| `text-xs` | 12px | 600 | 1.3 | Eyebrows (uppercase), badges, labels |
| `text-mono` | 13px | 450 | 1.5 | Code, file paths, IDs |

### Rules
- Headings use `font-weight` 650–700, not 400 or 800.
- Body text is 14px minimum. Never 11px or 12px for user-written content.
- Eyebrows are 12px, uppercase, letter-spacing 0.04em, font-weight 600.
- Monospace text is 13px and only for technical identifiers, file paths, IDs.

---

## 5. Spacing scale

8px base unit. All spacing uses multiples of 8.

| Name | Value | Use |
|------|-------|-----|
| `sp-1` | 4px | Tight icon gaps, badge internal padding |
| `sp-2` | 8px | Element gap in compact lists, field gap |
| `sp-3` | 12px | Standard gap between related elements |
| `sp-4` | 16px | Card padding (default), section gap |
| `sp-5` | 20px | Larger section spacing |
| `sp-6` | 24px | Page padding, major section separation |
| `sp-8` | 32px | Large layout gaps |
| `sp-10` | 40px | Hero section spacing |
| `sp-12` | 48px | Maximum spacing |

### Rules
- Card inner padding: always 16px (sp-4).
- Related form fields: 8px gap (sp-2).
- Panel sections: 16px between sections (sp-4).
- Page content padding: 24px (sp-6) on all sides.
- List item gap: 8px (sp-2).

---

## 6. Border radius and borders

### Radius

| Token | Value | Use |
|-------|-------|-----|
| `radius-sm` | 6px | Badges, small chips, inline code |
| `radius-md` | 10px | Buttons, inputs, cards, panels, list items |
| `radius-lg` | 14px | Large cards, dialogs, modals |
| `radius-full` | 999px | Pills, status dots |

### Borders
- Default border: `1px solid var(--color-border-default)`.
- Subtle border: `1px solid var(--color-border-subtle)` (used between sections on same surface).
- No borders on hover-only states — use background change instead.
- Never use 2px or thicker borders except for focus rings.

---

## 7. Surface hierarchy

Layered from back to front:

1. **Canvas (background)** — `color-canvas-default`. The page background. No border.
2. **Inset canvas** — `color-canvas-inset`. Sidebar. Slightly darker than canvas.
3. **Raised canvas** — `color-canvas-raised`. Cards, panels. Has `border-default`.
4. **Surface** — `color-surface-default`. Elevated panels, dropdowns. Has `border-default`.
5. **Raised surface** — `color-surface-raised`. Hovered cards, active states.
6. **Overlay** — `color-surface-overlay`. Modal backdrops, tooltips. Optional shadow.

### Rules
- At most 3 distinct surface levels visible at once.
- Sidebar always uses `canvas-inset`.
- Cards/panels always use `canvas-raised`.
- Never use pure black `#000000` as a surface color.
- Never use transparent overlays without a solid surface fallback.

---

## 8. Buttons

Three button tiers:

### Primary
- Background: `accent-default`
- Text: `text-inverse` (near-black)
- Hover: `accent-hover`
- Pressed: `accent-pressed`
- Disabled: opacity 0.45
- Height: 36px
- Padding: 8px 14px
- Radius: `radius-md` (10px)
- Font: `text-sm` (13px), weight 650

### Secondary
- Background: `transparent`
- Border: `border-default`
- Text: `text-primary`
- Hover: background `accent-subtle`, border `border-strong`
- Pressed: background `accent-subtle-hover`
- Disabled: opacity 0.45
- Height: 36px
- Padding: 8px 14px
- Radius: `radius-md` (10px)
- Font: `text-sm` (13px), weight 600

### Ghost
- Background: `transparent`
- No border
- Text: `text-secondary`
- Hover: background `canvas-raised`, text `text-primary`
- Disabled: opacity 0.45
- Height: 32px
- Padding: 6px 10px
- Radius: `radius-md` (10px)
- Font: `text-sm` (13px), weight 500

### Icon-only button
- Square, 36x36px
- Secondary styling
- Centers a 16-18px icon

### Rules
- One primary button per view maximum.
- "Create" and primary action is always primary style.
- "Cancel", "Close", back-navigation is ghost or secondary.
- Destructive actions (Delete) use `danger-default` color, transparent background.

---

## 9. Inputs

### Text input / Select
- Background: `canvas-default`
- Border: `border-default`
- Text: `text-primary`
- Placeholder: `text-dim`
- Height: 36px
- Padding: 8px 12px
- Radius: `radius-md` (10px)
- Focus: border `accent-default`, box-shadow `0 0 0 3px accent-subtle`
- Disabled: opacity 0.45
- Label: `text-xs` (12px), weight 600, color `text-secondary`, margin-bottom 6px

### Rules
- All inputs must have visible labels.
- Placeholder text should be example values, not field descriptions.
- Use `min-height` not fixed `height` for multiline textareas.
- Select elements match text input styling exactly.

---

## 10. Cards and panels

### Card (clickable list item)
- Background: `canvas-raised`
- Border: `border-default`
- Hover: border `border-strong`
- Selected: background `accent-subtle`, border `border-accent`
- Padding: 12px 14px
- Radius: `radius-md` (10px)
- Minimum height: defined by content + padding

### Panel (static container)
- Background: `canvas-raised`
- Border: `border-default`
- Padding: 16px
- Radius: `radius-lg` (14px)
- Inner sections separated by `border-subtle`

### Rules
- Cards have hover states. Panels do not.
- Panel headers use `text-lg` (16px), weight 650.
- No double borders — if a card is inside a panel, the card border is sufficient.

---

## 11. Sidebar navigation

- Width: 240px fixed.
- Background: `canvas-inset`.
- Right border: `1px solid border-default`.
- Brand area: 60px tall, contains app icon + name.
- Nav items: 44px tall, 8px gap between items.
- Nav item padding: 10px 12px.
- Nav item radius: `radius-md` (10px).
- Active item: background `accent-subtle`, left 3px accent indicator bar, text `text-primary`.
- Inactive item: text `text-secondary`.
- Disabled item: opacity 0.4, cursor not-allowed.
- Nav item icon: 18px, color inherits from item text.
- Footer status: 40px tall, text `text-dim`, 12px font.

---

## 12. Page headers

Every page has a consistent header block:

- Top: eyebrow label (12px, uppercase, `text-dim`, letter-spacing 0.04em, margin-bottom 4px).
- Middle: page title (28px, weight 700, `text-primary`, margin-bottom 4px).
- Bottom (optional): helper text (13px, `text-secondary`).
- Right side (optional): primary action button(s).
- Header bottom padding: 16px.
- Separated from content by 8px gap (not a border line).

---

## 13. Empty states

Empty states follow a consistent pattern:

- Centered in available space (vertically and horizontally).
- Icon: 32px, color `text-dim`.
- Title: `text-lg` (16px), weight 650, `text-primary`, margin-top 12px.
- Description: `text-sm` (13px), `text-secondary`, max-width 420px, margin-top 6px.
- Action: optional button below description, margin-top 16px.

### Rules
- Never let an empty state fill an entire page with dead space. Give it a bordered card container.
- Empty states must explain **what will appear here** and **how to make it appear**.
- Icon color should be `text-dim`, not accent, to keep visual calm.

---

## 14. Step editor design

### Step card
- Background: `canvas-default` (slightly inside panel).
- Border: `border-subtle`.
- Radius: `radius-md` (10px).
- Padding: 12px.
- Gap between cards: 8px.

### Step header
- Left: step number (e.g. "Step 3") in `text-xs` weight 700, color `text-secondary`.
- Right: delete button (ghost danger).
- Height: 28px.

### Step fields grid
- 4-column grid: type (120px) | label (1fr) | target (1fr) | timeout (100px).
- Additional rows: value (1fr) | notes (3fr) as needed.
- Each field: label above input, 6px gap.
- Field labels: `text-xs` (12px), weight 600, `text-secondary`.

### Toolbar
- Below step list or above.
- Left: "Add step" button (secondary).
- Right: "Save changes" button (primary).
- Gap between toolbar and steps: 12px.

### Empty steps
- Text: `text-secondary`, 13px.
- "No steps yet. Click Add step to define the first action."

---

## 15. Recorder design

### Layout
- Toolbar bar across top: URL display + Start/Stop button.
- Below toolbar: main viewport area.
  - When idle: centered instructions card.
  - When recording: pulsing indicator + brief instructions.
  - When stopped with steps: step list preview.
- Bottom bar: status text or error message.

### Toolbar
- Height: 52px.
- Background: `canvas-raised`.
- Bottom border: `border-default`.
- Padding: 0 16px.
- Left: URL input or display area.
- Right: Start/Stop button.

### Idle state
- Large centered area.
- Icon: monitor/globe, 32px, `text-dim`.
- Title: "Browser Recorder", `text-lg`, weight 650.
- Text: "Start a recording session to capture browser actions as test steps."
- Start button below text.

### Recording state
- Same layout but icon pulses (opacity animation).
- Title changes to "Recording active".
- Text: "Perform actions in the browser window. Click Stop when done."
- Button changes to red Stop button.

### Stopped with steps
- List of recorded steps with step number, type badge, label.
- Steps list scrollable if many steps.
- Clear CTA: "Save steps to a test" or "Start new recording".

---

## 16. Results design

### Empty state
- Standard empty state inside panel.
- "No results yet. Run a test to see pass/fail details, screenshots, and step diagnostics."

### Results list
- Each row: status badge | test name | browser · duration | date.
- Row height: 48px.
- Clickable, selects for detail view.

### Result detail
- Below list, in same panel or expands below.
- Metadata grid: status, browser, duration, started, finished, run ID.
- If failed: screenshot path displayed with monospace font.
- Step results list: each step with index, status badge, label, duration, error if failed.

---

## 17. Do and do not rules

### Do
- Use 8px spacing grid everywhere.
- Use consistent border-radius (10-14px).
- Use 1px borders only.
- Use one accent color sparingly.
- Keep text 13px minimum for content (12px ok for badges/eyebrows).
- Show focus rings on all interactive elements.
- Show hover states on all clickable elements.
- Align content to grid columns.
- Keep the layout stable at 1366x768 and 1920x1080.

### Do not
- Do not use gradients anywhere.
- Do not use neon glow or box-shadows on cards.
- Do not use pure black `#000000`.
- Do not use more than one primary button per view.
- Do not use the accent color decoratively (as icon colors, card backgrounds, random highlights).
- Do not use text smaller than 11px.
- Do not use uppercase for anything except eyebrows and short badge labels.
- Do not overflow horizontally at 1366px wide.
- Do not use giant empty cards as placeholders — use proper empty states.
- Do not repeat action controls in multiple places.
- Do not make every icon a different color.
- Do not use heavy filled background blocks when a border is enough.

---

## 18. Responsive desktop behavior

The app targets desktop only (no mobile, no tablet).

### Breakpoints
- Minimum supported: 1120px wide.
- Comfortable: 1366px+ (most Windows laptops).
- Optimal: 1920px (desktop monitors).

### Layout adaptations
- At 1120–1399px: 3-column test workbench collapses to 2 columns (right panel moves below or stacks).
- Below 1120px: sidebar collapses to icon-only (48px), but 1120px is the hard minimum.
- Panels use `min-width: 0` and `overflow: hidden` to prevent horizontal overflow.
- Long file paths and IDs use `overflow: hidden; text-overflow: ellipsis; white-space: nowrap`.

---

## 19. Accessibility rules

- All interactive elements must have visible focus indicators (3px ring, `accent-default` color).
- Focus order must follow visual order (no tabindex hacks).
- Color is never the only way to convey information (always pair status color with text label).
- Text contrast meets WCAG AA:
  - `text-primary` on `canvas-default`: contrast ratio >= 4.5:1.
  - `text-secondary` on `canvas-default`: contrast ratio >= 3:1 (large/bold text only).
- Form inputs have associated `<label>` elements (visible or aria-label).
- Buttons have descriptive text or aria-labels.
- Navigation uses `aria-current="page"` on active item.
- Panels and sections use `aria-label` or `aria-labelledby`.

---

## 20. Codex implementation rules

When implementing this design:

1. Use CSS custom properties (variables) defined on `:root` for all design tokens.
2. Component files use class names following the `component-element--modifier` convention (e.g., `.step-card-header`, `.step-card--selected`).
3. CSS is in a single `styles.css` file. Avoid CSS-in-JS and CSS modules.
4. Use existing `lucide-react` icons. Icon size matches context: 16px in buttons and lists, 18px in nav, 32px in empty states.
5. Do not install any CSS framework or component library.
6. All spacing must use the 8px scale — no arbitrary pixel values.
7. Reuse class patterns: if a button style exists, reuse the CSS class. Do not duplicate styles.
