import { FeatureCase } from '@/modules/conversion-core/syntax/tiddlywiki/__tests__/features/FeatureCase';

export const preservedCases: FeatureCase[] = [
  {
    id: 'TW-STYLE-INLINE',
    source: "@@color:red;background-color:yellow;styled ''text''@@",
  },
  { id: 'TW-CLASS-INLINE', source: '@@.custom.other styled [[link]]@@' },
  { id: 'TW-STYLE-BLOCK', source: '@@color:red;\n* first\n\n* second\n@@' },
  { id: 'TW-CLASS-BLOCK', source: '@@.custom\n\n* first\n* second\n@@' },
  {
    id: 'TW-UTILITY-CLASS',
    source: '<div class="tc-table-of-contents">\n\ncontent\n\n</div>',
  },
];
