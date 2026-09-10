# TiddlyWiki feature inventory

Reference date: 2026-09-09. The reference profile is TiddlyWiki **5.4.1** core
WikiText. The test oracle is the pinned `tiddlywiki` development dependency. The
conversion package has no dependency on that runtime.

The [official WikiText index](https://tiddlywiki.com/static/WikiText.html)
enumerates 36 core syntax groups. Every group appears below. Examples are original
regression inputs in
[TiddlyWiki feature suites](../../../../src/tests/syntax/tiddlywiki/features).
Their 234 cases include 78 native syntax cases, 146 source-preservation cases and ten
dedicated image/transclusion/context checks. The 146 preservation cases include
all 62 unique widget names listed by the official widget index.

## What each result means

- **Native**: the parser creates structural nodes. Each native feature case
  asserts no preservation diagnostic, no source capsule, stable parsed semantics
  after serialization, and identical HTML from the actual TW5 renderer before
  and after TW serialization.
- **Static**: supported shared semantics use a small, parsed HTML/widget subset
  when native shortcuts cannot express them. Complex lists, checkboxes, callouts,
  rich link labels and footnotes have separate bidirectional tests in
  [TiddlyWiki serialization suites](../../../../src/tests/syntax/tiddlywiki/serialization)
  and [conversion integration suites](../../../../src/tests/conversion/integration).
- **Preserved**: a diagnostic identifies the unsupported source. An inert
  capsule carries its original bytes through Obsidian; each feature case restores
  them after a nearby edit. Rendering and interactive behavior still require
  TiddlyWiki. This is an explicit source-recovery contract.

Cross-dialect compound fixtures exercise repeated export/import cycles. The
feature matrix and those composition tests are complementary: the native
per-feature renderer assertion specifically compares TW source with serialized
TW source.

## Complete core index

| Official feature group                 | Conversion contract                                                                                           | Executable case IDs                                                                                                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Block Quotes                           | Native fenced, nested and line-prefix quotes; preserve citations/classes                                      | `TW-QUOTE-FENCE`, `TW-QUOTE-NESTED`, `TW-QUOTE-CODE`, `TW-QUOTE-LINES`, `TW-QUOTE-IN-PARAGRAPH`, `TW-QUOTE-CITATION`, `TW-QUOTE-CLASS`                               |
| Calls                                  | Preserve variable calls and positional/named parameters with quoted delimiters                                | `TW-CALL-VARIABLE`, `TW-CALL-POSITIONAL`, `TW-CALL-NAMED`, `TW-CALL-TRIPLE-QUOTED`, `TW-CALL-BRACKET-QUOTED`                                                         |
| Code Blocks                            | Native literal source and language; static representation for shared code that contains TW fence delimiters   | `TW-CODE-LANGUAGE`, `TW-CODE-EMPTY`, `TW-CODE-HIGHLIGHT-LANGUAGE`, `TW-CODE-PLUGIN-LANGUAGE`; long-fence tests in the core suite                                     |
| Conditional Shortcut Syntax            | Preserve full if/elseif/else trees and block/inline context                                                   | `TW-CONDITIONAL`, `TW-CONDITIONAL-ELSEIF`, `TW-CONDITIONAL-NESTED`, `TW-CONDITIONAL-BLOCK`                                                                           |
| Dashes                                 | Native en/em dash semantics and literal escaping                                                              | `TW-DASH`, `TW-ENTITIES-MARKERS`                                                                                                                                     |
| Description Lists                      | Preserve term/definition hierarchy and mixed prefixes                                                         | `TW-DESCRIPTION`, `TW-LIST-QUOTE`                                                                                                                                    |
| Filtered Attribute Values              | Preserve evaluated attributes                                                                                 | `TW-ATTR-FILTERED`, `TW-IMAGE-FILTERED`                                                                                                                              |
| Formatting                             | Native recursive strong, emphasis, underline, strike, super/subscript, highlight and literal inline code      | `TW-STRONG`, `TW-EMPHASIS`, `TW-UNDERLINE`, `TW-STRIKE`, `TW-SUP`, `TW-SUB`, `TW-HIGHLIGHT`, `TW-INLINE-CODE`, `TW-INLINE-DOUBLE-CODE`                               |
| Hard Linebreaks                        | Native explicit linebreak regions, including blank lines                                                      | `TW-HARD-BREAKS`, `TW-HARD-BREAKS-BLANK`, `TW-HARD-BREAKS-INLINE`                                                                                                    |
| Headings                               | Native six levels with inline content; preserve classes                                                       | `TW-HEADING`, `TW-HEADING-CLASS`                                                                                                                                     |
| Horizontal Rules                       | Native thematic breaks                                                                                        | `TW-HR`                                                                                                                                                              |
| HTML Entities                          | Native named/numeric entities and literal syntax characters                                                   | `TW-ENTITIES`, `TW-ENTITIES-MARKERS`                                                                                                                                 |
| HTML                                   | Native supported inline semantics and static generated blocks; preserve comments, scripts, SVG and other HTML | `TW-HTML-INLINE`, `TW-HTML-BREAK`, `TW-HTML-LINK`, `TW-HTML-SCRIPT`, `TW-HTML-SVG`, `TW-COMMENT-HTML`; static-block tests in the core suite                          |
| Images                                 | Native explicit image references, separate alt/tooltip and dimensions; preserve dynamic/extended attributes   | `TW-IMAGE-*`, detailed below                                                                                                                                         |
| Linking                                | Native labels, paths, external/relative destinations, system links and suppression                            | `TW-LINK-*`, `TW-BARE-*`, `TW-SUPPRESSED-*`, `TW-SYSTEM-LINK`, `TW-SYSTEM-SUPPRESSED`                                                                                |
| Lists                                  | Native ordered/unordered and mixed nesting; preserve classes and description-list/quote combinations          | `TW-LIST-UNORDERED`, `TW-LIST-ORDERED`, `TW-LIST-MIXED`, `TW-LIST-CLASS`, `TW-LIST-QUOTE`                                                                            |
| Literal Attribute Values               | Parse literal values for the supported static subset, including quotes and literal ampersands                 | `TW-IMAGE-ATTR-QUOTES`, `TW-IMAGE-WIDGET`, `TW-HTML-LINK`, `TW-LINK-WIDGET`                                                                                          |
| Macro Definitions                      | Preserve the complete body governed by an initial definition                                                  | `TW-MACRO-DEFINITION`                                                                                                                                                |
| Macro Parameter Handling               | Preserve parameter syntax and substitution context                                                            | `TW-MACRO-DEFINITION`, `TW-CALL-POSITIONAL`, `TW-CALL-NAMED`, `TW-CALL-TRIPLE-QUOTED`, `TW-CALL-BRACKET-QUOTED`                                                      |
| Multi-Valued Variable Attribute Values | Preserve attributes and displayed values                                                                      | `TW-ATTR-MVV`, `TW-MVV`, `TW-MVV-SEPARATOR`                                                                                                                          |
| Paragraphs                             | Native block boundaries, soft breaks and contextual literal delimiters                                        | `TW-PARAGRAPH`, `TW-QUOTE-IN-PARAGRAPH`, `TW-UNMATCHED-MACRO-LITERAL`                                                                                                |
| Procedure Definitions                  | Preserve complete procedure scope                                                                             | `TW-PROCEDURE`                                                                                                                                                       |
| Procedure Parameter Handling           | Preserve defaults, invocation and evaluation context                                                          | `TW-PROCEDURE`, `TW-PRAGMA-PARAMETERS`, `TW-CALL-NAMED`                                                                                                              |
| Styles and Classes                     | Undecorated highlight is native; preserve CSS/class-bearing spans and blocks                                  | `TW-HIGHLIGHT`, `TW-STYLE-INLINE`, `TW-CLASS-INLINE`, `TW-STYLE-BLOCK`, `TW-CLASS-BLOCK`                                                                             |
| Substituted Attribute Values           | Preserve substitution expressions                                                                             | `TW-ATTR-SUBSTITUTED`, `TW-IMAGE-SUBSTITUTED`                                                                                                                        |
| Tables                                 | Native rectangular single-header tables and uniform column alignment; preserve richer layout                  | `TW-TABLE-*`, detailed below                                                                                                                                         |
| Transcluded Attribute Values           | Preserve field references used as attributes                                                                  | `TW-ATTR-TRANSCLUDED`, `TW-IMAGE-INDIRECT`                                                                                                                           |
| Transclusion and Substitution          | Preserve variable, field, template, index and parameter operations                                            | `TW-CALL-VARIABLE`, `TW-EMBED-FIELD`, `TW-EMBED-INDEX`, `TW-EMBED-TEMPLATE-PARAMETERS`, `TW-FILTERED-TRANSCLUSION`                                                   |
| Transclusion                           | Native whole-tiddler reference nodes; preserve context-dependent field/index/template/filter forms            | `TW-NOTE-EMBED`, `TW-PDF-EMBED`, `TW-AUDIO-EMBED`, `TW-VIDEO-EMBED`, `TW-EMBED-*`, `TW-FILTERED-*`                                                                   |
| Typed Blocks                           | Preserve body, content type/extension and optional render type                                                | `TW-TYPED-JS`, `TW-TYPED-SVG`, `TW-TYPED-UNKNOWN`, `TW-TYPED-CSV`, `TW-TYPED-RENDER`                                                                                 |
| Utility Classes                        | Preserve host CSS classes                                                                                     | `TW-UTILITY-CLASS`                                                                                                                                                   |
| Variable Attribute Values              | Preserve variable-derived attributes                                                                          | `TW-ATTR-VARIABLE`, `TW-IMAGE-VARIABLE`                                                                                                                              |
| Variables                              | Preserve variable display, function scope and filtered/multi-valued display                                   | `TW-CALL-VARIABLE`, `TW-FUNCTION`, `TW-MVV`, `TW-MVV-SEPARATOR`, `TW-INLINE-FILTER`, `TW-INLINE-FILTER-SEPARATOR`                                                    |
| Widget Attributes                      | Literal subset for explicit links/images; preserve all dynamic attribute families                             | `TW-LINK-WIDGET`, `TW-IMAGE-WIDGET`, `TW-ATTR-*`, `TW-WIDGET-*`                                                                                                      |
| Widgets                                | Static literal link/image subset; preserve full widget source and nested templates                            | `TW-LINK-WIDGET`, `TW-IMAGE-WIDGET`, `TW-WIDGET-*`, `TW-PROTECTED-BLANKS`                                                                                            |
| WikiText Parser Modes                  | Preserve initial pragma scope, including preceding comments; parse midbody pragma-looking text literally      | `TW-PRAGMA-RULES`, `TW-PRAGMA-IMPORT`, `TW-PRAGMA-PARAMETERS`, `TW-PRAGMA-WHITESPACE`, `TW-PRAGMA-PARSERMODE`, `TW-PRAGMA-LEADING-COMMENT`, `TW-PRAGMA-BODY-LITERAL` |

## Images, media and transclusion operations

The [image syntax reference](https://tiddlywiki.com/static/Images%2520in%2520WikiText.html)
and [ImageWidget reference](https://tiddlywiki.com/static/ImageWidget.html)
distinguish an image's tooltip from its alternative text. In
`[img[Tooltip|target]]`, the bracket label is a tooltip. The `alt` attribute is
separate. Width and height accept pixel values and percentages.

| Feature                                                               | Case IDs                                                                                                                                  | Result                                                                                   |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Local PNG/SVG/JPEG and remote URL images                              | `TW-IMAGE-PNG`, `TW-IMAGE-SVG`, `TW-IMAGE-JPEG`, `TW-IMAGE-REMOTE`                                                                        | Native image operation and exact target                                                  |
| Tooltip, alternative text, empty values, both together and precedence | `TW-IMAGE-TOOLTIP`, `TW-IMAGE-ALT`, `TW-IMAGE-ALT-EMPTY`, `TW-IMAGE-ALT-TOOLTIP`, `TW-IMAGE-TOOLTIP-PRECEDENCE`, `TW-IMAGE-TOOLTIP-EMPTY` | Separate semantic fields                                                                 |
| Width, pixel suffix and percentage dimensions                         | `TW-IMAGE-WIDTH`, `TW-IMAGE-PIXELS`, `TW-IMAGE-PERCENT`                                                                                   | Native dimensions                                                                        |
| Quotes, Unicode, URL queries and all attributes together              | `TW-IMAGE-ATTR-QUOTES`, `TW-IMAGE-WIDGET`, `TW-IMAGE-SEMANTICS`                                                                           | Literal values; final case also checks actual TW rendering after the Markdown round trip |
| Class, loading, usemap and load actions                               | `TW-IMAGE-CLASS`, `TW-IMAGE-LOADING`, `TW-IMAGE-USEMAP`, `TW-IMAGE-ACTIONS`                                                               | Original source retained                                                                 |
| Transcluded, filtered, variable and substituted image attributes      | `TW-IMAGE-INDIRECT`, `TW-IMAGE-FILTERED`, `TW-IMAGE-VARIABLE`, `TW-IMAGE-SUBSTITUTED`                                                     | Original source retained                                                                 |
| Responsive HTML, audio, video and document iframe markup              | `TW-IMAGE-RESPONSIVE`, `TW-HTML-AUDIO`, `TW-HTML-VIDEO`, `TW-HTML-IFRAME`                                                                 | Original source retained                                                                 |
| Whole-note, PDF, audio and video transclusion                         | `TW-NOTE-EMBED`, `TW-PDF-EMBED`, `TW-AUDIO-EMBED`, `TW-VIDEO-EMBED`                                                                       | Reference operation retained; host resolves content                                      |
| Transclusion of eight image-like filenames                            | `TW-EMBED-IMAGE-png`, `-jpg`, `-jpeg`, `-gif`, `-svg`, `-webp`, `-avif`, `-bmp`                                                           | Preserve the transclusion operation through a nearby edit                                |

`{{diagram.png}}` remains a transclusion node. Its filename alone cannot determine
the referenced tiddler's content type. Markdown `![[diagram.png]]` selects an image
operation, so that ambiguous conversion uses source preservation. Explicit TW
image syntax converts as an image. This distinction follows the
[transclusion reference](https://tiddlywiki.com/static/Transclusion%2520in%2520WikiText.html).

Field/index references, current-tiddler shorthand, templates, positional
parameters and filtered templates have individual `TW-EMBED-*` and
`TW-FILTERED-*` cases. Content payloads, MIME dispatch, `_canonical_uri` and
binary byte identity are covered in
[metadata and media coverage](./metadata-media.md).

## Table distinctions

The [table reference](https://tiddlywiki.com/static/Tables%2520in%2520WikiText.html)
defines independent cell and row features. An `!` cell becomes a header cell;
an `h` row suffix selects a header group. The current shared table model supports
one row of header cells and uniform column alignment.

`TW-TABLE-HEADER`, `TW-TABLE-ALIGN` and `TW-TABLE-DELIMITERS` verify that supported
subset, including pipes inside links and literal code. Separate source-recovery
cases cover header groups (`TW-TABLE-HEADER-SUFFIX`), captions, classes, footer
groups, rowspans, both colspan directions, vertical alignment, headerless tables,
alignment varying by row and ragged widths. Their IDs are respectively
`TW-TABLE-CAPTION`, `TW-TABLE-CLASS`, `TW-TABLE-FOOTER`, `TW-TABLE-ROWSPAN`,
`TW-TABLE-COLSPAN-LEFT`, `TW-TABLE-COLSPAN-RIGHT`, `TW-TABLE-VERTICAL`,
`TW-TABLE-NO-HEADER`, `TW-TABLE-PER-CELL` and `TW-TABLE-RAGGED`.

## Dynamic scope and widget checklist

The [pragma reference](https://tiddlywiki.com/static/Pragmas.html) defines nine
initial directives: `define`, `function`, `import`, `parameters`, `parsermode`,
`procedure`, `rules`, `whitespace` and `widget`. Each has an executable case. A
leading directive causes preservation of the whole source governed by it.
Comments and blank lines preceding a directive remain inside that preserved
scope. Midbody directive-looking text follows the ordinary text rules.

The [widget index](https://tiddlywiki.com/static/Widgets%2520in%2520WikiText.html)
provides this complete unique-name checklist. Every name expands into a
`TW-WIDGET-<name>` test with dynamic attributes, quoted delimiters, a nested
widget and blank lines in its template:

```text
action-confirm action-createtiddler action-deletefield action-deletetiddler
action-listops action-log action-navigate action-popup action-sendmessage
action-setfield action-setmultiplefields browse button checkbox codeblock count
data diff-text draggable droppable dropzone edit-bitmap edit-text edit encrypt
entity error eventcatcher fieldmangler fields fill genesis image importvariables
jsontiddler keyboard let linkcatcher link list log macrocall messagecatcher
navigator parameters password radio range reveal scrollable select
setmultiplevariables setvariable set slot testcase text tiddler transclude vars
view wikify
```

Those tests exercise source boundaries and recovery. They never execute actions,
filters, network calls, scripts or widget state changes. Literal `$link` and
`$image` also have separate native tests. The index's action/message/trigger
category pages describe runtime behavior shared by multiple widgets.

## Optional plugins and profile boundaries

The [KaTeX plugin reference](https://tiddlywiki.com/plugins/tiddlywiki/katex/)
documents `$latex`, its `$katex` alias and the `$$…$$` shortcut.
`TW-KATEX-WIDGET` and `TW-KATEX-ALIAS` retain mathematical/chemical widget source.
The shortcut requires a future explicit plugin parser profile; the current core
profile has no LaTeX shortcut rule. Plugin-defined parser rules need a declared
profile to identify their syntax reliably.

The [CodeBlockWidget reference](https://tiddlywiki.com/static/CodeBlockWidget.html)
describes optional language highlighting. `TW-CODE-HIGHLIGHT-LANGUAGE` and
`TW-CODE-PLUGIN-LANGUAGE` retain literal bodies and language labels.
`TW-CODE-DYNAMIC-WIDGET` preserves a code widget whose body comes from another
tiddler. Syntax coloring and diagram rendering belong to installed plugins.

The converter recognizes the documented core baseline and the supported static
subset. Wiki configuration can enable additional parser rules, and community
plugins can define new grammar. Whole-tiddler preservation through MIME-aware
codecs remains available for content outside the supported source profile.

## Composition and editor regressions

[`tiddlywiki-stress.tid`](../../../../src/tests/samples/conversion-core/tiddlywiki-stress.tid)
combines mixed five-level lists, nested formatting, literal links and code in
tables, images, nested quote fences and a fenced block containing syntax-looking
text. The core suite checks five serialization cycles and actual TW rendering.
The integration suite also exercises all 24 existing repository samples and
compound documents across four conversion cycles.

Additional regressions check UTF-16 ranges, CRLF, exhaustive non-overlapping
tokens, unfinished editor input, source recovery after nearby edits, protected
blank lines, long code delimiters, non-one list starts, task markers, rich
callout titles, link tooltips and footnote continuation blocks. The fixtures are
checked against semantic expectations and the independent TW renderer; historic
sample pairs are not assumed to be correct expected conversions.
