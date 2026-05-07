import { mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { describe, expect, it } from 'vitest';

import { readFailureScreenshot, resolveFailureScreenshotPath } from '../src/storage/resultStorage';

async function createTempProjectDir(): Promise<string> {
  const projectPath = join(tmpdir(), `wtt-results-${randomUUID()}`);

  await mkdir(join(projectPath, 'artifacts', 'screenshots', 'run-1'), { recursive: true });
  await mkdir(join(projectPath, 'artifacts', 'videos'), { recursive: true });

  return projectPath;
}

describe('result storage screenshot preview guards', () => {
  it('accepts a valid relative failure screenshot path inside artifacts/screenshots', async () => {
    const projectPath = await createTempProjectDir();
    const screenshotPath = join('artifacts', 'screenshots', 'run-1', 'step-0-failure.png');

    const resolvedPath = resolveFailureScreenshotPath(projectPath, screenshotPath);

    expect(resolvedPath).toBe(join(projectPath, 'artifacts', 'screenshots', 'run-1', 'step-0-failure.png'));
  });

  it('rejects traversal outside the screenshots directory', async () => {
    const projectPath = await createTempProjectDir();

    expect(() =>
      resolveFailureScreenshotPath(projectPath, join('artifacts', 'screenshots', '..', 'videos', 'clip.png'))
    ).toThrow('Failure screenshot path must stay inside the project artifacts folder.');
  });

  it('rejects paths outside artifacts/screenshots even when they stay inside the project', async () => {
    const projectPath = await createTempProjectDir();

    expect(() =>
      resolveFailureScreenshotPath(projectPath, join('artifacts', 'videos', 'clip.png'))
    ).toThrow('Failure screenshot path must stay inside the project artifacts folder.');
  });

  it('rejects non-PNG screenshot extensions', async () => {
    const projectPath = await createTempProjectDir();

    expect(() =>
      resolveFailureScreenshotPath(projectPath, join('artifacts', 'screenshots', 'run-1', 'step-0-failure.jpg'))
    ).toThrow('Only PNG failure screenshots can be previewed.');
  });

  it('returns a PNG data URL for a valid failure screenshot file', async () => {
    const projectPath = await createTempProjectDir();
    const screenshotPath = join('artifacts', 'screenshots', 'run-1', 'step-0-failure.png');

    await writeFile(join(projectPath, screenshotPath), Buffer.from('fake-png-bits'));

    const dataUrl = await readFailureScreenshot(projectPath, screenshotPath);

    expect(dataUrl).toBe(`data:image/png;base64,${Buffer.from('fake-png-bits').toString('base64')}`);
  });
});
