import { assertEquals } from "@std/assert";
import { parseFrontmatter } from "./frontmatter.ts";

export function registerFrontmatterTests(): void {
  Deno.test("frontmatter: parses YAML frontmatter", () => {
    const input = `---\ntitle: Hello\nauthor: Dev\n---\n\nBody text`;
    const parsed = parseFrontmatter(input);

    assertEquals(parsed.frontmatter.title, "Hello");
    assertEquals(parsed.frontmatter.author, "Dev");
    assertEquals(parsed.body.trim(), "Body text");
  });

  Deno.test("frontmatter: parses TOML frontmatter", () => {
    const input = `+++\ntitle = "Hello"\nauthor = "Dev"\n+++\n\nBody text`;
    const parsed = parseFrontmatter(input);

    assertEquals(parsed.frontmatter.title, "Hello");
    assertEquals(parsed.frontmatter.author, "Dev");
    assertEquals(parsed.body.trim(), "Body text");
  });

  Deno.test("frontmatter: returns empty frontmatter when missing", () => {
    const parsed = parseFrontmatter("Just markdown body");

    assertEquals(parsed.frontmatter, {});
    assertEquals(parsed.body, "Just markdown body");
  });
}
