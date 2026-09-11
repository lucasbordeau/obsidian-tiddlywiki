import { escapeHtml } from './escaping/escapeHtml';
import { getLongestDelimiterRun } from './getLongestDelimiterRun';

export function serializeCodeSpan(value: string): string {
  if (value.includes('\n')) {
    return `<code>${escapeHtml(value).replace(/\n/g, '&#10;')}</code>`;
  }

  const marker = '`'.repeat(getLongestDelimiterRun(value, '`') + 1);
  const hasEdgeBacktick = value.startsWith('`') || value.endsWith('`');

  const hasSpacesAtBothEdges =
    value.startsWith(' ') && value.endsWith(' ') && /[^ ]/.test(value);

  const padding = hasEdgeBacktick || hasSpacesAtBothEdges ? ' ' : '';

  return `${marker}${padding}${value}${padding}${marker}`;
}
