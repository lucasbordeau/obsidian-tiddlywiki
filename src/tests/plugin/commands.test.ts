import path from 'node:path';
import type { App, ButtonComponent, Command, PluginManifest } from 'obsidian';
import { Setting } from 'obsidian';
import ObsidianTiddlyWikiPlugin from '../../main';
import { ObsidianTiddlyWikiSettingsTab } from '../../modules/plugin-core/settings/ObsidianTiddlyWikiSettingsTab';
import { exportVaultToJson } from '../../modules/plugin-core/settings/exportVaultToJson';
import { importTiddlyWikiJsonPath } from '../../modules/plugin-core/settings/importTiddlyWikiJsonFile';
import { getImportPathHint } from '../../modules/plugin-core/settings/openImportJsonPicker';
import { renderImportJsonButton } from '../../modules/plugin-core/settings/renderImportJsonButton';

jest.mock(
  'electron',
  () => ({
    remote: {
      dialog: { showOpenDialog: jest.fn() },
      process: { argv: [] },
    },
  }),
  { virtual: true },
);

jest.mock(
  'obsidian',
  () => ({
    Plugin: class {
      addCommand = jest.fn((command: Command) => command);
      addSettingTab = jest.fn();

      constructor(public app: App) {}
    },
    PluginSettingTab: class {},
    Setting: jest.fn(),
  }),
  { virtual: true },
);

jest.mock('../../modules/plugin-core/settings/exportVaultToJson', () => ({
  exportVaultToJson: jest.fn().mockResolvedValue(undefined),
}));

jest.mock(
  '../../modules/plugin-core/settings/importTiddlyWikiJsonFile',
  () => ({
    importTiddlyWikiJsonPath: jest.fn().mockResolvedValue(undefined),
  }),
);

const electronMock = jest.requireMock('electron') as {
  remote: {
    dialog: { showOpenDialog: jest.Mock };
    process: { argv: string[] };
  };
};

const mockShowOpenDialog = electronMock.remote.dialog.showOpenDialog;
const mockElectronProcess = electronMock.remote.process;

function findCommand(plugin: ObsidianTiddlyWikiPlugin, commandId: string) {
  const registeredCommand = jest
    .mocked(plugin.addCommand)
    .mock.calls.find(([command]) => command.id === commandId)?.[0];

  if (!registeredCommand?.callback) {
    throw new Error(`No standalone command registered for ${commandId}`);
  }

  return registeredCommand.callback;
}

const app = { workspace: { activeLeaf: null } } as unknown as App;
const manifest = { id: 'tiddlywiki-import-export' } as PluginManifest;

const displaySettings = jest.spyOn(
  ObsidianTiddlyWikiSettingsTab.prototype,
  'display',
);

let plugin: ObsidianTiddlyWikiPlugin;

beforeEach(async () => {
  jest.clearAllMocks();

  mockElectronProcess.argv = [];

  mockShowOpenDialog.mockResolvedValue({ canceled: true, filePaths: [] });

  plugin = new ObsidianTiddlyWikiPlugin(app, manifest);

  await plugin.onload();
});

describe('command palette actions', () => {
  it('registers import and export before settings are displayed', () => {
    const commands = jest
      .mocked(plugin.addCommand)
      .mock.calls.map(([command]) => command);

    expect(commands).toEqual([
      {
        id: 'import-tiddlywiki-json',
        name: 'Import TiddlyWiki JSON',
        callback: expect.any(Function),
      },
      {
        id: 'export-vault-to-tiddlywiki-json',
        name: 'Export vault to TiddlyWiki JSON',
        callback: expect.any(Function),
      },
    ]);

    expect(plugin.addSettingTab).toHaveBeenCalledWith(
      expect.any(ObsidianTiddlyWikiSettingsTab),
    );

    expect(displaySettings).not.toHaveBeenCalled();
    expect(mockShowOpenDialog).not.toHaveBeenCalled();
  });

  it('opens the native picker at the prepared JSON and imports it', async () => {
    const preparedJsonPath = path.resolve('manual-test/tiddlywiki/import.json');

    mockElectronProcess.argv = [`--tiddlywiki-import-path=${preparedJsonPath}`];

    mockShowOpenDialog.mockResolvedValue({
      canceled: false,
      filePaths: [preparedJsonPath],
    });

    await findCommand(plugin, 'import-tiddlywiki-json')();

    expect(mockShowOpenDialog).toHaveBeenCalledWith({
      title: 'Import TiddlyWiki JSON',
      defaultPath: preparedJsonPath,
      filters: [{ name: 'TiddlyWiki JSON', extensions: ['json'] }],
      properties: ['openFile'],
    });

    expect(importTiddlyWikiJsonPath).toHaveBeenCalledWith(
      app,
      preparedJsonPath,
    );

    expect(displaySettings).not.toHaveBeenCalled();
  });

  it('opens a standard native picker outside the manual test launcher', async () => {
    await findCommand(plugin, 'import-tiddlywiki-json')();

    expect(mockShowOpenDialog).toHaveBeenCalledWith({
      title: 'Import TiddlyWiki JSON',
      filters: [{ name: 'TiddlyWiki JSON', extensions: ['json'] }],
      properties: ['openFile'],
    });

    expect(importTiddlyWikiJsonPath).not.toHaveBeenCalled();
  });

  it.each([
    { canceled: true, filePaths: ['/ignored.json'] },
    { canceled: false, filePaths: [] },
  ])('does not import after cancelling with %p', async (selection) => {
    mockShowOpenDialog.mockResolvedValue(selection);

    await findCommand(plugin, 'import-tiddlywiki-json')();

    expect(importTiddlyWikiJsonPath).not.toHaveBeenCalled();
  });

  it('opens a fresh native picker so the same file can be imported again', async () => {
    const selectedPath = path.resolve('test-fixtures/wiki.json');
    const importCommand = findCommand(plugin, 'import-tiddlywiki-json');

    mockShowOpenDialog.mockResolvedValue({
      canceled: false,
      filePaths: [selectedPath],
    });

    await importCommand();
    await importCommand();

    expect(mockShowOpenDialog).toHaveBeenCalledTimes(2);
    expect(importTiddlyWikiJsonPath).toHaveBeenCalledTimes(2);

    expect(importTiddlyWikiJsonPath).toHaveBeenNthCalledWith(
      1,
      app,
      selectedPath,
    );

    expect(importTiddlyWikiJsonPath).toHaveBeenNthCalledWith(
      2,
      app,
      selectedPath,
    );
  });

  it('reads only the dedicated manual import argument', () => {
    const profilePath = path.resolve('temporary/profile');
    const importPath = path.resolve('manual-test/tiddlywiki/import.json');
    const unrelatedPath = path.resolve('unrelated/file.json');

    expect(
      getImportPathHint([
        'Obsidian',
        `--user-data-dir=${profilePath}`,
        `--tiddlywiki-import-path=${importPath}`,
      ]),
    ).toBe(importPath);

    expect(getImportPathHint(['Obsidian', unrelatedPath])).toBe(undefined);
  });

  it('exports the current vault with no active editor or settings display', async () => {
    await findCommand(plugin, 'export-vault-to-tiddlywiki-json')();

    expect(exportVaultToJson).toHaveBeenCalledTimes(1);
    expect(exportVaultToJson).toHaveBeenCalledWith(app);
    expect(displaySettings).not.toHaveBeenCalled();
  });

  it('keeps the settings import button connected to the native picker', async () => {
    const selectedPath = path.resolve('test-fixtures/wiki.json');

    const button = {
      setButtonText: jest.fn().mockReturnThis(),
      onClick: jest.fn(),
    };

    const setting = {
      setName: jest.fn().mockReturnThis(),
      setDesc: jest.fn().mockReturnThis(),
      addButton: jest.fn((configure: (button: ButtonComponent) => unknown) => {
        configure(button as unknown as ButtonComponent);
      }),
    };

    const settingsContainer = { createEl: jest.fn() } as unknown as HTMLElement;

    jest
      .mocked(Setting)
      .mockImplementation(() => setting as unknown as Setting);

    mockShowOpenDialog.mockResolvedValue({
      canceled: false,
      filePaths: [selectedPath],
    });

    renderImportJsonButton(app, settingsContainer);

    expect(mockShowOpenDialog).not.toHaveBeenCalled();

    await button.onClick.mock.calls[0][0]();

    expect(mockShowOpenDialog).toHaveBeenCalledTimes(1);
    expect(importTiddlyWikiJsonPath).toHaveBeenCalledWith(app, selectedPath);
  });
});
