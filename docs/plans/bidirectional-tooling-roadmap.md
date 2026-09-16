# Bidirectional conversion and tooling roadmap

Planning snapshot: 2026-09-09. Baseline: `d98f7f0` on `master`. Exploration branch: `plan/bidirectional-conversion`.

This is a proposed implementation plan. This planning pass adds documentation; the converter replacement, CI, refactor, releases and extensions remain to be implemented.

## Direction

Build one portable TypeScript parsing and conversion core, consumed by the existing Obsidian plugin, a potential TiddlyWiki companion plugin, and a VS Code extension for `.tid` syntax highlighting and live preview.

The structural conversion requirement is supported. More precisely, the work includes lexical analysis, block and inline parsing, source preservation, metadata and reference mapping, and separate serializers for each dialect. This preserves the original goal of reliable two-way import/export.

Recommended sequence: establish executable tests and CI; protect import destinations; adopt the relevant `ts-apps-helper` conventions; validate parser and preservation choices with small prototypes; replace conversion; complete the open issues; release and advertise. Validate the additional consumers early so the core boundaries accommodate them. Ship their full features after the Obsidian conversion release is stable.

The user clarified that agent independence includes removing agent-specific development tooling. The VS Code extension is also part of the roadmap. Its proposed visualization is a rendered preview beside the `.tid` source.

## Verified baseline

| Observation                                                                    | Evidence and consequence                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Current community release is 1.1.0, desktop only, minimum Obsidian 0.15.0      | [Existing listing](https://community.obsidian.md/plugins/tiddlywiki-import-export). Preserve the plugin ID and existing upgrade mappings.                                                                                                     |
| Six open issues and no open PRs                                                | Complete GitHub issue/PR inventory checked on 2026-09-09; issue matrix below.                                                                                                                                                                 |
| Twelve paired syntax fixtures, with no executable tests                        | `src/testing/samples/obsidian/` and `src/testing/samples/tiddlywiki/`; `npm test -- --runInBand` exits 1 with “No tests found”. Validate expected fixture semantics before treating them as golden outputs.                                       |
| Type checking passes; a normal production build requires a personal vault path | `DEV_VAULT_PLUGIN_FOLDER= npm run build` passes its TypeScript stage, then exits 1 at `esbuild.config.mjs:19`. The copy plugin is configured in production too.                                                                               |
| Existing lint is relatively clean                                              | ESLint checked 24 TypeScript files: zero errors and four `no-explicit-any` warnings. There is no package lint script; ESLint should become an explicit development dependency.                                                                |
| Context is lost during conversion                                              | Direct probes reproduce corrupted code spans/fences, external links, images and nested lists. See examples below.                                                                                                                             |
| Import/export can lose identity and metadata                                   | Export retains basenames; note import strips path characters; link conversion uses a different substitution. Timestamps and arbitrary fields are discarded or replaced.                                                                       |
| Media writes lack destination containment                                      | An imported media title such as `../existing-note.md` survives `File.name` and resolves outside the import folder when joined to the destination. The write helper uses overwrite semantics. This was demonstrated without writing any files. |
| Agent-specific repository guidance is confined to `CLAUDE.md`                  | No tracked assistant hooks, assistant package dependencies, `.claude/`, `.codex/` or `.agents/` tooling was found. `.vscode/settings.json` is ordinary editor configuration.                                                                  |

Dependencies were installed from the existing lockfile with lifecycle scripts disabled for this inspection. The planning checks ran on Node 24.5.0. No host application or production bundle was validated during this pass.

Representative conversion failures, reproduced against the baseline functions:

| Direction     | Input                                   | Current result                            |
| ------------- | --------------------------------------- | ----------------------------------------- |
| Markdown → TW | `Hello #tag and C#`                     | `Hello ! tag and C#`                      |
| Markdown → TW | Inline code containing `**literal**`    | Its literal contents become `''literal''` |
| Markdown → TW | `![alt](image.png)`                     | `![[alt\|image.png]]`                     |
| TW → Markdown | `[[Example\|https://example.com/path]]` | `[[https___example.com_path\|Example]]`   |
| TW → Markdown | `** child`                              | `-- child`                                |
| TW → Markdown | `## child`                              | `1.1. child`                              |

Code locations: the two content converters in `src/modules/format-converters/`; `getAllObsidianNotesInDirectory.ts`; `writeObsidianNotesToDirectory.ts`; `convertObsidianNoteToTiddler.ts`; `convertTiddlersToObsidianNotes.ts`; media routing/writes in `ObsidianTiddlyWikiPlugin.ts`.

## Conversion contract

Define the acceptance contract before replacing the converters:

1. **Semantic preservation:** supported constructs retain text, hierarchy, formatting, link identity, attachment identity and metadata after conversion in either direction.
2. **Source preservation:** retain source ranges and raw text for unchanged constructs and dialect-specific regions. Verify exact restoration where the preservation record remains valid.
3. **Edit-aware round trips:** a user edit in the intermediate format must survive the next conversion. Original-source restoration must check document identity, preservation schema version and content fingerprints before applying old source.
4. **Visible conversion decisions:** return structured diagnostics with severity, code, document identity, source range and explanation for unsupported constructs, ambiguous references and conflicts.
5. **Deterministic output:** identical input and options produce identical content and destination mappings. Preserve original dates; obtain fallback filesystem dates through the host adapter with recorded provenance.
6. **Planned writes:** validate the complete import and construct its destination map before writing. Resolve collisions and outside-destination paths before execution. Await all writes and report partial failures accurately.

The lexical coverage target is TiddlyWiki 5 core syntax and Obsidian's documented Markdown dialect, pinned to tested versions. Every feature needs a declared outcome: native conversion, conversion with a documented representation, or preserved source with a diagnostic. Registered TiddlyWiki parser extensions need an extension boundary. When a document requires an unknown parser extension, retain its complete original body and report the missing support. Record the source syntax profile where available and retain original bodies in preservation metadata, since arbitrary extension syntax cannot always be detected from text alone. Dynamic widget/filter/macro execution is a distinct rendering feature whose dependencies belong in the host integration design.

### Feature matrix to turn into executable fixtures

| Feature group            | Acceptance for the conversion release                                                                                                                                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Text and literal regions | Unicode, escapes, line endings, paragraphs, inline code, fenced/indented code and delimiters inside literals are preserved correctly.                                                                                                             |
| Basic structure          | Headings with and without a space after TW markers; bold, italic, underline, strike/highlight; quotes; horizontal rules; ordered/unordered/mixed nested lists, continuation paragraphs and nesting transitions.                                   |
| Links and embeds         | Separate internal identity, label, external URI and fragment. Resolve paths, aliases, note embeds, image embeds, heading/block references and missing/ambiguous targets using one reference map. Preserve image sizing and alt text where mapped. |
| Extended document syntax | Tables, tasks, footnotes, callouts, comments and math each have tests and a declared conversion/preservation strategy. Do not infer expected semantics solely from existing fixture pairs.                                                        |
| TW-specific syntax       | Recognize core transclusions, widgets, filters, macros, pragmas, HTML and registered extensions. Preserve unsupported known regions with diagnostics; retain the complete original body for documents requiring unknown parser extensions.        |
| Properties               | Parse YAML structurally. Read legacy scalar and array tags; emit canonical arrays. Preserve custom front matter, TW fields, timestamps and original tag identity.                                                                                 |
| Containers               | TiddlyWiki JSON arrays and `.tid` header/body files, including the inline `text:` variant, missing optional fields and malformed input diagnostics.                                                                                               |
| Content types            | Exact dispatch for TW wikitext, Markdown, plain text, HTML, CSS, JSON, JavaScript, SVG and binary media. Preserve native Markdown bodies through the appropriate Markdown route.                                                                  |
| Files and identities     | Relative paths, duplicate basenames, case/Unicode collisions, reserved names, traversal attempts, attachment conflicts and links crossing a selected export boundary.                                                                             |

TiddlyWiki JSON uses string-valued fields; `.tid` has a field header separated from its body by a blank line. Runtime tiddler objects should be normalized at the adapter boundary. See [file formats](https://tiddlywiki.com/static/TiddlerFiles.html), [content types](https://tiddlywiki.com/static/ContentType.html), [dates](https://tiddlywiki.com/static/DateFormat.html) and [Obsidian syntax](https://obsidian.md/help/obsidian-flavored-markdown).

Recommended preservation format to prototype: a versioned, namespaced metadata record retaining original TW fields, title/tag mappings and dialect-specific fragments. Compare a front-matter representation with a companion manifest against portability, readability, file moves and user edits. Select one canonical representation after the preservation prototype; document how removing that record affects restoration. Tags normalized for Obsidian should keep a reversible mapping, including normalization collisions.

## Architecture and parser decisions

Use these logical boundaries first; extract workspace packages once the consumer prototype verifies their contracts. Keep the existing root manifest/release asset layout throughout migration.

| Boundary                       | Responsibility                                                                                                                    |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Container codecs               | Validate/read/write TW JSON, `.tid`, Obsidian front matter and content-type envelopes.                                            |
| Dialect parsers                | Produce tokens, source ranges, concrete syntax and recoverable errors for Markdown and TW.                                        |
| Document model                 | Represent shared semantics plus explicit dialect-specific/raw nodes and provenance.                                               |
| Direction-specific serializers | Emit Obsidian Markdown and TW wikitext with correct escaping and delimiter choice.                                                |
| Conversion planning            | Resolve document/asset identities, build destination/reference maps, select documents, accumulate diagnostics and propose writes. |
| Obsidian adapter               | Vault access, metadata resolution, user selection, previews, progress, cancellation and actual writes.                            |
| TiddlyWiki adapter             | Tiddler access, plugin packaging, import/export UI and browser/Node integration.                                                  |
| VS Code adapter                | Language registration, highlighting, diagnostics, preview and workspace document/resource access.                                 |

The portable core accepts strings, typed records and binary content abstractions. Host globals (`obsidian`, `vscode`, `$tw`, DOM, `File`, filesystem APIs) stay in adapters. Import and export remain separate readable functions. Keep filesystem path handling separate from tiddler titles and URLs.

Likely eventual layout: `packages/core/` for the shared engine, `apps/obsidian/`, `apps/tiddlywiki/`, and `apps/vscode/` for consumers, plus a shared fixture corpus. Start with ordinary npm workspaces if package extraction is justified; preserve the current lockfile/package-manager choice and use root scripts as the contributor interface.

### Three bounded prototypes

| Prototype                   | Compare or demonstrate                                                                                                                                                            | Exit evidence                                                                                                                                                                                                                         |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Parser selection            | `micromark`/MDAST plus Obsidian extensions; TW's official parser behind an adapter versus a source-preserving TW implementation. Also inspect `md-to-tid`.                        | Run the same corpus and ten baseline reproducers. Record coverage, source-range completeness, recovery on unfinished input, parse/render fidelity, bundle size and runtime dependencies. Choose with an architecture decision record. |
| Preservation and references | `.md → JSON → .md` and `.tid → .md → .tid`; custom fields, Unicode/spaced tags, dates, duplicate basenames, attachments and unsupported widgets; edit the intermediate documents. | Semantic stability, valid reference targets, unchanged-fragment restoration, edits retained and stable repeated conversions. Choose the metadata format.                                                                              |
| Three consumers             | Build one fixture through an Obsidian bundle, browser/headless TW module and VS Code development host.                                                                            | Same core result/diagnostics in each runtime; `.tid` range offsets valid; no host imports in the shared bundle; explicit packaging and preview decisions.                                                                             |

Timebox the prototypes to a few focused working days and return a decision record even when an option fails. Re-estimate the full parser effort from measured coverage and fixture gaps before committing to a release date.

The [TW parser](https://tiddlywiki.com/dev/static/Parser.html) and [rule modules](https://tiddlywiki.com/dev/static/WikiRuleModules.html) expose pragma/block/inline parsing and element/widget-oriented trees. Inspect how much source survives before using those trees as the sole document representation. [micromark](https://github.com/micromark/micromark) is a concrete-token Markdown implementation worth evaluating. [md-to-tid](https://github.com/tiddly-gittly/md-to-tid) already uses TypeScript and unified/MDAST; compare its metadata and footnote choices with this contract.

One fixture correction already identified: `06-links.md` contains the target `[[link in bold **context**]]`, while its paired TW file changes that target to `[[link in bold ''context'']]`. Preserve target identity when correcting this expected output.

## Import/export reliability

Before enabling the replacement engine, implement:

- Destination containment for note and attachment paths, including `..`, absolute paths, separators, symlinks and platform-specific cases. Treat every imported title as an identity to map to a path.
- Deterministic collision handling. Preview a rename, skip or user-selected replacement policy; never silently overwrite a colliding document or attachment.
- A single map used by output filenames and every generated link/embed, preserving folder-qualified identities.
- MIME-aware routing and input schema validation. An `application/json` tiddler is textual content; it must follow its content-type handler.
- Complete write planning, an isolated staging destination where practical, cancellation checkpoints, awaited writes and an operation report. Verify interruption and write-failure behavior in temporary vaults.
- Bounded work queues for larger vaults, progress reporting and cancellation. Establish benchmark budgets after measuring representative inputs.

Selected export should first include selected notes and their referenced local attachments, deduplicated. Keep links to omitted notes and warn with their identities. Offer dependency expansion later if needed; the latest owner comment on #11 already accepts selection plus warning.

## `ts-apps-helper` refactor and agent independence

The requested project is [lucasbordeau/ts-app-helpers](https://github.com/lucasbordeau/ts-app-helpers), whose package name is `ts-apps-helper`. The inspected local revision is `a26444e39923be74213c6124eecd51bd631d3c0e`; verified remote main is `60e98fa4ba0d1372dcd7d3a5b6ec5b2fddb746da`.

Use it as a development reference and deterministic refactoring/lint tool. The newer [portable lint runner](https://github.com/lucasbordeau/ts-app-helpers/blob/60e98fa4ba0d1372dcd7d3a5b6ec5b2fddb746da/scripts/lint-repository.mjs) can inspect another repository using the helper's own dependencies/configuration. Run a pinned snapshot to inventory refactors, then apply focused changes with the behavior corpus intact.

Adopt the applicable conventions:

- Domain-owned modules and independently importable, clearly named artifacts.
- Pure analysis/transformation planning separated from host orchestration.
- Named collections and promise lists, named complex predicates, reusable nullable-value guards and explicit payload assembly.
- Focused behavioral tests and narrow iterative validation, with the full gate at integration/release boundaries.
- Existing project formatting and readable direction-specific converter functions.

Select the relevant TypeScript rules from the helper's harness. Its current rule registry includes framework-specific rules; React, Jotai and NestJS conventions need scoping. Evaluate date handling against compact TW UTC timestamps and supported host runtimes before adding Temporal or a polyfill.

The helper is private and currently marked `UNLICENSED`. Choose the owner-controlled public distribution form for any selected rule implementations: a small in-repository rule subset with its dependencies/tests/provenance, or a separately published public harness. Public CI must install from this project's public lockfile without private helper access.

Move contributor workflow and architecture from `CLAUDE.md` to `CONTRIBUTING.md` and focused `docs/development/` documents. Add a short neutral `AGENTS.md` pointer if useful, then remove `CLAUDE.md`. Carry forward the project rules, including human-authored commit/PR presentation and the existing Git author configuration. Keep all workflows accessible through ordinary package scripts. Exclude the helper's Codex plugin, marketplace, generated skill mirrors and guide-sync tooling from adoption.

Acceptance: a fresh public clone can install, lint, test and build using documented commands with no assistant installation, private checkout, credentials or machine-specific path.

## CI and verification

CI should be an early implementation PR so it protects the parser work.

1. Fix build separation: production builds work without `.env`; copying into a dev vault is an explicit development-only option. Dispose the esbuild context cleanly.
2. Add explicit `lint`, `format:check`, `typecheck`, `test:unit`, `test:integration`, `build` and `check` scripts as their tests/configuration land. Resolve the four existing `any` warnings at the input/output boundaries. Pin tooling and the Obsidian API development version deliberately.
3. Add a real passing test harness before enabling the test gate. Characterize currently supported behavior and record known failures as named pending cases linked to the replacement work. Convert each pending case into a required passing test with its fix; all conversion-release regressions must be active before release. Keep zero-test runs failing.
4. Create `.github/workflows/ci.yml` for `pull_request`, pushes to `master`, and manual runs. Use `npm ci`, read-only repository permissions, concurrency cancellation and stable required check names. Pin maintained official actions to reviewed commit SHAs.
5. Use Node 24 for the primary build/test environment. Run parser tests on Linux and filesystem integration tests on Linux, Windows and macOS. Development Node and embedded application runtime compatibility are separate checks. [Node release status](https://nodejs.org/en/about/previous-releases).
6. Run lint/format/type checks, unit tests, integration tests and production build. Upload test reports and `main.js`/`manifest.json` artifacts. Fail on missing tests and unresolved release-critical fixtures. The runner follows the [GitHub Node CI model](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs).
7. Add headless TW parse/render comparisons and browser smoke tests when the core integration exists. Compare static semantic structures as well as emitted strings.
8. Add VS Code token tests and Extension Development Host smoke tests when that package lands. Verify `.vsix` packaging in CI. [Official test tooling](https://code.visualstudio.com/api/working-with-extensions/testing-extension).
9. Before release, exercise both import/export directions in actual Obsidian and TW with a disposable fixture vault/wiki. Pair visual checks with DOM/metadata/link assertions, including the Dataview tags case. Test the declared minimum host version or deliberately update the compatibility declaration with evidence.

Test categories: isolated syntax, nested combinations, literal preservation, semantic parse/emit stability, repeated round trips, edit-aware preservation, invalid containers, metadata/MIME, path collisions/containment, binary identity, partial failures and larger documents/vaults. Keep host integration tests distinct from pure core tests. Track compatibility by fixtures rather than relying on a line-coverage percentage.

Add release automation separately after CI is reliable. Validate package/manifest/tag agreement and upload Obsidian release assets (`main.js`, `manifest.json`, and `styles.css` if introduced). Preserve the current tag convention and all historical `versions.json` mappings. Publishing occurs as a later release action; the current plan creates no release or remote workflow. See [Obsidian release guidance](https://docs.obsidian.md/plugins/releasing/submit-plugin).

## Every open issue mapped to completion

| Issue                                                                                      | Work package                        | Acceptance                                                                                                                                   |
| ------------------------------------------------------------------------------------------ | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| [#23 Nested bullets](https://github.com/lucasbordeau/obsidian-tiddlywiki/issues/23)        | Structured lists and serializer     | Reporter fixture renders the right hierarchy; ordered/mixed lists, sibling transitions and reverse conversion pass.                          |
| [#22 Tags and Dataview](https://github.com/lucasbordeau/obsidian-tiddlywiki/issues/22)     | Metadata codec                      | Emit YAML arrays even for one tag; read legacy scalars/arrays; test empty, quoted, spaced and Unicode tags; verify a Dataview query.         |
| [#21 Heading conversion](https://github.com/lucasbordeau/obsidian-tiddlywiki/issues/21)    | Heading parser                      | `!Header` and `! Header` produce `# Header`; all supported levels and literal regions pass through actual JSON import.                       |
| [#11 Selected folders](https://github.com/lucasbordeau/obsidian-tiddlywiki/issues/11)      | Selection/reference planning and UI | Recursive folder/file selection, deduplication, attachment scope, empty selection and omitted-target warnings work. Preserve outgoing links. |
| [#12 README demonstrations](https://github.com/lucasbordeau/obsidian-tiddlywiki/issues/12) | Release documentation               | Short GIFs/demos of both directions, equivalent written steps, install instructions, downloadable fixture and compatibility table.           |
| [#19 Relevant websites](https://github.com/lucasbordeau/obsidian-tiddlywiki/issues/19)     | Outreach dossier                    | Dated venue/need inventory, posting rules, tailored drafts, release prerequisites and an outcome log. Publication is a later action.         |

For #11, the [latest owner comment](https://github.com/lucasbordeau/obsidian-tiddlywiki/issues/11#issuecomment-2558624892) accepts selection with a warning as a first delivery. Automatic recursive note dependency export can follow. Parser/metadata issue fixes belong in their corresponding implementation work; they need regression tests and release verification before closure.

## VS Code `.tid` extension

Deliver a usable language extension with syntax highlighting and a rendered live preview. Treat `.tid` as a container: highlight fields in its header, then dispatch body syntax using its `type` field. Include `.meta` field files where the same header grammar applies.

### First release

- File/language association, theme-compatible scopes, comments/bracket configuration and basic folding.
- TextMate grammar for immediate highlighting of fields, wikitext structures, links, code, widgets and literal regions. Consider grammar reuse from [TiddlyWiki5 Syntax](https://marketplace.visualstudio.com/items?itemName=joshua-fontany.tw5-syntax); inspect source, license, coverage and coexistence before selecting reuse or an independent grammar.
- A “Preview Tiddler” command opening a side-by-side webview, updating from the unsaved editor buffer with debounce/cancellation. Display title/properties, links, images and supported static content.
- Shared parser diagnostics and exact source ranges, including incomplete `.tid` headers/bodies. Add semantic tokens where parser knowledge improves the grammar.
- Static preview through the shared model with visible placeholders/diagnostics for unsupported dynamic constructs. Prototype an optional pinned TW renderer for higher fidelity; select the approach based on rendering tests. Preview behavior for tiddlers needing wiki context must be explicit.
- Workspace-scoped link/image resolution, restricted local resources, sanitized rendered content and a restrictive webview content policy. Do not execute arbitrary workspace plugin JavaScript. Test behavior in Restricted Mode and normal workspaces.

VS Code's immediate syntax highlighting uses [TextMate grammars](https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide); [semantic tokens](https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide) add parser-derived information. These are complementary adapters around the shared syntax contract.

Preview is a rendering consumer of the parsed document. Use the [webview API](https://code.visualstudio.com/api/extension-guides/webview) and [Workspace Trust model](https://code.visualstudio.com/api/extension-guides/workspace-trust) for its host boundary. A standalone `.tid` containing transclusions may need a workspace tiddler index; unresolved dependencies should appear in the preview report.

Acceptance: token scopes/ranges tested on valid and unfinished input; live preview reflects unsaved edits; fixture links and images resolve; document switching and disposal work; source highlights match the preview's diagnostics; light/dark themes and keyboard use verified. Test the packaged `.vsix` in a fresh profile. Publish to the [VS Code Marketplace](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) through a later release workflow. A language server can be added if cross-editor demand justifies it.

## TiddlyWiki companion plugin

Feasibility is supported by TW's browser/Node module system, [plugin folders](https://tiddlywiki.com/static/PluginFolders.html), [plugin mechanism](https://tiddlywiki.com/static/PluginMechanism.html), deserializers and [custom exporters](https://tiddlywiki.com/static/Creating%2520a%2520custom%2520export%2520format.html).

Proposed MVP: import selected Markdown files or a vault archive into tiddlers, preview mappings and diagnostics, and export selected tiddlers as a Markdown archive with attachments and preservation metadata. Browser file/archive plumbing and TiddlyWiki UI belong in this adapter. Reuse the core's identity map and conversion results. Preserve native Markdown tiddlers through MIME-aware routing.

Deliver a plugin artifact with stable title/version/minimum TW version, an installable demo wiki, and browser plus Node save/reload tests. Test archive path validation and attachment behavior in both environments. TW already has an [official Markdown renderer](https://tiddlywiki.com/plugins/tiddlywiki/markdown/); this companion's purpose is Obsidian-aware interchange and round-trip preservation.

Proceed after the consumer prototype proves shared-core reuse with thin adapters. If a packaging/runtime problem remains, record that specific blocker while continuing the Obsidian release. Investigate `md-to-tid`, the existing [Obsidian-vault importer](https://talk.tiddlywiki.org/t/import-obsidian-or-markdown-vault-in-tiddlywiki5/8217), and the [Markdown exporter](https://talk.tiddlywiki.org/t/first-version-of-markdown-export-plugin/3324?page=2) before duplicating useful infrastructure.

Distribution: a project demo/plugin library, then [TiddlyWiki CPL](https://github.com/tiddly-gittly/TiddlyWiki-CPL) and the [Community Plugins listing](https://tiddlywiki.com/static/Community%2520Plugins.html). The official library contains plugins in the main TW repository; community distribution is the practical independent route.

## Delivery sequence and gates

Each work package can contain several focused PRs. Keep refactoring-only moves separate from behavior changes where practical.

| Order | Work package                                             | Dependency / completion gate                                                                           |
| ----- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 1     | Executable baseline, production build separation and CI  | Fresh clone validates; CI runs real tests and produces an installable bundle.                          |
| 2     | Containment, collision handling and MIME boundaries      | Import regression tests cover outside-destination titles, existing files and content types.            |
| 3     | Helper-guided refactor and contributor documentation     | Baseline behavior retained; neutral scripts/guidance; no private dependency in public CI.              |
| 4     | Parser, preservation and consumer prototypes             | Recorded choices, tested scope matrix, package/API boundaries and revised effort estimate.             |
| 5     | Lexers/parsers, semantic model and serializers           | Grammar/literal/nesting fixtures pass; #21 and #23 acceptance covered.                                 |
| 6     | Metadata, identities, assets and edit-aware preservation | Both round trips stable; #22 verified; references and dates retained.                                  |
| 7     | Obsidian integration and selected export                 | #11 verified; preview/progress/cancellation and import/export host checks pass.                        |
| 8     | Release candidate, compatibility docs and demonstrations | #12 complete; every defect disposition checked; no release-critical pending tests.                     |
| 9     | Obsidian release and targeted outreach                   | Release artifacts/install verified; execute the outreach dossier when posting is authorized.           |
| 10    | VS Code extension                                        | Grammar work can start after package 4; preview release depends on stable parsing/rendering contracts. |
| 11    | TiddlyWiki companion beta and distribution               | Consumer prototype passes; core release stable; browser/Node and archive tests pass.                   |

The dossier for #19 can be prepared in parallel with development. Recheck venues and help threads at release time. The optional companion is an independent delivery gate, so Obsidian fixes can ship as soon as their own criteria pass.

## Outreach dossier

Prepare one canonical announcement per community plus tailored replies to relevant help requests. Lead with the user's migration problem, a tested sequence of steps and a small before/after example. Disclose maintainership. Attach the installation link, exact supported use case and release version.

| Priority | Venue                                                                                          | Proposed action and prerequisite                                                                                                                                         |
| -------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1        | [Obsidian Share & showcase](https://forum.obsidian.md/c/share-showcase/9), Plugins subcategory | Publish the tested Obsidian release with both conversion demos and a compatibility table.                                                                                |
| 1        | Obsidian Discord `#updates`                                                                    | One release announcement; developer role required, per [official release guidance](https://docs.obsidian.md/plugins/releasing/submit-plugin).                            |
| 2        | Specific migration/help threads                                                                | Recheck the request and confirm its exact case passes before drafting a solution.                                                                                        |
| 2        | [Talk TW Plugins](https://talk.tiddlywiki.org/c/plugins/7)                                     | Introduce interoperable transfer with actual examples; present the TW companion when a browser-installable beta exists. Use Developers for an earlier parser discussion. |
| 3        | [CPL](https://github.com/tiddly-gittly/TiddlyWiki-CPL) and TW Community Plugins                | Submit the tested TW plugin artifact and maintained demo/library metadata.                                                                                               |
| 3        | VS Code Marketplace                                                                            | Publish the packaged editor extension with `.tid` highlighting/preview demonstrations.                                                                                   |
| 4        | PKM newsletters, Reddit, personal blog and social accounts                                     | Expand after initial feedback; verify each venue's current submission rules while preparing its post.                                                                    |

The [Obsidian](https://forum.obsidian.md/guidelines) and [Talk TW](https://talk.tiddlywiki.org/guidelines) guidelines prohibit spam and disruptive cross-posting. Talk TW's Marketplace category concerns commercial products/services; Plugins fits this project.

### Verified threads to revisit

These are dated interest signals. The search found no directly relevant help request from the preceding 30 days.

| Thread                                                                                                                                           | Dated evidence                                                                                    | Useful response when ready                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [TW Markdown exporter discussion](https://talk.tiddlywiki.org/t/first-version-of-markdown-export-plugin/3324?page=2)                             | Native `text/x-markdown` content corruption reported 2026-02-11; discussion continued 2026-05-22. | Demonstrate MIME-aware conversion on the exact reproducer, with a link to the test and supported workflow. |
| [TW POSSE publishing](https://talk.tiddlywiki.org/t/posse-style-publishing-from-tiddlywiki-to-multiple-sources-hugo-mastodon-linkedin-etc/15290) | Markdown intermediary/pipeline discussion 2026-05-12–21.                                          | Relevant when the reusable core or an export API is available.                                             |
| [Import TW5 into Obsidian](https://forum.obsidian.md/t/import-from-tiddlywiki-5-to-obsidian/731?page=2)                                          | A user described an old manual workflow on 2025-03-17.                                            | A concrete current migration guide can help future readers; recheck whether a reply remains useful.        |
| [Import an Obsidian/Markdown vault into TW](https://talk.tiddlywiki.org/t/import-obsidian-or-markdown-vault-in-tiddlywiki5/8217)                 | Existing Node/TidGi importer introduced 2023-10-14.                                               | Compare implementation and scope, then discuss shared interoperability work if appropriate.                |
| [Obsidian/TW comparison](https://talk.tiddlywiki.org/t/add-some-pro-con-in-obsidian-vs-tiddlywiki-compare-site/6310?page=2)                      | Markdown-folder migration, paths and metadata discussed 2023-03-06–09.                            | Historical requirements/beta-audience evidence; avoid treating it as a fresh support request.              |

Draft a tailored reply only after checking the released build against the relevant case. Track URL, last check, unresolved need, required features, draft, publication date and follow-up outcome. Measure successful migrations and new reproducible cases, with download trends as supporting feedback. No messages or promotional posts were sent during this planning pass.

## Next implementation slice

Start with work package 1: the executable baseline, build isolation and GitHub CI. Its output should be a small reviewable PR containing validated fixture tests, an environment-independent production build, documented scripts and a passing workflow. Then address the destination/MIME boundary while the parser prototypes establish the larger replacement design.
