import { FeatureCase } from '../FeatureCase';

export const preservedCases: FeatureCase[] = [
  {
    id: 'TW-COMMENT-HTML',
    source: '<!-- <script>literal</script> [[comment]] -->',
  },
  { id: 'TW-COMMENT-WIKI', source: "/% ''hidden'' [[hidden]] %/" },
  { id: 'TW-HTML-SCRIPT', source: '<script>const x = "[[literal]]";</script>' },
  {
    id: 'TW-HTML-SVG',
    source: '<svg><foreignObject><div>[[literal]]</div></foreignObject></svg>',
  },
  {
    id: 'TW-HTML-AUDIO',
    source: '<audio controls src="recording.mp3"></audio>',
  },
  { id: 'TW-HTML-VIDEO', source: '<video controls src="movie.mp4"></video>' },
  {
    id: 'TW-HTML-IFRAME',
    source: '<iframe src="https://example.org/document.pdf"></iframe>',
  },
];
