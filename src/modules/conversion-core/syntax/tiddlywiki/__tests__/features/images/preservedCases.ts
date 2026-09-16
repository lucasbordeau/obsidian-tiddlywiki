import { FeatureCase } from '@/modules/conversion-core/syntax/tiddlywiki/__tests__/features/FeatureCase';

export const preservedCases: FeatureCase[] = [
  {
    id: 'TW-IMAGE-CLASS',
    source: '[img class="responsive" width=100 [assets/photo.png]]',
  },
  {
    id: 'TW-IMAGE-LOADING',
    source: '[img loading="lazy"[https://example.org/a.png]]',
  },
  {
    id: 'TW-IMAGE-USEMAP',
    source: '[img usemap="#diagram"[assets/diagram.png]]',
  },
  {
    id: 'TW-IMAGE-ACTIONS',
    source: '[img loadActions=<<onload>>[assets/photo.png]]',
  },
  {
    id: 'TW-IMAGE-INDIRECT',
    source: '[img width={{!!width}} [assets/photo.png]]',
  },
  {
    id: 'TW-IMAGE-FILTERED',
    source: '[img width={{{ [<size>multiply[2]] }}} [assets/photo.png]]',
  },
  {
    id: 'TW-IMAGE-VARIABLE',
    source: '[img class=<<classes>> [assets/photo.png]]',
  },
  {
    id: 'TW-IMAGE-SUBSTITUTED',
    source: '[img width=`${width}$px` [assets/photo.png]]',
  },
  {
    id: 'TW-IMAGE-RESPONSIVE',
    source:
      '<picture><source media="(min-width:800px)" srcset="large.png"><img src="small.png" alt="scene"></picture>',
  },
];
