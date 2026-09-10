export const invalidContainerSources = [
  ['{', 'invalid-json'],
  ['{"title":"A"}', 'invalid-tiddler-container'],
  ['[{"title":"A","tags":["tag"]}]', 'invalid-tiddler-field'],
  ['[{"title":"A","custom":null}]', 'invalid-tiddler-field'],
  ['[{"title":" "}]', 'missing-tiddler-title'],
  ['[{"title":"A"},{"title":"A"}]', 'duplicate-tiddler-title'],
] as const;
