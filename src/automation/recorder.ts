import { chromium } from 'playwright';
import type { Browser, Page } from 'playwright';

import { createStepId } from '../shared/project-schema';
import type { SelectorConfidence } from '../shared/selectorGeneration';
import type { StepType, TestStep } from '../shared/project-schema';
import { assertChromiumAvailable, normalizeChromiumLaunchError } from './playwrightBrowser';

export interface RecordedAction {
  readonly type: StepType;
  readonly label: string;
  readonly target: string;
  readonly value?: string;
  readonly selectorConfidence?: SelectorConfidence;
}

const INIT_SCRIPT = `
(() => {
  let lastUrl = window.location.href;

  function escapeCss(value) {
    return CSS.escape(value);
  }

  function buildSelector(el) {
    // Priority 1: data-testid
    var testId = el.getAttribute('data-testid');
    if (testId && testId.trim().length > 0) {
      return { selector: '[data-testid="' + escapeCss(testId.trim()) + '"]', confidence: 'high' };
    }

    // Priority 2: data-test
    var dataTest = el.getAttribute('data-test');
    if (dataTest && dataTest.trim().length > 0) {
      return { selector: '[data-test="' + escapeCss(dataTest.trim()) + '"]', confidence: 'high' };
    }

    // Priority 3: data-qa
    var dataQa = el.getAttribute('data-qa');
    if (dataQa && dataQa.trim().length > 0) {
      return { selector: '[data-qa="' + escapeCss(dataQa.trim()) + '"]', confidence: 'high' };
    }

    // Priority 4: id
    if (el.id && el.id.trim().length > 0) {
      return { selector: '#' + escapeCss(el.id.trim()), confidence: 'high' };
    }

    var tag = el.tagName.toLowerCase();

    // Priority 5: name attribute
    var name = el.getAttribute('name');
    if (name && name.trim().length > 0) {
      return { selector: tag + '[name="' + escapeCss(name.trim()) + '"]', confidence: 'medium' };
    }

    // Priority 6: aria-label
    var ariaLabel = el.getAttribute('aria-label');
    if (ariaLabel && ariaLabel.trim().length > 0) {
      return { selector: tag + '[aria-label="' + escapeCss(ariaLabel.trim()) + '"]', confidence: 'medium' };
    }

    // Priority 7: CSS class fallback
    var classes = Array.from(el.classList).filter(function(c) { return c.length > 0 && !c.startsWith('_'); }).slice(0, 2);
    if (classes.length > 0) {
      return { selector: tag + '.' + classes.map(function(c) { return escapeCss(c); }).join('.'), confidence: 'low' };
    }

    // Priority 8: tag fallback
    return { selector: tag, confidence: 'low' };
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
      window.__wtt_pushAction({ type: 'navigate', label: 'Go to ' + currentUrl, target: currentUrl, selectorConfidence: 'high' });
    }
  }

  document.addEventListener('click', function(event) {
    var el = event.target;
    if (!el || el === document.body || el === document.documentElement) return;
    var result = buildSelector(el);
    var label = buildLabel(el, 'click');
    window.__wtt_pushAction({ type: 'click', label: label, target: result.selector, selectorConfidence: result.confidence });
  }, true);

  document.addEventListener('change', function(event) {
    var el = event.target;
    if (!el || !('value' in el)) return;
    var value = el.value;
    if (!value) return;
    var result = buildSelector(el);
    var label = buildLabel(el, 'fill');
    window.__wtt_pushAction({ type: 'fill', label: label, target: result.selector, value: value, selectorConfidence: result.confidence });
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

    await assertChromiumAvailable('start recording');

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

      throw normalizeChromiumLaunchError(error, 'start recording', 'Failed to start recording.');
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
      value: action.value,
      selectorConfidence: action.selectorConfidence
    }));
  }
}
