# Hot Reload fixture

PJ Eby's [Hot Reload](https://github.com/pjeby/hot-reload) 0.3.1 is bundled so
manual testing works offline after dependency installation. These are unchanged
upstream files from commit
[`4c5454963ec4cbe847302d3063ada4b4204d7e95`](https://github.com/pjeby/hot-reload/tree/4c5454963ec4cbe847302d3063ada4b4204d7e95).
The upstream `main.js` is stored as `main.cjs` and installed as `main.js`.

| Upstream file | SHA-256 |
| --- | --- |
| `main.js` | `f7faa4723537881ff7e5eef23ff3419300dcbbca49768d834bceeeb53f821201` |
| `manifest.json` | `62bab306528e1ba54382417f1cb6b78ae1e4e9a00e3169b812818949273d32f8` |
| `LICENSE` | `73c94d2a3e9cbe0661f3303aeb00d9d30fe628f13133a917d9baca775845bac1` |

The installer verifies all three hashes before installing. The included upstream
license permits redistribution and is copied alongside the installed plugin.
Keep these files out of source formatting and lint fixes. To update the bundled
version, fetch all three assets from one official commit, review the changes and
license, and update the hashes in this file and `install-hot-reload.mjs` together.
