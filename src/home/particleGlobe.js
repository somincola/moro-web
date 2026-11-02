/*
 * Particle globe — a web port of the Moro iOS onboarding scene
 * (moro-ios: moro/Modules/Onboarding/OnboardingGlobeView.swift).
 *
 * Same idea, same numbers where it matters:
 *   · 968 stars on a golden-angle sphere; every 23rd one is a "server";
 *   · the surface rolls with a slow tide (long waves + drifting swells);
 *   · distant stars twinkle, server stars glow, meteors race between servers
 *     along great-circle arcs and leave a brief link behind;
 *   · the globe idles in a slow turn and can be turned by dragging, with a
 *     little momentum on release.
 * On the web the stars gather into the globe from a wide scatter on load,
 * standing in for the app's swipe-to-gather net.
 */

const COUNT = 22 * 44;
const TAU = Math.PI * 2;

function noise(index, salt) {
  let h = Math.imul(index + 1, 0x9e3779b1) ^ salt;
  h ^= h >>> 15; h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

const smoothstep = (a, b, x) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

/* 3×3 rotations, row-major arrays */
const rotX = (a) => [1, 0, 0, 0, Math.cos(a), -Math.sin(a), 0, Math.sin(a), Math.cos(a)];
const rotY = (a) => [Math.cos(a), 0, Math.sin(a), 0, 1, 0, -Math.sin(a), 0, Math.cos(a)];
const IDENTITY = [1, 0, 0, 0, 1, 0, 0, 0, 1];
function axisAngle(x, y, z, angle) {
  const c = Math.cos(angle), s = Math.sin(angle), t = 1 - c;
  return [t * x * x + c, t * x * y - s * z, t * x * z + s * y,
    t * x * y + s * z, t * y * y + c, t * y * z - s * x,
    t * x * z - s * y, t * y * z + s * x, t * z * z + c];
}
function mul(a, b) {
  return [
    a[0] * b[0] + a[1] * b[3] + a[2] * b[6], a[0] * b[1] + a[1] * b[4] + a[2] * b[7], a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
    a[3] * b[0] + a[4] * b[3] + a[5] * b[6], a[3] * b[1] + a[4] * b[4] + a[5] * b[7], a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
    a[6] * b[0] + a[7] * b[3] + a[8] * b[6], a[6] * b[1] + a[7] * b[4] + a[8] * b[7], a[6] * b[2] + a[7] * b[5] + a[8] * b[8],
  ];
}

const POINTS = (() => {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const list = [];
  for (let i = 0; i < COUNT; i += 1) {
    const y = 1 - ((i + 0.5) / COUNT) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    const angle = noise(i, 0x51) * TAU;
    const reach = 0.35 + Math.sqrt(noise(i, 0x52)) * 0.65;
    list.push({
      x: Math.cos(theta) * r, y, z: Math.sin(theta) * r,
      // where the star waits before gathering: a wide, soft scatter
      sx: Math.cos(angle) * reach, sy: Math.sin(angle) * reach,
      server: i % 23 === 7,
      delay: noise(i, 0x33),
      phase: noise(i, 0x44) * TAU,
    });
  }
  return list;
})();
const SERVERS = POINTS.map((p, i) => (p.server ? i : -1)).filter((i) => i >= 0);
/* The breathing sky behind the globe: each star swells and fades on its own
   slow breath; a handful are a little brighter and carry a faint glow. */
const SKY = Array.from({ length: 360 }, (_, i) => {
  const size = Math.pow(noise(i, 0xa7), 2.2);
  return {
    x: noise(i, 0xd4), y: noise(i, 0xe5), phase: noise(i, 0xf6) * TAU,
    size,
    breath: 0.55 + noise(i, 0xb8) * 0.9, // radians per second → 4–11 s breaths
    bright: noise(i, 0xc9) > 0.965,
  };
});

/* The flanks: a second, livelier field that fills the space either side of
   the globe. Stars sit at three depths, breathe slowly (swell and fade on
   their own 5–12 s cycle) and drift a few pixels; they fade out as they near
   the globe so the sphere keeps its clean silhouette. */
const FLANK = Array.from({ length: 300 }, (_, i) => {
  const depth = noise(i, 0x91); // 0 far … 1 near
  return {
    x: noise(i, 0x92),
    y: noise(i, 0x93),
    depth,
    phase: noise(i, 0x94) * TAU,
    breath: 0.5 + noise(i, 0x95) * 0.75,
    drift: (noise(i, 0x96) - 0.5) * (2 + depth * 6), // px/s
    beacon: noise(i, 0x97) > 0.955,
  };
});

/* A soft radial glow, rendered once and stamped with drawImage — far cheaper
   than building a radial gradient for every glow on every frame. */
let glowSprite = null;
function getGlowSprite(ink) {
  if (glowSprite && glowSprite.ink === ink) return glowSprite.canvas;
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, `rgba(${ink},1)`);
  grad.addColorStop(0.35, `rgba(${ink},0.45)`);
  grad.addColorStop(1, `rgba(${ink},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  glowSprite = { ink, canvas: c };
  return c;
}

const REACH = 150; // px of drag per radian
const DECAY = 0.45; // momentum decay, s
const GATHER = 2.4; // s

export function createParticleGlobe(canvas, options = {}) {
  const ctx = canvas.getContext("2d");
  const ink = options.ink || "255,255,255";
  const reduced = Boolean(options.reducedMotion);
  const layout = options.layout || ((w, h) => ({ cx: w / 2, cy: h * 0.42, r: Math.min(w * 0.42, h * 0.3) }));
  // `globe: false` draws only the breathing sky — used to close the page.
  const showGlobe = options.globe !== false;
  // Overall brightness of the globe; kept soft so it reads as a quiet presence.
  const dim = options.dim ?? 0.68;

  let width = 0, height = 0, dpr = 1;
  let detail = 1; // draw every Nth particle; 1 = full detail
  let haloCache = null;
  const sprite = getGlowSprite(ink);
  // stamp a glow of `radius` px at (x, y) with peak opacity `alpha`
  const glow = (x, y, radius, alpha) => {
    if (alpha < 0.01) return;
    ctx.globalAlpha = Math.min(alpha, 1);
    ctx.drawImage(sprite, x - radius, y - radius, radius * 2, radius * 2);
  };
  let raf = 0, running = false, visible = true;
  let start = performance.now();

  // turning
  let base = rotX(0.38);
  let live = null; // {dx, dy}
  let velocity = { x: 0, y: 0 };
  let released = -Infinity;
  let drag = null;

  const turnBy = (dx, dy) => {
    const len = Math.hypot(dx, dy);
    if (len < 0.001) return IDENTITY;
    return axisAngle(dy / len, dx / len, 0, len / REACH);
  };
  const turnMatrix = (now) => {
    if (live) return mul(turnBy(live.dx, live.dy), base);
    const elapsed = Math.max((now - released) / 1000, 0);
    const carry = DECAY * (1 - Math.exp(-elapsed / DECAY));
    return mul(turnBy(velocity.x * carry, velocity.y * carry), base);
  };

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, rect.width < 768 ? 1.5 : 2);
    width = rect.width; height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    if (!running) draw(performance.now());
  }

  function tide(p, t, bumps, presence) {
    let h = 0.2 * Math.sin(2.2 * p.x + 1.4 * p.y - t * 0.6)
      + 0.15 * Math.sin(2.6 * p.z - 1.8 * p.y + t * 0.45 + 1.3);
    for (const b of bumps) {
      const d = p.x * b.x + p.y * b.y + p.z * b.z;
      h += b.amount * Math.exp(-(1 - d) / 0.09);
    }
    return Math.min(Math.max(h, -1), 1) * presence;
  }

  function draw(now) {
    const t = (now - start) / 1000;
    const morph = reduced ? 1 : Math.min(t / GATHER, 1);
    const { cx, cy, r: R } = layout(width, height);
    const rotation = mul(turnMatrix(now), rotY(-0.6 + 0.08 * t));
    const presence = smoothstep(0.55, 1, morph);
    const bumps = [];
    for (let k = 0; k < 5; k += 1) {
      const lon = t * 0.11 * (1 + 0.3 * k) + k * 1.6;
      const lat = 0.9 * Math.sin(t * 0.07 * (1 + 0.2 * k) + k);
      bumps.push({
        x: Math.cos(lat) * Math.cos(lon), y: Math.sin(lat), z: Math.cos(lat) * Math.sin(lon),
        amount: Math.sin(t * (0.4 + 0.07 * k) + k * 1.3),
      });
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    // distant sky, breathing — present from the first frame, a touch brighter once the globe forms
    const skyIn = reduced ? 1 : 0.55 + 0.45 * smoothstep(0, 1.6, t);
    const buckets4 = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];
    const flares = [];
    for (let si = 0; si < SKY.length; si += detail) {
      const s = SKY[si];
      const breath = reduced ? 0.6 : 0.5 + 0.5 * Math.sin(t * s.breath + s.phase);
      const rr = 0.35 + 0.9 * s.size + (s.bright ? 0.5 : 0);
      const x = s.x * width, y = s.y * height;
      let level = Math.min(Math.floor((0.25 + 0.75 * breath) * (0.45 + 0.55 * s.size) * 4), 3);
      if (!showGlobe) {
        // leave the words in clear sky
        const d = Math.hypot(x - cx, (y - cy) * 1.15);
        if (d < R * 0.8) continue;
        if (d < R * 1.15) level = Math.max(level - 2, 0);
      }
      buckets4[level].moveTo(x + rr, y);
      buckets4[level].arc(x, y, rr, 0, TAU);
      if (s.bright) flares.push([x, y, breath]);
    }
    buckets4.forEach((path, i) => {
      ctx.fillStyle = `rgba(${ink},${[0.1, 0.2, 0.34, 0.5][i] * skyIn})`;
      ctx.fill(path);
    });
    for (const [x, y, breath] of flares) glow(x, y, 7, 0.16 * breath * skyIn);
    ctx.globalAlpha = 1;

    // flanks — breathing stars either side of the globe
    {
      const flankIn = reduced ? 1 : smoothstep(0.2, 2.2, t);
      const levels = [new Path2D(), new Path2D(), new Path2D(), new Path2D(), new Path2D()];
      const beacons = [];
      for (let fi = 0; fi < FLANK.length; fi += detail) {
        const s = FLANK[fi];
        let x = (s.x * width + (reduced ? 0 : s.drift * t)) % width;
        if (x < 0) x += width;
        const y = s.y * height;
        const dist = Math.hypot(x - cx, (y - cy) * 1.05);
        // quiet near the sphere, under the header, and around the wordmark below
        const textBand = showGlobe
          ? smoothstep(height - 380, height - 300, y) * (1 - smoothstep(170, 300, Math.abs(x - cx)))
          : 0;
        const clear = showGlobe
          ? smoothstep(R * 1.12, R * 1.75, dist) * smoothstep(54, 96, y) * (1 - textBand)
          : 0.25 + 0.75 * smoothstep(R * 0.6, R * 1.4, dist);
        if (clear <= 0.02) continue;
        const breath = reduced ? 0.6 : 0.5 + 0.5 * Math.sin(t * s.breath + s.phase);
        const b = Math.pow(breath, 1.6);
        const strength = (0.18 + 0.82 * s.depth) * (0.2 + 0.8 * b) * clear * flankIn;
        const rr = 0.45 + 0.85 * s.depth * (0.75 + 0.35 * b) + (s.beacon ? 0.45 : 0);
        const level = Math.min(Math.floor(strength * 5), 4);
        levels[level].moveTo(x + rr, y);
        levels[level].arc(x, y, rr, 0, TAU);
        if (s.beacon) beacons.push([x, y, b * clear * flankIn]);
      }
      levels.forEach((path, i) => {
        ctx.fillStyle = `rgba(${ink},${[0.12, 0.26, 0.42, 0.6, 0.8][i]})`;
        ctx.fill(path);
      });
      for (const [x, y, a] of beacons) glow(x, y, 9 + 5 * a, 0.22 * a);
      ctx.globalAlpha = 1;
    }

    // halo
    if (showGlobe && presence > 0) {
      // the faint halo is rendered once per size and reused every frame
      const reach = Math.ceil(R * 1.45);
      if (!haloCache || haloCache.reach !== reach) {
        const c = document.createElement("canvas");
        c.width = c.height = reach * 2;
        const g = c.getContext("2d");
        const grad = g.createRadialGradient(reach, reach, R * 0.5, reach, reach, reach);
        grad.addColorStop(0, `rgba(${ink},0.03)`);
        grad.addColorStop(1, `rgba(${ink},0)`);
        g.fillStyle = grad;
        g.fillRect(0, 0, reach * 2, reach * 2);
        haloCache = { reach, canvas: c };
      }
      ctx.globalAlpha = presence;
      ctx.drawImage(haloCache.canvas, cx - reach, cy - reach);
      ctx.globalAlpha = 1;
    }

    // stars
    if (!showGlobe) return;
    const buckets = Array.from({ length: 8 }, () => new Path2D());
    const glows = [];
    const servers = new Path2D();
    const m = rotation;
    for (let i = 0; i < COUNT; i += detail) {
      const p = POINTS[i];
      const local = morph >= 1 ? 1 : Math.min(Math.max((morph - p.delay * 0.35) / 0.65, 0), 1);
      const e = local * local * (3 - 2 * local);
      const wave = tide(p, t, bumps, presence);
      const rx = m[0] * p.x + m[1] * p.y + m[2] * p.z;
      const ry = m[3] * p.x + m[4] * p.y + m[5] * p.z;
      const rz = m[6] * p.x + m[7] * p.y + m[8] * p.z;
      const rad = R * (1 + 0.065 * wave);
      const gx = cx + rx * rad, gy = cy - ry * rad;
      // scattered across the visible sky, then drawn in
      const scatterX = width / 2 + p.sx * width * 0.48;
      const scatterY = height / 2 + p.sy * height * 0.46;
      const x = scatterX + (gx - scatterX) * e;
      const y = scatterY + (gy - scatterY) * e;

      const twinkle = 0.7 + 0.3 * Math.sin(t * (1.2 + p.delay * 1.4) + p.phase);
      const flare = Math.pow(Math.max(Math.sin(t * (0.3 + 0.45 * p.delay) + p.phase * 3), 0), 14);
      const depth = Math.min(Math.max((rz + 0.35) / 1.35, 0), 1);
      const globeA = rz > -0.35 ? (0.08 + 0.5 * depth) * (1 + 0.45 * wave) * twinkle + 0.3 * flare * depth : 0;
      const scatterA = (0.18 + 0.3 * p.delay) * twinkle;
      const alpha = Math.min(Math.max(scatterA + (globeA - scatterA) * e, 0), 1);
      if (alpha < 0.01) continue;
      const globeR = (0.7 + 1.0 * depth) * (1 + 0.3 * wave) + 0.6 * flare * depth;
      const radius = 0.8 + (globeR - 0.8) * e;

      if (p.server && e > 0.9 && rz > 0) {
        const sr = 2.2 + 1.3 * depth;
        servers.moveTo(x + sr, y); servers.arc(x, y, sr, 0, TAU);
        glows.push([x, y, sr, depth]);
      } else {
        const b = Math.min(Math.floor((alpha / 0.8) * 8), 7);
        buckets[b].moveTo(x + radius, y);
        buckets[b].arc(x, y, radius, 0, TAU);
      }
    }
    buckets.forEach((path, i) => {
      ctx.fillStyle = `rgba(${ink},${((i + 0.5) / 8) * 0.8 * dim})`;
      ctx.fill(path);
    });
    for (const [x, y, sr, depth] of glows) glow(x, y, sr * 3.2, 0.14 * depth * dim);
    ctx.globalAlpha = 1;
    ctx.fillStyle = `rgba(${ink},${0.92 * dim})`;
    ctx.fill(servers);

    // meteors between servers
    const meteors = !showGlobe || reduced ? 0 : smoothstep(GATHER * 0.7, GATHER + 1.2, t) * (0.35 + 0.65 * dim);
    if (meteors > 0) {
      for (let slot = 0; slot < 5; slot += 1) drawMeteor(slot, t, rotation, cx, cy, R, meteors);
    }
  }

  function drawMeteor(slot, t, rotation, cx, cy, R, strength) {
    const period = 2.4 + 0.47 * slot;
    const cycle = (t + slot * 0.71) / period;
    const round = Math.floor(cycle);
    const u = cycle - round;
    const a = POINTS[SERVERS[Math.floor(noise(round * 7 + slot, 0x61) * SERVERS.length)]];
    const b = POINTS[SERVERS[Math.floor(noise(round * 7 + slot, 0x62) * SERVERS.length)]];
    const dot = a.x * b.x + a.y * b.y + a.z * b.z;
    const omega = Math.acos(Math.min(Math.max(dot, -1), 1));
    if (omega < 0.15) return;
    const m = rotation;
    const point = (s) => {
      const wa = Math.sin((1 - s) * omega) / Math.sin(omega);
      const wb = Math.sin(s * omega) / Math.sin(omega);
      const lift = 1 + 0.16 * Math.sin(s * Math.PI) * Math.min(omega, 1.6);
      const px = (a.x * wa + b.x * wb) * lift, py = (a.y * wa + b.y * wb) * lift, pz = (a.z * wa + b.z * wb) * lift;
      const rx = m[0] * px + m[1] * py + m[2] * pz;
      const ry = m[3] * px + m[4] * py + m[5] * pz;
      const rz = m[6] * px + m[7] * py + m[8] * pz;
      return [cx + rx * R, cy - ry * R, rz];
    };
    const head = 1 - Math.pow(1 - Math.min(u / 0.55, 1), 2);
    const tailStart = u < 0.55 ? Math.max(head - 0.38, 0) : Math.min((u - 0.55) / 0.35, 1);
    const linger = u < 0.55 ? 1 : Math.max(1 - (u - 0.55) / 0.45, 0);

    ctx.beginPath();
    let drawing = false;
    for (let step = 0; step <= 24; step += 1) {
      const [x, y, z] = point((step / 24) * head);
      if (z > -0.05) { if (drawing) ctx.lineTo(x, y); else ctx.moveTo(x, y); drawing = true; } else drawing = false;
    }
    ctx.strokeStyle = `rgba(${ink},${0.14 * linger * strength})`;
    ctx.lineWidth = 0.7;
    ctx.stroke();

    if (tailStart >= head) return;
    ctx.lineCap = "round";
    let prev = point(tailStart);
    for (let step = 1; step <= 12; step += 1) {
      const s = tailStart + ((head - tailStart) * step) / 12;
      const cur = point(s);
      if (prev[2] > 0 && cur[2] > 0) {
        const k = step / 12;
        ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(cur[0], cur[1]);
        ctx.strokeStyle = `rgba(${ink},${0.75 * k * k * strength})`;
        ctx.lineWidth = 0.6 + 1.4 * k;
        ctx.stroke();
      }
      prev = cur;
    }
    if (u < 0.6) {
      const [x, y, z] = point(head);
      if (z <= 0) return;
      const r = 2.4;
      glow(x, y, r * 3, 0.5 * strength);
      ctx.globalAlpha = 1;
      ctx.fillStyle = `rgba(${ink},${strength})`;
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    }
  }

  // Adaptive pacing: if a frame costs too much (slow phones, throttled CPUs),
  // draw every 2nd or 3rd vsync instead, so scrolling and input stay smooth.
  let cost = 8;
  let skip = 0;
  let frame = 0;
  function loop(now) {
    frame += 1;
    if (frame % (skip + 1) === 0) {
      const t0 = performance.now();
      draw(now);
      const spent = performance.now() - t0;
      cost = cost * 0.85 + spent * 0.15;
      skip = cost > 24 ? 2 : cost > 11 ? 1 : 0;
      // Detail only ever steps down: a frame that keeps blowing the budget
      // gets fewer particles, so no single frame becomes a long task.
      if (cost > 18 && detail < 3) { detail += 1; cost = 8; }
    }
    raf = running ? requestAnimationFrame(loop) : 0;
  }
  let started = false;
  function play() {
    if (reduced || running || !visible || document.hidden || !started) return;
    running = true;
    raf = requestAnimationFrame(loop);
  }
  // Begin once the page has painted and hydrated, so the first render and the
  // animation never compete for the main thread.
  const begin = () => { started = true; start = performance.now(); play(); };
  const idle = window.requestIdleCallback
    ? window.requestIdleCallback(begin, { timeout: 700 })
    : window.setTimeout(begin, 200);
  function pause() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  // drag to turn (horizontal intent on touch so vertical scrolling still works)
  const onDown = (e) => {
    if (reduced || !showGlobe) return;
    drag = { x: e.clientX, y: e.clientY, id: e.pointerId, samples: [[performance.now(), e.clientX, e.clientY]] };
    base = turnMatrix(performance.now());
    velocity = { x: 0, y: 0 };
    live = { dx: 0, dy: 0 };
    canvas.setPointerCapture?.(e.pointerId);
    canvas.classList.add("is-dragging");
  };
  const onMove = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    live = { dx: e.clientX - drag.x, dy: e.clientY - drag.y };
    drag.samples.push([performance.now(), e.clientX, e.clientY]);
    if (drag.samples.length > 6) drag.samples.shift();
  };
  const onUp = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const now = performance.now();
    const translation = { dx: e.clientX - drag.x, dy: e.clientY - drag.y };
    base = mul(turnBy(translation.dx, translation.dy), base);
    live = null;
    const [t0, x0, y0] = drag.samples[0];
    const dt = Math.max((now - t0) / 1000, 0.016);
    let vx = (e.clientX - x0) / dt, vy = (e.clientY - y0) / dt;
    const speed = Math.hypot(vx, vy);
    if (speed > 2400) { vx *= 2400 / speed; vy *= 2400 / speed; }
    velocity = { x: vx, y: vy };
    released = now;
    drag = null;
    canvas.classList.remove("is-dragging");
  };

  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) play(); else pause();
  });
  io.observe(canvas);
  const onVisibility = () => (document.hidden ? pause() : play());
  document.addEventListener("visibilitychange", onVisibility);

  resize();
  play();

  return () => {
    if (window.cancelIdleCallback && window.requestIdleCallback) window.cancelIdleCallback(idle);
    else window.clearTimeout(idle);
    pause();
    observer.disconnect();
    io.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerup", onUp);
    canvas.removeEventListener("pointercancel", onUp);
  };
}
