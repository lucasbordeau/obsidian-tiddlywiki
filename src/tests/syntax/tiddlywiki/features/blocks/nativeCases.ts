import { FeatureCase } from '@/tests/syntax/tiddlywiki/features/FeatureCase';

export const nativeCases: FeatureCase[] = [
  {
    id: 'TW-PARAGRAPH',
    source: 'First line\nsecond line\n\nSecond paragraph.',
  },
  {
    id: 'TW-HEADING',
    source: '!One\n!!Two\n!!!Three\n!!!!Four\n!!!!!Five\n!!!!!!Six',
  },
  { id: 'TW-HR', source: '---\n\n----\n\n-----' },
  { id: 'TW-DASH', source: 'en -- dash, em --- dash, four ---- dashes' },
  { id: 'TW-QUOTE-FENCE', source: '<<<\nfirst\n\nsecond\n<<<' },
  { id: 'TW-QUOTE-NESTED', source: '<<<\nouter\n\n<<<<\ninner\n<<<<\n<<<' },
  { id: 'TW-QUOTE-CODE', source: '<<<\n```text\n<<<\n[[literal]]\n```\n<<<' },
  { id: 'TW-QUOTE-LINES', source: '> first\n>> nested\n> last' },
  {
    id: 'TW-QUOTE-IN-PARAGRAPH',
    source: 'Before:\n<<<\n[[display|Quoted link]]\n<<<',
  },
  { id: 'TW-UNMATCHED-MACRO-LITERAL', source: 'Literal <<name and more text.' },
  {
    id: 'TW-PRAGMA-BODY-LITERAL',
    source: "Body first.\n\n\\rules only html\n\n''still strong''",
  },
];
