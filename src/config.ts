import { parse as parseYaml } from "@std/yaml";
import { parse as parseToml } from "@std/toml";
import type { StenoPlugin } from "./plugins.ts";

/**
 * Represents an entry for a Steno plugin, allowing for package specification and optional configuration.
 */
export interface PluginEntry {
  /** The package name or URL of the plugin. */
  package: string;
  /** Optional configuration options to pass to the plugin. */
  options?: Record<string, unknown>;
}

/**
 * Represents the configuration for a Steno site.
 */
export interface SiteConfig {
  /** The title of the website. */
  title: string;
  /** A brief description of the website. */
  description: string;
  /** The author of the website. */
  author: string;
  /** Optional array of objects to be included in the `<head>` section of the HTML. */
  head?: Array<{ name: string; content: string }>;
  /** The directory where markdown content files are located. Defaults to "content". */
  contentDir?: string;
  /** The output directory for the generated static files. Defaults to "dist". */
  output?: string;
  /** An array of plugins to be loaded, specified as package names or objects with options. */
  plugins?: Array<string | PluginEntry>;
  /** Custom configuration options. */
  custom?: {
    /** Optional array of stylesheet URLs to be included. */
    stylesheets?: string[];
    /** If true, generates "short URLs" (e.g., /about/ instead of /about.html). */
    shortUrls?: boolean;
    /** The name or path of the theme to use. */
    theme?: string;
    /** Configuration options specific to the chosen theme. */
    themeConfig?: Record<string, unknown>;
  };
}

/**
 * Dynamically loads and initializes Steno plugins based on the provided site configuration.
 *
 * @param config The site configuration object.
 * @returns A promise that resolves to an array of initialized Steno plugins.
 */
export async function loadPlugins(
  config: SiteConfig,
): Promise<StenoPlugin[]> {
  if (!config.plugins?.length) return [];

  const plugins: StenoPlugin[] = [];

  for (const entry of config.plugins) {
    const packageName = typeof entry === "string" ? entry : entry.package;
    const options = typeof entry === "string" ? {} : (entry.options ?? {});

    try {
      const mod = await import(packageName);
      const factory = mod.default ?? mod;

      if (typeof factory !== "function") {
        console.warn(
          `Plugin "${packageName}" does not export a default function, skipping.`,
        );
        continue;
      }

      plugins.push(factory(options));
    } catch (err) {
      console.error(`Failed to load plugin "${packageName}":`, err);
    }
  }

  return plugins;
}

/**
 * Loads the site configuration from a specified file path.
 * Supports YAML (.yaml, .yml) and TOML (.toml) formats.
 *
 * @param configPath The absolute or relative path to the configuration file.
 * @returns The parsed SiteConfig object.
 * @throws {Error} If the file format is unsupported or the file cannot be read.
 */
export function loadConfig(configPath: string): SiteConfig {
  const fileContents = Deno.readTextFileSync(configPath);
  if (configPath.endsWith(".yaml") || configPath.endsWith(".yml")) {
    return parseYaml(fileContents) as SiteConfig;
  } else if (configPath.endsWith(".toml")) {
    return parseToml(fileContents) as unknown as SiteConfig;
  } else {
    throw new Error(
      `Unsupported config file format at "${configPath}". Please use .yaml, .yml, or .toml.`,
    );
  }
}