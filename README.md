# Import/Export TiddlyWiki 

Import and export from TiddlyWiki with JSON files.

## How to use

- Clone this repo.
- `npm i` or `yarn` to install dependencies
- `npm run dev` to start compilation in watch mode.

## How to dev

Setup `DEV_VAULT_PLUGIN_FOLDER` (your obsidian dev-vault plugin folder) in a .env file (copy the .env.example)

I couldn't manage to have the [hot-reload](https://github.com/pjeby/hot-reload) plugin to work, just turn off an on again the plugin in Obsidian and it will reload.

## Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/your-plugin-id/`.

## How to release

