import { importTiddler } from '@/modules/conversion-core/notes/importTiddler';
import { parseTiddlyWikiTimestampToEpochMilliseconds } from '@/modules/conversion-core/metadata/parseTiddlyWikiTimestampToEpochMilliseconds';
import { ConversionDiagnostic } from '@/modules/conversion-core/conversion/ConversionDiagnostic';
import { ObsidianNote } from '@/modules/obsidian/ObsidianNote';
import { Tiddler } from '@/modules/tiddlywiki/Tiddler';

export function convertTiddlersToObsidianNotes(
  tiddlers: Tiddler[],
  referenceTiddlers: Tiddler[] = tiddlers,
  reportDiagnostic?: (title: string, diagnostic: ConversionDiagnostic) => void,
): ObsidianNote[] {
  const canonicalTargets = new Map(
    referenceTiddlers.flatMap((tiddler) => {
      const canonicalUri = tiddler._canonical_uri;

      return canonicalUri ? [[tiddler.title, canonicalUri] as const] : [];
    }),
  );

  const canonicalMediaKinds = new Map(
    referenceTiddlers.flatMap((tiddler) => {
      const mediaCategory = tiddler.type?.split('/')[0];

      const isMediaCategory =
        mediaCategory === 'image' ||
        mediaCategory === 'audio' ||
        mediaCategory === 'video';

      if (!tiddler._canonical_uri || !isMediaCategory) {
        return [];
      }

      return [[tiddler.title, mediaCategory] as const];
    }),
  );

  const resolveImportedTarget = (target: string): string =>
    canonicalTargets.get(target) ?? target;

  const resolveExternalEmbedKind = (target: string) =>
    canonicalMediaKinds.get(target);

  return tiddlers.map((tiddler) => {
    const importResult = importTiddler(tiddler, {
      preserveRoundTripMetadata: false,
      preserveUnsupportedSource: false,
      metadataProjection: 'migration',
      resolveLink: resolveImportedTarget,
      resolveExternalEmbedKind,
    });

    if (!importResult.value) {
      throw new Error(
        importResult.diagnostics
          .map((diagnostic) => diagnostic.message)
          .join('\n'),
      );
    }

    for (const diagnostic of importResult.diagnostics) {
      reportDiagnostic?.(tiddler.title, diagnostic);
    }

    const note: ObsidianNote = { ...importResult.value };

    const creationTimeMs = parseTiddlyWikiTimestampToEpochMilliseconds(
      tiddler.created,
    );

    const modificationTimeMs = parseTiddlyWikiTimestampToEpochMilliseconds(
      tiddler.modified,
    );

    if (creationTimeMs !== undefined) {
      note.creationTimeMs = creationTimeMs;
    }

    if (modificationTimeMs !== undefined) {
      note.modificationTimeMs = modificationTimeMs;
    }

    return note;
  });
}
