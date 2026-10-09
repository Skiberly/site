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
  const HERO_DOODLES = [
    { shape: 'ring',     x: 72, y: 50, s: 600, r: -8, tone: 'soft',   depth: 0.15, mx: 50, my: '77%', ms: 360 },
    { shape: 'sparkle',  x: 56, y: 20, s: 72,  r: 0,   tone: 'accent', depth: 0.9, mx: 14, my: '58%', ms: 52 },
    { shape: 'emphasis', x: 54, y: 38, s: 60,  r: -18, tone: 'accent', depth: 0.8, mx: 9,  my: '72%', ms: 44 },
    { shape: 'star',     x: 90, y: 22, s: 56,  r: 8,                   depth: 0.7, mx: 88, my: '57%', ms: 42 },
    { shape: 'wifi',     x: 93, y: 50, s: 64,  r: 14,                  depth: 0.6, mx: 90, my: '74%', ms: 44 },
    { shape: 'heart',    x: 88, y: 78, s: 46,  r: 10,  tone: 'accent', depth: 0.8, mx: 85, my: '93%', ms: 36 },
    { shape: 'paw',      x: 58, y: 84, s: 60,  r: -18,                 depth: 0.5, mx: 12, my: '92%', ms: 44 },
    { shape: 'vinyl',    x: 98, y: 88, s: 110, r: 0,   tone: 'soft',   depth: 0.3 },
    { shape: 'squiggle', x: 70, y: 14, s: 120, r: -6,                  depth: 0.5, mx: 82, my: '40%', ms: 72 },
    { shape: 'circle',   x: 85, y: 10, s: 44,  r: 0,   tone: 'soft',   depth: 0.4 },
    { shape: 'spiral',   x: 47, y: 14, s: 58,  r: 0,   tone: 'soft',   depth: 0.4 },
    { shape: 'plus',     x: 48, y: 52, s: 30,  r: 12,  tone: 'accent', depth: 0.9 },
    { shape: 'dots',     x: 47, y: 80, s: 48,  r: 0,                   depth: 0.6 },
    { shape: 'triangle', x: 4,  y: 20, s: 52,  r: -10, tone: 'soft',   depth: 0.4, mx: 91, my: '12%', ms: 36 },
    { shape: 'zigzag',   x: 6,  y: 84, s: 100, r: 4,   tone: 'soft',   depth: 0.3 },
    { shape: 'crescent', x: 31, y: 88, s: 44,  r: -20, tone: 'soft',   depth: 0.5 },
    { shape: 'sparkle',  x: 37, y: 18, s: 30,  r: 0,                   depth: 0.7 },
  ];

  // Lower sections: doodles live in the side margins and the empty space beside headings.
  const SECTION_DOODLES = {
    commissions: [
      { shape: 'sparkle',  x: 74, y: 11, s: 56, r: 0,   tone: 'accent', depth: 0.8, mx: 86, my: 26, ms: 40 },
      { shape: 'squiggle', x: 90, y: 15, s: 110, r: -8, tone: 'soft',   depth: 0.4 },
      { shape: 'star',     x: 3,  y: 38, s: 42, r: -8,                   depth: 0.6 },
      { shape: 'zigzag',   x: 97, y: 52, s: 80, r: 80,  tone: 'soft',   depth: 0.3 },
      { shape: 'dots',     x: 4,  y: 82, s: 44, r: 0,                    depth: 0.6 },
      { shape: 'heart',    x: 96, y: 90, s: 36, r: 12,  tone: 'accent', depth: 0.7 },
    ],
    references: [
      { shape: 'vinyl',    x: 96, y: 18, s: 96, r: 0,   tone: 'soft',   depth: 0.3, mx: 88, my: 26, ms: 56 },
      { shape: 'paw',      x: 3,  y: 16, s: 46, r: -16,                  depth: 0.6 },
      { shape: 'spiral',   x: 3,  y: 66, s: 54, r: 0,   tone: 'soft',   depth: 0.4 },
      { shape: 'plus',     x: 97, y: 72, s: 26, r: 10,  tone: 'accent', depth: 0.8 },
    ],
    stickers: [
      { shape: 'wifi',     x: 94, y: 22, s: 56, r: 12,                   depth: 0.6, mx: 88, my: 26, ms: 40 },
      { shape: 'sparkle',  x: 89, y: 84, s: 42, r: 0,   tone: 'accent', depth: 0.8 },
      { shape: 'triangle', x: 3,  y: 58, s: 46, r: -12, tone: 'soft',   depth: 0.4 },
    ],
    process: [
      { shape: 'emphasis', x: 62, y: 20, s: 56, r: -10, tone: 'accent', depth: 0.8, mx: 88, my: 26, ms: 40 },
      { shape: 'circle',   x: 88, y: 16, s: 76, r: 0,   tone: 'soft',   depth: 0.4 },
      { shape: 'squiggle', x: 4,  y: 88, s: 90, r: 6,   tone: 'soft',   depth: 0.4 },
    ],
    themes: [
      { shape: 'star',     x: 84, y: 10, s: 48, r: 10,  tone: 'accent', depth: 0.7, mx: 88, my: 26, ms: 38 },
      { shape: 'crescent', x: 3,  y: 34, s: 44, r: -18, tone: 'soft',   depth: 0.5 },
      { shape: 'dots',     x: 97, y: 70, s: 44, r: 0,                    depth: 0.6 },
    ],
    terms: [
      { shape: 'spiral',   x: 90, y: 16, s: 60, r: 0,   tone: 'soft',   depth: 0.4, mx: 88, my: 26, ms: 40 },
      { shape: 'zigzag',   x: 3,  y: 80, s: 70, r: -4,  tone: 'soft',   depth: 0.3 },
    ],
    contact: [
      { shape: 'sparkle',  x: 9,  y: 22, s: 64, r: 0,   tone: 'accent', depth: 0.8, mx: 86, my: 26, ms: 44 },
      { shape: 'heart',    x: 44, y: 30, s: 40, r: -10, tone: 'accent', depth: 0.7 },
      { shape: 'star',     x: 93, y: 84, s: 44, r: 8,                    depth: 0.6 },
      { shape: 'squiggle', x: 30, y: 84, s: 100, r: 4,  tone: 'soft',   depth: 0.4 },
    ],
  };

  const ns = 'http://www.w3.org/2000/svg';

  function buildDoodles(layer, list, origin) {
    // Draw order radiates out from the focal point of the backdrop.
    const order = list
      .map((d, i) => ({ i, dist: Math.hypot(d.x - origin.x, (d.y - origin.y) * 0.6) }))
      .sort((a, b) => a.dist - b.dist)
      .map((o) => o.i);
    const step = list.length > 8 ? 45 : 90;

    return list.map((d, i) => {
      const el = document.createElement('div');
      el.className = 'doodle' + (d.tone ? ` doodle--${d.tone}` : '');
      if (d.mx == null) el.dataset.desktop = '';
      const my = d.my == null ? `${d.y}%` : (typeof d.my === 'number' ? `${d.my}px` : d.my);
      // deterministic variety for the idle drift
      const seed = (i * 37 + d.x) % 11;
      el.style.cssText = [
        `--x:${d.x}%`, `--y:${d.y}%`, `--mx:${d.mx ?? d.x}%`, `--my:${my}`, `--ms:${d.ms ?? d.s}px`,
        `--s:${d.s}px`, `--r:${d.r}deg`, `--sw:${((2.4 * 48) / d.s).toFixed(3)}`, `--swm:${((2.2 * 48) / (d.ms ?? d.s)).toFixed(3)}`,
        `--delay:${(origin.start ?? 120) + order.indexOf(i) * step}ms`,
        `--dur:${7 + (seed % 5)}s`, `--phase:${-seed * 0.7}s`,
        `--dx:${(seed % 3) * 3 - 3}px`, `--dy:${-6 - (seed % 4) * 2}px`, `--dr:${(seed % 2 ? 1 : -1) * (3 + (seed % 3))}deg`,
      ].join(';');

      const float = document.createElement('div');
      float.className = 'doodle__float';
      const svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('viewBox', '0 0 48 48');
      const path = document.createElementNS(ns, 'path');
      path.setAttribute('d', SHAPES[d.shape]);
      path.setAttribute('pathLength', '1');
      svg.appendChild(path);
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
  const viewerCap = viewer.querySelector('.viewer__cap');
  const triggers = [...document.querySelectorAll('[data-zoom]')];
  const items = triggers.map((btn) => btn.querySelector('img'));
  let index = 0;
  let lastFocus = null;

  function show(i, animate) {
    index = (i + items.length) % items.length;
    const img = items[index];
    viewerImg.src = img.dataset.full || img.src;
    viewerImg.alt = img.alt;
    viewerCap.textContent = img.alt;
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
})();
