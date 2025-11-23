# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal website for Juan Otalora built with Astro 5, Tailwind CSS v4, and React. The site features a portfolio landing page, blog functionality with RSS feed, and responsive navigation with theme toggle.

**Prerequisites:** Node.js 18.18+ and npm 9+

## Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production (outputs to dist/)
npm run build

# Preview production build locally
npm run preview
```

## Architecture

### Layout System

The site uses a flexible layout pattern:

- **BaseLayout** (`src/layouts/BaseLayout.astro`): Root layout that handles:
  - Global CSS imports
  - HTML structure and metadata
  - Optional Header component via `showHeader` prop
  - Automatic content padding when Header is shown (200px top padding)

- **MarkdownPostLayout** (`src/layouts/MarkdownPostLayout.astro`): Extends BaseLayout for blog posts

### Page Patterns

Two distinct page styles exist:

1. **Landing Page** (`src/pages/index.astro`):
   - Split-screen layout (left: black panel with Spain map, right: content panel)
   - Does NOT use BaseLayout's Header
   - Contains its own Logo component instance
   - Uses SharpRightArrow icon for navigation affordances

2. **Content Pages** (`src/pages/about.astro`, blog posts):
   - Use BaseLayout with `showHeader` prop
   - Fixed transparent Header with Logo at top
   - Content area automatically padded to avoid Header overlap

### Component Organization

**Header Component** (`src/components/Header.astro`):
- Fixed position navbar at top of viewport
- Transparent background
- Currently contains only Logo
- Controlled by BaseLayout's `showHeader` prop

**Logo Component** (`src/components/logo.astro`):
- Wrapped in link to home route (`/`)
- Used in both Header (for content pages) and directly in index.astro (for landing)
- Displays name and current role

**Navigation Components**:
- Menu, Navigation: Used for blog/tag pages
- SharpRightArrow: Icon component for visual navigation cues

## Styling Approach

### Tailwind CSS v4

- Uses `@tailwindcss/vite` plugin (configured in `astro.config.mjs`)
- Import at top of `src/styles/global.css`
- **Always use Tailwind utility classes** - avoid adding `<style>` blocks when Tailwind classes suffice
- Custom @layer directives can be added to `global.css` if needed

### Typography

Custom Neue Haas Display fonts served locally from `public/fonts/`:
- Weights: 100 (Thin), 300 (Light), 400 (Roman), 500 (Medium), 700 (Bold), 900 (Black)
- Font-face declarations in `src/styles/global.css`
- Applied globally via `@layer base`

## Content Management

### Blog Posts

- Markdown files in `src/pages/posts/`
- Require frontmatter for metadata (title, date, tags, etc.)
- Use MarkdownPostLayout automatically
- RSS feed generated from posts

### Static Assets

- `public/`: Fonts, images, favicon, SVGs (e.g., Spain map)
- Referenced with absolute paths: `/fonts/`, `/images/`

## Site Configuration

- Canonical URL: `https://juan.md` (set in `astro.config.mjs`)
- Update `site` value when deploying to different domain
- Affects RSS feed URLs and canonical links

## Key Patterns

1. **When adding new content pages**: Use BaseLayout with `showHeader` prop
2. **When styling**: Prefer Tailwind utilities over custom CSS
3. **When adding icons**: Follow SharpRightArrow pattern (SVG component with className prop)
4. **When working with fonts**: All font files already loaded; use font-weight classes
