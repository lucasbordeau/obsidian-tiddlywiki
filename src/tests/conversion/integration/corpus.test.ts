import { readdirSync } from 'fs';
import { convertText } from '../../../modules/conversion-core/conversion/convertText';
import { parseObsidian } from '../../../modules/conversion-core/syntax/obsidian/parsing/parseObsidian';
import { parseTiddlyWiki } from '../../../modules/conversion-core/syntax/tiddlywiki/parsing/parseTiddlyWiki';
import { Dialect } from '../../../modules/conversion-core/model/source/Dialect';
import { semanticBlocks } from '../../support/ast/comparison/semanticBlocks';
import { samplePath } from '../../support/samples/samplePath';
import { readSample } from '../../support/samples/readSample';

describe('cross-dialect conversion', () => {
  describe.each<Dialect>(['obsidian', 'tiddlywiki'])(
    'existing %s sample corpus',
    (dialect) => {
      const directory = samplePath(dialect);
      const filenames = readdirSync(directory).sort();

      test.each(filenames)(
        '%s keeps its parsed meaning through both conversion directions',
        (filename) => {
          const source = readSample(dialect, filename);
          const target = dialect === 'obsidian' ? 'tiddlywiki' : 'obsidian';

          const parser =
            dialect === 'obsidian' ? parseObsidian : parseTiddlyWiki;

          const converted = convertText(source, dialect, target);
          const restored = convertText(converted.text, target, dialect);

          expect(semanticBlocks(parser(restored.text).blocks)).toEqual(
            semanticBlocks(parser(source).blocks),
          );
        },
      );
    },
  );
});
