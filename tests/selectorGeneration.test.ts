import { describe, expect, it } from 'vitest';

import { generateSelector, escapeSelectorValue } from '../src/shared/selectorGeneration';

describe('selector generation priority', () => {
  it('prefers data-testid over id', () => {
    const result = generateSelector({
      tag: 'button',
      id: 'my-button',
      'data-testid': 'submit-btn'
    });

    expect(result.selector).toBe('[data-testid="submit-btn"]');
    expect(result.confidence).toBe('high');
  });

  it('prefers data-test over id', () => {
    const result = generateSelector({
      tag: 'button',
      id: 'my-button',
      'data-test': 'submit-btn'
    });

    expect(result.selector).toBe('[data-test="submit-btn"]');
    expect(result.confidence).toBe('high');
  });

  it('prefers data-qa over id', () => {
    const result = generateSelector({
      tag: 'button',
      id: 'my-button',
      'data-qa': 'submit-btn'
    });

    expect(result.selector).toBe('[data-qa="submit-btn"]');
    expect(result.confidence).toBe('high');
  });

  it('uses id when no data attributes exist', () => {
    const result = generateSelector({
      tag: 'button',
      id: 'my-button'
    });

    expect(result.selector).toBe('#my-button');
    expect(result.confidence).toBe('high');
  });

  it('uses name when no data attributes or id exist', () => {
    const result = generateSelector({
      tag: 'input',
      name: 'username'
    });

    expect(result.selector).toBe('input[name="username"]');
    expect(result.confidence).toBe('medium');
  });

  it('uses aria-label when no data attributes, id, or name exist', () => {
    const result = generateSelector({
      tag: 'button',
      'aria-label': 'Close dialog'
    });

    expect(result.selector).toContain('button');
    expect(result.selector).toContain('aria-label');
    expect(result.confidence).toBe('medium');
  });

  it('uses CSS class fallback when no better attributes exist', () => {
    const result = generateSelector({
      tag: 'div',
      classes: 'card highlight'
    });

    expect(result.selector).toBe('div.card.highlight');
    expect(result.confidence).toBe('low');
  });

  it('filters underscore-prefixed classes', () => {
    const result = generateSelector({
      tag: 'div',
      classes: '_internal card _private'
    });

    expect(result.selector).toBe('div.card');
    expect(result.confidence).toBe('low');
  });

  it('limits classes to 2', () => {
    const result = generateSelector({
      tag: 'div',
      classes: 'a b c d'
    });

    expect(result.selector).toBe('div.a.b');
    expect(result.confidence).toBe('low');
  });

  it('falls back to tag name when nothing else is available', () => {
    const result = generateSelector({
      tag: 'span'
    });

    expect(result.selector).toBe('span');
    expect(result.confidence).toBe('low');
  });

  it('falls back to * when no tag is provided', () => {
    const result = generateSelector({});

    expect(result.selector).toBe('*');
    expect(result.confidence).toBe('low');
  });

  it('ignores empty data attribute values', () => {
    const result = generateSelector({
      tag: 'button',
      id: 'my-button',
      'data-testid': '   '
    });

    expect(result.selector).toBe('#my-button');
    expect(result.confidence).toBe('high');
  });

  it('ignores empty id', () => {
    const result = generateSelector({
      tag: 'button',
      id: '   ',
      name: 'submit'
    });

    expect(result.selector).toBe('button[name="submit"]');
    expect(result.confidence).toBe('medium');
  });
});

describe('selector value escaping', () => {
  it('escapes double quotes in attribute values', () => {
    const result = generateSelector({
      tag: 'div',
      'data-testid': 'hello"world'
    });

    // The exact escaping depends on the implementation, but it should not contain raw quotes
    expect(result.selector).not.toContain('"hello"');
    expect(result.selector).toContain('data-testid');
  });

  it('escapes special CSS characters in id selectors', () => {
    const result = generateSelector({
      tag: 'div',
      id: 'my.id'
    });

    // Should escape the dot
    expect(result.selector).not.toBe('#my.id');
    expect(result.selector).toContain('#');
  });

  it('handles values with special characters safely', () => {
    const result = generateSelector({
      tag: 'input',
      name: 'user[name]'
    });

    // Should produce a valid selector
    expect(result.selector).toContain('input');
    expect(result.selector).toContain('name');
  });
});

describe('escapeSelectorValue', () => {
  it('returns empty string for empty input', () => {
    expect(escapeSelectorValue('')).toBe('');
  });

  it('returns empty string for non-string input', () => {
    expect(escapeSelectorValue(undefined as unknown as string)).toBe('');
  });

  it('preserves simple alphanumeric values', () => {
    const escaped = escapeSelectorValue('hello123');

    expect(escaped).toBe('hello123');
  });

  it('handles values starting with a digit', () => {
    const escaped = escapeSelectorValue('123abc');

    // Must escape the leading digit for CSS
    expect(escaped).not.toBe('123abc');
  });
});
