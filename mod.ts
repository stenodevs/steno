import { type SiteConfig, loadConfig } from "./src/config.ts";
import { Theme } from "./src/theme.ts";
import { ensureDirSync } from "./src/fileUtils.ts";
import { parseFrontmatter } from "./src/frontmatter.ts";
import { wrapWithTemplate } from "./src/template.ts";
import { startDevServer } from "./src/server.ts";
import { marked } from "https://esm.sh/marked@14.1.3";
import { join } from "jsr:@std/path";

export class Steno {
  private config: SiteConfig;
  private theme?: Theme;

  constructor(configPath: string = 'content/.steno/config.yml') {
    this.config = loadConfig(configPath);
    if (this.config.custom?.theme) {
      this.theme = new Theme(this.config.custom.theme, `@stenothemes/${this.config.custom.theme}/theme.css`);
    }
    this.init();
  }

  public build(): void {
    const contentDir = this.config.contentDir || 'content';
    const outputDir = this.config.output || 'dist';

    // Ensure output directory exists
    ensureDirSync(outputDir);

    // Process each content file
    for (const file of Deno.readDirSync(contentDir)) {
      const filePath = join(contentDir, file.name);
      if (Deno.statSync(filePath).isFile) {
        const fileContents = Deno.readTextFileSync(filePath);

        // Parse frontmatter and content body
        const { frontmatter, body } = parseFrontmatter(fileContents);

        // Convert Markdown to HTML
        const htmlContent = marked(body);

        // Determine output file path
        let outputFilePath = join(outputDir, file.name.replace('.md', '.html'));
        if (this.config.custom?.shortUrls) {
          outputFilePath = join(outputDir, file.name.replace('.md', ''));
          ensureDirSync(outputFilePath);
          outputFilePath = join(outputFilePath, 'index.html');
        }

        // Wrap content in HTML template and write to output file
        const title = (frontmatter.title as string) || this.config.title;
        const wrappedContent = wrapWithTemplate(htmlContent, title, this.config);
        Deno.writeTextFileSync(outputFilePath, wrappedContent);
      }
    }

    // Combine and minify stylesheets if configured
    if (this.config.custom?.stylesheets) {
      let combinedStyles = "";
      this.config.custom.stylesheets.forEach(sheet => {
        const sourcePath = join(this.config.contentDir || 'content', sheet);
        try {
          const stylesheetContent = Deno.readTextFileSync(sourcePath);
          combinedStyles += stylesheetContent;
        } catch (error) {
          console.error(`Failed to read stylesheet ${sheet}:`, error);
        }
      });

      const minifiedStyles = combinedStyles.replace(/\s+/g, ' ').trim();
      const outputStylesPath = join(outputDir, "styles.min.css");
      Deno.writeTextFileSync(outputStylesPath, minifiedStyles);
    }
  }

  public async dev(): Promise<void> {
    await startDevServer(this.config.output || 'dist');
  }

  private init() {
    if (Deno.args.includes("dev")) {
      this.dev();
    } else {
      this.build();
    }
  }
}
