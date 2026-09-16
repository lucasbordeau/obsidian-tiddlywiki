import { FeatureCase } from '@/modules/conversion-core/syntax/tiddlywiki/__tests__/features/FeatureCase';

export const preservedCases: FeatureCase[] = [
  { id: 'TW-TABLE-HEADER-SUFFIX', source: '|A|B|h\n|one|two|' },
  { id: 'TW-TABLE-CAPTION', source: '|A caption|c\n|!A|!B|\n|one|two|' },
  { id: 'TW-TABLE-CLASS', source: '|custom another|k\n|!A|!B|\n|one|two|' },
  { id: 'TW-TABLE-FOOTER', source: '|!A|!B|\n|one|two|\n|foot|er|f' },
  { id: 'TW-TABLE-ROWSPAN', source: '|!A|!B|\n|one|two|\n|~|three|' },
  { id: 'TW-TABLE-COLSPAN-LEFT', source: '|!A|!B|\n|one|<|' },
  { id: 'TW-TABLE-COLSPAN-RIGHT', source: '|!A|!B|\n|>|two|' },
  { id: 'TW-TABLE-VERTICAL', source: '|!A|!B|\n|^top|,bottom|' },
  { id: 'TW-TABLE-NO-HEADER', source: '|one|two|\n|three|four|' },
  { id: 'TW-TABLE-PER-CELL', source: '|!A|!B|\n|one | two|' },
  { id: 'TW-TABLE-RAGGED', source: '|!A|!B|\n|one|' },
];
