# Manual testing

Install Node 24 and Obsidian desktop. After cloning, run:

```sh
npm ci
npm run test:manual
```

Obsidian opens directly in a populated mock vault with the current plugin and
Hot Reload installed and enabled. The `MANUAL-TEST.md` note opens with the
import/export instructions and a checklist. Follow its two steps to import the
prepared JSON into Obsidian, then export the vault into the supplied blank wiki.
The system file browser opens with `import.json` selected.

Keep the terminal running. Editing plugin source rebuilds the bundle and Hot
Reload reloads the plugin in the test vault. **Ctrl+C** stops the watcher; the
Obsidian window stays open.

## What is prepared

The source mocks are versioned under the visible `manual-test/` directory. Every
run copies the source vault into a fresh `manual-test/runs/run-…/` directory and
launches a separate Obsidian instance with its own profile. The populated vault
is registered and opened automatically. Setup uses the installed TiddlyWiki
version and requires no `.env`. The pinned official Hot Reload plugin is bundled
in the repository, so setup works offline after `npm ci`.

| File or folder                                          | Purpose                                                                |
| ------------------------------------------------------- | ---------------------------------------------------------------------- |
| `manual-test/obsidian-vault/`                           | Versioned source vault with four `OB-` notes, media, and configuration |
| `manual-test/tiddlywiki/`                               | Four independently authored, versioned `TW-` tiddlers                  |
| `manual-test/runs/run-…/obsidian-vault/MANUAL-TEST.md`  | Instructions and checklist, opened automatically in Obsidian           |
| `manual-test/runs/run-…/tiddlywiki/import.json`         | Generated JSON selected in the plugin's import picker                  |
| `manual-test/runs/run-…/tiddlywiki/{source,empty}.html` | Generated source and blank target wikis                                |

## Expected results

1. In **Settings → Import/Export TiddlyWiki**, click **Import .json** and select
   `../tiddlywiki/import.json`, relative to the mock vault root. Expect a
   `TiddlyWiki-Import-…` folder containing four `TW-` notes, an image, and audio.
   Compare `TW-Start` with the source wiki.
2. Click **Export .json**. Drag the downloaded `test.json` into the blank target
   wiki and confirm the import. Expect both `OB-` and `TW-` sets: eight sample
   notes and four media tiddlers. The `MANUAL-TEST` instruction note is also
   exported, giving nine text tiddlers in total.

All sample navigation and media references have real targets. Check heading
levels, formatting, nested lists, tables, literal code, link destinations,
image display, audio playback, tags, and `manual-origin` / `manual-status` fields.

The preservation examples have explicit markers. `TW-MACRO-KEEP` renders in the
source wiki and should render again after export back to TiddlyWiki.
`OB-COMMENT-KEEP` is an Obsidian comment; inspect source mode after returning that
note to Obsidian. Keep preservation comments and metadata when testing these
round trips. The [mock README](../../manual-test/README.md) describes the
individual examples.

## Repeat and report

Stop the watcher with **Ctrl+C**, then run `npm run test:manual` again for a fresh
test folder and instance. Previous runs and edits are retained. Import each
source once per run: the plugin exports the entire vault, including earlier
import folders and the instruction note.

For an edited round trip, change a paragraph and `manual-status` before exporting.
Import the result into a fresh run and compare its imported notes with the
original source. Capture the source file, direction, expected result, actual
result, and host versions when reporting a defect.

This starter set uses distinct filenames. Folder-qualified identities, duplicate
filenames, and additional content types need separate host tests. Broader syntax
and metadata cases are exercised by `npm run check`.

## Launcher options

Use `npm run test:manual -- --no-open` to prepare the kit and print its Markdown
instruction path without launching Obsidian or starting a watcher. This mode
exits after setup and can run on a headless machine.

For an unusual Obsidian installation, set `OBSIDIAN_EXECUTABLE` to the desktop
executable. The launcher uses a randomly assigned localhost debugging port to
trust its disposable vault and verify that both plugins loaded. Application
output is always written to the run's `obsidian.log`.

## Maintain the kit

Edit the complete source vault under `manual-test/obsidian-vault/`, including its
`MANUAL-TEST.md` instructions, and the complete `.tid` files under
`manual-test/tiddlywiki/`. The source vault contains its own JPEG and MP3. Each
direction has distinct note and attachment names. The conversion engine is
exercised by the tester, rather than used to generate the expected source
fixtures.

`npm run test:manual:setup` builds the plugin and verifies preparation, source
rendering, media bytes, local links, and preservation of earlier test runs. It
is part of `npm run check`.
