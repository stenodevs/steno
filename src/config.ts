import { join } from "jsr:@std/path";
import { parse as parseYaml } from "jsr:@std/yaml";

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
  return parseYaml(fileContents) as SiteConfig;
}
