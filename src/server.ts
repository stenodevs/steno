import { join } from "jsr:@std/path";
import { refresh } from "https://deno.land/x/refresh@1.0.0/mod.ts";

export async function startDevServer(outputDir: string): Promise<void> {
  const watcher = Deno.watchFs(outputDir);
  const middleware = refresh();

  const handler = async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    let filePath = join(outputDir, url.pathname);
    if (url.pathname === "/") {
      filePath = join(outputDir, "index.html");
    }
    try {
      const fileContents = await Deno.readTextFile(filePath);
      const contentType = filePath.endsWith(".css") ? "text/css" : "text/html";
      return new Response(fileContents, { status: 200, headers: { "Content-Type": contentType } });
    } catch {
      return new Response("404 - Not Found", { status: 404 });
    }
  };

  Deno.serve(handler);
  console.log("HTTP server running at http://localhost:8000/");

  for await (const event of watcher) {
    if (event.kind === "modify" || event.kind === "create") {
      // Trigger build if content changes
    }
  }
}
