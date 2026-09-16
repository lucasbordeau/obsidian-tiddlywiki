import { FeatureCase } from '@/modules/conversion-core/syntax/tiddlywiki/__tests__/features/FeatureCase';

export const preservedCases: FeatureCase[] = [
  {
    id: 'TW-TYPED-JS',
    source: "$$$.js\nconst x = \"[[literal]] ''literal''\";\n$$$",
  },
  {
    id: 'TW-TYPED-SVG',
    source:
      '$$$image/svg+xml\n<svg xmlns="http://www.w3.org/2000/svg"><text>[[literal]]</text></svg>\n$$$',
  },
  {
    id: 'TW-TYPED-UNKNOWN',
    source: '$$$text/unknown\n[[literal]] //literal//\n$$$',
  },
  { id: 'TW-TYPED-CSV', source: '$$$text/csv\na,b\n1,2\n$$$' },
  {
    id: 'TW-TYPED-RENDER',
    source: "$$$text/vnd.tiddlywiki>text/html\n''render as code''\n$$$",
  },
];
