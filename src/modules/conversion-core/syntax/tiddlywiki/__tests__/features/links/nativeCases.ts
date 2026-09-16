import { FeatureCase } from '@/modules/conversion-core/syntax/tiddlywiki/__tests__/features/FeatureCase';

export const nativeCases: FeatureCase[] = [
  { id: 'TW-LINK-EXACT', source: '[[a label|Folder/Case_Sensitive:é💡]]' },
  { id: 'TW-LINK-URL', source: '[[Web|https://example.org/a_(b)?x=1&y=two]]' },
  {
    id: 'TW-LINK-RELATIVE',
    source: '[ext[relative file|../images/photo.png]]',
  },
  {
    id: 'TW-LINK-EXT-WHITESPACE',
    source: '[ext[ label with spaces | https://example.org/path ]]',
  },
  { id: 'TW-LINK-FILE', source: '[[local|file:///tmp/notes/file.pdf]]' },
  { id: 'TW-LINK-EMAIL', source: '[[email|mailto:owner@example.org]]' },
  {
    id: 'TW-LINK-OBSIDIAN',
    source: '[[vault|obsidian://open?vault=Example&file=Note]]',
  },
  { id: 'TW-LINK-CUSTOM', source: '[ext[custom|custom-scheme:payload]]' },
  { id: 'TW-BARE-URL', source: 'https://example.org/path?x=1&y=two.' },
  { id: 'TW-BARE-EMAIL', source: 'mailto:owner@example.org' },
  { id: 'TW-BARE-FTP', source: 'ftp://example.org/pub/file.txt' },
  { id: 'TW-BARE-FILE', source: 'file:///tmp/file.txt' },
  { id: 'TW-SUPPRESSED-URL', source: '~https://example.org/path' },
  { id: 'TW-SUPPRESSED-EMAIL', source: '~mailto:owner@example.org' },
  { id: 'TW-SUPPRESSED-FTP', source: '~ftp://example.org/file.txt' },
  { id: 'TW-SUPPRESSED-FILE', source: '~file:///tmp/file.txt' },
  { id: 'TW-SUPPRESSED-DATA', source: '~data:text/plain,hello' },
  { id: 'TW-SUPPRESSED-CAMEL', source: '~HelloThere ~AnotherWikiLink' },
  { id: 'TW-SYSTEM-LINK', source: '$:/core/ui/PageTemplate' },
  { id: 'TW-SYSTEM-SUPPRESSED', source: '~$:/core/ui/PageTemplate' },
];
