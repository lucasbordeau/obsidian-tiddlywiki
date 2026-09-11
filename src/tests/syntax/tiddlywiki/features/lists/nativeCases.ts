import { FeatureCase } from '../FeatureCase';

export const nativeCases: FeatureCase[] = [
  {
    id: 'TW-LIST-UNORDERED',
    source: '* first\n** second\n*** third\n** fourth\n* fifth',
  },
  {
    id: 'TW-LIST-ORDERED',
    source: '# first\n## second\n### third\n## fourth\n# fifth',
  },
  {
    id: 'TW-LIST-MIXED',
    source: '* first\n*# second\n*#* third\n*## fourth\n* last',
  },
];
