const rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require regular imports for both types and runtime values.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      useRegularImport:
        'Use a regular import instead of the type-only import syntax.',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();

    function removeDeclarationTypeModifier(fixer, importToken, typeToken) {
      const leadingText = sourceCode.text.slice(
        importToken.range[1],
        typeToken.range[0],
      );

      const hasOnlyLeadingWhitespace = /^\s*$/.test(leadingText);

      if (!hasOnlyLeadingWhitespace) {
        return fixer.remove(typeToken);
      }

      return fixer.removeRange([importToken.range[1], typeToken.range[1]]);
    }

    function removeInlineTypeModifier(fixer, typeToken, importedToken) {
      const trailingText = sourceCode.text.slice(
        typeToken.range[1],
        importedToken.range[0],
      );

      const hasOnlyTrailingWhitespace = /^\s*$/.test(trailingText);

      if (!hasOnlyTrailingWhitespace) {
        return fixer.remove(typeToken);
      }

      return fixer.removeRange([typeToken.range[0], importedToken.range[0]]);
    }

    function checkTypeOnlyDeclaration(node) {
      if (node.importKind !== 'type') {
        return;
      }

      const importToken = sourceCode.getFirstToken(node);
      const typeToken = sourceCode.getTokenAfter(importToken);
      const hasTypeToken = typeToken?.value === 'type';

      context.report({
        node,
        messageId: 'useRegularImport',
        fix(fixer) {
          if (!hasTypeToken) {
            return null;
          }

          return removeDeclarationTypeModifier(fixer, importToken, typeToken);
        },
      });
    }

    return {
      ImportDeclaration: checkTypeOnlyDeclaration,
      TSImportEqualsDeclaration: checkTypeOnlyDeclaration,
      ImportSpecifier(node) {
        const isInlineTypeImport =
          node.importKind === 'type' && node.parent.importKind !== 'type';

        if (!isInlineTypeImport) {
          return;
        }

        const typeToken = sourceCode.getFirstToken(node);
        const importedToken = sourceCode.getTokenAfter(typeToken);
        const hasTypeToken = typeToken?.value === 'type';

        context.report({
          node,
          messageId: 'useRegularImport',
          fix(fixer) {
            if (!hasTypeToken || !importedToken) {
              return null;
            }

            return removeInlineTypeModifier(fixer, typeToken, importedToken);
          },
        });
      },
    };
  },
};

export default rule;
