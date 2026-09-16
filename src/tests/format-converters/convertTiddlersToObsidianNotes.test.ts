import { convertTiddlersToObsidianNotes } from '@/modules/format-converters/convertTiddlersToObsidianNotes';

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

  test('turns canonical external-media transclusions into durable URL links', () => {
    const audioUrl =
      'https://raw.githubusercontent.com/example/project/commit/audio.mp3';

    const videoUrl =
      'https://raw.githubusercontent.com/example/project/commit/video.mp4';

    const textTiddler = {
      title: 'External media',
      text: '{{Remote audio.mp3}}\n\n{{Remote video.mp4}}',
    };

    const referenceTiddlers = [
      textTiddler,
      {
        title: 'Remote audio.mp3',
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

    expect(note.content).toContain(`[Remote audio.mp3](<${audioUrl}>)`);
    expect(note.content).toContain(`[Remote video.mp4](<${videoUrl}>)`);
    expect(note.content).not.toContain('![[Remote audio.mp3]]');
    expect(note.content).not.toContain('![[Remote video.mp4]]');
  });
});
