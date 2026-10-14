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
  const css = n => getComputedStyle(root).getPropertyValue(n).trim();
  const FONT = () => css('--jkd-font');
  const MONO = () => css('--jkd-mono');
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const now = () => performance.now() / 1000;

  // ---- chrome: theme, grid, clock, the bar as progress ----------------------
  const themeBtn = document.getElementById('themeToggle');
  const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  const syncTheme = () => { themeBtn.setAttribute('aria-pressed', String(isDark())); rebuild(); };
  themeBtn.onclick = () => { root.dataset.theme = isDark() ? 'light' : 'dark'; syncTheme(); };
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', syncTheme);

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

  // ---- work index: a halftone plate per project ----------------------------
  const peek = document.getElementById('peek'), px = peek.getContext('2d');
  function plate(seed) {
    const w = peek.width, h = peek.height;
    px.fillStyle = css('--jkd-raised'); px.fillRect(0, 0, w, h);
    px.fillStyle = css('--jkd-ink'); px.beginPath();
    const cell = 12, s = seed * 1.7;
    for (let y = cell / 2; y < h; y += cell) for (let x = cell / 2; x < w; x += cell) {
      const nx = x / w, ny = y / h;
      const shapes = [
        () => Math.max(0, 1 - Math.hypot(nx - 0.35 - 0.1 * Math.sin(s), ny - 0.55) * 2.4),
        () => (nx + ny * Math.cos(s)) % 0.5 < 0.25 ? 0.85 : 0.05,
        () => Math.max(0, Math.sin(nx * 9 + s) * 0.5 + ny * 0.7),
        () => ny > 0.25 + 0.4 * Math.abs(Math.sin(nx * 3 + s)) ? 0.9 : 0.08,
        () => Math.max(0, 1 - Math.abs(nx - ny) * 3),
        () => markAt ? markAt((nx - 0.18) / 0.64, (ny - 0.08) / 0.84) : 0,
      ];
      const t = Math.min(1, shapes[(seed - 1) % shapes.length]());
      const r = cell * 0.5 * Math.sqrt(t) * 1.1;
      if (r > 0.4) { px.moveTo(x + r, y); px.arc(x, y, r, 0, Math.PI * 2); }
    }
    px.fill();
  }
  const showPeek = (li, x, y) => { plate(+li.dataset.seed); peek.classList.add('on');
    peek.style.left = Math.min(x + 24, innerWidth - 300) + 'px'; peek.style.top = (y - 100) + 'px'; };
  document.querySelectorAll('.index li').forEach(li => {
    li.addEventListener('pointerenter', e => { if (!quiet()) showPeek(li, e.clientX, e.clientY); });
    li.addEventListener('pointerleave', () => peek.classList.remove('on'));
    li.addEventListener('pointermove', e => { peek.style.left = Math.min(e.clientX + 24, innerWidth - 300) + 'px'; peek.style.top = (e.clientY - 100) + 'px'; });
  });

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
      const { ctx, w, h } = fit(l.canvas);
      if (w < 2 || h < 2) continue;             // hidden (display none) or not laid out yet
      if (l.mask && (l.mask.cssW !== Math.round(w) || l.mask.cssH !== Math.round(h))) l.mask = null;
      if (!l.mask && MASKS[l.kind]) l.mask = textMask(MASKS[l.kind][0], w, h, MASKS[l.kind][1]);
      l.p = progressOf(l);
      // Increase Contrast or Reduce Transparency: the settled, plain word.
      if (quiet() && l.mask) { ctx.clearRect(0, 0, w, h); ctx.drawImage(tint(l.mask), 0, 0, w, h); continue; }
      again = LAB[l.kind](l, ctx, w, h, t) || again;
    }
    if (again && !SHOT) wake();
  }
  function wake() { if (!raf) raf = requestAnimationFrame(frame); }
  function rebuild() { labs.forEach(l => { l.mask = null; l.state.sorts = null; }); wake(); }
  addEventListener('resize', rebuild);

  // Chrome on the footer mark: the horizon follows the pointer.
  const chromeMark = document.getElementById('chromeMark');
  document.getElementById('footer').addEventListener('pointermove', e => {
    if (reduce) return;
    const r = chromeMark.getBoundingClientRect();
    chromeMark.style.setProperty('--h', `${clamp((e.clientY - r.top) / r.height, 0.2, 0.8) * 100}%`);
  });

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
    const keep = lab ? lab.sec : document.getElementById({ work: 'work', system: 'system', footer: 'footer' }[SHOT] || 'hero');
    document.querySelectorAll('main > section, footer').forEach(e => { if (e !== keep) e.style.display = 'none'; });
    if (keep.id === 'footer' || keep.id === 'system' || keep.id === 'work') keep.style.paddingTop = '120px';
    if (lab) {
      lab.sec.style.height = '100vh';
      shotP = +(params.get('p') || { blob: 0.5, moire: 0.52, slit: 0.5, misreg: 0.5, stick: 0.9 }[SHOT]);
      if (SHOT === 'slit') lab.state.hist = Array.from({ length: 72 }, (_, k) => Math.sin(k / 72 * Math.PI) * innerWidth * 0.16 * (k / 72));
      if (SHOT === 'misreg') Object.assign(lab.state, { dx: 16, dy: -10, vx: 0, vy: 0 });
      pointer.x = innerWidth * (SHOT === 'moire' ? 0.6 : 0.62); pointer.y = innerHeight * 0.4;
    } else if (SHOT === 'work') {
      const li = document.querySelector('.index li[data-seed="6"]'), r = li.getBoundingClientRect();
      showPeek(li, r.left + r.width * 0.42, r.top + r.height / 2);
    } else if (SHOT === 'system' || SHOT === 'footer') {
      // nothing to set
    } else {
      pointer.x = innerWidth * 0.7; pointer.y = innerHeight * 0.38; lens.x = pointer.x; lens.y = pointer.y;
    }
    bar.style.width = ({ hero: 0, work: 22, blob: 40, moire: 50, slit: 60, misreg: 70, stick: 80, system: 90, footer: 100 }[SHOT] || 0) + '%';
    labs.forEach(l => l.visible = true);
    frame(); frame();
    document.title = 'ready';
  }
  if (SHOT) shot(); else document.fonts.ready.then(() => { rebuild(); syncTheme(); });
})();
