# AGENTS.md

## Overview

This repository is a `pnpm` workspace managed with Turborepo.

- `apps/www`: main `juan.md` Astro site. Uses MDX, React.
- `apps/collocations`: Astro app for collocations. Uses React, and Supabase-backed data/edge functions.
- `packages/ui`: shared UI package consumed by both apps.

## Tooling

- Package manager: `pnpm@10.30.1`
- Runtime target: Node.js `22.12+`
- Task runner: Turborepo
- Linting: ESLint flat config at the repo root
- Formatting: Prettier with Astro and Tailwind plugins

## Commits

- Create commits for each package/app. So if we have changes from app/www, app/collocations and packages/ui, you MUST do 3 commits
- Use conventional commits, for example, feat(www): create about page, style(ui): update component margins or fix(collocations): typo

## Important Paths

- `apps/www/src`: main site source
- `apps/www/src/content/logs`: content collection for the main site
- `apps/collocations/src`: collocations app source
- `apps/collocations/content`: source JSON data for collocations
- `apps/collocations/supabase`: app-specific Supabase functions and migrations
- `packages/ui/src`: shared UI components, icons, utilities, and styles

## Common Commands

Run commands from the repository root unless there is a reason to work inside one package.

- `pnpm install`: install workspace dependencies
- `pnpm dev`: start all `dev` tasks wired through Turbo
- `pnpm dev:www`: start only the main site
- `pnpm dev:collocations`: start only the collocations app
- `pnpm build`: build all workspaces
- `pnpm build:www`: build only `apps/www`
- `pnpm build:collocations`: build only `apps/collocations`
- `pnpm lint`: run ESLint across workspaces
- `pnpm format:check`: check Prettier formatting across workspaces

For package-scoped work, prefer filtered commands:

- `pnpm --filter www <script>`
- `pnpm --filter collocations <script>`
- `pnpm --filter @juan/ui <script>`

## Environment Notes

- `apps/collocations` contains Supabase-related code and data; validate changes there with extra care.

## Working Rules

- Prefer minimal, scoped edits. Keep app-specific changes inside the affected workspace unless the change is intentionally shared.
- If you add or move shared UI code, keep `packages/ui/package.json` exports aligned with the new path.
- Do not edit generated or cache directories such as `.turbo`, `.pnpm-store`, `dist`, or `.astro` unless the task explicitly requires it.
- The repo currently has linting and formatting commands, but no dedicated automated test suite is configured at the root.

## Validation Checklist

After code changes, run the narrowest commands that cover the affected area:

- `pnpm lint`
- `pnpm format:check`
- `pnpm build:www` for main site changes
- `pnpm build:collocations` for collocations changes

If a change only affects `packages/ui`, validate the consuming app build that depends on it.
