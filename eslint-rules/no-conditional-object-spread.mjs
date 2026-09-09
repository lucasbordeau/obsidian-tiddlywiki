const rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer explicit object assembly over conditional object spread.',
    },
    schema: [],
    messages: {
      avoidConditionalSpread:
        'Use a typed intermediate object plus an explicit if assignment instead of conditional object spread.',
    },
  },
  create(context) {
    return {
      SpreadElement(node) {
        const isConditionalSpread =
          node.argument?.type === 'ConditionalExpression';

        if (!isConditionalSpread) {
          return;
        }

        context.report({
          node,
          messageId: 'avoidConditionalSpread',
        });
      },
    };
  },
};

export default rule;
