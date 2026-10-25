# NFO Maker v2

Static app for GitHub Pages. No build step.

- `index.html` page layout
- `style.css` styling
- `utils.js` shared helpers
- `api.js` TMDB, OMDb, TVmaze calls
- `nfo.js` NFO XML builders
- `export.js` image downloads, zip, saving
- `list.js` movie lists (match, review, zip per movie)
- `main.js` UI logic

After editing a file, bump its `?v=1` in `index.html` so browsers fetch the new copy.
