import { loadConfig, type SiteConfig } from "./src/config.ts";
import type { ThemeConfig } from "./src/theme/config.ts";
import { ensureDirSync } from "./src/fileUtils.ts";
import { parseFrontmatter } from "./src/frontmatter.ts";
import type { wrapWithTemplate as _wrapWithTemplate } from "./src/template.ts";
import { startDevServer } from "./src/server.ts";
import { marked } from "https://esm.sh/marked@15.0.4";
import { Liquid } from "https://esm.sh/liquidjs@10.19.1";
import { join } from "jsr:@std/path";
import { parse as YAML } from "jsr:@std/yaml";
import { parse as TOML } from "jsr:@std/toml";

export class Steno {
  private config: SiteConfig;
  private theme?: Theme;

  constructor(configPath: string = "content/.steno/config.yml") {
    this.config = loadConfig(configPath);
    if (this.config.custom?.theme) {
      this.theme = new Theme(
        this.config.custom.theme,
        `@stenothemes/${this.config.custom.theme}/theme.css`,
      );
    }
    this.init();
  }

  public build(): void {
    const contentDir = this.config.contentDir || "content";
    const outputDir = this.config.output || "dist";

    ensureDirSync(outputDir);

    for (const file of Deno.readDirSync(contentDir)) {
      const filePath = join(contentDir, file.name);
      if (Deno.statSync(filePath).isFile) {
        const fileContents = Deno.readTextFileSync(filePath);

        // Parse frontmatter and content body

        const { frontmatter, body } = parseFrontmatter(fileContents);

        // Convert Markdown to HTML
        const htmlContent = marked(body);

        // Determine output file path
        let outputFilePath = join(outputDir, file.name.replace(".md", ".html"));
        if (this.config.custom?.shortUrls) {
          if (file.name !== "index.md") {
            outputFilePath = join(outputDir, file.name.replace(".md", ""));
            ensureDirSync(outputFilePath);
            outputFilePath = join(outputFilePath, "index.html");
          } else {
            outputFilePath = join(outputDir, "index.html");
          }
        }

        // Render using the theme's layout
        const renderedContent =
          this.theme?.renderLayout("layout", htmlContent, {
            title: frontmatter.title || this.config.title,
            ...frontmatter,
          }) || htmlContent;

        // Write the rendered content to the output file
        Deno.writeTextFileSync(outputFilePath, renderedContent);
      }
    }

    console.log("Build complete.");
  }

  public async dev(): Promise<void> {
    await startDevServer(this.config.output || "dist");
  }

  private init() {
    if (Deno.args.includes("dev")) {
      this.dev();
    } else {
      this.build();
    }
  }
}

export class Theme {
  private config: ThemeConfig;
  private layoutsDir: string;
  private componentsDir: string;

  constructor(themeName: string, themePath: string) {
    this.config = this.loadThemeConfig(themeName, themePath);
    this.layoutsDir = join(themePath, this.config.layoutsDir || "layouts");
    this.componentsDir = join(
      themePath,
      this.config.componentsDir || "components",
    );
  }

  private loadThemeConfig(_themeName: string, themePath: string): ThemeConfig {
    const configFilePath = themePath.endsWith("theme.yml")
      ? themePath
      : themePath.endsWith("theme.toml")
      ? themePath
      : join(themePath, "theme.yml");

    console.log("Attempting to read theme config file at:", configFilePath);

    const configContent = Deno.readTextFileSync(configFilePath);

    if (configFilePath.endsWith("theme.toml")) {
      return TOML(configContent) as unknown as ThemeConfig;
    }

    return YAML(configContent) as ThemeConfig;
  }

  public renderLayout(
    layoutName: string,
    content: string,
    variables: Record<string, any>,
  ): string {
    const layoutPath = join(this.layoutsDir, `${layoutName}.liquid`);
    const layoutTemplate = Deno.readTextFileSync(layoutPath);
    return this.renderTemplate(layoutTemplate, { content, ...variables });
  }

  public renderComponent(
    componentName: string,
    variables: Record<string, any>,
  ): string {
    const componentPath = join(this.componentsDir, `${componentName}.liquid`);
    const componentTemplate = Deno.readTextFileSync(componentPath);
    return this.renderTemplate(componentTemplate, variables);
  }

  private renderTemplate(
    template: string,
    variables: Record<string, any>,
  ): string {
    const liquid = new Liquid({
      root: this.layoutsDir,
      extname: ".liquid",
    });
    return liquid.parseAndRenderSync(template, variables);
  }
}
