export const compoundMarkdownSources = [
  '# Nested **bold _emphasis_**\n\n- one\n  1. mixed\n  2. next\n- final',
  '> [!note]+ A title\n> **Body**\n>\n> > Nested quote',
  '| A | B |\n| :--- | ---: |\n| `a\\|b` | [[target\\|label]] |',
  'Escaped \\*text\\*, \\[\\[literal\\]\\], 2 < 3, &amp;, snake_case and `a``b`.',
  '`````js\n```\n**literal**\n```\n`````',
  'Text $x_1 + y$ [^n].\n\n[^n]: definition\n\n    continued',
  '![[media/picture.png|300x200]] ![alt](picture.png "title") [**label**](https://example.com/a_(b) "title")',
] as const;
