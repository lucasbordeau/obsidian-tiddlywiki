export const preservedHtmlSources = [
  [
    'html iframe',
    '<iframe src="https://example.org/embed?a=1&amp;b=2" width="640" height="320"></iframe>',
  ],
  [
    'HTML video',
    '<video controls src="assets/film.mp4"><track src="captions.vtt"></video>',
  ],
  [
    'HTML audio',
    '<audio controls><source src="assets/audio.ogg" type="audio/ogg"></audio>',
  ],
  [
    'HTML details',
    '<details><summary>Open</summary>**literal** [[literal]]</details>',
  ],
  [
    'styled HTML',
    '<div class="custom" style="color:red">**literal** <span>[[literal]]</span></div>',
  ],
  ['HTML comment', '<!-- ![[hidden.png]] **hidden** -->'],
  ['inline comment', '%% ![[hidden.pdf]] [[hidden]] **hidden** %%'],
  ['multiline comment', '%%\n# hidden heading\n\n![[hidden.png]]\n%%'],
  ['block identifier', 'A paragraph with **bold**. ^evidence-42'],
  ['structured block identifier', '- One\n- Two\n\n^list-id'],
  [
    'inline footnote',
    'A claim^[A **strong** aside with [[Note|alias]] and `]`].',
  ],
] as const;
