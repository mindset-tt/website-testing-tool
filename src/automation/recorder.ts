import { chromium } from 'playwright';
import type { Browser, Page } from 'playwright';

import { createStepId } from '../shared/project-schema';
import type { StepType, TestStep } from '../shared/project-schema';

export interface RecordedAction {
  readonly type: StepType;
  readonly label: string;
  readonly target: string;
  readonly value?: string;
}

const INIT_SCRIPT = `
(() => {
  let lastUrl = window.location.href;

  function buildSelector(el) {
    if (el.id) return '#' + CSS.escape(el.id);
    var testId = el.getAttribute('data-testid');
    if (testId) return '[data-testid="' + CSS.escape(testId) + '"]';
    var name = el.getAttribute('name');
    if (name) return el.tagName.toLowerCase() + '[name="' + CSS.escape(name) + '"]';
    var tag = el.tagName.toLowerCase();
    var classes = Array.from(el.classList).filter(function(c) { return c.length > 0 && !c.startsWith('_'); }).slice(0, 2);
    if (classes.length > 0) return tag + '.' + classes.map(function(c) { return CSS.escape(c); }).join('.');
    return tag;
  }

  function buildLabel(el, actionType) {
    var text = (el.textContent || '').trim().slice(0, 60);
    var tag = el.tagName.toLowerCase();
    if (actionType === 'click') return text ? 'Click "' + text + '"' : 'Click ' + tag;
    if (actionType === 'fill') {
      var placeholder = el.placeholder || '';
      var label = el.getAttribute('aria-label') || '';
      if (label) return 'Enter ' + label;
      if (placeholder) return 'Enter ' + placeholder;
      return 'Fill ' + tag;
    }
    return actionType + ' ' + tag;
  }

  function reportNavigation() {
    var currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      window.__wtt_pushAction({ type: 'navigate', label: 'Go to ' + currentUrl, target: currentUrl });
    }
  }

  document.addEventListener('click', function(event) {
    var el = event.target;
    if (!el || el === document.body || el === document.documentElement) return;
    var selector = buildSelector(el);
    var label = buildLabel(el, 'click');
    window.__wtt_pushAction({ type: 'click', label: label, target: selector });
  }, true);

  document.addEventListener('change', function(event) {
    var el = event.target;
    if (!el || !('value' in el)) return;
    var value = el.value;
    if (!value) return;
    var selector = buildSelector(el);
    var label = buildLabel(el, 'fill');
    window.__wtt_pushAction({ type: 'fill', label: label, target: selector, value: value });
  }, true);

  reportNavigation();

  var origPush = history.pushState;
  var origReplace = history.replaceState;
  history.pushState = function() { origPush.apply(history, arguments); reportNavigation(); };
  history.replaceState = function() { origReplace.apply(history, arguments); reportNavigation(); };
  window.addEventListener('popstate', function() { reportNavigation(); });
})();
`;

export class Recorder {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private actions: RecordedAction[] = [];
  private onAction: ((action: RecordedAction) => void) | null = null;
  private running = false;

  get isRunning(): boolean {
    return this.running;
  }

  get capturedActions(): readonly RecordedAction[] {
    return this.actions;
  }

  async start(onAction: (action: RecordedAction) => void): Promise<void> {
    if (this.running) {
      throw new Error('Recorder is already running.');
    }

    this.actions = [];
    this.onAction = onAction;
    this.running = true;

    try {
      this.browser = await chromium.launch({
        headless: false,
        args: ['--start-maximized']
      });

      const context = await this.browser.newContext({
        viewport: null // Use the maximized window size
      });

      this.page = await context.newPage();

      // Expose callback for the injected script
      await this.page.exposeFunction('__wtt_pushAction', (action: RecordedAction) => {
        this.actions.push(action);
        this.onAction?.(action);
      });

      // Inject recording script that runs on every page
      await this.page.addInitScript(INIT_SCRIPT);

      // Navigate to a blank page to trigger the init script
      await this.page.goto('about:blank');
    } catch (error) {
      // Clean up on failure so we don't leak browser processes
      this.running = false;

      try {
        if (this.page && !this.page.isClosed()) {
          await this.page.close().catch(() => {});
        }
      } catch {
        // Best effort
      }

      try {
        if (this.browser && this.browser.isConnected()) {
          await this.browser.close().catch(() => {});
        }
      } catch {
        // Best effort
      }

      this.page = null;
      this.browser = null;
      this.onAction = null;

      throw error;
    }
  }

  async stop(): Promise<readonly RecordedAction[]> {
    if (!this.running) {
      throw new Error('Recorder is not running.');
    }

    this.running = false;

    try {
      if (this.page && !this.page.isClosed()) {
        await this.page.close().catch(() => {});
      }
    } catch {
      // Best effort
    }

    try {
      if (this.browser && this.browser.isConnected()) {
        await this.browser.close().catch(() => {});
      }
    } catch {
      // Best effort
    }

    this.page = null;
    this.browser = null;
    this.onAction = null;

    return [...this.actions];
  }

  /**
   * Converts recorded actions to TestStep format.
   */
  static toTestSteps(actions: readonly RecordedAction[]): TestStep[] {
    return actions.map((action) => ({
      stepId: createStepId(),
      type: action.type,
      label: action.label,
      target: action.target,
      value: action.value
    }));
  }
}
