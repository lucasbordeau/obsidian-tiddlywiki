export const markdownImageVariants = [
  [
    'remote alt and title',
    '![Visible **alt**](https://example.org/image_(a).svg?x=1&y=2 "Tooltip")',
    { alt: 'Visible alt', title: 'Tooltip' },
  ],
  [
    'reference image',
    '![Diagram][figure]\n\n[figure]: https://example.org/a.svg "Legend"',
    { alt: 'Diagram', title: 'Legend' },
  ],
  [
    'relative Markdown image',
    '![drawing](<assets/two words.png> "Study")',
    { alt: 'drawing', title: 'Study' },
  ],
  [
    'escaped alt delimiters',
    '![a \\[b\\] and \\*c\\*](https://example.org/a.png)',
    { alt: 'a [b] and *c*' },
  ],
  [
    'width and height',
    '![Diagram|300x120](https://example.org/a.svg "Legend")',
    { alt: 'Diagram', width: '300', height: '120', title: 'Legend' },
  ],
  [
    'width',
    '![Diagram|300](https://example.org/a.svg)',
    { alt: 'Diagram', width: '300' },
  ],
  [
    'numeric width',
    '![250](https://example.org/a.svg)',
    { alt: '', width: '250' },
  ],
] as const;
