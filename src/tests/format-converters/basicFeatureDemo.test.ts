import { readFileSync } from 'fs';
import { convertTiddlersToObsidianNotes } from '@/modules/format-converters/convertTiddlersToObsidianNotes';
import { ObsidianNote } from '@/modules/obsidian/ObsidianNote';
import { Tiddler } from '@/modules/tiddlywiki/Tiddler';

function readBasicFeatureDemoTiddlers(): Tiddler[] {
  const demoSource = readFileSync(
    'manual-test/tiddlywiki/basic-feature-demo.html',
    'utf8',
  );

  const store =
    /<script class="tiddlywiki-tiddler-store" type="application\/json">([\s\S]*?)<\/script>/.exec(
      demoSource,
    );

  if (!store) {
    throw new Error('The basic feature demo has no tiddler store.');
  }

  return (JSON.parse(store[1]) as Tiddler[]).filter(
    (tiddler) => !tiddler.title.startsWith('$:/'),
  );
}

function getByTitle<T extends { title: string }>(
  values: T[],
  title: string,
): T {
  const value = values.find((candidate) => candidate.title === title);

  if (!value) {
    throw new Error(`Missing demo entry: ${title}`);
  }

  return value;
}

describe('basic feature demo import', () => {
  const tiddlers = readBasicFeatureDemoTiddlers();

  const textTiddlers = tiddlers.filter(
    (tiddler) => !tiddler.type || tiddler.type.includes('text'),
  );

  const notes = convertTiddlersToObsidianNotes(textTiddlers, tiddlers);

  function getNote(title: string): ObsidianNote {
    return getByTitle(notes, title);
  }

  test('uses tight four-space nesting without blank lines between list levels', () => {
    const startNote = getNote('Basic Notes — Start');
    const listNote = getNote('Basic Notes — Lists');
    const formattingNote = getNote('Basic Notes — Formatting');

    expect(startNote.content).toContain(
      [
        '5. Metadata network',
        '    - [[Project Cedar]]',
        '        - [[Mara Voss]]',
        '        - [[Cedar Planning Meeting]]',
        '6. [[Basic Notes — Transclusion|Whole-note transclusion]]',
        '    - [[Basic Notes — Nested Summary|Nested summary]]',
      ].join('\n'),
    );

    expect(listNote.content).toContain(
      [
        '- Content',
        '    1. Start with [[Basic Notes — Links|links]].',
        '        - Then return to this checklist.',
        '        1. Finish with [[Basic Notes — Media|local media]].',
      ].join('\n'),
    );

    expect(formattingNote.content).toContain(
      [
        '> - **First pass** opens [[Project Cedar]].',
        '>     - _Second level_ checks the <u>owner</u> and ==status== fields.',
        '>         - The **third level** compares `priority` with H<sub>2</sub>O and x<sup>2</sup>.',
      ].join('\n'),
    );
  });

  test('keeps the external image embedded and remote audio/video playable', () => {
    const externalMediaNote = getNote('Basic Notes — External Media');

    const remoteAudio = getByTitle(tiddlers, 'Basic Notes Remote Signal.mp3');

    const remoteVideo = getByTitle(tiddlers, 'Basic Notes Remote Station.mp4');

    expect(externalMediaNote.content).toContain(
      '![Generated field workstation photograph](<https://raw.githubusercontent.com/',
    );

    expect(externalMediaNote.content).toContain(
      `<audio controls="controls" preload="none" src="${remoteAudio._canonical_uri}"></audio>`,
    );

    expect(externalMediaNote.content).toContain(
      `<video controls="controls" preload="none" src="${remoteVideo._canonical_uri}"></video>`,
    );

    expect(externalMediaNote.content).not.toContain(
      '![[Basic Notes Remote Signal.mp3]]',
    );

    expect(externalMediaNote.content).not.toContain(
      '![[Basic Notes Remote Station.mp4]]',
    );
  });
});
