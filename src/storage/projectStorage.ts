import { randomUUID } from 'node:crypto';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import {
  createProjectMetadata,
  normalizeProjectName,
  PROJECT_DIRECTORY_NAMES,
  toProjectFolderName,
  validateProjectMetadata
} from '../shared/project-schema';
import type { ProjectMetadata } from '../shared/project-schema';
import type { OpenedProject } from '../shared/preload-api';

const PROJECT_FILE_NAME = 'project.json';
const REQUIRED_PROJECT_DIRECTORIES = [
  PROJECT_DIRECTORY_NAMES.tests,
  PROJECT_DIRECTORY_NAMES.results,
  PROJECT_DIRECTORY_NAMES.artifacts,
  join(PROJECT_DIRECTORY_NAMES.artifacts, PROJECT_DIRECTORY_NAMES.screenshots),
  join(PROJECT_DIRECTORY_NAMES.artifacts, PROJECT_DIRECTORY_NAMES.videos),
  join(PROJECT_DIRECTORY_NAMES.artifacts, PROJECT_DIRECTORY_NAMES.traces),
  PROJECT_DIRECTORY_NAMES.logs
] as const;

export async function createProjectFolderStructure(
  parentFolder: string,
  projectName: string,
  appVersion: string
): Promise<OpenedProject> {
  await assertDirectory(parentFolder, 'Selected parent folder does not exist.');

  const normalizedName = normalizeProjectName(projectName);

  if (normalizedName.length === 0) {
    throw new Error('Project name is required.');
  }

  const projectPath = await findAvailableProjectPath(parentFolder, toProjectFolderName(normalizedName));
  await mkdir(projectPath, { recursive: false });

  for (const directory of REQUIRED_PROJECT_DIRECTORIES) {
    await mkdir(join(projectPath, directory), { recursive: true });
  }

  const now = new Date().toISOString();
  const metadata = createProjectMetadata({
    projectId: `proj_${randomUUID()}`,
    name: normalizedName,
    createdAt: now,
    updatedAt: now,
    appVersion
  });

  await saveProjectMetadata(projectPath, metadata);

  return {
    projectPath,
    metadata
  };
}

export async function readProjectMetadata(projectPath: string): Promise<ProjectMetadata> {
  await assertDirectory(projectPath, 'Selected project folder does not exist.');

  const projectFilePath = join(projectPath, PROJECT_FILE_NAME);
  const fileContents = await readFile(projectFilePath, 'utf8');
  const parsedMetadata = parseProjectJson(fileContents);
  const validationErrors = validateProjectMetadata(parsedMetadata);

  if (validationErrors.length > 0) {
    throw new Error(`Invalid project metadata: ${validationErrors.join(' ')}`);
  }

  return parsedMetadata as ProjectMetadata;
}

export async function openProject(projectPath: string): Promise<OpenedProject> {
  const metadata = await readProjectMetadata(projectPath);

  return {
    projectPath,
    metadata
  };
}

export async function saveProjectMetadata(
  projectPath: string,
  metadata: ProjectMetadata
): Promise<void> {
  const validationErrors = validateProjectMetadata(metadata);

  if (validationErrors.length > 0) {
    throw new Error(`Cannot save invalid project metadata: ${validationErrors.join(' ')}`);
  }

  await writeFile(join(projectPath, PROJECT_FILE_NAME), `${JSON.stringify(metadata, null, 2)}\n`, 'utf8');
}

async function findAvailableProjectPath(parentFolder: string, baseFolderName: string): Promise<string> {
  let candidatePath = join(parentFolder, baseFolderName);
  let suffix = 2;

  while (await pathExists(candidatePath)) {
    candidatePath = join(parentFolder, `${baseFolderName}-${suffix}`);
    suffix += 1;
  }

  return candidatePath;
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      return false;
    }

    throw error;
  }
}

async function assertDirectory(path: string, message: string): Promise<void> {
  const folderStats = await stat(path);

  if (!folderStats.isDirectory()) {
    throw new Error(message);
  }
}

function parseProjectJson(fileContents: string): unknown {
  try {
    return JSON.parse(fileContents) as unknown;
  } catch {
    throw new Error('Project metadata is not valid JSON.');
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}
