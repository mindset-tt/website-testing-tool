import type { WebsiteTestingToolApi } from '../shared/preload-api';

declare global {
  interface Window {
    websiteTestingTool: WebsiteTestingToolApi;
  }
}

export {};
