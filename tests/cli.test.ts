import { describe, expect, it } from 'vitest';

import { parseCliArgs } from '../src/cli/parseArgs';
import { runStatusToExitCode, EXIT_PASSED, EXIT_FAILED_OR_ERROR, EXIT_INVALID_USAGE } from '../src/cli/exitCodes';

describe('CLI argument parsing', () => {
  it('parses required positional arguments', () => {
    const result = parseCliArgs(['/path/to/project', 'my-test.test.json']);

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.args.projectPath).toBe('/path/to/project');
      expect(result.args.testIdentifier).toBe('my-test.test.json');
      expect(result.args.junit).toBe(false);
      expect(result.args.html).toBe(false);
      expect(result.args.headed).toBe(false);
      expect(result.args.browser).toBe('chromium');
    }
  });

  it('parses --junit flag', () => {
    const result = parseCliArgs(['/path/to/project', 'my-test.test.json', '--junit']);

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.args.junit).toBe(true);
    }
  });

  it('parses --html flag', () => {
    const result = parseCliArgs(['/path/to/project', 'my-test.test.json', '--html']);

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.args.html).toBe(true);
    }
  });

  it('parses --headed flag', () => {
    const result = parseCliArgs(['/path/to/project', 'my-test.test.json', '--headed']);

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.args.headed).toBe(true);
    }
  });

  it('parses --browser option with value', () => {
    const result = parseCliArgs(['/path/to/project', 'my-test.test.json', '--browser', 'firefox']);

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.args.browser).toBe('firefox');
    }
  });

  it('parses multiple flags together', () => {
    const result = parseCliArgs([
      '/path/to/project',
      'my-test.test.json',
      '--junit',
      '--html',
      '--headed',
      '--browser',
      'chromium'
    ]);

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.args.junit).toBe(true);
      expect(result.args.html).toBe(true);
      expect(result.args.headed).toBe(true);
      expect(result.args.browser).toBe('chromium');
    }
  });

  it('rejects missing arguments', () => {
    const result = parseCliArgs(['/path/to/project']);

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error).toContain('Usage:');
    }
  });

  it('rejects no arguments', () => {
    const result = parseCliArgs([]);

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error).toContain('Usage:');
    }
  });

  it('rejects too many arguments', () => {
    const result = parseCliArgs(['/path/to/project', 'test1', 'test2']);

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error).toContain('Too many arguments');
    }
  });

  it('rejects unknown options', () => {
    const result = parseCliArgs(['/path/to/project', 'my-test.test.json', '--unknown']);

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error).toContain('Unknown option');
    }
  });

  it('rejects --browser without a value', () => {
    const result = parseCliArgs(['/path/to/project', 'my-test.test.json', '--browser']);

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error).toContain('--browser requires a value');
    }
  });

  it('rejects --browser with another flag as value', () => {
    const result = parseCliArgs(['/path/to/project', 'my-test.test.json', '--browser', '--junit']);

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error).toContain('--browser requires a value');
    }
  });

  it('accepts test ID as test identifier', () => {
    const result = parseCliArgs(['/path/to/project', 'test_550e8400-e29b-41d4-a716-446655440000']);

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.args.testIdentifier).toBe('test_550e8400-e29b-41d4-a716-446655440000');
    }
  });
});

describe('CLI exit codes', () => {
  it('returns 0 for passed status', () => {
    expect(runStatusToExitCode('passed')).toBe(EXIT_PASSED);
    expect(EXIT_PASSED).toBe(0);
  });

  it('returns 1 for failed status', () => {
    expect(runStatusToExitCode('failed')).toBe(EXIT_FAILED_OR_ERROR);
    expect(EXIT_FAILED_OR_ERROR).toBe(1);
  });

  it('returns 1 for error status', () => {
    expect(runStatusToExitCode('error')).toBe(EXIT_FAILED_OR_ERROR);
    expect(EXIT_FAILED_OR_ERROR).toBe(1);
  });

  it('defines exit code 2 for invalid usage', () => {
    expect(EXIT_INVALID_USAGE).toBe(2);
  });
});
