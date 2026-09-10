import type { Token } from '../../types/parsing/Token';
import type { ParseContext } from '../../types/parsing/ParseContext';
import type { SourceRange } from '../../../../model/source/SourceRange';
import type { BlockNode } from '../../../../model/ast/blocks/BlockNode';
import { decodePreservedSource } from '../../../../preservation/source/encoding/decodePreservedSource';
import { parseStaticHtmlInline } from '../html/parseStaticHtmlInline';
import { collectInlineNodes } from '../inlines/collectInlineNodes';

export function parseRawBlock(
  token: Token,
  context: ParseContext,
  range?: SourceRange,
): BlockNode {
  const useOriginalSource = range !== undefined && token.level === 0;

  const value = useOriginalSource
    ? context.source.slice(range.start, range.end).replace(/\r?\n$/, '')
    : token.content.replace(/\n$/, '');

  const preserved = decodePreservedSource(value.trim());

  const staticInline =
    token.type === 'html_block' ? parseStaticHtmlInline(value) : undefined;

  const initialComment = /^<!--otw:v1:[\s\S]*?-->/.exec(value);

  const startsPreservation =
    token.type === 'html_block' &&
    initialComment !== null &&
    decodePreservedSource(initialComment[0]) !== undefined;

  if (preserved) {
    return { type: 'raw', ...preserved };
  } else if (staticInline) {
    return { type: 'paragraph', children: staticInline };
  } else if (startsPreservation) {
    const inlineTokens: Token[] = [];

    context.markdown.inline.parse(
      value,
      context.markdown,
      context.environment,
      inlineTokens,
    );

    return {
      type: 'paragraph',
      children: collectInlineNodes(inlineTokens, { position: 0 }),
    };
  } else {
    const htmlReason = /^\s*<iframe\b/i.test(value)
      ? 'Obsidian iframe embed'
      : 'HTML block';

    return {
      type: 'raw',
      value,
      dialect: 'obsidian',
      reason:
        token.type === 'otw_frontmatter'
          ? 'YAML front matter'
          : token.type === 'otw_comment_block'
            ? 'Obsidian comment'
            : htmlReason,
    };
  }
}
