import { FeatureCase } from '@/modules/conversion-core/syntax/tiddlywiki/__tests__/features/FeatureCase';
import { widgetNames } from '@/modules/conversion-core/syntax/tiddlywiki/__tests__/features/widgets/widgetNames';

export const preservedCases: FeatureCase[] = [];

for (const widgetName of widgetNames) {
  preservedCases.push({
    id: 'TW-WIDGET-' + widgetName,
    source:
      '<$' +
      widgetName +
      ' value={{Current!!field}} caption="Literal > attribute">' +
      "\n\n''retained nested template'' <$text text=\"[[literal]]\"/>\n\n</$" +
      widgetName +
      '>',
  });
}
