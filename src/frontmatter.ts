import { parse as parseYaml } from "jsr:@std/yaml";
import { parse as parseToml } from "jsr:@std/toml";

export function parseFrontmatter(content: string): { frontmatter: Record<string, unknown>, body: string } {
  const frontmatterRegex = /^(---|\+\+\+)\n([\s\S]+?)\n\1/;
  const match = content.match(frontmatterRegex);
  if (match) {
    const frontmatterContent = match[2];
    const body = content.slice(match[0].length);
    let frontmatter;
    try {
      frontmatter = parseYaml(frontmatterContent);
    } catch {
      try {
        frontmatter = parseToml(frontmatterContent);
      } catch (error) {
        console.error("Failed to parse frontmatter:", error);
        frontmatter = {};
      }
    }
    return { frontmatter, body };
  }
  return { frontmatter: {}, body: content };
}
