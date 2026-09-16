import { FeatureCase } from '@/modules/conversion-core/syntax/tiddlywiki/__tests__/features/FeatureCase';

export const nativeCases: FeatureCase[] = [
  { id: 'TW-TABLE-HEADER', source: '|!A|!B|\n|one|two|' },
  { id: 'TW-TABLE-ALIGN', source: '|!Left | !Center | !Right|\n|a | b | c|' },
  { id: 'TW-TABLE-DELIMITERS', source: '|!Link|!Code|\n|[[a|A]]|`x|y`|' },
];
