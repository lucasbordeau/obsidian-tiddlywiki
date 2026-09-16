import { convertTiddlersToObsidianNotes } from '@/modules/format-converters/convertTiddlersToObsidianNotes';
import { convertObsidianNoteToTiddler } from '@/modules/format-converters/convertObsidianNoteToTiddler';

describe('TiddlyWiki to Obsidian note migration', () => {
  test('emits usable transclusions without preservation comments', () => {
    const source = [
      'Transcluding a tiddler inserts a copy of its content.',
      '',
      '<div class="tc-example-box">',
      'This is my cat {{Motovun Jack.svg}} and its twin {{Motovun Jack.svg}}.',
      '</div>',
      '',
      '<$list filter="[tag[Examples]]">{{!!title}}</$list>',
    ].join('\n');

    const [note] = convertTiddlersToObsidianNotes([
      { title: 'Transclusion', text: source },
    ]);

    expect(note.content).toContain('> [!example]');
    expect(note.content).toContain('![[Motovun Jack.svg]]');
    expect(note.content).not.toContain('<!--otw');
    expect(note.content).not.toContain('<$list');
  });

  test('embeds canonical remote media according to its declared MIME type', () => {
    const imageUrl =
      'https://raw.githubusercontent.com/example/project/commit/image.jpg';

    const audioUrl =
      'https://raw.githubusercontent.com/example/project/commit/audio?version=1&format=mp3';

    const videoUrl =
      'https://raw.githubusercontent.com/example/project/commit/video.mp4';

    const textTiddler = {
      title: 'External media',
      text: '{{Remote image.jpg}}\n\n{{Remote audio}}\n\n{{Remote video.mp4}}',
    };

    const referenceTiddlers = [
      textTiddler,
      {
        title: 'Remote image.jpg',
        text: '',
        type: 'image/jpeg',
        _canonical_uri: imageUrl,
      },
      {
        title: 'Remote audio',
        text: '',
        type: 'audio/mpeg',
        _canonical_uri: audioUrl,
      },
      {
        title: 'Remote video.mp4',
        text: '',
        type: 'video/mp4',
        _canonical_uri: videoUrl,
      },
    ];

    const [note] = convertTiddlersToObsidianNotes(
      [textTiddler],
      referenceTiddlers,
    );

    expect(note.content).toContain(`![Remote image.jpg](<${imageUrl}>)`);

    expect(note.content).toContain(
      `<audio controls="controls" preload="none" src="${audioUrl.replace('&', '&amp;')}"></audio>`,
    );

    expect(note.content).toContain(
      `<video controls="controls" preload="none" src="${videoUrl}"></video>`,
    );

    expect(note.content).not.toContain('![[Remote audio]]');
    expect(note.content).not.toContain('![[Remote video.mp4]]');

    let importedNote = note;

    for (let round = 0; round < 2; round += 1) {
      const exportedTiddler = convertObsidianNoteToTiddler(importedNote);

      expect(exportedTiddler.text).toContain('<audio');
      expect(exportedTiddler.text).toContain('<video');

      [importedNote] = convertTiddlersToObsidianNotes([exportedTiddler]);

      expect(importedNote.content).toContain(imageUrl);
      expect(importedNote.content).toContain('<audio');
      expect(importedNote.content).toContain('<video');
      expect(importedNote.content).not.toContain('<!--otw');
    }

    expect(importedNote.content).toContain('format=mp3');
    expect(importedNote.content).toContain(videoUrl);
  });

  test('keeps unknown or unsafe canonical targets as URL links', () => {
    const remoteUrl = 'https://example.org/archive/file.zip';
    const unsafeUrl = 'javascript:alert(1)';

    const textTiddler = {
      title: 'Other external resources',
      text: '{{Archive.zip}}\n\n{{Unsafe.mp3}}',
    };

    const [note] = convertTiddlersToObsidianNotes(
      [textTiddler],
      [
        textTiddler,
        {
          title: 'Archive.zip',
          text: '',
          type: 'application/zip',
          _canonical_uri: remoteUrl,
        },
        {
          title: 'Unsafe.mp3',
          text: '',
          type: 'audio/mpeg',
          _canonical_uri: unsafeUrl,
        },
      ],
    );

    expect(note.content).toContain(`[Archive.zip](<${remoteUrl}>)`);
    expect(note.content).not.toContain('<audio');
  });
});
