export type EmbedInline = {
  type: 'embed';
  target: string;
  alt: string;
  kind: 'image' | 'transclusion' | 'audio' | 'video';
  width?: string;
  height?: string;
  title?: string;
};
