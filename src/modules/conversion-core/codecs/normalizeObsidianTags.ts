export function normalizeObsidianTags(tags: string[]): Record<string, string> {
  const originalByNormalized: Record<string, string> = Object.create(null);
  const usedNames = new Set<string>();
  const invalidCharacters = new RegExp(
    '[^\\p{L}\\p{N}\\p{M}\\p{S}\\u200D_/-]',
    'gu',
  );
  const numericCharacters = new RegExp('^\\p{N}+$', 'u');
  for (const tag of tags) {
    const normalized = tag
      .normalize('NFC')
      .replace(/\s+/g, '_')
      .replace(invalidCharacters, '_');
    const base =
      normalized === '' || numericCharacters.test(normalized)
        ? `tag_${normalized}`
        : normalized;
    let candidate = base;
    let suffix = 2;
    while (usedNames.has(candidate.toLocaleLowerCase('en'))) {
      candidate = `${base}_${suffix++}`;
    }
    usedNames.add(candidate.toLocaleLowerCase('en'));
    originalByNormalized[candidate] = tag;
  }
  return originalByNormalized;
}
