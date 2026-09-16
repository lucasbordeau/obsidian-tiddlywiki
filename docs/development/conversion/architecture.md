# Conversion engine

The portable entry point is [`src/conversion.ts`](../../../src/conversion.ts).
`npm run build:core` produces browser-compatible ESM and CommonJS bundles under
`dist/`. Runtime dependencies are Markdown-it, YAML and the HTML entity decoder.
The Obsidian application, filesystem access and TiddlyWiki runtime stay outside
the core; the latter is used as an independent renderer in tests.

## Layers

1. `lexing/lexSource` records concrete tokens and exact UTF-16 source ranges. Token
   ranges partition the entire original input, including malformed syntax.
2. Dialect parsers build shared block/inline nodes. Markdown-it supplies Markdown
   block and inline parsing with Obsidian extensions; the TW parser handles static
   WikiText and explicitly retains dynamic or unsupported regions.
3. Separate serializers emit target syntax, static HTML representations or
   preservation comments, returning diagnostics with source ranges.
4. Container codecs parse/serialize `.tid`, JSON tiddlers and YAML front matter.
   Note/tiddler adapters combine body conversion and metadata handling.
5. Existing plugin converters call the new core. Vault traversal, file writing,
   UI and media IO remain application adapters.

The concrete token stream and semantic parsers have distinct responsibilities:
tokens preserve original boundaries, while parser rules establish meaning. Syntax
trees do not promise an evaluator for TiddlyWiki macros, widgets or filters.

## Source navigation

Implementation files live under `src/modules/conversion-core/`:

```text
conversion/                       Conversion entry point, options and diagnostics
lexing/
  scanners/                       Ordered token recognizers
  boundaries/                     Delimiter, attribute, code and reference readers
  LexingContext.ts                Shared scanner inputs
model/
  {blocks,inlines}/               Node unions and individual node contracts
  ParsedDocument.ts               Parsed document contract
  ListItem.ts                     Shared list item contract
  Dialect.ts, SyntaxToken.ts,      Dialects, tokens and source ranges
  SourceRange.ts
syntax/{obsidian,tiddlywiki}/
  parsing/{blocks,inlines,html}/  Feature handlers and parser orchestration
  serialization/{blocks,inlines}/ Feature handlers and output orchestration
codecs/
  obsidian/                       YAML parsing, serialization and document type
  tiddlywiki/                     JSON and .tid codecs, tiddler field contract
notes/                            Note adapters and body routing
metadata/                         Tags, timestamps and field encoding
preservation/
  source/                         Unsupported-source capsules
  metadata/                       Snapshot records and edit-aware restoration
validation/                       Shared value guards
```

Each dialect owns its context, recognition rules, escaping and preservation
helpers alongside its handlers. Related handlers share a folder, and small groups
stay flat. Functions and utility files start with an operation verb. Shared
contracts use type-only imports.
Internal consumers import the owning file directly; `src/conversion.ts` remains
the public package entry point.

The host settings tab and its rendering, form, action and path helpers live
together in `src/modules/plugin-core/settings/`. Tooling is grouped under
`scripts/{build,lint,validation}/`, and local ESLint rules live directly in
`eslint-rules/`.

Tests mirror responsibilities under `src/tests/`: `syntax` holds dialect and
feature cases, `conversion` holds lexer, integration and preservation checks,
and `codecs` holds containers, metadata and media. Shared assertions, renderer
access and fixture readers live in `support`. Case collections sit beside their
test suites. Test inputs remain in `samples`.

## API contracts

```ts
import { convertText, exportObsidianNote, importTiddler } from './conversion';

const converted = convertText(markdown, 'obsidian', 'tiddlywiki');
const exported = exportObsidianNote({
  title: 'Research/Study',
  content: markdown,
});
if (exported.value) {
  const imported = importTiddler(exported.value);
}
```

`convertText` returns `text`, the parsed `document` and `diagnostics`. Same-dialect
conversion without a resolver returns exact original source. Cross-dialect
serialization canonicalizes supported syntax. An optional `resolveLink` callback
maps internal targets without involving vault or wiki APIs.

Codecs return `{ value?, diagnostics }`; malformed containers have no successful
value. Consumers should surface diagnostics. Unsupported syntax and non-wikitext
MIME bodies are preserved according to their codec contract.

## Preservation

Unsupported syntax travels in an inert `<!--otw:v1:...-->` comment. The payload is
URI-encoded, versioned JSON recording dialect, source and reason. Hyphens are
encoded to keep payload text from terminating the comment. Returning to the
source dialect restores the original construct, including after a nearby edit.
Removing a preservation comment removes its retained source.

Full-note conversion also stores versioned metadata in a namespaced tiddler field
or YAML property. Source and target snapshots allow unchanged content to restore
exact original bodies/front matter while respecting subsequent edits. Collisions
with user-owned namespaced fields use distinct keys. Repeated edited cycles
consume previous records to keep metadata growth bounded.

The portable conversion API preserves unsupported source and round-trip metadata
by default. The Obsidian vault importer selects a clean migration mode: static
representations are emitted and unsupported dynamic source and round-trip records
are omitted from generated Markdown notes. Diagnostics continue to identify
omitted source.

Binary, document and developer MIME bodies follow an opaque-content route. Tests
cover payload identity separately from media references in note syntax. File
copying, attachment extraction and safe import destinations remain host IO work.

## Coverage and boundaries

- [Obsidian feature inventory](./features/obsidian.md)
- [TiddlyWiki feature inventory](./features/tiddlywiki.md)
- [Metadata and media inventory](./features/metadata-media.md)

Each inventory distinguishes native syntax, static representations and preserved
source. The source-compatible fallback is intentional and diagnosed. Dynamic
queries, macros, widgets, transclusion evaluation, diagrams, MathJax and host
anchor resolution require capabilities beyond the shared static converter.

Tests include exact lexer coverage, explicit semantic expectations, adversarial
mixed documents, repeated round trips, edited preservation records, invalid
containers and comparison with the official TiddlyWiki renderer. The local
`npm run check` includes type checking, Jest, lint-rule tests, repository lint and
portable bundle construction.

CI, issue-by-issue host integration, outreach, a TiddlyWiki companion and the VS
Code `.tid` extension remain in the [roadmap](../../plans/bidirectional-tooling-roadmap.md).
