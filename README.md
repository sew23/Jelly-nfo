# 🎬 Jelly NFO Maker

**Build Kodi/Jellyfin metadata (`.nfo` files and artwork) from your phone, so your media server never has to go online.**

A static web app for GitHub Pages. No server, no build step, no accounts beyond two free API keys.

**Live app:** https://sew23.github.io/Jelly-nfo/v2/

---

## Why this exists

Jellyfin's own scrapers run on the server, so the server needs internet access. If you keep your library fully offline, that's a problem.

This app flips it around:

```
 phone / online PC                         offline library PC
┌───────────────────────────┐   zip via   ┌──────────────────────┐
│ search → review → download│ ──────────▶ │ unzip next to videos │
│ (TMDB · OMDb · TVmaze)    │ USB / cable │ refresh Jellyfin     │
└───────────────────────────┘             └──────────────────────┘
```

Only finished files cross over. The library is never connected.

## Features

| Feature | What it does |
|---|---|
| **Movie and TV search** | Search TMDB, pick the right result from a list with year and overview. |
| **Single season** | Pick a season and an optional episode range. Only aired episodes are included. |
| **Batch mode** | "All seasons" builds a whole show in one zip. |
| **Editable preview** | Fix episode titles, runtimes and plots before exporting (single-season mode). |
| **Ratings** | IMDb score and votes plus Rotten Tomatoes critics % from OMDb, in the Kodi `<ratings>` schema. Optional per-episode IMDb scores. |
| **Flags panel** | Shows data gaps, source disagreements, unaired episodes and early-release warnings instead of hiding them. |
| **Images** | Poster, backdrop, logo, season posters and episode thumbnails, in medium or original size. |
| **Images only** | Skip the NFOs and download just the artwork. |
| **Movie lists** | Paste up to 50 titles, review the matches, get one zip with a folder per movie and a `report.txt`. |
| **Rename scripts** | Paste a `dir /b` listing and get `rename.bat` plus `undo.bat` to rename videos to match the NFOs. |

## What you get

**TV**

```
Show Name S01 NFO.zip
├── tvshow.nfo
├── season01.nfo
├── Show Name S01E01.nfo
├── Show Name S01E02.nfo
├── poster.jpg                      (optional)
├── fanart.jpg                      (optional, the backdrop)
├── logo.png                        (optional)
├── season01-poster.jpg             (optional)
└── Show Name S01E01-thumb.jpg      (optional)
```

**Movie:** a single `movie.nfo`, or a zip with images if you tick any. **Movie lists** get one folder per movie, such as `Mayday (2021)/movie.nfo`.

File names have characters that Windows forbids removed. Episode files use `Show Name SxxExx` so they line up with your video names.

## Setup

1. **Get two free API keys**
   - **TMDB** (v3 API key): create an account at themoviedb.org, then Settings → API.
   - **OMDb:** request a key at omdbapi.com/apikey.aspx (the free tier allows 1,000 requests a day).
2. **Open the app** and expand "API keys". Paste both and tap **Save keys**. They're stored in your browser only.
3. **Search** a title, pick it, choose options and download.
4. **Unzip** the files into the matching show or movie folder on your library PC.
5. In Jellyfin, enable the NFO reader and local images for the library, then refresh its metadata.

## Using the rename scripts

Jellyfin links an NFO to a video only when the base names match.

1. On the library PC, run `dir /b` in the show folder and copy the output.
2. Open "Rename videos", enter the show name, paste the list and tap **Preview renames**.
3. Fix any row marked "Set season and episode".
4. Download the zip. Put `rename.bat` in the show folder and run it. `undo.bat` reverses it.

The scripts never overwrite an existing file. Renaming video files may make Jellyfin treat them as new items, which can reset watch history, so try a single episode first.

## Where the data comes from

| Source | Used for |
|---|---|
| [TMDB](https://www.themoviedb.org) | Search, plots, cast, episodes, runtimes, genres, studios, images |
| [OMDb](https://www.omdbapi.com) | IMDb scores and votes, Rotten Tomatoes critics % (series or movie level), per-episode IMDb scores |
| [TVmaze](https://www.tvmaze.com) | Fills gaps in recent episodes and cross-checks titles and dates |

This product uses the TMDB API but is not endorsed or certified by TMDB.

## Good to know

- **Season-level Rotten Tomatoes scores** have no free API. Type them into the season fields yourself. They go in `seasonXX.nfo` only.
- **Series-level scores** are never presented as season scores.
- **New releases:** ratings are early and volatile, and the flags panel says so.
- **Plots** are the sources' text as-is, not rewritten.
- **Episode cast** lists guest stars only, because TMDB doesn't say which regulars appear in which episode. The main cast is in `tvshow.nfo`.
- **Browser limits:** if a browser blocks image downloads, the app tells you which ones failed and still gives you the rest.

## Privacy

Your keys live in your browser's local storage. The app talks directly to TMDB, OMDb, TVmaze and TMDB's image server. There is no backend, and the JSZip library loads from cdnjs.

## Project layout

```
index.html    page layout
style.css     styling
utils.js      shared helpers
api.js        TMDB, OMDb, TVmaze calls
nfo.js        NFO XML builders
export.js     image downloads, zip, saving
list.js       movie lists
rename.js     rename script generator
main.js       UI logic
```

There's no build step: scripts load in order from `index.html`. After editing a file, bump its `?v=` number in `index.html` so browsers fetch the new copy.

## Deploying on GitHub Pages

Settings → Pages → Deploy from a branch → `main` / root. The app is served at `https://<username>.github.io/<repo>/`.

## Ideas for later

- A placeholder-file generator for bulk metadata runs
- Movie renaming to `Title (Year)`
- Search by year or ID
