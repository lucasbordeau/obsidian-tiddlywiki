function isSourceFile(filename) {
  const normalizedFilename = filename.replaceAll('\\', '/');

  return (
    normalizedFilename.includes('/src/') ||
    normalizedFilename.startsWith('src/')
  );
}

function hasModulePathPrefix(specifier, prefix) {
  const modulePath = specifier?.value;

  return typeof modulePath === 'string' && modulePath.startsWith(prefix);
}

const rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require the @/ alias for imports between source modules.',
    },
    schema: [],
    messages: {
      useSourceAlias: 'Use the @/ alias for modules under src.',
    },
  },
  create(context) {
    const filename = context.getPhysicalFilename();

    if (!isSourceFile(filename)) {
      return {};
    }

    function checkSpecifier(specifier) {
      const isRelativeSpecifier = hasModulePathPrefix(specifier, '.');
      const isLegacySourceSpecifier = hasModulePathPrefix(specifier, 'src/');

      const isMissingSourceAlias =
        isRelativeSpecifier || isLegacySourceSpecifier;

      if (!isMissingSourceAlias) {
        return;
      }

      context.report({
        node: specifier,
        messageId: 'useSourceAlias',
      });
    }

    function checkModuleDeclaration(node) {
      checkSpecifier(node.source);
    }

    function checkRequireCall(node) {
      const isRequireCall =
        node.callee.type === 'Identifier' && node.callee.name === 'require';

      if (!isRequireCall) {
        return;
      }

      checkSpecifier(node.arguments[0]);
    }

    return {
      ImportDeclaration: checkModuleDeclaration,
      ExportNamedDeclaration: checkModuleDeclaration,
      ExportAllDeclaration: checkModuleDeclaration,
      ImportExpression(node) {
        checkSpecifier(node.source);
      },
      TSImportType(node) {
        checkSpecifier(node.parameter?.literal);
      },
      TSImportEqualsDeclaration(node) {
        checkSpecifier(node.moduleReference?.expression);
      },
      CallExpression: checkRequireCall,
    };
  },
};

export default rule;
