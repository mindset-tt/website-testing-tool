# JUnit XML Report Export — 2026-05-08

## Summary

Added JUnit XML export for selected run results, allowing developers and CI systems to consume run results in a standard format.

## Changes

### New Files
- `src/shared/junitReport.ts` — Pure XML generation for JUnit reports
  - `renderRunJunitReport(runResult)` — generates `<testsuites><testsuite>` with name/tests/failures/errors/time/timestamp attributes
  - `renderStepResultAsTestcase(stepResult, runResult)` — maps each step to `<testcase>` with `<failure>`, `<error>`, or `<skipped>` children
  - `formatSystemOut(runResult)` — includes run metadata and browser evidence counts (not raw logs)
  - `escapeXmlText()` — escapes `&<>` and carriage returns for text nodes
  - `escapeXmlAttribute()` — escapes `&<>"'` and whitespace for attribute values

### Modified Files
- `src/storage/resultStorage.ts` — Added `exportRunJunitReport()`, `resolveRunJunitReportPath()`, and `getRunJunitReportRelativePath()` following the same safe export pattern as HTML export
- `src/shared/ipc-channels.ts` — Added `resultExportJunitReport` channel
- `src/shared/preload-api.ts` — Extended `ResultApi` interface with `exportRunJunitReport`
- `src/preload/index.ts` — Wired `exportRunJunitReport` through `ipcRenderer.invoke`
- `src/main/resultIpc.ts` — Registered IPC handler for `resultExportJunitReport` with input validation
- `src/renderer/components/ReportPanel.tsx` — Added "Export JUnit XML" button alongside HTML export, with state management and message display. Existing open/reveal follow-through actions work for both formats.
- `tests/resultStorage.test.ts` — Added 18 new tests covering XML escaping, status mapping, system-out content, and filesystem export

### Documentation Updates
- `docs/architecture/runner-contract.md` — Added JUnit export note, removed from deferred list
- `docs/architecture/local-project-model.md` — Added JUnit report path example
- `docs/memory/current-state.md` — Noted JUnit export capability
- `docs/memory/next-actions.md` — Noted JUnit export completion

## JUnit XML Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
  <testsuite name="testName" tests="N" failures="X" errors="Y" skipped="0" time="X.XXX" timestamp="..." hostname="local">
    <testcase classname="testName.stepType" name="label [step N]" time="X.XXX">
      <!-- For failed: <failure type="AssertionError" message="...">...</failure> -->
      <!-- For error: <error type="RuntimeError" message="...">...</error> -->
      <!-- For skipped: <skipped/> -->
    </testcase>
    <system-out>Run ID: ... Browser evidence: N console messages, N page errors, etc.</system-out>
  </testsuite>
</testsuites>
```

## Validation

- `npm run typecheck` — passed
- `npm run lint` — passed
- `npm run test` — 158 tests passed (18 new)
- `npm run build` — passed
