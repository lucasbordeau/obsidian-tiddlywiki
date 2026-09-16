import { FeatureCase } from '@/tests/syntax/tiddlywiki/features/FeatureCase';

export const nativeCases: FeatureCase[] = [
  { id: 'TW-INLINE-CODE', source: "`literal '' __ // [[x]]`" },
  { id: 'TW-INLINE-DOUBLE-CODE', source: '``literal `single` backticks``' },
  {
    id: 'TW-CODE-LANGUAGE',
    source: '```javascript\nconst x = "\\n [[x]]";\n```',
  },
  { id: 'TW-CODE-EMPTY', source: '```\n\n```' },
  {
    id: 'TW-CODE-HIGHLIGHT-LANGUAGE',
    source: '```python\ndef f():\n    return "[[literal]]"\n```',
  },
  {
    id: 'TW-CODE-PLUGIN-LANGUAGE',
    source: '```mermaid\ngraph LR\n  A["[[literal]]"] --> B\n```',
  },
];
