import { FeatureCase } from '../FeatureCase';

export const nativeCases: FeatureCase[] = [
  { id: 'TW-TABLE-HEADER', source: '|!A|!B|\n|one|two|' },
  { id: 'TW-TABLE-ALIGN', source: '|!Left | !Center | !Right|\n|a | b | c|' },
  { id: 'TW-TABLE-DELIMITERS', source: '|!Link|!Code|\n|[[a|A]]|`x|y`|' },
];
