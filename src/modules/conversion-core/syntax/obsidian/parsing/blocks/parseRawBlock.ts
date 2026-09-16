import { Token } from '@/modules/conversion-core/syntax/obsidian/types/Token';
import { ParseContext } from '@/modules/conversion-core/syntax/obsidian/types/ParseContext';
import { SourceRange } from '@/modules/conversion-core/model/SourceRange';
import { BlockNode } from '@/modules/conversion-core/model/blocks/BlockNode';
import { decodePreservedSource } from '@/modules/conversion-core/preservation/source/decodePreservedSource';
import { parseStaticHtmlInline } from '@/modules/conversion-core/syntax/obsidian/parsing/html/parseStaticHtmlInline';
import { collectInlineNodes } from '@/modules/conversion-core/syntax/obsidian/parsing/inlines/collectInlineNodes';

function removeStructuralIndent(value: string): string {
  const sourceLines = value.split('\n');
  const contentLines = sourceLines.filter((sourceLine) => sourceLine.trim());
  let sharedIndent = /^\s*/.exec(contentLines[0] ?? '')?.[0] ?? '';

  for (const contentLine of contentLines.slice(1)) {
    while (sharedIndent && !contentLine.startsWith(sharedIndent)) {
      sharedIndent = sharedIndent.slice(0, -1);
    }
  }

  if (!sharedIndent) {
    return value;
  }

  return sourceLines
    .map((sourceLine) =>
      sourceLine.startsWith(sharedIndent)
        ? sourceLine.slice(sharedIndent.length)
        : sourceLine,
    )
    .join('\n');
}

export function parseRawBlock(
  token: Token,
  context: ParseContext,
  range?: SourceRange,
): BlockNode {
  const useOriginalSource = range !== undefined && token.level === 0;

  const tokenContent =
    token.level > 0 ? removeStructuralIndent(token.content) : token.content;

  const value = useOriginalSource
    ? context.source.slice(range.start, range.end).replace(/\r?\n$/, '')
    : tokenContent.replace(/\n$/, '');

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

    context.obsidianParser.inline.parse(
      value,
      context.obsidianParser,
      context.parserEnvironment,
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
