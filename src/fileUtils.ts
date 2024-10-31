import { join } from "jsr:@std/path";

export function ensureDirSync(dirPath: string): void {
  try {
    if (!Deno.statSync(dirPath).isDirectory) {
      Deno.mkdirSync(dirPath, { recursive: true });
    }
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      Deno.mkdirSync(dirPath, { recursive: true });
    } else {
      throw error;
    }
  }
}
