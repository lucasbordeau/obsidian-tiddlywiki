import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';
import { TiddlyWikiInlineMatch } from '@/modules/conversion-core/syntax/tiddlywiki/types/TiddlyWikiInlineMatch';
import { TiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/TiddlyWikiParsingContext';

export function matchTiddlyWikiTransclusion(
  this: TiddlyWikiParsingContext,
  start: number,
  end: number,
  depth: number,
): TiddlyWikiInlineMatch | undefined {
  const tail = this.source.slice(start, end);

  if (tail.startsWith('{{')) {
    const final = this.findDelimitedEnd(start, end, '{{', '}}');
    const closed = this.source.slice(final - 2, final) === '}}';

    const sourceTarget = this.source.slice(
      start + 2,
      closed ? final - 2 : final,
    );

    const explicitTextField = /^(.*)!!text$/.exec(sourceTarget);
    const target = explicitTextField?.[1] ?? sourceTarget;

    const simpleReference =
      closed &&
      target.length > 0 &&
      !/[|{}#]/.test(target) &&
      !target.includes('!!') &&
      (sourceTarget === target || explicitTextField !== null);

    const node: InlineNode = simpleReference
      ? {
          type: 'embed',
          target,
          alt: '',
          kind: 'transclusion',
          range: { start, end: final },
        }
      : this.rawInline(
          start,
          final,
          'Field and template transclusions require a TiddlyWiki evaluation context.',
        );

    return { node, end: final };
  }

  return undefined;
}
