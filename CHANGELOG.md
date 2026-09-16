# Changelog

Changes to the Obsidian plugin are recorded here. The **Unreleased** section
describes work toward the next version; its contents may change before release.
Dates below are the published release dates in UTC.

## Unreleased

## [2.0.0] - Pending release

### Breaking changes

- The minimum supported Obsidian desktop version is now 1.13.7.
- Import and export move from the plugin settings tab to command palette
  actions; the settings buttons are removed.
- Import omits unsupported dynamic WikiText from generated Markdown notes;
  previous versions left that source visible as text.

### Added

- A portable bidirectional conversion engine for common TiddlyWiki WikiText and
  Obsidian Markdown syntax, with diagnostics for unsupported constructs.
- Command palette actions to import and export.
- A self-contained TiddlyWiki demo file.
- Isolated Obsidian development workflow with hot reload.

### Changed

- Convert static formatting, lists, tables, links, callouts, and whole-note
  transclusions with more structured handling of nested and literal content.
- Import TiddlyWiki tags and authored fields into Obsidian properties, apply
  valid timestamps to Markdown file metadata, and omit TiddlyWiki-only
  operational fields.
- Carry local media attachments and retain external media references in the
  JSON workflow, including URL-backed audio and video players on import.

### Migration

- Run import and export from Obsidian's command palette. The settings-tab
  buttons from earlier versions are gone.
- Keep the original TiddlyWiki JSON when importing a wiki with dynamic
  WikiText, because unsupported dynamic source is omitted from Markdown notes.

## [1.1.0] - 2024-12-23

- Added media file handling for import and export.
- Fixed external link conversion and normalized tags in Obsidian notes.
- Refactored note, tiddler, and file conversion.

## [1.0.3] - 2023-03-04

- Declared the plugin desktop-only.
- Replaced the export success alert with an Obsidian notice.

## [1.0.2] - 2023-03-01

- Corrected publication metadata and added the MIT license.

## [1.0.1] - 2023-02-28

- Introduced TiddlyWiki JSON import into Obsidian and Obsidian export to
  TiddlyWiki JSON.

[2.0.0]: https://github.com/lucasbordeau/obsidian-tiddlywiki/releases/tag/2.0.0
[1.1.0]: https://github.com/lucasbordeau/obsidian-tiddlywiki/releases/tag/1.1.0
[1.0.3]: https://github.com/lucasbordeau/obsidian-tiddlywiki/releases/tag/1.0.3
[1.0.2]: https://github.com/lucasbordeau/obsidian-tiddlywiki/releases/tag/1.0.2
[1.0.1]: https://github.com/lucasbordeau/obsidian-tiddlywiki/releases/tag/1.0.1
