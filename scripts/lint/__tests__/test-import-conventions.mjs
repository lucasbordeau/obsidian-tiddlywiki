import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Linter } from 'eslint';
import tsParser from '@typescript-eslint/parser';
import noRelativeSourceImports from '../../../eslint-rules/no-relative-source-imports.mjs';
import noTypeOnlyImports from '../../../eslint-rules/no-type-only-imports.mjs';

const config = [
  {
    files: ['**/*.{js,mjs,ts}'],
    languageOptions: {
      ecmaVersion: 2022,
      parser: tsParser,
      sourceType: 'module',
    },
    plugins: {
      local: {
        rules: {
          'no-relative-source-imports': noRelativeSourceImports,
          'no-type-only-imports': noTypeOnlyImports,
        },
      },
    },
    rules: {
      'local/no-relative-source-imports': 'error',
      'local/no-type-only-imports': 'error',
    },
  },
];

describe('import conventions', () => {
  it('replaces a type-only declaration with a regular import', () => {
    const source = "import type { Note } from '@/model/Note';";
    const linter = new Linter({ configType: 'flat' });

    const fixed = linter.verifyAndFix(source, config, {
      filename: 'src/example.ts',
    });

    assert.deepEqual(fixed.messages, []);
    assert.equal(fixed.output, "import { Note } from '@/model/Note';");
  });

  it('replaces an inline type modifier with a regular import', () => {
    const source = "import { type Note, parse } from '@/model/Note';";
    const linter = new Linter({ configType: 'flat' });

    const fixed = linter.verifyAndFix(source, config, {
      filename: 'src/example.ts',
    });

    assert.deepEqual(fixed.messages, []);
    assert.equal(fixed.output, "import { Note, parse } from '@/model/Note';");
  });

  it('replaces a type-only import assignment with a regular import', () => {
    const source = "import type Note = require('@/model/Note');";
    const linter = new Linter({ configType: 'flat' });

    const fixed = linter.verifyAndFix(source, config, {
      filename: 'src/example.ts',
    });

    assert.deepEqual(fixed.messages, []);
    assert.equal(fixed.output, "import Note = require('@/model/Note');");
  });

  it('preserves comments around removed type modifiers', () => {
    const source = [
      "import /* declaration */ type { Note } from '@/model/Note';",
      "import { type /* inline */ Parser } from '@/model/Parser';",
    ].join('\n');

    const linter = new Linter({ configType: 'flat' });

    const fixed = linter.verifyAndFix(source, config, {
      filename: 'src/example.ts',
    });

    assert.deepEqual(fixed.messages, []);
    assert.match(fixed.output, /\/\* declaration \*\//);
    assert.match(fixed.output, /\/\* inline \*\//);
    assert.doesNotMatch(fixed.output, /\btype\b/);
  });

  it('rejects module paths that bypass the source alias', () => {
    const source = [
      "import { Note } from '../model/Note';",
      "export { parse } from './parse';",
      "const lazy = import('./lazy');",
      "type Lazy = import('./lazy').Lazy;",
      "import Parser = require('./Parser');",
      "const codec = require('./codec');",
      "import { legacy } from 'src/legacy';",
    ].join('\n');

    const messages = new Linter({ configType: 'flat' }).verify(source, config, {
      filename: 'src/example.ts',
    });

    assert.deepEqual(
      messages.map((message) => message.ruleId),
      [
        'local/no-relative-source-imports',
        'local/no-relative-source-imports',
        'local/no-relative-source-imports',
        'local/no-relative-source-imports',
        'local/no-relative-source-imports',
        'local/no-relative-source-imports',
        'local/no-relative-source-imports',
      ],
    );
  });

  it('accepts source aliases and relative imports in repository scripts', () => {
    const linter = new Linter({ configType: 'flat' });
    const sourceImport = "import { Note } from '@/model/Note';";
    const scriptImport = "import { run } from './run.mjs';";

    assert.deepEqual(
      linter.verify(sourceImport, config, { filename: 'src/example.ts' }),
      [],
    );

    assert.deepEqual(
      linter.verify(scriptImport, config, { filename: 'scripts/example.mjs' }),
      [],
    );
  });
});
