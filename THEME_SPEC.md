# Steno Theme Specification

This document describes how themes work in the current Steno runtime (`mod.ts`, `src/theme/theme.ts`, `src/scribe.ts`).

## 1) Supported Theme Sources

Steno loads themes from `custom.theme` in `content/.steno/config.yml`:

- Module import (JSR/NPM/URL/local module path): `await import(themeName)`.
- Local theme directory: a directory containing `theme.yaml` or `theme.yml`.

If `custom.theme` points to a local directory without `theme.yaml`/`theme.yml`, Steno falls back to module resolution (`mod.ts` / `theme.ts` / `index.ts`).

## 2) Theme Contract (`StenoTheme`)

Module-based themes should export an object matching `src/theme/types.ts`:

```ts
export interface StenoTheme {
  name: string;
  version: string;
  layouts: Record<string, string>;
  components?: Record<string, string>;
  assets?: Record<string, string | Uint8Array | URL>;
  configSchema?: Record<string, any>;
  defaultConfig?: Record<string, any>;
}
```

Runtime behavior to rely on:

- Default layout key is `layout` (used when page frontmatter does not define `layout`).
- `defaultConfig` is merged with `custom.themeConfig` (`themeConfig` wins).
- Assets are copied to `dist/assets/<relative-path>`.

## 3) Local Directory Theme Format

For directory themes, `theme.yaml`/`theme.yml` provides metadata and optional component map. Example from `test/test-theme/theme.yaml`:

```yaml
name: "Steno Minimalist"
version: "1.0.0"
components:
  header: "components/header.scr"
  footer: "components/footer.scr"
defaultConfig:
  author: "Steno Creator"
```

Directory conventions used by loader (`Theme.loadFromDirectory()`):

- `layouts/*.scr` (and `layouts/*.liquid` files are currently read too)
- `assets/**` recursively copied as theme assets
- Component keys from YAML are normalized to `PascalCase` internally (e.g., `header` -> `Header`)

## 4) Template Engine and Syntax

Steno currently renders themes with **Scribe** (`src/scribe.ts`), not LiquidJS.

Supported Scribe patterns used in this repo:

- Variables and filters: `{ title | upper }`, `{ date | date }`
- HTML passthrough: `{@html content}`
- Conditions: `{#if author}...{:else}...{/if}`
- Loops: `{#each tags as tag}...{/each}`
- Components: `<Header />`, `<Footer />`, including prop expressions like `<Card title={title} />`

See working examples in:

- `test/test-theme/layouts/layout.scr`
- `test/test-theme/layouts/post.scr`
- `test/test-theme/components/header.scr`

## 5) Render Context Passed to Layouts

For each Markdown file, runtime context contains:

- `content`: HTML generated from Markdown body via `marked`
- `site`: global site config (`title`, `description`, `author`, plus config fields)
- `theme`: theme metadata + merged theme config (`name`, `version`, config overrides)
- Frontmatter keys spread at top level (`title`, `layout`, `author`, `tags`, `date`, etc.)

Layout resolution is per-page: `frontmatter.layout || "layout"`.

## 6) Site Configuration Example

```yaml
title: Welcome to my blog
description: This is a blog about my life
author: John Doe

custom:
  shortUrls: true
  theme: "./test-theme"
  themeConfig:
    author: "Overridden Author"
```

Notes:

- Default config path in runtime is `content/.steno/config.yml`.
- With `shortUrls: true`, non-root pages build to `foo/bar/index.html`.

## 7) Publishing Module Themes (JSR)

Theme modules can be published with a standard `deno.json`/`jsr.json` and consumed via:

```yaml
custom:
  theme: "jsr:@scope/theme-name"
```

Keep exported templates aligned with Scribe syntax used by current runtime.
