# Manual conversion demo

The repository keeps two self-contained wikis. The authored tiddlers in
`manual-test/tiddlywiki/basic-feature-demo.html` use ordinary WikiText and
regular fields. `manual-test/tiddlywiki/empty.html` has no authored tiddlers and
is ready for Obsidian exports. Both files contain the TiddlyWiki runtime and its
BSD 3-Clause copyright notice and terms.

Open it in the default browser:

```sh
npm run demo:tw
```

Begin at **Basic Notes — Start** and follow its suggested route through:

1. inline and nested formatting;
2. ordered, unordered, and mixed nested lists;
3. a table, quote, code block, and formatted lists inside a quote;
4. internal, labelled, and external links;
5. linked metadata notes;
6. direct and two-level whole-note transclusion;
7. embedded local image, audio, and video tiddlers;
8. external image, audio, and video sources.

To test the Obsidian import, use **Tools → Export all → JSON File** in the wiki,
then run **Import/Export TiddlyWiki: Import TiddlyWiki JSON** from Obsidian's
command palette and select the downloaded file.

Imported notes keep tags and authored fields such as `status` and `owner` in
Properties. TiddlyWiki-only operational fields are omitted. Valid `created` and
`modified` timestamps are applied to the Markdown files themselves, so no static
date properties appear. The file modification time changes when the note is
edited. File dates may change when notes are copied or synced outside Obsidian.

To test the Obsidian export, open the blank wiki:

```sh
npm run demo:tw:empty
```

Export notes from Obsidian as TiddlyWiki JSON, then use **Tools → Import** in the
blank wiki to select the JSON file. Save the populated wiki under a new filename
so the blank fixture remains available for the next test.

## Expected conversion limits

- Local media are stored inside the self-contained wiki and can be written as
  attachments during import.
- External image URLs remain image embeds. Canonical external audio and video
  tiddlers become small HTML media players that stream from their source URLs;
  importing them does not add the remote files to the vault. Playback requires
  network access and a media format the local Obsidian runtime can decode.
  Obsidian's native `![[...]]` embeds resolve vault files, not remote URLs.
- Whole-note transclusions are represented with ordinary transclusion syntax and
  can be compared with their linked source notes after import.
- The fixture's authored notes avoid custom HTML, widgets, macros, filters,
  templates, and custom interface code. The converter emits only standard
  audio/video HTML for remote players. Other unsupported surfaces belong in
  automated conversion tests rather than this interoperability fixture.

Run `npm run test:demo` to verify the launcher's platform command and both
retained fixture paths without opening a browser.
