# Import/Export TiddlyWiki

Import and export from TiddlyWiki with JSON files.

## How to use

Just install it from the store.

Or copy over `main.js`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/your-plugin-id/`.

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
