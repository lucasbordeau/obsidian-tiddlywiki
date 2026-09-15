# Versioned manual testing mocks

Run the complete workflow from the repository root:

```sh
npm run test:manual
```

That one command installs dependencies when needed, builds the plugin, copies
`obsidian-vault/` into a fresh directory under `runs/`, injects the current
plugin build and Hot Reload, and opens the copied vault in an isolated Obsidian
instance. Follow the `MANUAL-TEST.md` note that opens automatically.

The native import picker opens automatically in `manual-test/tiddlywiki` with
the versioned `import.json` already selected. Choose **Open**. If you close it,
press **Cmd+P** or **Ctrl+P** and run **Import/Export TiddlyWiki: Import
TiddlyWiki JSON**. The same folder contains the generated `source.html` and
`empty.html` wikis used for comparison and export testing.

These independently authored sources exercise both starting formats. The `OB-`
notes and media in `obsidian-vault/` start in Obsidian; the `TW-` tiddlers in
`tiddlywiki/` start in TiddlyWiki. Each set contains four text documents.
Distinct titles make their origins visible after import.

The Obsidian mock includes `OB-image.jpg` and `OB-audio.mp3`. Setup embeds those
same bytes into TiddlyWiki as `TW-image.jpg` and `TW-audio.mp3`. Every local link
and media reference resolves within its source set.

## Quick checklist

Start with `OB-Start` in the prepared Obsidian vault and `TW-Start` in the source
wiki. Follow their links and compare the same documents after each conversion:

- **Formatting:** two heading levels, bold, italic, strikethrough, nested bullet
  and numbered lists, a two-column table, a quote, and literal code.
- **Links and media:** the labelled link returns to the start document, the
  external link opens, the image appears, and the audio player plays.
- **Metadata:** `manual-test` and the origin tag remain present. The start
  document retains `manual-origin` and `manual-status`.
- **Preservation:** the Obsidian source comment contains the marker
  `OB-COMMENT-KEEP`; check that it returns in source mode after the round trip.
  The TiddlyWiki source macro renders `TW-MACRO-KEEP` in its native wiki; after
  the round trip, check both that rendered text and the macro source in edit
  mode. Keep the generated preservation records when editing converted files.
- **Edits:** add a sentence and a tag to the converted start document, then
  return it to its source application and check both changes.

Each original source contains **four text documents and two attachments**.
Importing the TiddlyWiki JSON once into the populated Obsidian vault gives
**eight sample notes and four attachments**. The vault also contains the
`MANUAL-TEST.md` instruction note, which is included in the whole-vault export:
**nine text tiddlers and four media tiddlers**. Use a fresh destination wiki when
exporting this combined vault so all thirteen titles are easy to check. Repeated
imports into Obsidian create extra copies.

The `.tid` files include complete TiddlyWiki headers; their bodies are native
WikiText. The versioned `import.json` packages those tiddlers and the two media
fixtures. The Markdown files include native Obsidian frontmatter and syntax.
Keep syntax fixtures out of automatic formatting. Run
`npm run test:manual:fixtures` after editing a TiddlyWiki source fixture.

For a larger, independently maintained example, import
`tiddlywiki/official-introduction.json`. It contains the textual slides from the
official TiddlyWiki 5.4.1 Introduction edition. The adjacent
`OFFICIAL-INTRODUCTION-SOURCE.md` records its exact provenance and BSD license;
upstream images and audio are intentionally excluded.
