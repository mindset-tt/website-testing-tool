# Product Style Direction

Last updated: 2026-05-07

## Framing

When I open this app as a QA tester or non-developer, what should I feel?

- I understand where to start.
- I trust this tool with my testing work.
- I can see project, tests, recorder, and results clearly.
- Failures feel explainable, not scary.
- The UI feels professional enough to pay for.
- It feels local, fast, and reliable.
- It does not feel like a random AI-generated dashboard.

That means the product should feel like a focused Windows workbench, not a marketing site and not a generic dark SaaS clone. The shell should communicate discipline first: stable layout, clear navigation, quiet surfaces, predictable controls, and evidence-first results.

## User-Centered Direction

The first impression should be:

- Startable: the user can immediately see where to create a project, record a test, edit steps, or run a test.
- Trustworthy: the interface looks deliberate, not flashy, toy-like, or experimental.
- Operational: the product feels like software for real work, with panels, lists, evidence, and status that behave like tools.
- Explainable: when something fails, the UI looks like it will help explain the failure instead of hiding it behind dramatic color or raw automation jargon.
- Local and fast: the app should feel native to a desktop workflow, with compact controls and no unnecessary visual theater.

## Reference Comparison

| Reference | What to borrow | What to avoid | Fit for website testing tool | Score |
|-------|-------|-------|-------|-------|
| Linear | Strict layout discipline, dense but readable information hierarchy, calm dark surfaces, serious product tone, precise spacing | Copying its exact accent treatment, exact typography, or making the app feel like issue tracking software | Best primary reference because it feels paid, focused, and operational without looking decorative | 10/10 |
| Cursor | Desktop-tool framing, strong panel structure, local-tool confidence, controlled dark shell, clear workspace zoning | AI-brand glow, conversational assistant framing, or making testing work feel like an AI coding product | Strong secondary reference because it makes complex tooling feel approachable and fast | 9/10 |
| Raycast | Compact control density, command-surface clarity, tight borders and radii, dark product chrome | Over-leaning on command palette aesthetics or novelty accent moments | Good fit for compact desktop controls and navigation discipline | 8/10 |
| Sentry | Failure-first posture, diagnostic seriousness, developer-tool confidence, evidence-oriented dark presentation | Brand personality, glass effects, loud purple spectrum, or playful irreverence | Strong fit for results, errors, and debugging views when kept calmer than Sentry itself | 8/10 |
| Stripe | Polish, content hierarchy, measured typography, premium trust cues, clean forms and spacing logic | Fintech luxury tone, airy marketing pacing, or light-page dominance | Useful as a restraint reference for polish, but not as the main shell language | 7/10 |
| Vercel | Monochrome discipline, crisp technical feeling, minimal chrome, clear border logic | Over-minimal light-canvas aesthetic, marketing-page emptiness, or infrastructure-brand mimicry | Helpful for sharpness and technical confidence, but too sparse and web-marketing-oriented for the full app | 7/10 |
| Superhuman | Confidence, compact premium controls, strong editorial restraint | Luxury-product mood, dramatic hero energy, and the sense of email software marketed as a lifestyle object | Some useful control discipline, but too luxurious and brand-led for QA workbench use | 6/10 |
| Notion | Approachability, clear workspace metaphors, simple organization, low-friction learning feel | Pastel-heavy surfaces, soft productivity mood, or the sense of a notes workspace instead of a testing tool | Helpful reminder to stay understandable for non-developers, but too soft for diagnostics-first software | 6/10 |
| Figma | Strong editorial confidence, sharp black-and-white framing, clear technical craft | Oversized playful color blocks, overt design-brand personality, or creative-tool energy | Useful as a reminder to be intentional, but too expressive for the default product shell | 5/10 |
| Warp | Warm restraint, calm dark atmosphere, grounded pacing | Lifestyle editorial feel, nature-photography mood, and overly soft emotional framing | Interesting tone reference, but too lifestyle-oriented for a practical QA desktop tool | 5/10 |

## Final Blended Direction

### Final blend

- 35% Linear
- 25% Cursor
- 15% Raycast
- 15% Sentry
- 10% Stripe

### Why this blend fits

Linear should lead because it is the best example of serious, compact, high-trust product software without visual noise. It gives the app the right desktop posture: precise, calm, and commercially credible.

Cursor should be the second largest influence because it makes a technically complex local tool feel understandable. That matters for a product serving both non-developer QA testers and engineers. Cursor is a better model than generic SaaS UI because it feels like a real workstation, not a dashboard.

Raycast adds control density and command clarity. It is the right place to learn how to make small controls, search, filters, and panel actions feel fast without becoming cramped.

Sentry contributes the right emotional model for failures. Website testing is not only about authoring happy-path steps; it is also about helping the user understand what broke. Sentry is the best reference in this set for making failure views feel diagnostic instead of alarming.

Stripe contributes polish and trust. Its value here is not its brand language, but its discipline around type, spacing, and premium credibility. That helps the app feel worth paying for.

## Final Style Name

**Local QA Workbench**

## What Local QA Workbench Means

- Dark professional desktop shell.
- Precise layout.
- Calm low-glare surfaces.
- Compact but readable controls.
- Clear test workflow.
- Failure-first reporting.
- Recorder feels like a controlled session.
- Results feel like diagnostics.
- No decorative gradients.
- No fake AI glow.
- No marketing-style hero sections.
- No heavy brand color abuse.

## How It Should Show Up In The Product

### Shell and navigation

- The app should open into a stable workbench layout with clear left-side structure and obvious primary workspace areas.
- Navigation should feel deliberate and quiet, not oversized or animated.
- The first-run experience should help the user understand where projects, tests, recorder, and results live.

### Test editing

- Step editing should look structured and operational, like working with a reliable checklist editor rather than a form dump.
- Controls should be compact, aligned, and readable for long sessions.
- Advanced details should be present but visually secondary until needed.

### Recorder

- The recorder should feel like a controlled capture session, not like a playful browser toy.
- Recording state should be obvious, but the visual language should stay calm and practical.

### Results and failures

- Results should read like diagnostic evidence, with status, timing, screenshots, and step context clearly grouped.
- Failures should feel explainable. The screen should imply, "here is what happened and what to inspect next," not "something scary exploded."

## Guardrails

- Use the references for interaction quality, layout discipline, and product seriousness.
- Do not copy exact brand colors, typefaces, wordmarks, icons, or signature compositions.
- Do not turn the app into a landing page inside a desktop shell.
- Do not add gradients, glow, glassmorphism, or decorative illustrations just because the reference uses them in marketing.
- Prefer clarity for QA workflows over visual cleverness.

## Decision

The final product style direction is **Local QA Workbench**: a Linear-led, Cursor-supported desktop product language with Raycast compactness, Sentry diagnostic seriousness, and Stripe polish.
