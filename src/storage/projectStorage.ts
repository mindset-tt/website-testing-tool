import { randomUUID } from 'node:crypto';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join, normalize } from 'node:path';

import {
  createProjectMetadata,
  normalizeProjectName,
  PROJECT_DIRECTORY_NAMES,
  toProjectFolderName,
  validateProjectMetadata
} from '../shared/project-schema';
import type { ProjectMetadata } from '../shared/project-schema';
import type { OpenedProject, RecentProjectItem } from '../shared/preload-api';

const PROJECT_FILE_NAME = 'project.json';
const RECENT_PROJECTS_FILE_NAME = 'recent-projects.json';
const MAX_RECENT_PROJECTS = 8;
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

export async function renameProject(
  projectPath: string,
  name: string
): Promise<OpenedProject> {
  const normalizedName = normalizeProjectName(name);

  if (normalizedName.length === 0) {
    throw new Error('Project name is required.');
  }

  const metadata = await readProjectMetadata(projectPath);
  const updatedMetadata: ProjectMetadata = {
    ...metadata,
    name: normalizedName,
    updatedAt: new Date().toISOString()
  };

  await saveProjectMetadata(projectPath, updatedMetadata);

  return {
    projectPath,
    metadata: updatedMetadata
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

export async function listRecentProjects(userDataPath: string): Promise<readonly RecentProjectItem[]> {
  const storedItems = await readStoredRecentProjects(userDataPath);
  const validatedItems: RecentProjectItem[] = [];

  for (const item of storedItems) {
    try {
      const metadata = await readProjectMetadata(item.projectPath);

      validatedItems.push({
        name: metadata.name,
        projectPath: item.projectPath,
        lastOpenedAt: item.lastOpenedAt
      });
    } catch {
      continue;
    }
  }

  const normalizedItems = normalizeRecentProjects(validatedItems);

  if (JSON.stringify(normalizedItems) !== JSON.stringify(storedItems)) {
    await writeStoredRecentProjects(userDataPath, normalizedItems);
  }

  return normalizedItems;
}

export async function rememberRecentProject(
  userDataPath: string,
  project: OpenedProject,
  lastOpenedAt: string = new Date().toISOString()
): Promise<void> {
  const storedItems = await readStoredRecentProjects(userDataPath);
  const updatedItems = mergeRecentProjects(storedItems, {
    name: project.metadata.name,
    projectPath: project.projectPath,
    lastOpenedAt
  });

  await writeStoredRecentProjects(userDataPath, updatedItems);
}

export async function forgetRecentProject(
  userDataPath: string,
  projectPath: string
): Promise<readonly RecentProjectItem[]> {
  const storedItems = await readStoredRecentProjects(userDataPath);
  const pathKey = toProjectPathKey(projectPath);
  const filteredItems = normalizeRecentProjects(
    storedItems.filter((item) => toProjectPathKey(item.projectPath) !== pathKey)
  );

  if (filteredItems.length !== storedItems.length) {
    await writeStoredRecentProjects(userDataPath, filteredItems);
  }

  return filteredItems;
}

export function mergeRecentProjects(
  items: readonly RecentProjectItem[],
  nextItem: RecentProjectItem,
  maxItems: number = MAX_RECENT_PROJECTS
): RecentProjectItem[] {
  return normalizeRecentProjects([nextItem, ...items], maxItems);
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
  let folderStats;

  try {
    folderStats = await stat(path);
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      throw new Error(message, { cause: error });
    }

    throw error;
  }

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

async function readStoredRecentProjects(userDataPath: string): Promise<RecentProjectItem[]> {
  try {
    const fileContents = await readFile(join(userDataPath, RECENT_PROJECTS_FILE_NAME), 'utf8');
    const parsed = JSON.parse(fileContents) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return normalizeRecentProjects(parsed);
  } catch (error) {
    if (
      (isNodeError(error) && error.code === 'ENOENT') ||
      error instanceof SyntaxError
    ) {
      return [];
    }

    throw error;
  }
}

async function writeStoredRecentProjects(
  userDataPath: string,
  items: readonly RecentProjectItem[]
): Promise<void> {
  await mkdir(userDataPath, { recursive: true });
  await writeFile(
    join(userDataPath, RECENT_PROJECTS_FILE_NAME),
    `${JSON.stringify(normalizeRecentProjects(items), null, 2)}\n`,
    'utf8'
  );
}

function normalizeRecentProjects(
  items: readonly unknown[],
  maxItems: number = MAX_RECENT_PROJECTS
): RecentProjectItem[] {
  const dedupedItems = new Map<string, RecentProjectItem>();

  const sortedItems = items
    .map(toRecentProjectItem)
    .filter((item): item is RecentProjectItem => item !== null)
    .sort((left, right) => right.lastOpenedAt.localeCompare(left.lastOpenedAt));

  for (const item of sortedItems) {
    const pathKey = toProjectPathKey(item.projectPath);

    if (!dedupedItems.has(pathKey)) {
      dedupedItems.set(pathKey, item);
    }
  }

  return Array.from(dedupedItems.values()).slice(0, maxItems);
}

function toRecentProjectItem(value: unknown): RecentProjectItem | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }

  const item = value as Partial<RecentProjectItem>;

  if (
    typeof item.name !== 'string' ||
    item.name.trim().length === 0 ||
    typeof item.projectPath !== 'string' ||
    item.projectPath.trim().length === 0 ||
    typeof item.lastOpenedAt !== 'string' ||
    item.lastOpenedAt.trim().length === 0
  ) {
    return null;
  }

  return {
    name: item.name.trim(),
    projectPath: item.projectPath.trim(),
    lastOpenedAt: item.lastOpenedAt.trim()
  };
}

function toProjectPathKey(projectPath: string): string {
  return normalize(projectPath).toLowerCase();
}
