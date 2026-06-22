import { join } from "@std/path";

const reloadScript = `
  <script>
    if (typeof(EventSource) !== "undefined") {
      const eventSource = new EventSource("http://localhost:8000/reload");
        eventSource.onmessage = function(_event) {
        location.reload();
      };
    } else {
      console.log("Sorry, your browser does not support server-sent events...");
    }
  </script>
`;

export async function startDevServer(
  outputDir: string,
  buildFn: () => void,
  watchDir: string = "content",
): Promise<void> {
  buildFn();

  const watcher = Deno.watchFs([watchDir]);

  const handler = async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    let filePath = join(outputDir, url.pathname);
    if (url.pathname === "/") {
      filePath = join(outputDir, "index.html");
    }
    try {
      let fileContents = await Deno.readTextFile(filePath);
      const contentType = filePath.endsWith(".css") ? "text/css" : "text/html";
      if (!req.url.includes("/reload") && contentType === "text/html") {
        fileContents = fileContents.replace(
          /<\/body>/,
          `${reloadScript}</body>`,
        );
      }
      return new Response(fileContents, {
        status: 200,
        headers: { "Content-Type": contentType },
      });
    } catch {
      return new Response("404 - Not Found", { status: 404 });
    }
  };

  Deno.serve({ port: 8000, handler });

  console.log("");
  console.log("  \x1b[32msteno\x1b[0m  \x1b[90mdev server\x1b[0m");
  console.log("");
  console.log("  \x1b[90m➜\x1b[0m  \x1b[1mLocal\x1b[0m:   \x1b[36mhttp://localhost:8000/\x1b[0m");
  console.log("  \x1b[90m➜\x1b[0m  \x1b[1mNetwork\x1b[0m: \x1b[36mhttp://0.0.0.0:8000/\x1b[0m");
  console.log("");

  for await (const event of watcher) {
    if (event.kind === "modify" || event.kind === "create" || event.kind === "remove") {
      console.log(`  \x1b[90mchange detected, rebuilding...\x1b[0m`);
      buildFn();
    }
  }
}

