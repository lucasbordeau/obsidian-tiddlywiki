import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const esm = await import('../../../dist/conversion-core.mjs');
const sandbox = { module: { exports: {} } };

vm.runInNewContext(readFileSync('dist/conversion-core.cjs', 'utf8'), sandbox, {
  timeout: 5000,
  filename: 'conversion-core.cjs',
});

for (const [format, api] of [
  ['ESM', esm],
  ['CommonJS without host globals', sandbox.module.exports],
]) {
  const source =
    '---\ntags: [research, "étude"]\naliases: ["A & B"]\n---\n# Title\n\n**bold** ![[image.png|120]] and [[Note|Alias]]\n';

  const note = { title: 'Research/étude', content: source };

  const exported = api.exportObsidianNote(note);

  assert.ok(exported.value, `${format}: export`);

  const imported = api.importTiddler(exported.value);

  assert.equal(imported.value?.title, note.title, `${format}: title`);
  assert.equal(imported.value?.content, source, `${format}: exact source`);

  const tid = api.serializeTidFile({
    title: '研究',
    text: 'literal {{text}}',
    type: 'text/plain',
  });

  assert.ok(tid.value, `${format}: tid serialization`);
  assert.equal(api.parseTidFile(tid.value).value?.text, 'literal {{text}}');

  assert.equal(
    api.convertText('**bold**', 'obsidian', 'tiddlywiki').text,
    "''bold''",
  );

  process.stdout.write(
    `${format}: syntax, metadata and container APIs passed\n`,
  );
}
