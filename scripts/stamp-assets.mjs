// Adds ?v=<content hash> to every /assets/ URL in the HTML pages, so browsers can cache assets
// for a year yet still fetch a file as soon as its contents change.
//
// Runs automatically before `firebase deploy` (see "predeploy" in firebase.json). Safe to run
// any time: `node scripts/stamp-assets.mjs`. Only pages whose assets changed are rewritten.
//
// Fonts are left alone: the stylesheet references them too, and their file names never change.

import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const publicDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const hashes = new Map();

function hashOf(path) {
  if (!hashes.has(path)) {
    const file = join(publicDir, path);
    const hash = existsSync(file) ? createHash("sha256").update(readFileSync(file)).digest("hex").slice(0, 10) : null;
    if (!hash) console.warn(`stamp-assets: missing file ${path}`);
    hashes.set(path, hash);
  }
  return hashes.get(path);
}

let updated = 0;
for (const name of readdirSync(publicDir).filter((f) => f.endsWith(".html"))) {
  const file = join(publicDir, name);
  const html = readFileSync(file, "utf8");
  // A local asset URL starts right after a quote, a space or a comma (srcset lists).
  const stamped = html.replace(/(["\s,])(\/assets\/(?!fonts\/)[^"'\s?,#]+)(\?v=[0-9a-f]+)?/g, (match, before, path) => {
    const hash = hashOf(path);
    return hash ? `${before}${path}?v=${hash}` : match;
  });
  if (stamped !== html) {
    writeFileSync(file, stamped);
    updated++;
  }
}
console.log(`stamp-assets: ${updated} page(s) updated`);
