(() => {
  const cv = document.getElementById('game'), ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height, INK = '#2a1b12';
  const $ = id => document.getElementById(id);

  /* ---------- Data ---------- */
  const ING = {
    nasi:   { n: 'Nasi',   chop: false, cook: true },
    telur:  { n: 'Telur',  chop: false, cook: true },
    bawang: { n: 'Bawang', chop: true,  cook: true },
    ayam:   { n: 'Ayam',   chop: true,  cook: true },
    tempe:  { n: 'Tempe',  chop: true,  cook: true },
    cabai:  { n: 'Cabai',  chop: true,  cook: false },
    tomat:  { n: 'Tomat',  chop: true,  cook: false },
  };
  const STN = { raw: 'mentah', chopped: 'potong', cooked: 'matang', burnt: 'gosong' };
  const COL = {
    nasi: { raw: '#e8d7a0', cooked: '#fffdf0' }, telur: { raw: '#f1e1c0', cooked: '#ffffff' },
    bawang: { raw: '#c4528a', chopped: '#ebb0c9', cooked: '#d9962a' },
    ayam: { raw: '#f0a39c', chopped: '#f0a39c', cooked: '#a9622b' },
    tempe: { raw: '#d9c387', chopped: '#d9c387', cooked: '#c7862a' },
    cabai: { raw: '#d62d2d', chopped: '#e44a3b' }, tomat: { raw: '#e0432f', chopped: '#ee5a45' },
  };
  const RECIPES = [
    { n: 'Nasi Goreng',  pts: 140, items: [['nasi', 'cooked'], ['telur', 'cooked'], ['bawang', 'cooked']] },
    { n: 'Soto Ayam',    pts: 150, items: [['ayam', 'cooked'], ['nasi', 'cooked'], ['tomat', 'chopped']] },
    { n: 'Pecel Tempe',  pts: 120, items: [['tempe', 'cooked'], ['cabai', 'chopped'], ['tomat', 'chopped']] },
    { n: 'Telur Balado', pts: 130, items: [['telur', 'cooked'], ['cabai', 'chopped'], ['bawang', 'cooked']] },
    { n: 'Ayam Penyet',  pts: 100, items: [['ayam', 'cooked'], ['cabai', 'chopped']] },
    { n: 'Tempe Orek',   pts: 90,  items: [['tempe', 'cooked'], ['bawang', 'cooked']] },
  ];

  /* ---------- Suara kecil ---------- */
  let ac;
  function sfx(f, d = .1, type = 'square', v = .05) {
    try {
      ac = ac || new AudioContext();
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(v, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + d);
      o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + d);
    } catch (e) {}
  }

  /* ---------- Gambar bahan ---------- */
  function drawItem(c, id, st, x, y, s = 1) {
    c.save(); c.translate(x, y); c.scale(s, s);
    c.lineWidth = 3; c.strokeStyle = INK; c.lineJoin = c.lineCap = 'round';
    const bu = st === 'burnt', col = bu ? '#2b2522' : (COL[id][st] || COL[id].raw);
    const f = (cc = col) => { c.fillStyle = cc; c.fill(); c.stroke(); };
    const cut = st === 'chopped' || ((st === 'cooked' || bu) && ING[id].chop);
    if (cut) {
      [[-10, 5], [9, 6], [0, -8]].forEach(([px, py], i) => {
        c.beginPath();
        if (id === 'tempe') c.rect(px - 7, py - 6, 14, 12);
        else if (id === 'tomat') { c.arc(px, py, 8, .2 * i, Math.PI + .2 * i); c.closePath(); }
        else if (id === 'ayam') c.ellipse(px, py, 9, 6, i, 0, 7);
        else c.arc(px, py, id === 'cabai' ? 5.5 : 7, 0, 7);
        f();
        if (id === 'bawang' && !bu) { c.beginPath(); c.arc(px, py, 3, 0, 7); c.stroke(); }
      });
    } else if (id === 'nasi') {
      c.beginPath(); c.moveTo(-17, 8); c.quadraticCurveTo(-14, -14, 0, -14); c.quadraticCurveTo(14, -14, 17, 8); c.closePath(); f();
      if (st === 'cooked') {
        c.beginPath(); c.moveTo(-5, -18); c.bezierCurveTo(-11, -24, 1, -26, -5, -33);
        c.moveTo(6, -18); c.bezierCurveTo(0, -24, 12, -26, 6, -33);
        c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = 2.5; c.stroke();
      } else if (!bu) {
        c.lineWidth = 1.5; c.beginPath();
        [[-8, 0], [3, -5], [8, 2], [-2, 3]].forEach(([a, b]) => { c.moveTo(a, b); c.lineTo(a + 3, b - 2); }); c.stroke();
      }
    } else if (id === 'telur') {
      if (st === 'raw') { c.beginPath(); c.ellipse(0, 0, 11, 14, 0, 0, 7); f(); }
      else {
        c.beginPath(); c.moveTo(-16, 0); c.bezierCurveTo(-18, -14, -2, -16, 6, -12); c.bezierCurveTo(18, -14, 20, 4, 12, 10); c.bezierCurveTo(4, 18, -14, 14, -16, 0); f();
        if (!bu) { c.beginPath(); c.arc(0, -1, 6.5, 0, 7); f('#f6b920'); }
      }
    } else if (id === 'bawang') {
      c.beginPath(); c.arc(0, 3, 12, 0, 7); f();
      c.beginPath(); c.moveTo(-4, -8); c.lineTo(0, -17); c.lineTo(4, -8); f('#8cbf5a');
    } else if (id === 'ayam') {
      c.beginPath(); c.moveTo(2, 4); c.lineTo(13, 13); c.lineWidth = 8; c.stroke();
      c.strokeStyle = '#fff'; c.lineWidth = 3; c.stroke(); c.strokeStyle = INK; c.lineWidth = 3;
      c.beginPath(); c.arc(15, 15, 4, 0, 7); f('#fff');
      c.beginPath(); c.arc(-3, -3, 12, 0, 7); f();
    } else if (id === 'tempe') {
      c.beginPath(); c.roundRect(-15, -9, 30, 18, 4); f();
      c.fillStyle = '#6b5a2e'; [[-9, -3], [-1, 3], [7, -3], [3, -5], [-6, 4]].forEach(([a, b]) => c.fillRect(a, b, 3, 3));
    } else if (id === 'cabai') {
      c.beginPath(); c.moveTo(-14, 8); c.quadraticCurveTo(0, 10, 14, -10); c.lineWidth = 11; c.stroke();
      c.strokeStyle = col; c.lineWidth = 6; c.stroke();
      c.strokeStyle = '#4f8a3b'; c.lineWidth = 4; c.beginPath(); c.moveTo(14, -10); c.lineTo(17, -15); c.stroke();
    } else if (id === 'tomat') {
      c.beginPath(); c.arc(0, 2, 13, 0, 7); f();
      c.beginPath(); c.moveTo(0, -11); c.lineTo(-6, -14); c.lineTo(0, -9); c.lineTo(6, -14); c.closePath(); f('#5d9a3c');
    }
    c.restore();
  }

  /* ---------- Stasiun ---------- */
  const S = [];
  Object.keys(ING).forEach((id, i) => S.push({ k: 'crate', id, x: 28 + i * 98, y: 22, w: 86, h: 76 }));
  S.push({ k: 'plates', x: 732, y: 22, w: 86, h: 76 }, { k: 'trash', x: 838, y: 22, w: 92, h: 76 });
  S.push({ k: 'board', x: 50, y: 426, w: 130, h: 72, item: null }, { k: 'board', x: 200, y: 426, w: 130, h: 72, item: null });
  S.push({ k: 'stove', x: 400, y: 426, w: 120, h: 72, item: null, fire: 0, fireT: 0 }, { k: 'stove', x: 540, y: 426, w: 120, h: 72, item: null, fire: 0, fireT: 0 });
  S.push({ k: 'plateRack', x: 680, y: 426, w: 68, h: 72, plate: null });
  S.push({ k: 'serve', x: 760, y: 426, w: 170, h: 72 });
  const stoves = S.filter(s => s.k === 'stove');

  /* ---------- State ---------- */
  const chef = { x: 480, y: 260, dx: 0, dy: 1, hand: null, walk: 0, act: false };
  let g, near = null, T = 0, chopT = 0, pressE = false;
  const down = {}, floats = [], parts = [];
  const rail = $('rail'), toastEl = $('toast');

  function reset() {
    g = { run: true, t: 300, el: 0, next: 3, score: 0, combo: 1, orders: [], served: 0, lost: 0, rush: false };
    S.forEach(s => { if ('item' in s) s.item = null; if ('fire' in s) s.fire = 0; if (s.k === 'plateRack') s.plate = null; });
    Object.assign(chef, { x: 480, y: 260, dx: 0, dy: 1, hand: null });
    floats.length = parts.length = 0; renderOrders();
  }

  let toastTm;
  function toast(m) { toastEl.textContent = m; toastEl.classList.add('show'); clearTimeout(toastTm); toastTm = setTimeout(() => toastEl.classList.remove('show'), 1700); }
  const pop = (x, y, txt, col = '#fff') => floats.push({ x, y, txt, col, t: 0 });

  /* ---------- Pesanan ---------- */
  function renderOrders() {
    rail.innerHTML = '';
    if (!g) return;
    g.orders.forEach(o => {
      const d = document.createElement('div'); d.className = 'ticket';
      d.innerHTML = `<h3>${o.r.n}</h3><ul></ul><div class="bar"><i></i></div>`;
      o.r.items.forEach(([id, st]) => {
        const li = document.createElement('li'), c = document.createElement('canvas'); c.width = c.height = 30;
        drawItem(c.getContext('2d'), id, st, 15, 16, .62);
        li.append(c, `${ING[id].n} ${STN[st]}`); d.querySelector('ul').append(li);
      });
      o.bar = d.querySelector('i'); rail.append(d);
    });
  }
  const keyOf = a => a.map(i => i.id + ':' + i.st).sort().join('|');

  function serve() {
    const h = chef.hand;
    if (!h.items.length) return toast('Piringnya masih kosong');
    const k = keyOf(h.items);
    const i = g.orders.findIndex(o => keyOf(o.r.items.map(([id, st]) => ({ id, st }))) === k);
    if (i < 0) { sfx(130, .25, 'sawtooth'); return toast('Tidak ada yang pesan itu! Piring dikembalikan'); }
    const o = g.orders.splice(i, 1)[0];
    const tip = Math.round(o.pat / o.max * 60), pts = (o.r.pts + tip) * g.combo;
    g.score += pts; g.served++; pop(chef.x, chef.y - 70, `+${pts}`, '#ffd23f');
    g.combo = Math.min(4, g.combo + 1); chef.hand = null;
    sfx(880, .12, 'triangle', .07); setTimeout(() => sfx(1175, .18, 'triangle', .07), 90);
    renderOrders();
  }

  /* ---------- Interaksi ---------- */
  const finished = it => it.st === 'chopped' || it.st === 'cooked';

  function takeFrom(s) {
    const it = s.item, h = chef.hand;
    if (!h) { chef.hand = { items: [it] }; s.item = null; return sfx(520, .07); }
    if (h.items.length >= 5) return toast('Maksimal bawa 5 bahan');
    if (!finished(it)) return toast(it.st === 'burnt' ? 'Gosong! Buang ke sampah' : 'Belum jadi');
    h.items.push(it); s.item = null; sfx(660, .08);
  }
  function putOn(s) {
    const items = chef.hand.items;
    const index = items.findIndex(it => s.k === 'board'
      ? it.st === 'raw' && ING[it.id].chop
      : ING[it.id].cook && it.st === (ING[it.id].chop ? 'chopped' : 'raw'));
    if (index < 0) return toast(s.k === 'board' ? 'Bahan ini tidak perlu dipotong' : 'Belum siap dimasak');
    const it = items.splice(index, 1)[0];
    it.prog = 0; s.item = it;
    if (!items.length && !chef.hand.plate) chef.hand = null;
    sfx(s.k === 'board' ? 400 : 300, .1, s.k === 'board' ? 'square' : 'sawtooth');
  }
  function interact() {
    const s = near, h = chef.hand; if (!s) return;
    if (s.k === 'crate') {
      if (h && h.items.length >= 5) toast('Maksimal bawa 5 bahan');
      else { if (!chef.hand) chef.hand = { items: [] }; chef.hand.items.push({ id: s.id, st: 'raw', prog: 0 }); sfx(520, .07); }
    }
    else if (s.k === 'plates') {
      if (h && h.plate) toast('Kamu sudah membawa piring');
      else {
        chef.hand = { plate: 1, items: h ? h.items : [] };
        sfx(700, .06);
      }
    }
    else if (s.k === 'plateRack') {
      if (h && h.plate) {
        if (s.plate) return toast('Tempat piring sudah terisi');
        s.plate = h; chef.hand = null; sfx(600, .08);
      } else if (s.plate) {
        if (h && h.items.length) {
          if (h.items.length + s.plate.items.length > 5) return toast('Maksimal bawa 5 bahan');
          s.plate.items.push(...h.items);
          chef.hand = null;
          sfx(660, .08);
          return toast('Bahan ditambahkan ke piring');
        }
        const complete = g.orders.some(o => keyOf(o.r.items.map(([id, st]) => ({ id, st }))) === keyOf(s.plate.items));
        if (!complete) return toast('Pesanan belum lengkap, tambahkan bahan dulu');
        chef.hand = s.plate;
        s.plate = null; sfx(700, .08);
      } else toast('Bawa piring ke sini untuk ditaruh');
    }
    else if (s.k === 'trash') { if (h) { if (h.plate && h.items.length) h.items = []; else chef.hand = null; sfx(180, .15, 'sawtooth'); } }
    else if (s.k === 'serve') { if (h && h.plate) serve(); else toast('Bawa piring berisi pesanan'); }
    else {
      if (s.k === 'stove' && s.fire > 0) return toast('Api! Tahan Spasi untuk memadamkan');
      if (s.item) {
        if (s.k === 'board' && s.item.st === 'raw' && ING[s.item.id].chop) toast('Tahan Spasi untuk memotong');
        else takeFrom(s);
      } else if (h && h.items.length) putOn(s);
      else if (h && h.plate) toast('Piringnya dibawa ke tempat antar pesanan');
      else if (h) toast('Tidak ada bahan yang bisa ditaruh di sini');
    }
  }

  /* ---------- Update ---------- */
  function rectDist(s) {
    const dx = Math.max(s.x - chef.x, 0, chef.x - (s.x + s.w)), dy = Math.max(s.y - chef.y, 0, chef.y - (s.y + s.h));
    return Math.hypot(dx, dy);
  }
  function smoke(x, y, dark) { parts.push({ x: x + (Math.random() - .5) * 20, y, vy: -30 - Math.random() * 20, life: 1, dark }); }

  function update(dt) {
    T += dt;
    parts.forEach(p => { p.y += p.vy * dt; p.life -= dt * .9; });
    for (let i = parts.length - 1; i >= 0; i--) if (parts[i].life <= 0) parts.splice(i, 1);
    floats.forEach(f => { f.t += dt; });
    for (let i = floats.length - 1; i >= 0; i--) if (floats[i].t > 1.1) floats.splice(i, 1);
    if (!g || !g.run) return;

    g.t -= dt; g.el += dt;
    if (g.t <= 0) return finish();

    // gerak
    const L = down.KeyA || down.ArrowLeft, R = down.KeyD || down.ArrowRight, U = down.KeyW || down.ArrowUp, D = down.KeyS || down.ArrowDown;
    let mx = (R ? 1 : 0) - (L ? 1 : 0), my = (D ? 1 : 0) - (U ? 1 : 0);
    if (mx || my) {
      const l = Math.hypot(mx, my); mx /= l; my /= l;
      chef.x = Math.min(936, Math.max(24, chef.x + mx * 270 * dt));
      chef.y = Math.min(402, Math.max(122, chef.y + my * 270 * dt));
      chef.dx = mx; chef.dy = my; chef.walk += dt * 14;
    }

    // stasiun terdekat
    near = null; let best = 46;
    S.forEach(s => { const d = rectDist(s); if (d < best) { best = d; near = s; } });
    if (pressE) { interact(); pressE = false; }

    // tahan Spasi
    chef.act = false;
    if (down.Space && near) {
      const it = near.item;
      if (near.k === 'board' && it && it.st === 'raw' && ING[it.id].chop) {
        chef.act = true; it.prog += dt / 1.4;
        if ((chopT -= dt) <= 0) { sfx(230 + Math.random() * 70, .04, 'square', .04); chopT = .17; }
        if (it.prog >= 1) { it.st = 'chopped'; it.prog = 0; sfx(880, .1, 'triangle'); pop(near.x + near.w / 2, near.y, 'Siap!'); }
      } else if (near.k === 'stove' && near.fire > 0) {
        chef.act = true; near.fire -= dt / 1.5;
        if (near.fire <= 0) { near.fire = 0; near.item = null; sfx(300, .3, 'sawtooth'); pop(near.x + near.w / 2, near.y, 'Padam!', '#9fd8ff'); }
      }
    }

    // kompor
    stoves.forEach(s => {
      const cx = s.x + s.w / 2, cy = s.y + 30;
      if (s.fire > 0) {
        s.fireT += dt;
        if (s.fireT > 4) { s.fireT = 0; stoves.forEach(o => { if (o !== s && o.item && !o.fire) { o.fire = 1; toast('Apinya merambat!'); sfx(120, .3, 'sawtooth'); } }); }
        return;
      }
      const it = s.item; if (!it) return;
      it.prog += dt;
      if (it.st !== 'cooked' && it.st !== 'burnt' && it.prog >= 5) { it.st = 'cooked'; it.prog = 5; sfx(990, .12, 'triangle'); pop(cx, s.y, 'Matang!', '#b6ff9a'); }
      else if (it.st === 'cooked' && it.prog >= 15) { it.st = 'burnt'; sfx(150, .3, 'sawtooth'); toast('Gosong!'); }
      else if (it.st === 'burnt' && it.prog >= 25) { s.fire = 1; s.fireT = 0; toast('KEBAKARAN! Tahan Spasi dekat kompor'); sfx(110, .5, 'sawtooth', .07); }
      if (Math.random() < dt * 6) smoke(cx, cy - 10, it.st === 'burnt');
    });

    // pesanan
    if (g.el > 180 && !g.rush) { g.rush = true; toast('Jam makan siang! Pesanan makin deras'); sfx(500, .3, 'triangle'); }
    if (g.el >= g.next && g.orders.length < 2) {
      const r = RECIPES[Math.floor(Math.random() * RECIPES.length)], max = 300 - Math.min(60, g.el / 20);
      g.orders.push({ r, pat: max, max }); renderOrders(); sfx(660, .08, 'triangle');
      g.next = g.el + Math.max(18, 32 - g.el / 30) * (g.rush ? .9 : 1);
    }
    for (let i = g.orders.length - 1; i >= 0; i--) {
      const o = g.orders[i]; o.pat -= dt;
      if (o.bar) { const f = Math.max(0, o.pat / o.max); o.bar.style.width = f * 100 + '%'; o.bar.style.background = `hsl(${f * 110},60%,45%)`; }
      if (o.pat <= 0) { g.orders.splice(i, 1); g.lost++; g.combo = 1; toast('Pelanggan kabur!'); sfx(110, .3, 'sawtooth'); renderOrders(); }
    }

    $('score').textContent = g.score;
    $('combo').textContent = 'x' + g.combo;
    const t = Math.max(0, Math.ceil(g.t));
    $('time').textContent = Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
  }

  function finish() {
    g.run = false;
    const st = g.score >= 1100 ? 3 : g.score >= 700 ? 2 : g.score >= 300 ? 1 : 0;
    $('ovTitle').textContent = 'Warung tutup!';
    $('ovText').innerHTML = `Skor <b>${g.score}</b> &nbsp; Diantar <b>${g.served}</b> &nbsp; Pelanggan kabur <b>${g.lost}</b><div class="stars">${'★'.repeat(st)}${'☆'.repeat(3 - st)}</div>`;
    $('book').style.display = 'none'; $('startBtn').textContent = 'Main lagi';
    $('overlay').classList.remove('hide');
  }

  /* ---------- Gambar ---------- */
  const bg = document.createElement('canvas'); bg.width = W; bg.height = H;
  (function buildBG() {
    const b = bg.getContext('2d');
    b.fillStyle = '#efe6cf'; b.fillRect(0, 0, W, 112);
    b.strokeStyle = '#cfc3a1'; b.lineWidth = 1.5;
    for (let r = 0; r * 18 < 112; r++) {
      const y = r * 18; b.beginPath(); b.moveTo(0, y); b.lineTo(W, y); b.stroke();
      for (let x = (r % 2) * 18; x < W; x += 36) { b.beginPath(); b.moveTo(x, y); b.lineTo(x, y + 18); b.stroke(); }
    }
    b.fillStyle = '#3b5b57'; b.fillRect(0, 108, W, 8);
    for (let y = 116, r = 0; y < H; y += 44, r++) for (let x = 0, c = 0; x < W; x += 44, c++) { b.fillStyle = (r + c) % 2 ? '#c5d1b9' : '#d6dfc9'; b.fillRect(x, y, 44, 44); }
    let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    b.lineCap = 'round';
    for (let i = 0; i < 45; i++) { b.strokeStyle = 'rgba(60,45,30,.13)'; b.lineWidth = 2 + rnd() * 3; const x = rnd() * W, y = 120 + rnd() * (H - 120); b.beginPath(); b.moveTo(x, y); b.lineTo(x + rnd() * 26 - 8, y + rnd() * 8 - 4); b.stroke(); }
    for (let i = 0; i < 14; i++) { b.fillStyle = 'rgba(120,80,40,.12)'; b.beginPath(); b.arc(rnd() * W, 120 + rnd() * (H - 120), 3 + rnd() * 6, 0, 7); b.fill(); }
  })();

  function rr(x, y, w, h, r, fill) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); if (fill) { ctx.fillStyle = fill; ctx.fill(); } ctx.stroke(); }
  function label(txt, x, y, col = INK) { ctx.fillStyle = col; ctx.font = '15px "Patrick Hand", sans-serif'; ctx.textAlign = 'center'; ctx.fillText(txt, x, y); }

  function drawStation(s) {
    const { x, y, w, h } = s, cx = x + w / 2;
    ctx.lineWidth = 3; ctx.strokeStyle = INK;
    ctx.fillStyle = 'rgba(42,27,18,.28)'; ctx.fillRect(x + 5, y + 6, w, h);
    if (s.k === 'crate') {
      rr(x, y, w, h, 6, '#a9733f');
      ctx.lineWidth = 2; [y + h * .33, y + h * .62].forEach(yy => { ctx.beginPath(); ctx.moveTo(x + 3, yy); ctx.lineTo(x + w - 3, yy); ctx.stroke(); });
      drawItem(ctx, s.id, 'raw', cx - 15, y + 22, 1); drawItem(ctx, s.id, 'raw', cx + 15, y + 28, .9);
      ctx.lineWidth = 2.5; rr(x + 8, y + h - 24, w - 16, 18, 4, '#fff4d6'); label(ING[s.id].n, cx, y + h - 10);
    } else if (s.k === 'plates') {
      rr(x, y, w, h, 6, '#b9855a');
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(cx, y + 40 - i * 4, 26, 11, 0, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 2.5; ctx.stroke(); }
      ctx.beginPath(); ctx.ellipse(cx, y + 28, 16, 6, 0, 0, 7); ctx.strokeStyle = '#8fb3d9'; ctx.stroke(); ctx.strokeStyle = INK;
      label('Piring', cx, y + h - 8, '#fff4d6');
    } else if (s.k === 'trash') {
      rr(x + 12, y + 14, w - 24, h - 14, 5, '#7d8a8c'); rr(x + 6, y + 4, w - 12, 14, 5, '#5b6668');
      ctx.lineWidth = 2; for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x + 12 + i * (w - 24) / 4, y + 24); ctx.lineTo(x + 12 + i * (w - 24) / 4, y + h - 6); ctx.stroke(); }
      label('Sampah', cx, y + h + 14, '#fff4d6');
    } else if (s.k === 'board') {
      rr(x, y, w, h, 6, '#b9855a'); rr(x + 18, y + 8, w - 36, h - 16, 8, '#e6c78f');
      ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + w - 26, y + 18); ctx.lineTo(x + w - 26, y + 50); ctx.stroke();
      rr(x + 6, y + 34, 12, 4, 2, '#cfd4d8');
      if (s.item) {
        drawItem(ctx, s.item.id, s.item.st, cx, y + h / 2, 1.2);
        if (s.item.st === 'raw' && s.item.prog > 0) { rr(x + 24, y + h - 14, w - 48, 8, 3, '#fff4d6'); ctx.fillStyle = '#5aa04a'; ctx.fillRect(x + 25.5, y + h - 12.5, (w - 51) * s.item.prog, 5); }
      } else label('Talenan', cx, y + h + 14, '#fff4d6');
    } else if (s.k === 'stove') {
      rr(x, y, w, h, 6, '#555a63');
      /* --- bagian lanjutan (terpotong saat paste, dilengkapi) --- */
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.ellipse(cx, y + 38, 36, 20, 0, 0, 7); ctx.fillStyle = '#2d3036'; ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(cx, y + 36, 28, 14, 0, 0, 7); ctx.fillStyle = '#74777e'; ctx.fill(); ctx.stroke();
      rr(x + w - 12, y + 32, 16, 7, 3, '#2d3036');
      if (s.item) {
        drawItem(ctx, s.item.id, s.item.st, cx, y + 34, 1);
        if (!s.fire && s.item.st !== 'burnt') {
          const p = s.item.st === 'cooked' ? Math.min(1, (s.item.prog - 5) / 10) : s.item.prog / 5;
          rr(x + 24, y + h - 14, w - 48, 8, 3, '#fff4d6');
          ctx.fillStyle = s.item.st === 'cooked' ? '#e0432f' : '#f2b632';
          ctx.fillRect(x + 25.5, y + h - 12.5, (w - 51) * Math.max(0, p), 5);
        }
      } else label('Kompor', cx, y + h + 14, '#fff4d6');
      if (s.fire > 0) {
        for (let i = 0; i < 4; i++) {
          const fx = cx - 33 + i * 22, fh = 30 + Math.sin(T * 14 + i * 2) * 8;
          ctx.beginPath(); ctx.moveTo(fx - 10, y + 40); ctx.lineTo(fx, y + 40 - fh); ctx.lineTo(fx + 10, y + 40); ctx.closePath();
          ctx.fillStyle = i % 2 ? '#f6b920' : '#ee6a2c'; ctx.fill(); ctx.stroke();
        }
      }
    } else if (s.k === 'plateRack') {
      rr(x, y, w, h, 6, '#b9855a'); rr(x + 6, y + 10, w - 12, h - 26, 6, '#e6c78f');
      if (s.plate) drawPlate(ctx, s.plate, cx, y + 34, .8); else label('Rak piring', cx, y + h + 14, '#fff4d6');
    } else if (s.k === 'serve') {
      rr(x, y, w, h, 6, '#f2b632');
      for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#fff4d6' : '#d9452b'; ctx.fillRect(x + 6 + i * ((w - 12) / 6), y + 6, (w - 12) / 6, 16); }
      rr(x, y, w, h, 6, 0);
      ctx.font = '26px "Lilita One", Impact, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 4; ctx.strokeStyle = INK;
      ctx.strokeText('ANTAR', cx, y + 54); ctx.fillStyle = '#fff4d6'; ctx.fillText('ANTAR', cx, y + 54);
    }
  }

  function drawPlate(c, pl, x, y, s = 1) {
    c.save(); c.lineWidth = 2.5; c.strokeStyle = INK;
    c.beginPath(); c.ellipse(x, y + 4 * s, 27 * s, 13 * s, 0, 0, 7); c.fillStyle = '#fff'; c.fill(); c.stroke();
    c.beginPath(); c.ellipse(x, y + 4 * s, 17 * s, 7 * s, 0, 0, 7); c.strokeStyle = '#b8c4d4'; c.stroke();
    c.restore();
    const n = pl.items.length;
    pl.items.forEach((it, i) => drawItem(c, it.id, it.st, x + (i - (n - 1) / 2) * 14 * s, y - 2 * s - (i % 2) * 5 * s, .5 * s));
  }

  function drawChef() {
    const x = chef.x, y = chef.y, b = Math.sin(chef.walk) * 2, sh = chef.act ? Math.sin(T * 40) * 2 : 0;
    ctx.fillStyle = 'rgba(42,27,18,.3)'; ctx.beginPath(); ctx.ellipse(x, y + 24, 18, 6, 0, 0, 7); ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = INK;
    ctx.beginPath(); ctx.ellipse(x + sh, y + 6 + b * .4, 17, 18, 0, 0, 7); ctx.fillStyle = '#fff4d6'; ctx.fill(); ctx.stroke();
    rr(x - 10 + sh, y + 8 + b * .4, 20, 12, 4, '#d9452b');
    ctx.beginPath(); ctx.arc(x + chef.dx * 2 + sh, y - 12 + b * .4, 11, 0, 7); ctx.fillStyle = '#f0c29a'; ctx.fill(); ctx.stroke();
    if (chef.dy >= 0) { ctx.fillStyle = INK; const ex = x + chef.dx * 4 + sh; [-4, 4].forEach(o => { ctx.beginPath(); ctx.arc(ex + o, y - 12 + b * .4, 1.8, 0, 7); ctx.fill(); }); }
    rr(x - 11 + sh, y - 28 + b * .4, 22, 10, 3, '#fff');
    [[-7, -31], [0, -35], [7, -31]].forEach(([a, c]) => { ctx.beginPath(); ctx.arc(x + a + sh, y + c + b * .4, 7, 0, 7); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke(); });
    rr(x - 11 + sh, y - 28 + b * .4, 22, 10, 3, '#fff');
    const h = chef.hand;
    if (h) {
      const hx = x + chef.dx * 24, hy = y + 6 + chef.dy * 14;
      if (h.plate) drawPlate(ctx, h, hx, hy, .85);
      else h.items.forEach((it, i) => drawItem(ctx, it.id, it.st, hx + (i - (h.items.length - 1) / 2) * 18, hy, .6));
    }
  }

  function render() {
    ctx.drawImage(bg, 0, 0);
    S.forEach(drawStation);
    if (near && g && g.run) {
      ctx.save(); ctx.setLineDash([8, 6]); ctx.lineDashOffset = -T * 30; ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.roundRect(near.x - 4, near.y - 4, near.w + 8, near.h + 8, 9); ctx.stroke(); ctx.restore();
    }
    drawChef();
    parts.forEach(p => { ctx.globalAlpha = Math.max(0, p.life) * .6; ctx.fillStyle = p.dark ? '#2b2522' : '#f2f2f2'; ctx.beginPath(); ctx.arc(p.x, p.y, 6 + (1 - p.life) * 6, 0, 7); ctx.fill(); });
    ctx.globalAlpha = 1;
    floats.forEach(f => {
      ctx.globalAlpha = Math.max(0, 1 - f.t / 1.1);
      ctx.font = '26px "Lilita One", Impact, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.lineJoin = 'round';
      const yy = f.y - f.t * 40; ctx.strokeText(f.txt, f.x, yy); ctx.fillStyle = f.col; ctx.fillText(f.txt, f.x, yy);
    });
    ctx.globalAlpha = 1;
  }

  /* ---------- Loop & input ---------- */
  let last = 0;
  function loop(ts) {
    const dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts;
    update(dt); render(); requestAnimationFrame(loop);
  }

  const BLOCK = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
  addEventListener('keydown', e => {
    if (BLOCK.includes(e.code)) e.preventDefault();
    if (e.code === 'KeyE' && !e.repeat && g && g.run) pressE = true;
    down[e.code] = true;
  });
  addEventListener('keyup', e => { down[e.code] = false; });
  addEventListener('blur', () => { for (const k in down) down[k] = false; });

  document.querySelectorAll('.touch-controls button').forEach(btn => {
    const key = btn.dataset.key;
    btn.addEventListener('pointerdown', e => {
      e.preventDefault();
      if (btn.dataset.action === 'interact') { if (g && g.run) pressE = true; } else down[key] = true;
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => btn.addEventListener(ev, () => { if (key) down[key] = false; }));
  });

  $('book').innerHTML = RECIPES.map(r => `<div><b>${r.n}</b>${r.items.map(([id, st]) => ING[id].n + ' ' + STN[st]).join(', ')}</div>`).join('');
  $('startBtn').addEventListener('click', () => {
    reset(); $('overlay').classList.add('hide'); cv.focus(); sfx(520, .1);
  });
  requestAnimationFrame(loop);
})();
