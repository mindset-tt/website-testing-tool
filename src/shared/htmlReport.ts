import type {
  BrowserConsoleMessage,
  HttpErrorRecord,
  NetworkFailureRecord,
  PageErrorRecord,
  RunResult,
  StepResult,
  StepSnapshot
} from './project-schema';
import {
  formatBrowserEvidenceLocation,
  getBrowserEvidenceCounts,
  getConsoleMessagesForDisplay,
  getFailureScreenshotPath,
  getHttpErrorsForDisplay,
  getNetworkFailuresForDisplay,
  getPageErrorStackPreview,
  getPageErrorsForDisplay,
  getPrimaryFailureStep,
  getStepSnapshotForResult
} from './resultDiagnostics';

const DEFAULT_PRODUCT_NAME = 'Website Testing Tool';
const OFFLINE_REPORT_NOTE =
  'This report is local and offline. Artifact paths stay project-relative and may only resolve inside the original project folder.';
const EMPTY_VALUE = 'Not recorded';

export interface HtmlReportOptions {
  readonly generatedAt?: string;
  readonly productName?: string;
}

export function renderRunHtmlReport(runResult: RunResult, options: HtmlReportOptions = {}): string {
  const productName = options.productName?.trim() || DEFAULT_PRODUCT_NAME;
  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const failureStep = getPrimaryFailureStep(runResult);
  const failureSnapshot = getStepSnapshotForResult(failureStep, runResult);
  const failureScreenshotPath = getFailureScreenshotPath(runResult, failureStep);
  const browserEvidenceCounts = getBrowserEvidenceCounts(runResult);
  const consoleMessages = getConsoleMessagesForDisplay(runResult, 4);
  const pageErrors = getPageErrorsForDisplay(runResult, 3);
  const networkFailures = getNetworkFailuresForDisplay(runResult, 3);
  const httpErrors = getHttpErrorsForDisplay(runResult, 3);
  const title = `${productName} - Run report ${runResult.runId}`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <style>
      :root {
        color-scheme: light;
        font-family: "Segoe UI", Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
        line-height: 1.45;
        --bg: #f4f7fb;
        --surface: #ffffff;
        --surface-soft: #f7f9fc;
        --text: #162033;
        --text-muted: #5b667b;
        --border: #d9e1ec;
        --border-strong: #c8d2e0;
        --accent: #295ccf;
        --success: #19734a;
        --success-soft: #e9f7f0;
        --warning: #8b5c0a;
        --warning-soft: #fff4de;
        --danger: #ad2742;
        --danger-soft: #fdecef;
        --shadow: 0 18px 38px rgba(18, 32, 59, 0.08);
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        background: var(--bg);
        color: var(--text);
        padding: 24px;
      }

      main {
        margin: 0 auto;
        max-width: 1040px;
      }

      .hero,
      .card,
      .evidence-entry {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 16px;
        box-shadow: var(--shadow);
      }

      .hero {
        padding: 24px;
      }

      .eyebrow {
        color: var(--text-muted);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.08em;
        margin: 0 0 10px;
        text-transform: uppercase;
      }

      h1,
      h2,
      h3,
      h4,
      p {
        margin: 0;
      }

      h1 {
        font-size: 30px;
        line-height: 1.1;
      }

      h2 {
        font-size: 18px;
        margin-bottom: 14px;
      }

      h3 {
        font-size: 15px;
      }

      .hero-meta {
        color: var(--text-muted);
        margin-top: 10px;
      }

      .hero-status {
        align-items: center;
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 18px;
      }

      .status-badge,
      .entry-badge {
        border-radius: 999px;
        display: inline-flex;
        font-size: 12px;
        font-weight: 700;
        line-height: 1;
        padding: 7px 10px;
        text-transform: uppercase;
      }

      .status-passed,
      .tone-success {
        background: var(--success-soft);
        color: var(--success);
      }

      .status-failed,
      .tone-danger {
        background: var(--danger-soft);
        color: var(--danger);
      }

      .status-error,
      .tone-warning {
        background: var(--warning-soft);
        color: var(--warning);
      }

      .status-skipped {
        background: #eef2f8;
        color: var(--text-muted);
      }

      .layout {
        display: grid;
        gap: 16px;
        margin-top: 16px;
      }

      .card {
        padding: 18px;
      }

      .metadata-grid,
      .count-grid,
      .failure-grid {
        display: grid;
        gap: 12px;
      }

      .metadata-grid,
      .failure-grid {
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      }

      .count-grid {
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      }

      .field,
      .count-card {
        background: var(--surface-soft);
        border: 1px solid var(--border);
        border-radius: 12px;
        min-width: 0;
        padding: 12px;
      }

      .field-label {
        color: var(--text-muted);
        display: block;
        font-size: 12px;
        font-weight: 700;
        margin-bottom: 6px;
      }

      .field-value {
        overflow-wrap: anywhere;
      }

      .count-card strong {
        display: block;
        font-size: 22px;
        line-height: 1.1;
        margin-bottom: 6px;
      }

      .count-card span {
        color: var(--text-muted);
        font-size: 12px;
      }

      .section-stack {
        display: grid;
        gap: 12px;
      }

      .evidence-list {
        display: grid;
        gap: 10px;
      }

      .evidence-entry {
        padding: 14px;
      }

      .entry-header {
        align-items: center;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 8px;
      }

      .entry-meta {
        color: var(--text-muted);
        font-size: 12px;
      }

      .entry-text {
        font-size: 14px;
        margin-top: 4px;
      }

      .mono {
        font-family: "Cascadia Code", "SFMono-Regular", Consolas, monospace;
        font-size: 12px;
        overflow-wrap: anywhere;
      }

      table {
        border-collapse: collapse;
        width: 100%;
      }

      th,
      td {
        border-bottom: 1px solid var(--border);
        padding: 12px 10px;
        text-align: left;
        vertical-align: top;
      }

      th {
        color: var(--text-muted);
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
      }

      td {
        font-size: 14px;
      }

      tbody tr:last-child td {
        border-bottom: 0;
      }

      .table-detail {
        display: grid;
        gap: 6px;
      }

      .report-note,
      .footer-note {
        color: var(--text-muted);
        font-size: 13px;
      }

      .footer-note {
        margin-top: 16px;
        text-align: center;
      }

      @media (max-width: 720px) {
        body {
          padding: 14px;
        }

        .hero,
        .card,
        .evidence-entry {
          border-radius: 14px;
        }

        th,
        td {
          padding-left: 8px;
          padding-right: 8px;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <p class="eyebrow">${escapeHtml(productName)}</p>
        <h1>${escapeHtml(runResult.testName || runResult.testId)}</h1>
        <p class="hero-meta">Saved run result export for local sharing and offline review.</p>
        <div class="hero-status">
          ${renderStatusBadge(runResult.status)}
          <span><strong>Run ID:</strong> <span class="mono">${escapeHtml(runResult.runId)}</span></span>
        </div>
      </section>

      <div class="layout">
        <section class="card">
          <h2>Run details</h2>
          <div class="metadata-grid">
            ${renderField('Test name', runResult.testName)}
            ${renderField('Test ID', runResult.testId, true)}
            ${renderField('Browser', runResult.browserName)}
            ${renderField('Started', runResult.startedAt)}
            ${renderField('Completed', runResult.finishedAt)}
            ${renderField('Duration', `${runResult.durationMs}ms`)}
            ${renderField('Generated at', generatedAt)}
            ${renderField('Report mode', 'Local / offline')}
          </div>
        </section>

        ${renderFailureSummary(runResult, failureStep, failureSnapshot, failureScreenshotPath)}

        <section class="card">
          <h2>Browser evidence</h2>
          <div class="count-grid">
            ${renderCountCard(browserEvidenceCounts.consoleMessages, 'Console messages')}
            ${renderCountCard(browserEvidenceCounts.consoleWarningsOrErrors, 'Warnings / errors')}
            ${renderCountCard(browserEvidenceCounts.pageErrors, 'Page errors')}
            ${renderCountCard(browserEvidenceCounts.networkFailures, 'Network failures')}
            ${renderCountCard(browserEvidenceCounts.httpErrors, 'HTTP errors')}
          </div>

          <div class="section-stack" style="margin-top: 16px;">
            ${renderConsoleEvidence(consoleMessages)}
            ${renderPageErrorEvidence(pageErrors)}
            ${renderNetworkFailureEvidence(networkFailures)}
            ${renderHttpErrorEvidence(httpErrors)}
            ${renderNoEvidenceNote(
              consoleMessages.length === 0 &&
                pageErrors.length === 0 &&
                networkFailures.length === 0 &&
                httpErrors.length === 0
            )}
          </div>
        </section>

        <section class="card">
          <h2>Step results</h2>
          ${renderStepResultsTable(runResult.stepResults)}
        </section>
      </div>

      <p class="footer-note">${escapeHtml(OFFLINE_REPORT_NOTE)}</p>
    </main>
  </body>
</html>`;
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderField(label: string, value: string, mono = false): string {
  return `<div class="field"><span class="field-label">${escapeHtml(label)}</span><div class="field-value${mono ? ' mono' : ''}">${escapeHtml(value)}</div></div>`;
}

function renderCountCard(value: number, label: string): string {
  return `<div class="count-card"><strong>${escapeHtml(String(value))}</strong><span>${escapeHtml(label)}</span></div>`;
}

function renderFailureSummary(
  runResult: RunResult,
  failureStep: StepResult | null,
  failureSnapshot: StepSnapshot | null,
  failureScreenshotPath: string | null
): string {
  if (runResult.status === 'passed') {
    return '';
  }

  const errorMessage = failureStep?.errorMessage ??
    (runResult.status === 'error'
      ? 'No detailed error message was recorded for this run.'
      : 'No error message was recorded for this failure.');

  return `<section class="card">
          <h2>Failure summary</h2>
          <div class="failure-grid">
            ${renderField('Step', failureStep ? `Step ${failureStep.stepIndex + 1}` : EMPTY_VALUE)}
            ${renderField('Label', failureStep?.label ?? EMPTY_VALUE)}
            ${renderField('Type', failureStep?.type ?? EMPTY_VALUE)}
            ${renderField('Target', failureSnapshot?.target ?? EMPTY_VALUE, Boolean(failureSnapshot?.target))}
            ${renderField('Value', failureSnapshot?.value ?? EMPTY_VALUE)}
            ${renderField(
              'Timeout',
              typeof failureSnapshot?.timeoutMs === 'number' ? `${failureSnapshot.timeoutMs}ms` : EMPTY_VALUE
            )}
          </div>
          <div class="field" style="margin-top: 12px;">
            <span class="field-label">Error</span>
            <div class="field-value">${escapeHtml(errorMessage)}</div>
          </div>
          ${failureScreenshotPath
            ? `<div class="field" style="margin-top: 12px;"><span class="field-label">Failure screenshot path</span><div class="field-value mono">${escapeHtml(failureScreenshotPath)}</div></div>`
            : ''}
          ${!failureSnapshot && failureStep
            ? '<p class="report-note" style="margin-top: 12px;">Saved step snapshot details were not available in this run result.</p>'
            : ''}
        </section>`;
}

function renderConsoleEvidence(messages: readonly BrowserConsoleMessage[]): string {
  if (messages.length === 0) {
    return '';
  }

  return `<section>
            <h3>Console messages</h3>
            <div class="evidence-list" style="margin-top: 10px;">
              ${messages.map(renderConsoleEntry).join('')}
            </div>
          </section>`;
}

function renderConsoleEntry(message: BrowserConsoleMessage): string {
  const location = formatBrowserEvidenceLocation(message.location);

  return `<article class="evidence-entry">
            <div class="entry-header">
              ${renderEntryBadge(getConsoleMessageTone(message.type), message.type)}
              <span class="entry-meta">${escapeHtml(message.timestamp)}</span>
              ${renderRelatedStepMeta(message.relatedStepIndex)}
            </div>
            <p class="entry-text">${escapeHtml(message.text)}</p>
            ${location ? `<p class="entry-meta mono" style="margin-top: 8px;">${escapeHtml(location)}</p>` : ''}
          </article>`;
}

function renderPageErrorEvidence(pageErrors: readonly PageErrorRecord[]): string {
  if (pageErrors.length === 0) {
    return '';
  }

  return `<section>
            <h3>Page errors</h3>
            <div class="evidence-list" style="margin-top: 10px;">
              ${pageErrors.map(renderPageErrorEntry).join('')}
            </div>
          </section>`;
}

function renderPageErrorEntry(pageError: PageErrorRecord): string {
  const stackPreview = getPageErrorStackPreview(pageError);
  const nameAndStack = [pageError.name, stackPreview].filter(Boolean).join(' - ');

  return `<article class="evidence-entry">
            <div class="entry-header">
              ${renderEntryBadge('danger', 'page error')}
              <span class="entry-meta">${escapeHtml(pageError.timestamp)}</span>
              ${renderRelatedStepMeta(pageError.relatedStepIndex)}
            </div>
            <p class="entry-text">${escapeHtml(pageError.message)}</p>
            ${nameAndStack
              ? `<p class="entry-meta mono" style="margin-top: 8px;">${escapeHtml(nameAndStack)}</p>`
              : ''}
          </article>`;
}

function renderNetworkFailureEvidence(networkFailures: readonly NetworkFailureRecord[]): string {
  if (networkFailures.length === 0) {
    return '';
  }

  return `<section>
            <h3>Network failures</h3>
            <div class="evidence-list" style="margin-top: 10px;">
              ${networkFailures.map(renderNetworkFailureEntry).join('')}
            </div>
          </section>`;
}

function renderNetworkFailureEntry(networkFailure: NetworkFailureRecord): string {
  const metadata = [
    networkFailure.timestamp,
    networkFailure.method,
    networkFailure.resourceType,
    typeof networkFailure.status === 'number' ? `HTTP ${networkFailure.status}` : null,
    typeof networkFailure.relatedStepIndex === 'number' ? `Step ${networkFailure.relatedStepIndex + 1}` : null
  ].filter(Boolean);

  return `<article class="evidence-entry">
            <div class="entry-header">
              ${renderEntryBadge('warning', 'request failed')}
              <span class="entry-meta">${escapeHtml(metadata.join(' · '))}</span>
            </div>
            <p class="entry-text">${escapeHtml(networkFailure.failureText ?? 'Request failed without an error text.')}</p>
            <p class="entry-meta mono" style="margin-top: 8px;">${escapeHtml(networkFailure.url)}</p>
          </article>`;
}

function renderHttpErrorEvidence(httpErrors: readonly HttpErrorRecord[]): string {
  if (httpErrors.length === 0) {
    return '';
  }

  return `<section>
            <h3>HTTP errors</h3>
            <div class="evidence-list" style="margin-top: 10px;">
              ${httpErrors.map(renderHttpErrorEntry).join('')}
            </div>
          </section>`;
}

function renderHttpErrorEntry(httpError: HttpErrorRecord): string {
  const metadata = [
    httpError.timestamp,
    httpError.method,
    httpError.resourceType,
    typeof httpError.relatedStepIndex === 'number' ? `Step ${httpError.relatedStepIndex + 1}` : null
  ].filter(Boolean);
  const badgeTone = httpError.status >= 500 ? 'danger' : 'warning';
  const summary = httpError.statusText ?? `HTTP ${httpError.status} response`;

  return `<article class="evidence-entry">
            <div class="entry-header">
              ${renderEntryBadge(badgeTone, `HTTP ${httpError.status}`)}
              <span class="entry-meta">${escapeHtml(metadata.join(' · '))}</span>
            </div>
            <p class="entry-text">${escapeHtml(summary)}</p>
            <p class="entry-meta mono" style="margin-top: 8px;">${escapeHtml(httpError.url)}</p>
          </article>`;
}

function renderNoEvidenceNote(show: boolean): string {
  if (!show) {
    return '';
  }

  return '<p class="report-note">No browser-side evidence was stored for this run result.</p>';
}

function renderStepResultsTable(stepResults: readonly StepResult[]): string {
  if (stepResults.length === 0) {
    return '<p class="report-note">No step results were recorded for this run.</p>';
  }

  return `<table>
            <thead>
              <tr>
                <th>Step</th>
                <th>Status</th>
                <th>Label</th>
                <th>Duration</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              ${stepResults.map(renderStepRow).join('')}
            </tbody>
          </table>`;
}

function renderStepRow(stepResult: StepResult): string {
  return `<tr>
            <td>${escapeHtml(`Step ${stepResult.stepIndex + 1}`)}</td>
            <td>${renderStatusBadge(stepResult.status)}</td>
            <td>${escapeHtml(stepResult.label)}</td>
            <td>${escapeHtml(`${stepResult.durationMs}ms`)}</td>
            <td>
              <div class="table-detail">
                ${stepResult.errorMessage ? `<span>${escapeHtml(stepResult.errorMessage)}</span>` : '<span>—</span>'}
                ${stepResult.screenshotPath ? `<span class="mono">${escapeHtml(stepResult.screenshotPath)}</span>` : ''}
              </div>
            </td>
          </tr>`;
}

function renderStatusBadge(status: RunResult['status'] | StepResult['status']): string {
  return `<span class="status-badge status-${status}">${escapeHtml(status.toUpperCase())}</span>`;
}

function renderEntryBadge(tone: 'success' | 'warning' | 'danger', text: string): string {
  return `<span class="entry-badge tone-${tone}">${escapeHtml(text)}</span>`;
}

function renderRelatedStepMeta(relatedStepIndex: number | undefined): string {
  if (typeof relatedStepIndex !== 'number') {
    return '';
  }

  return `<span class="entry-meta">${escapeHtml(`Step ${relatedStepIndex + 1}`)}</span>`;
}

function getConsoleMessageTone(type: string): 'success' | 'warning' | 'danger' {
  const normalizedType = type.toLowerCase();

  if (normalizedType === 'error' || normalizedType === 'assert') {
    return 'danger';
  }

  if (normalizedType === 'warning') {
    return 'warning';
  }

  return 'success';
}
