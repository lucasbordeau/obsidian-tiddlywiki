export const nativeSourceSamples = [
  '!No space\n!! Two\n!!!!!! Six',
  "''outer //inner __under__//'' and ~~deleted~~ ^^upper^^ ,,lower,,",
  '[[label|Folder/Exact:Title_é]] [ext[relative|../file.html]] [ext[URL|https://example.org/a_(b)?x=1&y=2]]',
  "|!First|!Second|\n|[[literal ''label''|A]]|`code|pipe`|",
  "```text\n[[not a link]]\n''literal''\n!not a heading\n* not list\n```",
  '> first\n>> nested\n> final',
  '* one\n*# two\n*#* three\n*#*# four\n*#* five\n* six\n# seven',
] as const;
