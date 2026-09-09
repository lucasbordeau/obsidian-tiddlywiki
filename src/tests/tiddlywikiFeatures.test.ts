import { convertText } from '../modules/conversion-core/convertText';
import { parseTiddlyWiki } from '../modules/conversion-core/tiddlywiki/parseTiddlyWiki';
import { serializeTiddlyWiki } from '../modules/conversion-core/tiddlywiki/serializeTiddlyWiki';
import { renderTiddlyWiki } from './utils/renderTiddlyWiki';
import { semanticBlocks } from './utils/semanticBlocks';

type FeatureCase = { id: string; source: string };

// IDs correspond to the official feature inventory in docs/development.
const nativeCases: FeatureCase[] = [
  {
    id: 'TW-PARAGRAPH',
    source: 'First line\nsecond line\n\nSecond paragraph.',
  },
  {
    id: 'TW-HEADING',
    source: '!One\n!!Two\n!!!Three\n!!!!Four\n!!!!!Five\n!!!!!!Six',
  },
  { id: 'TW-HR', source: '---\n\n----\n\n-----' },
  { id: 'TW-DASH', source: 'en -- dash, em --- dash, four ---- dashes' },
  { id: 'TW-STRONG', source: "''strong''" },
  { id: 'TW-EMPHASIS', source: '//emphasis//' },
  { id: 'TW-UNDERLINE', source: '__underline__' },
  { id: 'TW-STRIKE', source: '~~strike~~' },
  { id: 'TW-SUP', source: 'x^^2^^' },
  { id: 'TW-SUB', source: 'H,,2,,O' },
  { id: 'TW-HIGHLIGHT', source: '@@highlighted text@@' },
  { id: 'TW-HARD-BREAKS', source: '"""\nfirst\nsecond \'\'strong\'\'\n"""' },
  { id: 'TW-HARD-BREAKS-BLANK', source: '"""\nfirst\n\nthird\n"""' },
  { id: 'TW-HARD-BREAKS-INLINE', source: 'before """one\ntwo""" after' },
  { id: 'TW-INLINE-CODE', source: "`literal '' __ // [[x]]`" },
  { id: 'TW-INLINE-DOUBLE-CODE', source: '``literal `single` backticks``' },
  {
    id: 'TW-CODE-LANGUAGE',
    source: '```javascript\nconst x = "\\n [[x]]";\n```',
  },
  { id: 'TW-CODE-EMPTY', source: '```\n\n```' },
  {
    id: 'TW-CODE-HIGHLIGHT-LANGUAGE',
    source: '```python\ndef f():\n    return "[[literal]]"\n```',
  },
  {
    id: 'TW-CODE-PLUGIN-LANGUAGE',
    source: '```mermaid\ngraph LR\n  A["[[literal]]"] --> B\n```',
  },
  {
    id: 'TW-ENTITIES',
    source: '&copy; &eacute; &Auml; &trade; &NoBreak; &#128161; &#x1F642;',
  },
  {
    id: 'TW-ENTITIES-MARKERS',
    source:
      '&#39;&#39; &#95;&#95; &#47;&#47; &lt;script&gt; &#91;&#91;x&#93;&#93;',
  },
  { id: 'TW-LINK-EXACT', source: '[[a label|Folder/Case_Sensitive:é💡]]' },
  { id: 'TW-LINK-URL', source: '[[Web|https://example.org/a_(b)?x=1&y=two]]' },
  {
    id: 'TW-LINK-RELATIVE',
    source: '[ext[relative file|../images/photo.png]]',
  },
  {
    id: 'TW-LINK-EXT-WHITESPACE',
    source: '[ext[ label with spaces | https://example.org/path ]]',
  },
  { id: 'TW-LINK-FILE', source: '[[local|file:///tmp/notes/file.pdf]]' },
  { id: 'TW-LINK-EMAIL', source: '[[email|mailto:owner@example.org]]' },
  {
    id: 'TW-LINK-OBSIDIAN',
    source: '[[vault|obsidian://open?vault=Example&file=Note]]',
  },
  { id: 'TW-LINK-CUSTOM', source: '[ext[custom|custom-scheme:payload]]' },
  { id: 'TW-BARE-URL', source: 'https://example.org/path?x=1&y=two.' },
  { id: 'TW-BARE-EMAIL', source: 'mailto:owner@example.org' },
  { id: 'TW-BARE-FTP', source: 'ftp://example.org/pub/file.txt' },
  { id: 'TW-BARE-FILE', source: 'file:///tmp/file.txt' },
  { id: 'TW-SUPPRESSED-URL', source: '~https://example.org/path' },
  { id: 'TW-SUPPRESSED-EMAIL', source: '~mailto:owner@example.org' },
  { id: 'TW-SUPPRESSED-FTP', source: '~ftp://example.org/file.txt' },
  { id: 'TW-SUPPRESSED-FILE', source: '~file:///tmp/file.txt' },
  { id: 'TW-SUPPRESSED-DATA', source: '~data:text/plain,hello' },
  { id: 'TW-SUPPRESSED-CAMEL', source: '~HelloThere ~AnotherWikiLink' },
  { id: 'TW-SYSTEM-LINK', source: '$:/core/ui/PageTemplate' },
  { id: 'TW-SYSTEM-SUPPRESSED', source: '~$:/core/ui/PageTemplate' },
  {
    id: 'TW-LIST-UNORDERED',
    source: '* first\n** second\n*** third\n** fourth\n* fifth',
  },
  {
    id: 'TW-LIST-ORDERED',
    source: '# first\n## second\n### third\n## fourth\n# fifth',
  },
  {
    id: 'TW-LIST-MIXED',
    source: '* first\n*# second\n*#* third\n*## fourth\n* last',
  },
  { id: 'TW-QUOTE-FENCE', source: '<<<\nfirst\n\nsecond\n<<<' },
  { id: 'TW-QUOTE-NESTED', source: '<<<\nouter\n\n<<<<\ninner\n<<<<\n<<<' },
  { id: 'TW-QUOTE-CODE', source: '<<<\n```text\n<<<\n[[literal]]\n```\n<<<' },
  { id: 'TW-QUOTE-LINES', source: '> first\n>> nested\n> last' },
  {
    id: 'TW-QUOTE-IN-PARAGRAPH',
    source: 'Before:\n<<<\n[[display|Quoted link]]\n<<<',
  },
  { id: 'TW-UNMATCHED-MACRO-LITERAL', source: 'Literal <<name and more text.' },
  {
    id: 'TW-PRAGMA-BODY-LITERAL',
    source: "Body first.\n\n\\rules only html\n\n''still strong''",
  },
  { id: 'TW-TABLE-HEADER', source: '|!A|!B|\n|one|two|' },
  { id: 'TW-TABLE-ALIGN', source: '|!Left | !Center | !Right|\n|a | b | c|' },
  { id: 'TW-TABLE-DELIMITERS', source: '|!Link|!Code|\n|[[a|A]]|`x|y`|' },
  { id: 'TW-IMAGE-PNG', source: '[img[assets/photo.png]]' },
  { id: 'TW-IMAGE-SVG', source: '[img[assets/diagram.svg]]' },
  { id: 'TW-IMAGE-JPEG', source: '[img[Photograph with spaces.jpg]]' },
  {
    id: 'TW-IMAGE-REMOTE',
    source: '[img[https://example.org/image.webp?x=1&y=2]]',
  },
  { id: 'TW-IMAGE-TOOLTIP', source: '[img[Tooltip é💡|assets/photo.png]]' },
  {
    id: 'TW-IMAGE-ALT',
    source: '[img alt="Alternative text"[assets/photo.png]]',
  },
  { id: 'TW-IMAGE-ALT-EMPTY', source: '[img alt=""[assets/photo.png]]' },
  {
    id: 'TW-IMAGE-ALT-TOOLTIP',
    source: '[img alt="Alternative text"[Different tooltip|assets/photo.png]]',
  },
  { id: 'TW-IMAGE-WIDTH', source: '[img width=200 [assets/photo.png]]' },
  {
    id: 'TW-IMAGE-PIXELS',
    source: '[img width=200px height=120px [assets/photo.png]]',
  },
  {
    id: 'TW-IMAGE-PERCENT',
    source: '[img width=50% height=12.5% [assets/photo.png]]',
  },
  {
    id: 'TW-IMAGE-ATTR-QUOTES',
    source:
      '[img alt="[literal] \'single\'" tooltip=\'"double"\'[assets/photo.png]]',
  },
  {
    id: 'TW-IMAGE-TOOLTIP-PRECEDENCE',
    source:
      '[img tooltip="Default tooltip"[Explicit tooltip|assets/photo.png]]',
  },
  {
    id: 'TW-IMAGE-TOOLTIP-EMPTY',
    source: '[img tooltip=""[assets/photo.png]]',
  },
  {
    id: 'TW-IMAGE-WIDGET',
    source:
      '<$image source="assets/photo.png" alt="Alt" tooltip="Title" width="100" height="50"/>',
  },
  { id: 'TW-NOTE-EMBED', source: '{{A complete note}}' },
  { id: 'TW-PDF-EMBED', source: '{{documents/report.pdf}}' },
  { id: 'TW-AUDIO-EMBED', source: '{{recordings/audio.mp3}}' },
  { id: 'TW-VIDEO-EMBED', source: '{{recordings/video.mp4}}' },
  {
    id: 'TW-HTML-INLINE',
    source: '<u>under</u> <sup>up</sup> <sub>down</sub> <mark>high</mark>',
  },
  { id: 'TW-HTML-BREAK', source: 'first<br>second' },
  {
    id: 'TW-HTML-LINK',
    source:
      "<a href=\"https://example.org/?a=1&b=2\" title='A \"title\"'>''strong''</a>",
  },
  {
    id: 'TW-LINK-WIDGET',
    source: '<$link to="Folder/A" tooltip="Tooltip">\'\'strong\'\'</$link>',
  },
];

const preservedCases: FeatureCase[] = [
  { id: 'TW-TABLE-HEADER-SUFFIX', source: '|A|B|h\n|one|two|' },
  { id: 'TW-QUOTE-CITATION', source: '<<<\nquotation\n<<< Author' },
  { id: 'TW-QUOTE-CLASS', source: '<<<.large\nquotation\n<<<' },
  { id: 'TW-HEADING-CLASS', source: '!!.custom Heading' },
  {
    id: 'TW-DESCRIPTION',
    source: ';term\n:definition\n:;nested term\n::nested definition',
  },
  { id: 'TW-LIST-CLASS', source: '* parent\n**.custom child' },
  { id: 'TW-LIST-QUOTE', source: '* parent\n**> quoted child' },
  { id: 'TW-TABLE-CAPTION', source: '|A caption|c\n|!A|!B|\n|one|two|' },
  { id: 'TW-TABLE-CLASS', source: '|custom another|k\n|!A|!B|\n|one|two|' },
  { id: 'TW-TABLE-FOOTER', source: '|!A|!B|\n|one|two|\n|foot|er|f' },
  { id: 'TW-TABLE-ROWSPAN', source: '|!A|!B|\n|one|two|\n|~|three|' },
  { id: 'TW-TABLE-COLSPAN-LEFT', source: '|!A|!B|\n|one|<|' },
  { id: 'TW-TABLE-COLSPAN-RIGHT', source: '|!A|!B|\n|>|two|' },
  { id: 'TW-TABLE-VERTICAL', source: '|!A|!B|\n|^top|,bottom|' },
  { id: 'TW-TABLE-NO-HEADER', source: '|one|two|\n|three|four|' },
  { id: 'TW-TABLE-PER-CELL', source: '|!A|!B|\n|one | two|' },
  { id: 'TW-TABLE-RAGGED', source: '|!A|!B|\n|one|' },
  {
    id: 'TW-STYLE-INLINE',
    source: "@@color:red;background-color:yellow;styled ''text''@@",
  },
  { id: 'TW-CLASS-INLINE', source: '@@.custom.other styled [[link]]@@' },
  { id: 'TW-STYLE-BLOCK', source: '@@color:red;\n* first\n\n* second\n@@' },
  { id: 'TW-CLASS-BLOCK', source: '@@.custom\n\n* first\n* second\n@@' },
  {
    id: 'TW-UTILITY-CLASS',
    source: '<div class="tc-table-of-contents">\n\ncontent\n\n</div>',
  },
  {
    id: 'TW-IMAGE-CLASS',
    source: '[img class="responsive" width=100 [assets/photo.png]]',
  },
  {
    id: 'TW-IMAGE-LOADING',
    source: '[img loading="lazy"[https://example.org/a.png]]',
  },
  {
    id: 'TW-IMAGE-USEMAP',
    source: '[img usemap="#diagram"[assets/diagram.png]]',
  },
  {
    id: 'TW-IMAGE-ACTIONS',
    source: '[img loadActions=<<onload>>[assets/photo.png]]',
  },
  {
    id: 'TW-IMAGE-INDIRECT',
    source: '[img width={{!!width}} [assets/photo.png]]',
  },
  {
    id: 'TW-IMAGE-FILTERED',
    source: '[img width={{{ [<size>multiply[2]] }}} [assets/photo.png]]',
  },
  {
    id: 'TW-IMAGE-VARIABLE',
    source: '[img class=<<classes>> [assets/photo.png]]',
  },
  {
    id: 'TW-IMAGE-SUBSTITUTED',
    source: '[img width=`${width}$px` [assets/photo.png]]',
  },
  {
    id: 'TW-IMAGE-RESPONSIVE',
    source:
      '<picture><source media="(min-width:800px)" srcset="large.png"><img src="small.png" alt="scene"></picture>',
  },
  { id: 'TW-EMBED-FIELD', source: '{{MyTiddler!!field}}' },
  { id: 'TW-EMBED-CURRENT-FIELD', source: '{{!!field}}' },
  { id: 'TW-EMBED-INDEX', source: '{{MyTiddler##index}}' },
  { id: 'TW-EMBED-CURRENT-INDEX', source: '{{##index}}' },
  { id: 'TW-EMBED-TEMPLATE', source: '{{MyTiddler||Template}}' },
  { id: 'TW-EMBED-CURRENT-TEMPLATE', source: '{{||Template}}' },
  { id: 'TW-EMBED-PARAMETER', source: '{{MyTiddler|one}}' },
  {
    id: 'TW-EMBED-TEMPLATE-PARAMETERS',
    source: '{{MyTiddler||Template|one|two}}',
  },
  {
    id: 'TW-FILTERED-TRANSCLUSION',
    source: '{{{ [tag[Example]sort[title]] }}}',
  },
  { id: 'TW-FILTERED-TEMPLATE', source: '{{{ [tag[Example]]||Template }}}' },
  { id: 'TW-MVV', source: '((values))' },
  { id: 'TW-MVV-SEPARATOR', source: '((values||:))' },
  { id: 'TW-INLINE-FILTER', source: '((( [tag[Example]sort[]] )))' },
  { id: 'TW-INLINE-FILTER-SEPARATOR', source: '((( [tag[Example]] ||: )))' },
  { id: 'TW-CALL-VARIABLE', source: '<<currentTiddler>>' },
  { id: 'TW-CALL-POSITIONAL', source: '<<greet "a >> b" \'other\'>>' },
  { id: 'TW-CALL-NAMED', source: '<<greet first:"a >> b" second:"x|y">>' },
  {
    id: 'TW-CALL-TRIPLE-QUOTED',
    source: 'Before <<greet """a "quote" and >> literal""">> after.',
  },
  {
    id: 'TW-CALL-BRACKET-QUOTED',
    source: 'Before <<greet [[a >> literal]]>> after.',
  },
  {
    id: 'TW-MACRO-DEFINITION',
    source: '\\define greet(name) Hello $name$\n\n<<greet "World">>',
  },
  {
    id: 'TW-PROCEDURE',
    source:
      '\\procedure greet(name)\nHello <<name>>\n\\end\n\n<<greet "World">>',
  },
  {
    id: 'TW-FUNCTION',
    source: '\\function names() [tag[Example]get[caption]]\n\n<<names>>',
  },
  {
    id: 'TW-WIDGET-DEFINITION',
    source:
      '\\widget $custom(name)\nHello <<name>>\n\\end\n\n<$custom name="World"/>',
  },
  {
    id: 'TW-PRAGMA-RULES',
    source: "\\rules only html\n\n[[literal]]\n\n''literal''",
  },
  { id: 'TW-PRAGMA-IMPORT', source: '\\import [tag[Library]]\n\n<<provided>>' },
  {
    id: 'TW-PRAGMA-PARAMETERS',
    source: '\\parameters (name:"Default")\n\n<<name>>',
  },
  { id: 'TW-PRAGMA-WHITESPACE', source: '\\whitespace trim\n\nspaces   here' },
  {
    id: 'TW-PRAGMA-LEADING-COMMENT',
    source: "<!-- comment before rules -->\n\\rules only html\n\n''literal''",
  },
  {
    id: 'TW-PRAGMA-PARSERMODE',
    source: '\\parsermode inline\n!literal heading',
  },
  { id: 'TW-CONDITIONAL', source: '<%if [tag[A]] %>yes<%else%>no<%endif%>' },
  {
    id: 'TW-CONDITIONAL-ELSEIF',
    source: '<%if [tag[A]] %>a<%elseif [tag[B]] %>b<%else%>c<%endif%>',
  },
  {
    id: 'TW-CONDITIONAL-NESTED',
    source:
      '<%if [tag[A]] %><%if [tag[B]] %>ab<%else%>a<%endif%><%else%>neither<%endif%>',
  },
  {
    id: 'TW-CONDITIONAL-BLOCK',
    source: '<%if [tag[A]] %>\n\n* yes\n\n<%else%>\n\n* no\n\n<%endif%>',
  },
  {
    id: 'TW-TYPED-JS',
    source: "$$$.js\nconst x = \"[[literal]] ''literal''\";\n$$$",
  },
  {
    id: 'TW-TYPED-SVG',
    source:
      '$$$image/svg+xml\n<svg xmlns="http://www.w3.org/2000/svg"><text>[[literal]]</text></svg>\n$$$',
  },
  {
    id: 'TW-TYPED-UNKNOWN',
    source: '$$$text/unknown\n[[literal]] //literal//\n$$$',
  },
  { id: 'TW-TYPED-CSV', source: '$$$text/csv\na,b\n1,2\n$$$' },
  {
    id: 'TW-TYPED-RENDER',
    source: "$$$text/vnd.tiddlywiki>text/html\n''render as code''\n$$$",
  },
  {
    id: 'TW-COMMENT-HTML',
    source: '<!-- <script>literal</script> [[comment]] -->',
  },
  { id: 'TW-COMMENT-WIKI', source: "/% ''hidden'' [[hidden]] %/" },
  { id: 'TW-HTML-SCRIPT', source: '<script>const x = "[[literal]]";</script>' },
  {
    id: 'TW-HTML-SVG',
    source: '<svg><foreignObject><div>[[literal]]</div></foreignObject></svg>',
  },
  {
    id: 'TW-HTML-AUDIO',
    source: '<audio controls src="recording.mp3"></audio>',
  },
  { id: 'TW-HTML-VIDEO', source: '<video controls src="movie.mp4"></video>' },
  {
    id: 'TW-HTML-IFRAME',
    source: '<iframe src="https://example.org/document.pdf"></iframe>',
  },
  {
    id: 'TW-ATTR-TRANSCLUDED',
    source: '<div title={{SomeTiddler!!caption}}>content</div>',
  },
  {
    id: 'TW-ATTR-FILTERED',
    source: '<div class={{{ [tag[Example]join[ ]] }}}>content</div>',
  },
  { id: 'TW-ATTR-VARIABLE', source: '<div class=<<classes>>>content</div>' },
  {
    id: 'TW-ATTR-SUBSTITUTED',
    source: '<div title=`Prefix ${variable}$`>content</div>',
  },
  { id: 'TW-ATTR-MVV', source: '<div title=((values))>content</div>' },
  {
    id: 'TW-KATEX-WIDGET',
    source: '<$latex text="\\frac{x^2}{y}" displayMode="true"/>',
  },
  { id: 'TW-KATEX-ALIAS', source: '<$katex text="\\ce{CO2 + C -> 2 CO}"/>' },
  {
    id: 'TW-CODE-DYNAMIC-WIDGET',
    source: '<$codeblock code={{Snippet!!text}} language="text/javascript"/>',
  },
];

const widgetNames = [
  'action-confirm',
  'action-createtiddler',
  'action-deletefield',
  'action-deletetiddler',
  'action-listops',
  'action-log',
  'action-navigate',
  'action-popup',
  'action-sendmessage',
  'action-setfield',
  'action-setmultiplefields',
  'browse',
  'button',
  'checkbox',
  'codeblock',
  'count',
  'data',
  'diff-text',
  'draggable',
  'droppable',
  'dropzone',
  'edit-bitmap',
  'edit-text',
  'edit',
  'encrypt',
  'entity',
  'error',
  'eventcatcher',
  'fieldmangler',
  'fields',
  'fill',
  'genesis',
  'image',
  'importvariables',
  'jsontiddler',
  'keyboard',
  'let',
  'linkcatcher',
  'link',
  'list',
  'log',
  'macrocall',
  'messagecatcher',
  'navigator',
  'parameters',
  'password',
  'radio',
  'range',
  'reveal',
  'scrollable',
  'select',
  'setmultiplevariables',
  'setvariable',
  'set',
  'slot',
  'testcase',
  'text',
  'tiddler',
  'transclude',
  'vars',
  'view',
  'wikify',
];

for (const widgetName of widgetNames) {
  preservedCases.push({
    id: 'TW-WIDGET-' + widgetName,
    source:
      '<$' +
      widgetName +
      ' value={{Current!!field}} caption="Literal > attribute">' +
      "\n\n''retained nested template'' <$text text=\"[[literal]]\"/>\n\n</$" +
      widgetName +
      '>',
  });
}

describe('official TiddlyWiki feature inventory', () => {
  test.each(nativeCases)(
    '$id: native source is structural and agrees with the TW renderer',
    async ({ source }) => {
      const original = parseTiddlyWiki(source);
      expect(original.diagnostics).toEqual([]);
      const outgoing = serializeTiddlyWiki(original);
      expect(outgoing.text).not.toContain('<!--otw:');
      expect(semanticBlocks(parseTiddlyWiki(outgoing.text).blocks)).toEqual(
        semanticBlocks(original.blocks),
      );
      expect(await renderTiddlyWiki(outgoing.text)).toBe(
        await renderTiddlyWiki(source),
      );
    },
  );

  test.each(preservedCases)(
    '$id: unsupported source remains inert, explicit and recoverable',
    ({ source }) => {
      const outgoing = convertText(source, 'tiddlywiki', 'obsidian');
      expect(outgoing.diagnostics.length).toBeGreaterThan(0);
      expect(outgoing.text).toContain('<!--otw:');
      const withEdit = outgoing.text + '\n\nA new paragraph added in Obsidian.';
      const incoming = convertText(withEdit, 'obsidian', 'tiddlywiki');
      expect(incoming.text).toContain(source);
      expect(incoming.text).toContain('A new paragraph added in Obsidian.');
    },
  );

  test.each(['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'avif', 'bmp'])(
    'TW-EMBED-IMAGE-%s: image transclusion retains its operation through nearby edits',
    (extension) => {
      const source = '{{assets/diagram.' + extension + '}}';
      const original = parseTiddlyWiki(source);
      expect(original.blocks[0]).toMatchObject({
        children: [
          {
            type: 'embed',
            kind: 'note',
            target: 'assets/diagram.' + extension,
          },
        ],
      });
      const outgoing = convertText(source, 'tiddlywiki', 'obsidian');
      const incoming = convertText(
        outgoing.text + '\n\nEdited nearby.',
        'obsidian',
        'tiddlywiki',
      );
      expect(incoming.text).toContain(source);
      expect(incoming.text).toContain('Edited nearby.');
    },
  );

  test('TW-IMAGE-SEMANTICS: alt, tooltip, dimensions, quoting and literal URLs remain distinct', async () => {
    const source =
      '[img alt="Accessible description" width=125px height=50% [Mouse tooltip|https://example.org/a.svg?x=1&y=2]]';
    const original = parseTiddlyWiki(source);
    expect(original.blocks[0]).toMatchObject({
      children: [
        {
          type: 'embed',
          kind: 'image',
          alt: 'Accessible description',
          title: 'Mouse tooltip',
          width: '125px',
          height: '50%',
          target: 'https://example.org/a.svg?x=1&y=2',
        },
      ],
    });
    const markdown = convertText(source, 'tiddlywiki', 'obsidian');
    const recovered = convertText(markdown.text, 'obsidian', 'tiddlywiki');
    expect(await renderTiddlyWiki(recovered.text)).toBe(
      await renderTiddlyWiki(source),
    );
  });

  test('TW-PROTECTED-BLANKS: multiline inline widgets and code span blank lines without exposing their bodies', () => {
    const widget =
      "<$list filter=\"[tag[A]]\">\n\n''literal template''\n\n</$list>";
    const source = 'Before ' + widget + ' after.';
    const outgoing = convertText(source, 'tiddlywiki', 'obsidian');
    expect(outgoing.text).not.toContain('literal template');
    const incoming = convertText(outgoing.text, 'obsidian', 'tiddlywiki');
    expect(incoming.text).toContain(widget);
  });
});
