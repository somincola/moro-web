import { useEffect, useRef, useState } from "react";
import { ArrowRight, List, X } from "@phosphor-icons/react";
import {
  ANALYTICS_EVENTS,
  ANALYTICS_PREFERENCES_EVENT,
  hasAnalyticsConsent,
  trackEvent,
} from "../analytics.js";
import { createParticleGlobe } from "./particleGlobe.js";
import "./home.css";

const APP_STORE_URL = import.meta.env.VITE_APP_STORE_URL?.trim()
  || "https://apps.apple.com/app/id6776115614";

const shot = (name) => `/assets/app/${name}.webp`;

/* Helpers ----------------------------------------------------------------- */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function useReveal(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const targets = root.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-in"));
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [rootRef]);
}

function trackStore(location) {
  trackEvent(ANALYTICS_EVENTS.appStoreClick, { cta_location: location, link_url: APP_STORE_URL });
}

function StoreBadge({ location }) {
  return (
    <a
      className="m-badge"
      href={APP_STORE_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Download Moro on the App Store"
      onClick={() => trackStore(location)}
    >
      <img src="/assets/download-on-app-store.png" alt="Download on the App Store" width="162" height="48" />
    </a>
  );
}

function Device({ src, alt, eager = false, className = "", sizes = "(max-width: 760px) 70vw, 320px" }) {
  const small = src.replace(/\.webp$/, "-480.webp");
  const medium = src.replace(/\.webp$/, "-600.webp");
  return (
    <figure className={`m-device ${className}`}>
      <img
        src={src}
        srcSet={`${small} 480w, ${medium} 600w, ${src} 720w`}
        sizes={sizes}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        width="720"
        height="1564"
      />
    </figure>
  );
}

/* Header ------------------------------------------------------------------ */

export function SiteHeader({ startDark = true }) {
  const [onDark, setOnDark] = useState(startDark);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      const hero = document.getElementById("top");
      const privacy = document.getElementById("privacy");
      const y = 36;
      const over = (el) => {
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return r.top <= y && r.bottom > y;
      };
      const download = document.getElementById("download");
      const footer = document.querySelector(".m-footer");
      setOnDark(over(hero) || over(privacy) || over(download) || over(footer));
      setScrolled(window.scrollY > 8);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const close = () => setOpen(false);
  const tone = open ? "is-light" : onDark ? "is-dark" : "is-light";

  return (
    <header className={`m-header ${tone} ${scrolled ? "is-scrolled" : ""} ${open ? "is-open" : ""}`}>
      <div className="m-header-inner">
        <a className="m-brand" href="/" aria-label="Moro home">
          <img src="/assets/moro-icon-64.png" alt="" width="26" height="26" />
          <span>Moro</span>
        </a>
        <nav id="m-nav" className="m-nav" aria-label="Primary">
          <a href="/#features" onClick={close}>Features</a>
          <a href="/#privacy" onClick={close}>Privacy</a>
          <a href="/transparency" onClick={close}>Trust center</a>
          <a href="/support" onClick={close}>Support</a>
          <a
            className="m-nav-cta"
            href={APP_STORE_URL}
            target="_blank"
            rel="noreferrer"
            onClick={() => { close(); trackStore("header"); }}
          >
            Download
          </a>
        </nav>
        <button
          className="m-menu"
          type="button"
          aria-expanded={open}
          aria-controls="m-nav"
          aria-label={open ? "Close navigation" : "Open navigation"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <List size={20} />}
        </button>
      </div>
    </header>
  );
}

/* Hero — the particle globe ---------------------------------------------- */

function Hero() {
  const canvasRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    return createParticleGlobe(canvas, {
      reducedMotion: reduced,
      layout: (w, h) => {
        // the space between the header and the wordmark block below
        const top = 76;
        const room = Math.max(h - 340 - top, 240);
        const r = Math.min(w * 0.4, room / 2 - 12, 300);
        return { cx: w / 2, cy: top + room / 2, r };
      },
    });
  }, [reduced]);

  return (
    <section className="m-hero" id="top" aria-labelledby="m-hero-title">
      <canvas ref={canvasRef} className="m-globe" aria-hidden="true" />
      <div className="m-hero-copy">
        <h1 id="m-hero-title" className="m-fade" style={{ "--d": "350ms" }}>Moro</h1>
        <p className="m-hero-for m-fade" style={{ "--d": "650ms" }}>For Mastodon</p>
        <p className="m-hero-lede m-fade" style={{ "--d": "900ms" }}>A calmer home for the fediverse.</p>
        <div className="m-fade" style={{ "--d": "1100ms" }}>
          <StoreBadge location="hero" />
        </div>
      </div>
      <p className="m-hero-hint m-fade" style={{ "--d": "2400ms" }} aria-hidden="true">Drag to turn</p>
    </section>
  );
}

/* Sections ---------------------------------------------------------------- */

function Intro() {
  const ref = useRef(null);
  useReveal(ref);
  return (
    <section className="m-intro" ref={ref} aria-labelledby="m-intro-title">
      <div className="m-wrap">
        <header className="m-intro-head" data-reveal>
          <h2 id="m-intro-title">The open social web,<br className="m-br" /> brought into focus.</h2>
          <p>A Mastodon client for iPhone, designed with restraint. Your timelines, your conversations, your server — nothing in the way.</p>
        </header>
        <div className="m-duo" data-reveal style={{ "--delay": "120ms" }}>
          <Device src={shot("home-light")} alt="Moro home timeline in light appearance" className="m-duo-a" sizes="(max-width: 760px) 44vw, 320px" />
          <Device src={shot("home-dark")} alt="Moro home timeline in dark appearance" className="m-duo-b" sizes="(max-width: 760px) 44vw, 320px" />
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
  const ref = useRef(null);
  useReveal(ref);
  return (
    <section className="m-features" id="features" ref={ref} aria-label="Features">
      <div className="m-wrap">
        {features.map((f, index) => (
          <article className={`m-feature ${index % 2 ? "m-feature--reverse" : ""}`} key={f.id} data-reveal>
            <div className="m-feature-copy">
              <p className="m-label">{f.label}</p>
              <h3>{f.title.split("\n").map((line, i) => <span key={line}>{i ? <br /> : null}{line}</span>)}</h3>
              <p>{f.copy}</p>
            </div>
            <div className="m-feature-visual">
              <Device src={shot(f.src)} alt={f.alt} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Gallery() {
  const ref = useRef(null);
  useReveal(ref);
  const items = [
    ["explore", "Explore", "Search accounts, posts, and hashtags across the fediverse."],
    ["compose", "Compose", "Write, attach, and poll — without the clutter."],
    ["profile", "Profile", "Your corner of the fediverse, beautifully set."],
    ["onboarding-globe-dark", "Welcome", "The same globe greets you the first time you open Moro."],
  ];
  return (
    <section className="m-gallery" ref={ref} aria-labelledby="m-gallery-title">
      <div className="m-wrap">
        <h2 id="m-gallery-title" className="m-gallery-title" data-reveal>Considered,<br className="m-br" /> down to the details.</h2>
        <div className="m-gallery-grid">
          {items.map(([src, title, copy], index) => (
            <figure key={src} data-reveal style={{ "--delay": `${index * 90}ms` }}>
              <Device src={shot(src)} alt={`${title} in Moro`} sizes="(max-width: 980px) 45vw, 260px" />
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
  const ref = useRef(null);
  useReveal(ref);
  const facts = [
    ["Any Mastodon server", "Sign in where you already live. Moro talks directly to the server you choose."],
    ["Tokens stay in Keychain", "Account credentials use a this-device-only iOS Keychain setting."],
    ["No advertising profile", "No advertising SDK and no cross-app tracking."],
    ["Encrypted notifications", "Push content stays encrypted until your iPhone decrypts it."],
  ];
  return (
    <section className="m-privacy" id="privacy" ref={ref} aria-labelledby="m-privacy-title">
      <div className="m-wrap m-privacy-inner">
        <div className="m-privacy-visual" data-reveal>
          <Device src={shot("login-locked-dark")} alt="Moro sign-in screen with a starfield of Mastodon servers" className="m-device--dark" />
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
  const ref = useRef(null);
  const skyRef = useRef(null);
  const reduced = usePrefersReducedMotion();
  useReveal(ref);

  useEffect(() => {
    const canvas = skyRef.current;
    if (!canvas) return undefined;
    // the closing night sky: breathing stars only, quieter around the words
    return createParticleGlobe(canvas, {
      globe: false,
      reducedMotion: reduced,
      layout: (w, h) => ({ cx: w / 2, cy: h * 0.5, r: Math.min(Math.max(w * 0.34, h * 0.42), 440) }),
    });
  }, [reduced]);

  useEffect(() => {
    const section = ref.current;
    if (!section || !hasAnalyticsConsent()) return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      trackEvent(ANALYTICS_EVENTS.downloadSectionView, { section_id: "download" });
      observer.disconnect();
    }, { threshold: 0.5 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="m-download" id="download" ref={ref} aria-labelledby="m-download-title">
      <canvas ref={skyRef} className="m-download-sky" aria-hidden="true" />
      <div className="m-wrap m-download-grid">
        <div className="m-download-main">
          <img className="m-download-icon" src="/assets/moro-icon-192.png" alt="" width="64" height="64" loading="lazy" decoding="async" data-reveal />
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
          onClick={() => trackStore("download_qr")}
          data-reveal
          style={{ "--delay": "200ms" }}
        >
          <span className="m-qr-tile"><img src="/assets/app-qrcode-tight.png" alt="" width="200" height="200" loading="lazy" decoding="async" /></span>
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
            <img src="/assets/moro-icon-64.png" alt="" width="26" height="26" />
            <span>Moro</span>
          </a>
          <nav aria-label="Footer navigation">
            <a href="/privacy">Privacy</a>
            <a href="/security">Security</a>
            <a href="/transparency">Transparency</a>
            <a href="/licenses">Licenses</a>
            <a href="/terms">Terms</a>
            <a href="/support">Support</a>
            <button type="button" onClick={() => window.dispatchEvent(new Event(ANALYTICS_PREFERENCES_EVENT))}>
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
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    const previous = meta?.getAttribute("content");
    meta?.setAttribute("content", "#050608");
    return () => { if (meta && previous) meta.setAttribute("content", previous); };
  }, []);

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
