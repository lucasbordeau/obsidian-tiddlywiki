export const mathAndFootnoteSources = [
  '$x_1 + \\frac{a}{b} = [[literal]]$',
  '$$\n\\begin{aligned}\na & = b \\\\\nc & = \\frac{1}{2}\n\\end{aligned}\n$$',
  '$$x^2 + y^2$$',
  'Claim[^long-id] and another[^long-id].\n\n[^long-id]: **bold** ![[a.png|100]]\n  continuation with `code`\n\n  second paragraph',
] as const;
