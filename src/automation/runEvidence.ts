import type {
  BrowserConsoleLocation,
  BrowserConsoleMessage,
  PageErrorRecord
} from '../shared/project-schema';

export const MAX_CONSOLE_MESSAGE_COUNT = 100;
export const MAX_PAGE_ERROR_COUNT = 50;
export const MAX_CONSOLE_TEXT_LENGTH = 400;
export const MAX_CONSOLE_TYPE_LENGTH = 32;
export const MAX_LOCATION_URL_LENGTH = 240;
export const MAX_PAGE_ERROR_MESSAGE_LENGTH = 400;
export const MAX_PAGE_ERROR_NAME_LENGTH = 80;
export const MAX_PAGE_ERROR_STACK_LENGTH = 1200;

const ELLIPSIS = '...';

interface ConsoleMessageInput {
  readonly timestamp?: string;
  readonly type?: string;
  readonly text?: string;
  readonly location?: BrowserConsoleLocation | null;
  readonly relatedStepIndex?: number;
}

interface PageErrorInput {
  readonly timestamp?: string;
  readonly message?: string;
  readonly name?: string;
  readonly stack?: string;
  readonly relatedStepIndex?: number;
}

export interface RunEvidenceCollector {
  recordConsoleMessage(input: ConsoleMessageInput): void;
  recordPageError(input: PageErrorInput): void;
  getConsoleMessages(): readonly BrowserConsoleMessage[] | undefined;
  getPageErrors(): readonly PageErrorRecord[] | undefined;
}

export function createRunEvidenceCollector(): RunEvidenceCollector {
  const consoleMessages: BrowserConsoleMessage[] = [];
  const pageErrors: PageErrorRecord[] = [];

  return {
    recordConsoleMessage(input) {
      const entry: BrowserConsoleMessage = {
        timestamp: normalizeTimestamp(input.timestamp),
        type: normalizeSingleLineText(input.type, 'log', MAX_CONSOLE_TYPE_LENGTH),
        text: normalizeSingleLineText(input.text, '(empty console message)', MAX_CONSOLE_TEXT_LENGTH),
        location: normalizeConsoleLocation(input.location),
        relatedStepIndex: normalizeRelatedStepIndex(input.relatedStepIndex)
      };

      pushCapped(consoleMessages, entry, MAX_CONSOLE_MESSAGE_COUNT);
    },
    recordPageError(input) {
      const entry: PageErrorRecord = {
        timestamp: normalizeTimestamp(input.timestamp),
        message: normalizeSingleLineText(input.message, 'Unknown page error.', MAX_PAGE_ERROR_MESSAGE_LENGTH),
        name: normalizeOptionalSingleLineText(input.name, MAX_PAGE_ERROR_NAME_LENGTH),
        stack: normalizeOptionalMultilineText(input.stack, MAX_PAGE_ERROR_STACK_LENGTH),
        relatedStepIndex: normalizeRelatedStepIndex(input.relatedStepIndex)
      };

      pushCapped(pageErrors, entry, MAX_PAGE_ERROR_COUNT);
    },
    getConsoleMessages() {
      return consoleMessages.length > 0 ? [...consoleMessages] : undefined;
    },
    getPageErrors() {
      return pageErrors.length > 0 ? [...pageErrors] : undefined;
    }
  };
}

export function truncateDiagnosticText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  if (maxLength <= ELLIPSIS.length) {
    return value.slice(0, maxLength);
  }

  return `${value.slice(0, maxLength - ELLIPSIS.length).trimEnd()}${ELLIPSIS}`;
}

function normalizeTimestamp(timestamp: string | undefined): string {
  if (typeof timestamp === 'string' && timestamp.trim().length > 0) {
    return timestamp;
  }

  return new Date().toISOString();
}

function normalizeSingleLineText(value: string | undefined, fallback: string, maxLength: number): string {
  const normalized = typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';

  return truncateDiagnosticText(normalized.length > 0 ? normalized : fallback, maxLength);
}

function normalizeOptionalSingleLineText(value: string | undefined, maxLength: number): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.replace(/\s+/g, ' ').trim();

  if (normalized.length === 0) {
    return undefined;
  }

  return truncateDiagnosticText(normalized, maxLength);
}

function normalizeOptionalMultilineText(value: string | undefined, maxLength: number): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();

  if (normalized.length === 0) {
    return undefined;
  }

  return truncateDiagnosticText(normalized, maxLength);
}

function normalizeConsoleLocation(
  location: BrowserConsoleLocation | null | undefined
): BrowserConsoleLocation | undefined {
  if (!location) {
    return undefined;
  }

  const url = normalizeOptionalSingleLineText(location.url, MAX_LOCATION_URL_LENGTH);
  const lineNumber = normalizeRelatedStepIndex(location.lineNumber);
  const columnNumber = normalizeRelatedStepIndex(location.columnNumber);

  if (url === undefined && lineNumber === undefined && columnNumber === undefined) {
    return undefined;
  }

  return {
    url,
    lineNumber,
    columnNumber
  };
}

function normalizeRelatedStepIndex(value: number | undefined): number | undefined {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    return undefined;
  }

  return value;
}

function pushCapped<T>(items: T[], item: T, maxEntries: number): void {
  if (items.length >= maxEntries) {
    items.shift();
  }

  items.push(item);
}
