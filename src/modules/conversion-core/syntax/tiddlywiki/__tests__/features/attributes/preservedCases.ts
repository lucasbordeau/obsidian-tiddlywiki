import { FeatureCase } from '@/modules/conversion-core/syntax/tiddlywiki/__tests__/features/FeatureCase';

export const preservedCases: FeatureCase[] = [
  {
    id: 'TW-ATTR-TRANSCLUDED',
    source: '<div title={{SomeTiddler!!caption}}>content</div>',
  },
  {
    id: 'TW-ATTR-FILTERED',
    source: '<div class={{{ [tag[Example]join[ ]] }}}>content</div>',
  },
  { id: 'TW-ATTR-VARIABLE', source: '<div class=<<classes>>>content</div>' },
  {
    id: 'TW-ATTR-SUBSTITUTED',
    source: '<div title=`Prefix ${variable}$`>content</div>',
  },
  { id: 'TW-ATTR-MVV', source: '<div title=((values))>content</div>' },
];
