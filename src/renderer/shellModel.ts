export interface NavigationItem {
  readonly id: string;
  readonly label: string;
  readonly shortLabel: string;
  readonly status: string;
}

export interface WorkspaceCard {
  readonly id: string;
  readonly title: string;
  readonly shortLabel: string;
  readonly status: string;
  readonly description: string;
}

export const navigationItems: readonly NavigationItem[] = [
  {
    id: 'projects',
    label: 'Projects',
    shortLabel: 'P',
    status: 'No project open'
  },
  {
    id: 'tests',
    label: 'Tests',
    shortLabel: 'T',
    status: 'Empty'
  },
  {
    id: 'recorder',
    label: 'Recorder',
    shortLabel: 'R',
    status: 'Idle'
  },
  {
    id: 'results',
    label: 'Results',
    shortLabel: 'O',
    status: 'No runs'
  },
  {
    id: 'settings',
    label: 'Settings',
    shortLabel: 'S',
    status: 'Default'
  }
];

export const workspaceCards: readonly WorkspaceCard[] = [
  {
    id: 'projects',
    title: 'Projects',
    shortLabel: 'P',
    status: 'No project open',
    description: 'No local project is open.'
  },
  {
    id: 'tests',
    title: 'Tests',
    shortLabel: 'T',
    status: 'No saved tests',
    description: 'No saved tests in the current workspace.'
  },
  {
    id: 'recorder',
    title: 'Recorder',
    shortLabel: 'R',
    status: 'Not connected',
    description: 'Recording is unavailable in this build.'
  },
  {
    id: 'results',
    title: 'Results',
    shortLabel: 'O',
    status: 'No runs yet',
    description: 'No completed runs in the current workspace.'
  },
  {
    id: 'settings',
    title: 'Settings',
    shortLabel: 'S',
    status: 'Default workspace',
    description: 'Default workspace settings.'
  }
];
