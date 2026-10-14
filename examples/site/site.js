// jkd showcase. Plain JavaScript, no libraries. Every effect settles into
// readable type when nothing moves, and Reduce Motion shows that state only.
// ?shot=<name> freezes a chosen state for screenshots; ?theme=dark|light forces one.
(() => {
  const root = document.documentElement;
  const params = new URLSearchParams(location.search);
  const SHOT = params.get('shot');
  if (params.get('theme')) root.dataset.theme = params.get('theme');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || !!SHOT;
  const quiet = () => matchMedia('(prefers-contrast: more)').matches || matchMedia('(prefers-reduced-transparency: reduce)').matches;
  // Colours are read from the element being drawn, so an inverted section
  // (blob tracking is black on a white page) draws in its own ink.
  let scope = root;
  const css = n => getComputedStyle(scope).getPropertyValue(n).trim();
  const FONT = () => css('--jkd-font');
  const MONO = () => css('--jkd-mono');
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const now = () => performance.now() / 1000;

  // ---- chrome: theme, grid, clock, the bar as progress ----------------------
  // White by default; the switch remembers a choice.
  const isDark = () => root.dataset.theme === 'dark';
  const themeButtons = [...document.querySelectorAll('[data-theme-set]')];
  const syncTheme = () => {
    themeButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.themeSet === (root.dataset.theme || 'light'))));
    rebuild(); drawPieces(); drawChrome();
  };
  themeButtons.forEach(b => b.onclick = () => {
    root.dataset.theme = b.dataset.themeSet;
    try { localStorage.setItem('jkd-theme', b.dataset.themeSet); } catch (e) {}
    syncTheme();
  });

  const overlay = document.getElementById('overlay'), gridBtn = document.getElementById('gridToggle');
  const toggleGrid = () => gridBtn.setAttribute('aria-pressed', String(overlay.classList.toggle('on')));
  gridBtn.onclick = toggleGrid;
  addEventListener('keydown', e => { if (e.key.toLowerCase() === 'g' && !e.metaKey && !e.ctrlKey && !e.altKey) toggleGrid(); });
  if (params.get('grid')) toggleGrid();

  const clock = document.getElementById('clock');
  const tick = () => clock.textContent = new Date().toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
  tick(); setInterval(tick, 10000);

  const bar = document.getElementById('progress');
  let lastY = scrollY, scrollV = 0;
  addEventListener('scroll', () => {
    const h = root.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? scrollY / h * 100 : 0) + '%';
    scrollV = scrollY - lastY; lastY = scrollY; wake();
  }, { passive: true });

  // ---- shared: the pointer, canvases, text masks ----------------------------
  const pointer = { x: innerWidth * 0.72, y: innerHeight * 0.42, vx: 0, vy: 0, inside: null };
  addEventListener('pointermove', e => {
    pointer.vx = e.clientX - pointer.x; pointer.vy = e.clientY - pointer.y;
    pointer.x = e.clientX; pointer.y = e.clientY; wake();
  }, { passive: true });

  function fit(canvas) {
    const dpr = Math.min(devicePixelRatio || 1, 2), w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
  }

  // Lines of bold type laid out flush left, fitted to the box. Returns an
  // offscreen canvas (ink on transparent), its alpha, and where each line sits.
  function textMask(lines, w, h, { weight = 800, maxW = 0.84, maxH = 0.62, tracking = -0.05, top = 0.16 } = {}) {
    const k = Math.min(devicePixelRatio || 1, 2);
    const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(h * k));
    const x = c.getContext('2d', { willReadFrequently: true }); x.scale(k, k);
    const margin = parseFloat(css('--jkd-margin')) || 16;
    let size = 400;
    const measure = s => { x.font = `${weight} ${s}px ${FONT()}`; x.letterSpacing = `${tracking * s}px`; return Math.max(...lines.map(l => x.measureText(l).width)); };
    size = Math.min(size * (w * maxW) / measure(size), (h * maxH) / (lines.length * 0.86));
    measure(size);
    x.fillStyle = '#000'; x.textBaseline = 'alphabetic';
    const lead = size * 0.86, boxes = [];
    lines.forEach((l, i) => {
      const y = h * top + size * 0.78 + i * lead;
      x.fillText(l, margin, y);
      boxes.push({ text: l, x: margin, y, size, width: x.measureText(l).width });
    });
    const alpha = x.getImageData(0, 0, c.width, c.height).data;
    return { canvas: c, alpha, cssW: Math.round(w), cssH: Math.round(h), size, boxes, at: (px, py) => {
      const ix = (px * k) | 0, iy = (py * k) | 0;
      return ix < 0 || iy < 0 || ix >= c.width || iy >= c.height ? 0 : alpha[(iy * c.width + ix) * 4 + 3] / 255;
    } };
  }

  // The mask in the current ink colour (the mask itself is black).
  function tint(m) {
    const c = css('--jkd-ink');
    if (m.tinted && m.tintColor === c) return m.tinted;
    const t = document.createElement('canvas'); t.width = m.canvas.width; t.height = m.canvas.height;
    const x = t.getContext('2d'); x.drawImage(m.canvas, 0, 0);
    x.globalCompositeOperation = 'source-in'; x.fillStyle = c; x.fillRect(0, 0, t.width, t.height);
    m.tinted = t; m.tintColor = c; return t;
  }
  const MASKS = {
    blob: [['see', 'what', 'moves'], { tracking: 0.02, maxW: 0.6, maxH: 0.66, top: 0.12 }],
    moire: [['moiré'], { maxW: 0.9, maxH: 0.5, top: 0.2 }],
    slit: [['slit', 'scan'], { maxW: 0.7, maxH: 0.7, top: 0.1 }],
    misreg: [['two', 'plates'], { maxW: 0.72, maxH: 0.66, top: 0.12 }],
  };

  // The brush mark's alpha, for sampling into halftone.
  const mark = new Image();
  let markAt = null;
  mark.onload = () => {
    const c = document.createElement('canvas'); c.width = mark.naturalWidth; c.height = mark.naturalHeight;
    const x = c.getContext('2d'); x.drawImage(mark, 0, 0);
    const a = x.getImageData(0, 0, c.width, c.height).data;
    markAt = (u, v) => { const ix = (u * c.width) | 0, iy = (v * c.height) | 0;
      return ix < 0 || iy < 0 || ix >= c.width || iy >= c.height ? 0 : a[(iy * c.width + ix) * 4 + 3] / 255; };
    rebuild();
  };
  mark.src = window.JKD_MARK;

  // ---- hero: the brush mark in halftone, a lens at the pointer -------------
  const hero = document.getElementById('heroCanvas');
  const lens = { x: pointer.x, y: pointer.y };
  function drawHero() {
    const { ctx, w, h } = fit(hero);
    ctx.clearRect(0, 0, w, h);
    if (quiet() || !markAt) return;
    const r = hero.getBoundingClientRect();
    const tx = pointer.x - r.left, ty = pointer.y - r.top;
    lens.x += (tx - lens.x) * (reduce ? 1 : 0.14); lens.y += (ty - lens.y) * (reduce ? 1 : 0.14);
    // The mark sits on the right, as tall as the screen allows.
    const mh = Math.min(h * 0.78, w * 0.62 * 510 / 596), mw = mh * 596 / 510;
    const mx = w - mw - Math.max(16, w * 0.04), my = h * 0.1;
    const cell = w < 768 ? 7 : 10, ang = Math.PI / 4, ca = Math.cos(ang), sa = Math.sin(ang);
    const cx = w / 2, cy = h / 2, reach = (w + h) / 1.3, R = Math.min(w, h) * 0.26;
    ctx.fillStyle = css('--jkd-ink'); ctx.beginPath();
    for (let v = -reach; v <= reach; v += cell) for (let u = -reach; u <= reach; u += cell) {
      const x = cx + u * ca - v * sa, y = cy + u * sa + v * ca;
      if (x < -cell || y < -cell || x > w + cell || y > h + cell) continue;
      let t = markAt((x - mx) / mw, (y - my) / mh);
      const d = Math.hypot(x - lens.x, y - lens.y);
      const l = Math.max(0, 1 - d / R);
      t = t > 0 ? Math.min(1, t * (0.72 + 0.5 * l)) : l * l * 0.22;
      const rad = cell * 0.5 * Math.sqrt(t) * 1.12;
      if (rad > 0.35) { ctx.moveTo(x + rad, y); ctx.arc(x, y, rad, 0, Math.PI * 2); }
    }
    ctx.fill();
    return Math.abs(tx - lens.x) + Math.abs(ty - lens.y) > 0.5;
  }

  // ---- his work: real images under a halftone screen ----------------------
  const WORK = {};
  const workReady = Promise.all((window.JKD_WORK || []).map(w => new Promise(res => {
    const im = new Image(); im.onload = () => res(); im.onerror = () => res(); im.src = w.src; WORK[w.id] = { ...w, img: im };
  })));
  const sampler = document.createElement('canvas');
  const sx = sampler.getContext('2d', { willReadFrequently: true });

  // One dot per cell, sized by how much ink the image puts there. `rect` is
  // where the image sits inside the w by h box. On a black page the screen
  // is printed in white, so light areas carry the dots instead.
  function halftoneImage(ctx, img, w, h, rect, { cell = 7, bg = css('--jkd-page') } = {}) {
    const cols = Math.max(1, Math.ceil(w / cell)), rows = Math.max(1, Math.ceil(h / cell));
    sampler.width = cols; sampler.height = rows;
    sx.clearRect(0, 0, cols, rows);
    sx.drawImage(img, rect.x / cell, rect.y / cell, rect.w / cell, rect.h / cell);
    const d = sx.getImageData(0, 0, cols, rows).data;
    const light = isLightColour(css('--jkd-ink'));
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = css('--jkd-ink'); ctx.beginPath();
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const k = (j * cols + i) * 4, a = d[k + 3] / 255;
      if (a < 0.02) continue;
      const lum = (0.299 * d[k] + 0.587 * d[k + 1] + 0.114 * d[k + 2]) / 255;
      const t = a * (light ? lum : 1 - lum);
      const rad = cell * 0.5 * Math.sqrt(t) * 1.15;
      if (rad > 0.3) { const x = i * cell + cell / 2, y = j * cell + cell / 2; ctx.moveTo(x + rad, y); ctx.arc(x, y, rad, 0, Math.PI * 2); }
    }
    ctx.fill();
  }
  function isLightColour(c) {
    const m = c.match(/\d+/g); if (c.startsWith('#')) { const h = c.slice(1); return parseInt(h.length === 3 ? h[0] + h[0] : h.slice(0, 2), 16) > 128; }
    return m ? +m[0] > 128 : false;
  }
  const coverRect = (iw, ih, w, h, contain = false, pad = 0) => {
    const bw = w - 2 * pad, bh = h - 2 * pad;
    const k = contain ? Math.min(bw / iw, bh / ih) : Math.max(bw / iw, bh / ih);
    return { x: pad + (bw - iw * k) / 2, y: pad + (bh - ih * k) / 2, w: iw * k, h: ih * k };
  };

  // The index: a row shows its project through the screen at the pointer.
  const peek = document.getElementById('peek'), pctx = peek.getContext('2d');
  function plate(id) {
    const w = peek.width, h = peek.height, item = WORK[id];
    const img = item ? item.img : mark, isLogo = !item || item.group === 'logos';
    if (!img || !img.naturalWidth) return;
    peek.classList.toggle('light', isLogo); scope = isLogo ? peek : root;
    halftoneImage(pctx, img, w, h, coverRect(img.naturalWidth, img.naturalHeight, w, h, isLogo, isLogo ? 40 : 0), { cell: 9, bg: css(isLogo ? '--jkd-sunken' : '--jkd-raised') });
  }
  // A row with a moving piece shows it moving; Reduce Motion keeps the still.
  const peekVideo = document.getElementById('peekVideo');
  const peekEl = li => li.dataset.video && !reduce ? peekVideo : peek;
  const showPeek = (li, x, y) => {
    const el = peekEl(li);
    if (el === peekVideo) { if (!peekVideo.src.endsWith(li.dataset.video)) peekVideo.src = li.dataset.video; peekVideo.play().catch(() => {}); }
    else plate(li.dataset.img);
    el.classList.add('on'); el.style.left = Math.min(x + 24, innerWidth - 320) + 'px'; el.style.top = (y - 110) + 'px';
  };
  document.querySelectorAll('.index li').forEach(li => {
    li.addEventListener('pointerenter', e => { if (!quiet()) showPeek(li, e.clientX, e.clientY); });
    li.addEventListener('pointerleave', () => { peek.classList.remove('on'); peekVideo.classList.remove('on'); peekVideo.pause(); });
    li.addEventListener('pointermove', e => { const el = peekEl(li); el.style.left = Math.min(e.clientX + 24, innerWidth - 320) + 'px'; el.style.top = (e.clientY - 110) + 'px'; });
  });

  // The work, in chapters on the 12 column grid. Each piece wears the screen
  // until you hover, focus or tap it.
  const CHAPTERS = [
    ['identity', 'Identity', [['buro-table', 7], ['buro-exploration', 5], ['buro-guide', 5], ['buro-logotype', 7], ['buro-applications', 12], ['logo-alps', 5], ['alps-flyer', 7], ['igpat-guide', 6], ['igpat-clearspace', 6]]],
    ['posters', 'Posters', [['tb13', 4], ['tb13-trees', 4], ['tb12', 4], ['tb11', 6], ['tb10', 6]]],
    ['interfaces', 'Interfaces', [['vibe-cover', 6], ['vibe-page', 6], ['autosort', 8]]],
    ['type', 'Type studies', [['type-brabo', 3], ['type-clerkenwell', 3], ['type-conrad', 3], ['type-dillon', 3]]],
    ['experiments', 'Experiments', [['td-video', 8], ['td-1', 4], ['td-2', 6], ['td-3', 6]]],
    ['logos', 'Logos', (window.JKD_WORK || []).filter(w => w.group === 'logos' && w.id !== 'logo-alps').map(w => [w.id, 3])],
  ];
  const chapters = document.getElementById('chapters');
  const pieces = [];
  CHAPTERS.forEach(([key, title, list]) => {
    const ch = document.createElement('div'); ch.className = 'chapter'; ch.id = 'work-' + key;
    ch.innerHTML = `<h3>${title} <span class="jkd-caption">${list.length} ${list.length === 1 ? 'piece' : 'pieces'}</span></h3>`;
    const holder = key === 'logos' ? Object.assign(document.createElement('div'), { className: 'logos' }) : ch;
    if (holder !== ch) ch.appendChild(holder);
    list.forEach(([id, span]) => {
      if (id === 'td-video') {
        // The TouchDesigner piece moves. Its screen is a dot mask in CSS, since
        // a canvas may not read video frames from a page opened as a file.
        const fig = document.createElement('figure'); fig.className = 'piece video'; fig.style.gridColumn = `span ${span}`;
        fig.innerHTML = `<div class="frame" tabindex="0"><video src="assets/td-loop.mp4" poster="assets/td-poster.jpg" muted loop playsinline preload="metadata" aria-label="Fluid contours, a TouchDesigner study, looping"></video></div><figcaption><b>Fluid contours</b><span class="jkd-caption">touchdesigner · 8 second loop</span></figcaption>`;
        fig.addEventListener('click', () => fig.classList.toggle('open'));
        holder.appendChild(fig);
        const v = fig.querySelector('video');
        if (!reduce) new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? v.play().catch(() => {}) : v.pause())).observe(v);
        return;
      }
      const w = WORK[id]; if (!w) return;
      const fig = document.createElement('figure'); fig.className = 'piece';
      if (key !== 'logos') fig.style.gridColumn = `span ${span}`;
      fig.innerHTML = `<div class="frame" tabindex="0"><img alt="${w.title}, ${w.caption}" src="${w.src}"><canvas aria-hidden="true"></canvas></div><figcaption><b>${w.title}</b><span class="jkd-caption">${w.caption}</span></figcaption>`;
      fig.addEventListener('click', () => fig.classList.toggle('open'));
      holder.appendChild(fig);
      if (key === 'logos' || id === 'logo-alps') fig.classList.add('light');
      pieces.push({ fig, id, logo: key === 'logos' || id === 'logo-alps' });
    });
    chapters.appendChild(ch);
  });
  function drawPieces() {
    scope = root;
    for (const p of pieces) {
      scope = p.logo || p.id === 'logo-alps' ? p.fig : root;
      const img = WORK[p.id].img, frame = p.fig.querySelector('.frame'), el = p.fig.querySelector('img'), cv = p.fig.querySelector('canvas');
      if (!img.naturalWidth || quiet()) { cv.getContext('2d').clearRect(0, 0, cv.width, cv.height); continue; }
      const { ctx, w, h } = fit(cv);
      if (w < 2) continue;
      const fr = frame.getBoundingClientRect(), ir = el.getBoundingClientRect();
      halftoneImage(ctx, img, w, h, { x: ir.left - fr.left, y: ir.top - fr.top, w: ir.width, h: ir.height },
        { cell: w < 320 ? 5 : 6, bg: css(p.logo ? '--jkd-sunken' : '--jkd-page') });
    }
  }
  workReady.then(() => requestAnimationFrame(drawPieces));

  // ---- the lab --------------------------------------------------------------
  const labs = [...document.querySelectorAll('.lab')].map(sec => ({
    sec, kind: sec.dataset.lab, canvas: sec.querySelector('canvas'), readout: sec.querySelector('.readout'),
    visible: false, p: 0, state: {}, mask: null,
  }));
  const io = new IntersectionObserver(es => es.forEach(e => { const l = labs.find(l => l.sec === e.target); if (l) l.visible = e.isIntersecting; wake(); }));
  labs.forEach(l => io.observe(l.sec));
  let shotP = null;
  const progressOf = l => shotP !== null ? shotP : clamp((scrollY - l.sec.offsetTop) / Math.max(1, l.sec.offsetHeight - innerHeight));
  const ink = () => css('--jkd-ink');

  const LAB = {
    // 03.1 Blob tracking: words drift; a real connected-component pass finds
    // the shapes on a quarter-resolution copy, then boxes and numbers them.
    blob(l, ctx, w, h, t) {
      const m = l.mask, S = 4;
      const sw = Math.ceil(w / S), sh = Math.ceil(h / S);
      const small = l.state.small || (l.state.small = document.createElement('canvas'));
      if (small.width !== sw) { small.width = sw; small.height = sh; }
      const sx = small.getContext('2d', { willReadFrequently: true });
      sx.clearRect(0, 0, sw, sh);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = ink(); sx.fillStyle = '#000';
      const r = l.canvas.getBoundingClientRect();
      const ptx = pointer.x - r.left, pty = pointer.y - r.top;
      m.boxes.forEach((b, i) => {
        const drift = reduce ? 0 : 1;
        let dx = (Math.sin(t * 0.7 + i * 1.9) * w * 0.03 + (l.p - 0.5) * w * 0.18 * (i - 1)) * drift;
        let dy = Math.cos(t * 0.55 + i) * h * 0.012 * drift;
        const cy = b.y - b.size * 0.35, d = Math.hypot(ptx - (b.x + b.width / 2 + dx), pty - cy);
        if (d < w * 0.3 && !reduce) { dx += (b.x + b.width / 2 + dx - ptx) / d * (w * 0.3 - d) * 0.25; }
        const font = `800 ${b.size}px ${FONT()}`;
        ctx.font = font; ctx.letterSpacing = `${0.02 * b.size}px`; ctx.fillText(b.text, b.x + dx, b.y + dy);
        sx.font = `800 ${b.size / S}px ${FONT()}`; sx.letterSpacing = `${0.02 * b.size / S}px`; sx.fillText(b.text, (b.x + dx) / S, (b.y + dy) / S);
      });
      if (ptx > 0 && ptx < w && pty > 0 && pty < h) { sx.beginPath(); sx.arc(ptx / S, pty / S, 5, 0, Math.PI * 2); sx.fill(); }
      // Connected components, four-neighbour flood fill.
      const a = sx.getImageData(0, 0, sw, sh).data, seen = new Uint8Array(sw * sh), blobs = [], stack = [];
      for (let i = 0; i < sw * sh; i++) {
        if (seen[i] || a[i * 4 + 3] < 110) continue;
        let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, n = 0, mx = 0, my = 0;
        stack.push(i); seen[i] = 1;
        while (stack.length) {
          const k = stack.pop(), x = k % sw, y = (k / sw) | 0;
          n++; mx += x; my += y; if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y;
          for (const q of [k - 1, k + 1, k - sw, k + sw]) {
            if (q < 0 || q >= sw * sh || seen[q]) continue;
            if ((q === k - 1 && x === 0) || (q === k + 1 && x === sw - 1)) continue;
            if (a[q * 4 + 3] >= 110) { seen[q] = 1; stack.push(q); }
          }
        }
        if (n > 12) blobs.push({ x0: x0 * S, y0: y0 * S, x1: (x1 + 1) * S, y1: (y1 + 1) * S, cx: mx / n * S, cy: my / n * S, area: n * S * S });
      }
      blobs.sort((p, q) => p.cx - q.cx);
      ctx.strokeStyle = ink(); ctx.lineWidth = 1; ctx.font = `400 10px ${MONO()}`; ctx.letterSpacing = '0px';
      ctx.globalAlpha = 0.55; ctx.beginPath();
      blobs.forEach((b, i) => i ? ctx.lineTo(b.cx, b.cy) : ctx.moveTo(b.cx, b.cy)); ctx.stroke();
      ctx.globalAlpha = 1;
      blobs.forEach((b, i) => {
        ctx.strokeRect(Math.round(b.x0 - 4) + 0.5, Math.round(b.y0 - 4) + 0.5, Math.round(b.x1 - b.x0 + 8), Math.round(b.y1 - b.y0 + 8));
        ctx.fillRect(b.cx - 2, b.cy - 2, 4, 4);
        const label = `#${String(i + 1).padStart(2, '0')}  ${Math.round(b.cx)},${Math.round(b.cy)}  ${(b.area / 1000).toFixed(1)}k`;
        ctx.fillText(label, b.x0 - 4, b.y0 - 10);
      });
      l.readout.textContent = `blobs ${blobs.length}\nlargest ${(Math.max(0, ...blobs.map(b => b.area)) / 1000).toFixed(1)}k px\nthreshold 110 · scale 1/${S}`;
      return !reduce;
    },

    // 03.2 Moiré: screen A everywhere; screen B the same, except that inside
    // the word its dots are shifted half a cell. Aligned, the word reads.
    moire(l, ctx, w, h) {
      const m = l.mask, cell = w < 768 ? 6 : 7, rad = cell * 0.36;
      const r = l.canvas.getBoundingClientRect();
      const tilt = (l.p - 0.5) * 14 + (reduce ? 0 : ((pointer.x - r.left) / w - 0.5) * 1.2);
      const th = tilt * Math.PI / 180, ct = Math.cos(th), st = Math.sin(th), scale = 1 + Math.abs(l.p - 0.5) * 0.04;
      ctx.clearRect(0, 0, w, h); ctx.fillStyle = ink();
      // Both screens live in a band around the word, so the captions sit on clean paper.
      const y0 = Math.floor(h * 0.08 / cell) * cell, y1 = h * 0.8;
      ctx.beginPath();
      for (let y = y0; y < y1; y += cell) for (let x = 0; x < w + cell; x += cell) { ctx.moveTo(x + rad, y); ctx.arc(x, y, rad, 0, Math.PI * 2); }
      ctx.fill();
      ctx.beginPath();
      // Screen B turns about a dot of screen A, so at zero degrees the two
      // coincide everywhere except inside the word.
      const cx = Math.round(w / 2 / cell) * cell, cy = Math.round(h / 2 / cell) * cell;
      const n = Math.ceil(Math.hypot(w, h) / 2 / cell) + 1, step = cell * scale;
      for (let j = -n; j <= n; j++) for (let i = -n; i <= n; i++) {
        const u = i * step, v = j * step;
        let x = cx + u * ct - v * st, y = cy + u * st + v * ct;
        if (x < -cell || y < y0 - cell / 2 || x > w + cell || y > y1) continue;
        if (m.at(x, y) > 0.5) { x += cell * 0.5 * ct; y += cell * 0.5 * st; }
        ctx.moveTo(x + rad, y); ctx.arc(x, y, rad, 0, Math.PI * 2);
      }
      ctx.fill();
      l.readout.textContent = `screen a  0.00°\nscreen b  ${tilt.toFixed(2)}°\nruling ${cell} px · phase ½`;
      return false;
    },

    // 03.3 Slit-scan: the word drawn in bands, band k showing where the word
    // was k frames ago. Movement comes from scroll speed and the pointer.
    slit(l, ctx, w, h) {
      const N = 72, st = l.state;
      if (!st.hist) st.hist = new Array(N).fill(0);
      const r = l.canvas.getBoundingClientRect();
      const target = reduce ? 0 : clamp(scrollV * 9, -w * 0.3, w * 0.3) + ((pointer.x - r.left) / w - 0.5) * w * 0.12 * (pointer.y > r.top && pointer.y < r.bottom ? 1 : 0);
      st.off = (st.off || 0) + (target - (st.off || 0)) * 0.25;
      if (!SHOT) { st.hist.unshift(st.off); st.hist.length = N; }
      ctx.clearRect(0, 0, w, h);
      const band = h / N;
      for (let k = 0; k < N; k++) {
        ctx.save(); ctx.beginPath(); ctx.rect(0, k * band, w, band + 0.5); ctx.clip();
        ctx.drawImage(tint(l.mask), st.hist[k], 0, w, h); ctx.restore();
      }
      scrollV *= 0.9;
      const spread = Math.max(...st.hist) - Math.min(...st.hist);
      l.readout.textContent = `bands ${N}\nlag 1 frame per band\nspread ${spread.toFixed(0)} px`;
      return !reduce && (spread > 0.5 || Math.abs(target) > 0.5);
    },

    // 03.4 Misregistration: a solid plate and a halftone plate of one word,
    // with registration marks. Speed pushes plate two; a spring brings it home.
    misreg(l, ctx, w, h) {
      const st = l.state; st.dx = st.dx || 0; st.dy = st.dy || 0; st.vx = st.vx || 0; st.vy = st.vy || 0;
      if (!SHOT) {
        const kick = reduce ? 0 : 0.6;
        st.vx += (-st.dx * 0.12) + clamp(pointer.vx, -60, 60) * kick * 0.15; st.vy += (-st.dy * 0.12) + (clamp(pointer.vy, -60, 60) * 0.15 + scrollV * 0.6) * kick;
        st.vx *= 0.72; st.vy *= 0.72; st.dx += st.vx; st.dy += st.vy;
        pointer.vx *= 0.8; pointer.vy *= 0.8; scrollV *= 0.9;
      }
      const m = l.mask;
      ctx.clearRect(0, 0, w, h); ctx.fillStyle = ink(); ctx.strokeStyle = ink(); ctx.lineWidth = 1;
      ctx.drawImage(tint(m), 0, 0, w, h);
      const cell = 9, ang = 15 * Math.PI / 180, ca = Math.cos(ang), sa = Math.sin(ang), cx = w / 2, cy = h / 2, reach = Math.hypot(w, h) / 2;
      ctx.beginPath();
      for (let v = -reach; v <= reach; v += cell) for (let u = -reach; u <= reach; u += cell) {
        const x = cx + u * ca - v * sa, y = cy + u * sa + v * ca;
        if (x < 0 || y < 0 || x > w || y > h) continue;
        if (m.at(x, y) > 0.5) { const X = x + st.dx, Y = y + st.dy, rr = cell * 0.42; ctx.moveTo(X + rr, Y); ctx.arc(X, Y, rr, 0, Math.PI * 2); }
      }
      ctx.fill();
      const marks = [[40, 40], [w - 40, 40], [40, h - 140], [w - 40, h - 140]];
      const regMark = (x, y) => { ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.moveTo(x - 18, y); ctx.lineTo(x + 18, y); ctx.moveTo(x, y - 18); ctx.lineTo(x, y + 18); ctx.stroke(); };
      marks.forEach(([x, y]) => { regMark(x, y + 60); if (Math.hypot(st.dx, st.dy) > 0.5) { ctx.globalAlpha = 0.5; regMark(x + st.dx, y + 60 + st.dy); ctx.globalAlpha = 1; } });
      const mm = v => (v / 3.78).toFixed(1);
      l.readout.textContent = `plate 1  0.0 / 0.0 mm\nplate 2  ${mm(st.dx)} / ${mm(st.dy)} mm\nscreen 15° · ${cell} px`;
      return !reduce && (Math.hypot(st.dx, st.dy) > 0.2 || Math.hypot(st.vx, st.vy) > 0.2);
    },

    // 03.5 The composing stick: sorts arrive from the case one by one, the
    // face mirrored as it is on real type, word spaces as low grey quads. At
    // the end of the scroll the line is proofed and reads the right way round.
    stick(l, ctx, w, h) {
      const text = 'set by hand', st = l.state;
      const size = Math.min(w * 0.085, h * 0.16), font = `800 ${size}px ${FONT()}`;
      if (!st.sorts || st.size !== size) {
        ctx.font = font; ctx.letterSpacing = '0px';
        const pad = size * 0.06; let x = parseFloat(css('--jkd-margin')) || 16;
        st.size = size;
        st.sorts = [...text].map((ch, i) => {
          const adv = ch === ' ' ? size * 0.32 : ctx.measureText(ch).width + pad * 2;
          const s = { ch, x, w: adv, i }; x += adv + 2; return s;
        });
        // In the stick the whole line is a mirror image: the first letter set
        // sits at the right end, every face reversed.
        const left = st.sorts[0].x, right = st.sorts[st.sorts.length - 1].x + st.sorts[st.sorts.length - 1].w;
        st.sorts.forEach(s => { s.mx = left + right - s.x - s.w; });
      }
      const p = l.p, setEnd = 0.62, n = st.sorts.length;
      const done = clamp(p / setEnd) * n;
      const stickY = h * 0.18, bodyH = size * 1.18;
      ctx.clearRect(0, 0, w, h);
      // The stick itself: a rule under the line, and its knee at the left.
      ctx.fillStyle = css('--jkd-rule');
      const m0 = st.sorts[0].x;
      ctx.fillRect(m0 - 8, stickY + bodyH + 4, st.sorts[n - 1].x + st.sorts[n - 1].w - m0 + 16, 3);
      ctx.fillRect(m0 - 8, stickY - 6, 3, bodyH + 13);
      ctx.font = font;
      st.sorts.forEach((s, i) => {
        const k = clamp(done - i);          // 0 in the case, 1 set
        if (k <= 0) return;
        const ease = 1 - Math.pow(1 - k, 3);
        const fromX = w * 0.55 + (i % 4) * size * 0.9, fromY = -bodyH * 1.4 - (i % 3) * 20;
        const x = fromX + (s.mx - fromX) * ease, y = fromY + (stickY - fromY) * ease;
        if (s.ch === ' ') {
          ctx.fillStyle = css('--jkd-rule'); ctx.fillRect(x, y + bodyH * 0.38, s.w, bodyH * 0.62);
          return;
        }
        ctx.fillStyle = css('--jkd-sunken'); ctx.fillRect(x, y, s.w, bodyH);
        ctx.strokeStyle = css('--jkd-rule'); ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, s.w - 1, bodyH - 1);
        ctx.fillStyle = css('--jkd-secondary'); ctx.fillRect(x, y + bodyH - 7, s.w, 2);       // the nick, near the foot
        ctx.save(); ctx.translate(x + s.w / 2, y + bodyH * 0.8); ctx.scale(-1, 1);
        ctx.fillStyle = ink(); ctx.textAlign = 'center'; ctx.fillText(s.ch, 0, 0); ctx.restore();
      });
      // The proof: right reading, pressed onto the page below.
      const proof = clamp((p - setEnd - 0.06) / 0.25);
      if (proof > 0) {
        const py = h * 0.62;
        ctx.globalAlpha = proof; ctx.fillStyle = ink(); ctx.textAlign = 'left';
        ctx.letterSpacing = `${-0.04 * size}px`; ctx.fillText(text, st.sorts[0].x, py); ctx.letterSpacing = '0px';
        ctx.globalAlpha = 1;
        ctx.font = `500 11px ${FONT()}`; ctx.fillStyle = css('--jkd-secondary');
        ctx.fillText('proof', st.sorts[0].x, py - size * 0.95);
      }
      ctx.textAlign = 'left';
      const quads = [...text].filter(c => c === ' ').length;
      l.readout.textContent = `sorts ${Math.min(n, Math.floor(done))} of ${n}\nquads ${quads}\n${proof > 0 ? 'proofed' : 'in the stick, mirrored'}`;
      return false;
    },
  };

  // ---- one loop for everything that moves ----------------------------------
  let raf = 0, last = now();
  function frame() {
    raf = 0;
    const t = now(); last = t;
    let again = false;
    if (scrollY < innerHeight * 1.2) again = drawHero() || again;
    for (const l of labs) {
      if (!l.visible && !SHOT) continue;
      scope = l.sec;
      const { ctx, w, h } = fit(l.canvas);
      if (w < 2 || h < 2) continue;             // hidden (display none) or not laid out yet
      if (l.mask && (l.mask.cssW !== Math.round(w) || l.mask.cssH !== Math.round(h))) l.mask = null;
      if (!l.mask && MASKS[l.kind]) l.mask = textMask(MASKS[l.kind][0], w, h, MASKS[l.kind][1]);
      l.p = progressOf(l);
      // Increase Contrast or Reduce Transparency: the settled, plain word.
      if (quiet() && l.mask) { ctx.clearRect(0, 0, w, h); ctx.drawImage(tint(l.mask), 0, 0, w, h); continue; }
      again = LAB[l.kind](l, ctx, w, h, t) || again;
    }
    scope = root;
    if (again && !SHOT) wake();
  }
  function wake() { if (!raf) raf = requestAnimationFrame(frame); }
  function rebuild() { labs.forEach(l => { l.mask = null; l.state.sorts = null; }); wake(); }
  let resizeT = 0;
  addEventListener('resize', () => { rebuild(); clearTimeout(resizeT); resizeT = setTimeout(() => { drawPieces(); drawChrome(); }, 150); });

  // Chrome on the footer mark. Real chrome is a mirror: a bright sky, a dark
  // horizon, the ground below, with a bevel that catches light on the upper
  // left edges and falls into shadow on the lower right. The horizon follows
  // the pointer, so the mark seems to tilt in your hand.
  const chromeCv = document.getElementById('chrome');
  let horizon = 0.46, chromeRaf = 0;
  function layer(W, H) { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; }
  function drawChrome() {
    if (!mark.naturalWidth || !chromeCv) return;
    scope = root;
    const { ctx, w, h } = fit(chromeCv);
    if (w < 2) return;
    const W = chromeCv.width, H = chromeCv.height, k = W / w;
    const rect = coverRect(mark.naturalWidth, mark.naturalHeight, W, H, true, 12 * k);
    const mask = layer(W, H), mx = mask.getContext('2d');
    mx.drawImage(mark, rect.x, rect.y, rect.w, rect.h);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
    if (quiet()) { mx.globalCompositeOperation = 'source-in'; mx.fillStyle = css('--jkd-ink'); mx.fillRect(0, 0, W, H); ctx.drawImage(mask, 0, 0); return; }
    // The body. Every stroke is treated as a rounded tube: a blur of the mark
    // is its height, the slope at each pixel is its normal, and the normal
    // picks what it reflects from a sky, horizon and ground ramp.
    const cw = Math.round(w), ch = Math.round(h), r1 = coverRect(mark.naturalWidth, mark.naturalHeight, cw, ch, true, 12);
    const m1 = layer(cw, ch), m1x = m1.getContext('2d', { willReadFrequently: true }); m1x.drawImage(mark, r1.x, r1.y, r1.w, r1.h);
    const hm = layer(cw, ch), hmx = hm.getContext('2d', { willReadFrequently: true }); hmx.filter = 'blur(5px)'; hmx.drawImage(m1, 0, 0);
    const A = m1x.getImageData(0, 0, cw, ch).data, Hd = hmx.getImageData(0, 0, cw, ch).data;
    if (!drawChrome.ramp) {
      const rc = layer(256, 1), rx = rc.getContext('2d'), rg = rx.createLinearGradient(0, 0, 256, 0);
      [[0, '#f4f4f4'], [0.28, '#cfcfcf'], [0.44, '#8a8a8a'], [0.495, '#5a5a5a'], [0.5, '#0b0b0b'], [0.57, '#353535'], [0.74, '#9e9e9e'], [0.9, '#f5f5f5'], [1, '#c4c4c4']]
        .forEach(([o, c]) => rg.addColorStop(o, c));
      rx.fillStyle = rg; rx.fillRect(0, 0, 256, 1); drawChrome.ramp = rx.getImageData(0, 0, 256, 1).data;
    }
    const ramp = drawChrome.ramp, out = m1x.createImageData(cw, ch), O = out.data, hAt = (x, y) => Hd[((y < 0 ? 0 : y >= ch ? ch - 1 : y) * cw + (x < 0 ? 0 : x >= cw ? cw - 1 : x)) * 4 + 3] / 255;
    const tilt = horizon - 0.46;
    for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
      const i = (y * cw + x) * 4, a = A[i + 3];
      if (a < 8) continue;
      const gx = hAt(x + 2, y) - hAt(x - 2, y), gy = hAt(x, y + 2) - hAt(x, y - 2);
      let t = 0.5 + gy * 2.6 + gx * 0.5 + (y / ch - 0.5) * 0.3 - tilt;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const j = (t * 255 | 0) * 4, spec = Math.max(0, -gx - gy) * 1.6;
      O[i] = Math.min(255, ramp[j] + spec * 255); O[i + 1] = Math.min(255, ramp[j + 1] + spec * 255); O[i + 2] = Math.min(255, ramp[j + 2] + spec * 255); O[i + 3] = a;
    }
    m1x.putImageData(out, 0, 0);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(m1, 0, 0, W, H);
  }
  document.getElementById('footer').addEventListener('pointermove', e => {
    if (reduce) return;
    const r = chromeCv.getBoundingClientRect();
    horizon = clamp((e.clientY - r.top) / r.height, 0.25, 0.75);
    if (!chromeRaf) chromeRaf = requestAnimationFrame(() => { chromeRaf = 0; drawChrome(); });
  });
  const markLoaded = () => { drawChrome(); };
  if (mark.complete) markLoaded(); else mark.addEventListener('load', markLoaded);

  // The type scale, live.
  const scale = document.getElementById('scale');
  [['108', 'monument', 'jkd'], ['72', 'poster', 'Switzer'], ['36', 'display', 'sort a folder'], ['28', 'title', 'Club night, a numbered run'],
   ['20', 'lead', 'Flush left, ragged right.'], ['17', 'body', 'Hierarchy by size and weight, colour last.'],
   ['13', 'small', 'Every gap is a multiple of four.'], ['11', 'caption', 'filed 4 · trash 1 · left 2']]
    .forEach(([size, name, text]) => {
      const row = document.createElement('div');
      const weight = +size >= 28 ? 800 : name === 'caption' ? 500 : 400;
      row.innerHTML = `<span class="jkd-caption">${size} ${name}</span><span style="font:${weight} ${size / 16}rem/1.05 var(--jkd-font);letter-spacing:${+size >= 36 ? '-0.04em' : 0};${name === 'caption' ? 'text-transform:lowercase;color:var(--jkd-secondary);letter-spacing:.036em' : ''}">${text}</span>`;
      scale.appendChild(row);
    });

  // ---- screenshot mode -------------------------------------------------------
  async function shot() {
    await document.fonts.ready;
    await new Promise(r => mark.complete ? r() : mark.addEventListener('load', r, { once: true }));
    document.querySelectorAll('*').forEach(e => e.style.transition = 'none');
    const lab = labs.find(l => l.kind === SHOT);
    // Headless screenshots do not keep a scroll position, so the chosen
    // section is shown alone, at the top.
    const keep = lab ? lab.sec : document.getElementById({ work: 'index', showcase: 'work', system: 'system', footer: 'footer' }[SHOT] || 'hero');
    document.querySelectorAll('main > section, footer').forEach(e => { if (e !== keep) e.style.display = 'none'; });
    if (keep.id !== 'hero' && !lab) keep.style.paddingTop = '120px';
    await workReady;
    if (lab) {
      lab.sec.style.height = '100vh';
      shotP = +(params.get('p') || { blob: 0.5, moire: 0.52, slit: 0.5, misreg: 0.5, stick: 0.9 }[SHOT]);
      if (SHOT === 'slit') lab.state.hist = Array.from({ length: 72 }, (_, k) => Math.sin(k / 72 * Math.PI) * innerWidth * 0.16 * (k / 72));
      if (SHOT === 'misreg') Object.assign(lab.state, { dx: 16, dy: -10, vx: 0, vy: 0 });
      pointer.x = innerWidth * (SHOT === 'moire' ? 0.6 : 0.62); pointer.y = innerHeight * 0.4;
    } else if (SHOT === 'work') {
      const li = document.querySelector('.index li[data-img="tb13"]'), r = li.getBoundingClientRect();
      showPeek(li, r.left + r.width * 0.42, r.top + r.height / 2);
    } else if (SHOT === 'showcase') {
      const open = params.get('open'); if (open) document.querySelectorAll('.piece')[+open]?.classList.add('open');
      if (params.get('chapter')) { const c = document.getElementById('work-' + params.get('chapter')); document.querySelectorAll('.chapter').forEach(x => { if (x !== c) x.style.display = 'none'; }); }
    } else if (SHOT === 'system' || SHOT === 'footer') {
      // nothing to set
    } else {
      pointer.x = innerWidth * 0.7; pointer.y = innerHeight * 0.38; lens.x = pointer.x; lens.y = pointer.y;
    }
    syncThemeButtons();
    drawPieces(); drawChrome();
    bar.style.width = ({ hero: 0, work: 18, showcase: 28, blob: 40, moire: 50, slit: 60, misreg: 70, stick: 80, system: 90, footer: 100 }[SHOT] || 0) + '%';
    labs.forEach(l => l.visible = true);
    frame(); frame();
    document.title = 'ready';
  }
  function syncThemeButtons() { themeButtons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.themeSet === (root.dataset.theme || 'light')))); }
  syncThemeButtons();
  if (SHOT) shot(); else document.fonts.ready.then(() => { rebuild(); syncTheme(); });
})();
