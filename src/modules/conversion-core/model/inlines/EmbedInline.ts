export type EmbedInline = {
  type: 'embed';
  target: string;
  alt: string;
  kind: 'image' | 'transclusion';
  width?: string;
  height?: string;
  title?: string;
};
