import { FeatureCase } from '@/tests/syntax/tiddlywiki/features/FeatureCase';

export const preservedCases: FeatureCase[] = [
  { id: 'TW-EMBED-FIELD', source: '{{MyTiddler!!field}}' },
  { id: 'TW-EMBED-CURRENT-FIELD', source: '{{!!field}}' },
  { id: 'TW-EMBED-INDEX', source: '{{MyTiddler##index}}' },
  { id: 'TW-EMBED-CURRENT-INDEX', source: '{{##index}}' },
  { id: 'TW-EMBED-TEMPLATE', source: '{{MyTiddler||Template}}' },
  { id: 'TW-EMBED-CURRENT-TEMPLATE', source: '{{||Template}}' },
  { id: 'TW-EMBED-PARAMETER', source: '{{MyTiddler|one}}' },
  {
    id: 'TW-EMBED-TEMPLATE-PARAMETERS',
    source: '{{MyTiddler||Template|one|two}}',
  },
  {
    id: 'TW-TRANSCLUDE-WIDGET-FIELD',
    source: '<$transclude $tiddler="MyTiddler" $field="caption"/>',
  },
  {
    id: 'TW-TRANSCLUDE-WIDGET-DYNAMIC',
    source: '<$transclude $tiddler=<<target>>/>',
  },
  {
    id: 'TW-FILTERED-TRANSCLUSION',
    source: '{{{ [tag[Example]sort[title]] }}}',
  },
  { id: 'TW-FILTERED-TEMPLATE', source: '{{{ [tag[Example]]||Template }}}' },
  { id: 'TW-MVV', source: '((values))' },
  { id: 'TW-MVV-SEPARATOR', source: '((values||:))' },
  { id: 'TW-INLINE-FILTER', source: '((( [tag[Example]sort[]] )))' },
  { id: 'TW-INLINE-FILTER-SEPARATOR', source: '((( [tag[Example]] ||: )))' },
];
