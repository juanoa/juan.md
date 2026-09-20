# AGENTS.md

## Overview

This repository contains the `juan.md` website as a single Astro project. It uses MDX, React, Tailwind CSS v4, and local UI components.

## Tooling

- Package manager: `pnpm@10.30.1`
- Runtime target: Node.js `22.12+`
- Build tooling: Astro
- Linting: ESLint flat config
- Formatting: Prettier with Astro and Tailwind plugins

## Commits

- Use conventional commits, for example `feat(www): create about page`, `style(www): update component margins`, or `fix(www): correct a typo`.

## Important Paths

- `src`: application source
- `src/content/logs`: content collection
- `src/components/ui`: local UI primitives
- `src/styles/globals.css`: global styles and theme
- `public`: static assets

## Common Commands

- `pnpm install`: install dependencies
- `pnpm dev`: start the development server
- `pnpm build`: build the site
- `pnpm preview`: preview the production build
- `pnpm lint`: run ESLint
- `pnpm format:check`: check formatting

## Working Rules

- Prefer minimal, scoped edits.
- Use Tailwind CSS utility classes for component styling. Never use CSS Modules.
- Keep shared-looking UI code local to `src/components/ui` unless a separate package is intentionally introduced.
- Do not edit generated or cache directories such as `dist` or `.astro` unless the task explicitly requires it.
- No dedicated automated test suite is configured.

## Validation Checklist

After code changes, run the narrowest commands that cover the affected area:

- `pnpm lint`
- `pnpm format:check`
- `pnpm build`
