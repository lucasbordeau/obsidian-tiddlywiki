export type ConversionOptions = {
  resolveLink?: (target: string, kind: 'link' | 'embed') => string;
  preserveUnsupportedSource?: boolean;
};
