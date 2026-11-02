/* ==========================================================
   TIỆM BÁNH — logic game
   ========================================================== */
(() => {
  'use strict';
  const G = window.GAME, A = G.art, SFX = G.sfx, CFG = G.config;
  const CAP = CFG.boxSize;
  const PERFECT = 1.35, BURN = 1.9, STOCK_CAP = 12, BELL_TIME = 8;

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const rand = (a, b) => a + Math.random() * (b - a);
  const randInt = (a, b) => Math.floor(rand(a, b + 1));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const coin = n => `<span class="cn"><i class="ci"></i>${n}</span>`;
  const pad = n => String(n).padStart(2, '0');
  const fmtTime = s => `${Math.floor(s / 60)}:${pad(Math.floor(s % 60))}`;

  const stage = $('#stage'), fx = $('#fx');
  let scale = 1, current = 'title', prevScreen = 'title';
  let S = null;

  /* ---------- Lưu tiến trình ---------- */
  const SAVE_KEY = 'tiembanh-save-v1';
  const defaults = () => ({
    unlocked: 1, stars: {}, best: {}, coins: 0, upgrades: {}, endlessBest: 0, muted: false,
    stats: {}, ach: {}, missions: {}, theme: 'pink', themes: ['pink'],
  });
  function loadSave() {
    try { return Object.assign(defaults(), JSON.parse(localStorage.getItem(SAVE_KEY)) || {}); }
    catch (e) { return defaults(); }
  }
  let save = loadSave();
  const persist = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* bỏ qua */ } };
  const upg = id => save.upgrades[id] || 0;
  const totalStars = () => Object.values(save.stars).reduce((a, b) => a + b, 0);

  /* ---------- Thống kê & thành tích ---------- */
  function stat(k, v, mode) {
    save.stats[k] = mode === 'max' ? Math.max(save.stats[k] || 0, v) : (save.stats[k] || 0) + v;
    checkAch();
  }
  const statVal = a => a.stat === 'stars' ? totalStars() : (save.stats[a.stat] || 0);
  const toastQueue = [];
  let toastBusy = false;
  function checkAch() {
    let any = false;
    G.achievements.forEach(a => {
      if (save.ach[a.id] || statVal(a) < a.goal) return;
      save.ach[a.id] = true;
      save.coins += a.reward;
      toastQueue.push(a);
      any = true;
    });
    if (any) { persist(); nextToast(); }
  }
  function nextToast() {
    if (toastBusy || !toastQueue.length) return;
    const a = toastQueue.shift(), t = $('#toast');
    toastBusy = true;
    t.innerHTML = `🏆 Thành tích mới!<b>${a.icon} ${a.name}</b>${coin('+' + a.reward)}`;
    t.classList.add('show');
    SFX.star();
    setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => { toastBusy = false; nextToast(); }, 450);
    }, 2600);
  }
  const applyTheme = () => { stage.dataset.theme = save.theme; };

  /* ---------- Co giãn khung game ---------- */
  function fit() {
    scale = Math.min(innerWidth / 1280, innerHeight / 720);
    stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }
  addEventListener('resize', fit);
  fit();
  const toStage = (x, y) => { const r = stage.getBoundingClientRect(); return { x: (x - r.left) / scale, y: (y - r.top) / scale }; };
  const centerOf = el => { const r = el.getBoundingClientRect(); return toStage(r.left + r.width / 2, r.top + r.height / 2); };

  /* ---------- Hiệu ứng ---------- */
  function floatText(text, x, y, cls = '') {
    const el = document.createElement('div');
    el.className = 'float ' + cls;
    el.innerHTML = text;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    fx.appendChild(el);
    setTimeout(() => el.remove(), 1300);
  }
  const floatAt = (el, text, cls, dy = 0) => { const p = centerOf(el); floatText(text, p.x, p.y + dy, cls); };
  function shake(el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }
  function bump(el) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
  function banner(text) { const b = $('#banner'); b.textContent = text; b.classList.remove('show'); void b.offsetWidth; b.classList.add('show'); }

  function flyCoins(fromEl, toEl, n) {
    const a = centerOf(fromEl), b = centerOf(toEl);
    for (let i = 0; i < n; i++) {
      const c = document.createElement('div');
      c.className = 'coin';
      c.style.left = a.x + 'px';
      c.style.top = a.y + 'px';
      fx.appendChild(c);
      const mx = rand(-40, 40), my = rand(-70, -30);
      c.animate([
        { transform: 'translate(0,0) scale(.5)', opacity: 0 },
        { transform: `translate(${mx}px,${my}px) scale(1)`, opacity: 1, offset: 0.3 },
        { transform: `translate(${b.x - a.x}px,${b.y - a.y}px) scale(.7)`, opacity: 1 },
      ], { duration: 750, delay: i * 70, easing: 'ease-in', fill: 'backwards' }).onfinish = () => c.remove();
    }
  }

  function confetti() {
    const colors = ['#f48fb1', '#f5b83d', '#81d4fa', '#a5d6a7', '#ce93d8', '#fff'];
    for (let i = 0; i < 60; i++) {
      const c = document.createElement('div');
      c.className = 'confetti';
      c.style.left = rand(0, 1280) + 'px';
      c.style.background = pick(colors);
      c.style.animationDuration = rand(1.8, 3.2) + 's';
      c.style.animationDelay = rand(0, 0.6) + 's';
      fx.appendChild(c);
      setTimeout(() => c.remove(), 4000);
    }
  }

  /* ---------- Điều hướng màn hình ---------- */
  function show(name) {
    current = name;
    $$('.screen').forEach(s => s.classList.toggle('active', s.id === 'scr-' + name));
    if (name === 'title') renderTitle();
    if (name === 'map') renderMap();
    if (name === 'upgrades') renderShop();
    SFX.music(name === 'game');
  }
  function openModal(html, cls = '') {
    const card = $('#modal-card');
    card.className = 'modal-card ' + cls;
    card.innerHTML = html;
    $('#modal').hidden = false;
  }
  const closeModal = () => { $('#modal').hidden = true; };

  function renderTitle() {
    document.title = CFG.name;
    $('#title-name').textContent = CFG.name;
    $('#title-tagline').textContent = CFG.tagline;
    $('#title-stats').innerHTML = `<span>★ ${totalStars()}/${G.levels.length * 3}</span><span>${coin(save.coins)} tiết kiệm</span>`;
    const spots = [[70, 90], [1080, 70], [150, 520], [1060, 480], [40, 300], [1150, 280], [300, 610], [880, 600]];
    const ids = Object.keys(G.pastries);
    $('#title-deco').innerHTML = spots.map(([x, y], i) =>
      `<div class="td art" style="left:${x}px;top:${y}px;animation-delay:${-i * 0.6}s">${A.pastry(ids[i % ids.length])}</div>`).join('');
    const r = $('.reset-btn');
    r.classList.remove('confirm');
    r.textContent = 'Chơi lại từ đầu';
  }

  function renderMap() {
    $('#map-wallet').innerHTML = `<span>★ ${totalStars()}</span><span>${coin(save.coins)}</span>`;
    const cards = G.levels.map((lv, i) => {
      const n = i + 1, locked = n > save.unlocked, st = save.stars[n] || 0;
      const stars = [0, 1, 2].map(k => k < st ? '★' : '<span class="off">★</span>').join('');
      return `<button class="day-card ${locked ? 'locked' : ''}" ${locked ? 'disabled' : `data-act="day" data-day="${i}"`}>
        <span class="dn">${n}</span>${locked ? '<span class="lock">🔒</span>' : ''}${save.missions[n] ? '<span class="dm" title="Đã xong nhiệm vụ phụ">🎯</span>' : ''}
        <span class="dart art">${A.pastry(lv.pastries[lv.pastries.length - 1])}</span>
        <span class="dt">${lv.title}</span><span class="ds">${stars}</span></button>`;
    });
    const endlessOpen = save.unlocked > 5;
    cards.push(`<button class="day-card endless ${endlessOpen ? '' : 'locked'}" ${endlessOpen ? 'data-act="endless"' : 'disabled'}>
      <span class="dart art">${A.pastry('cupcake')}</span>
      <span><b style="font-size:26px">∞ Chế độ vô tận</b><br>${endlessOpen ? `Kỷ lục: ${coin(save.endlessBest)}` : '🔒 Qua Ngày 5 để mở khóa'}</span></button>`);
    $('#day-grid').innerHTML = cards.join('');
  }

  function renderUpgrades() {
    $('#upg-wallet').innerHTML = `<span>${coin(save.coins)}</span>`;
    $('#upg-grid').innerHTML = G.upgrades.map(u => {
      const lvl = upg(u.id), max = u.costs.length, cost = u.costs[lvl];
      const pips = u.costs.map((_, k) => `<i class="${k < lvl ? 'on' : ''}"></i>`).join('');
      const btn = lvl >= max
        ? '<button class="btn" disabled>Đã tối đa</button>'
        : `<button class="btn" data-act="buy" data-id="${u.id}" ${save.coins < cost ? 'disabled' : ''}>Mua ${coin(cost)}</button>`;
      return `<div class="upg-card"><div class="ui">${u.icon}</div><h3>${u.name}</h3><p>${u.desc}</p><div class="pips">${pips}</div>${btn}</div>`;
    }).join('');
  }

  function buy(id) {
    const u = G.upgrades.find(x => x.id === id), lvl = upg(id), cost = u.costs[lvl];
    if (cost === undefined || save.coins < cost) return;
    save.coins -= cost;
    save.upgrades[id] = lvl + 1;
    persist();
    SFX.cash();
    renderShop();
  }

  let shopTab = 'upg';
  function renderShop() {
    $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === shopTab));
    $('#upg-grid').hidden = shopTab !== 'upg';
    $('#theme-grid').hidden = shopTab !== 'theme';
    $('#ach-grid').hidden = shopTab !== 'ach';
    $('#ach-count').textContent = `${Object.keys(save.ach).length}/${G.achievements.length}`;
    renderUpgrades();
    renderThemes();
    renderAch();
  }

  function renderThemes() {
    $('#theme-grid').innerHTML = G.themes.map(t => {
      const owned = save.themes.includes(t.id), using = save.theme === t.id;
      const [rose, berry, bg] = t.colors;
      const btn = using ? '<button class="btn small" disabled>Đang dùng</button>'
        : owned ? `<button class="btn small" data-act="theme" data-id="${t.id}">Dùng</button>`
        : `<button class="btn small" data-act="theme" data-id="${t.id}" ${save.coins < t.cost ? 'disabled' : ''}>Mua ${coin(t.cost)}</button>`;
      return `<div class="theme-card ${using ? 'using' : ''}">
        <div class="theme-prev" style="background:${bg}">
          <div class="tp-awn" style="background:repeating-linear-gradient(90deg,#fff 0 16px,${rose} 16px 32px)"></div>
          <div class="tp-art art">${A.pastry('cupcake')}</div><div class="tp-hud" style="background:${berry}"></div></div>
        <h3>${t.name}</h3>${btn}</div>`;
    }).join('');
  }

  function setTheme(id) {
    const t = G.themes.find(x => x.id === id);
    if (!save.themes.includes(id)) {
      if (save.coins < t.cost) return;
      save.coins -= t.cost;
      save.themes.push(id);
      SFX.cash();
    }
    save.theme = id;
    applyTheme();
    persist();
    renderShop();
  }

  function renderAch() {
    $('#ach-grid').innerHTML = G.achievements.map(a => {
      const v = Math.min(statVal(a), a.goal), done = !!save.ach[a.id];
      return `<div class="ach ${done ? 'done' : ''}"><div class="ai">${a.icon}</div>
        <div style="flex:1;min-width:0"><b>${a.name}</b><small>${a.desc} · ${coin(a.reward)}</small>
        <div class="ap"><i style="width:${v / a.goal * 100}%"></i></div></div></div>`;
    }).join('');
  }

  const helpHTML = () => `<div class="help"><h2 class="serif">Cách chơi</h2><ol>
    <li>Khách ghé quầy, món họ muốn hiện trong <b>bong bóng</b>.</li>
    <li><b>Chạm hoặc kéo</b> bánh từ tủ kính vào <b>hộp bánh</b>. Bỏ nhầm thì chạm vào bánh trong hộp để lấy ra.</li>
    <li>Thêm <b>sốt</b> hoặc <b>nơ gói quà</b> nếu khách yêu cầu.</li>
    <li>Đủ món (bong bóng viền xanh) thì <b>chạm vào khách</b> hoặc kéo cả hộp tới khách để giao.</li>
    <li>Hết bánh thì bấm <b>🔥 Nướng</b>, lấy ra khi kim chạy vào <b>vùng vàng</b> để được thưởng.</li>
    <li>Giao nhanh để nhận nhiều tip, giao đúng liên tiếp để có <b>combo</b>. Khách bỏ về sẽ mất tim.</li>
    <li>Đạt mục tiêu tiền để được 1–3 ★, mở khóa ngày mới và mua <b>nâng cấp</b>.</li>
    <li>⭐ <b>Bánh đặc biệt</b> mỗi ngày bán giá ×1.5. 🎯 <b>Nhiệm vụ phụ</b> cho thêm tiền thưởng.</li>
    <li>🐱 Thấy <b>mèo may mắn</b> đi ngang quầy thì chạm vào: hồi 1 tim (hoặc được tiền).</li>
  </ol><div class="row"><button class="btn" data-act="close">Đã hiểu!</button></div></div>`;

  /* ==========================================================
     BẮT ĐẦU NGÀY
     ========================================================== */
  function makeEndless() {
    return {
      title: 'Thử thách vô tận', duration: Infinity, slots: 3, spawn: [6, 8], maxItems: 2, maxTypes: 2,
      sauces: [], sauceChance: 0, gift: 0, oven: true, startStock: 5, vip: 0, critic: 0, kid: 0.2,
      patience: 32, rush: false, bell: 1, intro: [], targets: [0, 0, 0], pastries: [],
    };
  }

  function rampEndless() {
    const lv = S.lv, k = S.served, all = Object.keys(G.pastries);
    const pastries = all.slice(0, Math.min(all.length, 3 + Math.floor(k / 5)));
    const sauces = k >= 15 ? ['cream', 'choco', 'matcha'] : k >= 6 ? ['cream', 'choco'] : [];
    const gift = k >= 10 ? 0.25 : 0;
    const changedCase = pastries.length !== lv.pastries.length;
    const changedExtras = sauces.length !== lv.sauces.length || gift !== lv.gift;
    Object.assign(lv, {
      pastries, sauces, gift, sauceChance: sauces.length ? 0.35 : 0,
      maxItems: Math.min(6, 2 + Math.floor(k / 6)), maxTypes: Math.min(4, 2 + Math.floor(k / 10)),
      vip: k >= 12 ? 0.12 : 0, critic: k >= 20 ? 0.08 : 0,
      patience: Math.max(22, 32 - k * 0.4),
    });
    const sp = Math.max(3.5, 7 - k * 0.12);
    lv.spawn = [sp * 0.8, sp * 1.2];
    if (changedCase) {
      pastries.forEach(id => { if (S.stock[id] === undefined) S.stock[id] = lv.startStock; });
      if (S.lv.pastries.length > 3 && S.ready) banner(`🆕 Bánh mới: ${G.pastries[pastries[pastries.length - 1]].name}!`);
      buildCase();
    }
    if (changedExtras) buildExtras();
  }

  function startDay(idx) {
    closeModal();
    const endless = idx === 'endless';
    const lv = endless ? makeEndless() : Object.assign({}, G.levels[idx]);
    S = {
      lvIdx: idx, endless, lv,
      time: 0, money: 0, shown: 0, tips: 0,
      hearts: CFG.maxHearts, combo: 0, bestCombo: 0, served: 0, angry: 0, perfectBakes: 0, bakedOnce: false,
      customers: Array(lv.slots).fill(null), nextId: 1, spawnT: 1.2,
      box: { items: [], sauce: null, gift: false },
      stock: {}, oven: lv.oven ? Array(1 + upg('ovenSlot')).fill(null) : [],
      bellLeft: lv.bell ? lv.bell + upg('bell') : 0, bellT: 0,
      rushAt: lv.rush ? rand(0.3, 0.6) * lv.duration : -1, rushT: 0,
      starHit: [false, false, false], warned: false,
      gifts: 0, vips: 0, specialSold: 0, special: null, mission: null, cat: null, catAt: [], catNext: 50,
      running: false, paused: false, ended: false, ready: false,
    };
    lv.pastries.forEach(id => { S.stock[id] = lv.oven ? lv.startStock : Infinity; });
    if (endless) rampEndless();
    S.special = idx === 0 ? null : pick(lv.pastries);
    S.mission = makeMission();
    if (!endless && idx > 0) S.catAt = (idx >= 4 ? [rand(0.2, 0.4), rand(0.6, 0.85)] : [rand(0.3, 0.7)]).map(f => f * lv.duration);
    buildGame();
    show('game');
    openModal(introHTML());
    S.ready = true;
  }

  function introHTML() {
    const lv = S.lv;
    if (S.endless) {
      return `<div class="intro"><div class="intro-head"><small>Chế độ đặc biệt</small><h2 class="serif">Thử thách vô tận</h2></div>
        <div class="intro-item"><span class="ii">∞</span><div><b>Không giới hạn thời gian</b><p>Phục vụ càng lâu càng tốt. Khách ngày càng đông, bánh mới dần xuất hiện.</p></div></div>
        <div class="intro-item"><span class="ii">❤️</span><div><b>Hết tim là kết thúc</b><p>Giữ khách vui vẻ để phá kỷ lục ${coin(save.endlessBest)}.</p></div></div>
        <div class="row"><button class="btn ghost" data-act="to-map">◀ Bản đồ</button><button class="btn big" data-act="open-shop">Mở cửa tiệm!</button></div></div>`;
    }
    const prev = S.lvIdx > 0 ? G.levels[S.lvIdx - 1].pastries : [];
    const fresh = lv.pastries.filter(p => !prev.includes(p));
    const items = lv.intro.map(([icon, t, d]) => `<div class="intro-item"><span class="ii">${icon}</span><div><b>${t}</b><p>${d}</p></div></div>`).join('');
    const freshHtml = fresh.length ? `<div class="intro-new"><b>${S.lvIdx === 0 ? 'Thực đơn hôm nay' : 'Bánh mới'}</b><div class="intro-pastries">${fresh.map(p =>
      `<div><div class="art">${A.pastry(p)}</div>${G.pastries[p].name}<br>${coin(G.pastries[p].price)}</div>`).join('')}</div></div>` : '';
    const goals = lv.targets.map((t, i) => `<span><span class="gs">${'★'.repeat(i + 1)}</span> ${coin(t)}</span>`).join('');
    return `<div class="intro"><div class="intro-head"><small>Ngày ${S.lvIdx + 1}</small><h2 class="serif">${lv.title}</h2></div>
      ${items}${freshHtml}${introExtras()}
      <div class="intro-goals"><b>Mục tiêu:</b>${goals}</div>
      <div class="row"><button class="btn ghost" data-act="to-map">◀ Bản đồ</button><button class="btn big" data-act="open-shop">Mở cửa tiệm!</button></div></div>`;
  }

  function introExtras() {
    const sp = S.special ? `<div class="intro-mission" style="background:#fff8e1;border-color:#f5c95a">
      <span class="art" style="width:40px;height:40px;flex:none">${A.pastry(S.special)}</span>
      <div><b>Bánh đặc biệt hôm nay:</b> ${G.pastries[S.special].name} — giá ×1.5, khách thích gọi hơn!</div></div>` : '';
    const ms = S.mission ? `<div class="intro-mission"><span style="font-size:24px">🎯</span>
      <div><b>Nhiệm vụ phụ:</b> ${S.mission.text} — thưởng ${coin(S.mission.reward)}</div></div>` : '';
    return sp + ms;
  }

  /* ---------- Nhiệm vụ phụ ---------- */
  function makeMission() {
    if (S.endless) return null;
    const idx = S.lvIdx, lv = S.lv;
    const custs = Math.round(lv.duration / ((lv.spawn[0] + lv.spawn[1]) / 2) * 0.6);
    const pool = [
      { type: 'noAngry', goal: 1, text: 'Không để khách nào bỏ về' },
      { type: 'combo', goal: 3 + Math.floor(idx / 2), text: g => `Đạt combo ×${g}` },
      { type: 'served', goal: custs, text: g => `Phục vụ ${g} khách` },
    ];
    if (lv.oven) pool.push({ type: 'perfect', goal: 2 + Math.floor(idx / 3), text: g => `${g} mẻ nướng hoàn hảo` });
    if (lv.gift) pool.push({ type: 'gift', goal: 2 + Math.floor(idx / 4), text: g => `Gói quà cho ${g} khách` });
    if (lv.vip) pool.push({ type: 'vip', goal: 2, text: g => `Phục vụ ${g} khách VIP` });
    if (S.special) pool.push({ type: 'special', goal: 3 + Math.floor(idx / 3), text: g => `Bán ${g} ${G.pastries[S.special].name}` });
    const m = pool[(idx * 7 + 3) % pool.length];
    return { type: m.type, goal: m.goal, text: typeof m.text === 'function' ? m.text(m.goal) : m.text, reward: 40 + idx * 10, done: false, failed: false };
  }

  function missionCur() {
    return { noAngry: S.angry, combo: S.bestCombo, served: S.served, perfect: S.perfectBakes, gift: S.gifts, vip: S.vips, special: S.specialSold }[S.mission.type];
  }

  function updateMission() {
    const m = S.mission, chip = $('#mission-chip');
    chip.hidden = !m;
    if (!m) return;
    if (m.type === 'noAngry') {
      if (!m.failed && S.angry > 0) { m.failed = true; banner('🎯 Nhiệm vụ phụ thất bại: có khách bỏ về'); }
    } else if (!m.done && missionCur() >= m.goal) {
      m.done = true;
      SFX.perfect();
      banner(`🎯 Xong nhiệm vụ phụ! +${m.reward} khi đóng cửa`);
    }
    const prog = m.done ? '✓' : m.type === 'noAngry' ? (m.failed ? '✗' : 'đang giữ…') : `${Math.min(missionCur(), m.goal)}/${m.goal}`;
    const txt = `🎯 ${m.text} · ${prog}`;
    if (chip.textContent !== txt) chip.textContent = txt;
    const cls = m.done ? 'done' : m.failed ? 'fail' : '';
    if (chip.className !== cls) chip.className = cls;
  }

  /* ---------- Mèo may mắn ---------- */
  function spawnCat() {
    const fromLeft = Math.random() < 0.5;
    const el = document.createElement('div');
    el.className = 'cat' + (fromLeft ? '' : ' flip');
    el.dataset.act = 'cat';
    el.innerHTML = `<div class="art">${A.cat(false)}</div>`;
    $('#cat-layer').appendChild(el);
    const anim = el.animate([{ left: fromLeft ? '-90px' : '1290px' }, { left: fromLeft ? '1290px' : '-90px' }], { duration: 8000, easing: 'linear', fill: 'forwards' });
    S.cat = { el, anim };
    anim.onfinish = () => { el.remove(); if (S.cat && S.cat.el === el) S.cat = null; };
    SFX.meow();
    floatText('🐱 Mèo may mắn ghé chơi!', 640, 120, 'gold');
  }

  function petCat() {
    if (!S || !S.running || S.paused || !S.cat || S.cat.petted) return;
    const { el, anim } = S.cat;
    S.cat.petted = true;
    el.classList.add('petted');
    el.querySelector('.art').innerHTML = A.cat(true);
    anim.updatePlaybackRate(2.5);
    SFX.meow();
    if (S.hearts < CFG.maxHearts) {
      S.hearts++;
      renderHearts();
      floatAt(el, '+1 ❤️ Mèo mang may mắn!', 'good', -50);
    } else {
      S.money += 15;
      floatAt(el, '+15 🐾', 'gold', -50);
    }
    stat('cats', 1);
  }

  function openShop() {
    closeModal();
    S.running = true;
    S.paused = false;
    SFX.door();
    banner('🏪 Tiệm mở cửa!');
    tutorial();
  }

  /* ---------- Dựng giao diện trong game ---------- */
  function buildGame() {
    const lv = S.lv;
    $('#hud-dayn').textContent = S.endless ? 'VÔ TẬN' : 'NGÀY ' + (S.lvIdx + 1);
    $('#hud-title').textContent = lv.title;
    $('#counter-slots').innerHTML = '';
    $('#box').innerHTML = Array.from({ length: CAP }, (_, i) => `<div class="cell" data-i="${i}"></div>`).join('');
    $('#box-ribbon .bow').innerHTML = A.giftBow();
    $('#reg-art').innerHTML = A.register();
    $('#hud-clock').classList.remove('warn');
    lastClock = '';
    $$('.gm').forEach((m, i) => {
      m.hidden = S.endless;
      m.classList.remove('on');
      if (!S.endless) m.style.left = (lv.targets[i] / lv.targets[2] * 100) + '%';
    });
    stage.classList.remove('bell-on');
    $('#cat-layer').innerHTML = '';
    buildCase();
    buildOven();
    buildExtras();
    renderBox();
    renderHearts();
    updateBell();
    updateHUD(0);
    $('#hint').hidden = true;
  }

  function buildCase() {
    const list = S.lv.pastries;
    const wrap = $('#case-items');
    wrap.classList.toggle('one-row', list.length <= 4);
    wrap.innerHTML = list.map(id => {
      const p = G.pastries[id];
      const sp = id === S.special;
      return `<div class="pcard ${sp ? 'special' : ''}" data-drag="pastry" data-id="${id}">
        <span class="stock"></span>
        ${S.lv.oven ? `<button class="bake-btn" data-act="bake" data-id="${id}">🔥 Nướng</button>` : ''}
        ${sp ? '<span class="special-tag">⭐ Đặc biệt ×1.5</span>' : ''}
        <div class="art">${A.pastry(id)}</div>
        <div class="tag"><b>${p.name}</b>${sp ? `<s>${p.price}</s>` : ''}${coin(priceOf(id))}</div></div>`;
    }).join('');
    list.forEach(renderStock);
  }

  function renderStock(id) {
    const card = $(`.pcard[data-id="${id}"]`);
    if (!card) return;
    const n = S.stock[id];
    const st = card.querySelector('.stock');
    st.hidden = n === Infinity;
    st.textContent = '×' + n;
    card.classList.toggle('empty', n === 0);
    card.classList.toggle('low', n > 0 && n <= 1);
  }

  function buildOven() {
    const o = $('#oven');
    if (!S.lv.oven) {
      o.innerHTML = '<div class="oven-locked">🔒 Lò nướng mở từ Ngày 2 — hôm nay bánh trong tủ không giới hạn!</div>';
      return;
    }
    o.innerHTML = '<div class="oven-label">🔥<b>LÒ<br>NƯỚNG</b></div>' + S.oven.map((_, i) =>
      `<div class="oven-slot" data-act="oven" data-slot="${i}"><div class="art"></div>
        <div class="oven-info"><span class="os-text"></span><div class="oven-meter"><i class="needle"></i></div></div></div>`).join('');
    S.oven.forEach((_, i) => renderOvenSlot(i));
  }

  const ovenEl = i => $('#oven').children[i + 1];
  function renderOvenSlot(i) {
    const s = S.oven[i], el = ovenEl(i);
    el.className = 'oven-slot' + (s ? ' busy' : '');
    el.querySelector('.art').innerHTML = s ? A.pastry(s.pid) : '';
    el.querySelector('.os-text').textContent = s ? `${G.pastries[s.pid].name} — đang nướng…` : 'Trống — bấm 🔥 Nướng ở tủ bánh';
    el.querySelector('.needle').style.left = '0%';
  }

  function buildExtras() {
    const lv = S.lv;
    const html = Object.keys(G.extras).map(id => {
      const on = lv.sauces.includes(id), e = G.extras[id];
      return `<div class="extra ${on ? '' : 'locked'}" ${on ? `data-drag="sauce" data-id="${id}"` : ''}>
        <div class="art">${A.extra(id)}</div><small>${on ? `${e.name}<br>${coin(e.price)}` : '🔒 Chưa mở'}</small></div>`;
    });
    html.push(`<div class="extra ${lv.gift ? '' : 'locked'}" ${lv.gift ? 'data-drag="gift"' : ''}>
      <div class="art">${A.gift()}</div><small>${lv.gift ? `Gói quà<br>${coin(G.giftPrice)}` : '🔒 Chưa mở'}</small></div>`);
    $('#extras').innerHTML = html.join('');
    renderBox();
  }

  /* ==========================================================
     HỘP BÁNH
     ========================================================== */
  const priceOf = id => Math.round(G.pastries[id].price * (id === S.special ? 1.5 : 1));

  function boxCounts() {
    const m = {};
    S.box.items.forEach(id => { m[id] = (m[id] || 0) + 1; });
    return m;
  }
  function boxValue() {
    let v = S.box.items.reduce((s, id) => s + priceOf(id), 0);
    if (S.box.sauce) v += G.extras[S.box.sauce].price;
    if (S.box.gift) v += G.giftPrice;
    return v;
  }

  function renderBox() {
    if (!S) return;
    const cells = $('#box').children;
    for (let i = 0; i < cells.length; i++) {
      const id = S.box.items[i] || '';
      if (cells[i].dataset.id !== id) {
        cells[i].dataset.id = id;
        cells[i].innerHTML = id ? `<div class="art">${A.pastry(id)}</div>` : '';
      }
    }
    const sauce = S.box.sauce && G.extras[S.box.sauce];
    $('#box-sauce').innerHTML = sauce ? A.drizzle(sauce.color, sauce.edge) : '';
    $('#box-ribbon').hidden = !S.box.gift;
    $('#box-info').innerHTML = `<span>${S.box.items.length}/${CAP} bánh</span><span>${coin(boxValue())}</span>`;
    $$('.extra[data-drag="sauce"]').forEach(e => e.classList.toggle('active', e.dataset.id === S.box.sauce));
    const g = $('.extra[data-drag="gift"]');
    if (g) g.classList.toggle('active', S.box.gift);
    updateOrderChecks();
    tutorial();
  }

  function addToBox(id, srcEl) {
    if (S.box.items.length >= CAP) {
      SFX.error(); shake($('#box-wrap')); floatAt($('#box-wrap'), 'Hộp đầy rồi!', 'bad');
      return;
    }
    if (S.stock[id] <= 0) {
      SFX.error(); shake(srcEl); floatAt(srcEl, 'Hết bánh! Nướng thêm nhé 🔥', 'bad');
      return;
    }
    S.stock[id]--;
    S.box.items.push(id);
    renderStock(id);
    renderBox();
    SFX.pop();
  }

  function removeFromBox(i) {
    const id = S.box.items[i];
    if (!id) return;
    S.box.items.splice(i, 1);
    S.stock[id]++;
    renderStock(id);
    renderBox();
    SFX.remove();
  }

  function setSauce(id) {
    S.box.sauce = S.box.sauce === id ? null : id;
    S.box.sauce ? SFX.sauce() : SFX.remove();
    renderBox();
  }

  function toggleGift() {
    S.box.gift = !S.box.gift;
    S.box.gift ? SFX.ribbon() : SFX.remove();
    renderBox();
  }

  function clearBox() {
    if (!S || !S.running || S.paused) return;
    if (!S.box.items.length && !S.box.sauce && !S.box.gift) return;
    S.box.items.forEach(id => { S.stock[id]++; renderStock(id); });
    S.box = { items: [], sauce: null, gift: false };
    renderBox();
    SFX.remove();
  }

  /* ==========================================================
     KHÁCH HÀNG
     ========================================================== */
  const SKINS = ['#ffe0c7', '#f6cfae', '#e8b58f', '#c98e66', '#a86f4c'];
  const HAIRS = ['#3b2418', '#6b4226', '#1f1a17', '#b5651d', '#e6c07b', '#8e44ad', '#d1495b', '#5d4037'];
  const SHIRTS = ['#81d4fa', '#a5d6a7', '#ffcc80', '#ce93d8', '#f48fb1', '#90caf9', '#fff59d', '#80cbc4'];

  function randomLook(type) {
    return {
      skin: pick(SKINS), hair: pick(HAIRS), style: randInt(0, 3), cap: pick(['#42a5f5', '#ef5350', '#66bb6a', '#ffa726']),
      shirt: type === 'vip' ? '#7b1fa2' : type === 'critic' ? '#546e7a' : pick(SHIRTS),
    };
  }

  function slotX(slot) {
    const n = S.lv.slots, w = Math.min(320, 1280 / n), left = (1280 - w * n) / 2;
    return left + slot * w + (w - 300) / 2;
  }

  function spawnCustomer(slot) {
    const lv = S.lv;
    let type = 'normal';
    const r = Math.random();
    if (r < lv.critic) type = 'critic';
    else if (r < lv.critic + lv.vip) type = 'vip';
    else if (r < lv.critic + lv.vip + lv.kid) type = 'kid';
    const T = G.customerTypes[type];

    const maxItems = Math.min(lv.maxItems, T.maxItems || 99, CAP);
    const n = randInt(1, maxItems);
    const kinds = shuffle(lv.pastries).slice(0, randInt(1, Math.min(lv.maxTypes, n)));
    if (S.special && lv.pastries.includes(S.special) && !kinds.includes(S.special) && Math.random() < 0.35) kinds[0] = S.special;
    const items = {};
    kinds.forEach(k => { items[k] = 1; });
    for (let i = kinds.length; i < n; i++) { const k = pick(kinds); items[k]++; }
    const sauce = lv.sauces.length && Math.random() < lv.sauceChance ? pick(lv.sauces) : null;
    const gift = lv.gift > 0 && Math.random() < lv.gift;
    const pMax = (lv.patience + n * 4 + (sauce ? 3 : 0) + (gift ? 3 : 0)) * T.patienceMul * (1 + 0.15 * upg('patience'));

    const c = { id: S.nextId++, slot, type, look: randomLook(type), items, sauce, gift, pMax, p: pMax, mood: 'happy', state: 'wait' };
    S.customers[slot] = c;

    const entries = Object.entries(items).map(([id, q]) => `<div class="oi" data-k="${id}"><div class="art">${A.pastry(id)}</div><b>×${q}</b></div>`).join('')
      + (sauce ? `<div class="oi" data-k="sauce:${sauce}"><div class="art">${A.extra(sauce)}</div><b>sốt</b></div>` : '')
      + (gift ? `<div class="oi" data-k="gift"><div class="art">${A.gift()}</div><b>quà</b></div>` : '');
    const el = document.createElement('div');
    el.className = `customer t-${type}`;
    el.dataset.act = 'serve';
    el.dataset.cid = c.id;
    el.style.left = slotX(slot) + 'px';
    el.innerHTML = `<div class="fig">${A.customer(c.look, 'happy', type)}</div>
      ${T.label ? `<div class="ctag">${T.label}</div>` : ''}
      <div class="bubble"><div class="order">${entries}</div><div class="pbar"><i></i></div></div>`;
    $('#counter-slots').appendChild(el);
    c.el = el;
    c.fig = el.querySelector('.fig');
    c.bar = el.querySelector('.pbar i');
    SFX.door();
    if (type === 'vip') banner('👑 Khách VIP đến! Phục vụ nhanh nhé!');
    if (type === 'critic') banner('🧐 Nhà phê bình ẩm thực ghé tiệm!');
    updateOrderChecks();
    tutorial();
  }

  function matches(c) {
    const m = boxCounts(), keys = Object.keys(c.items);
    if (Object.keys(m).length !== keys.length) return false;
    for (const k of keys) if (m[k] !== c.items[k]) return false;
    return (S.box.sauce || null) === (c.sauce || null) && !!S.box.gift === !!c.gift;
  }

  function mismatchReason(c) {
    const m = boxCounts();
    for (const k of Object.keys(c.items)) if ((m[k] || 0) < c.items[k]) return `Còn thiếu ${G.pastries[k].name}!`;
    for (const k of Object.keys(m)) if (m[k] > (c.items[k] || 0)) return `Thừa ${G.pastries[k].name}!`;
    if ((S.box.sauce || null) !== (c.sauce || null)) return c.sauce ? (S.box.sauce ? 'Sai loại sốt rồi!' : 'Quên rưới sốt!') : 'Không cần sốt đâu!';
    if (!!S.box.gift !== !!c.gift) return c.gift ? 'Chưa gói quà!' : 'Không cần gói quà!';
    return 'Sai món rồi!';
  }

  function updateOrderChecks() {
    if (!S) return;
    const m = boxCounts();
    for (const c of S.customers) {
      if (!c) continue;
      c.el.querySelectorAll('.oi').forEach(o => {
        const k = o.dataset.k;
        let st = '';
        if (k === 'gift') st = S.box.gift ? 'done' : '';
        else if (k.startsWith('sauce:')) st = S.box.sauce === k.slice(6) ? 'done' : S.box.sauce ? 'over' : '';
        else { const have = m[k] || 0, need = c.items[k]; st = have === need ? 'done' : have > need ? 'over' : ''; }
        o.className = 'oi ' + st;
      });
      c.el.classList.toggle('ready', matches(c));
    }
  }

  function serve(c) {
    if (!S.running || S.paused || !c || c.state !== 'wait') return;
    const bubble = c.el.querySelector('.bubble');
    if (!S.box.items.length) {
      SFX.error(); shake(bubble); floatAt(bubble, 'Hộp đang trống!', 'bad');
      return;
    }
    if (!matches(c)) {
      SFX.error(); shake(bubble);
      floatAt(bubble, mismatchReason(c), 'bad');
      c.p = Math.max(0.5, c.p - c.pMax * 0.2);
      if (S.combo >= 2) floatAt($('#hud-combo'), 'Mất combo!', 'bad', 30);
      S.combo = 0;
      updateHUD(0);
      return;
    }

    const T = G.customerTypes[c.type];
    const base = boxValue(), ratio = c.p / c.pMax;
    S.combo++;
    S.bestCombo = Math.max(S.bestCombo, S.combo);
    const comboMul = 1 + Math.min(S.combo - 1, 5) * 0.1;
    const tip = Math.round(base * (0.1 + 0.4 * ratio) * (1 + 0.25 * upg('tip')) * comboMul);
    let total = Math.round(base * T.payMul) + tip;
    if (c.type === 'critic' && ratio >= 0.5) {
      total += T.bonus;
      stat('critic', 1);
      setTimeout(() => floatAt(bubble, `⭐ Nhà phê bình khen ngon! +${T.bonus}`, 'gold', -40), 400);
    }
    S.money += total;
    S.tips += tip;
    S.served++;
    if (c.gift) S.gifts++;
    if (c.type === 'vip') S.vips++;
    if (S.special) S.specialSold += S.box.items.filter(id => id === S.special).length;
    stat('served', 1);
    if (c.gift) stat('gifts', 1);
    if (c.type === 'vip') stat('vip', 1);
    stat('maxCombo', S.combo, 'max');

    floatAt(bubble, `+${total}`, 'gold');
    if (S.combo >= 2) { floatAt(bubble, `Combo ×${S.combo}!`, 'good', 34); bump($('#hud-combo')); }
    flyCoins(bubble, $('#reg-money'), Math.min(8, 2 + Math.floor(total / 15)));
    setTimeout(() => { SFX.cash(); bump($('.reg-tag')); }, 600);

    S.box = { items: [], sauce: null, gift: false };
    customerLeave(c, true);
    renderBox();
    if (S.endless) rampEndless();
  }

  function customerLeave(c, happy) {
    c.state = 'leaving';
    S.customers[c.slot] = null;
    c.el.classList.add('leaving', happy ? 'leave-happy' : 'leave-angry');
    c.el.classList.remove('ready', 'need', 'impatient');
    c.fig.innerHTML = A.customer(c.look, happy ? 'love' : 'angry', c.type);
    setTimeout(() => c.el.remove(), 750);
    if (!happy) {
      S.angry++;
      S.combo = 0;
      SFX.angry();
      floatAt(c.el.querySelector('.bubble'), c.type === 'critic' ? '😤 Nhà phê bình bỏ về! −2 ❤️' : '😠 Khách bỏ về!', 'bad');
      loseHeart(G.customerTypes[c.type].heartLoss || 1);
    }
    if (S.spawnT > 2.5) S.spawnT = rand(1.5, 2.5);
    tutorial();
  }

  function loseHeart(n) {
    S.hearts = Math.max(0, S.hearts - n);
    renderHearts(true);
    if (S.hearts <= 0) endDay('hearts');
  }

  function renderHearts(broke) {
    const h = $('#hud-hearts');
    h.innerHTML = Array.from({ length: CFG.maxHearts }, (_, i) =>
      `<span class="${i >= S.hearts ? 'lost' : ''} ${broke && i === S.hearts ? 'break' : ''}">❤️</span>`).join('');
  }

  /* ==========================================================
     LÒ NƯỚNG
     ========================================================== */
  function bake(id) {
    if (!S || !S.running || S.paused || !S.lv.oven) return;
    const card = $(`.pcard[data-id="${id}"]`);
    if (S.stock[id] >= STOCK_CAP) { SFX.error(); floatAt(card, 'Tủ đầy rồi!', 'bad'); return; }
    const i = S.oven.indexOf(null);
    if (i < 0) { SFX.error(); shake($('#oven')); floatAt(card, 'Lò đang bận!', 'bad'); return; }
    S.oven[i] = { pid: id, t: 0, time: G.pastries[id].bake * (1 - 0.2 * upg('ovenSpeed')), st: 'baking' };
    S.bakedOnce = true;
    renderOvenSlot(i);
    ovenEl(i).classList.add('baking');
    SFX.bake();
    tutorial();
  }

  function takeOut(i) {
    if (!S || !S.running || S.paused) return;
    const s = S.oven[i], el = ovenEl(i);
    if (!s) return;
    if (s.st === 'burnt') {
      S.oven[i] = null; renderOvenSlot(i); SFX.remove(); floatAt(el, 'Dọn bánh cháy 💨', 'bad', -60);
      return;
    }
    if (s.st === 'baking') { SFX.error(); shake(el); floatAt(el, 'Chưa chín đâu!', 'bad', -60); return; }
    const batch = 4 + 2 * upg('batch');
    let add = batch;
    if (s.st === 'perfect') {
      add = batch + 1;
      S.perfectBakes++;
      stat('perfect', 1);
      S.money += 3;
      SFX.perfect();
      floatAt(el, `✨ Hoàn hảo! +${add} bánh, +3`, 'gold', -60);
    } else {
      add = batch - 1;
      SFX.ok();
      floatAt(el, `Hơi chín quá… +${add} bánh`, '', -60);
    }
    S.stock[s.pid] = Math.min(STOCK_CAP, S.stock[s.pid] + add);
    renderStock(s.pid);
    S.oven[i] = null;
    renderOvenSlot(i);
  }

  function tickOven(dt) {
    S.oven.forEach((s, i) => {
      if (!s) return;
      s.t += dt;
      const r = s.t / s.time, el = ovenEl(i);
      el.querySelector('.needle').style.left = Math.min(100, r / BURN * 100) + '%';
      const st = r < 1 ? 'baking' : r < PERFECT ? 'perfect' : r < BURN ? 'over' : 'burnt';
      if (st === s.st) return;
      s.st = st;
      el.classList.remove('baking', 'perfect', 'over', 'burnt');
      el.classList.add(st);
      const name = G.pastries[s.pid].name;
      el.querySelector('.os-text').textContent = {
        perfect: '✨ Lấy ra ngay!', over: `${name} — sắp cháy!`, burnt: 'Cháy mất rồi! Bấm để dọn',
      }[st];
      if (st === 'perfect') SFX.ok();
      if (st === 'burnt') SFX.burnt();
    });
  }

  /* ==========================================================
     CHUÔNG VÀNG
     ========================================================== */
  function useBell() {
    if (!S || !S.running || S.paused || S.bellT > 0) return;
    if (S.bellLeft <= 0) return;
    S.bellLeft--;
    S.bellT = BELL_TIME;
    stage.classList.add('bell-on');
    SFX.bell();
    banner(`🔔 Chuông vàng! Khách vui vẻ chờ thêm ${BELL_TIME} giây`);
    updateBell();
  }
  function updateBell() {
    const b = $('#btn-bell');
    b.hidden = !S.lv.bell;
    $('#bell-n').textContent = S.bellLeft;
    b.disabled = S.bellLeft <= 0;
  }

  /* ==========================================================
     GỢI Ý HƯỚNG DẪN
     ========================================================== */
  function tutorial() {
    if (!S) return;
    const h = $('#hint');
    $$('.need').forEach(e => e.classList.remove('need'));
    let msg = '';
    if (S.running && S.lv.tutorial && S.served < 3) {
      const c = S.customers.find(x => x && x.state === 'wait');
      if (!c) msg = '⏳ Chờ khách ghé tiệm nhé…';
      else if (matches(c)) { msg = '👉 Đủ món rồi! Chạm vào khách (hoặc kéo hộp tới khách) để giao.'; c.el.classList.add('need'); }
      else {
        msg = '👆 Chạm hoặc kéo bánh khách gọi vào hộp. Bỏ nhầm? Chạm bánh trong hộp để lấy ra.';
        const m = boxCounts();
        Object.keys(c.items).forEach(id => { if ((m[id] || 0) < c.items[id]) $(`.pcard[data-id="${id}"]`).classList.add('need'); });
      }
    } else if (S.running && S.lv.ovenTutorial && !S.bakedOnce && Object.values(S.stock).some(n => n <= 2)) {
      msg = '🔥 Bánh sắp hết! Bấm "Nướng", rồi bấm vào lò khi kim chạy vào vùng VÀNG.';
    }
    h.hidden = !msg;
    h.textContent = msg;
  }

  /* ==========================================================
     VÒNG LẶP GAME
     ========================================================== */
  function update(dt) {
    const lv = S.lv;
    S.time += dt;

    if (S.rushAt > 0 && S.time >= S.rushAt) {
      S.rushAt = -1; S.rushT = 15;
      banner('⚡ Giờ cao điểm! Khách kéo đến đông!');
      SFX.rush();
    }
    if (S.rushT > 0) S.rushT -= dt;
    if (S.bellT > 0) {
      S.bellT -= dt;
      if (S.bellT <= 0) stage.classList.remove('bell-on');
    }

    // mèo may mắn
    if (S.catAt.length && S.time >= S.catAt[0]) { S.catAt.shift(); spawnCat(); }
    if (S.endless && S.time >= S.catNext) { S.catNext += rand(45, 75); spawnCat(); }

    // khách mới
    S.spawnT -= dt;
    const free = [];
    S.customers.forEach((c, i) => { if (!c) free.push(i); });
    if (free.length === lv.slots && S.spawnT > 2) S.spawnT = 2;
    if (S.spawnT <= 0 && free.length) {
      spawnCustomer(pick(free));
      S.spawnT = rand(lv.spawn[0], lv.spawn[1]) * (S.rushT > 0 ? 0.45 : 1);
    }

    // kiên nhẫn
    for (const c of S.customers) {
      if (!c || c.state !== 'wait') continue;
      if (S.bellT <= 0) c.p -= dt;
      const r = Math.max(0, c.p / c.pMax);
      c.bar.style.width = (r * 100) + '%';
      c.bar.style.background = r > 0.6 ? '#4cbf7f' : r > 0.3 ? '#f5b83d' : '#e53950';
      const mood = r > 0.6 ? 'happy' : r > 0.3 ? 'neutral' : 'angry';
      if (mood !== c.mood) {
        c.mood = mood;
        c.fig.innerHTML = A.customer(c.look, mood, c.type);
        c.el.classList.toggle('impatient', mood === 'angry');
      }
      if (c.p <= 0) customerLeave(c, false);
      if (!S.running) return;
    }

    tickOven(dt);

    if (lv.duration !== Infinity) {
      const left = lv.duration - S.time;
      if (left <= 10 && !S.warned) {
        S.warned = true;
        $('#hud-clock').classList.add('warn');
        banner('⏰ Còn 10 giây là đóng cửa!');
      }
      if (left <= 0) { endDay('time'); return; }
    }
    updateHUD(dt);
  }

  let lastClock = '';
  function updateHUD(dt) {
    const lv = S.lv;
    S.shown += (S.money - S.shown) * Math.min(1, dt * 8);
    if (Math.abs(S.money - S.shown) < 0.5) S.shown = S.money;
    const shown = Math.round(S.shown);
    $('#reg-money').textContent = shown;

    // đồng hồ
    let hh, mm;
    if (S.endless) { hh = pad(Math.floor(S.time / 60)); mm = pad(Math.floor(S.time % 60)); }
    else {
      const mins = CFG.shopOpen * 60 + (CFG.shopClose - CFG.shopOpen) * 60 * Math.min(1, S.time / lv.duration);
      hh = pad(Math.floor(mins / 60)); mm = pad(Math.floor(mins % 60 / 10) * 10);
    }
    if (hh + mm !== lastClock) {
      const [oh, om] = [lastClock.slice(0, 2), lastClock.slice(2)];
      lastClock = hh + mm;
      const eh = $('#ck-h'), em = $('#ck-m');
      eh.textContent = hh; em.textContent = mm;
      if (oh && oh !== hh) { eh.classList.remove('flip'); void eh.offsetWidth; eh.classList.add('flip'); }
      if (om && om !== mm) { em.classList.remove('flip'); void em.offsetWidth; em.classList.add('flip'); }
    }

    // mục tiêu
    if (S.endless) {
      const best = Math.max(save.endlessBest, 1);
      $('#goal-fill').style.width = Math.min(100, S.money / best * 100) + '%';
      $('#goal-text').innerHTML = `${coin(shown)} · Kỷ lục ${coin(save.endlessBest)}`;
    } else {
      $('#goal-fill').style.width = Math.min(100, S.money / lv.targets[2] * 100) + '%';
      const next = lv.targets.find(t => S.money < t);
      $('#goal-text').innerHTML = next ? `${coin(shown)} / ${next}` : `${coin(shown)} ★★★`;
      lv.targets.forEach((t, i) => {
        if (!S.starHit[i] && S.money >= t) {
          S.starHit[i] = true;
          $$('.gm')[i].classList.add('on');
          SFX.star();
          banner(`⭐ Đạt ${i + 1} sao!`);
        }
      });
    }

    const combo = $('#hud-combo');
    combo.textContent = S.combo >= 2 ? `Combo ×${S.combo} 🔥` : '';
    updateMission();
  }

  let last = 0;
  function frame(ts) {
    requestAnimationFrame(frame);
    const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0;
    last = ts;
    if (S && S.running && !S.paused) update(dt);
  }
  requestAnimationFrame(frame);

  /* ==========================================================
     KẾT THÚC NGÀY
     ========================================================== */
  function endDay(reason) {
    if (S.ended) return;
    S.ended = true;
    S.running = false;
    stage.classList.remove('bell-on');
    $$('.need').forEach(e => e.classList.remove('need'));
    $('#hint').hidden = true;
    $('#cat-layer').innerHTML = '';
    S.cat = null;
    const m = S.mission;
    if (m && m.type === 'noAngry' && reason === 'time' && S.angry === 0) m.done = true;
    updateHUD(1);

    const lv = S.lv;
    let stars = 0, earned, title, sub, record = false;
    if (S.endless) {
      record = S.money > save.endlessBest;
      if (record) save.endlessBest = S.money;
      earned = S.money;
      title = record ? 'Kỷ lục mới!' : 'Hết giờ làm rồi!';
      sub = `Bạn đã phục vụ ${S.served} khách trong ${fmtTime(S.time)}.`;
    } else {
      const n = S.lvIdx + 1;
      stars = reason === 'time' ? lv.targets.filter(t => S.money >= t).length : 0;
      if (stars > 0) {
        save.stars[n] = Math.max(save.stars[n] || 0, stars);
        save.unlocked = Math.max(save.unlocked, n + 1);
      }
      save.best[n] = Math.max(save.best[n] || 0, S.money);
      earned = stars > 0 ? S.money : Math.floor(S.money / 2);
      title = stars === 3 ? 'Một ngày hoàn hảo!' : stars > 0 ? 'Một ngày thật ngọt ngào!' : reason === 'hearts' ? 'Khách buồn mất rồi…' : 'Chưa đạt mục tiêu…';
      sub = stars > 0 ? 'Good things come in pink 🎀'
        : reason === 'hearts' ? 'Có quá nhiều khách bỏ về. Thử lại nhé!'
        : `Cần ít nhất ${coin(lv.targets[0])} để qua ngày.`;
    }
    save.coins += earned;
    if (m && m.done) {
      save.coins += m.reward;
      save.missions[S.lvIdx + 1] = true;
      save.stats.missions = Object.keys(save.missions).length;
    }
    persist();
    checkAch();

    const win = S.endless || stars > 0;
    win ? SFX.win() : SFX.lose();
    const hasNext = !S.endless && stars > 0 && S.lvIdx + 1 < G.levels.length;
    const starsHtml = S.endless
      ? `<div class="stars-big" style="font-size:40px;color:var(--berry)">${coin(S.money)}</div>`
      : `<div class="stars-big">${[0, 1, 2].map(i => `<span class="st ${i < stars ? 'on' : ''}" style="animation-delay:${0.3 + i * 0.35}s">★</span>`).join('')}</div>`;

    setTimeout(() => {
      openModal(`<div class="result">
        <div class="result-bag">${A.bag(CFG.name)}</div>
        <div class="result-body">
          <h2 class="serif">${title}</h2><p class="sub">${sub}</p>
          ${starsHtml}
          <ul class="receipt">
            <li><span>Khách hài lòng</span><b>${S.served}</b></li>
            <li><span>Khách bỏ về</span><b>${S.angry}</b></li>
            <li><span>Combo cao nhất</span><b>×${S.bestCombo}</b></li>
            ${lv.oven ? `<li><span>Mẻ nướng hoàn hảo</span><b>${S.perfectBakes}</b></li>` : ''}
            <li><span>Tiền tip</span><b>${coin(S.tips)}</b></li>
            ${m ? `<li><span>🎯 ${m.text}</span><b>${m.done ? '✓ +' + coin(m.reward) : '✗'}</b></li>` : ''}
            <li class="total"><span>Tổng thu</span><b>${coin(S.money)}</b></li>
          </ul>
          <p class="earned">+${coin(earned)} vào két tiết kiệm${!win ? ' (một nửa vì chưa qua ngày)' : ''}</p>
          <div class="row">
            <button class="btn ghost small" data-act="to-map">🗺 Bản đồ</button>
            <button class="btn ghost small" data-act="to-upgrades">🛠 Nâng cấp</button>
            <button class="btn ${hasNext ? 'ghost small' : ''}" data-act="retry">↻ Chơi lại</button>
            ${hasNext ? '<button class="btn" data-act="next">Ngày tiếp theo ▶</button>' : ''}
          </div>
        </div></div>`, 'wide');
      for (let i = 0; i < stars; i++) setTimeout(SFX.star, 300 + i * 350);
      if (win) confetti();
    }, reason === 'hearts' ? 800 : 400);
  }

  function pause() {
    if (!S || !S.running || S.paused) return;
    S.paused = true;
    if (S.cat) S.cat.anim.pause();
    openModal(`<div class="pause-card"><h2 class="serif">Tạm nghỉ ☕</h2>
      <div class="row">
        <button class="btn" data-act="resume">▶ Tiếp tục</button>
        <button class="btn ghost" data-act="retry">↻ Chơi lại ngày này</button>
        <button class="btn ghost" data-act="help">❓ Cách chơi</button>
        <button class="btn ghost" data-act="to-map">🗺 Về bản đồ</button>
      </div></div>`);
  }

  function toggleMute() {
    save.muted = !save.muted;
    SFX.setMuted(save.muted);
    $('#btn-mute').textContent = save.muted ? '🔇' : '🔊';
    persist();
  }

  function resetProgress(btn) {
    if (!btn.classList.contains('confirm')) {
      btn.classList.add('confirm');
      btn.textContent = 'Bấm lần nữa để xoá toàn bộ tiến trình';
      return;
    }
    const muted = save.muted;
    save = defaults();
    save.muted = muted;
    persist();
    applyTheme();
    renderTitle();
  }

  /* ==========================================================
     ĐIỀU KHIỂN: BẤM NÚT
     ========================================================== */
  stage.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!b || b.disabled) return;
    const a = b.dataset.act;
    if (!['serve', 'bake', 'oven', 'cat'].includes(a)) SFX.click();
    switch (a) {
      case 'play': show('map'); break;
      case 'title': show('title'); break;
      case 'upgrades': prevScreen = current; show('upgrades'); break;
      case 'back': show(prevScreen === 'upgrades' ? 'title' : prevScreen); break;
      case 'help':
        if (S && S.paused && current === 'game') {
          openModal(helpHTML().replace('data-act="close"', 'data-act="pause-back"'));
        } else openModal(helpHTML());
        break;
      case 'pause-back': S.paused = false; pause(); break;
      case 'close': closeModal(); break;
      case 'day': startDay(+b.dataset.day); break;
      case 'endless': startDay('endless'); break;
      case 'open-shop': openShop(); break;
      case 'pause': pause(); break;
      case 'resume': closeModal(); S.paused = false; if (S.cat) S.cat.anim.play(); break;
      case 'retry': startDay(S.endless ? 'endless' : S.lvIdx); break;
      case 'next': startDay(S.lvIdx + 1); break;
      case 'to-map': closeModal(); if (S) { S.running = false; persist(); } show('map'); break;
      case 'to-upgrades': closeModal(); if (S) S.running = false; prevScreen = 'map'; show('upgrades'); break;
      case 'buy': buy(b.dataset.id); break;
      case 'tab': shopTab = b.dataset.tab; renderShop(); break;
      case 'theme': setTheme(b.dataset.id); break;
      case 'cat': petCat(); break;
      case 'mute': toggleMute(); break;
      case 'bell': useBell(); break;
      case 'clear': clearBox(); break;
      case 'bake': bake(b.dataset.id); break;
      case 'oven': takeOut(+b.dataset.slot); break;
      case 'serve': serve(S.customers.find(c => c && c.id === +b.dataset.cid)); break;
      case 'reset': resetProgress(b); break;
    }
  });

  /* ==========================================================
     ĐIỀU KHIỂN: KÉO THẢ (chuột + cảm ứng)
     ========================================================== */
  let drag = null;

  stage.addEventListener('pointerdown', e => {
    SFX.unlock();
    if (!S || !S.running || S.paused || current !== 'game') return;
    if (e.target.closest('button')) return;
    const src = e.target.closest('[data-drag]');
    if (!src) return;
    drag = { kind: src.dataset.drag, id: src.dataset.id, src, x0: e.clientX, y0: e.clientY, moved: false, ghost: null, cell: e.target.closest('.cell') };
  });

  function makeGhost(d) {
    const g = document.createElement('div');
    g.className = 'drag-ghost art';
    if (d.kind === 'pastry') g.innerHTML = A.pastry(d.id);
    else if (d.kind === 'sauce') g.innerHTML = A.extra(d.id);
    else if (d.kind === 'gift') g.innerHTML = A.gift();
    else {
      g.className = 'drag-ghost box-ghost';
      g.innerHTML = S.box.items.map(id => `<div class="art">${A.pastry(id)}</div>`).join('');
    }
    fx.appendChild(g);
    return g;
  }

  function dropTarget(x, y, d) {
    const el = document.elementFromPoint(x, y);
    if (!el) return null;
    if (d.kind === 'box') return el.closest('.customer:not(.leaving)');
    return el.closest('#box-wrap');
  }

  let hoverEl = null;
  function setHover(el) {
    if (hoverEl === el) return;
    if (hoverEl) hoverEl.classList.remove('drop-hover');
    hoverEl = el;
    if (el) el.classList.add('drop-hover');
  }

  addEventListener('pointermove', e => {
    if (!drag) return;
    if (!drag.moved) {
      if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 8) return;
      if (drag.kind === 'box' && !S.box.items.length) { drag = null; return; }
      drag.moved = true;
      drag.ghost = makeGhost(drag);
    }
    const p = toStage(e.clientX, e.clientY);
    drag.ghost.style.left = p.x + 'px';
    drag.ghost.style.top = p.y + 'px';
    setHover(dropTarget(e.clientX, e.clientY, drag));
  });

  function endDrag(e, cancelled) {
    if (!drag) return;
    const d = drag;
    drag = null;
    if (d.ghost) d.ghost.remove();
    setHover(null);
    if (cancelled || !S.running || S.paused) return;

    if (!d.moved) {
      if (d.kind === 'pastry') addToBox(d.id, d.src);
      else if (d.kind === 'sauce') setSauce(d.id);
      else if (d.kind === 'gift') toggleGift();
      else if (d.cell && d.cell.dataset.id) removeFromBox(+d.cell.dataset.i);
      return;
    }
    const t = dropTarget(e.clientX, e.clientY, d);
    if (!t) return;
    if (d.kind === 'box') serve(S.customers.find(c => c && c.id === +t.dataset.cid));
    else if (d.kind === 'pastry') addToBox(d.id, d.src);
    else if (d.kind === 'sauce') { if (S.box.sauce !== d.id) setSauce(d.id); }
    else if (d.kind === 'gift') { if (!S.box.gift) toggleGift(); }
  }
  addEventListener('pointerup', e => endDrag(e, false));
  addEventListener('pointercancel', e => endDrag(e, true));

  /* phím tắt */
  addEventListener('keydown', e => {
    if (current !== 'game' || !S) return;
    if (e.key === 'Escape') { if (S.paused && !$('#modal').hidden) { closeModal(); S.paused = false; if (S.cat) S.cat.anim.play(); } else pause(); }
    if (e.key === ' ') { e.preventDefault(); useBell(); }
    if (e.key === 'Backspace' || e.key === 'Delete') clearBox();
  });

  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });

  /* ---------- Khởi động ---------- */
  applyTheme();
  SFX.setMuted(save.muted);
  $('#btn-mute').textContent = save.muted ? '🔇' : '🔊';
  show('title');
})();
