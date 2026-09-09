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

`npm run lint` registers all three rules with the existing TypeScript/Prettier rules
and requires braces around control flow. It covers source, tests, scripts, local
rules and top-level JavaScript configuration. Use `npm run lint -- --fix` to apply
fixes and `npm run test:lint` to check rule behavior.
Structural fixes run before a separate formatting pass to prevent competing brace
and formatter edits. A fatal parse error prevents writing that pass's fixes.
Framework-specific rules from the helper are outside this project's source model.
