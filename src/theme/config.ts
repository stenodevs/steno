import { parse as parseYaml } from "jsr:@std/yaml";
import { parse as parseToml } from "jsr:@std/toml";

export interface ThemeConfig {
  title: string;
  description: string;
  author: string;
  stylesheets?: string[];
  layout: string;
}

export function loadThemeConfig(configPath: string): ThemeConfig {
  const fileContents = Deno.readTextFileSync(configPath);
  if (configPath.endsWith(".yaml") || configPath.endsWith(".yml")) {
    return parseYaml(fileContents) as ThemeConfig;
  } else if (configPath.endsWith(".toml")) {
    const parsedToml = parseToml(fileContents) as unknown;
    return parsedToml as ThemeConfig;
  } else {
    throw new Error("Unsupported config file format. Please use .yaml, .yml, or .toml.");
  }
}
