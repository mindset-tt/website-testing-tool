export interface CliArgs {
  readonly projectPath: string;
  readonly testIdentifier: string;
  readonly browser: string;
  readonly junit: boolean;
  readonly html: boolean;
  readonly headed: boolean;
}

export type CliParseResult = {
  readonly ok: true;
  readonly args: CliArgs;
} | {
  readonly ok: false;
  readonly error: string;
};

export function parseCliArgs(rawArgs: readonly string[]): CliParseResult {
  const positional: string[] = [];
  let junit = false;
  let html = false;
  let headed = false;
  let browser = 'chromium';

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];

    switch (arg) {
      case '--junit':
        junit = true;
        break;
      case '--html':
        html = true;
        break;
      case '--headed':
        headed = true;
        break;
      case '--browser': {
        const next = rawArgs[i + 1];

        if (!next || next.startsWith('--')) {
          return { ok: false, error: '--browser requires a value (e.g. --browser chromium).' };
        }

        browser = next;
        i += 1;
        break;
      }
      default:
        if (arg.startsWith('--')) {
          return { ok: false, error: `Unknown option: ${arg}` };
        }

        positional.push(arg);
        break;
    }
  }

  if (positional.length < 2) {
    return {
      ok: false,
      error: 'Usage: npm run cli -- <project-path> <test-file-or-test-id> [--junit] [--html] [--headed] [--browser chromium]'
    };
  }

  if (positional.length > 2) {
    return { ok: false, error: 'Too many arguments. Expected: <project-path> <test-file-or-test-id>.' };
  }

  return {
    ok: true,
    args: {
      projectPath: positional[0],
      testIdentifier: positional[1],
      browser,
      junit,
      html,
      headed
    }
  };
}
