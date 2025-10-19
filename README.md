# juan.md

Personal site for Juan Otalora built with Astro 5, Tailwind CSS v4, and a dash of Preact for interactive touches.

## Overview
- Landing page pairs a bold vertical layout with location highlights, contact links, and work-in-progress callouts.
- Blog section sources Markdown posts and ships an automatically generated RSS feed.
- Persistent light/dark theme toggle and responsive navigation are progressively enhanced with vanilla JS.
- Custom Neue Haas Display typefaces are served locally for consistent typography.

## Tech Stack
- Astro 5 with content collections driven by filesystem routes
- Tailwind CSS (via `@tailwindcss/vite`) for utility-first styling
- Preact islands for interactive UI (`src/components/Greeting.jsx`)
- TypeScript-ready tooling (see `tsconfig.json`)

## Getting Started
```bash
# install dependencies
npm install

# start the development server
npm run dev

# build for production
npm run build

# preview the production build locally
npm run preview
```

> **Prerequisites:** Node.js 18.18+ (Astro’s current LTS baseline) and npm 9+.

## Project Structure
```text
.
├─ public/               # Static assets (fonts, images, favicon)
├─ src/
│  ├─ components/        # Astro/Preact UI fragments (menu, footer, theme toggle, etc.)
│  ├─ layouts/           # Shared page shells, including MarkdownPostLayout
│  ├─ pages/             # Route-based pages, RSS feed, and Markdown blog posts
│  ├─ scripts/           # Small enhancement scripts (mobile menu toggle)
│  └─ styles/            # Global Tailwind entry point and custom layers
├─ astro.config.mjs      # Astro configuration, integrations, and site metadata
├─ package.json          # Scripts and dependencies
└─ tsconfig.json         # Optional TypeScript/IDE support
```

## Customization Notes
- Hero content and contact links live in `src/pages/index.astro`; update copy, imagery, and email addresses there.
- Blog posts are Markdown files under `src/pages/posts/`; include frontmatter to surface metadata in the list and RSS feed.
- Adjust typography or add Tailwind design tokens in `src/styles/global.css`. Font files are served from `public/fonts/`.
- The theme toggle persists state via `src/components/ThemeIcon.astro`; tweak SVG artwork or behavior as needed.
- Navigation and responsive behavior are handled by `src/components/Menu.astro`, `src/components/Navigation.astro`, and `src/scripts/menu.js`.

## Deployment
Run `npm run build` and serve the generated `dist/` directory with any static host (Astro sets the canonical site URL to `https://juan.md` in `astro.config.mjs`). When deploying elsewhere, remember to update that `site` value for accurate canonical links and RSS metadata.
