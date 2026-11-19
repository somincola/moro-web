// Progressive enhancements for prerendered HTML. All page content and links
// remain available when scripts are slow, unavailable, or disabled.
export function enhanceNavigation() {
  const header = document.querySelector(".m-header");
  const toggle = header?.querySelector(".m-menu");
  if (!header || !toggle) return;
  const darkSections = [...document.querySelectorAll("#top, #privacy, #download, .m-footer")];
  let pending = false;
  const update = () => {
    pending = false;
    const open = toggle.getAttribute("aria-expanded") === "true";
    const dark = !open && darkSections.some((section) => {
      const rect = section.getBoundingClientRect();
      return rect.top <= 36 && rect.bottom > 36;
    });
    header.classList.toggle("is-dark", dark);
    header.classList.toggle("is-light", !dark);
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    header.classList.toggle("is-open", open);
    update();
  };
  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  header.querySelector(".m-nav")?.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      toggle.focus();
    }
  });
  window.matchMedia("(max-width: 760px)").addEventListener("change", () => setOpen(false));
  const schedule = () => {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(update);
  };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  update();
}

export function enhanceReveals() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduced.matches || !("IntersectionObserver" in window)) return;
  const targets = [...document.querySelectorAll("[data-reveal]")];
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.remove("is-pending");
      observer.unobserve(entry.target);
    }
  }, { rootMargin: "0px 0px 80px", threshold: 0 });
  for (const target of targets) {
    // Never hide already-visible content, including deep links and bfcache
    // restores. Only animate elements that are still below the viewport.
    if (target.getBoundingClientRect().top <= window.innerHeight + 80) continue;
    target.classList.add("is-pending");
    observer.observe(target);
  }
  reduced.addEventListener("change", () => {
    if (!reduced.matches) return;
    targets.forEach((target) => target.classList.remove("is-pending"));
    observer.disconnect();
  });
}

export function enhanceParticles() {
  const canvases = [...document.querySelectorAll("[data-particle-scene]")];
  if (!canvases.length) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const disposers = new Map();
  const pending = new Set();
  let generation = 0;
  const start = (canvas) => {
    if (disposers.has(canvas) || pending.has(canvas)) return;
    pending.add(canvas);
    const current = generation;
    const load = async () => {
      try {
        const { createParticleGlobe } = await import("./home/particleGlobe.js");
        if (current !== generation) return;
        const hero = canvas.dataset.particleScene === "hero";
        const dispose = createParticleGlobe(canvas, {
          globe: hero,
          reducedMotion: reduced.matches || Boolean(navigator.connection?.saveData),
          layout: hero ? (w, h) => {
            const top = 76;
            const room = Math.max(h - 340 - top, 240);
            return { cx: w / 2, cy: top + room / 2, r: Math.min(w * 0.4, room / 2 - 12, 300) };
          } : (w, h) => ({ cx: w / 2, cy: h * 0.5, r: Math.min(Math.max(w * 0.34, h * 0.42), 440) }),
        });
        disposers.set(canvas, dispose);
      } catch {
        // Decoration must never prevent the page or navigation from working.
      } finally {
        if (current === generation) pending.delete(canvas);
      }
    };
    if ("requestIdleCallback" in window) window.requestIdleCallback(load, { timeout: 1000 });
    else window.setTimeout(load, 150);
  };
  const observer = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
    entries.filter((entry) => entry.isIntersecting).forEach((entry) => start(entry.target));
  }, { rootMargin: "150px" }) : null;
  const observe = () => canvases.forEach((canvas) => observer ? observer.observe(canvas) : start(canvas));
  reduced.addEventListener("change", () => {
    generation += 1;
    disposers.forEach((dispose) => dispose());
    disposers.clear();
    pending.clear();
    observer?.disconnect();
    observe();
  });
  observe();
}

export function enhanceTableOfContents() {
  const links = [...document.querySelectorAll(".s-toc a[href^='#']")];
  if (!links.length || !("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver((entries) => {
    const first = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (!first) return;
    links.forEach((link) => {
      const active = link.hash === `#${first.target.id}`;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }, { rootMargin: "-80px 0px -65% 0px" });
  links.forEach((link) => {
    const heading = document.getElementById(link.hash.slice(1));
    if (heading) observer.observe(heading);
  });
}
