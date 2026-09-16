export const pluginFenceBodies = [
  [
    'mermaid',
    'flowchart LR\n  A["[[Note]] **literal**"] --> B["PDF | image"]\n  class A internal-link;',
  ],
  [
    'query',
    'path:"Projects/été" (tag:#research OR file:.pdf) -content:"[[literal]]"',
  ],
  [
    'base',
    'filters:\n  and:\n    - file.ext == "pdf"\nformulas:\n  label: \'"[[" + file.name + "]]"\'\nviews:\n  - type: table\n    name: Documents',
  ],
  [
    'dataview',
    'TABLE file.link, "**literal**"\nFROM "Research"\nWHERE contains(file.tags, "#pdf")',
  ],
  [
    'javascript',
    'const source = "[[Note]] **bold** ![[photo.png]]";\n/* @@text@@ */',
  ],
  ['text', '```\n~~~\n| a | b |\n$$ x $$\n<$list filter="[all[tiddlers]]"/>\n'],
] as const;
