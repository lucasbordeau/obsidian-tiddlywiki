export const structuredAttachmentCases = [
  {
    title: 'Board.canvas',
    type: 'application/json',
    text: '{"nodes":[{"id":"a","type":"file","file":"Notes/Été.md","x":0,"y":0,"width":400,"height":200}],"edges":[]}',
  },
  {
    title: 'Library.base',
    type: 'text/plain',
    text: 'filters:\n  and:\n    - file.ext == "md"\nviews:\n  - type: table\n    name: Library\n',
  },
] as const;
