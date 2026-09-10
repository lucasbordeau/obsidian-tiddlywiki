import type { InlineNode } from '../../../../../model/ast/inlines/InlineNode';
import type { TiddlyWikiInlineMatch } from '../../../types/TiddlyWikiInlineMatch';
import type { TiddlyWikiParsingContext } from '../../context/types/TiddlyWikiParsingContext';

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
    const target = this.source.slice(start + 2, closed ? final - 2 : final);

    const simpleReference =
      closed &&
      target.length > 0 &&
      !/[|!{}]/.test(target) &&
      !target.includes('##');

    const node: InlineNode = simpleReference
      ? {
          type: 'embed',
          target,
          alt: '',
          kind: 'note',
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
