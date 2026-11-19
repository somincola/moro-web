import { ArrowRight, List, X } from "@phosphor-icons/react";
import { images, screenshots } from "./images.generated.js";

const APP_STORE_URL = import.meta.env.VITE_APP_STORE_URL?.trim()
  || "https://apps.apple.com/app/id6776115614";

/* Helpers ----------------------------------------------------------------- */

function StoreBadge({ location }) {
  return (
    <a
      className="m-badge"
      href={APP_STORE_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Download Moro on the App Store"
      data-store-location={location}
    >
      <img src={images.storeBadge} alt="Download on the App Store" width="300" height="89" fetchPriority={location === "hero" ? "high" : "auto"} decoding="async" />
    </a>
  );
}

function Device({ name, alt, className = "", sizes = "auto, min(300.7px, 69.84vw)" }) {
  const source = screenshots[name];
  return (
    <figure className={`m-device ${className}`}>
      <picture>
        <source type="image/avif" srcSet={source.avif} sizes={sizes} />
        <img
          src={source.src}
          srcSet={source.webp}
          sizes={sizes}
          alt={alt}
          loading="lazy"
          decoding="async"
          width="720"
          height="1564"
        />
      </picture>
    </figure>
  );
}

/* Header ------------------------------------------------------------------ */

export function SiteHeader({ startDark = true }) {
  return (
    <header className={`m-header ${startDark ? "is-dark" : "is-light"}`}>
      <div className="m-header-inner">
        <a className="m-brand" href="/" aria-label="Moro home">
          <img src={images.brand} alt="" width="26" height="26" />
          <span>Moro</span>
        </a>
        <nav id="m-nav" className="m-nav" aria-label="Primary">
          <a href="/#features">Features</a>
          <a href="/#privacy">Privacy</a>
          <a href="/transparency">Trust center</a>
          <a href="/support">Support</a>
          <a
            className="m-nav-cta"
            href={APP_STORE_URL}
            target="_blank"
            rel="noreferrer"
            data-store-location="header"
          >
            Download
          </a>
        </nav>
        <button
          className="m-menu"
          type="button"
          aria-expanded="false"
          aria-controls="m-nav"
          aria-label="Open navigation"
        >
          <List size={20} className="m-menu-open-icon" />
          <X size={20} className="m-menu-close-icon" />
        </button>
      </div>
    </header>
  );
}

/* Hero — the particle globe ---------------------------------------------- */

function Hero() {
  return (
    <section className="m-hero" id="top" aria-labelledby="m-hero-title">
      <canvas className="m-globe" data-particle-scene="hero" aria-hidden="true" />
      <div className="m-hero-copy">
        <h1 id="m-hero-title">Moro<span className="m-sr-only"> — Mastodon client for iPhone</span></h1>
        <p className="m-hero-for">For Mastodon</p>
        <p className="m-hero-lede">A calmer home for the fediverse.</p>
        <div>
          <StoreBadge location="hero" />
        </div>
      </div>
      <p className="m-hero-hint m-fade" style={{ "--d": "2400ms" }} aria-hidden="true">Drag to turn</p>
    </section>
  );
}

/* Sections ---------------------------------------------------------------- */

function Intro() {
  return (
    <section className="m-intro" aria-labelledby="m-intro-title">
      <div className="m-wrap">
        <header className="m-intro-head" data-reveal>
          <h2 id="m-intro-title">The open social web,<br className="m-br" /> brought into focus.</h2>
          <p>A Mastodon client for iPhone, designed with restraint. Your timelines, your conversations, your server — nothing in the way.</p>
        </header>
        <div className="m-duo" data-reveal style={{ "--delay": "120ms" }}>
          <Device name="home-light" alt="Moro home timeline in light appearance" className="m-duo-a" sizes="auto, (max-width: 760px) 42.68vw, min(310.4px, 36.86vw)" />
          <Device name="home-dark" alt="Moro home timeline in dark appearance" className="m-duo-b" sizes="auto, (max-width: 760px) 42.68vw, min(310.4px, 36.86vw)" />
        </div>
        <p className="m-caption" data-reveal>Light and dark, designed together.</p>
      </div>
    </section>
  );
}

const features = [
  {
    id: "thread",
    label: "Conversations",
    title: "Every reply,\nin its place.",
    copy: "Threads read top to bottom like a real conversation. Follow along with clarity, and respond when you’re ready.",
    src: "thread",
    alt: "A conversation thread in Moro",
  },
  {
    id: "inbox",
    label: "Inbox",
    title: "What matters,\nat a glance.",
    copy: "Replies, boosts, follows, and mentions — gathered into one quiet inbox, with mentions a tap away.",
    src: "inbox",
    alt: "The Moro inbox showing replies, likes, and boosts",
  },
  {
    id: "display",
    label: "Appearance",
    title: "Make it\nyour own.",
    copy: "System, light, or dark. Comfortable text sizes. A link color and app icon that feel like yours.",
    src: "display",
    alt: "Moro appearance settings with theme, text size, and app icon options",
  },
];

function Features() {
  return (
    <section className="m-features" id="features" aria-label="Features">
      <div className="m-wrap">
        {features.map((f, index) => (
          <article className={`m-feature ${index % 2 ? "m-feature--reverse" : ""}`} key={f.id} data-reveal>
            <div className="m-feature-copy">
              <p className="m-label">{f.label}</p>
              <h3>{f.title.split("\n").map((line, i) => <span key={line}>{i ? <br /> : null}{line}</span>)}</h3>
              <p>{f.copy}</p>
            </div>
            <div className="m-feature-visual">
              <Device name={f.src} alt={f.alt} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Gallery() {
  const items = [
    ["explore", "Explore", "Search accounts, posts, and hashtags across the fediverse."],
    ["compose", "Compose", "Write, attach, and poll — without the clutter."],
    ["profile", "Profile", "Your corner of the fediverse, beautifully set."],
    ["onboarding-globe-dark", "Welcome", "The same globe greets you the first time you open Moro."],
  ];
  return (
    <section className="m-gallery" aria-labelledby="m-gallery-title">
      <div className="m-wrap">
        <h2 id="m-gallery-title" className="m-gallery-title" data-reveal>Considered,<br className="m-br" /> down to the details.</h2>
        <div className="m-gallery-grid">
          {items.map(([src, title, copy], index) => (
            <figure key={src} data-reveal style={{ "--delay": `${index * 90}ms` }}>
              <Device name={src} alt={`${title} in Moro`} sizes="auto, (max-width: 760px) calc(48.1vw - 26.94px), (max-width: 980px) calc(48.1vw - 44.26px), (max-width: 1184px) calc(24.05vw - 38.48px), 246.3px" />
              <figcaption>
                <strong>{title}</strong>
                <span>{copy}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Privacy() {
  const facts = [
    ["Any Mastodon server", "Sign in where you already live. Moro talks directly to the server you choose."],
    ["Tokens stay in Keychain", "Account credentials use a this-device-only iOS Keychain setting."],
    ["No advertising profile", "No advertising SDK and no cross-app tracking."],
    ["Encrypted notifications", "Push content stays encrypted until your iPhone decrypts it."],
  ];
  return (
    <section className="m-privacy" id="privacy" aria-labelledby="m-privacy-title">
      <div className="m-wrap m-privacy-inner">
        <div className="m-privacy-visual" data-reveal>
          <Device name="login-locked-dark" alt="Moro sign-in screen with a starfield of Mastodon servers" className="m-device--dark" sizes="auto, (max-width: 760px) min(252.2px, 64.02vw), 300.7px" />
        </div>
        <div className="m-privacy-copy" data-reveal style={{ "--delay": "120ms" }}>
          <p className="m-label">Privacy</p>
          <h2 id="m-privacy-title">Your data.<br />Your choice.</h2>
          <p className="m-privacy-lede">Moro is a client, not a social network. We don’t sell your data, and we don’t use it for advertising.</p>
          <dl>
            {facts.map(([title, copy]) => (
              <div key={title}>
                <dt>{title}</dt>
                <dd>{copy}</dd>
              </div>
            ))}
          </dl>
          <div className="m-privacy-links">
            <a className="m-link" href="/transparency">Trust center <ArrowRight size={14} /></a>
            <a className="m-link" href="/privacy">Privacy policy <ArrowRight size={14} /></a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Download() {
  return (
    <section className="m-download" id="download" aria-labelledby="m-download-title">
      <canvas className="m-download-sky" data-particle-scene="sky" aria-hidden="true" />
      <div className="m-wrap m-download-grid">
        <div className="m-download-main">
          <img className="m-download-icon" src={images.icon} alt="" width="64" height="64" loading="lazy" decoding="async" data-reveal />
          <h2 id="m-download-title" data-reveal style={{ "--delay": "80ms" }}>Get Moro.</h2>
          <p className="m-download-lede" data-reveal style={{ "--delay": "160ms" }}>A calmer home for the fediverse, on iPhone.</p>
          <div className="m-download-cta" data-reveal style={{ "--delay": "240ms" }}>
            <StoreBadge location="download_card" />
          </div>
          <p className="m-note" role="note" data-reveal style={{ "--delay": "300ms" }}>Not currently available on the App Store in mainland China.</p>
        </div>
        <a
          className="m-download-scan"
          href={APP_STORE_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="Scan or open the QR code to download Moro on the App Store"
          data-store-location="download_qr"
          data-reveal
          style={{ "--delay": "200ms" }}
        >
          <span className="m-qr-tile"><img src={images.qrCode} alt="" width="200" height="200" loading="lazy" decoding="async" /></span>
          <span className="m-scan-copy">
            <strong>Scan to download</strong>
            <span>Point your iPhone camera at the code.</span>
          </span>
        </a>
      </div>
    </section>
  );
}

export function SiteFooter({ credits = true }) {
  return (
    <footer className="m-footer">
      <div className="m-wrap">
        <div className="m-footer-row">
          <a className="m-brand" href="/" aria-label="Moro home">
            <img src={images.brand} alt="" width="26" height="26" loading="lazy" decoding="async" />
            <span>Moro</span>
          </a>
          <nav aria-label="Footer navigation">
            <a href="/privacy">Privacy</a>
            <a href="/security">Security</a>
            <a href="/transparency">Transparency</a>
            <a href="/licenses">Licenses</a>
            <a href="/terms">Terms</a>
            <a href="/support">Support</a>
            <button type="button" data-analytics-preferences>
              Analytics preferences
            </button>
          </nav>
        </div>
        <div className="m-footer-meta">
          <p>© 2026 Somincola LLC</p>
          {credits ? <p>
            Accounts and posts in screenshots are fictional. Photography in screenshots by Alvan Nee, Alex MacFaul,
            Leiada Krözjhen, Ekaterina Ermakova, Olena Kamenetska, Julien Riedel, Erica Marsland Huynh, pariwat pannium,
            Nguyễn Hiệp and Swazbee on <a href="https://unsplash.com" target="_blank" rel="noreferrer">Unsplash</a>.
          </p> : null}
        </div>
      </div>
    </footer>
  );
}

export function LuxHomePage() {
  return (
    <div className="m-site">
      <SiteHeader />
      <main>
        <Hero />
        <Intro />
        <Features />
        <Gallery />
        <Privacy />
        <Download />
      </main>
      <SiteFooter />
    </div>
  );
}
