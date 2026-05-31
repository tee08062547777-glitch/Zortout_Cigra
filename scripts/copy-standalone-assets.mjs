import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const copies = [
  [join(root, ".next", "static"), join(root, ".next", "standalone", ".next", "static")],
  [join(root, "public"), join(root, ".next", "standalone", "public")],
];

for (const [from, to] of copies) {
  if (!existsSync(from)) continue;
  mkdirSync(dirname(to), { recursive: true });
  cpSync(from, to, { recursive: true });
}
