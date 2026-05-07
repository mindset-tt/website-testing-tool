import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import {
  createProjectFolderStructure,
  forgetRecentProject,
  listRecentProjects,
  mergeRecentProjects,
  readProjectMetadata,
  rememberRecentProject,
  renameProject
} from '../src/storage/projectStorage';

async function createTempDir(prefix: string): Promise<string> {
  const dir = join(tmpdir(), `${prefix}-${randomUUID()}`);
  await mkdir(dir, { recursive: true });

  return dir;
}

describe('project storage', () => {
  it('renames a project without changing its ID, createdAt, or folder path', async () => {
    const parentFolder = await createTempDir('wtt-project-parent');
    const project = await createProjectFolderStructure(parentFolder, 'Original Project', '0.0.0');

    await new Promise((resolve) => setTimeout(resolve, 10));

    const renamed = await renameProject(project.projectPath, 'Renamed Project');

    expect(renamed.projectPath).toBe(project.projectPath);
    expect(renamed.metadata.name).toBe('Renamed Project');
    expect(renamed.metadata.projectId).toBe(project.metadata.projectId);
    expect(renamed.metadata.createdAt).toBe(project.metadata.createdAt);
    expect(renamed.metadata.updatedAt).not.toBe(project.metadata.updatedAt);
    expect(renamed.metadata.appVersion).toBe(project.metadata.appVersion);
  });

  it('merges recent projects by project path, newest first, with a small max size', () => {
    const merged = mergeRecentProjects(
      [
        {
          name: 'Older Project',
          projectPath: 'C:\\Projects\\older',
          lastOpenedAt: '2026-05-07T09:00:00.000Z'
        },
        {
          name: 'Existing Project',
          projectPath: 'C:\\Projects\\existing',
          lastOpenedAt: '2026-05-07T08:00:00.000Z'
        }
      ],
      {
        name: 'Existing Project Renamed',
        projectPath: 'c:\\projects\\existing',
        lastOpenedAt: '2026-05-07T10:00:00.000Z'
      },
      2
    );

    expect(merged).toEqual([
      {
        name: 'Existing Project Renamed',
        projectPath: 'c:\\projects\\existing',
        lastOpenedAt: '2026-05-07T10:00:00.000Z'
      },
      {
        name: 'Older Project',
        projectPath: 'C:\\Projects\\older',
        lastOpenedAt: '2026-05-07T09:00:00.000Z'
      }
    ]);
  });

  it('lists recent projects from app storage and drops missing project folders', async () => {
    const parentFolder = await createTempDir('wtt-recent-parent');
    const userDataPath = await createTempDir('wtt-user-data');
    const firstProject = await createProjectFolderStructure(parentFolder, 'First Project', '0.0.0');
    const secondProject = await createProjectFolderStructure(parentFolder, 'Second Project', '0.0.0');

    await rememberRecentProject(userDataPath, firstProject, '2026-05-07T09:00:00.000Z');
    await rememberRecentProject(userDataPath, secondProject, '2026-05-07T10:00:00.000Z');

    await rm(firstProject.projectPath, { recursive: true, force: true });

    const recentProjects = await listRecentProjects(userDataPath);

    expect(recentProjects).toEqual([
      {
        name: 'Second Project',
        projectPath: secondProject.projectPath,
        lastOpenedAt: '2026-05-07T10:00:00.000Z'
      }
    ]);
  });

  it('forgets only the matching recent project path without touching project files', async () => {
    const parentFolder = await createTempDir('wtt-forget-parent');
    const userDataPath = await createTempDir('wtt-forget-user-data');
    const firstProject = await createProjectFolderStructure(parentFolder, 'First Project', '0.0.0');
    const secondProject = await createProjectFolderStructure(parentFolder, 'Second Project', '0.0.0');
    const thirdProject = await createProjectFolderStructure(parentFolder, 'Third Project', '0.0.0');

    await rememberRecentProject(userDataPath, firstProject, '2026-05-07T08:00:00.000Z');
    await rememberRecentProject(userDataPath, secondProject, '2026-05-07T10:00:00.000Z');
    await rememberRecentProject(userDataPath, thirdProject, '2026-05-07T09:00:00.000Z');

    const updated = await forgetRecentProject(userDataPath, thirdProject.projectPath);

    expect(updated).toEqual([
      {
        name: 'Second Project',
        projectPath: secondProject.projectPath,
        lastOpenedAt: '2026-05-07T10:00:00.000Z'
      },
      {
        name: 'First Project',
        projectPath: firstProject.projectPath,
        lastOpenedAt: '2026-05-07T08:00:00.000Z'
      }
    ]);

    const preservedMetadata = await readProjectMetadata(thirdProject.projectPath);

    expect(preservedMetadata.projectId).toBe(thirdProject.metadata.projectId);
  });

  it('does not fail when forgetting a recent project path that is absent', async () => {
    const parentFolder = await createTempDir('wtt-forget-absent-parent');
    const userDataPath = await createTempDir('wtt-forget-absent-user-data');
    const project = await createProjectFolderStructure(parentFolder, 'Only Project', '0.0.0');

    await rememberRecentProject(userDataPath, project, '2026-05-07T09:00:00.000Z');

    const updated = await forgetRecentProject(userDataPath, 'C:\\Projects\\not-present');

    expect(updated).toEqual([
      {
        name: 'Only Project',
        projectPath: project.projectPath,
        lastOpenedAt: '2026-05-07T09:00:00.000Z'
      }
    ]);
  });
});
