# Manual conversion demo

The repository keeps one manual fixture:
`manual-test/tiddlywiki/basic-feature-demo.html`. It is a self-contained wiki
whose authored tiddlers use ordinary WikiText and regular fields.

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

## Expected conversion limits

- Local media are stored inside the self-contained wiki and can be written as
  attachments during import.
- External image URLs remain image embeds. Canonical external audio and video
  tiddlers convert to durable URL links because their remote embeds are not
  represented reliably by Obsidian import.
- Whole-note transclusions are represented with ordinary transclusion syntax and
  can be compared with their linked source notes after import.
- The fixture avoids custom HTML, widgets, macros, filters, templates, and custom
  interface code. Those intentionally unsupported surfaces belong in automated
  conversion tests rather than this interoperability fixture.

Run `npm run test:demo` to verify the launcher's platform command and retained
fixture path without opening a browser.
