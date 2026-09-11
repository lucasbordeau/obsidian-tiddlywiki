import { separatedStatements } from './cases/separated-statements.mjs';
import { acceptedStatements } from './cases/accepted-statements.mjs';
import { controlFlowSources } from './cases/control-flow-sources.mjs';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Linter } from 'eslint';
import { format } from 'prettier';
import vm from 'node:vm';
import tsParser from '@typescript-eslint/parser';
import ts from 'typescript';
import statementSpacing from '../../../eslint-rules/statement-spacing.mjs';
import noCompactFunctionBodies from '../../../eslint-rules/no-compact-function-bodies.mjs';

const config = [
  {
    linterOptions: { reportUnusedDisableDirectives: false },
    languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
    plugins: { local: { rules: { 'statement-spacing': statementSpacing } } },
    rules: { 'local/statement-spacing': 'error' },
  },
];

describe('statement-spacing', () => {
  for (const [name, source, expected] of separatedStatements) {
    it(`separates ${name} without changing tokens`, () => {
      const linter = new Linter({ configType: 'flat' });
      const fixed = linter.verifyAndFix(source, config);

      assert.equal(fixed.output, expected);
      assert.deepEqual(fixed.messages, []);
      assert.equal(fixed.output.replace(/\s/g, ''), source.replace(/\s/g, ''));
      assert.equal(linter.verifyAndFix(fixed.output, config).fixed, false);
    });
  }

  for (const source of acceptedStatements) {
    it(`retains valid spacing: ${source}`, () => {
      assert.deepEqual(
        new Linter({ configType: 'flat' }).verify(source, config),
        [],
      );
    });
  }

  it('preserves eslint next-line suppression after fixing', () => {
    const source =
      'const value = 1; // eslint-disable-next-line no-console\nconsole.log(value);';

    const withConsole = [...config, { rules: { 'no-console': 'error' } }];

    const fixed = new Linter({ configType: 'flat' }).verifyAndFix(
      source,
      withConsole,
    );

    assert.deepEqual(fixed.messages, []);

    assert.match(
      fixed.output,
      /eslint-disable-next-line no-console\nconsole\.log/,
    );
  });

  it('applies declaration grouping to TypeScript without editing type members', () => {
    const source =
      'type Note = {title: string};\ntype Id = string;\ninterface Container {\nvalue: Note;\n}\ndeclare namespace Notes {\nconst value: Note;\nfunction read(): Note;\n}';

    const withTypeScript = [
      ...config,
      { languageOptions: { parser: tsParser } },
    ];

    const fixed = new Linter({ configType: 'flat' }).verifyAndFix(
      source,
      withTypeScript,
    );

    assert.deepEqual(fixed.messages, []);
    assert.match(fixed.output, /type Note[^\n]+\ntype Id[^\n]+\n\ninterface/);
    assert.match(fixed.output, /value: Note;\n}/);

    assert.equal(
      new Linter({ configType: 'flat' }).verifyAndFix(
        fixed.output,
        withTypeScript,
      ).fixed,
      false,
    );
  });

  it('keeps TypeScript suppression attached to the checked statement', () => {
    const source =
      'function value(): string {\nconst first = 1;\n// @ts-expect-error intentional return mismatch\nreturn first;\n}';

    const withTypeScript = [
      ...config,
      { languageOptions: { parser: tsParser } },
    ];

    const fixed = new Linter({ configType: 'flat' }).verifyAndFix(
      source,
      withTypeScript,
    );

    const sourceFile = ts.createSourceFile(
      'sample.ts',
      fixed.output,
      ts.ScriptTarget.Latest,
      true,
    );

    const options = { noLib: true, noEmit: true, strict: true };
    const host = ts.createCompilerHost(options);

    host.getSourceFile = (filename) =>
      filename === 'sample.ts' ? sourceFile : undefined;

    const program = ts.createProgram(['sample.ts'], options, host);

    assert.deepEqual(program.getSemanticDiagnostics(sourceFile), []);

    assert.match(
      fixed.output,
      /@ts-expect-error intentional return mismatch\nreturn first;/,
    );
  });

  it('preserves automatic semicolon insertion at a return boundary', () => {
    const source = 'function value(){const first=1;return\nfirst;}';

    const fixed = new Linter({ configType: 'flat' }).verifyAndFix(
      source,
      config,
    );

    const before = vm.runInNewContext(`${source}\nvalue();`);
    const after = vm.runInNewContext(`${fixed.output}\nvalue();`);

    assert.deepEqual(fixed.messages, []);
    assert.equal(after, before);
    assert.equal(after, undefined);
  });
});

describe('combined readability and formatter integration', () => {
  for (const source of controlFlowSources) {
    it(`retains behavior and reaches an idempotent layout: ${source}`, async () => {
      const combined = [
        ...config,
        {
          plugins: {
            bodies: {
              rules: { 'no-compact-function-bodies': noCompactFunctionBodies },
            },
          },
          rules: {
            curly: ['error', 'all'],
            'bodies/no-compact-function-bodies': 'error',
          },
        },
      ];

      const linter = new Linter({ configType: 'flat' });
      const structured = linter.verifyAndFix(source, combined);

      assert.deepEqual(structured.messages, []);

      const formatted = await format(structured.output, { parser: 'babel' });

      assert.deepEqual(linter.verify(formatted, combined), []);
      assert.equal(linter.verifyAndFix(formatted, combined).fixed, false);
      assert.equal(await format(formatted, { parser: 'babel' }), formatted);

      const value = vm.runInNewContext(`${formatted}\nvalue;`);

      assert.equal(value(true), 1);
      assert.equal(value(false), 2);
    });
  }
});
