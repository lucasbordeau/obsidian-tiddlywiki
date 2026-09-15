import type { App, ButtonComponent, Command, PluginManifest } from 'obsidian';
import { Setting } from 'obsidian';
import ObsidianTiddlyWikiPlugin from '../../main';
import { ObsidianTiddlyWikiSettingsTab } from '../../modules/plugin-core/settings/ObsidianTiddlyWikiSettingsTab';
import { exportVaultToJson } from '../../modules/plugin-core/settings/exportVaultToJson';
import { importTiddlyWikiJsonFile } from '../../modules/plugin-core/settings/importTiddlyWikiJsonFile';
import { renderImportJsonButton } from '../../modules/plugin-core/settings/renderImportJsonButton';

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
    importTiddlyWikiJsonFile: jest.fn().mockResolvedValue(undefined),
  }),
);

function createFileInput() {
  return {
    type: '',
    accept: '',
    multiple: false,
    files: null as FileList | null,
    click: jest.fn(),
    addEventListener: jest.fn<void, [string, () => void | Promise<void>]>(),
  };
}

function createFileList(file: File): FileList {
  return { length: 1, item: () => file } as unknown as FileList;
}

async function dispatchFileChange(
  fileInput: ReturnType<typeof createFileInput>,
) {
  const changeListener = fileInput.addEventListener.mock.calls.find(
    ([eventName]) => eventName === 'change',
  );

  if (!changeListener) {
    throw new Error('The file picker has no change listener');
  }

  await changeListener[1]();
}

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

const originalDocument = Object.getOwnPropertyDescriptor(
  globalThis,
  'document',
);

const displaySettings = jest.spyOn(
  ObsidianTiddlyWikiSettingsTab.prototype,
  'display',
);

let createdFileInputs: ReturnType<typeof createFileInput>[];
let plugin: ObsidianTiddlyWikiPlugin;

beforeEach(async () => {
  jest.clearAllMocks();

  createdFileInputs = [];

  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: {
      createElement: (tagName: string) => {
        if (tagName !== 'input') {
          throw new Error(`Unexpected element: ${tagName}`);
        }

        const fileInput = createFileInput();

        createdFileInputs.push(fileInput);

        return fileInput;
      },
    },
  });

  plugin = new ObsidianTiddlyWikiPlugin(app, manifest);

  await plugin.onload();
});

afterEach(() => {
  if (originalDocument) {
    Object.defineProperty(globalThis, 'document', originalDocument);
  } else {
    Reflect.deleteProperty(globalThis, 'document');
  }
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
    expect(createdFileInputs).toHaveLength(0);
  });

  it('opens a single JSON file picker with no active editor or settings display', () => {
    findCommand(plugin, 'import-tiddlywiki-json')();

    expect(createdFileInputs).toHaveLength(1);

    expect(createdFileInputs[0]).toMatchObject({
      type: 'file',
      accept: '.json',
      multiple: false,
    });

    expect(createdFileInputs[0].click).toHaveBeenCalledTimes(1);
    expect(displaySettings).not.toHaveBeenCalled();
    expect(importTiddlyWikiJsonFile).not.toHaveBeenCalled();
  });

  it('imports the selected file into the current vault', async () => {
    const selectedFile = { name: 'wiki.json' } as File;

    findCommand(plugin, 'import-tiddlywiki-json')();

    const fileInput = createdFileInputs[0];

    fileInput.files = createFileList(selectedFile);

    await dispatchFileChange(fileInput);

    expect(importTiddlyWikiJsonFile).toHaveBeenCalledTimes(1);
    expect(importTiddlyWikiJsonFile).toHaveBeenCalledWith(app, selectedFile);
  });

  it.each([null, { length: 0, item: () => null } as unknown as FileList])(
    'does not import after cancelling with files=%p',
    async (selectedFiles) => {
      findCommand(plugin, 'import-tiddlywiki-json')();

      const fileInput = createdFileInputs[0];

      fileInput.files = selectedFiles;

      await dispatchFileChange(fileInput);

      expect(importTiddlyWikiJsonFile).not.toHaveBeenCalled();
    },
  );

  it('opens a fresh picker so the same file can be imported again', async () => {
    const selectedFile = { name: 'wiki.json' } as File;
    const importCommand = findCommand(plugin, 'import-tiddlywiki-json');

    importCommand();

    createdFileInputs[0].files = createFileList(selectedFile);

    await dispatchFileChange(createdFileInputs[0]);

    importCommand();

    createdFileInputs[1].files = createFileList(selectedFile);

    await dispatchFileChange(createdFileInputs[1]);

    expect(createdFileInputs).toHaveLength(2);
    expect(createdFileInputs[1]).not.toBe(createdFileInputs[0]);
    expect(createdFileInputs[1].click).toHaveBeenCalledTimes(1);
    expect(importTiddlyWikiJsonFile).toHaveBeenCalledTimes(2);

    expect(importTiddlyWikiJsonFile).toHaveBeenNthCalledWith(
      1,
      app,
      selectedFile,
    );

    expect(importTiddlyWikiJsonFile).toHaveBeenNthCalledWith(
      2,
      app,
      selectedFile,
    );
  });

  it('exports the current vault with no active editor or settings display', async () => {
    await findCommand(plugin, 'export-vault-to-tiddlywiki-json')();

    expect(exportVaultToJson).toHaveBeenCalledTimes(1);
    expect(exportVaultToJson).toHaveBeenCalledWith(app);
    expect(displaySettings).not.toHaveBeenCalled();
  });

  it('keeps the settings import button connected to the same picker behavior', async () => {
    const selectedFile = { name: 'wiki.json' } as File;

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

    renderImportJsonButton(app, settingsContainer);

    expect(createdFileInputs).toHaveLength(0);

    button.onClick.mock.calls[0][0]();

    const fileInput = createdFileInputs[0];

    fileInput.files = createFileList(selectedFile);

    await dispatchFileChange(fileInput);

    expect(fileInput.click).toHaveBeenCalledTimes(1);
    expect(importTiddlyWikiJsonFile).toHaveBeenCalledWith(app, selectedFile);
  });
});
