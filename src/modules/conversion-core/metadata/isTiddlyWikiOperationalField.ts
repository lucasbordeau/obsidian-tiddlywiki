const operationalFields = new Set([
  '_canonical_uri',
  '_is_skinny',
  'bag',
  'class',
  'code-body',
  'creator',
  'draft.of',
  'draft.title',
  'hide-body',
  'library',
  'list',
  'list-after',
  'list-before',
  'modifier',
  'permissions',
  'plugin-priority',
  'plugin-type',
  'recipe',
  'revision',
  'throttle.refresh',
  'toc-link',
  'uri',
]);

export function isTiddlyWikiOperationalField(name: string): boolean {
  return operationalFields.has(name);
}
