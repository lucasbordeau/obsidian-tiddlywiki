const getMemberCallReceiver = (value, propertyName) => {
  if (value?.type !== 'CallExpression') {
    return null;
  }

  const callee = value.callee;

  if (callee?.type !== 'MemberExpression') {
    return null;
  }

  const hasNamedProperty =
    callee.property?.type === 'Identifier' &&
    callee.property.name === propertyName;

  if (!hasNamedProperty) {
    return null;
  }

  return callee.object ?? null;
};

const isMemberCallWithProperty = (value, propertyName) =>
  getMemberCallReceiver(value, propertyName) !== null;

const isFilterMapPipeline = (value) => {
  const mapReceiver = getMemberCallReceiver(value, 'map');

  if (mapReceiver === null) {
    return false;
  }

  return isMemberCallWithProperty(mapReceiver, 'filter');
};

const isPromiseAllCall = (node) => {
  const callee = node.callee;

  return (
    callee?.type === 'MemberExpression' &&
    callee.object?.type === 'Identifier' &&
    callee.object.name === 'Promise' &&
    callee.property?.type === 'Identifier' &&
    callee.property.name === 'all'
  );
};

const rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require named intermediate collections before Promise.all.',
    },
    schema: [],
    messages: {
      extractPipeline:
        'Extract the filtered collection and promise array into named variables before Promise.all.',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        const firstArgument = node.arguments?.[0] ?? null;
        const shouldReportInlinePipeline =
          isPromiseAllCall(node) && isFilterMapPipeline(firstArgument);

        if (!shouldReportInlinePipeline) {
          return;
        }

        context.report({
          node: firstArgument,
          messageId: 'extractPipeline',
        });
      },
    };
  },
};

export default rule;
