import { createContext, Fragment, useContext, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowSquareOut,
  ArrowsLeftRight,
  Bell,
  Buildings,
  Bug,
  CheckCircle,
  Database,
  DeviceMobile,
  EnvelopeSimple,
  FileText,
  FingerprintSimple,
  GlobeHemisphereWest,
  House,
  List,
  LockKey,
  PaperPlaneTilt,
  Pulse,
  ShieldCheck,
  X,
} from "@phosphor-icons/react";
import {
  ANALYTICS_EVENTS,
  ANALYTICS_PREFERENCES_EVENT,
  hasAnalyticsConsent,
  trackEvent,
} from "./analytics.js";
import { LuxHomePage, SiteFooter, SiteHeader } from "./home/HomePage.jsx";
import "./home/subpages.css";
import { metaFor, normalizePath, SITE_URL } from "./seo.js";

const PathContext = createContext("/");

const APP_STORE_URL = import.meta.env.VITE_APP_STORE_URL?.trim()
  || "https://apps.apple.com/app/id6776115614";
const SECURITY_REPORT_URL = "mailto:support@somincola.com?subject=Moro%20security%20report";

const trustNavigation = [
  { href: "/transparency", label: "Transparency" },
  { href: "/security", label: "Security" },
  { href: "/licenses", label: "Licenses" },
];

function setPageMetadata({ title, description }, path) {
  document.title = title;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", description);

  const canonicalURL = new URL(path, SITE_URL).toString();
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute("href", canonicalURL);

  const metadata = [
    ['meta[property="og:title"]', "content", title],
    ['meta[property="og:description"]', "content", description],
    ['meta[property="og:url"]', "content", canonicalURL],
  ];
  metadata.forEach(([selector, attribute, value]) => {
    const element = document.querySelector(selector);
    if (element) element.setAttribute(attribute, value);
  });
}

function HomePage() {
  return <LuxHomePage />;
}

/* Subpage shell — shares the homepage header and footer ------------------ */

function SubShell({ children, className = "" }) {
  return (
    <div className={`m-site m-sub ${className}`}>
      <SiteHeader startDark={false} />
      <main className="s-main">{children}</main>
      <SiteFooter credits={false} />
    </div>
  );
}

function PageHead({ eyebrow, title, intro, meta, icon = false, children }) {
  return (
    <header className="s-head">
      <div className="s-wrap">
        {icon ? <img className="s-head-icon" src="/assets/moro-icon-192.png" alt="" width="56" height="56" /> : null}
        <p className="s-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {intro ? <p className="s-intro">{intro}</p> : null}
        {meta ? <p className="s-meta">{meta}</p> : null}
        {children}
      </div>
    </header>
  );
}

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function LegalLayout({ title, description, updated, children }) {
  const bodyRef = useRef(null);
  const [toc, setToc] = useState([]);
  const [active, setActive] = useState("");

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return undefined;
    const headings = [...body.querySelectorAll("h2")];
    headings.forEach((h, i) => { h.id = slugify(h.textContent) || `section-${i + 1}`; });
    setToc(headings.map((h) => ({ id: h.id, label: h.textContent })));
    if (headings[0]) setActive(headings[0].id);
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id);
    }, { rootMargin: "-80px 0px -65% 0px" });
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, []);

  return (
    <SubShell>
      <PageHead eyebrow="Legal" title={title} meta={`Last updated ${updated}`} />
      <div className="s-wrap s-doc-grid">
        <nav className="s-toc" aria-label="On this page">
          <p>On this page</p>
          {toc.map((item) => (
            <a key={item.id} href={`#${item.id}`} className={active === item.id ? "is-active" : undefined}>{item.label}</a>
          ))}
        </nav>
        <article className="s-doc" ref={bodyRef}>{children}</article>
      </div>
    </SubShell>
  );
}

function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" description="Privacy policy for Moro, a Mastodon client for iPhone." updated="August 19, 2026">
      <p>Moro (“the App”) is a third-party client for Mastodon and the fediverse, developed by <strong>somincola llc</strong> (“we”, “us”, “our”). This policy explains what information the App handles and where it goes.</p>
      <p>For a plain-language view of each service boundary, see the <a href="/transparency">Moro transparency page</a>.</p>

      <h2>The short version</h2>
      <ul>
        <li>Your account, posts, messages, follows, and media are exchanged directly between the App and the Mastodon server you choose.</li>
        <li>Your access tokens are stored in the iOS Keychain and marked to remain on this device.</li>
        <li>Moro does not include advertising or cross-app tracking, and we do not sell your data.</li>
        <li>If you enable push notifications, our self-hosted relay forwards encrypted notification payloads to Apple Push Notification service (APNs). Decryption happens on your device.</li>
        <li>If you choose to share diagnostics with app developers in iOS, Apple may provide us with crash and performance reports.</li>
      </ul>

      <h2>Information the App handles</h2>
      <h3>Stored on your device</h3>
      <ul>
        <li>Access tokens and session credentials for the server accounts you add, stored in the iOS Keychain with a this-device-only accessibility setting.</li>
        <li>Local caches, preferences, and downloaded media used to operate the App.</li>
        <li>Web Push encryption keys used to decrypt notification content on your device.</li>
      </ul>

      <h3>Exchanged with your Mastodon server</h3>
      <p>Posts, replies, direct messages, follows, boosts, favourites, profile changes, searches, and related account activity are sent to and received from the independently operated Mastodon server you choose. That server’s privacy policy and terms apply to its processing of your data.</p>

      <h3>Push notifications</h3>
      <p>If you grant notification permission, Moro registers your device with APNs and creates a Web Push subscription with your Mastodon server. The subscription endpoint contains an APNs device token and an opaque local session identifier and points to our relay at <strong>push.somincola.org</strong>.</p>
      <p>The relay receives the encrypted Web Push payload from your Mastodon server and forwards that ciphertext to APNs. Moro’s notification extension decrypts the content on your device. Apple processes device and delivery information under Apple’s own privacy terms. Disabling notifications stops new push delivery; removing an account removes its subscription from the App’s active configuration.</p>

      <h2>Data we do not collect for tracking</h2>
      <p>Moro does not use third-party advertising, behavioural analytics, or crash-reporting SDKs in the App. We do not track you across apps or websites and do not build advertising profiles. The current App Privacy manifest declares no tracked domains and no data types collected by the App developer.</p>

      <h2>Diagnostics provided by Apple</h2>
      <p>If you enable “Share With App Developers” in iOS analytics settings, Apple may provide us with crash logs, performance diagnostics, and related device or operating-system information. We use those reports only to investigate reliability problems. They are not connected to your Mastodon posts, messages, or access token by Moro.</p>

      <h2>Website analytics</h2>
      <p>This public marketing website uses Google Analytics only after you explicitly allow it. We measure page visits, views of the download section, App Store link clicks, and support contact clicks. Website analytics are not connected to your Mastodon account or activity in the Moro app.</p>
      <p>When analytics is enabled, Google receives technical information such as the page URL and IP address. Advertising storage, advertising user data, and ad personalization remain disabled. You can change your choice through “Analytics preferences” in the footer.</p>

      <h2>In-app purchases</h2>
      <p>If Moro offers optional purchases or tips, Apple processes payment. We do not receive or store your full payment-card details.</p>

      <h2>Data retention and your choices</h2>
      <ul>
        <li>Remove an account to delete its stored access token and session credentials from the App’s Keychain records.</li>
        <li>Clear cached content from the App where controls are available.</li>
        <li>Disable notifications in iOS Settings.</li>
        <li>Uninstall Moro to remove its local app data from your device.</li>
      </ul>

      <h2>Children</h2>
      <p>Moro is not directed to children. You must meet the minimum age required by your region and by the Mastodon server you use.</p>

      <h2>Changes to this policy</h2>
      <p>We may update this policy as Moro changes. Material changes will be published here with a revised date and reflected in the public website repository history.</p>

      <h2>Contact</h2>
      <p><strong>somincola llc</strong><br /><a href="mailto:privacy@somincola.com">privacy@somincola.com</a></p>
    </LegalLayout>
  );
}

function TermsPage() {
  return (
    <LegalLayout title="Terms of Use" description="Terms of use for Moro, a Mastodon client for iPhone." updated="July 14, 2026">
      <p>These Terms of Use (“Terms”) govern your use of <strong>Moro</strong> (“the App”), a third-party client for Mastodon and the fediverse developed by <strong>somincola llc</strong> (“we”, “us”, “our”). By downloading or using Moro, you agree to these Terms. The App is also subject to <a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/" target="_blank" rel="noreferrer">Apple’s Standard End User License Agreement</a>.</p>

      <h2>License</h2>
      <p>We grant you a personal, non-exclusive, non-transferable, revocable license to use Moro on Apple-branded devices that you own or control, in accordance with the App Store Terms of Service and these Terms.</p>

      <h2>Moro is a client, not a social network</h2>
      <p>Moro connects to independently operated Mastodon servers that you choose. We do not operate or control those servers, their content, availability, moderation, or policies. Your use of a server is governed by that server’s own rules and terms.</p>

      <h2>Acceptable use</h2>
      <p>You agree not to use Moro to violate applicable law, infringe the rights of others, breach the rules of a connected server, interfere with a service, or misuse the App. You are responsible for content you post, send, or share through Moro.</p>

      <h2>In-app purchases</h2>
      <p>Moro may offer optional in-app purchases or tips. Apple processes those transactions and handles refunds under its policies.</p>

      <h2>Third-party services and content</h2>
      <p>Moro displays content and connects to services supplied by third parties. We are not responsible for third-party content, server outages, moderation decisions, or changes made by server operators.</p>

      <h2>Disclaimer of warranties</h2>
      <p>Moro is provided <strong>“as is” and “as available”</strong>, without warranties of any kind to the maximum extent permitted by law. We do not warrant uninterrupted operation, error-free service, or compatibility with every server.</p>

      <h2>Limitation of liability</h2>
      <p>To the maximum extent permitted by law, somincola llc will not be liable for indirect, incidental, special, consequential, or punitive damages, or for loss of data arising from your use of Moro or from third-party services.</p>

      <h2>Termination and changes</h2>
      <p>You may stop using Moro at any time by uninstalling it. We may modify, suspend, or discontinue all or part of the App. We may also update these Terms; material changes will be posted here with a revised date.</p>

      <h2>Contact</h2>
      <p><strong>somincola llc</strong><br /><a href="mailto:contract@somincola.com">contract@somincola.com</a></p>
    </LegalLayout>
  );
}

function TrustNavigation({ activePath }) {
  return (
    <nav className="s-tabs" aria-label="Trust center sections">
      {trustNavigation.map((item) => (
        <a href={item.href} key={item.href} aria-current={activePath === item.href ? "page" : undefined}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}

function TrustLayout({ title, description, updated, updatedLabel = "Last reviewed", children }) {
  const activePath = useContext(PathContext);
  return (
    <SubShell>
      <PageHead eyebrow="Trust center" title={title} intro={description} meta={`${updatedLabel} ${updated}`}>
        <TrustNavigation activePath={activePath} />
      </PageHead>
      <div className="s-wrap s-trust">{children}</div>
    </SubShell>
  );
}

function SectionHead({ label, title, children }) {
  return (
    <header className="s-section-head">
      <p className="s-label">{label}</p>
      <h2>{title}</h2>
      {children ? <p>{children}</p> : null}
    </header>
  );
}

function DataFlow({ label, summary, steps, bidirectional = false }) {
  return (
    <article className="s-flow">
      <header>
        <p className="s-label">{label}</p>
        <h3>{summary}</h3>
      </header>
      <ol className={`s-flow-chain ${steps.length > 3 ? "s-flow-chain--long" : ""}`}>
        {steps.map(({ icon: Icon, title, copy }, index) => (
          <Fragment key={title}>
            <li>
              <span className="s-flow-icon" aria-hidden="true"><Icon size={20} weight="light" /></span>
              <strong>{title}</strong>
              <small>{copy}</small>
            </li>
            {index < steps.length - 1 ? (
              <li className="s-flow-link" aria-hidden="true">
                {bidirectional && index === 0 ? <ArrowsLeftRight size={16} /> : <ArrowRight size={16} />}
              </li>
            ) : null}
          </Fragment>
        ))}
      </ol>
    </article>
  );
}

function TransparencyPage() {
  const facts = [
    { icon: LockKey, title: "Tokens stay in Keychain", copy: "Account credentials use a this-device-only iOS Keychain setting." },
    { icon: ShieldCheck, title: "No advertising profile", copy: "The App has no advertising SDK and does not perform cross-app tracking." },
    { icon: Database, title: "Your server holds the social data", copy: "Posts, follows, messages, and media are handled by the Mastodon server you choose." },
    { icon: FileText, title: "Public policy history", copy: "These trust pages and their changes are visible in the public website repository." },
  ];

  return (
    <TrustLayout
      title="Where your data goes"
      description="Moro is a client, not a social network. These are the paths your information can take when you use the App or this website."
      updated="August 20, 2026"
    >
      <section className="s-facts" aria-label="Privacy facts">
        {facts.map(({ icon: Icon, title, copy }) => (
          <article key={title}>
            <Icon size={24} weight="light" />
            <h2>{title}</h2>
            <p>{copy}</p>
          </article>
        ))}
      </section>

      <SectionHead label="Data paths" title="Three boundaries, plainly drawn.">
        Each path has a specific purpose. Website analytics never receives your Mastodon account activity.
      </SectionHead>

      <div className="s-flows">
        <DataFlow
          label="Reading and posting"
          summary="The App talks directly to your chosen server."
          bidirectional
          steps={[
            { icon: DeviceMobile, title: "Your iPhone", copy: "Moro and its local Keychain" },
            { icon: Buildings, title: "Your Mastodon server", copy: "Account, posts, media, and social graph" },
          ]}
        />
        <DataFlow
          label="Optional push notifications"
          summary="Notification content remains encrypted until it reaches your device."
          steps={[
            { icon: Buildings, title: "Your server", copy: "Creates an encrypted Web Push payload" },
            { icon: FingerprintSimple, title: "Ciphertext", copy: "Content is encrypted for your device keys" },
            { icon: GlobeHemisphereWest, title: "Moro relay", copy: "Forwards the encrypted payload" },
            { icon: Bell, title: "Apple Push service", copy: "Delivers the notification" },
            { icon: DeviceMobile, title: "Your iPhone", copy: "Decrypts and displays the content" },
          ]}
        />
        <DataFlow
          label="This website"
          summary="Analytics stays off until you allow it."
          steps={[
            { icon: House, title: "Moro website", copy: "Marketing, support, and trust pages" },
            { icon: CheckCircle, title: "Your choice", copy: "Allow or decline optional analytics" },
            { icon: Pulse, title: "Google Analytics", copy: "Page and link events only after consent" },
          ]}
        />
      </div>

      <section className="s-callout">
        <div>
          <p className="s-label">Source availability</p>
          <h2>Private product code, public trust record.</h2>
          <p>The Moro iOS application source is private and proprietary. The website repository, policy changes, and security contact are public so the commitments on these pages have a visible history.</p>
        </div>
        <a className="s-button s-button--ghost" href="https://github.com/somincola/moro-web" target="_blank" rel="noreferrer">
          View website history <ArrowSquareOut size={15} />
        </a>
      </section>
    </TrustLayout>
  );
}

function SecurityPage() {
  return (
    <TrustLayout
      title="Security"
      description="Report a security problem privately so we can investigate it without putting other Moro users at risk."
      updated="August 20, 2026"
    >
      <section className="s-report">
        <div>
          <p className="s-label">Private reporting</p>
          <h2>Found a vulnerability?</h2>
          <p>Email the report instead of opening a public issue. Never include a real password or access token.</p>
        </div>
        <a className="s-button s-button--light" href={SECURITY_REPORT_URL}>
          Email a private report <EnvelopeSimple size={16} />
        </a>
      </section>

      <div className="s-cols">
        <section className="s-panel">
          <p className="s-label">Project security</p>
          <h2>Protect the app and its users.</h2>
          <p>We review reports across Moro’s app, extensions, encrypted push relay, and website, then prioritize fixes according to user impact.</p>
        </section>
        <section className="s-panel">
          <p className="s-label">In scope</p>
          <h2>What to report</h2>
          <ul className="s-list">
            <li>The Moro iOS app and its extensions.</li>
            <li>The encrypted push relay operated for Moro.</li>
            <li>This website and its consent controls.</li>
          </ul>
          <p>Please do not test accounts, Mastodon servers, or Apple services that you do not own or have permission to assess.</p>
        </section>
      </div>

      <section className="s-panel s-checklist">
        <div>
          <p className="s-label">A useful report</p>
          <h2>Help us reproduce it safely.</h2>
        </div>
        <ul>
          <li><CheckCircle size={18} weight="light" /> Affected Moro feature and account context</li>
          <li><CheckCircle size={18} weight="light" /> iOS version and device model</li>
          <li><CheckCircle size={18} weight="light" /> Reproduction steps using test data</li>
          <li><CheckCircle size={18} weight="light" /> Expected impact and any suggested mitigation</li>
        </ul>
      </section>

      <SectionHead label="Coordinated response" title="What happens after you report." />
      <ol className="s-steps">
        <li><span>01</span><strong>Acknowledgement</strong><p>We aim to acknowledge a complete report within three business days.</p></li>
        <li><span>02</span><strong>Triage</strong><p>We verify scope and impact, then keep the reporter informed as the investigation progresses.</p></li>
        <li><span>03</span><strong>Resolution</strong><p>We coordinate a fix and public notice when disclosure helps users update safely.</p></li>
      </ol>
    </TrustLayout>
  );
}

function LicensesPage() {
  const components = [
    { name: "SDWebImage", version: "5.21.6", area: "Moro for iOS", license: "MIT", href: "https://github.com/SDWebImage/SDWebImage/blob/5.21.6/LICENSE" },
    { name: "React and React DOM", version: "19.2.0", area: "Moro website", license: "MIT", href: "https://github.com/facebook/react/blob/v19.2.0/LICENSE" },
    { name: "Phosphor Icons", version: "2.1.10", area: "Moro website", license: "MIT", href: "https://github.com/phosphor-icons/react/blob/v2.1.10/LICENSE" },
    { name: "Partytown", version: "0.14.0", area: "Optional website analytics", license: "MIT", href: "https://github.com/QwikDev/partytown/blob/main/LICENSE" },
    { name: "Inter", version: "5.2.8 package", area: "Website typography", license: "SIL OFL 1.1", href: "https://github.com/rsms/inter/blob/master/LICENSE.txt" },
    { name: "Vite React plugin", version: "5.0.4", area: "Website build tooling", license: "MIT", href: "https://github.com/vitejs/vite-plugin-react/blob/plugin-react%405.0.4/LICENSE" },
    { name: "Vite", version: "6.4.3", area: "Website build tooling", license: "MIT", href: "https://github.com/vitejs/vite/blob/v6.4.3/LICENSE" },
  ];

  return (
    <TrustLayout
      title="Third-party software"
      description="Moro keeps its own source private while respecting the separate licenses of the software and fonts it uses."
      updated="August 19, 2026"
    >
      <section className="s-panel s-panel--wide">
        <p className="s-label">Licensing boundary</p>
        <h2>Publicly visible does not mean open source.</h2>
        <p>The Moro application and original website code and content are proprietary unless a file says otherwise. Public visibility of the website repository provides transparency; third-party components remain available under their own licenses.</p>
      </section>

      <div className="s-table" role="table" aria-label="Direct third-party components">
        <div className="s-table-row s-table-row--head" role="row">
          <span role="columnheader">Component</span>
          <span role="columnheader">Used in</span>
          <span role="columnheader">Version</span>
          <span role="columnheader">License</span>
        </div>
        {components.map((c) => (
          <div className="s-table-row" role="row" key={c.name}>
            <strong role="cell">{c.name}</strong>
            <span role="cell">{c.area}</span>
            <span role="cell" className="s-mono">{c.version}</span>
            <a role="cell" href={c.href} target="_blank" rel="noreferrer">{c.license} <ArrowSquareOut size={13} /></a>
          </div>
        ))}
      </div>

      <p className="s-footnote">This page lists direct product and website dependencies. Transitive dependencies and platform frameworks may carry additional notices in their distributions.</p>
    </TrustLayout>
  );
}

function SupportPage() {
  const links = [
    { icon: EnvelopeSimple, title: "Contact support", copy: "We’ll help with accounts, notifications, or unexpected behaviour.", href: "mailto:support@somincola.com", label: "support@somincola.com", analyticsEvent: ANALYTICS_EVENTS.supportContactClick },
    { icon: ShieldCheck, title: "Privacy policy", copy: "See what Moro handles on-device, through your server, and for push notifications.", href: "/privacy", label: "Read privacy policy" },
    { icon: Bug, title: "Security reports", copy: "Report a vulnerability privately and review the project’s security scope.", href: "/security", label: "Review security policy" },
    { icon: FileText, title: "Terms of use", copy: "Understand the terms that apply when you download and use Moro.", href: "/terms", label: "Read terms" },
  ];
  return (
    <SubShell>
      <PageHead
        icon
        eyebrow="Support"
        title="How can we help?"
        intro="Tell us what happened, what you were trying to do, and which server you use. Please never email your password or access token."
      />
      <div className="s-wrap s-support">
        <section className="s-cards" aria-label="Support options">
          {links.map(({ icon: Icon, title, copy, href, label, analyticsEvent }, index) => (
            <a
              className={`s-card ${index === 0 ? "s-card--primary" : ""}`}
              href={href}
              key={title}
              onClick={() => analyticsEvent && trackEvent(analyticsEvent, { cta_location: "support_card", link_url: href })}
            >
              <Icon size={24} weight="light" />
              <h2>{title}</h2>
              <p>{copy}</p>
              <span className="s-card-link">{label} <ArrowRight size={14} /></span>
            </a>
          ))}
        </section>
        <aside className="s-aside">
          <PaperPlaneTilt size={20} weight="light" />
          <p><strong>Response time.</strong> We aim to respond to support email within three business days.</p>
        </aside>
      </div>
    </SubShell>
  );
}

function NotFoundPage() {
  return (
    <SubShell className="m-sub--center">
      <section className="s-missing">
        <img src="/assets/moro-icon-192.png" alt="" width="72" height="72" />
        <p className="s-eyebrow">404</p>
        <h1>This page wandered off.</h1>
        <p>Let’s take you back to a calmer part of the fediverse.</p>
        <a className="s-button" href="/">Return home <ArrowRight size={15} /></a>
      </section>
    </SubShell>
  );
}

export function App({ path: rawPath = "/" }) {
  const path = normalizePath(rawPath);
  useEffect(() => { setPageMetadata(metaFor(path), path); }, [path]);
  return <PathContext.Provider value={path}><Route path={path} /></PathContext.Provider>;
}

function Route({ path }) {
  if (path === "/") return <HomePage />;
  if (path === "/privacy") return <PrivacyPage />;
  if (path === "/terms") return <TermsPage />;
  if (path === "/support") return <SupportPage />;
  if (path === "/transparency") return <TransparencyPage />;
  if (path === "/security") return <SecurityPage />;
  if (path === "/licenses") return <LicensesPage />;
  return <NotFoundPage />;
}
