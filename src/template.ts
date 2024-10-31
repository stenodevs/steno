import { SiteConfig } from "./config.ts";

export function wrapWithTemplate(content: string, title: string, config: SiteConfig): string {
  const headElements = config.head?.map(tag => `<meta name="${tag.name}" content="${tag.content}">`).join("\n") || "";
  const stylesheetLink = config.custom?.stylesheets ? `<link rel="stylesheet" href="styles.min.css">` : "";

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <meta name="description" content="${config.description}">
      <meta name="author" content="${config.author}">
      ${headElements}
      ${stylesheetLink}
    </head>
    <body>
      ${content}
    </body>
    </html>
  `;
}
