import type { Token, TokensList } from "marked";
import type { SiteConfig } from "./config.ts";

/**
 * Defines the structure of a Steno plugin.
 */
export interface StenoPlugin {
  /** The name of the plugin. */
  name: string;
  /**
   * An optional function that transforms the Markdown Abstract Syntax Tree (AST) tokens.
   * This function receives a `TokensList` and should return a (potentially modified) `TokensList`.
   */
  transformAst?: (tokens: TokensList) => TokensList | Promise<TokensList>;
  /**
   * An optional function that transforms the generated HTML string.
   * This function receives an HTML string and should return a (potentially modified) HTML string.
   */
  transformHtml?: (html: string) => string | Promise<string>;
  /**
   * Called before the build process starts.
   * Useful for setup tasks such as creating temp files or validating config.
   */
  beforeBuild?: (config: SiteConfig) => void | Promise<void>;
  /**
   * Called after each page has been rendered and written to the output directory.
   * Useful for per-page post-processing.
   */
  afterPage?: (page: { path: string; html: string }) => void | Promise<void>;
  /**
   * Called after the entire build is complete.
   * Useful for generating derived files such as CSS, sitemaps, or manifests.
   */
  afterBuild?: (config: SiteConfig) => void | Promise<void>;
}

/**
 * Runs all registered AST transformation plugins on the given Markdown tokens.
 *
 * @param tokens The Markdown tokens to transform.
 * @param plugins An array of Steno plugins.
 * @returns A promise that resolves to the transformed Markdown tokens.
 */
export async function runAstTransforms(
  tokens: TokensList,
  plugins: StenoPlugin[],
): Promise<TokensList> {
  for (const plugin of plugins) {
    if (plugin.transformAst) {
      tokens = await plugin.transformAst(tokens);
    }
  }
  return tokens;
}

/**
 * Runs all registered HTML transformation plugins on the given HTML string.
 *
 * @param html The HTML string to transform.
 * @param plugins An array of Steno plugins.
 * @returns A promise that resolves to the transformed HTML string.
 */
export async function runHtmlTransforms(
  html: string,
  plugins: StenoPlugin[],
): Promise<string> {
  for (const plugin of plugins) {
    if (plugin.transformHtml) {
      html = await plugin.transformHtml(html);
    }
  }
  return html;
}
