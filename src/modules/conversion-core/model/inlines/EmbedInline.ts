export type EmbedInline = {
  type: 'embed';
  target: string;
  alt: string;
  kind: 'image' | 'note';
  width?: string;
  height?: string;
  title?: string;
};
