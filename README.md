# SEmap — Saint-Étienne Map

A static full-screen map of the Saint-Étienne area with clickable markers and article previews. Built with Vite (vanilla JS), MapLibre GL JS, and MapTiler Toner basemap. Hosted on GitHub Pages.

## Features1

- Full-screen map restricted to Saint-Étienne and ~30 km (bounds, zoom limits).
- Clickable markers with custom SVG pins.
- Popup “article preview” card: thumbnail, title, excerpt, “Open article” CTA.
- Static article pages with hero image, title, body text, and “Back to map” link.
- Works when deployed under a GitHub Pages subpath (e.g. `https://username.github.io/SEmap/`).
- Responsive layout and attribution footer (OpenStreetMap, MapTiler).

## Tech stack

- **Vite** (vanilla JS + HTML + CSS), static build only.
- **MapLibre GL JS** for the map.
- **MapTiler** Toner style (requires API key for production).

## Local development

1. **Clone and install**

   ```bash
   git clone https://github.com/YOUR_USERNAME/SEmap.git
   cd SEmap
   npm install
   ```

2. **MapTiler key (optional but recommended)**

   Copy the example env file and add your key:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set:

   ```
   VITE_MAPTILER_KEY=your_maptiler_key_here
   ```

   Get a free key at [MapTiler Cloud](https://cloud.maptiler.com/). Without it, the app uses a demo style (no MapTiler Toner).

3. **Run dev server**

   ```bash
   npm run dev
   ```

   Open the URL shown (e.g. `http://localhost:5173/`). For subpath testing:

   ```bash
   npm run dev -- --base /SEmap/
   ```

4. **Preview production build**

   ```bash
   npm run build
   npm run preview -- --base /SEmap/
   ```

## GitHub Pages deployment

### Option A: GitHub Actions (recommended)

1. In the repo: **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push to the `main` branch (or trigger the workflow manually).

The workflow (`.github/workflows/deploy.yml`) will:

- Install dependencies and run `vite build`.
- Set `BASE_PATH=/<REPO_NAME>/` so the site works under `https://username.github.io/<repo>/`.
- Deploy the `dist` folder to GitHub Pages using `actions/deploy-pages`.

**Optional:** To use the MapTiler Toner style in production, add a repository secret:

- **Settings → Secrets and variables → Actions**
- New repository secret: `VITE_MAPTILER_KEY` = your MapTiler API key.

If the secret is not set, the build still runs but uses the demo style (no MapTiler key required).

### Option B: Manual deploy

1. **Build with the correct base** (replace `SEmap` with your repo name if different):

   ```bash
   BASE_PATH=/SEmap/ npm run build
   ```

2. **Deploy the `dist` folder** to the `gh-pages` branch. For example, using the `gh-pages` package:

   ```bash
   npx gh-pages -d dist
   ```

   Or manually:

   - Checkout a new branch (e.g. `gh-pages`), copy the contents of `dist` into the root, commit, and push.
   - In **Settings → Pages**, set the source to the `gh-pages` branch and root.

3. Your site will be at `https://<username>.github.io/SEmap/` (or your repo name).

## Project structure

```
SEmap/
├── index.html              # Map page (entry)
├── vite.config.js         # base: process.env.BASE_PATH || '/'
├── src/
│   ├── main.js            # Map init, markers, popup, BASE_URL for links
│   ├── styles.css         # Map page + popup styles
│   └── data/
│       └── markers.json   # Marker data (id, title, excerpt, image, coordinates, slug)
├── public/
│   ├── article.css        # Shared styles for article pages
│   ├── articles/          # Static article pages (<slug>.html)
│   └── images/            # Thumbnails / hero images (SVG placeholders)
├── .github/workflows/
│   └── deploy.yml         # GitHub Actions → GitHub Pages
└── README.md
```

## URLs and base path

- All app-generated links use `import.meta.env.BASE_URL` (e.g. `articles/<slug>.html`, `images/...`).
- Article pages use relative links: `../` for “Back to map” and `../images/...` for assets, so they work for any base path.
- In `vite.config.js`, `base` is `process.env.BASE_PATH || '/'`. The Actions workflow sets `BASE_PATH=/${{ github.event.repository.name }}/`.

## License

MIT.
