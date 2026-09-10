import { FeatureCase } from '../../types/FeatureCase';
import { widgetNames } from './widgetNames';

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
