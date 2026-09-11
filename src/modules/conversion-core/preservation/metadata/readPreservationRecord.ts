import { isRecord } from '../../validation/isRecord';
import type { PreservationRecord } from './PreservationRecord';

export function readPreservationRecord(
  value: unknown,
): PreservationRecord | undefined {
  let candidate = value;

  if (typeof candidate === 'string') {
    try {
      candidate = JSON.parse(candidate) as unknown;
    } catch {
      return undefined;
    }
  }

  if (!isRecord(candidate)) {
    return undefined;
  }

  const isPreservationRecord =
    candidate.kind === 'obsidian-tiddlywiki-preservation' &&
    candidate.version === 1 &&
    (candidate.origin === 'obsidian' || candidate.origin === 'tiddlywiki') &&
    typeof candidate.identity === 'string' &&
    typeof candidate.sourceBody === 'string' &&
    typeof candidate.targetBody === 'string' &&
    typeof candidate.sourceFrontMatter === 'string' &&
    isRecord(candidate.sourceProperties) &&
    isRecord(candidate.targetProperties) &&
    isRecord(candidate.originalTags) &&
    Object.values(candidate.originalTags).every(
      (tag) => typeof tag === 'string',
    );

  if (!isPreservationRecord) {
    return undefined;
  }

  return candidate as PreservationRecord;
}
