import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {
  demoTiddlyWikiPath,
  emptyTiddlyWikiPath,
  getDemoTiddlyWikiPath,
  getDemoOpenCommand,
} from '../open-demo-tiddlywiki.mjs';

const examplePath = path.join(
  'manual-test',
  'tiddlywiki',
  'basic-feature-demo.html',
);

test('targets the self-contained basic feature demo by default', () => {
  assert.equal(path.basename(demoTiddlyWikiPath), 'basic-feature-demo.html');
  assert.equal(path.basename(path.dirname(demoTiddlyWikiPath)), 'tiddlywiki');
  assert.equal(getDemoTiddlyWikiPath(), demoTiddlyWikiPath);
});

test('targets an empty TiddlyWiki for the reverse conversion demo', () => {
  const emptyWiki = readFileSync(emptyTiddlyWikiPath, 'utf8');

  const tiddlerStore =
    /<script class="tiddlywiki-tiddler-store" type="application\/json">([\s\S]*?)<\/script>/.exec(
      emptyWiki,
    );

  assert.ok(tiddlerStore);

  const storedTiddlers = JSON.parse(tiddlerStore[1]);

  const authoredTiddlers = storedTiddlers.filter(
    (tiddler) => !tiddler.title.startsWith('$:/'),
  );

  assert.deepEqual(authoredTiddlers, []);
  assert.match(emptyWiki, /TiddlyWiki created by Jeremy Ruston/);
  assert.equal(getDemoTiddlyWikiPath(['--empty']), emptyTiddlyWikiPath);
});

test('opens the demo with the operating system default browser', () => {
  assert.deepEqual(getDemoOpenCommand(examplePath, 'darwin'), {
    executable: 'open',
    arguments: [examplePath],
  });

  assert.deepEqual(getDemoOpenCommand(examplePath, 'win32'), {
    executable: 'explorer.exe',
    arguments: [examplePath],
  });

  assert.deepEqual(getDemoOpenCommand(examplePath, 'linux'), {
    executable: 'xdg-open',
    arguments: [examplePath],
  });

  assert.equal(getDemoOpenCommand(examplePath, 'unknown'), undefined);
});
