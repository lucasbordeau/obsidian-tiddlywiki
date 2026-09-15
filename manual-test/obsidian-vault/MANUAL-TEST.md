# Manual test: Obsidian ↔ TiddlyWiki

The current plugin and Hot Reload are installed and enabled in this mock vault.
Keep the terminal running: editing plugin source rebuilds and reloads the plugin.

## 1. Import TiddlyWiki into Obsidian

Open **Settings → Import/Export TiddlyWiki**, click **Import .json**, and select
[the prepared JSON](<TiddlyWiki test files/tiddlywiki-import.json>) from the test
vault:

```text
TiddlyWiki test files/tiddlywiki-import.json
```

A `TiddlyWiki-Import-…` folder should appear with four `TW-` notes, a JPEG,
and an MP3. Open `TW-Start`, then open
[the source wiki](<TiddlyWiki test files/tiddlywiki-source.html>) in your browser
and compare them.

## 2. Export Obsidian into TiddlyWiki

In the same plugin settings, click **Export .json**. Open the
[blank target wiki](<TiddlyWiki test files/tiddlywiki-empty.html>) in your browser,
drag the downloaded `test.json` onto it, and confirm the import.

Expect the four `OB-` notes, four imported `TW-` notes, and four media tiddlers.
This `MANUAL-TEST` instruction note is also exported because export includes
the entire vault. Compare `OB-Start` with [[OB-Start]] in Obsidian, then compare
`TW-Start` with the source wiki.

## Check the results

- [ ] Headings, formatting, nested lists, tables, and quotes retain their structure.
- [ ] Code stays literal, including text resembling links or headings.
- [ ] Internal links open the matching notes; external links keep their URLs.
- [ ] Images display and audio plays in both apps.
- [ ] Start-note tags and `manual-origin` / `manual-status` properties survive.
- [ ] `TW-Preservation` renders `TW-MACRO-KEEP` again in the target wiki.

For an edited round trip, change a paragraph and `manual-status` before exporting.
Import the resulting JSON into a fresh test run and compare the imported notes.
Check `OB-COMMENT-KEEP` in Obsidian source mode after its return trip. Keep the
preservation comments and metadata while testing restoration.

## Start fresh or report a problem

Press **Ctrl+C** in the terminal to stop watching; this Obsidian window stays
open. Run `npm run test:manual` again to open a fresh mock vault in a new test
instance. Previous runs and your edits are retained. Import the sample JSON
once per run to keep the expected counts above.

For a bug report, include the source note, conversion direction, expected result,
actual result, and the Obsidian, plugin, and TiddlyWiki versions.
