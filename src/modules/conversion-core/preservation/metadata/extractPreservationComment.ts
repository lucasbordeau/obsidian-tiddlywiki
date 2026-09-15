import type { PreservationRecord } from './PreservationRecord';
import { readPreservationRecord } from './readPreservationRecord';

export type ExtractedPreservationComment = {
  body: string;
  record?: PreservationRecord;
};

export function extractPreservationComment(
  body: string,
): ExtractedPreservationComment {
  const match = /^<!--otw-meta:v1:([^<>]*?)-->(?:\r?\n\r?\n|$)/.exec(body);

  if (!match) {
    return { body };
  }

  try {
    const record = readPreservationRecord(decodeURIComponent(match[1]));

    if (!record) {
      return { body };
    }

    return { body: body.slice(match[0].length), record };
  } catch {
    return { body };
  }
}
