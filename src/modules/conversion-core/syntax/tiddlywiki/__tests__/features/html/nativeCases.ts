import { FeatureCase } from '@/modules/conversion-core/syntax/tiddlywiki/__tests__/features/FeatureCase';

export const nativeCases: FeatureCase[] = [
  {
    id: 'TW-HTML-INLINE',
    source: '<u>under</u> <sup>up</sup> <sub>down</sub> <mark>high</mark>',
  },
  { id: 'TW-HTML-BREAK', source: 'first<br>second' },
  {
    id: 'TW-HTML-LINK',
    source:
      "<a href=\"https://example.org/?a=1&b=2\" title='A \"title\"'>''strong''</a>",
  },
  {
    id: 'TW-LINK-WIDGET',
    source: '<$link to="Folder/A" tooltip="Tooltip">\'\'strong\'\'</$link>',
  },
];
