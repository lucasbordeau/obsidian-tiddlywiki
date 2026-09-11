import { FeatureCase } from '../FeatureCase';

export const nativeCases: FeatureCase[] = [
  { id: 'TW-STRONG', source: "''strong''" },
  { id: 'TW-EMPHASIS', source: '//emphasis//' },
  { id: 'TW-UNDERLINE', source: '__underline__' },
  { id: 'TW-STRIKE', source: '~~strike~~' },
  { id: 'TW-SUP', source: 'x^^2^^' },
  { id: 'TW-SUB', source: 'H,,2,,O' },
  { id: 'TW-HIGHLIGHT', source: '@@highlighted text@@' },
  { id: 'TW-HARD-BREAKS', source: '"""\nfirst\nsecond \'\'strong\'\'\n"""' },
  { id: 'TW-HARD-BREAKS-BLANK', source: '"""\nfirst\n\nthird\n"""' },
  { id: 'TW-HARD-BREAKS-INLINE', source: 'before """one\ntwo""" after' },
  {
    id: 'TW-ENTITIES',
    source: '&copy; &eacute; &Auml; &trade; &NoBreak; &#128161; &#x1F642;',
  },
  {
    id: 'TW-ENTITIES-MARKERS',
    source:
      '&#39;&#39; &#95;&#95; &#47;&#47; &lt;script&gt; &#91;&#91;x&#93;&#93;',
  },
];
