export const formatOrders = Array.from({ length: 16 }, (_, pattern) =>
  Array.from({ length: 4 }, (_, depth) =>
    pattern & (1 << depth) ? ('strong' as const) : ('emphasis' as const),
  ),
);
