# Tech Stack Evaluation

Last researched: 2026-05-06

This evaluation compares candidate architectures for the first MVP: a local desktop product that can create/open a project, record a simple Chromium/Edge-family browser flow, show human-readable steps, allow basic step editing, run locally, capture a failure screenshot, show pass/fail status, and save tests locally.

ADR-0002 has accepted the Electron + React + TypeScript + Node.js + Playwright stack for the MVP, with local file storage.

## Recommendation Summary

Recommended first MVP stack:

- Electron.
- React.
- TypeScript.
- Node.js.
- Playwright.
- Local file storage for the first prototype.

Recommendation status: accepted for MVP in ADR-0002.

Why this is recommended:

- Playwright is a natural fit in the Node.js ecosystem.
- Electron already combines Chromium and Node.js, reducing the number of runtime boundaries for the MVP.
- Fedora development is practical because the UI and automation layer can be developed as a normal Node/TypeScript application.
- The team can build the recorder, step model, local runner, and simple report loop before solving harder native-shell optimization questions.
- Commercial packaging for Windows x64 and arm64 is a known Electron path, even though app size is larger.

Main caveat:

- Windows on ARM support is not fully de-risked because Playwright has an open issue requesting native Windows Arm64 browser bundle support. Windows ARM must be validated early and documented clearly before commercial release claims.

## Rating Scale

- `Strong`: good fit for the MVP with known implementation path.
- `Good`: workable with manageable tradeoffs.
- `Mixed`: feasible, but important risks or unknowns remain.
- `Weak`: likely to slow the MVP or add avoidable complexity.
- `Unknown`: not enough evidence yet.

## Detailed Comparison Table

| Criterion | Tauri + React + TypeScript + Rust shell + Playwright service/sidecar | Electron + React + TypeScript + Node.js + Playwright | .NET / WinUI + Playwright driver | Local web app + local runner service |
| --- | --- | --- | --- | --- |
| Windows x86/x64 compatibility | Strong for the app shell; Tauri supports Windows installer targets and Rust `x86_64-pc-windows-msvc`. Playwright sidecar packaging still needs validation. | Strong. Electron packaging targets Windows x64 and Node/Playwright fit naturally. | Strong for Windows-native desktop UI; WinUI targets x86/x64/ARM devices. Playwright driver integration still needs product-specific validation. | Mixed. Runner can target Windows x64, but browser automation, service installation, updates, and UI/runner coordination become separate product surfaces. |
| Windows on ARM compatibility | Mixed. Tauri can build native ARM64 app binaries, but the Node/Playwright sidecar and browser automation stack need separate ARM validation. | Mixed to Good. Electron supports Windows on ARM, but native modules and Playwright browser availability need validation. Current Playwright project tracker includes an open request for native Windows Arm64 browser bundles. | Mixed. WinUI and .NET support ARM devices, but Playwright .NET appears affected by Playwright browser-bundle limitations and may bundle x64 Node paths today. Needs real-device validation. | Mixed. Could ship an ARM64 runner, but service packaging and browser support still face the same Playwright Windows ARM uncertainty. |
| Fedora development practicality | Good for React/Rust development; Tauri has Linux prerequisites. Cross-building Windows packages from Fedora is possible for some targets but release signing and Windows validation still require Windows. Node sidecar packaging adds friction. | Strong. Node, React, TypeScript, Electron, and Playwright are all practical from Fedora. Playwright's official Linux dependency automation focuses on Debian/Ubuntu, so Fedora browser dependency setup must be documented manually. | Weak. WinUI is Windows-only in practice. Fedora can host some .NET code and shared model work, but the UI build/debug loop wants Windows and Visual Studio/Rider on Windows. | Good for web UI and runner development on Fedora, but weaker for testing the final Windows user experience. |
| Playwright/browser automation compatibility | Good but indirect. Playwright likely runs in a Node service/sidecar because the Tauri shell is Rust. IPC design becomes important. | Strong. Playwright, recording/codegen concepts, runner process, screenshots, reports, and browser channels are all in the same Node/TypeScript ecosystem. | Mixed. Playwright for .NET can run tests and use Edge channels, but recorder/codegen and ecosystem examples are stronger in Node. | Good for runner internals if the runner is Node/Playwright. Product integration is weaker because the UI and runner may feel like two apps. |
| Packaging complexity | High. Need package Rust shell, web assets, Node/Playwright sidecar, browser downloads or browser discovery, per-architecture binaries, installers, updates, and signing. | Medium. Electron packaging is mature but app size, Playwright browser assets, code signing, auto-update, and arm64 builds must be handled. Lowest complexity for MVP automation path. | Medium to High. Native Windows packaging can be good, but WinUI runtime, .NET publishing, Playwright browsers, and Fedora-to-Windows development workflow add friction. | High. Must package/install a local service or runner, manage ports/security/firewall behavior, handle service lifecycle, and still provide a polished Windows desktop-like experience. |
| App size | Good for shell size, but less good once a Node sidecar and Playwright/browser assets are included. | Weak to Mixed. Electron apps are large because Chromium and Node ship with the app; Playwright browsers can add substantial size if bundled. | Good to Mixed. Native UI can be smaller than Electron, but self-contained .NET and browser assets can still be large. | Mixed. Web UI can be small, but runner and browser assets dominate; deployment may be split and confusing. |
| UI quality | Strong with React and a lightweight native shell. Good path to a restrained commercial UI. | Strong with React; many mature desktop UI patterns exist. Needs careful design to avoid a generic web-app feel. | Strong for native Windows look and Fluent controls. Best Windows-native potential if the team accepts Windows-first development. | Mixed. Web UI can be strong, but local service setup can undermine the commercial desktop feel. |
| Performance | Strong shell performance and smaller idle footprint; sidecar cost depends on Node/Playwright. | Mixed. Heavier baseline memory and disk usage, but acceptable for an MVP where browser automation already launches a browser. | Good. Native UI can be responsive; Playwright/browser execution dominates test runtime. | Mixed. UI can be fast, but service communication and browser automation dominate. |
| Maintainability | Mixed. React + TypeScript + Rust + Node sidecar means more languages and boundaries. | Strong for MVP. One dominant language family, TypeScript, can cover UI, main process, runner, step model, and reports. | Mixed. C# UI plus Playwright driver can be maintainable for Windows specialists, but Fedora workflow and recorder ecosystem add strain. | Mixed. Clean separation is possible, but service protocol, lifecycle, version sync, and troubleshooting become long-term maintenance surfaces. |
| Debugging experience | Mixed. Need debug frontend, Rust shell, and Node sidecar separately. Packaging bugs may be harder. | Strong. Electron main/renderer plus Node Playwright runner are well-understood; TypeScript debugging can cover most MVP logic. | Mixed to Good on Windows, Weak on Fedora. Native debugging is good on Windows, but cross-platform development adds friction. | Mixed. Runner logs may be clear, but local service failures, port conflicts, permissions, and browser issues can confuse non-developer users. |
| Risk for MVP | Medium to High. Technically attractive but sidecar packaging can consume the MVP. | Medium. Biggest risks are app size, Electron security hardening, Playwright browser packaging, and Windows ARM validation. Lowest overall MVP delivery risk. | High for this Fedora-based MVP. Strong Windows story, but UI development, recorder design, and Playwright integration would likely slow first prototype. | High. Adds distributed-system problems before the product has proven the core workflow. |
| Commercial readiness | Good long-term if sidecar packaging is solved; small app shell is attractive. | Good for a first paid prototype if packaging, signing, security, and update discipline are handled. Many commercial desktop apps use Electron successfully. | Good long-term for Windows-only commercial polish, but expensive for current Fedora-first development. | Mixed. Could become a strong architecture later for teams, CI, or remote runners, but it is less convincing as a simple local desktop MVP. |
| Recommendation status | Deferred for MVP; reconsider after MVP if app size or native shell quality becomes a priority. | Accepted for MVP in ADR-0002. | Deferred for MVP; reconsider if Windows-native UI becomes more important than Fedora practicality and recorder speed. | Deferred for MVP; reconsider later if runner separation becomes a product requirement. |

## Option 1: Tauri + React + TypeScript + Rust Shell + Playwright Service / Sidecar

### Practical Read

Tauri is attractive for a polished commercial app because it can produce smaller desktop shells and use system WebView technologies. It also has a documented Windows installer path and can build native ARM64 app binaries.

For this MVP, the problem is not the shell. The problem is Playwright. A Tauri app would likely need a Node.js sidecar or local service to host Playwright recording/running logic. That introduces a second runtime, a process boundary, IPC protocol, per-architecture sidecar binaries, and extra packaging work before the core product loop is proven.

### MVP Fit

Good long-term candidate, but not the best first implementation stack. It risks spending early effort on shell/sidecar packaging rather than validating recorder quality, step editing, local run, and failure evidence.

### When To Reconsider

Reconsider after the Electron MVP proves the workflow if app size, memory footprint, native shell security, or distribution polish become decisive commercial concerns.

## Option 2: Electron + React + TypeScript + Node.js + Playwright

### Practical Read

Electron is heavier, but it aligns with the MVP's hardest requirement: recording and running browser tests locally. The UI, desktop shell, runner, report generation, local files, and Playwright integration can all live in a TypeScript-first architecture.

The stack is not elegant in the abstract, but it is practical. For an MVP, fewer cross-language boundaries matter more than smaller shell size.

### MVP Fit

Best fit for the first commercial prototype.

Suggested MVP architecture:

- React + TypeScript renderer for the UI.
- Electron main process for app lifecycle, windows, menus, file dialogs, and privileged local operations.
- Isolated preload bridge for typed UI-to-main communication.
- Node/TypeScript runner module or utility process for Playwright recording/running.
- Local project folder containing test definitions, run results, screenshots, and simple reports.
- Chromium or Edge first, with browser discovery and installation strategy decided during implementation planning.

### Why It Wins For MVP

- Fastest route from Fedora development to a working recorder-runner prototype.
- Strongest alignment with Playwright's primary ecosystem.
- Best debugging loop for TypeScript UI + automation.
- Lowest architectural translation cost for human-readable steps, local reports, and test execution.

### Main Risks

- Larger installer and disk footprint.
- Security hardening must be intentional: context isolation, no broad Node exposure in renderer, typed IPC, safe file access.
- Windows ARM must be validated early, especially Playwright browser support.
- Browser assets and updates can make packaging heavy.

## Option 3: .NET / WinUI + Playwright Driver

### Practical Read

WinUI is the strongest Windows-native UI option. It is commercially attractive for a Windows-only product and has a good native story across x86, x64, and ARM devices.

The current development machine is Fedora, though, and the MVP depends heavily on browser recording/running. WinUI would push meaningful UI work onto Windows and make the recorder ecosystem less direct than Node/Playwright.

### MVP Fit

Not recommended for the first MVP from Fedora. It may be worth reconsidering if the project later decides that native Windows UI and Microsoft Store-style packaging outweigh development speed and Playwright integration simplicity.

### Main Risks

- Poor Fedora-first UI development loop.
- Potentially slower MVP iteration.
- Playwright .NET can run browser automation, but recording/codegen and examples are stronger in Node.
- Windows ARM still depends on Playwright browser support validation.

## Option 4: Local Web App + Local Runner Service

### Practical Read

A local web UI plus local runner service creates a clean conceptual separation between UI and automation. It could support future CI, team runners, or remote execution.

For the MVP, it creates avoidable product friction: service installation, port management, firewall/security prompts, lifecycle management, version drift between UI and runner, and support issues when the local service is down.

### MVP Fit

Not recommended. It adds local infrastructure complexity before proving that users want the core recorder-runner workflow.

### When To Reconsider

Reconsider after the desktop MVP if the product needs multi-runner execution, CI worker reuse, remote execution, or a browser-based team dashboard.

## Windows On ARM Reality Check

The final product must support Windows x86/x64 and Windows on ARM. None of the evaluated stacks fully eliminates Windows ARM risk because Playwright browser automation is the shared dependency.

Current findings:

- Tauri can build native ARM64 app binaries, but sidecar and Playwright browser support remain separate risks.
- Electron can target Windows arm64, but native Node modules and Playwright browser behavior must be validated.
- WinUI and .NET have strong Windows ARM stories, but Playwright browser support still needs validation.
- Microsoft guidance says ARM64 apps must be built, packaged, updated, and tested on Arm64 hardware or representative VMs.
- A current Playwright issue requests native Windows Arm64 browser bundle support, which means native Windows ARM browser automation should not be assumed.

Architecture implication:

- The MVP architecture should target Windows x64 first for initial proof, but Windows ARM validation must be a Phase 0/early Phase 1 gate, not a late packaging task.
- The implementation plan should include a small Windows ARM proof: launch chosen browser, record or generate a minimal action, run the action, capture screenshot, and save local artifact.

## Browser Strategy For MVP

Candidate browser approaches:

- Use Playwright-managed Chromium for the first x64 MVP path.
- Use installed Microsoft Edge via Playwright `msedge` channel for Edge-first validation.
- For Windows ARM, validate whether installed Edge ARM64 can be controlled reliably before promising native ARM support.

Current recommendation:

- Do not bundle a browser decision into the stack decision.
- During the first implementation plan, create a browser discovery and validation task that compares Playwright-managed Chromium versus installed Edge.
- Treat Windows ARM browser automation as a required proof before making commercial Windows ARM support claims.

## Local Storage Recommendation For MVP

Use local file storage first, not SQLite, unless implementation planning exposes a clear need for query behavior.

Initial shape:

- Project folder.
- Test definition files.
- Run result folders.
- Failure screenshots.
- Simple report artifacts.
- Metadata file for project/version information.

Reason:

- Local files are inspectable, portable, easy to back up, and consistent with the local-first commercial positioning.
- SQLite can be introduced later if suite/report querying becomes painful.

## Validation Plan Before Feature Build-Out

Before broad feature build-out, define a focused proof plan:

- Confirm Electron Windows x64 packaging path.
- Confirm Electron Windows arm64 packaging path.
- Confirm Playwright can run on Fedora development machine with documented manual browser dependencies.
- Confirm Playwright can launch the chosen Chromium/Edge path on Windows x64.
- Confirm Playwright can launch the chosen Chromium/Edge path on Windows ARM.
- Confirm screenshot capture and local artifact writing.
- Confirm basic recording approach: Playwright codegen reuse, custom event capture, or a minimal wrapper around Playwright-generated actions.

## Sources Consulted

- Tauri Windows installer and ARM targets: <https://tauri.app/distribute/windows-installer/>
- Tauri Node.js sidecar guide: <https://v2.tauri.app/learn/sidecar-nodejs/>
- Tauri Linux prerequisites and WebView notes: <https://v2.tauri.app/start/prerequisites/>
- Electron Windows on ARM: <https://www.electronjs.org/docs/latest/tutorial/windows-arm>
- Electron process model: <https://www.electronjs.org/docs/latest/tutorial/process-model>
- Electron Builder CLI target architecture options: <https://www.electron.build/cli>
- Electron Packager supported platforms and app size note: <https://electron.github.io/packager/main/index.html>
- Playwright installation and system requirements: <https://playwright.dev/docs/intro>
- Playwright browser/channel documentation: <https://playwright.dev/docs/browsers>
- Playwright test generator / codegen documentation: <https://playwright.dev/docs/codegen>
- Playwright Windows Arm64 browser support request: <https://github.com/microsoft/playwright/issues/40202>
- Microsoft Windows on ARM guidance: <https://learn.microsoft.com/en-us/windows/arm/add-arm-support>
- Microsoft WinUI 3 documentation: <https://learn.microsoft.com/en-gb/windows/apps/winui/winui3/>
- .NET RID and publishing documentation: <https://learn.microsoft.com/en-us/dotnet/core/rid-catalog> and <https://learn.microsoft.com/en-us/dotnet/core/deploying/>
- Playwright .NET browser/channel documentation: <https://playwright.dev/dotnet/docs/browsers>
