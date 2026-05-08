import { describe, expect, it } from 'vitest';

import {
  createRunEvidenceCollector,
  MAX_CONSOLE_MESSAGE_COUNT,
  MAX_PAGE_ERROR_COUNT,
  MAX_CONSOLE_TEXT_LENGTH,
  MAX_HTTP_ERROR_COUNT,
  MAX_HTTP_STATUS_TEXT_LENGTH,
  MAX_NETWORK_FAILURE_COUNT,
  MAX_NETWORK_FAILURE_TEXT_LENGTH,
  MAX_NETWORK_METHOD_LENGTH,
  MAX_NETWORK_RESOURCE_TYPE_LENGTH,
  MAX_NETWORK_URL_LENGTH,
  MAX_PAGE_ERROR_STACK_LENGTH
} from '../src/automation/runEvidence';

describe('run evidence collector', () => {
  it('caps console messages and keeps the newest entries', () => {
    const collector = createRunEvidenceCollector();

    for (let index = 0; index < MAX_CONSOLE_MESSAGE_COUNT + 2; index++) {
      collector.recordConsoleMessage({
        timestamp: `2026-05-07T10:00:${String(index).padStart(2, '0')}.000Z`,
        type: 'log',
        text: `message ${index}`
      });
    }

    const consoleMessages = collector.getConsoleMessages();

    expect(consoleMessages).toHaveLength(MAX_CONSOLE_MESSAGE_COUNT);
    expect(consoleMessages?.[0]?.text).toBe('message 2');
    expect(consoleMessages?.at(-1)?.text).toBe(`message ${MAX_CONSOLE_MESSAGE_COUNT + 1}`);
  });

  it('truncates long console text and page error stacks', () => {
    const collector = createRunEvidenceCollector();
    const longConsoleText = 'x'.repeat(MAX_CONSOLE_TEXT_LENGTH + 25);
    const longStack = 'stack-line'.repeat(MAX_PAGE_ERROR_STACK_LENGTH / 5);

    collector.recordConsoleMessage({
      timestamp: '2026-05-07T10:00:00.000Z',
      type: 'warning',
      text: longConsoleText
    });
    collector.recordPageError({
      timestamp: '2026-05-07T10:00:01.000Z',
      message: 'Boom',
      stack: longStack
    });

    const consoleMessages = collector.getConsoleMessages();
    const pageErrors = collector.getPageErrors();

    expect(consoleMessages?.[0]?.text.length).toBeLessThanOrEqual(MAX_CONSOLE_TEXT_LENGTH);
    expect(consoleMessages?.[0]?.text.endsWith('...')).toBe(true);
    expect(pageErrors?.[0]?.stack?.length).toBeLessThanOrEqual(MAX_PAGE_ERROR_STACK_LENGTH);
    expect(pageErrors?.[0]?.stack?.endsWith('...')).toBe(true);
  });

  it('caps page errors and preserves safe related step indexes', () => {
    const collector = createRunEvidenceCollector();

    for (let index = 0; index < MAX_PAGE_ERROR_COUNT + 3; index++) {
      collector.recordPageError({
        timestamp: `2026-05-07T10:01:${String(index).padStart(2, '0')}.000Z`,
        message: `error ${index}`,
        relatedStepIndex: index % 2 === 0 ? 1 : -1
      });
    }

    const pageErrors = collector.getPageErrors();

    expect(pageErrors).toHaveLength(MAX_PAGE_ERROR_COUNT);
    expect(pageErrors?.[0]?.message).toBe('error 3');
    expect(pageErrors?.[0]?.relatedStepIndex).toBeUndefined();
    expect(pageErrors?.[1]?.relatedStepIndex).toBe(1);
  });

  it('caps network failures and keeps the newest entries', () => {
    const collector = createRunEvidenceCollector();

    for (let index = 0; index < MAX_NETWORK_FAILURE_COUNT + 2; index++) {
      collector.recordNetworkFailure({
        timestamp: `2026-05-07T10:02:${String(index).padStart(2, '0')}.000Z`,
        url: `https://example.com/request-${index}`,
        failureText: `net::ERR_FAILED ${index}`
      });
    }

    const networkFailures = collector.getNetworkFailures();

    expect(networkFailures).toHaveLength(MAX_NETWORK_FAILURE_COUNT);
    expect(networkFailures?.[0]?.url).toBe('https://example.com/request-2');
    expect(networkFailures?.at(-1)?.failureText).toBe(`net::ERR_FAILED ${MAX_NETWORK_FAILURE_COUNT + 1}`);
  });

  it('truncates long network URLs and failure text', () => {
    const collector = createRunEvidenceCollector();
    const longUrl = `https://example.com/${'route/'.repeat(80)}`;
    const longFailureText = 'net::ERR_'.padEnd(MAX_NETWORK_FAILURE_TEXT_LENGTH + 30, 'X');

    collector.recordNetworkFailure({
      timestamp: '2026-05-07T10:02:00.000Z',
      url: longUrl,
      failureText: longFailureText
    });

    const networkFailures = collector.getNetworkFailures();

    expect(networkFailures?.[0]?.url.length).toBeLessThanOrEqual(MAX_NETWORK_URL_LENGTH);
    expect(networkFailures?.[0]?.url.endsWith('...')).toBe(true);
    expect(networkFailures?.[0]?.failureText?.length).toBeLessThanOrEqual(MAX_NETWORK_FAILURE_TEXT_LENGTH);
    expect(networkFailures?.[0]?.failureText?.endsWith('...')).toBe(true);
  });

  it('normalizes safe network method, resource type, and status fields', () => {
    const collector = createRunEvidenceCollector();
    const longMethod = `  ${'post'.repeat(MAX_NETWORK_METHOD_LENGTH)}  `;
    const longResourceType = `  ${'xmlhttprequest'.repeat(MAX_NETWORK_RESOURCE_TYPE_LENGTH)}  `;

    collector.recordNetworkFailure({
      timestamp: '2026-05-07T10:02:01.000Z',
      url: 'https://example.com/api/checkout',
      method: longMethod,
      resourceType: longResourceType,
      status: 503,
      relatedStepIndex: 1
    });

    const networkFailures = collector.getNetworkFailures();

    expect(networkFailures?.[0]?.method?.length).toBeLessThanOrEqual(MAX_NETWORK_METHOD_LENGTH);
    expect(networkFailures?.[0]?.method).toBe(networkFailures?.[0]?.method?.toUpperCase());
    expect(networkFailures?.[0]?.resourceType?.length).toBeLessThanOrEqual(MAX_NETWORK_RESOURCE_TYPE_LENGTH);
    expect(networkFailures?.[0]?.resourceType).toBe(networkFailures?.[0]?.resourceType?.toLowerCase());
    expect(networkFailures?.[0]?.status).toBe(503);
    expect(networkFailures?.[0]?.relatedStepIndex).toBe(1);
  });

  it('accepts only 4xx and 5xx HTTP errors', () => {
    const collector = createRunEvidenceCollector();

    collector.recordHttpError({
      timestamp: '2026-05-07T10:03:00.000Z',
      url: 'https://example.com/missing',
      status: 404
    });
    collector.recordHttpError({
      timestamp: '2026-05-07T10:03:01.000Z',
      url: 'https://example.com/server-error',
      status: 500
    });

    const httpErrors = collector.getHttpErrors();

    expect(httpErrors).toHaveLength(2);
    expect(httpErrors?.map((error) => error.status)).toEqual([404, 500]);
  });

  it('ignores 2xx and 3xx HTTP responses', () => {
    const collector = createRunEvidenceCollector();

    collector.recordHttpError({
      timestamp: '2026-05-07T10:03:00.000Z',
      url: 'https://example.com/ok',
      status: 200
    });
    collector.recordHttpError({
      timestamp: '2026-05-07T10:03:01.000Z',
      url: 'https://example.com/redirect',
      status: 302
    });

    expect(collector.getHttpErrors()).toBeUndefined();
  });

  it('caps HTTP errors and keeps the newest entries', () => {
    const collector = createRunEvidenceCollector();

    for (let index = 0; index < MAX_HTTP_ERROR_COUNT + 2; index++) {
      collector.recordHttpError({
        timestamp: `2026-05-07T10:03:${String(index).padStart(2, '0')}.000Z`,
        url: `https://example.com/http-error-${index}`,
        status: 404
      });
    }

    const httpErrors = collector.getHttpErrors();

    expect(httpErrors).toHaveLength(MAX_HTTP_ERROR_COUNT);
    expect(httpErrors?.[0]?.url).toBe('https://example.com/http-error-2');
    expect(httpErrors?.at(-1)?.url).toBe(`https://example.com/http-error-${MAX_HTTP_ERROR_COUNT + 1}`);
  });

  it('truncates long HTTP error URLs and status text', () => {
    const collector = createRunEvidenceCollector();
    const longUrl = `https://example.com/${'error/'.repeat(80)}`;
    const longStatusText = 'Internal Server Error'.padEnd(MAX_HTTP_STATUS_TEXT_LENGTH + 30, 'X');

    collector.recordHttpError({
      timestamp: '2026-05-07T10:03:00.000Z',
      url: longUrl,
      status: 500,
      statusText: longStatusText
    });

    const httpErrors = collector.getHttpErrors();

    expect(httpErrors?.[0]?.url.length).toBeLessThanOrEqual(MAX_NETWORK_URL_LENGTH);
    expect(httpErrors?.[0]?.url.endsWith('...')).toBe(true);
    expect(httpErrors?.[0]?.statusText?.length).toBeLessThanOrEqual(MAX_HTTP_STATUS_TEXT_LENGTH);
    expect(httpErrors?.[0]?.statusText?.endsWith('...')).toBe(true);
  });

  it('ignores internal-scheme HTTP error URLs', () => {
    const collector = createRunEvidenceCollector();

    collector.recordHttpError({
      timestamp: '2026-05-07T10:03:00.000Z',
      url: 'about:blank',
      status: 404
    });
    collector.recordHttpError({
      timestamp: '2026-05-07T10:03:01.000Z',
      url: 'data:text/plain,hello',
      status: 500
    });
    collector.recordHttpError({
      timestamp: '2026-05-07T10:03:02.000Z',
      url: 'blob:https://example.com/test',
      status: 500
    });
    collector.recordHttpError({
      timestamp: '2026-05-07T10:03:03.000Z',
      url: 'devtools://devtools/bundled/inspector.html',
      status: 500
    });

    expect(collector.getHttpErrors()).toBeUndefined();
  });
});
