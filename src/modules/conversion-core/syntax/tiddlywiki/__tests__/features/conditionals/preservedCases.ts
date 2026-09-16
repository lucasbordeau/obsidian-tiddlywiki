import { FeatureCase } from '@/modules/conversion-core/syntax/tiddlywiki/__tests__/features/FeatureCase';

export const preservedCases: FeatureCase[] = [
  { id: 'TW-CONDITIONAL', source: '<%if [tag[A]] %>yes<%else%>no<%endif%>' },
  {
    id: 'TW-CONDITIONAL-ELSEIF',
    source: '<%if [tag[A]] %>a<%elseif [tag[B]] %>b<%else%>c<%endif%>',
  },
  {
    id: 'TW-CONDITIONAL-NESTED',
    source:
      '<%if [tag[A]] %><%if [tag[B]] %>ab<%else%>a<%endif%><%else%>neither<%endif%>',
  },
  {
    id: 'TW-CONDITIONAL-BLOCK',
    source: '<%if [tag[A]] %>\n\n* yes\n\n<%else%>\n\n* no\n\n<%endif%>',
  },
];
