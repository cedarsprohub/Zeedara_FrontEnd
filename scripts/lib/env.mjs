// Vite's own env loading isn't available in a plain Node build script, so
// `.env` is read directly here. A real environment variable wins, which is
// how a CI or DigitalOcean build overrides it.

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

export function readEnv(root, name, fallback) {
  if (process.env[name]) return process.env[name];
  for (const file of [".env.local", ".env"]) {
    const path = resolve(root, file);
    if (!existsSync(path)) continue;
    const match = readFileSync(path, "utf8").match(
      new RegExp(`^\\s*${name}\\s*=\\s*(.*)$`, "m"),
    );
    const value = match?.[1]?.trim().replace(/^["']|["']$/g, "");
    if (value) return value;
  }
  return fallback;
}
