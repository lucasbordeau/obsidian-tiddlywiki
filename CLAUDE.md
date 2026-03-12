# CLAUDE.md

This file provides guidance for AI assistants working with this codebase.

## AI Assistant Guidelines

- **Do not mention AI tools in commits or PRs.** Commit messages, PR titles, PR descriptions, and code comments must not reference Claude, AI, or any AI assistant. Write them as if authored by a human developer.
- **Do not add AI session URLs** (e.g. `https://claude.ai/...`) to commit messages or PR bodies.
- **Do not set yourself as commit author.** Use the repository's existing git author configuration as-is.
- **Keep commits focused and descriptive** — describe *what* changed and *why*, not *who* made the change.

## Project Overview

**obsidian-tiddlywiki** is an Obsidian plugin (v1.1.0, desktop-only) that provides bidirectional import/export between Obsidian markdown vaults and TiddlyWiki JSON format. Users can export their entire vault as a TiddlyWiki-compatible JSON file and import TiddlyWiki JSON files back into Obsidian.

Plugin ID: `tiddlywiki-import-export`
Min Obsidian version: 0.15.0

## Repository Structure

```
src/
├── main.ts                          # Plugin entry point (registers the settings tab)
├── modules/
│   ├── plugin-core/
│   │   └── ObsidianTiddlyWikiPlugin.ts   # Settings tab UI with import/export buttons
│   ├── format-converters/           # Markdown <-> TiddlyWiki text conversion
│   │   ├── convertObsidianNoteToTiddler.ts
│   │   ├── convertTiddlersToObsidianNotes.ts
│   │   ├── convertObsidianNoteContentToTiddlerContent.ts
│   │   ├── convertTiddlerContentToObsidianNoteContent.ts
│   │   └── parseAndNormalizeTiddlyWikiTagList.ts
│   ├── obsidian/
│   │   ├── types/ObsidianNote.ts
│   │   └── utils/
│   │       ├── getAllObsidianNotesInDirectory.ts
│   │       ├── getMediaFilesInObsidianDirectory.ts
│   │       ├── splitTagsAndTextFromObsidianNote.ts
│   │       └── writeObsidianNotesToDirectory.ts
│   ├── tiddlywiki/
│   │   ├── types/Tiddler.ts
│   │   └── utils/convertBase64ObjectToTiddler.ts
│   └── file-manipulation/
│       ├── types/
│       │   ├── MediaFile.ts
│       │   └── Base64Object.ts
│       └── utils/
│           ├── convertBase64ToFileObject.ts
│           ├── convertMediaFileToBase64Object.ts
│           ├── getFileDates.ts
│           ├── getMimeTypeFromFilePath.ts
│           ├── readFileObjectToJSON.ts
│           ├── readFilePathToJSON.ts
│           ├── writeFileObjectToFilePath.ts
│           └── writeJSONToFilePath.ts
└── tests/
    └── samples/                     # Sample data for tests
```

Top-level config files: `package.json`, `tsconfig.json`, `jest.config.js`, `.eslintrc`, `.prettierrc`, `.editorconfig`, `esbuild.config.mjs`, `version-bump.mjs`, `manifest.json`

## Development Commands

```bash
npm install               # Install dependencies
cp .env.example .env      # Create env file, then set DEV_VAULT_PLUGIN_FOLDER
npm run dev               # Watch mode: compiles + copies to dev vault on change
npm run build             # Production build (tsc type-check + esbuild)
npm test                  # Run Jest tests
npm run version           # Bump version in manifest.json and versions.json
```

## Environment Setup

Development requires a `.env` file with:
```
DEV_VAULT_PLUGIN_FOLDER=/path/to/obsidian/dev-vault/.obsidian/plugins/tiddlywiki-import-export/
```

The build process (esbuild) copies `main.js` to this path automatically in dev mode. After the first copy, you must manually enable the plugin in Obsidian; subsequent hot-reloads require disabling/re-enabling in settings.

## Build System

**esbuild** (`esbuild.config.mjs`) bundles `src/main.ts` → `main.js` (CommonJS, ES2018 target). Obsidian API and CodeMirror modules are marked as external. Development mode adds inline sourcemaps and watch; production uses tree-shaking with no sourcemaps.

**TypeScript** (`tsconfig.json`): ES6 target, ESNext modules, strict null checks, no implicit any, inline source maps.

## Key Types

```typescript
// Tiddler (TiddlyWiki format)
type Tiddler = {
  title: string;
  text: string;
  tags?: string;
  created: string;   // TiddlyWiki date format: YYYYMMDDHHmmssSSS
  modified: string;
  type?: string;     // MIME type for media tiddlers
};

// ObsidianNote (Markdown format)
type ObsidianNote = {
  title: string;     // Filename without extension
  content: string;   // Full file content including front matter
};

// MediaFile (file metadata before encoding)
type MediaFile = {
  filePath: string;
  extension: string;
  mimeType: string;
  creationDate: Date;
  lastModifiedDate: Date;
};

// Base64Object (encoded media)
type Base64Object = {
  base64: string;
  extension: string;
  mimeType: string;
  fileName: string;
  creationDate: Date;
  lastModifiedDate: Date;
};
```

## Syntax Conversion Conventions

The format converters handle bidirectional translation between Obsidian markdown and TiddlyWiki wikitext:

| Markdown (Obsidian) | TiddlyWiki |
|---|---|
| `**bold**` | `''bold''` |
| `_italic_` | `//italic//` |
| `<u>underline</u>` | `__underline__` |
| `> blockquote` | `<<< blockquote <<<` |
| `- list item` | `* list item` |
| `1. ordered` | `# ordered` |
| `[[link]]` | `[[link\|target]]` |
| `![alt](img)` | `{{image}}` |
| `# Heading` | `! Heading` |

Nested lists use depth tracking; front matter YAML is preserved. Tags are normalized: spaces become underscores, special characters removed.

## Architecture Decisions

- **Modular by domain:** Code is split into `format-converters`, `obsidian`, `tiddlywiki`, and `file-manipulation` modules with clear single responsibilities. Avoid merging these concerns.
- **Parallel conversion functions:** Import and export logic are kept separate (not generalized) for readability and maintainability.
- **Media as base64 tiddlers:** Binary files are base64-encoded and stored as typed tiddlers, keeping everything in a single JSON export.
- **Recursive vault traversal:** Both import and export handle subdirectories recursively.
- **Front matter for metadata:** Tags and timestamps round-trip via YAML front matter in markdown files.

## Code Style

- **Formatter:** Prettier with single quotes and trailing commas (`all`). Run via ESLint integration.
- **Linter:** ESLint with `@typescript-eslint`, no unused vars (excluding function args), `@ts-ignore` allowed.
- **Indentation:** 2 spaces, LF line endings, UTF-8, final newline required (enforced by `.editorconfig`).
- **No implicit any:** TypeScript strict mode — always type function parameters explicitly.
- **Naming:** camelCase for variables/functions, PascalCase for types/classes/files containing them.

## Testing

Tests live in `src/tests/` using Jest with ts-jest. Sample data is in `src/tests/samples/`. Tests run in Node.js environment with isolated TypeScript modules.

When adding new conversion logic, add corresponding tests with sample input/output pairs in `src/tests/samples/`.

## Release Process

1. `npm run version` — bumps version in `package.json`, `manifest.json`, and `versions.json`
2. `npm run build` — final production build
3. Distribute `main.js` + `manifest.json` to users (copy to `.obsidian/plugins/tiddlywiki-import-export/`)

## Branch Naming

Use standard prefixes for all branches:

| Prefix | When to use |
|---|---|
| `feat/` | New features or capabilities |
| `fix/` | Bug fixes |
| `refactor/` | Code restructuring without behavior change |
| `chore/` | Maintenance, dependency updates, config changes |
| `docs/` | Documentation-only changes |
| `test/` | Test-only changes |

Examples: `feat/lexer-heading-tokens`, `fix/italic-regex-word-boundary`, `refactor/converter-pipeline`.

## What Not to Change

- `manifest.json` plugin ID (`tiddlywiki-import-export`) — changing this breaks existing installations
- The Obsidian API import paths (marked external in esbuild) — these are provided by Obsidian at runtime
- `versions.json` minimum version mappings — these control upgrade paths for existing users
