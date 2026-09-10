import { exportObsidianNote } from '../../../../modules/conversion-core/notes/export/exportObsidianNote';
import { importTiddler } from '../../../../modules/conversion-core/notes/import/importTiddler';
import { valueOf } from '../../../support/codecs/valueOf';
import { structuredAttachmentCases } from './cases/structuredAttachmentCases';

describe('textual and extension content types', () => {
  it.each(structuredAttachmentCases)(
    'preserves the separate document container $title as typed source',
    (original) => {
      expect(
        valueOf(exportObsidianNote(valueOf(importTiddler(original)))),
      ).toEqual(original);
    },
  );
});
