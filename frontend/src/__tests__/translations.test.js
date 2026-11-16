import { describe, it, expect } from 'vitest';
import { translations, DEFAULT_LANGUAGE } from '../i18n/translations';

// Collects every leaf key path of a nested translation object.
function collectKeys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return value && typeof value === 'object' && !Array.isArray(value) ? collectKeys(value, path) : [path];
  });
}

describe('translations', () => {
  it('defaults to French', () => {
    expect(DEFAULT_LANGUAGE).toBe('fr');
  });

  it('has identical key sets for French and English', () => {
    const frKeys = collectKeys(translations.fr).sort();
    const enKeys = collectKeys(translations.en).sort();
    expect(frKeys).toEqual(enKeys);
  });
});
