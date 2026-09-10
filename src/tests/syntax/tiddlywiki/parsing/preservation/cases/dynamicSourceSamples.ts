export const dynamicSourceSamples = [
  '<$list filter="[tag[Test]]"><$text text="[[literal]]"/><$list filter="[all[]]">nested</$list></$list>',
  '<<macro first:"a >> b" second:\'c >> d\'>>',
  '{{{ [tag[Test]sort[title]] ||Template}}}',
  '{{Some tiddler!!field}}',
  '@@.custom color:red;[[text|link]]@@',
  '|caption|c\n|!header|\n|body|',
] as const;
