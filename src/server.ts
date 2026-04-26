import { join, globToRegExp } from "jsr:@std/path";
import { emptyDir } from "jsr:@std/fs";

type BuildCtx = {
  buildId: string;
  output: string;
  allSlugs: string[];
};

function newBuildId() {
  return Math.random().toString(36).substring(2, 8);
}

async function parseMarkdown(filePaths: string[]): Promise<{ content: string, filePath: string }[]> {
  const results = [];
  for (const filePath of filePaths) {
    try {
      const fileContents = await Deno.readTextFile(filePath);
      results.push({ content: fileContents, filePath });
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
    }
  }
  return results;
}

function filterContent(parsedFiles: { content: string, filePath: string }[]): { content: string, filePath: string }[] {
  return parsedFiles.filter(file => file.content.includes("Parsed"));
}

async function emitContent(filteredContent: { content: string, filePath: string }[], outputDir: string): Promise<void> {
  const distDir = join(outputDir, "dist");
  await Deno.mkdir(distDir, { recursive: true });

  for (const item of filteredContent) {
    const relativePath = item.filePath.replace(new RegExp(`^${outputDir}/`), '');
    const outputPath = join(outputDir, 'dist', ...relativePath.split('/').slice(1));
    await Deno.writeTextFile(outputPath, item.content);
  }

  console.log(`Emitting ${filteredContent.length} content files to ${distDir}`);
}

async function buildProject(outputDir: string) {
  const ctx: BuildCtx = {
    buildId: newBuildId(),
    output: outputDir,
    allSlugs: [],
  };

  const perf = new PerfTimer();
  perf.addEvent("clean");
  await emptyDir(outputDir);
  console.log(`Cleaned output directory \`${outputDir}\` in ${perf.timeSince("clean")}`);

  perf.addEvent("glob");
  const allFiles = await glob("**/*.*", outputDir);
  const fps = allFiles.filter((fp) => fp.endsWith(".md")).sort();
  console.log(`Found ${fps.length} input files from \`${outputDir}\` in ${perf.timeSince("glob")}`);

  for (const filePath of fps) {
    if (!filePath.endsWith(".md")) {
      continue; // Skip non-md files
    }

    const relativePath = filePath.replace(outputDir, '');
    const outputFilePath = joinSegments(outputDir, 'dist', ...relativePath.split('/').slice(1));

    await Deno.mkdir(dirname(outputFilePath), { recursive: true });

    const fileContents = await Deno.readTextFile(joinSegments(outputDir, filePath));
    const parsedContent = `Parsed content of ${filePath}`;
    const filteredContent = [parsedContent];

    await Deno.writeTextFile(outputFilePath, filteredContent[0]);
  }

  console.log(`Emitted ${filteredContent.length} content files to ${distDir}`);
}

async function glob(pattern: string, root: string): Promise<string[]> {
  const regExp = globToRegExp(pattern);
  const files: string[] = [];
  for await (const entry of Deno.readDir(root)) {
    if (entry.isFile && regExp.test(entry.name)) {
      files.push(entry.name);
    }
  }
  return files;
}

class PerfTimer {
  private events: Record<string, number> = {};

  addEvent(event: string) {
    this.events[event] = performance.now();
  }

  timeSince(event: string): string {
    const now = performance.now();
    const start = this.events[event];
    return `${(now - start).toFixed(2)}ms`;
  }
}

function slugifyFilePath(filePath: string): string {
  return filePath.replace(/\s+/g, '-').toLowerCase();
}

async function buildProject(outputDir: string) {
  const ctx: BuildCtx = {
    buildId: newBuildId(),
    output: outputDir,
    allSlugs: [],
  };

  const perf = new PerfTimer();
  perf.addEvent("clean");
  await emptyDir(outputDir);
  console.log(`Cleaned output directory \`${outputDir}\` in ${perf.timeSince("clean")}`);

  perf.addEvent("glob");
  const allFiles = await glob("**/*.*", outputDir);
  const fps = allFiles.filter((fp) => fp.endsWith(".md")).sort();
  console.log(`Found ${fps.length} input files from \`${outputDir}\` in ${perf.timeSince("glob")}`);

  for (const filePath of fps) {
    if (!filePath.endsWith(".md")) {
      const relativePath = filePath.replace(outputDir, '');
      const outputFilePath = joinSegments(outputDir, 'dist', ...relativePath.split('/').slice(1));

      await Deno.mkdir(dirname(outputFilePath), { recursive: true });

      const fileContents = await Deno.readTextFile(joinSegments(outputDir, filePath));
      await Deno.writeTextFile(outputFilePath, fileContents);
    }
  }

  console.log(`Done processing ${fps.length} files in ${perf.timeSince("clean")}`);
}

export async function startDevServer(outputDir: string): Promise<void> {
  await buildProject(outputDir);

  let configExists = true;
  try {
    await Deno.stat("./config");
  } catch {
    configExists = false;
  }

  const watchPaths = configExists ? ["./config"] : [];
  const watcher = Deno.watchFs(watchPaths);

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

  Deno.serve({ port: 8000, handler });
  console.log("HTTP server running at http://localhost:8000/");

  for await (const event of watcher) {
    if (event.kind === "modify" || event.kind === "create") {
      await buildProject(outputDir);
    }
  }
}

if (!req.url.includes("/reload")) {
  const eventSourceScript = `
    <script>
      if (typeof(EventSource) !== "undefined") {
        const eventSource = new EventSource("http://localhost:8000/reload");
        eventSource.onmessage = function(event) {
          location.reload();
        };
      } else {
        console.log("Sorry, your browser does not support server-sent events...");
      }
    </script>
  `;
  fileContents = fileContents.replace(/<\/body>/, `${eventSourceScript}</body>`);
}