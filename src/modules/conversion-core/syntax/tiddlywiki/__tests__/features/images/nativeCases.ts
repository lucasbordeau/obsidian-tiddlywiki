import { FeatureCase } from '@/modules/conversion-core/syntax/tiddlywiki/__tests__/features/FeatureCase';

export const nativeCases: FeatureCase[] = [
  { id: 'TW-IMAGE-PNG', source: '[img[assets/photo.png]]' },
  { id: 'TW-IMAGE-SVG', source: '[img[assets/diagram.svg]]' },
  { id: 'TW-IMAGE-JPEG', source: '[img[Photograph with spaces.jpg]]' },
  {
    id: 'TW-IMAGE-REMOTE',
    source: '[img[https://example.org/image.webp?x=1&y=2]]',
  },
  { id: 'TW-IMAGE-TOOLTIP', source: '[img[Tooltip é💡|assets/photo.png]]' },
  {
    id: 'TW-IMAGE-ALT',
    source: '[img alt="Alternative text"[assets/photo.png]]',
  },
  { id: 'TW-IMAGE-ALT-EMPTY', source: '[img alt=""[assets/photo.png]]' },
  {
    id: 'TW-IMAGE-ALT-TOOLTIP',
    source: '[img alt="Alternative text"[Different tooltip|assets/photo.png]]',
  },
  { id: 'TW-IMAGE-WIDTH', source: '[img width=200 [assets/photo.png]]' },
  {
    id: 'TW-IMAGE-PIXELS',
    source: '[img width=200px height=120px [assets/photo.png]]',
  },
  {
    id: 'TW-IMAGE-PERCENT',
    source: '[img width=50% height=12.5% [assets/photo.png]]',
  },
  {
    id: 'TW-IMAGE-ATTR-QUOTES',
    source:
      '[img alt="[literal] \'single\'" tooltip=\'"double"\'[assets/photo.png]]',
  },
  {
    id: 'TW-IMAGE-TOOLTIP-PRECEDENCE',
    source:
      '[img tooltip="Default tooltip"[Explicit tooltip|assets/photo.png]]',
  },
  {
    id: 'TW-IMAGE-TOOLTIP-EMPTY',
    source: '[img tooltip=""[assets/photo.png]]',
  },
  {
    id: 'TW-IMAGE-WIDGET',
    source:
      '<$image source="assets/photo.png" alt="Alt" tooltip="Title" width="100" height="50"/>',
  },
];
