export const separatedStatements = [
  [
    'declaration and operation',
    'const note = {};\npublish(note);',
    'const note = {};\n\npublish(note);',
  ],
  [
    'operation and declaration',
    'read();\nconst note = {};',
    'read();\n\nconst note = {};',
  ],
  [
    'return',
    'function read() {\nconst value = 1;\nreturn value;\n}',
    'function read() {\nconst value = 1;\n\nreturn value;\n}',
  ],
  [
    'throw',
    'function read() {\nlog();\nthrow Error();\n}',
    'function read() {\nlog();\n\nthrow Error();\n}',
  ],
  [
    'continue',
    'for (;;) {\nlog();\ncontinue;\n}',
    'for (;;) {\nlog();\n\ncontinue;\n}',
  ],
  ['break', 'for (;;) {\nlog();\nbreak;\n}', 'for (;;) {\nlog();\n\nbreak;\n}'],
  [
    'sibling blocks',
    'if (ready) {}\nif (done) {}',
    'if (ready) {}\n\nif (done) {}',
  ],
  [
    'block and operation',
    'if (ready) {}\nfinish();',
    'if (ready) {}\n\nfinish();',
  ],
  [
    'operation and block',
    'start();\nif (ready) {}',
    'start();\n\nif (ready) {}',
  ],
  [
    'multiline declaration',
    'const notes = [\n1,\n2,\n];\nconst count = 2;',
    'const notes = [\n1,\n2,\n];\n\nconst count = 2;',
  ],
  [
    'multiline operation',
    'start();\npublish(\nnotes,\n);\nfinish();',
    'start();\n\npublish(\nnotes,\n);\n\nfinish();',
  ],
  [
    'imports and declarations',
    'import A from "a";\nimport B from "b";\nconst result = A + B;',
    'import A from "a";\nimport B from "b";\n\nconst result = A + B;',
  ],
  [
    'exported declaration',
    'export const value = 1;\npublish(value);',
    'export const value = 1;\n\npublish(value);',
  ],
  [
    'class and declaration',
    'class Note {}\nconst note = new Note();',
    'class Note {}\n\nconst note = new Note();',
  ],
  [
    'labeled block',
    'loop: while (ready) {}\nfinish();',
    'loop: while (ready) {}\n\nfinish();',
  ],
  [
    'static block',
    'class Note { static { const value = 1; publish(value); } }',
    'class Note { static { const value = 1;\n\n publish(value); } }',
  ],
  [
    'leading comment',
    'const value = 1;\n// Publish the value.\npublish(value);',
    'const value = 1;\n\n// Publish the value.\npublish(value);',
  ],
  [
    'trailing comment',
    'const value = 1; // Keep this label.\npublish(value);',
    'const value = 1; // Keep this label.\n\npublish(value);',
  ],
  [
    'comment chain',
    'const value = 1; /* trailing */\n// leading\npublish(value);',
    'const value = 1; /* trailing */\n\n// leading\npublish(value);',
  ],
  [
    'internal comment blank',
    'const value = 1;\n/* leading\n\ntext */\npublish(value);',
    'const value = 1;\n\n/* leading\n\ntext */\npublish(value);',
  ],
  [
    'eslint next-line',
    'const value = 1;\n// eslint-disable-next-line no-console\nconsole.log(value);',
    'const value = 1;\n\n// eslint-disable-next-line no-console\nconsole.log(value);',
  ],
  [
    'inline next-line',
    'const value = 1; // eslint-disable-next-line no-console\nconsole.log(value);',
    'const value = 1;\n\n // eslint-disable-next-line no-console\nconsole.log(value);',
  ],
  [
    'ignore directive',
    'const value = 1;\n// @ts-ignore\npublish(value);',
    'const value = 1;\n\n// @ts-ignore\npublish(value);',
  ],
  [
    'expect-error directive',
    'const value = 1;\n// @ts-expect-error reason\npublish(value);',
    'const value = 1;\n\n// @ts-expect-error reason\npublish(value);',
  ],
  [
    'template contents',
    'const value = `first\n\nsecond`;\npublish(value);',
    'const value = `first\n\nsecond`;\n\npublish(value);',
  ],
  [
    'CRLF',
    'const value = 1;\r\n// @ts-ignore\r\npublish(value);',
    'const value = 1;\r\n\r\n// @ts-ignore\r\npublish(value);',
  ],
  [
    'CR',
    'const value = 1;\rpublish(value);',
    'const value = 1;\r\rpublish(value);',
  ],
];
