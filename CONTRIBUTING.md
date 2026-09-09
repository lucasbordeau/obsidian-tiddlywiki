# Contributing

This repository provides an Obsidian plugin and a portable TypeScript conversion
engine. The existing plugin ID is `tiddlywiki-import-export`; preserve it and the
historical minimum-version entries in `versions.json`.

## Local commands

Use Node 24 and the committed npm lockfile:

```sh
npm ci
npm run typecheck
npm test -- --runInBand
npm run test:lint
npm run lint
npm run build:core
npm run test:bundles
```

`npm run check` runs those checks together. `npm run format` checks maintained
source, tooling and contributor documentation. Syntax fixture contents are test
inputs and must be edited deliberately rather than reformatted automatically.

The original `npm run dev` and `npm run build` plugin scripts require
`DEV_VAULT_PLUGIN_FOLDER` from `.env`. They copy the bundle into that development
vault; use a disposable vault. The portable `build:core` command writes browser
compatible ESM and CommonJS bundles to `dist/` and has no vault configuration.

## Source ownership

See [conversion architecture](docs/development/conversion-engine.md).
Keep container codecs, dialect syntax, conversion planning and host IO separate.
Import and export have their own serializers. The core uses no Obsidian, VS Code,
TiddlyWiki runtime, DOM or filesystem globals.

Follow the applicable `ts-apps-helper` conventions: one independently importable
artifact per file; domain-specific names; named complex predicates; named promise
collections; explicit payload assembly. Small private implementation helpers may
stay with their owning parser or serializer. Keep reusable types in named files.
Use a type guard for repeated nullish/shape validation. Preserve single quotes,
two-space indentation, trailing commas and LF line endings.

Local lint rules document their origin in [eslint-rules](eslint-rules/README.md).
Build, lint and tests run with ordinary commands and require no assistant-specific
tooling or private repository checkout.

## Tests and changes

Add executable behavior tests with corresponding fixtures under `src/tests/`.
Check both conversion directions, nested/literal contexts and repeated round trips.
For a bug, assert the externally observable result. Use the official TiddlyWiki
runtime only in tests to independently verify generated syntax where appropriate.
Retain unsupported source explicitly and report conversion diagnostics.

Run focused tests while developing and the full local check before integration.
Preserve input files and metadata when tests exercise conversion; use temporary
directories for filesystem tests. Do not turn existing sample pairs into expected
outputs without checking their meaning and link identities.

Keep commits and PRs focused on what changed and why. Do not reference assistant
tools or session URLs in commit messages, PR descriptions or code comments. Use
the repository's existing Git author configuration.

## Plugin releases

Use `npm version <version>` to update the package version and invoke the existing
version lifecycle script. Build and distribute `main.js` and `manifest.json` as
release assets; include `styles.css` if the plugin gains one. Release tags must
match `manifest.json`. Keep Obsidian imports external in the application bundle.
