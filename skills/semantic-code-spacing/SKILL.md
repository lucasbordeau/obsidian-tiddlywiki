---
name: semantic-code-spacing
description: Apply meaningful blank-line grouping when creating, editing, or reformatting JavaScript and TypeScript files. Use after structural lint fixes to separate preparation, decisions, state changes, and final actions while keeping cohesive statements together.
---

# Semantic code spacing

Format code as a sequence of meaningful steps. A blank line marks a change of
purpose or level of abstraction. It is not a quota per statement or a substitute
for clear naming and small functions.

## Apply to each file

1. Identify the requested files. Exclude generated output, vendored code, and
   syntax fixtures. For a repository-wide pass, enumerate every maintained source,
   test, and tooling file; record which were inspected, changed, or already clear.
2. Run the repository's structural spacing autofixes when available. Respect its
   fixer ordering and formatter. Treat the linter as a structural baseline.
3. Read each function and callback in full. Identify setup, validation, derivation,
   object preparation, state updates, publication or IO, and the final result.
   Add one blank line where the reader moves between these steps.
4. Keep a cohesive group together: related declarations, assignments building the
   same object, paired cursor updates, or assertions about the same result.
   Separate the prepared object from the action that publishes, appends, saves,
   sends, or returns it. Consider meaning in context; method names alone do not
   establish a boundary.
5. In tests, distinguish setup, execution, and assertions. Group assertions about
   the same behavior; separate a new edit, conversion cycle, or assertion subject.
   In dispatchers, keep each branch readable without blank lines inside a single
   expression or between every argument, property, import, or type member.
6. Run the formatter and relevant lint checks again. Confirm the semantic spacing
   survives and that formatting is stable on a second pass. For a broad formatting
   change, compare parsed tokens and comments to the pre-edit files so string,
   template, regex, and fixture contents remain exact. Run the relevant existing
   tests; do not invent behavioral tests for blank lines.

When changing spacing, preserve statement order, literals, comments, directives,
and behavior. Keep `eslint-disable-next-line`, `@ts-expect-error`, JSDoc, and
similar comments attached to the declaration or instruction they describe. Do not
split `else`, `catch`, or `finally` from their construct, or change automatic
semicolon insertion. An unchanged file can be the right result after inspection.

## Preparation and publication

```ts
const fields = Object.fromEntries(Object.entries(candidate));

fields.text = fields.text ?? '';

tiddlers.push(fields);
```

Constructing the field map, normalizing its body, and appending the completed
tiddler are distinct steps. Several assignments that jointly populate one object
may stay together before a single blank line preceding publication.

```ts
const expectedStart = opening + delimiter.length;
const expectedEnd = closing;

expect(token.start).toBe(expectedStart);
expect(token.end).toBe(expectedEnd);
```

These paired bounds form one setup group and one assertion group. Preserve that
relationship instead of inserting a blank line between every statement.
