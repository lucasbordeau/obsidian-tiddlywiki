import { escapeHtml } from '../escaping/escapeHtml';
import { longestRun } from './longestRun';

export function codeSpan(value: string): string {
  if (value.includes('\n')) {
    return `<code>${escapeHtml(value).replace(/\n/g, '&#10;')}</code>`;
  }

  const marker = '`'.repeat(longestRun(value, '`') + 1);
  const hasEdgeBacktick = value.startsWith('`') || value.endsWith('`');

  const hasSpacesAtBothEdges =
    value.startsWith(' ') && value.endsWith(' ') && /[^ ]/.test(value);

  const padding = hasEdgeBacktick || hasSpacesAtBothEdges ? ' ' : '';

  return `${marker}${padding}${value}${padding}${marker}`;
}
