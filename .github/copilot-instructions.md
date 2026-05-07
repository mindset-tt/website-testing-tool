# GitHub Copilot Instructions

You are working on the `website-testing-tool` project.

Always follow `AGENTS.md`.

Before doing any task, read:

- `AGENTS.md`
- `docs/memory/current-state.md`
- `docs/memory/next-actions.md`
- `docs/memory/known-issues.md`
- `docs/memory/architecture-summary.md`

Current accepted architecture:

- Electron
- React
- TypeScript
- Node.js
- Playwright later
- Local file storage for MVP

Development environment:

- Fedora Linux

Final product target:

- Windows x86/x64
- Windows on ARM, but ARM remains a validation risk

Important rules:

- Do only one small valuable task at a time.
- Do not jump ahead.
- Do not implement recorder before test storage and manual step editing exist.
- Do not implement runner before test step schema and editor are stable.
- Do not install Playwright until the task explicitly asks for automation/runner work.
- Do not expose raw `fs` to the renderer.
- Do not enable `nodeIntegration`.
- Use preload/contextBridge IPC only.
- Validate IPC input in the main process.
- Keep Electron security boundaries intact.
- Run checks after changes:
  - `npm run typecheck`
  - `npm run lint`
  - `npm run test`
  - `npm run build`
- Update memory files after every task.
- Add a dated log under `docs/logs/`.
- Be honest about failures and known issues.

Current next task:

Implement minimal test case JSON save/load/list helpers using the documented schema.

Do not implement recorder, runner, Playwright automation, reports, packaging, or advanced UI yet.
