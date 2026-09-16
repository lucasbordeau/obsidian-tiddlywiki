import { importTiddler } from '@/modules/conversion-core/notes/importTiddler';
import { ObsidianNote } from '@/modules/obsidian/ObsidianNote';
import { Tiddler } from '@/modules/tiddlywiki/Tiddler';

export function convertTiddlersToObsidianNotes(
  tiddlers: Tiddler[],
  referenceTiddlers: Tiddler[] = tiddlers,
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

    return importResult.value;
  });
}
