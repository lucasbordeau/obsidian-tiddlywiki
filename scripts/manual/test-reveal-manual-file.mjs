import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { getFileRevealCommand } from './reveal-manual-file.mjs';

const examplePath = path.join('test run', 'tiddlywiki', 'import.json');

test('uses each operating system file browser without embedding an installation path', () => {
  assert.deepEqual(getFileRevealCommand(examplePath, 'darwin'), {
    executable: 'open',
    arguments: ['-R', examplePath],
  });

  assert.deepEqual(getFileRevealCommand(examplePath, 'win32'), {
    executable: 'explorer.exe',
    arguments: [`/select,${examplePath}`],
  });

  assert.deepEqual(getFileRevealCommand(examplePath, 'linux'), {
    executable: 'xdg-open',
    arguments: [path.dirname(examplePath)],
  });

  assert.equal(getFileRevealCommand(examplePath, 'unknown'), undefined);
});
