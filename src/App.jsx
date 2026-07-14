import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowBendUpLeft,
  ArrowRight,
  ArrowsClockwise,
  Bell,
  BookmarkSimple,
  Buildings,
  CheckCircle,
  DotsThree,
  EnvelopeSimple,
  FileText,
  GlobeHemisphereWest,
  Heart,
  House,
  List,
  LockKey,
  MagnifyingGlass,
  MegaphoneSimple,
  PaperPlaneTilt,
  PencilSimpleLine,
  ShieldCheck,
  UserCircle,
  UsersThree,
  X,
} from "@phosphor-icons/react";

const APP_STORE_URL = import.meta.env.VITE_APP_STORE_URL?.trim();

const timelineByTab = {
  Following: [
    {
      id: "mira-tokyo",
      name: "Mira Chen",
      handle: "@mira@hachyderm.io",
      time: "23m",
      text: "Rainy nights in Tokyo have a rhythm of their own.",
      image: "/assets/tokyo-rain-ayumi-kubo.jpg",
      imageAlt: "A Tokyo intersection reflecting city lights in the rain",
      likes: 12,
      position: "center 54%",
    },
    {
      id: "aiko-lake",
      name: "Aiko Mori",
      handle: "@aiko@mastodon.social",
      time: "1h",
      text: "Lake mornings and cold air. Hard to beat.",
      image: "/assets/alpine-lake-jonny-gios.jpg",
      imageAlt: "Green mountains reflected in a calm alpine lake",
      likes: 8,
      position: "center 36%",
    },
    {
      id: "sofia-coast",
      name: "Sofia Reyes",
      handle: "@sofia@fosstodon.org",
      time: "1h",
      text: "Coastal trail, low clouds, and wildflowers.",
      image: "/assets/coast-wildflowers-knopka-ivy.jpg",
      imageAlt: "Wildflowers overlooking a textured blue coastline",
      likes: 15,
      position: "center 46%",
    },
  ],
  Local: [
    {
      id: "mira-tokyo",
      name: "Mira Chen",
      handle: "@mira@hachyderm.io",
      time: "23m",
      text: "Rainy nights in Tokyo have a rhythm of their own.",
      image: "/assets/tokyo-rain-ayumi-kubo.jpg",
      imageAlt: "A Tokyo intersection reflecting city lights in the rain",
      likes: 12,
      position: "center 54%",
    },
    {
      id: "aiko-lake",
      name: "Aiko Mori",
      handle: "@aiko@hachyderm.io",
      time: "1h",
      text: "Lake mornings and cold air. Hard to beat.",
      image: "/assets/alpine-lake-jonny-gios.jpg",
      imageAlt: "Green mountains reflected in a calm alpine lake",
      likes: 8,
      position: "center 36%",
    },
    {
      id: "sofia-coast",
      name: "Sofia Reyes",
      handle: "@sofia@hachyderm.io",
      time: "1h",
      text: "Coastal trail, low clouds, and wildflowers.",
      image: "/assets/coast-wildflowers-knopka-ivy.jpg",
      imageAlt: "Wildflowers overlooking a textured blue coastline",
      likes: 15,
      position: "center 46%",
    },
  ],
  Federated: [
    {
      id: "sofia-coast",
      name: "Sofia Reyes",
      handle: "@sofia@fosstodon.org",
      time: "9m",
      text: "The open web feels wide today. Sharing this view with everyone.",
      image: "/assets/coast-wildflowers-knopka-ivy.jpg",
      imageAlt: "Wildflowers overlooking a textured blue coastline",
      likes: 15,
      position: "center 46%",
    },
    {
      id: "mira-tokyo",
      name: "Mira Chen",
      handle: "@mira@hachyderm.io",
      time: "23m",
      text: "雨の東京は、いつも少しだけ映画みたい。",
      image: "/assets/tokyo-rain-ayumi-kubo.jpg",
      imageAlt: "A Tokyo intersection reflecting city lights in the rain",
      likes: 12,
      position: "center 54%",
    },
    {
      id: "aiko-lake",
      name: "Aiko Mori",
      handle: "@aiko@mastodon.social",
      time: "1h",
      text: "A quiet place for a noisy week.",
      image: "/assets/alpine-lake-jonny-gios.jpg",
      imageAlt: "Green mountains reflected in a calm alpine lake",
      likes: 8,
      position: "center 36%",
    },
  ],
};

const conversations = [
  {
    name: "Mira Chen",
    handle: "@mira@hachyderm.io",
    time: "23m",
    text: "Rainy nights in Tokyo have a rhythm of their own.",
    likes: 12,
    image: "/assets/tokyo-rain-ayumi-kubo.jpg",
  },
  {
    name: "Aiko Mori",
    handle: "@aiko@mastodon.social",
    time: "18m",
    text: "Perfect for a late ramen run.",
    likes: 5,
    image: "/assets/alpine-lake-jonny-gios.jpg",
  },
  {
    name: "Sofia Reyes",
    handle: "@sofia@fosstodon.org",
    time: "9m",
    text: "That glow on wet pavement hits different.",
    likes: 3,
    image: "/assets/coast-wildflowers-knopka-ivy.jpg",
  },
];

const serverGroups = [
  ["hachyderm.io", "Mastodon"],
  ["mastodon.social", "Mastodon"],
  ["fosstodon.org", "Mastodon"],
  ["m.somincola.org", "Mastodon"],
  ["kollektiv.social", "Mastodon"],
  ["norden.social", "Mastodon"],
];

function setPageMetadata(title, description) {
  document.title = title;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute("content", description);
}

function StoreBadge({ compact = false, onClick }) {
  return (
    <button className={`store-badge ${compact ? "store-badge--compact" : ""}`} onClick={onClick} type="button">
      <img src="/assets/download-on-app-store.png" alt="Download on the App Store" />
    </button>
  );
}

function Header({ onStoreClick }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="Moro home">
        <img src="/assets/moro-app-icon.png" alt="" />
        <span>Moro</span>
      </a>
      <button
        className="menu-button"
        type="button"
        aria-expanded={menuOpen}
        aria-controls="primary-navigation"
        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        onClick={() => setMenuOpen((value) => !value)}
      >
        {menuOpen ? <X size={22} /> : <List size={24} />}
      </button>
      <nav id="primary-navigation" className={menuOpen ? "primary-nav primary-nav--open" : "primary-nav"}>
        <a href="/#features" onClick={() => setMenuOpen(false)}>Features</a>
        <a href="/privacy" onClick={() => setMenuOpen(false)}>Privacy</a>
        <a href="/support" onClick={() => setMenuOpen(false)}>Support</a>
        <StoreBadge compact onClick={onStoreClick} />
      </nav>
    </header>
  );
}

function PostActions({ post, liked, bookmarked, onLike, onBookmark }) {
  return (
    <div className="post-actions" aria-label={`Actions for ${post.name}'s post`}>
      <button type="button" aria-label="Reply"><ArrowBendUpLeft size={18} /></button>
      <button type="button" aria-label="Boost"><ArrowsClockwise size={18} /></button>
      <button className={liked ? "is-active" : ""} type="button" aria-pressed={liked} onClick={onLike} aria-label={liked ? "Unlike" : "Like"}>
        <Heart size={18} weight={liked ? "fill" : "regular"} />
        <span>{post.likes + (liked ? 1 : 0)}</span>
      </button>
      <button className={bookmarked ? "is-bookmarked" : ""} type="button" aria-pressed={bookmarked} onClick={onBookmark} aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}>
        <BookmarkSimple size={18} weight={bookmarked ? "fill" : "regular"} />
      </button>
      <button type="button" aria-label="More actions"><DotsThree size={19} weight="bold" /></button>
    </div>
  );
}

function TimelinePost({ post, index, liked, bookmarked, onLike, onBookmark }) {
  return (
    <article className="timeline-post">
      <div className="post-heading">
        <img className="avatar" src={post.image} alt="" style={{ objectPosition: post.position }} />
        <div className="post-identity">
          <div><strong>{post.name}</strong> <span>{post.handle}</span></div>
          <p>{post.text}</p>
        </div>
        <time>{post.time}</time>
      </div>
      <img
        className="post-media"
        src={post.image}
        alt={post.imageAlt}
        style={{ objectPosition: post.position }}
        loading={index === 0 ? "eager" : "lazy"}
      />
      <PostActions
        post={post}
        liked={liked}
        bookmarked={bookmarked}
        onLike={onLike}
        onBookmark={onBookmark}
      />
    </article>
  );
}

function AppPreview() {
  const [activeTab, setActiveTab] = useState("Local");
  const [liked, setLiked] = useState({});
  const [bookmarked, setBookmarked] = useState({});
  const posts = timelineByTab[activeTab];

  return (
    <div className="app-preview" aria-label="Interactive Moro timeline preview">
      <div className="feed-tabs" role="tablist" aria-label="Timeline type">
        {Object.keys(timelineByTab).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            className={activeTab === tab ? "is-selected" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
        <button className="announcement-button" type="button" aria-label="Announcements"><MegaphoneSimple size={19} /></button>
      </div>
      <div className="timeline" role="tabpanel">
        {posts.map((post, index) => (
          <TimelinePost
            key={`${activeTab}-${post.id}`}
            post={post}
            index={index}
            liked={Boolean(liked[post.id])}
            bookmarked={Boolean(bookmarked[post.id])}
            onLike={() => setLiked((state) => ({ ...state, [post.id]: !state[post.id] }))}
            onBookmark={() => setBookmarked((state) => ({ ...state, [post.id]: !state[post.id] }))}
          />
        ))}
      </div>
      <nav className="app-tab-bar" aria-label="Moro app preview navigation">
        <button className="is-selected" type="button" aria-label="Home"><House size={23} weight="fill" /></button>
        <button type="button" aria-label="Search"><MagnifyingGlass size={24} /></button>
        <button type="button" aria-label="Compose"><PencilSimpleLine size={24} /></button>
        <button type="button" aria-label="Notifications"><Bell size={24} /></button>
        <button type="button" aria-label="Profile"><UserCircle size={25} /></button>
      </nav>
    </div>
  );
}

function Hero({ onStoreClick }) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow"><GlobeHemisphereWest size={18} /> Built for the open social web</p>
        <h1 id="hero-title">A calmer home<br />for the fediverse.</h1>
        <p className="hero-lede">Read, connect, and share across the open social web.</p>
        <StoreBadge onClick={onStoreClick} />
        <p className="server-note"><CheckCircle size={18} weight="fill" /> Works with any Mastodon server</p>
      </div>
      <div className="hero-preview-wrap">
        <div className="preview-halo" aria-hidden="true" />
        <AppPreview />
      </div>
    </section>
  );
}

function ConversationCard({ item, index }) {
  return (
    <article className="conversation-card" style={{ "--card-index": index }}>
      <img src={item.image} alt="" />
      <div>
        <div className="conversation-meta"><strong>{item.name}</strong><span>{item.handle}</span><time>{item.time}</time></div>
        <p>{item.text}</p>
        <div className="conversation-actions"><ArrowBendUpLeft size={16} /><ArrowsClockwise size={16} /><Heart size={16} weight="fill" /><span>{item.likes}</span><BookmarkSimple size={16} /><DotsThree size={17} /></div>
      </div>
    </article>
  );
}

function StorySection() {
  const sectionRef = useRef(null);
  const conversationsRef = useRef(null);
  const networkRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const conversationsLayer = conversationsRef.current;
    const networkLayer = networkRef.current;
    if (!section || !conversationsLayer || !networkLayer) return undefined;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const staticLayout = window.matchMedia("(max-width: 900px)");
    let frame = 0;
    let sectionTop = 0;
    let travel = 1;
    let lastProgress = -1;

    const applyProgress = (progress) => {
      if (Math.abs(progress - lastProgress) < 0.001) return;
      lastProgress = progress;

      const conversationOpacity = Math.max(0.3, 1 - progress * 0.9);
      const networkOpacity = Math.min(1, Math.max(0.4, (progress + 0.08) * 1.35));
      conversationsLayer.style.opacity = conversationOpacity.toFixed(4);
      conversationsLayer.style.transform = `translate3d(0, ${(-progress * 34).toFixed(2)}px, 0)`;
      networkLayer.style.opacity = networkOpacity.toFixed(4);
      networkLayer.style.transform = `translate3d(0, ${((1 - networkOpacity) * 34).toFixed(2)}px, 0)`;
    };

    const measure = () => {
      const rect = section.getBoundingClientRect();
      sectionTop = window.scrollY + rect.top;
      travel = Math.max(1, rect.height - window.innerHeight);
    };

    const update = () => {
      frame = 0;
      if (reducedMotion.matches || staticLayout.matches) {
        applyProgress(0.5);
        return;
      }

      const next = Math.min(1, Math.max(0, (window.scrollY - sectionTop) / travel));
      applyProgress(next);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const onResize = () => {
      measure();
      onScroll();
    };

    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("load", onResize, { once: true });
    reducedMotion.addEventListener("change", onResize);
    staticLayout.addEventListener("change", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onResize);
      reducedMotion.removeEventListener("change", onResize);
      staticLayout.removeEventListener("change", onResize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section className="story" id="features" ref={sectionRef}>
      <div className="story-stage">
        <div className="story-glow" aria-hidden="true" />
        <div className="story-conversations" ref={conversationsRef}>
          <div className="story-copy">
            <p className="section-kicker">Threads, made readable</p>
            <h2>Conversations<br />without the noise.</h2>
            <span className="gold-rule" aria-hidden="true" />
            <p>Threads that feel like conversations. Follow replies with clarity and respond when you’re ready.</p>
          </div>
          <div className="conversation-stack">
            <span className="thread-line" aria-hidden="true" />
            {conversations.map((item, index) => <ConversationCard item={item} index={index} key={item.handle} />)}
          </div>
        </div>

        <div className="network-story" ref={networkRef}>
          <div className="network-copy">
            <p className="section-kicker">Open by design</p>
            <h2>One network.<br />Many homes.</h2>
            <span className="gold-rule" aria-hidden="true" />
            <p>Moro works with any Mastodon server you choose. Your community, your data, your decision.</p>
          </div>
          <div className="network-map" aria-label="Moro connects to independently operated Mastodon servers">
            <div className="server-column">
              {serverGroups.filter((_, index) => index % 2 === 0).map(([server, software]) => (
                <div className="server-card" key={server}><Buildings size={22} /><span><strong>{server}</strong><small>{software}</small></span></div>
              ))}
            </div>
            <div className="network-center">
              <span className="network-rail network-rail--left" aria-hidden="true" />
              <img src="/assets/moro-app-icon.png" alt="Moro" />
              <span className="network-rail network-rail--right" aria-hidden="true" />
            </div>
            <div className="server-column">
              {serverGroups.filter((_, index) => index % 2 === 1).map(([server, software]) => (
                <div className="server-card" key={server}><Buildings size={22} /><span><strong>{server}</strong><small>{software}</small></span></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PrivacySection() {
  const points = [
    { icon: House, title: "Your server", copy: "Pick any compatible Mastodon server. Change anytime." },
    { icon: LockKey, title: "Your account", copy: "Log in with your existing account. Credentials stay in the iOS Keychain." },
    { icon: UsersThree, title: "Your communities", copy: "Follow, reply, and boost across the open social web." },
  ];
  return (
    <section className="privacy-feature" id="privacy" aria-labelledby="privacy-title">
      <div className="privacy-mark"><img src="/assets/moro-app-icon.png" alt="Moro app icon" /></div>
      <div className="privacy-copy">
        <p className="section-kicker">Privacy, without theatre</p>
        <h2 id="privacy-title">Your data. Your choice.</h2>
        <span className="gold-rule" aria-hidden="true" />
        <p>Moro connects directly to the Mastodon server you choose. We don’t sell your data or use it for advertising.</p>
        <a className="text-link" href="/privacy">Read the privacy policy <ArrowRight size={17} /></a>
      </div>
      <div className="privacy-points">
        {points.map(({ icon: Icon, title, copy }) => (
          <article key={title}><Icon size={29} /><div><h3>{title}</h3><p>{copy}</p></div></article>
        ))}
      </div>
    </section>
  );
}

function DownloadSection({ onStoreClick, storeNotice }) {
  return (
    <section className="download" id="download" aria-labelledby="download-title">
      <img className="download-icon" src="/assets/moro-app-icon.png" alt="" />
      <p className="section-kicker">Moro for iOS</p>
      <h2 id="download-title">Get Moro for iPhone</h2>
      <p>A calm, open, and respectful way to experience the fediverse.</p>
      <StoreBadge onClick={onStoreClick} />
      {storeNotice ? <p className="store-notice" role="status">The App Store link will appear here as soon as Moro is available.</p> : null}
    </section>
  );
}

function Footer({ includeCredits = false }) {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <a className="footer-brand" href="/"><img src="/assets/moro-app-icon.png" alt="" /><span>Moro</span></a>
        <nav aria-label="Footer navigation">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/support">Support</a>
        </nav>
        <p>© 2026 somincola llc</p>
      </div>
      {includeCredits ? (
        <details className="photo-credits" id="credits">
          <summary>Photo credits</summary>
          <p>
            Tokyo by <a href="https://unsplash.com/photos/QgM0UH5vH8M" target="_blank" rel="noreferrer">Ayumi Kubo</a>,
            alpine lake by <a href="https://unsplash.com/photos/IWhpMyaol8c" target="_blank" rel="noreferrer">Jonny Gios</a>, and
            coast by <a href="https://unsplash.com/photos/uUyEus69hh4" target="_blank" rel="noreferrer">Knopka Ivy</a> on Unsplash.
          </p>
        </details>
      ) : null}
    </footer>
  );
}

function HomePage({ onStoreClick, storeNotice }) {
  useEffect(() => {
    setPageMetadata("Moro — A calmer home for the fediverse", "Moro is a calm, privacy-respecting Mastodon client for iPhone.");
  }, []);

  return (
    <>
      <Header onStoreClick={onStoreClick} />
      <main>
        <Hero onStoreClick={onStoreClick} />
        <StorySection />
        <PrivacySection />
        <DownloadSection onStoreClick={onStoreClick} storeNotice={storeNotice} />
      </main>
      <Footer includeCredits />
    </>
  );
}

function LegalLayout({ title, description, updated, children, onStoreClick }) {
  useEffect(() => setPageMetadata(`${title} — Moro`, description), [title, description]);
  return (
    <>
      <Header onStoreClick={onStoreClick} />
      <main className="document-shell">
        <article className="legal-document">
          <p className="section-kicker">Moro · somincola llc</p>
          <h1>{title}</h1>
          <p className="last-updated">Last updated: {updated}</p>
          {children}
        </article>
      </main>
      <Footer />
    </>
  );
}

function PrivacyPage({ onStoreClick }) {
  return (
    <LegalLayout title="Privacy Policy" description="Privacy policy for Moro, a Mastodon client for iPhone." updated="July 14, 2026" onStoreClick={onStoreClick}>
      <p>Moro (“the App”) is a third-party client for Mastodon and the fediverse, developed by <strong>somincola llc</strong> (“we”, “us”, “our”). This policy explains what information the App handles and where it goes.</p>

      <h2>The short version</h2>
      <ul>
        <li>Your account, posts, messages, follows, and media are exchanged directly between the App and the Mastodon server you choose.</li>
        <li>Your access tokens are stored on your device in the iOS Keychain.</li>
        <li>Moro does not include advertising or cross-app tracking, and we do not sell your data.</li>
        <li>If you enable push notifications, our self-hosted relay forwards encrypted notification payloads to Apple Push Notification service (APNs). Decryption happens on your device.</li>
      </ul>

      <h2>Information the App handles</h2>
      <h3>Stored on your device</h3>
      <ul>
        <li>Access tokens and session credentials for the server accounts you add, stored in the iOS Keychain.</li>
        <li>Local caches, drafts, preferences, and downloaded media used to operate the App.</li>
        <li>Web Push encryption keys used to decrypt notification content on your device.</li>
      </ul>

      <h3>Exchanged with your Mastodon server</h3>
      <p>Posts, replies, direct messages, follows, boosts, favourites, profile changes, searches, and related account activity are sent to and received from the independently operated Mastodon server you choose. That server’s privacy policy and terms apply to its processing of your data.</p>

      <h3>Push notifications</h3>
      <p>If you grant notification permission, Moro registers your device with APNs and creates a Web Push subscription with your Mastodon server. The subscription endpoint contains an APNs device token and an opaque local session identifier and points to our relay at <strong>push.somincola.org</strong>.</p>
      <p>The relay receives the encrypted Web Push payload from your Mastodon server and forwards that ciphertext to APNs. Moro’s notification extension decrypts the content on your device. Apple processes device and delivery information under Apple’s own privacy terms. Disabling notifications stops new push delivery; removing an account removes its subscription from the App’s active configuration.</p>

      <h2>Data we do not collect for tracking</h2>
      <p>Moro does not use third-party advertising SDKs, does not track you across apps or websites, and does not collect data for advertising profiles. The current App Privacy manifest declares no tracked domains and no data types collected by the App developer.</p>

      <h2>In-app purchases</h2>
      <p>If Moro offers optional purchases or tips, Apple processes payment. We do not receive or store your full payment-card details.</p>

      <h2>Data retention and your choices</h2>
      <ul>
        <li>Log out or remove an account to delete its credentials from the App.</li>
        <li>Delete local drafts and cached content from the App where controls are available.</li>
        <li>Disable notifications in iOS Settings.</li>
        <li>Uninstall Moro to remove its local app data from your device.</li>
      </ul>

      <h2>Children</h2>
      <p>Moro is not directed to children. You must meet the minimum age required by your region and by the Mastodon server you use.</p>

      <h2>Changes to this policy</h2>
      <p>We may update this policy as Moro changes. Material changes will be published here with a revised date.</p>

      <h2>Contact</h2>
      <p><strong>somincola llc</strong><br /><a href="mailto:privacy@somincola.com">privacy@somincola.com</a></p>
    </LegalLayout>
  );
}

function TermsPage({ onStoreClick }) {
  return (
    <LegalLayout title="Terms of Use" description="Terms of use for Moro, a Mastodon client for iPhone." updated="July 14, 2026" onStoreClick={onStoreClick}>
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

function SupportPage({ onStoreClick }) {
  useEffect(() => setPageMetadata("Support — Moro", "Support, privacy, and legal information for Moro."), []);
  const links = [
    { icon: EnvelopeSimple, title: "Contact support", copy: "We’ll help with accounts, notifications, or unexpected behaviour.", href: "mailto:support@somincola.com", label: "support@somincola.com" },
    { icon: ShieldCheck, title: "Privacy policy", copy: "See what Moro handles on-device, through your server, and for push notifications.", href: "/privacy", label: "Read privacy policy" },
    { icon: FileText, title: "Terms of use", copy: "Understand the terms that apply when you download and use Moro.", href: "/terms", label: "Read terms" },
  ];
  return (
    <>
      <Header onStoreClick={onStoreClick} />
      <main className="support-shell">
        <section className="support-intro">
          <div className="support-icon"><img src="/assets/moro-app-icon.png" alt="Moro app icon" /></div>
          <p className="section-kicker">Moro support</p>
          <h1>How can we help?</h1>
          <p>Tell us what happened, which server you use, and your Moro version. Please never email your password or access token.</p>
        </section>
        <section className="support-grid" aria-label="Support options">
          {links.map(({ icon: Icon, title, copy, href, label }) => (
            <a className="support-card" href={href} key={title}>
              <span className="support-card-icon"><Icon size={28} /></span>
              <div><h2>{title}</h2><p>{copy}</p><span className="support-card-link">{label} <ArrowRight size={17} /></span></div>
            </a>
          ))}
        </section>
        <aside className="support-note"><PaperPlaneTilt size={24} /><p><strong>Response time</strong><br />We aim to respond to support email within three business days.</p></aside>
      </main>
      <Footer />
    </>
  );
}

function NotFoundPage({ onStoreClick }) {
  useEffect(() => setPageMetadata("Page not found — Moro", "The requested Moro page could not be found."), []);
  return (
    <>
      <Header onStoreClick={onStoreClick} />
      <main className="not-found"><img src="/assets/moro-app-icon.png" alt="" /><p className="section-kicker">404</p><h1>This page wandered off.</h1><p>Let’s take you back to a calmer part of the fediverse.</p><a className="primary-link" href="/">Return home <ArrowRight size={18} /></a></main>
      <Footer />
    </>
  );
}

export function App() {
  const path = useMemo(() => {
    const clean = window.location.pathname.replace(/\/+$/, "");
    return clean || "/";
  }, []);
  const [storeNotice, setStoreNotice] = useState(false);

  const handleStoreClick = () => {
    if (APP_STORE_URL) {
      window.open(APP_STORE_URL, "_blank", "noopener,noreferrer");
      return;
    }
    setStoreNotice(true);
    if (path === "/") document.querySelector("#download")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  if (path === "/") return <HomePage onStoreClick={handleStoreClick} storeNotice={storeNotice} />;
  if (path === "/privacy") return <PrivacyPage onStoreClick={handleStoreClick} />;
  if (path === "/terms") return <TermsPage onStoreClick={handleStoreClick} />;
  if (path === "/support") return <SupportPage onStoreClick={handleStoreClick} />;
  return <NotFoundPage onStoreClick={handleStoreClick} />;
}
