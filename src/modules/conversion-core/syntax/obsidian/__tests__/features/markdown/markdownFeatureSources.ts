export const markdownFeatureSources = [
  '# H1\n\n## H2\n\n### H3\n\n#### H4\n\n##### H5\n\n###### H6',
  'Heading\n=======\n\nSubheading\n----------',
  '**strong** __strong__ *italic* _italic_ ***both*** ~~strike~~ ==highlight==',
  '**bold with _inner italic_ and ==bright==** plus ~~*removed*~~',
  'First line  \nhard break\\\nsecond hard break\nsoft break\n\nNew paragraph.',
  '- list\n  + nested\n    * deep\n      3. numbered\n         7) second',
  '17. ordered\n\n    Second paragraph\n\n    > quotation\n\n18. final',
  '***\n\n- - -\n\n___',
  '| **Name** | `Code` |\n| :-- | --: |\n| [[Note\\|Alias]] | `a\\|b` |\n| ![[a.svg\\|80]] | $x$ |',
  '\\*literal\\* \\# heading \\[brackets\\] 1\\. literal &amp; &#x1F680; café',
  'Inline `**literal** [[link]]` and `` `inside` %% literal %% ``.',
] as const;
