import MarkdownIt from 'markdown-it';

const markdownUtilities = new MarkdownIt().utils;

export function decodeHtml(value: string): string {
  return markdownUtilities.unescapeAll(value.replace(/\\/g, '\\\\'));
}
