import type { ReactElement } from 'react';

import { AppShell } from './components/AppShell';

export function App(): ReactElement {
  return <AppShell platform={window.websiteTestingTool.platform} />;
}
