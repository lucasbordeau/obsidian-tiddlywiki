import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { App } from 'obsidian';
import { prepareExport } from '@/modules/export-selection/prepareExport';
import { writeMediaTiddlers } from '@/modules/plugin-core/settings/writeMediaTiddlers';

describe('vault export preparation', () => {
  test('reads Markdown timestamps from Obsidian file stats', async () => {
    const markdownFile = {
      path: 'Archive/Dated note.md',
      basename: 'Dated note',
      extension: 'md',
      stat: {
        ctime: Date.parse('2024-02-29T21:30:12.456Z'),
        mtime: Date.parse('2026-09-16T11:00:00.789Z'),
      },
    };

    const app = {
      vault: {
        adapter: { basePath: '/vault' },
        getFiles: jest.fn().mockReturnValue([markdownFile]),
        cachedRead: jest
          .fn()
          .mockResolvedValue('---\ntags: [project]\n---\nBody'),
      },
      metadataCache: {
        getFirstLinkpathDest: jest.fn().mockReturnValue(null),
      },
    } as unknown as App;

    const preparedExport = await prepareExport(
      app,
      new Set([markdownFile.path]),
    );

    expect(preparedExport.tiddlers).toHaveLength(1);
    expect(preparedExport.tiddlers[0].created).toBe('20240229213012456');
    expect(preparedExport.tiddlers[0].modified).toBe('20260916110000789');
    expect(preparedExport.tiddlers[0].tags).toBe('project');
    expect(preparedExport.brokenLinkCount).toBe(0);
  });

  test('exports textual attachments as UTF-8 and unknown files as binary', async () => {
    const vaultDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), 'obsidian-export-content-types-'),
    );

    const canvasText = '{"nodes":[],"edges":[]}';
    const baseText = 'views:\n  - type: table\n';
    const jsonText = '{"title":"Été"}\n';
    const scriptText = 'const label = "Été";\n';
    const unknownBytes = Buffer.from([0, 127, 255]);

    fs.writeFileSync(path.join(vaultDirectory, 'Board.canvas'), canvasText);
    fs.writeFileSync(path.join(vaultDirectory, 'Library.base'), baseText);
    fs.writeFileSync(path.join(vaultDirectory, 'Data.json'), jsonText);
    fs.writeFileSync(path.join(vaultDirectory, 'Script.js'), scriptText);
    fs.writeFileSync(path.join(vaultDirectory, 'payload.custom'), unknownBytes);

    const timestamp = Date.UTC(2024, 1, 29, 21, 30, 12, 456);

    const vaultFiles = [
      { path: 'Board.canvas', basename: 'Board', extension: 'canvas' },
      { path: 'Library.base', basename: 'Library', extension: 'base' },
      { path: 'Data.json', basename: 'Data', extension: 'json' },
      { path: 'Script.js', basename: 'Script', extension: 'js' },
      { path: 'payload.custom', basename: 'payload', extension: 'custom' },
    ].map((vaultFile) => ({
      ...vaultFile,
      stat: { ctime: timestamp, mtime: timestamp },
    }));

    const app = {
      vault: {
        adapter: { basePath: vaultDirectory },
        getFiles: jest.fn().mockReturnValue(vaultFiles),
      },
    } as unknown as App;

    try {
      const preparedExport = await prepareExport(
        app,
        new Set(vaultFiles.map((vaultFile) => vaultFile.path)),
      );

      expect(preparedExport.tiddlers).toEqual([
        expect.objectContaining({
          title: 'Board.canvas',
          text: canvasText,
          type: 'application/json',
        }),
        expect.objectContaining({
          title: 'Library.base',
          text: baseText,
          type: 'text/plain',
        }),
        expect.objectContaining({
          title: 'Data.json',
          text: jsonText,
          type: 'application/json',
        }),
        expect.objectContaining({
          title: 'Script.js',
          text: scriptText,
          type: 'application/javascript',
        }),
        expect.objectContaining({
          title: 'payload.custom',
          text: unknownBytes.toString('base64'),
          type: 'application/octet-stream',
        }),
      ]);

      const importDirectory = path.join(vaultDirectory, 'round-trip');

      fs.mkdirSync(importDirectory);

      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      try {
        await writeMediaTiddlers(preparedExport.tiddlers, importDirectory);
      } finally {
        logSpy.mockRestore();
      }

      expect(
        fs.readFileSync(path.join(importDirectory, 'Board.canvas'), 'utf8'),
      ).toBe(canvasText);

      expect(
        fs.readFileSync(path.join(importDirectory, 'Library.base'), 'utf8'),
      ).toBe(baseText);

      expect(
        fs.readFileSync(path.join(importDirectory, 'Data.json'), 'utf8'),
      ).toBe(jsonText);

      expect(
        fs.readFileSync(path.join(importDirectory, 'Script.js'), 'utf8'),
      ).toBe(scriptText);

      expect(
        fs.readFileSync(path.join(importDirectory, 'payload.custom')),
      ).toEqual(unknownBytes);
    } finally {
      fs.rmSync(vaultDirectory, { recursive: true, force: true });
    }
  });
});
