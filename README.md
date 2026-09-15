# Import/Export TiddlyWiki

Import and export from TiddlyWiki with JSON files.

## How to use

Install and enable **Import/Export TiddlyWiki** from Obsidian's community plugins.
For a manual installation, copy `main.js` and `manifest.json` into
`VaultFolder/.obsidian/plugins/tiddlywiki-import-export/`, then enable the plugin.

Open Obsidian's command palette with **Cmd+P** on macOS or **Ctrl+P** on
Windows/Linux, then search for **TiddlyWiki**. The plugin provides two commands:

- **Import/Export TiddlyWiki: Import TiddlyWiki JSON** — choose a TiddlyWiki JSON
  export to import its notes and attachments into a timestamped
  `TiddlyWiki-Import-*` folder in the current vault. Create the source JSON in
  TiddlyWiki with **Tools → Export all → JSON File**.
- **Import/Export TiddlyWiki: Export vault to TiddlyWiki JSON** — export the whole
  current vault to a downloadable JSON file. In TiddlyWiki, use **Tools → Import**
  to import that file.

The import and export buttons are also available under **Settings →
Import/Export TiddlyWiki**. To assign a direct keyboard shortcut to either
command, open **Settings → Hotkeys** and search for **TiddlyWiki**.

## Try the current version

With Node 24 and the Obsidian desktop app installed:

```sh
npm run test:manual
```

The command installs dependencies when needed, then opens a separate Obsidian
instance directly in a populated mock vault with the current plugin and Hot
Reload installed and enabled. It opens `MANUAL-TEST.md` with two checks: import
the prepared TiddlyWiki JSON, then export back into the supplied blank wiki.

The native import picker opens automatically at the versioned
`manual-test/tiddlywiki/import.json`. Choose **Open**. If you close it, press
**Cmd+P** or **Ctrl+P** and run **Import/Export TiddlyWiki: Import TiddlyWiki
JSON**.

Keep the terminal running. Source edits rebuild and reload the plugin in the
test vault. Press **Ctrl+C** to stop watching; the Obsidian window stays open.

The samples include real image/audio files, working internal links, formatting,
metadata, and preservation examples. The complete source mocks are versioned in
[`manual-test/`](./manual-test/README.md). Each run creates a fresh directory
under `manual-test/runs/` and retains earlier runs. Setup requires no `.env`;
the pinned Hot Reload plugin is bundled in the repository.

Use `npm run test:manual -- --no-open` to prepare the files and exit without
launching Obsidian or starting a watcher. See
[manual testing](./docs/development/manual-testing.md) for expected results and
repeated round trips.

## How to dev

Use Node 24 and a disposable Obsidian vault. From this repository:

```sh
npm ci
cp .env.example .env
npm run dev
```

The default destination is `.dev-vault/.obsidian/plugins/tiddlywiki-import-export`.
The first build creates it; open `.dev-vault` as a vault in Obsidian. To use another
development vault, change `DEV_VAULT_PLUGIN_FOLDER` in `.env`.

Install [Hot Reload](https://github.com/pjeby/hot-reload) in that vault. In a second
terminal, these commands download the tested revision (0.3.1):

```sh
mkdir -p .dev-vault/.obsidian/plugins/hot-reload
curl -fL https://raw.githubusercontent.com/pjeby/hot-reload/4c5454963ec4cbe847302d3063ada4b4204d7e95/main.js \
  -o .dev-vault/.obsidian/plugins/hot-reload/main.js
curl -fL https://raw.githubusercontent.com/pjeby/hot-reload/4c5454963ec4cbe847302d3063ada4b4204d7e95/manifest.json \
  -o .dev-vault/.obsidian/plugins/hot-reload/manifest.json
```

Adjust the download destination if using another vault. In Obsidian's **Settings →
Community plugins**, turn on community plugins and enable **Hot Reload** and
**Import/Export TiddlyWiki**. Restart the development vault once if the newly
installed plugins are not listed.

Keep `npm run dev` running. Each successful build copies `manifest.json`, a
`.hotreload` marker and `main.js` into the plugin folder. Hot Reload watches the
marker and reloads the enabled plugin after the bundle changes; Obsidian displays
a reload notice. Failed builds leave the last working vault bundle in place.
The marker belongs in the vault's plugin folder, next to `main.js`.

If a reload does not occur, check that the vault matches `.env`, both plugins are
enabled, and `.hotreload` exists in the installed plugin folder. Then run **Hot
Reload: Check plugins for changes and reload them** from the command palette.

`npm run build` creates a production `main.js` in the repository and works without
`.env`. It does not deploy to the development vault.
