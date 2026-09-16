export const adversarialSources = [
  '',
  'é🙂\r\n!NoSpace\n\n** nested [[label|Folder/A]] and `**literal**`\n',
  '*** __ == ~~ \\[[escape]] & <u>__literal__</u> ![[diagram.svg|80x40]]',
  '<!-- [[ignored]] -->\n%% **ignored** %%\n<<macro "[[argument]]">>\n{{{ [tag[A]] }}}',
  '[display [nested]](https://example.org/a_(b)?q=%23 "title")\n[img width="80"[alt|photo.svg]]',
  '<$list filter="[tag[x]]"><$text text="a > b"/></$list>\n[[unclosed\n\r\n🙂',
  '\\rules only filteredtranscludeinline\n{{{ [all[]] }}}\n```',
  '[img tooltip="""[[literal]] and "quotes"""" width=`${width}$px` [photo.svg]]',
];
