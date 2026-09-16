export const markdownImageDimensions = [
  ['![Diagram|100](image.png)', 'Diagram', '100', undefined],
  ['![Diagram|100x200](image.png)', 'Diagram', '100', '200'],
  ['![250](image.png)', '', '250', undefined],
  [
    '![**Bold** and _italic_|100x200](image.png)',
    'Bold and italic',
    '100',
    '200',
  ],
  ['![literal\\|100](image.png)', 'literal|100', undefined, undefined],
  ['![prefix|literal|100](image.png)', 'prefix|literal', '100', undefined],
] as const;
