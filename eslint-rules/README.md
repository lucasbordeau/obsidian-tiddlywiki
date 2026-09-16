# TypeScript conventions

Two local rules are adapted from the owner's `ts-app-helpers` repository,
revision `a26444e39923be74213c6124eecd51bd631d3c0e`. They are distributed with
this repository under its MIT license and have no private runtime dependency.

- `no-inline-promise-all-pipeline`: name filtered domain collections and promise
  arrays before passing them to `Promise.all`.
- `no-conditional-object-spread`: build typed payloads with explicit assignments.

The shared `no-compact-function-bodies` rule was added in both repositories:

- Nonempty function and nested block bodies put their contents on separate lines.
- Consecutive statements and switch-case statements use separate lines.
- Short expression arrows and empty bodies remain valid.
- Scoped `case` blocks may keep their opening brace on the case line.
- Autofixes insert line breaks while retaining comments, literal contents and CRLF.

The shared `statement-spacing` rule inserts blank lines between structural steps:
blocks, abrupt exits, declaration/operation boundaries and multiline statements.
It preserves existing line endings and keeps comments attached to their statements.
Consecutive imports and related single-line declarations can remain grouped.

The repository-specific import rules keep module boundaries consistent:

- `no-type-only-imports` requires regular imports for types and values and
  autofixes both declaration-level and inline type modifiers.
- `no-relative-source-imports` requires `@/` paths between modules under
  `src`, including tests, while leaving scripts outside the source tree alone.

Apply the [semantic spacing skill](../skills/semantic-code-spacing/SKILL.md) to
each edited file after autofixing. It identifies changes of purpose such as
preparing a field map and appending the completed tiddler, and keeps related
assignments and assertions together. Both the rule and the agent-neutral skill
are distributed in `ts-app-helpers`.

`npm run lint` registers all six rules with the existing TypeScript/Prettier rules
and requires braces around control flow. It covers source, tests, scripts, local
rules and top-level JavaScript configuration. Use `npm run lint -- --fix` to apply
fixes and `npm run test:lint` to check rule behavior.
Structural fixes run before a separate formatting pass to prevent competing brace
and formatter edits. A fatal parse error prevents writing that pass's fixes.
Framework-specific rules from the helper are outside this project's source model.
