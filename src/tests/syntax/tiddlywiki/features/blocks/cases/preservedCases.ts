import { FeatureCase } from '../../types/FeatureCase';

export const preservedCases: FeatureCase[] = [
  { id: 'TW-QUOTE-CITATION', source: '<<<\nquotation\n<<< Author' },
  { id: 'TW-QUOTE-CLASS', source: '<<<.large\nquotation\n<<<' },
  { id: 'TW-HEADING-CLASS', source: '!!.custom Heading' },
  {
    id: 'TW-DESCRIPTION',
    source: ';term\n:definition\n:;nested term\n::nested definition',
  },
  { id: 'TW-LIST-CLASS', source: '* parent\n**.custom child' },
  { id: 'TW-LIST-QUOTE', source: '* parent\n**> quoted child' },
];
