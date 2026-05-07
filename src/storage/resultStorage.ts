import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

import type { RunResult } from '../shared/project-schema';
import { validateRunResult } from '../shared/project-schema';

const RUN_RESULT_FILE_PREFIX = 'run-';
const RUN_RESULT_FILE_SUFFIX = '.json';

export async function listRunResults(projectPath: string): Promise<readonly RunResult[]> {
  const resultsDir = join(projectPath, 'results');

  let entries: string[];

  try {
    entries = await readdir(resultsDir);
  } catch {
    return [];
  }

  const results: RunResult[] = [];

  for (const entry of entries) {
    if (!entry.startsWith(RUN_RESULT_FILE_PREFIX) || !entry.endsWith(RUN_RESULT_FILE_SUFFIX)) {
      continue;
    }

    try {
      const filePath = join(resultsDir, entry);
      const contents = await readFile(filePath, 'utf8');
      const parsed = JSON.parse(contents) as unknown;
      const errors = validateRunResult(parsed);

      if (errors.length === 0) {
        results.push(parsed as RunResult);
      }
    } catch {
      // Skip unreadable files
    }
  }

  // Sort by startedAt descending (most recent first)
  results.sort((a, b) => b.startedAt.localeCompare(a.startedAt));

  return results;
}

export async function readRunResult(projectPath: string, runId: string): Promise<RunResult> {
  const filePath = join(projectPath, 'results', `run-${runId}.json`);
  const contents = await readFile(filePath, 'utf8');
  const parsed = JSON.parse(contents) as unknown;
  const errors = validateRunResult(parsed);

  if (errors.length > 0) {
    throw new Error(`Invalid run result: ${errors.join(' ')}`);
  }

  return parsed as RunResult;
}
