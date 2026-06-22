export interface CliOptions {
  command: "build" | "dev" | "help";
  configPath: string;
}

const defaultConfigPath = "content/.steno/config.yml";

export function parseCliArgs(args: string[]): CliOptions {
  let command: CliOptions["command"] = "build";
  let configPath = defaultConfigPath;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "-h" || arg === "--help") {
      return { command: "help", configPath };
    }

    if (arg === "-c" || arg === "--config") {
      const value = args[i + 1];
      if (!value || value.startsWith("-")) {
        throw new Error("Missing value for --config. Example: --config content/.steno/config.yml");
      }
      configPath = value;
      i++;
      continue;
    }

    if (arg === "build" || arg === "dev") {
      command = arg;
      continue;
    }

    if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }

    throw new Error(`Unknown command: ${arg}`);
  }

  return { command, configPath };
}

export function printHelp(): void {
  console.log(`
steno - static site generator

Usage:
  deno run -A ./mod.ts [command] [options]

Commands:
  build                Build the site into dist/ (default)
  dev                  Start dev server with live reload

Options:
  -c, --config <path>  Path to config file (default: content/.steno/config.yml)
  -h, --help           Show help

Examples:
  deno run -A ./mod.ts
  deno run -A ./mod.ts build
  deno run -A ./mod.ts dev
  deno run -A ./mod.ts build --config content/.steno/config.yml
`);
}

