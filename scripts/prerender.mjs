// Prerender every route to static HTML after `vite build` + the SSR build.
//
//   dist/index.html        → /
//   dist/privacy.html      → /privacy   (Cloudflare Pages serves /privacy from privacy.html)
//   dist/404.html          → any unknown path (served with a 404 status, noindex)
//
// Each file carries its own title, description, canonical URL and social tags,
// and the full page markup, so crawlers and link previews never see an empty
// SPA shell. Small progressive enhancements run without React hydration.

import { readFileSync, writeFileSync, readdirSync, rmSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { partytownSnippet } from "@qwik.dev/partytown/integration";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const ssrDir = join(root, "dist-ssr");

const { render, ROUTES, NOT_FOUND, SITE_URL, APP_STORE_ID, OG_IMAGE, GA_MEASUREMENT_ID, images, screenshots } = await import(
  pathToFileURL(join(ssrDir, "entry-server.js")).href
);

const template = readFileSync(join(dist, "index.html"), "utf8");
const manifest = JSON.parse(readFileSync(join(dist, ".vite", "manifest.json"), "utf8"));
const subpageCSS = manifest["src/home/subpages.css"]?.file;
if (!subpageCSS) throw new Error("prerender: missing subpage stylesheet");
const scriptHashes = new Set();

const escapeAttr = (value) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const escapeText = (value) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;");

// Preload the Latin Inter face — the only font above the fold.
const appDir = join(dist, "_app");
const inter = readdirSync(appDir).find((f) => /^inter-latin-wght-normal-.*\.woff2$/.test(f));
const fontPreload = inter
  ? `<link rel="preload" href="/_app/${inter}" as="font" type="font/woff2" crossorigin />`
  : "";

const appJsonLd = {
  "@type": "MobileApplication",
  "@id": `${SITE_URL}/#app`,
  name: "Moro for Mastodon",
  alternateName: "Moro",
  operatingSystem: "iOS",
  applicationCategory: "SocialNetworkingApplication",
  description: ROUTES["/"].description,
  url: `${SITE_URL}/`,
  image: new URL(images.icon, SITE_URL).href,
  screenshot: Object.values(screenshots).map((image) => new URL(image.src, SITE_URL).href),
  downloadUrl: `https://apps.apple.com/app/id${APP_STORE_ID}`,
  installUrl: `https://apps.apple.com/app/id${APP_STORE_ID}`,
  publisher: { "@id": "https://somincola.com/#organization" },
  mainEntityOfPage: { "@id": `${SITE_URL}/#webpage` },
};

function structuredData(path, meta) {
  const url = new URL(path, SITE_URL).href;
  const graph = [
    { "@type": "Organization", "@id": "https://somincola.com/#organization", name: "Somincola LLC", url: "https://somincola.com" },
    { "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: "Moro", url: `${SITE_URL}/`, inLanguage: "en", publisher: { "@id": "https://somincola.com/#organization" } },
    { "@type": "WebPage", "@id": `${url}#webpage`, url, name: meta.title, description: meta.description, inLanguage: "en", isPartOf: { "@id": `${SITE_URL}/#website` },
      ...(path === "/" ? { mainEntity: { "@id": `${SITE_URL}/#app` } } : { breadcrumb: { "@id": `${url}#breadcrumb` } }) },
  ];
  if (path === "/") graph.push(appJsonLd);
  else graph.push({ "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`, itemListElement: [
    { "@type": "ListItem", position: 1, name: "Moro", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: meta.title.replace(/ — Moro$/, ""), item: url },
  ] });
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
}

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
  if (path !== "/") set(/(<meta name="theme-color" content=")[^"]*(")/, "$1#ffffff$2");

  const extraHead = [fontPreload];
  if (path !== "/") extraHead.push(`<link rel="stylesheet" href="/${subpageCSS}" data-subpage-styles />`);
  if (indexable) {
    const json = structuredData(path, meta);
    scriptHashes.add(`'sha256-${createHash("sha256").update(json).digest("base64")}'`);
    extraHead.push(`<script type="application/ld+json">${json}</script>`);
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

// Derive sitemap entries from the same route registry as the rendered pages.
// Do not invent lastmod dates when the actual page content has not changed.
const imageEntries = Object.values(screenshots).map((image) => `<image:image><image:loc>${new URL(image.src, SITE_URL).href}</image:loc></image:image>`).join("");
writeFileSync(join(dist, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${Object.keys(ROUTES).map((path) => `  <url><loc>${new URL(path, SITE_URL).href}</loc>${path === "/" ? imageEntries : ""}</url>`).join("\n")}\n</urlset>\n`);

// Allow only the exact generated JSON-LD in the existing strict script policy.
const headers = readFileSync(join(dist, "_headers"), "utf8");
writeFileSync(join(dist, "_headers"), headers.replace("script-src 'self';", `script-src 'self' ${[...scriptHashes].join(" ")};`));

// Partytown's vanilla integration keeps analytics off the main thread without
// shipping React, and same-origin external scripts need no inline-script bypass.
const workerDir = join(dist, "~partytown");
mkdirSync(workerDir, { recursive: true });
writeFileSync(join(workerDir, "moro-bootstrap.js"), `(()=>{${partytownSnippet({ forward: ["dataLayer.push"] })}})();`);
writeFileSync(join(workerDir, "moro-gtag.js"), `window.dataLayer=window.dataLayer||[];window.gtag=function gtag(){window.dataLayer.push(arguments)};window.gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});window.gtag('js',new Date());window.gtag('config',${JSON.stringify(GA_MEASUREMENT_ID)});`);

rmSync(ssrDir, { recursive: true, force: true });
