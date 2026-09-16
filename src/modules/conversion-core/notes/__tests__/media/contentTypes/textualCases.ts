export const textualCases = [
  { type: 'text/plain', text: '!Title\n**literal** //literal// <tag>\n' },
  {
    type: 'text/html',
    text: '<article title="Été"><b>Bold</b><!--comment--><script>window.x = 1</script></article>',
  },
  {
    type: 'text/css',
    text: '.example::before { content: "**text** //"; }\n/* comment */\n',
  },
  {
    type: 'application/javascript',
    text: 'const pattern = /a\\/b/g;\nconst text = "[[literal]]";\n',
  },
  {
    type: 'application/json',
    text: '{"title":"Not a tiddler container","list":[1,true,null],"literal":"**x**"}',
  },
  {
    type: 'application/x-tiddler-dictionary',
    text: 'key: value: with a colon\nother: [[literal]]\n',
  },
  { type: 'text/csv', text: 'name,note\n"Été","**literal**, //text//"\n' },
  {
    type: 'text/vnd.tiddlywiki-multiple',
    text: '+title: First\n\n!Body\n+title: Second\n\nOther',
  },
  { type: 'text/x-tiddlywiki', text: '{{{Classic literal}}}\n[[A|B]]\n' },
  {
    type: 'application/x-private-format',
    text: '\u0000custom\r\n! raw ** data\u0000',
  },
  {
    type: 'application/json; charset=utf-8',
    text: '{"encoding":"UTF-8","title":"日本"}\n',
  },
];
