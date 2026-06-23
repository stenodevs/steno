import { assertEquals, assertStringIncludes } from "@std/assert";
import { render } from "./scribe.ts";

export function registerScribeTests(): void {
  Deno.test("scribe: renders expressions and escapes HTML", () => {
    const output = render({
      template: `<p>{ title }</p>`,
      context: { title: `<b>x</b>` },
      components: {},
    });

    assertStringIncludes(output, "&lt;b&gt;x&lt;/b&gt;");
  });

  Deno.test("scribe: supports html passthrough and control flow", () => {
    const output = render({
      template:
        `{#if show}<ul>{#each tags as tag}<li>{ tag | lower }</li>{/each}</ul>{:else}<p>none</p>{/if}{@html extra}`,
      context: { show: true, tags: ["A", "B"], extra: "<hr>" },
      components: {},
    });

    assertStringIncludes(output, "<li>a</li>");
    assertStringIncludes(output, "<li>b</li>");
    assertStringIncludes(output, "<hr>");
  });

  Deno.test("scribe: renders components", () => {
    const output = render({
      template: `<Header title={title} />`,
      context: {
        title: "Hello",
        site: { title: "Site" },
        theme: { name: "T" },
      },
      components: {
        Header: `<h1>{ title }</h1>`,
      },
    });

    assertEquals(output, "<h1>Hello</h1>");
  });
}
