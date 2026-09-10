# Repository guidance

Follow [CONTRIBUTING.md](./CONTRIBUTING.md) for architecture, code style, validation
and release conventions. It is the shared source of contributor instructions.

For conversion changes, consult the [engine contract](./docs/development/conversion/architecture.md)
and linked feature inventories. Add explicit behavior assertions and preserve
unsupported syntax with diagnostics.

When creating or editing JavaScript and TypeScript files, apply
[semantic code spacing](./skills/semantic-code-spacing/SKILL.md) to each changed
file after structural lint fixes. Separate meaningful steps with blank lines.
