import { exportObsidianNote } from '../../../../modules/conversion-core/notes/exportObsidianNote';
import { importTiddler } from '../../../../modules/conversion-core/notes/importTiddler';
import { getCodecValue } from '../../../support/getCodecValue';
import { structuredAttachmentCases } from './structuredAttachmentCases';

describe('textual and extension content types', () => {
  it.each(structuredAttachmentCases)(
    'preserves the separate document container $title as typed source',
    (original) => {
      expect(
        getCodecValue(
          exportObsidianNote(getCodecValue(importTiddler(original))),
        ),
      ).toEqual(original);
    },
  );
});
