import type { PreservedSource } from './PreservedSource';
import { isRecord } from '../../validation/isRecord';

export function decodePreservedSource(
  comment: string,
): PreservedSource | undefined {
  const match = /^<!--otw:v1:([^<>]*?)-->$/.exec(comment);

  if (!match) {
    return undefined;
  }

  try {
    const payload: unknown = JSON.parse(decodeURIComponent(match[1]));

    if (!isRecord(payload)) {
      return undefined;
    }

    const hasSupportedDialect =
      payload.dialect === 'obsidian' || payload.dialect === 'tiddlywiki';

    const hasSourceFields =
      typeof payload.value === 'string' && typeof payload.reason === 'string';

    if (!hasSupportedDialect || !hasSourceFields) {
      return undefined;
    }

    return payload as PreservedSource;
  } catch {
    return undefined;
  }
}
