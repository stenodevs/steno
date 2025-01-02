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

function parseMarkdown(filePaths: string[]): Promise<string[]> {
  return Promise.resolve(filePaths.map((filePath) => `Parsed content of ${filePath}`));
}

function filterContent(parsedFiles: string[]): string[] {
  return parsedFiles.filter((content) => content.includes("Parsed"));
}

function emitContent(filteredContent: string[]): void {
  for (const content of filteredContent) {
    console.log(`Emitting content: ${content}`);
  }
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

function joinSegments(...segments: string[]): string {
  return join(...segments);
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

  const filePaths = fps.map((fp) => joinSegments(outputDir, fp));
  ctx.allSlugs = allFiles.map((fp) => slugifyFilePath(fp));

  const parsedFiles = await parseMarkdown(filePaths);
  const filteredContent = filterContent(parsedFiles);

  emitContent(filteredContent);
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
