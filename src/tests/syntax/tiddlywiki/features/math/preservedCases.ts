import { FeatureCase } from '../FeatureCase';

export const preservedCases: FeatureCase[] = [
  {
    id: 'TW-KATEX-WIDGET',
    source: '<$latex text="\\frac{x^2}{y}" displayMode="true"/>',
  },
  { id: 'TW-KATEX-ALIAS', source: '<$katex text="\\ce{CO2 + C -> 2 CO}"/>' },
  {
    id: 'TW-CODE-DYNAMIC-WIDGET',
    source: '<$codeblock code={{Snippet!!text}} language="text/javascript"/>',
  },
];
