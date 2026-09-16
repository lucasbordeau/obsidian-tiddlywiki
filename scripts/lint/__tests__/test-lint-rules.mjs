import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Linter } from 'eslint';
import vm from 'node:vm';
import { createEslint } from '../create-eslint.mjs';
import noCompactFunctionBodies from '../../../eslint-rules/no-compact-function-bodies.mjs';

const config = [
  {
    languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
    plugins: {
      local: {
        rules: { 'no-compact-function-bodies': noCompactFunctionBodies },
      },
    },
    rules: { 'local/no-compact-function-bodies': 'error' },
  },
];

describe('no-compact-function-bodies', () => {
  const compactFunctions = [
    'function value(){return 1;}',
    'const value = () => { return 1; };',
    'class Parser { read(){ return 1; } }',
    'const parser = { read(){return 1;} };',
    'async function value(){await run(); return 1;}',
    'function* value(){yield 1; yield 2;}',
    'function value(){\nconst first = 1; return first;\n}',
    'function value(){\nif (ready) { run(); finish(); }\n}',
    'function value(){\nswitch (kind) { case "a": return 1; default: return 2; }\n}',
    'function value(){/* explanation */ return 1;}',
  ];

  for (const source of compactFunctions) {
    it(`expands compact code without changing tokens: ${source}`, () => {
      const linter = new Linter({ configType: 'flat' });
      const messages = linter.verify(source, config);

      assert.ok(messages.some((message) => message.messageId === 'expandBody'));

      const fixed = linter.verifyAndFix(source, config);

      assert.deepEqual(fixed.messages, []);
      assert.equal(fixed.output.replace(/\s/g, ''), source.replace(/\s/g, ''));
      assert.ok(fixed.output.includes('\n'));
      assert.equal(linter.verifyAndFix(fixed.output, config).fixed, false);
    });
  }

  const readableFunctions = [
    'function value(kind) {\n  switch (kind) {\n    case "a": {\n      return 1;\n    }\n  }\n}',
    'const titles = notes.map(note => note.title);',
    'function empty() {}',
    'function value() {\n  return 1;\n}',
    'function value() {\n  const label = `first\nsecond`;\n  return label;\n}',
    'function value() {\n  // explanation\n  return 1;\n}',
    'function value() {\n  for (let index = 0; index < 3; index++) {\n    run(index);\n  }\n}',
  ];

  for (const source of readableFunctions) {
    it(`accepts readable code: ${source}`, () => {
      assert.deepEqual(
        new Linter({ configType: 'flat' }).verify(source, config),
        [],
      );
    });
  }

  it('retains CRLF when inserting line breaks', () => {
    const source =
      'function value() {\r\n  const first = 1; return first;\r\n}';

    const fixed = new Linter({ configType: 'flat' }).verifyAndFix(
      source,
      config,
    );

    assert.deepEqual(fixed.messages, []);
    assert.equal(fixed.output.replace(/\r\n/g, '').includes('\n'), false);
  });
});

describe('repository formatting integration', () => {
  const compactControlFlow = [
    'export function value(ready) { if (ready) return 1; else { return 2; } }',
    'export function value(ready) { if (ready) { return 1; } else if (!ready) return 2; }',
    'export function value(ready) { switch (ready) { case true: { return 1; } default: { return 2; } } }',
  ];

  for (const source of compactControlFlow) {
    it(`stages structural and formatter fixes without changing behavior: ${source}`, async () => {
      let fixedSource = source;
      const options = { filePath: 'src/lint-integration.ts' };

      for (const stage of ['structure', 'format']) {
        const reports = await createEslint(stage).lintText(
          fixedSource,
          options,
        );

        assert.equal(reports[0].fatalErrorCount, 0);
        fixedSource = reports[0].output ?? fixedSource;
      }

      const reports = await createEslint().lintText(fixedSource, options);

      assert.deepEqual(reports[0].messages, []);

      const value = vm.runInNewContext(
        `${fixedSource.replace('export ', '')}\nvalue;`,
      );

      assert.equal(value(true), 1);
      assert.equal(value(false), 2);

      const repeated = await createEslint('format').lintText(
        fixedSource,
        options,
      );

      assert.equal(repeated[0].output, undefined);
    });
  }
});
