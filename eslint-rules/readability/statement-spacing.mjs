const declarationTypes = new Set([
  'VariableDeclaration',
  'TSTypeAliasDeclaration',
  'TSInterfaceDeclaration',
  'TSEnumDeclaration',
  'TSDeclareFunction',
]);

const blockTypes = new Set([
  'BlockStatement',
  'IfStatement',
  'ForStatement',
  'ForInStatement',
  'ForOfStatement',
  'WhileStatement',
  'DoWhileStatement',
  'SwitchStatement',
  'TryStatement',
  'WithStatement',
  'FunctionDeclaration',
  'ClassDeclaration',
  'TSModuleDeclaration',
]);

const abruptTypes = new Set([
  'ReturnStatement',
  'ThrowStatement',
  'ContinueStatement',
  'BreakStatement',
]);

function declarationOf(statement) {
  const exportedDeclaration =
    statement.type === 'ExportNamedDeclaration' ||
    statement.type === 'ExportDefaultDeclaration';

  return exportedDeclaration && statement.declaration
    ? statement.declaration
    : statement;
}

function isImport(statement) {
  const importDeclaration =
    statement.type === 'ImportDeclaration' ||
    statement.type === 'TSImportEqualsDeclaration';

  return importDeclaration;
}

function isBlock(statement) {
  if (statement.type === 'LabeledStatement') {
    return isBlock(statement.body);
  }

  return blockTypes.has(statement.type);
}

function needsPadding(previous, current) {
  const previousDeclaration = declarationOf(previous);
  const currentDeclaration = declarationOf(current);
  const previousImport = isImport(previousDeclaration);
  const currentImport = isImport(currentDeclaration);

  if (previousImport && currentImport) {
    return false;
  }

  if (previousImport || currentImport) {
    return true;
  }

  const previousMultiline = previous.loc.start.line !== previous.loc.end.line;
  const currentMultiline = current.loc.start.line !== current.loc.end.line;
  const previousVariable = declarationTypes.has(previousDeclaration.type);
  const currentVariable = declarationTypes.has(currentDeclaration.type);

  const singleLineDeclarations =
    previousVariable &&
    currentVariable &&
    !previousMultiline &&
    !currentMultiline;

  if (singleLineDeclarations) {
    return false;
  }

  const separatesStatementGroups =
    previousVariable ||
    currentVariable ||
    previousMultiline ||
    currentMultiline ||
    isBlock(previousDeclaration) ||
    isBlock(currentDeclaration) ||
    abruptTypes.has(currentDeclaration.type);

  return separatesStatementGroups;
}

function isNextLineDirective(comment) {
  return /(?:eslint-disable-next-line\b|@ts-(?:ignore|expect-error)\b)/.test(
    comment.value,
  );
}

const rule = {
  meta: {
    type: 'layout',
    docs: {
      description:
        'Separate statement groups, multiline statements, blocks and abrupt exits with a blank line.',
    },
    fixable: 'whitespace',
    schema: [],
    messages: {
      expectedBlankLine: 'Add a blank line between these statement groups.',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();
    const newline = /\r\n|\n|\r/.exec(sourceCode.text)?.[0] ?? '\n';

    function checkStatements(statements) {
      for (let index = 1; index < statements.length; index++) {
        const previous = statements[index - 1];
        const current = statements[index];

        if (!needsPadding(previous, current)) {
          continue;
        }

        const comments = sourceCode.getTokensBetween(previous, current, {
          includeComments: true,
        });

        const boundaryTokens = [previous, ...comments, current];

        const hasBlankLine = boundaryTokens.some((token, tokenIndex) => {
          const next = boundaryTokens[tokenIndex + 1];

          return next && next.loc.start.line - token.loc.end.line > 1;
        });

        if (hasBlankLine) {
          continue;
        }

        let trailing = previous;
        let leading = current;

        for (const comment of comments) {
          const belongsToPrevious =
            comment.loc.start.line === trailing.loc.end.line &&
            !isNextLineDirective(comment);

          if (!belongsToPrevious) {
            leading = comment;

            break;
          }

          trailing = comment;
        }

        const existingBreaks = leading.loc.start.line - trailing.loc.end.line;
        const padding = newline.repeat(Math.max(0, 2 - existingBreaks));

        context.report({
          node: current,
          messageId: 'expectedBlankLine',
          fix(fixer) {
            return fixer.insertTextAfterRange(trailing.range, padding);
          },
        });
      }
    }

    return {
      Program(node) {
        checkStatements(node.body);
      },
      BlockStatement(node) {
        checkStatements(node.body);
      },
      StaticBlock(node) {
        checkStatements(node.body);
      },
      TSModuleBlock(node) {
        checkStatements(node.body);
      },
      SwitchCase(node) {
        checkStatements(node.consequent);
      },
    };
  },
};

export default rule;
