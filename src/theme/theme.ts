import { render } from "../scribe.ts";
import type { StenoTheme } from "./types.ts";
import { join, dirname } from "@std/path";
import { ensureDirSync } from "../fileUtils.ts";
import { parse as parseYaml } from "@std/yaml";

type ThemeConfig = Record<string, unknown>;

interface ThemeDirectoryMetadata {
  name?: string;
  version?: string;
  components?: Record<string, string>;
  defaultConfig?: ThemeConfig;
}

export class Theme {
  public name: string;
  public version: string;
  public config: ThemeConfig;
  private themeData: StenoTheme;

  constructor(themeData: StenoTheme, userConfig: ThemeConfig = {}) {
    this.themeData = themeData;
    this.name = themeData.name;
    this.version = themeData.version;

    this.config = {
      ...themeData.defaultConfig,
      ...userConfig,
    };
  }

  /**
   * Helper to load a filesystem-based theme directory using a theme.yaml file.
   */
  public static loadFromDirectory(
    dir: string,
    userConfig: ThemeConfig = {},
  ): Theme {
    let yamlContent = "";
    let yamlPath = join(dir, "theme.yaml");
    try {
      yamlContent = Deno.readTextFileSync(yamlPath);
    } catch {
      yamlPath = join(dir, "theme.yml");
      yamlContent = Deno.readTextFileSync(yamlPath);
    }

    const parsedMetadata = parseYaml(yamlContent);
    const metadata: ThemeDirectoryMetadata =
      parsedMetadata && typeof parsedMetadata === "object"
        ? (parsedMetadata as ThemeDirectoryMetadata)
        : {};
    const name = metadata.name || "unnamed";
    const version = metadata.version || "1.0.0";

    const layouts: Record<string, string> = {};
    const layoutsDir = join(dir, "layouts");
    try {
      const layoutsStat = Deno.statSync(layoutsDir);
      if (layoutsStat.isDirectory) {
        for (const entry of Deno.readDirSync(layoutsDir)) {
          if (
            entry.isFile &&
            (entry.name.endsWith(".scr") || entry.name.endsWith(".liquid"))
          ) {
            const key = entry.name.replace(/\.(scr|liquid)$/, "");
            layouts[key] = Deno.readTextFileSync(join(layoutsDir, entry.name));
          }
        }
      }
    } catch {
      // continue
    }

    const components: Record<string, string> = {};
    if (metadata.components) {
      for (const [key, relPath] of Object.entries(metadata.components)) {
        // Capitalize component name
        const capKey = key.charAt(0).toUpperCase() + key.slice(1);
        const fullPath = join(dir, relPath);
        try {
          components[capKey] = Deno.readTextFileSync(fullPath);
        } catch (err) {
          console.error(
            `Failed to load component "${capKey}" from "${fullPath}":`,
            err,
          );
        }
      }
    }

    const assets: Record<string, string | Uint8Array | URL> = {};
    const assetsDir = join(dir, "assets");
    try {
      const assetsStat = Deno.statSync(assetsDir);
      if (assetsStat.isDirectory) {
        const addAssetsRecursively = (currentDir: string, relPrefix = "") => {
          for (const entry of Deno.readDirSync(currentDir)) {
            const fullPath = join(currentDir, entry.name);
            const relPath = relPrefix
              ? `${relPrefix}/${entry.name}`
              : entry.name;
            if (entry.isDirectory) {
              addAssetsRecursively(fullPath, relPath);
            } else if (entry.isFile) {
              assets[relPath] = new URL(`file://${fullPath}`);
            }
          }
        };
        addAssetsRecursively(assetsDir);
      }
    } catch {
      // Assets directory not found, continue
    }

    const themeData: StenoTheme = {
      name,
      version,
      layouts,
      components,
      assets,
      defaultConfig: metadata.defaultConfig || {},
    };

    return new Theme(themeData, userConfig);
  }

  /**
   * Renders a layout template with content and page variables using Scribe.
   */
  public renderLayout(
    layoutName: string,
    content: string,
    variables: Record<string, unknown>,
  ): string {
    const layoutTemplate = this.themeData.layouts[layoutName];
    if (!layoutTemplate) {
      const available = Object.keys(this.themeData.layouts).join(", ");
      throw new Error(
        `Layout "${layoutName}" not found in theme "${this.name}". Available layouts: ${available}`,
      );
    }
    return render({
      template: layoutTemplate,
      context: {
        content,
        ...variables,
      },
      components: this.themeData.components || {},
    });
  }

  /**
   * Renders a theme component using Scribe.
   */
  public renderComponent(
    componentName: string,
    variables: Record<string, unknown>,
  ): string {
    const componentTemplate = this.themeData.components?.[componentName];
    if (!componentTemplate) {
      throw new Error(
        `Component "${componentName}" not found in theme "${this.name}".`,
      );
    }
    return render({
      template: componentTemplate,
      context: variables,
      components: this.themeData.components || {},
    });
  }

  /**
   * Copies all theme assets to the output directory (e.g., dist/assets/).
   */
  public async copyAssets(outputDir: string): Promise<void> {
    if (!this.themeData.assets) return;
    const assetsDir = join(outputDir, "assets");

    for (const [relPath, source] of Object.entries(this.themeData.assets)) {
      const destPath = join(assetsDir, relPath);
      ensureDirSync(dirname(destPath));

      if (typeof source === "string") {
        Deno.writeTextFileSync(destPath, source);
      } else if (source instanceof Uint8Array) {
        Deno.writeFileSync(destPath, source);
      } else if (source instanceof URL) {
        const response = await fetch(source);
        if (!response.ok) {
          throw new Error(`Failed to fetch theme asset: ${source.href}`);
        }
        const buffer = new Uint8Array(await response.arrayBuffer());
        Deno.writeFileSync(destPath, buffer);
      }
    }
  }
}
