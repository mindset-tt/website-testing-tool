# UI Principles

The product should feel like serious paid Windows software for real QA work. It should be modern, calm, and efficient without looking flashy or overdesigned.

## Principles

- Modern but restrained.
- Professional.
- Calm colors.
- Strong readability.
- Clear hierarchy.
- No fake glossy AI look.
- Accessible keyboard navigation.
- Simple onboarding.
- Plain language.
- Helpful empty states.
- Failure explanations that normal users understand.

## Interaction Direction

- Put the current test, run status, and failure evidence where users can see them quickly.
- Make recorded steps readable and editable without exposing unnecessary implementation details.
- Reveal advanced selector, log, and trace details progressively.
- Use familiar controls for editing, running, filtering, and exporting.
- Keep destructive actions confirmable and reversible where possible.
- Prefer clear labels over clever wording.
- Avoid decorative UI that competes with test evidence.

## Failure Experience

Failures should explain:

- Which step failed.
- What the tool expected.
- What actually happened.
- What evidence is available, such as screenshot, console logs, network logs, or trace.
- What a non-developer can try next.

The product should not dump raw automation errors as the primary user-facing explanation.
