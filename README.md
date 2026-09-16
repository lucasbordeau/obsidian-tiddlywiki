# Import/Export TiddlyWiki

Move notes and attachments between Obsidian and TiddlyWiki using JSON files.
The plugin converts common static note content in both directions.
See the [changelog](./CHANGELOG.md) for published versions and the incoming
release.

## Install

The plugin runs on desktop Obsidian. Version 2.0.0 requires Obsidian 1.13.7 or
newer. Earlier plugin releases remain available to older app versions.

### Community plugin

Install and enable [Import/Export TiddlyWiki](https://community.obsidian.md/plugins/tiddlywiki-import-export)
from Obsidian's community plugins.

### Manual install

Download `main.js` and `manifest.json` from the same
[GitHub release](https://github.com/lucasbordeau/obsidian-tiddlywiki/releases).
Copy them into `VaultFolder/.obsidian/plugins/tiddlywiki-import-export/`, then
enable the plugin in Obsidian.

## How to use

Open Obsidian's command palette with **Cmd+P** on macOS or **Ctrl+P** on
Windows/Linux, then search for **TiddlyWiki**.

- **TiddlyWiki → Obsidian:** In TiddlyWiki, use **Tools → Export all → JSON File**.
  Run **Import/Export TiddlyWiki: Import TiddlyWiki JSON** in Obsidian and choose
  that file. Notes and local attachments are written to a new
  `TiddlyWiki-Import-*` folder at the root of the vault.
- **Obsidian → TiddlyWiki:** Run **Import/Export TiddlyWiki: Export vault to
  TiddlyWiki JSON**. The plugin downloads `tiddlywiki-export.json` for the whole
  visible vault. In TiddlyWiki, use **Tools → Import** to import that file.

## Scope of this plugin

### Handled

- Common static formatting: headings, lists and tasks, quotes and callouts,
  tables, code, links, and inline formatting. Some features use static HTML
  representations in the other format.
- Whole-note transclusions and local image, audio, and video attachments.
  External images use Markdown embeds; external audio and video use HTML players.
- Tags, authored fields, and timestamps in the JSON exchange.

### File access and network use

The import command reads the TiddlyWiki JSON file you select, including when it
is outside the vault, then writes converted notes and attachments into the
vault. Export reads visible vault files and saves a JSON download.

Imported notes can contain remote image, audio, video, and YouTube embeds.
Displaying those embeds or playing their media requests content from the source
URLs and contacts the corresponding hosts.

### Intentionally out of scope

- Executing TiddlyWiki macros, widgets, filters, queries, or custom parser
  rules.
- Recreating rendered views from Obsidian features or community plugins such
  as Bases, Dataview, Mermaid, or MathJax in TiddlyWiki.

The [conversion feature inventories](./docs/development/conversion/architecture.md#coverage-and-boundaries)
describe the supported syntax and its static or preserved representations.

### Before a larger migration

- The Obsidian importer emits readable Markdown and omits unsupported dynamic
  WikiText and TiddlyWiki-only operational fields. Keep the source JSON if you
  need those parts of the wiki later.
- Export skips files in dot-prefixed folders and files whose names start with
  a dot. Wiki links to excluded files become visible text in the exported notes.
- Export uses note and attachment basenames as tiddler titles; import writes
  notes into one folder. Duplicate names can collide, and imported notes with
  the same resulting filename can overwrite each other. Try the transfer on a
  copy before moving a vault or wiki with repeated names.

## Contribute

See [CONTRIBUTING.md](./CONTRIBUTING.md) for validation commands, code
conventions, and pull request guidance. Report bugs and suggest improvements
through [GitHub issues](https://github.com/lucasbordeau/obsidian-tiddlywiki/issues).
The project is [MIT licensed](./LICENSE).

### TiddlyWiki fixture

Open the single self-contained TiddlyWiki fixture in the default browser:

```sh
npm run demo:tw
```

Start with **Basic Notes — Start**, follow its suggested route, then export the
wiki as JSON and import that file with the Obsidian command. The fixture covers
nested formatting, lists, quotes, tables, links, metadata, transclusion, and
local and external media. See [manual testing](./docs/development/manual-testing.md)
for the route and accepted conversion limits.

### How to dev

Use Node 24 and a disposable Obsidian vault. From this repository:

```sh
npm ci
npm run dev:obsidian
```

This builds and installs the plugin, enables it in `.dev-vault`, and opens that
vault in an isolated Obsidian profile. It watches for changes until you press
Ctrl+C. The default destination is
`.dev-vault/.obsidian/plugins/tiddlywiki-import-export`.

To use another development vault, set `DEV_VAULT_PLUGIN_FOLDER` in `.env` (copy
`.env.example` first). Set `OBSIDIAN_EXECUTABLE` if Obsidian is not discoverable
by the launcher. Use `npm run dev:obsidian -- --no-open` to install without
opening the app, or `npm run dev` to watch without launching it.

Install [Hot Reload](https://github.com/pjeby/hot-reload) in that vault. In a
second terminal, these commands download the tested revision (0.3.1). Adjust
the paths if you configured another development vault:

```sh
mkdir -p .dev-vault/.obsidian/plugins/hot-reload
curl -fL https://raw.githubusercontent.com/pjeby/hot-reload/4c5454963ec4cbe847302d3063ada4b4204d7e95/main.js \
  -o .dev-vault/.obsidian/plugins/hot-reload/main.js
curl -fL https://raw.githubusercontent.com/pjeby/hot-reload/4c5454963ec4cbe847302d3063ada4b4204d7e95/manifest.json \
  -o .dev-vault/.obsidian/plugins/hot-reload/manifest.json
```

Enable **Hot Reload** in **Settings → Community plugins**, then keep
`npm run dev:obsidian` running. Restart the development vault once if Hot
Reload is not listed. Each successful build updates the installed plugin;
Hot Reload reloads it. If a reload does not occur, run **Hot Reload: Check
plugins for changes and reload them** from the command palette.

Run `npm run check` before submitting a pull request.
