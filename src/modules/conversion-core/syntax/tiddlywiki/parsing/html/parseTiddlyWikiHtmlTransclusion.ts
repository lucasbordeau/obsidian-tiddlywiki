import { InlineNode } from '@/modules/conversion-core/model/inlines/InlineNode';
import { TiddlyWikiHtmlState } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/html/TiddlyWikiHtmlState';
import { TiddlyWikiParsingContext } from '@/modules/conversion-core/syntax/tiddlywiki/parsing/context/TiddlyWikiParsingContext';

export function parseTiddlyWikiHtmlTransclusion(
  this: TiddlyWikiParsingContext,
  state: TiddlyWikiHtmlState,
): InlineNode | undefined {
  const { start, openEnd, attributes, range } = state;

  const selfClosing = /\/\s*>$/.test(this.source.slice(start, openEnd));

  const knownAttributes = Object.keys(attributes).every((name) =>
    ['$tiddler', 'tiddler', '$field', 'field'].includes(name),
  );

  const hasConflictingTargetAttributes =
    attributes.$tiddler !== undefined && attributes.tiddler !== undefined;

  const hasConflictingFieldAttributes =
    attributes.$field !== undefined && attributes.field !== undefined;

  const target = attributes.$tiddler ?? attributes.tiddler;
  const field = attributes.$field ?? attributes.field;

  const wholeTextTransclusion = field === undefined || field === 'text';

  const safeTarget =
    target !== undefined &&
    target.length > 0 &&
    !/[|{}#<>]/.test(target) &&
    !target.includes('!!');

  const unsupportedTransclusion =
    !selfClosing ||
    !knownAttributes ||
    hasConflictingTargetAttributes ||
    hasConflictingFieldAttributes ||
    !wholeTextTransclusion ||
    !safeTarget;

  if (unsupportedTransclusion) {
    return undefined;
  }

  return {
    type: 'embed',
    target,
    alt: '',
    kind: 'transclusion',
    range,
  };
}
