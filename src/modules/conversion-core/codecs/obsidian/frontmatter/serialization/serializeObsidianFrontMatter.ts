import { stringify } from 'yaml';

export function serializeObsidianFrontMatter(
  properties: Record<string, unknown>,
  body: string,
): string {
  if (Object.keys(properties).length === 0) {
    return body;
  }

  return `---\n${stringify(properties, { lineWidth: 0 })}---\n${body}`;
}
