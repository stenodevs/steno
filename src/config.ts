import { parse as parseYaml } from "jsr:@std/yaml";
import { parse as parseToml } from "jsr:@std/toml";

export interface SiteConfig {
  title: string;
  description: string;
  author: string;
  head?: Array<{ name: string; content: string }>;
  contentDir?: string;
  output?: string;
  custom?: {
    stylesheets?: string[];
    shortUrls?: boolean;
    theme?: string;
  };
}

export function loadConfig(configPath: string): SiteConfig {
  const fileContents = Deno.readTextFileSync(configPath);
  if (configPath.endsWith(".yaml") || configPath.endsWith(".yml")) {
    return parseYaml(fileContents) as SiteConfig;
  } else if (configPath.endsWith(".toml")) {
    const parsedToml = parseToml(fileContents) as unknown;
    return parsedToml as SiteConfig;
  } else {
    throw new Error("Unsupported config file format. Please use .yaml, .yml, or .toml.");
  }
}
