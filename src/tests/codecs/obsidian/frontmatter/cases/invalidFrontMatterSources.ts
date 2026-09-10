export const invalidFrontMatterSources = [
  ['---\ntags: [unclosed\n---\nBody', 'invalid-frontmatter'],
  ['---\na: 1\na: 2\n---\nBody', 'invalid-frontmatter'],
  ['---\n- not a mapping\n---\nBody', 'invalid-frontmatter-shape'],
  ['---\na: value\nBody', 'unclosed-frontmatter'],
  ['---\na: &cycle [*cycle]\n---\nBody', 'invalid-frontmatter'],
] as const;
