const functionTypes = new Set([
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression',
]);

function isInsideFunction(node) {
  let ancestor = node.parent;

  while (ancestor) {
    if (functionTypes.has(ancestor.type)) {
      return true;
    }

    ancestor = ancestor.parent;
  }

  return false;
}

const rule = {
  meta: {
    type: 'layout',
    docs: {
      description:
        'Keep function bodies, nested blocks and sequential statements on separate lines.',
    },
    fixable: 'whitespace',
    schema: [],
    messages: {
      expandBody:
        'Expand this function body or control-flow block onto separate lines.',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();
    const newline = sourceCode.text.includes('\r\n') ? '\r\n' : '\n';

    function reportBreaks(node, positions) {
      const uniquePositions = [...new Set(positions)].sort(
        (first, second) => first - second,
      );

      if (uniquePositions.length === 0) {
        return;
      }

      context.report({
        node,
        messageId: 'expandBody',
        fix(fixer) {
          return uniquePositions.map((position) =>
            fixer.insertTextBeforeRange([position, position], newline),
          );
        },
      });
    }

    function findStatementBreaks(statements) {
      const positions = [];

      for (let index = 1; index < statements.length; index++) {
        const previous = statements[index - 1];
        const current = statements[index];

        if (previous.loc.end.line === current.loc.start.line) {
          positions.push(current.range[0]);
        }
      }

      return positions;
    }

    return {
      BlockStatement(node) {
        if (!isInsideFunction(node)) {
          return;
        }

        const opening = sourceCode.getFirstToken(node);
        const closing = sourceCode.getLastToken(node);

        const firstContent = sourceCode.getTokenAfter(opening, {
          includeComments: true,
        });

        const lastContent = sourceCode.getTokenBefore(closing, {
          includeComments: true,
        });

        const isEmptyBody = firstContent === closing;

        if (isEmptyBody) {
          return;
        }

        const positions = findStatementBreaks(node.body);

        if (opening.loc.end.line === firstContent.loc.start.line) {
          positions.push(firstContent.range[0]);
        }

        if (lastContent.loc.end.line === closing.loc.start.line) {
          positions.push(closing.range[0]);
        }

        reportBreaks(node, positions);
      },
      SwitchCase(node) {
        const hasConsequentsInFunction =
          isInsideFunction(node) && node.consequent.length > 0;

        if (!hasConsequentsInFunction) {
          return;
        }

        const firstStatement = node.consequent[0];
        const colon = sourceCode.getTokenBefore(firstStatement);
        const positions = findStatementBreaks(node.consequent);

        const needsStatementBreak =
          firstStatement.type !== 'BlockStatement' &&
          colon.loc.end.line === firstStatement.loc.start.line;

        if (needsStatementBreak) {
          positions.push(firstStatement.range[0]);
        }

        reportBreaks(node, positions);
      },
    };
  },
};

export default rule;
