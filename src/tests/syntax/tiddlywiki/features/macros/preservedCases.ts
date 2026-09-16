import { FeatureCase } from '@/tests/syntax/tiddlywiki/features/FeatureCase';

export const preservedCases: FeatureCase[] = [
  { id: 'TW-CALL-VARIABLE', source: '<<currentTiddler>>' },
  { id: 'TW-CALL-POSITIONAL', source: '<<greet "a >> b" \'other\'>>' },
  { id: 'TW-CALL-NAMED', source: '<<greet first:"a >> b" second:"x|y">>' },
  {
    id: 'TW-CALL-TRIPLE-QUOTED',
    source: 'Before <<greet """a "quote" and >> literal""">> after.',
  },
  {
    id: 'TW-CALL-BRACKET-QUOTED',
    source: 'Before <<greet [[a >> literal]]>> after.',
  },
  {
    id: 'TW-MACRO-DEFINITION',
    source: '\\define greet(name) Hello $name$\n\n<<greet "World">>',
  },
  {
    id: 'TW-PROCEDURE',
    source:
      '\\procedure greet(name)\nHello <<name>>\n\\end\n\n<<greet "World">>',
  },
  {
    id: 'TW-FUNCTION',
    source: '\\function names() [tag[Example]get[caption]]\n\n<<names>>',
  },
  {
    id: 'TW-WIDGET-DEFINITION',
    source:
      '\\widget $custom(name)\nHello <<name>>\n\\end\n\n<$custom name="World"/>',
  },
];
