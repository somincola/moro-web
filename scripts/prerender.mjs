// Prerender every route to static HTML after `vite build` + the SSR build.
//
//   dist/index.html        → /
//   dist/privacy.html      → /privacy   (Cloudflare Pages serves /privacy from privacy.html)
//   dist/404.html          → any unknown path (served with a 404 status, noindex)
//
// Each file carries its own title, description, canonical URL and social tags,
// and the full page markup, so crawlers and link previews never see an empty
// SPA shell. The client then hydrates the markup.

import { readFileSync, writeFileSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const ssrDir = join(root, "dist-ssr");

const { render, ROUTES, NOT_FOUND, SITE_URL, APP_STORE_ID, OG_IMAGE } = await import(
  pathToFileURL(join(ssrDir, "entry-server.js")).href
);

const template = readFileSync(join(dist, "index.html"), "utf8");

const escapeAttr = (value) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const escapeText = (value) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;");

// Preload the Latin Inter face — the only font above the fold.
const appDir = join(dist, "_app");
const inter = readdirSync(appDir).find((f) => /^inter-latin-wght-normal-.*\.woff2$/.test(f));
const fontPreload = inter
  ? `<link rel="preload" href="/_app/${inter}" as="font" type="font/woff2" crossorigin />`
  : "";

const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  name: "Moro for Mastodon",
  alternateName: "Moro",
  operatingSystem: "iOS",
  applicationCategory: "SocialNetworkingApplication",
  description: ROUTES["/"].description,
  url: `${SITE_URL}/`,
  image: OG_IMAGE,
  downloadUrl: `https://apps.apple.com/app/id${APP_STORE_ID}`,
  installUrl: `https://apps.apple.com/app/id${APP_STORE_ID}`,
  publisher: { "@type": "Organization", name: "Somincola LLC", url: "https://somincola.com" },
};

function page(path, meta, { indexable = true } = {}) {
  const url = path ? new URL(path, SITE_URL).toString() : null;
  let html = template;
  const set = (pattern, replacement) => {
    if (!pattern.test(html)) throw new Error(`prerender: missing ${pattern} in index.html`);
    html = html.replace(pattern, replacement);
  };

  set(/<title>[^<]*<\/title>/, `<title>${escapeText(meta.title)}</title>`);
  set(/(<meta name="description" content=")[^"]*(")/, `$1${escapeAttr(meta.description)}$2`);
  set(/(<meta property="og:title" content=")[^"]*(")/, `$1${escapeAttr(meta.title)}$2`);
  set(/(<meta property="og:description" content=")[^"]*(")/, `$1${escapeAttr(meta.description)}$2`);
  set(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${escapeAttr(meta.title)}$2`);
  set(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${escapeAttr(meta.description)}$2`);

  if (url) {
    set(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`);
    set(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`);
  } else {
    set(/\s*<link rel="canonical"[^>]*>/, "");
    set(/\s*<meta property="og:url"[^>]*>/, "");
  }
  if (!indexable) set(/(<meta name="robots" content=")[^"]*(")/, "$1noindex$2");

  const extraHead = [fontPreload];
  if (path === "/") {
    extraHead.push(`<script type="application/ld+json">${JSON.stringify(appJsonLd).replace(/</g, "\\u003c")}</script>`);
  }
  html = html.replace("</head>", `    ${extraHead.filter(Boolean).join("\n    ")}\n  </head>`);

  const markup = render(path ?? "/404");
  set(/<div id="root"><\/div>/, `<div id="root">${markup}</div>`);
  return html;
}

for (const [path, meta] of Object.entries(ROUTES)) {
  const file = path === "/" ? "index.html" : `${path.slice(1)}.html`;
  writeFileSync(join(dist, file), page(path, meta));
  console.log(`prerendered ${path} → dist/${file}`);
}
writeFileSync(join(dist, "404.html"), page(null, NOT_FOUND, { indexable: false }));
console.log("prerendered 404 → dist/404.html");

rmSync(ssrDir, { recursive: true, force: true });
