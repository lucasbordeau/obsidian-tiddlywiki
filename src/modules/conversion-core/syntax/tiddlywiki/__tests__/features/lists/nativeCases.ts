import { FeatureCase } from '@/modules/conversion-core/syntax/tiddlywiki/__tests__/features/FeatureCase';

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
