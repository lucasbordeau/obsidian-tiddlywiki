# Contributing

This repository provides an Obsidian plugin and a portable TypeScript conversion
engine. The existing plugin ID is `tiddlywiki-import-export`; preserve it and the
historical minimum-version entries in `versions.json`.

## Local commands

Use Node 24 and the committed npm lockfile:

For hands-on testing, run `npm ci` once, then `npm run test:manual`. This opens
a populated mock vault in a separate Obsidian instance with the current plugin
and Hot Reload enabled, starts development watch, and opens `MANUAL-TEST.md`.
The versioned mocks are visible under [`manual-test/`](./manual-test/README.md).
Keep the terminal running while testing. See
[manual testing](./docs/development/manual-testing.md).

For automated validation:

```sh
npm ci
npm run typecheck
npm test -- --runInBand
npm run test:lint
npm run test:dev
npm run lint
npm run build:core
npm run test:bundles
npm run test:manual:setup
```

`npm run check` runs those checks together. `npm run format` checks maintained
source, tooling and contributor documentation. Syntax fixture contents are test
inputs and must be edited deliberately rather than reformatted automatically.

`npm run dev` requires `DEV_VAULT_PLUGIN_FOLDER` from `.env`. Each successful build
copies the bundle, manifest and `.hotreload` marker into that development vault;
use a disposable vault. See [hot reload setup](./README.md#how-to-dev).
`npm run build` produces the release bundle without requiring a vault destination
or copying files into a vault. The portable `build:core` command writes browser
compatible ESM and CommonJS bundles to `dist/` and has no vault configuration.

## Source ownership

See [conversion architecture](./docs/development/conversion/architecture.md).
Keep container codecs, dialect syntax, conversion planning and host IO separate.
Import and export have their own serializers. The core uses no Obsidian, VS Code,
TiddlyWiki runtime, DOM or filesystem globals.

Follow the applicable `ts-apps-helper` conventions: domain-specific names; named
complex predicates; named promise collections; explicit payload assembly. Keep
small related helpers with their owning implementation. Extract a separate file
when an artifact is independently reused or its size warrants it. Keep reusable
types in named files.
Use a type guard for repeated nullish/shape validation. Preserve single quotes,
two-space indentation, trailing commas and LF line endings.

Start function names and their utility filenames with a verb describing the
operation: `findMarkdownLinkEnd`, `getInlinePlainText`, `parseHtmlInline`,
`serializeCodeSpan`. Predicates use forms such as `is`, `has`, `are` or `supports`.
Keep names required by external APIs, such as Obsidian's `onload` and ESLint's AST
visitors. Types, constants, data collections and test suites use descriptive nouns.

Group files by domain, adding operation folders when they hold a substantial,
coherent set of files. Keep small groups flat; avoid single-file category layers
and mirrored `types`, `utils` or `cases` folders for every feature. Parser and
serializer entry points coordinate their handlers. Keep context contracts close
to their consumers and import implementation files directly. Tests follow the
same domains, with case collections beside their suites and reusable fixture
readers and assertions under `src/tests/support/`.

Use blank lines to separate validation, preparation, state changes, and the final
action. Keep related declarations, object assignments, and assertions together.
Apply the [semantic spacing skill](./skills/semantic-code-spacing/SKILL.md) to each
edited file after the linter inserts mechanically detectable statement spacing.
In particular, separate preparing an object from appending, saving, or returning
it. The skill and lint rule are shared with `ts-app-helpers`.

Local lint rules document their origin in [eslint-rules](./eslint-rules/README.md).
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
