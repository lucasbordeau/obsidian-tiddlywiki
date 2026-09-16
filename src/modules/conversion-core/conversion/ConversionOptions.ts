export type ConversionOptions = {
  resolveLink?: (target: string, kind: 'link' | 'embed') => string;
  resolveExternalEmbedKind?: (
    target: string,
  ) => 'image' | 'audio' | 'video' | undefined;
  preserveUnsupportedSource?: boolean;
};
