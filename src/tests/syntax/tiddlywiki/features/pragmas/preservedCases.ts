import { FeatureCase } from '../FeatureCase';

export const preservedCases: FeatureCase[] = [
  {
    id: 'TW-PRAGMA-RULES',
    source: "\\rules only html\n\n[[literal]]\n\n''literal''",
  },
  { id: 'TW-PRAGMA-IMPORT', source: '\\import [tag[Library]]\n\n<<provided>>' },
  {
    id: 'TW-PRAGMA-PARAMETERS',
    source: '\\parameters (name:"Default")\n\n<<name>>',
  },
  { id: 'TW-PRAGMA-WHITESPACE', source: '\\whitespace trim\n\nspaces   here' },
  {
    id: 'TW-PRAGMA-LEADING-COMMENT',
    source: "<!-- comment before rules -->\n\\rules only html\n\n''literal''",
  },
  {
    id: 'TW-PRAGMA-PARSERMODE',
    source: '\\parsermode inline\n!literal heading',
  },
];
