(() => {
  const root = document.documentElement;
  const RU = window.I18N_RU || {};
  const STORAGE_KEY = 'skiberly-lang';

  /* ---------- Language ---------- */

  // English lives in the HTML; remember it so we can switch back.
  const textNodes = [...document.querySelectorAll('[data-i18n]')];
  const ariaNodes = [...document.querySelectorAll('[data-i18n-aria]')];
  const altNodes = [...document.querySelectorAll('[data-i18n-alt]')];
  textNodes.forEach((el) => { el._en = el.innerHTML; });
  ariaNodes.forEach((el) => { el._en = el.getAttribute('aria-label'); });
  altNodes.forEach((el) => { el._en = el.getAttribute('alt'); });

  const meta = {
    title: document.title,
    description: document.querySelector('meta[name="description"]').content,
  };

  const langButton = document.getElementById('lang-toggle');

  function setLang(lang) {
    const ru = lang === 'ru';
    root.lang = ru ? 'ru' : 'en';
    textNodes.forEach((el) => {
      const key = el.dataset.i18n;
      el.innerHTML = ru && RU[key] != null ? RU[key] : el._en;
    });
    ariaNodes.forEach((el) => {
      const key = el.dataset.i18nAria;
      el.setAttribute('aria-label', ru && RU[key] != null ? RU[key] : el._en);
    });
    altNodes.forEach((el) => {
      const key = el.dataset.i18nAlt;
      el.setAttribute('alt', ru && RU[key] != null ? RU[key] : el._en);
    });
    document.title = ru && RU['meta.title'] ? RU['meta.title'] : meta.title;
    document.querySelector('meta[name="description"]').content =
      ru && RU['meta.description'] ? RU['meta.description'] : meta.description;
    langButton.setAttribute('aria-label', ru ? 'Switch to English' : 'Переключить на русский');
    try { localStorage.setItem(STORAGE_KEY, root.lang); } catch (e) { /* storage unavailable */ }
    document.dispatchEvent(new Event('langchange'));
  }

  // The Russian version is on only when both the toggle and js/i18n-ru.js are on the page.
  const ruEnabled = Boolean(langButton && window.I18N_RU);

  if (ruEnabled) {
    let initial = 'en';
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'ru') initial = saved;
      else if (/^(ru|uk|be|kk)\b/i.test(navigator.language || '')) initial = 'ru';
    } catch (e) {
      if (/^ru\b/i.test(navigator.language || '')) initial = 'ru';
    }
    setLang(initial);
    langButton.addEventListener('click', () => setLang(root.lang === 'ru' ? 'en' : 'ru'));
  }

  /* ---------- Top bar border on scroll ---------- */

  const topbar = document.querySelector('.topbar');
  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:0;height:1px;width:1px;';
  document.body.prepend(sentinel);
  new IntersectionObserver(([entry]) => {
    topbar.classList.toggle('is-scrolled', !entry.isIntersecting);
  }).observe(sentinel);

  /* ---------- Chalkboard doodles ---------- */

  // The same doodle vocabulary the artist uses in her backgrounds:
  // sparkles, stars, emphasis marks, wifi, vinyl, paws. 48x48 viewBox, drawn as single strokes.
  const SHAPES = {
    sparkle: 'M24 5C25.4 17 31 22.6 43 24 31 25.4 25.4 31 24 43 22.6 31 17 25.4 5 24 17 22.6 22.6 17 24 5Z',
    star: 'M24 6.5 28.8 18.6 41.5 19.6 31.8 27.9 34.9 40.5 24 33.7 13.1 40.5 16.2 27.9 6.5 19.6 19.2 18.6Z',
    heart: 'M24 39.5C12.5 31 6.2 24 8.6 15.8 10.8 8.6 19.4 8.4 24 16 28.6 8.4 37.2 8.6 39.4 15.8 41.8 24 35.5 31 24 39.5Z',
    paw: 'M14.5 33.5C14.2 27 19 23.5 24 23.5S33.8 27 33.5 33.5C33.3 38 28.6 39.6 24 37.4 19.4 39.6 14.7 38 14.5 33.5ZM9.2 21.6C8.4 18.8 9.6 16.2 11.8 15.9S16 17.6 16.6 20.4 15.6 25.4 13.6 25.6 9.9 24.2 9.2 21.6ZM17.6 13.2C17.4 10.2 19 7.9 21.2 8S25 10.4 25 13.3 23.6 18 21.5 18 17.8 16 17.6 13.2ZM30.4 13.2C30.2 10.3 28.6 8 26.6 8.2M38.8 21.6C39.6 18.8 38.4 16.2 36.2 15.9S32 17.6 31.4 20.4 32.4 25.4 34.4 25.6 38.1 24.2 38.8 21.6Z',
    squiggle: 'M4 28C8 19 12.5 19 15 27.5S21.5 37 25 28 31.5 18.5 35 27.5 41 36 44.5 26',
    spiral: 'M24.5 24.5C24 21.5 28.5 21 28.8 24.6 29.2 29 22.4 30.4 20.2 25.6 17.6 19.8 25 15.2 31 18.8 37.6 22.8 35.6 34 26.4 36 15.8 38.4 9.6 28.6 13.4 19.4',
    zigzag: 'M4 31 11 18 18 31 25 18 32 31 39 18 44 27',
    circle: 'M37.5 16C42.5 25 38 38.5 25 40 12.5 41.5 6 32 8 21.5 10 11.5 21 6 31 8.5 37 10 41 15.5 40.5 22',
    triangle: 'M24.5 8.5 40.5 37.5 7.5 38 25.5 7',
    plus: 'M24 11V37M11 24H37',
    crescent: 'M31 7.5C18.5 9.5 11.5 21.5 15.5 32.5 19.5 42.5 33 44 40.5 37 30 37.5 21.5 30.5 21.5 21 21.5 15 25 10.5 31 7.5Z',
    emphasis: 'M30 8 26 19M42 18 32 24M44 34 33 32',
    wifi: 'M8 21C17 12 31 12 40 21M13.5 27C20 21 28 21 34.5 27M19 33C22 30.5 26 30.5 29 33M24 39.2V39.4',
    vinyl: 'M24 5.5C34.5 5.5 42.5 13.5 42.5 24S34.5 42.5 24 42.5 5.5 34.5 5.5 24 13.5 5.5 24 5.5ZM24 17.5C27.6 17.5 30.5 20.4 30.5 24S27.6 30.5 24 30.5 17.5 27.6 17.5 24 20.4 17.5 24 17.5ZM24 23.6V24.4M33 11.5C36 13.5 38 16 39 19',
    dots: 'M10 30V30.2M22 22V22.2M34 30V30.2M28 12V12.2',
    // loose chalk loop around the character, overshooting where it closes
    ring: 'M38.5 9.5C45.5 16 46.5 29.5 39.5 37.8 32 46.2 15.6 46 8.4 37.6 1.6 29.6 2.6 15.4 11.4 8.6 19.6 2.4 32.6 2.6 41.6 9.8 43.4 11.4 44.6 13 45.4 14.6',
  };

  // Positions are % of each backdrop (full viewport width). mx/my: phone position, omit to hide on
  // phones. In sections my is in px from the section top, so phone doodles sit beside the heading.
  // shape: a line doodle from SHAPES (ink), or 'ribbon' (see buildRibbons), 'flower' (fill: peach, caramel, rust,
  // brown, cream, pink, teal; outline: true), 'spark'.
  const HERO_DOODLES = [
    // wanders up from the bottom, loops behind the character and leaves at the top right
    { shape: 'ribbon', w: 24, mw: 13,
      points: [[46, 118], [55, 86], [60, 58], [70, 38], [84, 46], [95, 30], [107, 12]],
      mpoints: [[-12, 70], [20, 62], [50, 72], [80, 64], [112, 72]] },
    // a small loose curl in the empty top-left corner
    { shape: 'ribbon', w: 14,
      points: [[-6, 22], [10, 14], [22, 18], [34, 3]] },
    { shape: 'flower',   x: 57, y: 22, s: 64,  r: 0,   fill: 'peach',   depth: 0.9, mx: 14, my: '58%', ms: 46 },
    { shape: 'spark',    x: 64, y: 30, s: 34,  r: 0,                    depth: 1,   mx: 70, my: '53%', ms: 24 },
    { shape: 'emphasis', x: 54, y: 40, s: 60,  r: -18, tone: 'accent',  depth: 0.8, mx: 9,  my: '72%', ms: 40 },
    { shape: 'flower',   x: 90, y: 26, s: 50,  r: 10,  fill: 'brown',   depth: 0.7, mx: 88, my: '57%', ms: 40 },
    { shape: 'flower',   x: 85, y: 11, s: 40,  r: 0,   fill: 'cream', outline: true, depth: 0.5 },
    { shape: 'spark',    x: 82, y: 40, s: 26,  r: 0,                    depth: 0.8 },
    { shape: 'wifi',     x: 94, y: 48, s: 60,  r: 14,                   depth: 0.6, mx: 90, my: '74%', ms: 40 },
    { shape: 'flower',   x: 95, y: 70, s: 54,  r: 20,  fill: 'pink',    depth: 0.5 },
    { shape: 'heart',    x: 82, y: 86, s: 40,  r: 10,  tone: 'accent',  depth: 0.8, mx: 85, my: '93%', ms: 30 },
    { shape: 'flower',   x: 60, y: 80, s: 46,  r: 0,   fill: 'caramel', depth: 0.6 },
    { shape: 'paw',      x: 49, y: 84, s: 54,  r: -18,                  depth: 0.5, mx: 12, my: '92%', ms: 40 },
    { shape: 'spark',    x: 52, y: 62, s: 30,  r: 0,                    depth: 0.9 },
    { shape: 'squiggle', x: 74, y: 13, s: 110, r: -6,                   depth: 0.5, mx: 82, my: '40%', ms: 64 },
    { shape: 'flower',   x: 41, y: 14, s: 26,  r: 0,   fill: 'teal',    depth: 0.7 },
    { shape: 'spark',    x: 97, y: 30, s: 24,  r: 0,                    depth: 0.6 },
    { shape: 'triangle', x: 4,  y: 20, s: 50,  r: -10, tone: 'soft',    depth: 0.4, mx: 91, my: '12%', ms: 32 },
    { shape: 'spark',    x: 8,  y: 52, s: 28,  r: 0,                    depth: 0.6 },
    { shape: 'zigzag',   x: 6,  y: 84, s: 96,  r: 4,   tone: 'soft',    depth: 0.3 },
    { shape: 'spark',    x: 32, y: 90, s: 30,  r: 0,                    depth: 0.7 },
  ];

  // Lower sections: motifs live in the side margins and the empty space beside headings.
  // Ribbons wander in from the page edges and run off screen.
  const SECTION_DOODLES = {
    commissions: [
      { shape: 'flower',   x: 74, y: 11, s: 54,  r: 0,   fill: 'peach',   depth: 0.8, mx: 86, my: 26, ms: 40 },
      { shape: 'spark',    x: 80, y: 5,  s: 26,  r: 0,                    depth: 0.9 },
      { shape: 'squiggle', x: 90, y: 15, s: 110, r: -8,  tone: 'soft',    depth: 0.4 },
      { shape: 'flower',   x: 3,  y: 38, s: 40,  r: 0,   fill: 'brown',   depth: 0.6 },
      { shape: 'ribbon', w: 18, points: [[106, 22], [97, 44], [96, 68], [105, 94]] },
      { shape: 'dots',     x: 4,  y: 82, s: 44,  r: 0,                    depth: 0.6 },
      { shape: 'flower',   x: 96, y: 92, s: 36,  r: 12,  fill: 'pink',    depth: 0.7 },
    ],
    references: [
      { shape: 'flower',   x: 96, y: 18, s: 70,  r: 0,   fill: 'cream', outline: true, depth: 0.4, mx: 88, my: 26, ms: 44 },
      { shape: 'paw',      x: 3,  y: 16, s: 46,  r: -16,                  depth: 0.6 },
      { shape: 'spark',    x: 3,  y: 62, s: 34,  r: 0,                    depth: 0.5 },
      { shape: 'flower',   x: 97, y: 72, s: 34,  r: 10,  fill: 'caramel', depth: 0.8 },
    ],
    stickers: [
      { shape: 'ribbon', w: 16, points: [[-6, -2], [4, 38], [3, 76], [-6, 112]] },
      { shape: 'wifi',     x: 94, y: 22, s: 56,  r: 12,                   depth: 0.6, mx: 88, my: 26, ms: 40 },
      { shape: 'spark',    x: 89, y: 84, s: 40,  r: 0,                    depth: 0.8 },
      { shape: 'flower',   x: 92, y: 58, s: 28,  r: 0,   fill: 'teal',    depth: 0.7 },
    ],
    calculator: [
      { shape: 'flower',   x: 4,  y: 30, s: 40,  r: 0,   fill: 'pink',    depth: 0.8, mx: 88, my: 26, ms: 30 },
      { shape: 'spark',    x: 96, y: 58, s: 34,  r: 0,                    depth: 0.5 },
      { shape: 'dots',     x: 3,  y: 82, s: 44,  r: 0,                    depth: 0.6 },
      { shape: 'flower',   x: 97, y: 88, s: 30,  r: 0,   fill: 'rust',    depth: 0.7 },
    ],
    process: [
      { shape: 'emphasis', x: 62, y: 20, s: 56,  r: -10, tone: 'accent',  depth: 0.8, mx: 88, my: 26, ms: 40 },
      { shape: 'flower',   x: 88, y: 16, s: 60,  r: 0,   fill: 'peach',   depth: 0.4 },
      { shape: 'spark',    x: 93, y: 42, s: 24,  r: 0,                    depth: 0.8 },
      { shape: 'squiggle', x: 4,  y: 88, s: 90,  r: 6,   tone: 'soft',    depth: 0.4 },
    ],
    themes: [
      { shape: 'spark',    x: 84, y: 10, s: 44,  r: 0,                    depth: 0.7, mx: 88, my: 26, ms: 32 },
      { shape: 'flower',   x: 3,  y: 34, s: 40,  r: 0,   fill: 'brown',   depth: 0.5 },
      { shape: 'flower',   x: 97, y: 70, s: 40,  r: 0,   fill: 'cream', outline: true, depth: 0.6 },
    ],
    terms: [
      { shape: 'ribbon', w: 16, points: [[107, 4], [96, 30], [97, 56], [107, 80]] },
      { shape: 'zigzag',   x: 3,  y: 80, s: 70,  r: -4,  tone: 'soft',    depth: 0.3 },
      { shape: 'flower',   x: 6,  y: 22, s: 34,  r: 0,   fill: 'peach',   depth: 0.6, mx: 88, my: 26, ms: 30 },
    ],
    contact: [
      // a wave along the bottom, under the "Contacts" text
      // stays inside the block (text ends at ~77%) and leaves through the sides, never the bottom
      { shape: 'ribbon', w: 13, points: [[-6, 90], [14, 85], [34, 92], [54, 86], [74, 92], [94, 86], [108, 90]] },
      { shape: 'spark',    x: 9,  y: 22, s: 56,  r: 0,                    depth: 0.8, mx: 86, my: 26, ms: 36 },
      { shape: 'flower',   x: 44, y: 30, s: 40,  r: 0,   fill: 'pink',    depth: 0.7 },
      { shape: 'flower',   x: 95, y: 52, s: 44,  r: 0,   fill: 'peach',   depth: 0.6 },
      { shape: 'squiggle', x: 33, y: 24, s: 100, r: 4,   tone: 'soft',    depth: 0.4 },
    ],
  };

  const ns = 'http://www.w3.org/2000/svg';

  // Five round petals with a hole in the middle, as one outline (so it can carry a stroke).
  function flowerPath(n = 5, d = 11, r = 9, hole = 3.4) {
    const c = 24, half = Math.PI / n;
    const notch = d * Math.cos(half) + Math.sqrt(r * r - (d * Math.sin(half)) ** 2);
    const pt = (a, rad) => `${(c + rad * Math.cos(a)).toFixed(2)} ${(c + rad * Math.sin(a)).toFixed(2)}`;
    let p = '';
    for (let k = 0; k < n; k++) {
      const a = -Math.PI / 2 + (2 * Math.PI * k) / n;
      if (k === 0) p += `M${pt(a - half, notch)}`;
      p += `A${r} ${r} 0 1 1 ${pt(a + half, notch)}`;
    }
    return `${p}ZM${c + hole} ${c}A${hole} ${hole} 0 1 0 ${c - hole} ${c}A${hole} ${hole} 0 1 0 ${c + hole} ${c}Z`;
  }
  const FLOWER = flowerPath();

  // Retro ribbons: four parallel stripes following a free, wandering curve.
  // points are [x%, y%] of the backdrop (may go past 0/100 to leave the screen);
  // mpoints are used on phones (omit to hide the ribbon there).
  function smoothCurve(pts, perSegment = 24) {
    // Catmull-Rom spline through the points, sampled as a dense polyline
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      for (let s = 0; s < perSegment; s++) {
        const t = s / perSegment, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map((k) => 0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t
          + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)));
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  }

  // Evenly spaced points along the polyline (so normals and curvature are stable).
  function resample(line, spacing) {
    const out = [line[0]];
    let carry = 0;
    for (let i = 1; i < line.length; i++) {
      const [ax, ay] = line[i - 1], [bx, by] = line[i];
      const seg = Math.hypot(bx - ax, by - ay);
      let t = spacing - carry;
      while (t <= seg) {
        out.push([ax + ((bx - ax) * t) / seg, ay + ((by - ay) * t) / seg]);
        t += spacing;
      }
      carry = seg - (t - spacing);
    }
    // end exactly on the last point without leaving a sliver of a segment
    const end = line[line.length - 1], prev = out[out.length - 1];
    if (Math.hypot(end[0] - prev[0], end[1] - prev[1]) < spacing * 0.5 && out.length > 1) out[out.length - 1] = end;
    else out.push(end);
    return out;
  }

  // A parallel stripe folds into a sharp point where the curve turns tighter than the
  // stripe's offset. Smooth only those spots until every turn is wide enough for the ribbon.
  function relax(line, minRadius, maxIter = 3000) {
    let p = line.map((q) => q.slice());
    const spacing = 6;
    const k = 3;
    const radius = (a, b, c) => {
      const ab = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const bc = Math.hypot(c[0] - b[0], c[1] - b[1]);
      const ca = Math.hypot(a[0] - c[0], a[1] - c[1]);
      const area2 = Math.abs((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]));
      return area2 < 1e-9 ? Infinity : (ab * bc * ca) / (2 * area2);
    };
    for (let iter = 0; iter < maxIter; iter++) {
      // smoothing bunches points together; re-space them so the curvature estimate stays honest
      if (iter && iter % 10 === 0) p = resample(p, spacing);
      const tight = [];
      for (let i = k; i < p.length - k; i++) {
        if (radius(p[i - k], p[i], p[i + k]) < minRadius) tight.push(i);
      }
      if (!tight.length) break;
      const next = p.map((q) => q.slice());
      tight.forEach((i) => {
        for (let j = Math.max(1, i - 2 * k); j <= Math.min(p.length - 2, i + 2 * k); j++) {
          next[j][0] = p[j][0] * 0.5 + (p[j - 1][0] + p[j + 1][0]) * 0.25;
          next[j][1] = p[j][1] * 0.5 + (p[j - 1][1] + p[j + 1][1]) * 0.25;
        }
      });
      p = next;
    }
    return p;
  }

  function ribbonStripes(points, stripe, gap) {
    const step = stripe + gap;
    // outermost stripe edge sits 1.5 steps + half a stripe from the centre line;
    // turns must be at least ~2x wider than that, so bends read as soft waves
    const minRadius = (1.5 * step + stripe / 2) * 2.2;
    const line = resample(relax(resample(smoothCurve(points, 40), 6), minRadius), 4);
    return [-1.5, -0.5, 0.5, 1.5].map((k) => {
      const offset = k * step;
      return line.map((p, i) => {
        const a = line[Math.max(0, i - 1)], b = line[Math.min(line.length - 1, i + 1)];
        const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
        // shift along the normal to get a true parallel stripe
        return `${i ? 'L' : 'M'}${(p[0] - (dy / len) * offset).toFixed(1)} ${(p[1] + (dx / len) * offset).toFixed(1)}`;
      }).join('');
    });
  }

  function buildRibbons(layer, specs, origin) {
    if (!specs.length) return;
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'ribbons');
    svg.setAttribute('aria-hidden', 'true');
    const groups = specs.map((spec, i) => {
      const g = document.createElementNS(ns, 'g');
      g.setAttribute('class', 'ribbon');
      g.style.setProperty('--delay', `${(origin.start ?? 120) + i * 200}ms`);
      for (let k = 0; k < 4; k++) {
        const path = document.createElementNS(ns, 'path');
        path.setAttribute('pathLength', '1');
        g.appendChild(path);
      }
      svg.appendChild(g);
      return g;
    });
    layer.prepend(svg);

    const draw = () => {
      const w = layer.clientWidth, h = layer.clientHeight;
      if (!w || !h) return;
      const phone = window.innerWidth <= 860;
      specs.forEach((spec, i) => {
        const pts = phone ? spec.mpoints : spec.points;
        groups[i].style.display = pts ? '' : 'none';
        if (!pts) return;
        const stripe = phone ? (spec.mw || 12) : (spec.w || 22);
        const d = ribbonStripes(pts.map(([x, y]) => [(x / 100) * w, (y / 100) * h]), stripe, Math.max(2, stripe * 0.12));
        [...groups[i].children].forEach((path, k) => {
          path.setAttribute('d', d[k]);
          path.setAttribute('stroke-width', stripe);
        });
      });
    };
    draw();
    new ResizeObserver(draw).observe(layer);
  }

  function buildDoodles(layer, allItems, origin) {
    buildRibbons(layer, allItems.filter((d) => d.shape === 'ribbon'), origin);
    const list = allItems.filter((d) => d.shape !== 'ribbon');
    // Draw order radiates out from the focal point of the backdrop.
    const order = list
      .map((d, i) => ({ i, dist: Math.hypot(d.x - origin.x, (d.y - origin.y) * 0.6) }))
      .sort((a, b) => a.dist - b.dist)
      .map((o) => o.i);
    const step = list.length > 8 ? 45 : 90;

    return list.map((d, i) => {
      const kind = (d.shape === 'flower' || d.shape === 'spark') ? 'fill' : 'line';
      const el = document.createElement('div');
      el.className = `doodle doodle--${kind}`
        + (d.shape === 'flower' ? ' doodle--flower' : '')
        + (d.shape === 'spark' ? ' doodle--spark' : '')
        + (d.tone ? ` doodle--${d.tone}` : '');
      if (d.mx == null) el.dataset.desktop = '';
      const my = d.my == null ? `${d.y}%` : (typeof d.my === 'number' ? `${d.my}px` : d.my);
      // deterministic variety for the idle motion
      const seed = Math.abs(i * 37 + d.x) % 11;
      const lineWidth = d.outline ? 1.6 : 2.4;
      el.style.cssText = [
        `--x:${d.x}%`, `--y:${d.y}%`, `--mx:${d.mx ?? d.x}%`, `--my:${my}`, `--ms:${d.ms ?? d.s}px`,
        `--s:${d.s}px`, `--r:${d.r}deg`,
        `--sw:${((lineWidth * 48) / d.s).toFixed(3)}`, `--swm:${((lineWidth * 0.92 * 48) / (d.ms ?? d.s)).toFixed(3)}`,
        `--delay:${(origin.start ?? 120) + order.indexOf(i) * step}ms`,
        `--dur:${7 + (seed % 5)}s`, `--phase:${-seed * 0.7}s`,
        `--dx:${(seed % 3) * 3 - 3}px`, `--dy:${-6 - (seed % 4) * 2}px`, `--dr:${(seed % 2 ? 1 : -1) * (3 + (seed % 3))}deg`,
        d.shape === 'flower' ? `--fill:var(--fl-${d.fill || 'peach'});--spin:${40 + seed * 4}s` : '',
        d.shape === 'flower' && d.outline ? '--stroke:var(--fl-outline)' : '',
        d.shape === 'spark' ? `--fill:var(--spark);--tw:${3 + (seed % 3)}s` : '',
      ].filter(Boolean).join(';');

      const float = document.createElement('div');
      float.className = 'doodle__float';
      const svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('viewBox', '0 0 48 48');
      const group = document.createElementNS(ns, 'g');
      const paths = [d.shape === 'flower' ? FLOWER : SHAPES[d.shape === 'spark' ? 'sparkle' : d.shape]];
      paths.forEach((dAttr) => {
        const path = document.createElementNS(ns, 'path');
        path.setAttribute('d', dAttr);
        path.setAttribute('pathLength', '1');
        group.appendChild(path);
      });
      if (d.shape === 'flower' && seed % 2) group.style.animationDirection = 'reverse';
      svg.appendChild(group);
      float.appendChild(svg);
      el.appendChild(float);
      layer.appendChild(el);
      return { el, depth: d.depth };
    });
  }

  const hero = document.querySelector('.hero');
  const heroLayer = document.querySelector('.hero .doodles');
  const doodleEls = heroLayer ? buildDoodles(heroLayer, HERO_DOODLES, { x: 72, y: 52, start: 250 }) : [];

  // Section backdrops are created here so the HTML stays clean.
  const sectionLayers = Object.entries(SECTION_DOODLES).map(([id, list], index) => {
    const section = document.getElementById(id);
    if (!section) return null;
    const bg = document.createElement('div');
    bg.className = 'section__bg';
    // light + dot patch alternate sides down the page
    bg.style.cssText = index % 2 ? '--gx:10%;--gy:45%' : '--gx:88%;--gy:22%';
    bg.setAttribute('aria-hidden', 'true');
    const layer = document.createElement('div');
    layer.className = 'doodles';
    bg.appendChild(layer);
    section.prepend(bg);
    return { section, layer, els: buildDoodles(layer, list, { x: 50, y: 0 }) };
  }).filter(Boolean);

  // Draw a section's doodles when it scrolls into view; pause idle loops while it's off screen.
  const layerObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const layer = entry.target.querySelector(':scope > .section__bg .doodles');
      if (!layer) return;
      layer.classList.toggle('is-offscreen', !entry.isIntersecting);
      if (entry.intersectionRatio > 0.15) layer.classList.add('is-drawn');
    });
  }, { threshold: [0, 0.15] });
  sectionLayers.forEach(({ section }) => layerObserver.observe(section));

  // Pause the hero loops while it's off screen.
  if (hero) {
    new IntersectionObserver(([entry]) => {
      hero.classList.toggle('is-offscreen', !entry.isIntersecting);
      if (heroLayer) heroLayer.classList.toggle('is-offscreen', !entry.isIntersecting);
    }).observe(hero);
  }

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mascot = document.querySelector('.mascot');

  // Scroll depth: section doodles travel at different speeds, so the page feels layered.
  if (!reducedMotion.matches && sectionLayers.length) {
    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = window.innerHeight;
      const amp = window.innerWidth > 860 ? 70 : 24; // keep phone doodles off the text
      sectionLayers.forEach(({ section, layer, els }) => {
        if (layer.classList.contains('is-offscreen')) return;
        const rect = section.getBoundingClientRect();
        // -1 when the section centre is at the bottom of the screen, +1 at the top
        const t = Math.max(-1.5, Math.min(1.5, (vh / 2 - (rect.top + rect.height / 2)) / vh));
        els.forEach(({ el, depth }) => {
          el.style.transform = `translate3d(0, ${(t * -amp * depth).toFixed(1)}px, 0)`;
        });
      });
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  // Pointer parallax in the hero: doodles drift away from the cursor by depth, the character leans in.
  if (hero && finePointer.matches && !reducedMotion.matches) {
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;

    const tick = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      doodleEls.forEach(({ el, depth }) => {
        el.style.transform = `translate3d(${(-cx * 16 * depth).toFixed(2)}px, ${(-cy * 12 * depth).toFixed(2)}px, 0)`;
      });
      if (mascot) mascot.style.transform = `translate3d(${(cx * 6).toFixed(2)}px, ${(cy * 4).toFixed(2)}px, 0)`;
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.001 ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };

    hero.addEventListener('pointermove', (e) => {
      const rect = hero.getBoundingClientRect();
      tx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      ty = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      kick();
    });
    hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; kick(); });
  }

  /* ---------- Hero intro ---------- */

  const heroImages = [...document.querySelectorAll('.mascot img')];
  const startIntro = () => {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      root.classList.add('is-ready');
      if (heroLayer) heroLayer.classList.add('is-drawn');
      setTimeout(() => root.classList.add('is-settled'), 1400);
    }));
  };
  // Wait for the hero image (but never more than 1.2s) so it doesn't rise in empty.
  Promise.race([
    Promise.all(heroImages.map((img) => (img.complete ? Promise.resolve() : img.decode().catch(() => {})))),
    new Promise((resolve) => setTimeout(resolve, 1200)),
  ]).then(startIntro);

  /* ---------- Artwork viewer ---------- */

  const viewer = document.getElementById('viewer');
  const viewerImg = viewer.querySelector('.viewer__img');
  const triggers = [...document.querySelectorAll('[data-zoom]')];
  const items = triggers.map((btn) => btn.querySelector('img'));
  let index = 0;
  let lastFocus = null;

  function show(i, animate) {
    index = (i + items.length) % items.length;
    const img = items[index];
    viewerImg.src = img.dataset.full || img.src;
    viewerImg.alt = img.alt;
    if (animate) {
      viewerImg.classList.remove('is-swapping');
      void viewerImg.offsetWidth;
      viewerImg.classList.add('is-swapping');
    }
    // warm up neighbours
    [index + 1, index - 1].forEach((n) => {
      const next = items[(n + items.length) % items.length];
      new Image().src = next.dataset.full || next.src;
    });
  }

  function open(i) {
    lastFocus = document.activeElement;
    show(i, false);
    viewer.showModal();
  }

  triggers.forEach((btn, i) => btn.addEventListener('click', () => open(i)));

  viewer.querySelector('.viewer__close').addEventListener('click', () => viewer.close());
  viewer.querySelector('.viewer__prev').addEventListener('click', () => show(index - 1, true));
  viewer.querySelector('.viewer__next').addEventListener('click', () => show(index + 1, true));

  viewer.addEventListener('click', (e) => {
    if (e.target === viewer || e.target.classList.contains('viewer__fig')) viewer.close();
  });

  viewer.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') show(index + 1, true);
    if (e.key === 'ArrowLeft') show(index - 1, true);
  });

  viewer.addEventListener('close', () => {
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  });

  // Swipe between artworks on touch screens.
  let startX = null;
  viewer.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') startX = e.clientX; });
  viewer.addEventListener('pointerup', (e) => {
    if (startX == null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1), true);
  });

  /* ---------- Price calculator ---------- */

  // Every price and label is read from the visible price lists ([data-price]),
  // so prices only ever need to be edited in one place.
  const calc = document.getElementById('calc');
  if (calc) {
    const STRINGS = {
      each: 'each',
      copyIntro: "Hi! Here's what I'd like to order:",
      copyTotal: 'Estimated total',
      copyNote: "(Estimate from the calculator on your site. I understand it's not final and the price is up to you.)",
      copied: 'Copied! Paste it into the commission form or a DM.',
      copyFailed: "Couldn't copy automatically. Please select the estimate and copy it by hand.",
    };
    const t = (key) => (root.lang === 'ru' && RU[`calc.${key}`]) || STRINGS[key];

    const priceEl = (key) => document.querySelector(`[data-price="${key}"]`);

    function readPrice(key) {
      const el = priceEl(key);
      if (!el) { console.warn(`Calculator: no price for "${key}"`); return { min: 0, max: 0, text: '' }; }
      const nums = (el.textContent.match(/\d+(?:[.,]\d+)?/g) || []).map((v) => parseFloat(v.replace(',', '.')));
      const min = nums.length ? nums[0] : 0;
      return { min, max: nums.length > 1 ? nums[1] : min, text: el.textContent.trim() };
    }

    // Label of a price row: the <dt> text (without its hint), as shown in the lists.
    function labelFor(key) {
      const el = priceEl(key);
      const dt = el && el.previousElementSibling;
      if (!dt) return key;
      return (dt.querySelector('span') || dt).textContent.trim();
    }

    const add = (a, b) => ({ min: a.min + b.min, max: a.max + b.max });
    const times = (a, k) => ({ min: a.min * k, max: a.max * k });
    const ZERO = { min: 0, max: 0 };
    const money = (r) => {
      const lo = Math.round(r.min), hi = Math.round(r.max);
      return lo === hi ? `$${lo}` : `$${lo}–${hi}`;
    };

    const field = (name) => calc.elements[name];

    // Clamp a number input to its min/max and return the value.
    function count(name) {
      const input = field(name);
      const min = Number(input.min), max = Number(input.max);
      let value = parseInt(input.value, 10);
      if (Number.isNaN(value)) value = min;
      value = Math.min(max, Math.max(min, value));
      if (String(value) !== input.value && document.activeElement !== input) input.value = value;
      const stepper = input.closest('.stepper');
      stepper.querySelector('[data-step="-1"]').disabled = value <= min;
      stepper.querySelector('[data-step="1"]').disabled = value >= max;
      return value;
    }

    const checked = (name) => field(name).checked;
    // Counter rows use the calculator's own plural labels ("Extra poses × 2").
    const fieldLabel = (id) => {
      const el = calc.querySelector(`#${id}`);
      return (el.querySelector('[data-i18n]') || el).textContent.trim();
    };
    const radioLabel = (name) => {
      const input = calc.querySelector(`input[name="${name}"]:checked`);
      const span = input.nextElementSibling;
      return (span.querySelector('b') || span).textContent.trim();
    };

    // Sticker minimum comes from the form (matches "Minimum three stickers").
    field('stickers').min = calc.dataset.stickerMin || 3;

    function fillHints() {
      const style = field('style').value;
      calc.querySelectorAll('[data-tier-price]').forEach((el) => {
        el.textContent = readPrice(`${el.dataset.tierPrice}-${style}`).text;
      });
      // Counters show a per-item price ("$20 each"); checkboxes show the price as listed.
      calc.querySelectorAll('[data-price-hint]').forEach((el) => {
        const perUnit = Boolean(el.closest('.field'));
        el.textContent = readPrice(el.dataset.priceHint).text + (perUnit ? ` ${t('each')}` : '');
      });
    }

    let lastLines = [];
    let lastTotal = '';

    function update() {
      const type = field('type').value;
      calc.querySelectorAll('[data-panel]').forEach((panel) => { panel.hidden = panel.dataset.panel !== type; });
      fillHints();

      const lines = [];
      const push = (label, value) => lines.push({ label, value });

      if (type === 'commission') {
        const base = readPrice(`${field('tier').value}-${field('style').value}`);
        const characters = count('characters');
        field('detailed').max = characters;
        const detailed = count('detailed');
        push(`${radioLabel('tier')}, ${radioLabel('style').toLowerCase()}`, base);
        if (characters > 1) {
          push(`${labelFor('extra-character')} × ${characters - 1}`, times(base, (readPrice('extra-character').min / 100) * (characters - 1)));
        }
        if (detailed > 0) push(`${fieldLabel('lbl-detailed')} × ${detailed}`, times(readPrice('detailed'), detailed));
        if (checked('background')) push(labelFor('background'), readPrice('background'));
      } else if (type === 'reference') {
        push(labelFor('ref-main'), readPrice('ref-main'));
        const poses = count('poses');
        const clothes = count('clothes');
        const additions = count('additions');
        const items = count('items');
        if (poses) push(`${fieldLabel('lbl-poses')} × ${poses}`, times(readPrice('ref-pose'), poses));
        if (checked('feral')) push(labelFor('ref-feral'), readPrice('ref-feral'));
        if (checked('chibis')) push(labelFor('ref-chibis'), readPrice('ref-chibis'));
        if (clothes) push(`${fieldLabel('lbl-clothes')} × ${clothes}`, times(readPrice('ref-chibi-clothes'), clothes));
        if (additions) push(`${fieldLabel('lbl-additions')} × ${additions}`, times(readPrice('ref-additions'), additions));
        if (items) push(`${fieldLabel('lbl-items')} × ${items}`, times(readPrice('ref-item'), items));
        if (checked('refHeadshot')) push(labelFor('ref-headshot'), readPrice('ref-headshot'));
      } else {
        const stickers = count('stickers');
        push(`${fieldLabel('lbl-stickers')} × ${stickers}`, times(readPrice('sticker'), stickers));
      }

      // Priority queue and private are percentages of the whole sum, and they add up.
      const subtotal = lines.reduce((sum, line) => add(sum, line.value), ZERO);
      let percent = 0;
      ['priority', 'private'].forEach((key) => {
        if (!checked(key)) return;
        const p = readPrice(key).min;
        percent += p;
        push(`${labelFor(key)} +${p}%`, times(subtotal, p / 100));
      });
      const total = times(subtotal, 1 + percent / 100);

      const list = calc.querySelector('.calc__lines');
      list.replaceChildren(...lines.map((line, i) => {
        const li = document.createElement('li');
        const name = document.createElement('span');
        const value = document.createElement('span');
        name.textContent = line.label;
        value.textContent = (i > 0 ? '+' : '') + money(line.value);
        li.append(name, value);
        return li;
      }));
      lastLines = lines;
      lastTotal = money(total);
      field('total').value = lastTotal;
      calc.querySelector('.calc__status').textContent = '';
    }

    calc.addEventListener('submit', (e) => e.preventDefault());
    calc.addEventListener('input', update);
    calc.addEventListener('change', update);
    // Re-clamp a typed number when the field loses focus.
    calc.addEventListener('focusout', (e) => { if (e.target.type === 'number') update(); });

    calc.querySelectorAll('.stepper').forEach((stepper) => {
      const input = stepper.querySelector('input');
      stepper.querySelectorAll('[data-step]').forEach((button) => {
        button.addEventListener('click', () => {
          input.value = (parseInt(input.value, 10) || 0) + Number(button.dataset.step);
          update();
        });
      });
    });

    calc.querySelector('.calc__copy').addEventListener('click', async () => {
      const text = [
        t('copyIntro'),
        ...lastLines.map((line) => `- ${line.label}: ${money(line.value)}`),
        `${t('copyTotal')}: ${lastTotal}`,
        t('copyNote'),
      ].join('\n');
      const status = calc.querySelector('.calc__status');
      try {
        await navigator.clipboard.writeText(text);
        status.textContent = t('copied');
      } catch (e) {
        // Fallback for browsers without the async clipboard API
        const area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.cssText = 'position:fixed;opacity:0;';
        document.body.appendChild(area);
        area.select();
        const ok = document.execCommand && document.execCommand('copy');
        area.remove();
        status.textContent = ok ? t('copied') : t('copyFailed');
      }
    });

    document.addEventListener('langchange', update);
    update();
  }
})();