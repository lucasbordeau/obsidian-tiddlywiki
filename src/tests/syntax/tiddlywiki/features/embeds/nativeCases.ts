import { FeatureCase } from '@/tests/syntax/tiddlywiki/features/FeatureCase';

export const nativeCases: FeatureCase[] = [
  { id: 'TW-NOTE-EMBED', source: '{{A complete note}}' },
  { id: 'TW-NOTE-EMBED-TEXT', source: '{{A complete note!!text}}' },
  { id: 'TW-PDF-EMBED', source: '{{documents/report.pdf}}' },
  { id: 'TW-AUDIO-EMBED', source: '{{recordings/audio.mp3}}' },
  { id: 'TW-VIDEO-EMBED', source: '{{recordings/video.mp4}}' },
];
