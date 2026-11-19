// Check the actual deployable pages, crawlable links, image variants and CSP.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { ROUTES, SITE_URL } from "../src/seo.js";
import { screenshots } from "../src/home/images.generated.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const headers = await readFile(join(dist, "_headers"), "utf8");
const manifest = JSON.parse(await readFile(join(dist, ".vite", "manifest.json"), "utf8"));
const main = Object.values(manifest).find((entry) => entry.isEntry);
assert(main, "client entry must exist");
assert((await stat(join(dist, main.file))).size < 20000, "initial JavaScript exceeds the 20KB budget");
assert(!Object.values(manifest).some((entry) => /react|entry-server|App\.jsx/.test(entry.src || "")), "build-only React leaked into the client manifest");

for (const [path, meta] of Object.entries(ROUTES)) {
  const filename = path === "/" ? "index.html" : `${path.slice(1)}.html`;
  const html = await readFile(join(dist, filename), "utf8");
  assert(html.includes(`<title>${meta.title}</title>`), `${path}: title`);
  assert(html.includes(`<link rel="canonical" href="${new URL(path, SITE_URL).href}"`), `${path}: canonical`);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${path}: exactly one rendered heading`);
  assert(html.includes("max-image-preview:large"), `${path}: image previews`);
  assert(!html.includes("is-pending"), `${path}: content cannot be hidden until JavaScript runs`);
  if (path !== "/") assert(html.includes("data-subpage-styles"), `${path}: subpage CSS available without JS`);
  const json = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  assert(json, `${path}: structured data`);
  const schema = JSON.parse(json);
  assert(schema["@graph"].some((node) => node["@type"] === "WebPage" && node.url === new URL(path, SITE_URL).href));
  assert(headers.includes(`'sha256-${createHash("sha256").update(json).digest("base64")}'`), `${path}: JSON-LD permitted by CSP`);
  for (const [, url] of html.matchAll(/(?:src|href)="(\/[^"#?]*)[^"]*"/g)) {
    const file = url === "/" ? "index.html" : ROUTES[url] ? `${url.slice(1)}.html` : url.slice(1);
    if (!file) continue;
    assert((await stat(join(dist, file))).isFile(), `${path}: missing local resource ${url}`);
  }
  for (const [, image] of html.matchAll(/<img\b([^>]*)>/g)) {
    assert(/\bwidth="\d+"/.test(image) && /\bheight="\d+"/.test(image) && /\balt="/.test(image), `${path}: image must reserve space and have alt text`);
  }
  if (path === "/privacy" || path === "/terms") {
    const toc = html.match(/<nav class="s-toc"[\s\S]*?<\/nav>/)?.[0] || "";
    assert(toc.includes('href="#'), `${path}: table of contents must be prerendered`);
    for (const [, anchor] of toc.matchAll(/href="#([^"]+)"/g)) assert(html.includes(`id="${anchor}"`), `${path}: missing heading ${anchor}`);
  }
}

for (const [name, image] of Object.entries(screenshots)) {
  for (const format of ["avif", "webp"]) {
    for (const candidate of image[format].split(", ")) {
      const [url, descriptor] = candidate.split(" ");
      const metadata = await sharp(join(dist, url)).metadata();
      assert.equal(metadata.width, parseInt(descriptor, 10), `${name}: incorrect ${format} width descriptor`);
      assert(Math.abs(metadata.height / metadata.width - 1564 / 720) < 0.005, `${name}: screenshot aspect ratio changed`);
    }
  }
}
assert(headers.includes("/_media/*\n  Cache-Control: public, max-age=31536000, immutable"), "versioned images must use immutable caching");
assert(!headers.includes("script-src 'unsafe-inline'"), "script CSP cannot be weakened");
const sitemap = await readFile(join(dist, "sitemap.xml"), "utf8");
assert.equal((sitemap.match(/<loc>/g) || []).length, Object.keys(ROUTES).length, "sitemap and route registry differ");
assert(sitemap.includes("<image:loc>"), "sitemap must expose screenshot URLs");
const missing = await readFile(join(dist, "404.html"), "utf8");
assert(missing.includes('name="robots" content="noindex"') && !missing.includes('rel="canonical"'), "404 pages must not be indexed or canonicalized");
const variants = Object.values(screenshots).reduce((count, image) => count + image.webp.split(", ").length + image.avif.split(", ").length, 0);
console.log(`Checked ${Object.keys(ROUTES).length} routes, ${variants} screenshot variants, crawlable navigation, structured data, CSP, 404 and JavaScript budget.`);
