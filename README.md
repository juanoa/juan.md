# juan.md

Monorepo for the `juan.md` sites, managed with `pnpm` workspaces and Turborepo.

## Overview
- Current app lives in `apps/www` and serves the main `juan.md` website.
- Repo is structured to add more sites later, such as `apps/ai` or `apps/cv`.
- Builds and local development are orchestrated from the monorepo root with Turbo.

## Tech Stack
- `pnpm` workspaces for package/app management
- Turborepo for task orchestration and caching
- Astro 5, Tailwind CSS v4, and React inside `apps/www`

## Getting Started
```bash
# install dependencies
pnpm install

# start the current website
pnpm dev

# build all workspace apps/packages
pnpm build

# build only the main site
pnpm build:www

# preview the main site locally
pnpm preview
```

> **Prerequisites:** Node.js 18.18+ and `pnpm`.

## Project Structure
```text
.
├─ apps/
│  └─ www/               # Main Astro site for juan.md
├─ package.json          # Root scripts for Turbo
├─ pnpm-workspace.yaml   # Workspace package discovery
└─ turbo.json            # Task graph and cache config
```

## App Commands
- Run commands directly inside the site with `pnpm --filter www <command>`.
- Main app source lives under `apps/www/src`.
- Static assets for the main app live under `apps/www/public`.

## Deployment
For Vercel, create a project for `www` and point it to `apps/www`. The app already includes a [`vercel.json`](/Users/juan/Develop/juan.md/apps/www/vercel.json) that builds through Turbo and outputs `dist/`. If you add more sites later, create one Vercel project per app and give each app its own domain and `vercel.json` as needed.
