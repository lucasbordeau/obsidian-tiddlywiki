import * as fs from 'fs';
import * as path from 'path';

import { convertObsidianNoteContentToTiddlerContent } from 'src/modules/format-converters/convertObsidianNoteContentToTiddlerContent';
import { convertTiddlerContentToObsidianNoteContent } from 'src/modules/format-converters/convertTiddlerContentToObsidianNoteContent';

describe('convert', () => {
  it('should convert a TiddlyWiki tiddler to Markdown', () => {
    const basePath = path.join(__dirname, 'samples');
    const tiddlerText = fs.readFileSync(
      path.join(basePath, 'test.tid'),
      'utf-8',
    );
    const expectedMarkdown = fs.readFileSync(
      path.join(basePath, 'test.md'),
      'utf-8',
    );

    const convertedMarkdown = convertTiddlerContentToObsidianNoteContent(tiddlerText);

    expect(convertedMarkdown).toEqual(expectedMarkdown);
  });

  it('should convert a markdown to a TiddlyWiki tiddler', () => {
    const basePath = path.join(__dirname, 'samples');
    const expectedTiddlerText = fs.readFileSync(
      path.join(basePath, 'from_markdown.tid'),
      'utf-8',
    );
    const markdown = fs.readFileSync(path.join(basePath, 'test.md'), 'utf-8');

    const convertedTiddler = convertObsidianNoteContentToTiddlerContent(markdown);

    console.log({ expectedTiddlerText, convertedTiddler, markdown });

    expect(convertedTiddler).toEqual(expectedTiddlerText);
  });
});
