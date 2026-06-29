import type { StenoPlugin } from "../plugins.ts";

/**
 * Defines the contract a Steno theme package must export.
 */
export interface StenoTheme {
  /**
   * The unique name of the theme.
   */
  name: string;

  /**
   * The current version of the theme.
   */
  version: string;

  /**
   * Layout templates, typically using Liquid.
   * Maps layout names (e.g. "default", "post") to template strings.
   */
  layouts: Record<string, string>;

  /**
   * Optional reusable component templates.
   * Maps component names (e.g. "header", "footer") to template strings.
   */
  components?: Record<string, string>;

  /**
   * Optional static assets to be compiled into the output directory's `assets` folder.
   * Maps destination relative paths (e.g. "css/main.css", "images/logo.png") to their content.
   * The content can be:
   * - A string (for text assets like CSS/JS)
   * - A Uint8Array (for binary files)
   * - A URL object (representing a file to fetch/read, e.g. using import.meta.resolve)
   */
  assets?: Record<string, string | Uint8Array | URL>;

  /**
   * Optional schema defining the configuration options the theme supports.
   * This is a JSON Schema object.
   */
  configSchema?: Record<string, ThemeConfigField>;

  /**
   * Optional default configuration values for the theme.
   */
  defaultConfig?: Record<string, unknown>;

  /**
   * Optional plugins bundled with this theme.
   * These are merged with site-level plugins and run on every page build.
   */
  plugins?: StenoPlugin[];
}

export interface ThemeConfigField {
  type: "string" | "number" | "boolean";
  default?: unknown;
  description?: string;
}