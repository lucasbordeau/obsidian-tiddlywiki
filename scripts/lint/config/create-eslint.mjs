import { ESLint } from 'eslint';
import noConditionalObjectSpread from '../../../eslint-rules/payloads/no-conditional-object-spread.mjs';
import noInlinePromiseAllPipeline from '../../../eslint-rules/collections/no-inline-promise-all-pipeline.mjs';
import noCompactFunctionBodies from '../../../eslint-rules/readability/no-compact-function-bodies.mjs';
import statementSpacing from '../../../eslint-rules/readability/statement-spacing.mjs';

export function createEslint(fixStage) {
  const fixStructure = fixStage === 'structure';

  const fix =
    fixStage === 'format'
      ? (diagnostic) => diagnostic.ruleId === 'prettier/prettier'
      : fixStructure;

  return new ESLint({
    fix,
    plugins: {
      local: {
        rules: {
          'no-conditional-object-spread': noConditionalObjectSpread,
          'no-inline-promise-all-pipeline': noInlinePromiseAllPipeline,
          'no-compact-function-bodies': noCompactFunctionBodies,
          'statement-spacing': statementSpacing,
        },
      },
    },
    overrideConfig: {
      plugins: ['local'],
      rules: {
        'local/no-conditional-object-spread': 'error',
        'local/no-inline-promise-all-pipeline': 'error',
        'local/no-compact-function-bodies': 'error',
        'local/statement-spacing': 'error',
        'prettier/prettier': fixStructure ? 'off' : 'error',
        curly: ['error', 'all'],
      },
    },
  });
}
