import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import {
  demoTiddlyWikiPath,
  getDemoOpenCommand,
} from './open-demo-tiddlywiki.mjs';

const examplePath = path.join(
  'manual-test',
  'tiddlywiki',
  'basic-feature-demo.html',
);

test('targets the self-contained basic feature demo by default', () => {
  assert.equal(path.basename(demoTiddlyWikiPath), 'basic-feature-demo.html');
  assert.equal(path.basename(path.dirname(demoTiddlyWikiPath)), 'tiddlywiki');
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
