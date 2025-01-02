import type { SiteConfig } from "./config.ts";
import { Liquid } from "npm:liquidjs";

export function wrapWithTemplate(content: string, title: string, config: SiteConfig): string {
  const engine = new Liquid();
  const template = `
    <!DOCTYPE html>
    <html lang='en'>
    <head>
      <meta charset='UTF-8'>
      <meta name='viewport' content='width=device-width, initial-scale=1.0'>
      <title>{{ title }}</title>
      <meta name='description' content='{{ config.description }}'>
      <meta name='author' content='{{ config.author }}'>
      {% for tag in config.head %}
        <meta name="{{ tag.name }}" content="{{ tag.content }}">
      {% endfor %}
      {% if config.custom.stylesheets %}
        <link rel="stylesheet" href="styles.min.css">
      {% endif %}
    </head>
    <body>
      {{ content }}
    </body>
    </html>
  `;

  return engine.parseAndRenderSync(template, { content, title, config });
}
