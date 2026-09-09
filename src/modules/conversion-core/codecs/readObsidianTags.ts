export function readObsidianTags(value: unknown): string[] {
  if (typeof value === 'string') {
    return value
      .split(/[\s,]+/)
      .filter((tag) => tag.length > 0)
      .map((tag) => tag.replace(/^#/, ''));
  }
  if (Array.isArray(value)) {
    const stringTags = value.filter(
      (tag): tag is string => typeof tag === 'string',
    );
    return stringTags.map((tag) => tag.replace(/^#/, ''));
  }
  return [];
}
