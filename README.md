# juan.md

Monorepo for the `juan.md` sites, managed with `pnpm` workspaces and Turborepo.

## Overview
- Current app lives in `apps/www` and serves the main `juan.md` website.
- `apps/collocations` contains the collocations app.
- Repo is structured to host multiple sites/apps in the same workspace.
- Builds and local development are orchestrated from the monorepo root with Turbo.

## Tech Stack
- `pnpm` workspaces for package/app management
- Turborepo for task orchestration and caching
- Astro apps in `apps/*`, with Tailwind CSS v4 and React used inside `apps/www`

## Getting Started
```bash
# install dependencies
pnpm install

# start the current website
pnpm dev

# start the collocations app
pnpm dev:collocations

# build all workspace apps/packages
pnpm build

# build only the main site
pnpm build:www

# build only the collocations app
pnpm build:collocations

# preview the main site locally
pnpm preview

# preview the collocations app locally
pnpm preview:collocations
```

> **Prerequisites:** Node.js 22.12+ and `pnpm`.

## Project Structure
```text
.
├─ apps/
│  ├─ collocations/      # Collocations Astro app
│  └─ www/               # Main Astro site for juan.md
├─ package.json          # Root scripts for Turbo
├─ pnpm-workspace.yaml   # Workspace package discovery
└─ turbo.json            # Task graph and cache config
```

## App Commands
- Run commands directly inside the site with `pnpm --filter www <command>`.
- Run commands directly inside the collocations app with `pnpm --filter collocations <command>`.
- Main app source lives under `apps/www/src`.
- Static assets for the main app live under `apps/www/public`.
- Collocations source lives under `apps/collocations/src`.
- Static assets for collocations live under `apps/collocations/public`.

## Deployment

- Using Vercel
