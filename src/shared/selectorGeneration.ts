export type SelectorConfidence = 'high' | 'medium' | 'low';

export interface SelectorResult {
  readonly selector: string;
  readonly confidence: SelectorConfidence;
}

/**
 * Generates a CSS selector for an element using the priority order:
 * 1. data-testid (high)
 * 2. data-test (high)
 * 3. data-qa (high)
 * 4. id (high)
 * 5. name (medium)
 * 6. aria-label (medium)
 * 7. stable CSS class (low)
 * 8. tag name (low)
 */
export function generateSelector(attrs: Record<string, string | undefined>): SelectorResult {
  // Priority 1-3: data attributes (high confidence)
  const dataAttrs = ['data-testid', 'data-test', 'data-qa'] as const;

  for (const attr of dataAttrs) {
    const value = attrs[attr];

    if (value && value.trim().length > 0) {
      return {
        selector: `[${attr}="${escapeSelectorValue(value.trim())}"]`,
        confidence: 'high'
      };
    }
  }

  // Priority 4: id (high confidence)
  if (attrs.id && attrs.id.trim().length > 0) {
    return {
      selector: `#${escapeSelectorValue(attrs.id.trim())}`,
      confidence: 'high'
    };
  }

  // Priority 5: name attribute (medium confidence)
  if (attrs.name && attrs.name.trim().length > 0) {
    const tag = attrs.tag || '*';

    return {
      selector: `${tag}[name="${escapeSelectorValue(attrs.name.trim())}"]`,
      confidence: 'medium'
    };
  }

  // Priority 6: aria-label (medium confidence)
  if (attrs['aria-label'] && attrs['aria-label'].trim().length > 0) {
    const tag = attrs.tag || '*';

    return {
      selector: `${tag}[aria-label="${escapeSelectorValue(attrs['aria-label'].trim())}"]`,
      confidence: 'medium'
    };
  }

  // Priority 7: CSS class fallback (low confidence)
  const classes = (attrs.classes || '')
    .split(/\s+/)
    .filter((c) => c.length > 0 && !c.startsWith('_'))
    .slice(0, 2);

  if (classes.length > 0) {
    const tag = attrs.tag || 'div';
    const classSelector = classes.map((c) => escapeSelectorValue(c)).join('.');

    return {
      selector: `${tag}.${classSelector}`,
      confidence: 'low'
    };
  }

  // Priority 8: tag fallback (low confidence)
  const tag = attrs.tag || '*';

  return {
    selector: tag,
    confidence: 'low'
  };
}

/**
 * Escapes a value for use in a CSS selector.
 * Mirrors CSS.escape() behavior for the characters we care about.
 */
export function escapeSelectorValue(value: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    return '';
  }

  // If the first character is a digit or hyphen followed by a digit,
  // we must escape it for CSS identifier rules
  const firstChar = value[0];

  if (isDigit(firstChar)) {
    const code = firstChar.codePointAt(0) ?? 0;

    return `\\${code.toString(16).padStart(6, '0')} ${escapeAll(value.slice(1))}`;
  }

  if (firstChar === '-' && value.length > 1 && isDigit(value[1])) {
    const code = firstChar.codePointAt(0) ?? 0;

    return `\\${code.toString(16).padStart(6, '0')} ${escapeAll(value.slice(1))}`;
  }

  return escapeAll(value);
}

function isDigit(ch: string): boolean {
  return ch >= '0' && ch <= '9';
}

function escapeAll(value: string): string {
  let result = '';

  for (const ch of value) {
    const code = ch.codePointAt(0);

    if (code === undefined) {
      continue;
    }

    // Printable ASCII except letters, digits, hyphen, underscore
    if (
      code >= 0x20 &&
      code <= 0x7e &&
      !isAlphaNumeric(code) &&
      ch !== '-' &&
      ch !== '_'
    ) {
      result += `\\${ch}`;
    } else if (code < 0x20 || (code > 0x7e && code < 0x100)) {
      result += `\\${code.toString(16).padStart(2, '0')} `;
    } else if (code >= 0x100) {
      result += `\\${code.toString(16).padStart(6, '0')} `;
    } else {
      result += ch;
    }
  }

  return result;
}

function isAlphaNumeric(code: number): boolean {
  return (
    (code >= 0x30 && code <= 0x39) || // 0-9
    (code >= 0x41 && code <= 0x5a) || // A-Z
    (code >= 0x61 && code <= 0x7a)    // a-z
  );
}
