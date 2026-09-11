import MarkdownIt from 'markdown-it';
import { isObsidianWebEmbed } from './isObsidianWebEmbed';
import { pushInlineToken } from './pushInlineToken';

export function parseWebEmbed(
  state: MarkdownIt.StateInline,
  silent: boolean,
): boolean {
  if (!state.src.startsWith('![', state.pos)) {
    return false;
  }

  const labelEnd = state.md.helpers.parseLinkLabel(state, state.pos + 1, false);

  if (labelEnd === -1 || state.src[labelEnd + 1] !== '(') {
    return false;
  }

  let position = labelEnd + 2;

  while (/\s/.test(state.src[position] ?? '') && position < state.posMax) {
    position++;
  }

  const destination = state.md.helpers.parseLinkDestination(
    state.src,
    position,
    state.posMax,
  );

  if (!destination.ok || !isObsidianWebEmbed(destination.str)) {
    return false;
  }

  position = destination.pos;

  const startsWhitespace = /\s/.test(state.src[position] ?? '');

  while (/\s/.test(state.src[position] ?? '') && position < state.posMax) {
    position++;
  }

  const title = state.md.helpers.parseLinkTitle(
    state.src,
    position,
    state.posMax,
  );

  if (startsWhitespace && title.ok) {
    position = title.pos;

    while (/\s/.test(state.src[position] ?? '') && position < state.posMax) {
      position++;
    }
  }

  if (state.src[position] !== ')') {
    return false;
  }

  const originalEmbed = state.src.slice(state.pos, position + 1);

  return pushInlineToken(
    state,
    'otw_web_embed',
    originalEmbed,
    position + 1,
    silent,
  );
}
