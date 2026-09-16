export function collectAllNodeTypes(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(collectAllNodeTypes);
  }

  if (value === null || typeof value !== 'object') {
    return [];
  }

  const record = value as Record<string, unknown>;
  const ownTypes = typeof record.type === 'string' ? [record.type] : [];

  return [...ownTypes, ...Object.values(record).flatMap(collectAllNodeTypes)];
}
