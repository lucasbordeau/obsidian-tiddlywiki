# Obsidian note feature inventory

Reference date: 2026-09-09. The examples are original regression inputs. The matrix
distinguishes editable syntax conversion, static representations and retained
source. Each `O-*` identifier names an executable test in
[Obsidian feature suites](../../../../src/modules/conversion-core/syntax/obsidian/__tests__/features);
focused regressions live in the sibling
[parsing](../../../../src/modules/conversion-core/syntax/obsidian/parsing/__tests__) and
[serialization](../../../../src/modules/conversion-core/syntax/obsidian/serialization/__tests__) folders.

## Note syntax

The [basic syntax reference](https://obsidian.md/help/syntax) supplies paragraphs,
line breaks, headings, emphasis, lists, tasks, links, images, code, separators,
footnotes, comments and escaping. The
[advanced reference](https://obsidian.md/help/advanced-syntax) adds tables, diagrams
and math. Tests combine these families inside each other.

| Feature                                                                | Executable coverage                                      | Conversion contract                                                                            |
| ---------------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Six heading levels and setext headings                                 | `O-BASIC`                                                | Heading level and inline content                                                               |
| Paragraphs, soft and hard breaks                                       | `O-BASIC`                                                | Separate blocks and explicit hard breaks                                                       |
| Bold, italic, combined/nested emphasis, strike, highlight              | `O-BASIC`, `O-COMPOUND`                                  | Recursive formatting nodes                                                                     |
| Bullet markers, numbered lists, mixed nesting and non-one starts       | `O-BASIC`, Markdown focused suite                        | Hierarchy, numbering and continuation blocks; static HTML where TW list syntax is insufficient |
| Tasks, custom completion markers                                       | Markdown task-marker regressions, `O-CALLOUT`            | State and marker identity; static TW checkboxes                                                |
| Quotes, nested quotes and callouts                                     | `O-CALLOUT`, `O-COMPOUND`                                | Nested blocks; static aside for callouts                                                       |
| Horizontal rules and repeated leading separators                       | `O-BASIC`                                                | Separator nodes remain separate from YAML                                                      |
| Inline code, indented code, variable-length fences, literal delimiters | `O-BASIC`, `O-FENCED`, lexer and Markdown focused suites | Literal content and language survive                                                           |
| Tables, alignment, escaped pipes, links/images/math in cells           | `O-BASIC`, `O-IMAGE`, `O-COMPOUND`                       | Rectangular table cells and alignment                                                          |
| Escapes, entities, Unicode                                             | `O-BASIC`, lexer suite                                   | Literal text and exact UTF-16 source coverage                                                  |
| Named/repeated footnotes, multiline definitions                        | `O-MATH-FOOTNOTE`, `O-COMPOUND`, Markdown focused suite  | Static references/definitions and continuation blocks                                          |
| Inline footnotes                                                       | `O-PRESERVED`, Markdown focused suite                    | Source retained with diagnostic                                                                |
| Inline/block MathJax source                                            | `O-MATH-FOOTNOTE`, `O-COMPOUND`                          | Source retained with diagnostic                                                                |
| Hidden comments and HTML comments                                      | `O-PRESERVED`, `O-COMPOUND`                              | Exact source retained with diagnostic                                                          |

## Links and embeds

The [link reference](https://obsidian.md/help/links) defines file, heading, nested
heading and block targets, aliases and Markdown destinations. The
[embed reference](https://obsidian.md/help/embeds) covers note sections, image size,
audio, PDF fragments, canvas and embedded lists.

| Feature                                                                    | Executable coverage                                                                                           | Conversion contract                                                     |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Wiki and Markdown links; folder paths; optional `.md`; aliases             | `O-LINK`, `O-FILE`                                                                                            | Target and label identity                                               |
| Reference links/images, formatted labels, tooltips                         | `O-LINK`, `O-MARKDOWN-IMAGE`                                                                                  | Resolved destination, label, alt and title                              |
| Heading, nested heading, same-note and block links                         | `O-LINK`                                                                                                      | Fragment retained; resolving anchors requires host mapping              |
| External HTTP URLs, query strings, parentheses, mail and Obsidian URIs     | `O-LINK`                                                                                                      | External target unchanged                                               |
| Whole-note/file embeds                                                     | `O-FILE`                                                                                                      | Target becomes a TW transclusion; referenced content remains host-owned |
| Heading/block embeds and PDF page/height fragments                         | `O-ANCHOR-EMBED`                                                                                              | Source retained with diagnostic pending host-specific resolution        |
| Paragraph/list block identifiers                                           | `O-PRESERVED`, `O-COMPOUND`                                                                                   | Source retained with diagnostic                                         |
| Local image dimensions and Unicode/spaced targets                          | `O-IMAGE`: eight formats × paragraph, callout, task list and table                                            | Image target, width and height                                          |
| Remote/relative/reference images; escaped alt; width-only and width×height | `O-MARKDOWN-IMAGE`, `O-IMAGE-RENDER`                                                                          | Distinct alt, tooltip, target and size; checked with actual TW renderer |
| Custom link resolver                                                       | [Integration rendering suite](../../../../src/modules/conversion-core/conversion/__tests__/rendering.test.ts) | Internal references remapped; external URLs retained                    |

## Complete built-in file-format checklist

The [accepted-format list](https://obsidian.md/help/file-formats) is covered by
`O-IMAGE` and `O-FILE`. `.webm` is shared by audio and video. Container/body tests
are listed separately in [metadata and media coverage](./metadata-media.md).

| Category                   | Extensions                                                        |
| -------------------------- | ----------------------------------------------------------------- |
| Notes and structured files | `.md`, `.base`, `.canvas`                                         |
| Images                     | `.avif`, `.bmp`, `.gif`, `.jpeg`, `.jpg`, `.png`, `.svg`, `.webp` |
| Audio                      | `.flac`, `.m4a`, `.mp3`, `.ogg`, `.wav`, `.webm`, `.3gp`          |
| Video                      | `.mkv`, `.mov`, `.mp4`, `.ogv`, `.webm`                           |
| Documents                  | `.pdf`                                                            |

These tests separately verify reference syntax, MIME-aware body handling and
opaque binary payload identity. Device codec availability and playback belong to
the host application.

## Host-specific content

| Feature and official source                                                                                 | Executable coverage                                                                                                                             | Conversion contract                                                                                         |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| [Callouts](https://obsidian.md/help/callouts): all 27 documented types/aliases, case and custom types       | `O-CALLOUT`                                                                                                                                     | Type/title/fold metadata and nested content; target uses static HTML                                        |
| [Search query blocks](https://obsidian.md/help/Plugins/Search)                                              | `O-FENCED`, `O-COMPOUND`                                                                                                                        | Literal query and fence language; displayed as code in TW                                                   |
| [Bases YAML and inline base blocks](https://obsidian.md/help/bases/syntax)                                  | `O-FILE`, `O-FENCED`, `O-COMPOUND`                                                                                                              | File reference or literal code; dynamic views require Obsidian                                              |
| Mermaid diagrams and internal-link classes                                                                  | `O-FENCED`, `O-COMPOUND`                                                                                                                        | Diagram source and language; displayed as code in TW                                                        |
| [HTML](https://obsidian.md/help/html): underline, inline semantic tags, custom styles, details, audio/video | `O-PRESERVED`, [remote-media regression](../../../../src/modules/conversion-core/syntax/tiddlywiki/__tests__/features/html/remoteMedia.test.ts) | Plain URL-backed audio/video controls and static inline tags converted; other HTML retained with diagnostic |
| [Web pages and social embeds](https://obsidian.md/help/embed-web-pages)                                     | `O-PRESERVED`, Markdown provider-embed regressions                                                                                              | Iframe/provider source retained with diagnostic                                                             |
| Community-plugin code fences, illustrated by Dataview                                                       | `O-FENCED`                                                                                                                                      | Literal code and language retained                                                                          |
| Properties, tags, aliases, dates and custom metadata                                                        | Metadata suites and linked inventory                                                                                                            | Structured codecs and edit-aware preservation                                                               |

Workspace features such as graph view, backlinks, bookmarks, navigation and editor
settings operate outside a note's stored syntax. Community extensions can define
additional syntax; the inventory records a tested core baseline.

## Contrived composition

[`obsidian-media-laboratory.md`](../../../../src/testing/samples/conversion-core/obsidian-media-laboratory.md)
combines nested folded callouts, mixed task/numbered lists, sized images in tables,
PDF/audio/video/canvas/Base embeds, rich footnotes, math, comments, iframe HTML and
literal Mermaid/query/base/code fences. `O-COMPOUND` checks the complete parsed
meaning across three export/import cycles. The feature cases assert specific
node fields in addition to round-trip stability, and selected cases check actual
TiddlyWiki rendering.
