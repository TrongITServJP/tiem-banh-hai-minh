/* ==========================================================
   HÌNH VẼ (SVG) — sẽ tự được thay khi điền `img` trong data.js
   ========================================================== */
(() => {
  const G = window.GAME;
  const svg = (inner, vb = '0 0 100 100') => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
  const shadow = (cy = 86, rx = 34) => `<ellipse cx="50" cy="${cy}" rx="${rx}" ry="7" fill="url(#tb-shadow)"/>`;
  const shine = (cx, cy, rx, ry, rot = -20, op = 0.55) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#tb-shine)" opacity="${op}" transform="rotate(${rot} ${cx} ${cy})"/>`;
  const img = (src, alt) => `<img src="${src}" alt="${alt}" draggable="false">`;

  /* Bảng màu chuyển sắc dùng chung — đặt 1 lần trong trang */
  const rg = (id, stops, cx = 0.42, cy = 0.35, r = 0.75) =>
    `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</radialGradient>`;
  const lg = (id, stops, x2 = 0, y2 = 1) =>
    `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</linearGradient>`;
  const DEFS = [
    rg('tb-shadow', [[0, '#5a1a2c', 0.32], [1, '#5a1a2c', 0]], 0.5, 0.5, 0.5),
    rg('tb-shine', [[0, '#fff', 0.95], [1, '#fff', 0]], 0.5, 0.5, 0.5),
    rg('tb-croi', [[0, '#ffe3a6'], [0.5, '#f0aa4c'], [1, '#b5621a']]),
    rg('tb-croi2', [[0, '#ffd88a'], [0.6, '#e8973a'], [1, '#a3520f']]),
    rg('tb-cookie', [[0, '#f6d29c'], [0.65, '#d99c5c'], [1, '#a8682f']]),
    rg('tb-choc', [[0, '#7a4524'], [1, '#2a1008']], 0.35, 0.3, 0.8),
    rg('tb-cinn', [[0, '#f0b673'], [0.6, '#cf8642'], [1, '#93501b']]),
    lg('tb-icing', [[0, '#ffffff'], [1, '#f1e2cf']]),
    rg('tb-dough', [[0, '#f7cf8c'], [0.7, '#df9f55'], [1, '#a86526']], 0.5, 0.4, 0.7),
    rg('tb-glaze', [[0, '#ffd0e0'], [0.55, '#f88bb2'], [1, '#e0628f']], 0.4, 0.3, 0.8),
    lg('tb-crust', [[0, '#f3c27a'], [1, '#b8742e']]),
    rg('tb-custard', [[0, '#fffbe6'], [1, '#f6d98e']], 0.5, 0.4, 0.7),
    rg('tb-berry', [[0, '#ff8a97'], [0.5, '#e8283f'], [1, '#9e0f24']], 0.35, 0.3, 0.8),
    rg('tb-mac', [[0, '#f2deff'], [0.6, '#cba2ec'], [1, '#9b6cc6']], 0.4, 0.3, 0.8),
    lg('tb-cream', [[0, '#fffdf8'], [1, '#efe0cc']]),
    lg('tb-wrap', [[0, '#fbc0d4'], [1, '#e27aa1']]),
    rg('tb-frost', [[0, '#ffffff'], [0.7, '#ffe3ee'], [1, '#f2b6cd']], 0.4, 0.3, 0.8),
    rg('tb-cherry', [[0, '#ff7088'], [0.6, '#d61a3c'], [1, '#86001a']], 0.35, 0.3, 0.8),
    rg('tb-puff', [[0, '#fbd896'], [0.6, '#e2a24f'], [1, '#a76220']], 0.4, 0.3, 0.8),
    lg('tb-glass', [[0, '#ffffff', 0.95], [1, '#fde7ef', 0.85]], 1, 0),
    lg('tb-lid', [[0, '#e84a86'], [1, '#a3134f']]),
    rg('tb-ribbon', [[0, '#ff6f86'], [0.6, '#d9243f'], [1, '#9c0d26']], 0.4, 0.3, 0.8),
    rg('tb-cat', [[0, '#ffc98a'], [1, '#f39a3c']], 0.4, 0.3, 0.8),
  ].join('');
  document.body.insertAdjacentHTML('afterbegin',
    `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${DEFS}</defs></svg>`);

  function spiral(cx, cy, r, turns) {
    let d = '';
    const steps = Math.round(turns * 28);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps, a = t * turns * Math.PI * 2, rr = 3 + (r - 3) * t;
      d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ' ' + (cy + rr * Math.sin(a) * 0.9).toFixed(1);
    }
    return d;
  }

  const berry = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M0 -7 C8 -8 10 1 0 10 C-10 1 -8 -8 0 -7Z" fill="url(#tb-berry)" stroke="#8a0c20" stroke-width=".8"/>
    <path d="M-5 -7 L-2 -11 L0 -8 L2 -11 L5 -7 L0 -5Z" fill="#3f9a42"/>
    <circle cx="-3" cy="0" r=".9" fill="#ffe7a0"/><circle cx="3" cy="1" r=".9" fill="#ffe7a0"/><circle cx="0" cy="5" r=".9" fill="#ffe7a0"/><circle cx="-1" cy="-3" r=".8" fill="#ffe7a0"/>
    <ellipse cx="-3" cy="-3" rx="2" ry="1.2" fill="#fff" opacity=".7"/></g>`;

  const sprinkles = list => list.map(([x, y, r, c]) =>
    `<rect x="${x - 3}" y="${y - 1.2}" width="6" height="2.4" rx="1.2" fill="${c}" transform="rotate(${r} ${x} ${y})"/>`).join('');

  const PASTRY = {
    croissant: () => shadow(84, 38) + `<g stroke="#9a4f12" stroke-width="1.6" stroke-linejoin="round">
      <path d="M8 66 Q4 52 19 45 Q28 60 24 73 Q12 75 8 66Z" fill="url(#tb-croi2)"/>
      <path d="M92 66 Q96 52 81 45 Q72 60 76 73 Q88 75 92 66Z" fill="url(#tb-croi2)"/>
      <path d="M19 45 Q27 31 39 32 Q44 54 38 75 Q28 76 24 73 Q28 60 19 45Z" fill="url(#tb-croi)"/>
      <path d="M81 45 Q73 31 61 32 Q56 54 62 75 Q72 76 76 73 Q72 60 81 45Z" fill="url(#tb-croi)"/>
      <path d="M39 32 Q50 22 61 32 Q66 54 62 75 Q50 81 38 75 Q34 54 39 32Z" fill="url(#tb-croi)"/></g>
      <path d="M43 40 Q50 44 57 40 M42 52 Q50 57 58 52 M42 64 Q50 69 58 64" stroke="#b5621a" stroke-width="1.6" fill="none" opacity=".7"/>
      <path d="M27 44 Q31 52 30 62 M73 44 Q69 52 70 62" stroke="#a3520f" stroke-width="1.4" fill="none" opacity=".6"/>
      ${shine(48, 36, 9, 4)}${shine(30, 46, 5, 3, -50, 0.45)}${shine(70, 46, 5, 3, 40, 0.35)}`,

    cookie: () => shadow(88, 36) + `<circle cx="50" cy="53" r="35" fill="url(#tb-cookie)" stroke="#9a5c26" stroke-width="1.6"/>
      <path d="M26 44 Q34 40 38 46 M58 70 Q64 66 70 70 M62 34 Q66 38 72 36" stroke="#b67838" stroke-width="1.5" fill="none" opacity=".7"/>` +
      [[38, 41, 5.5], [62, 37, 4.5], [53, 56, 6.5], [33, 62, 4.5], [68, 60, 5.5], [48, 75, 4.5], [74, 46, 3.5], [27, 49, 3.5]]
        .map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.82}" fill="url(#tb-choc)"/><ellipse cx="${x - r * 0.3}" cy="${y - r * 0.35}" rx="${r * 0.35}" ry="${r * 0.2}" fill="#fff" opacity=".35"/>`).join('') +
      [[44, 48], [58, 46], [40, 68], [60, 70], [30, 56]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1" fill="#fff6e0" opacity=".9"/>`).join('') +
      shine(40, 34, 12, 5, -25, 0.4),

    cinnamon: () => shadow(88, 36) + `<circle cx="50" cy="53" r="36" fill="url(#tb-cinn)" stroke="#86461a" stroke-width="1.6"/>
      <path d="${spiral(50, 53, 32, 3.2)}" stroke="#7a3c12" stroke-width="4.5" fill="none" stroke-linecap="round" opacity=".85"/>
      <path d="${spiral(50.8, 52, 32, 3.2)}" stroke="#f6c58a" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".6"/>
      <path d="M22 45 Q32 53 42 43 Q50 35 58 47 Q66 57 79 45" stroke="#d9c5ad" stroke-width="7" fill="none" stroke-linecap="round" opacity=".5" transform="translate(0 1.5)"/>
      <path d="M22 45 Q32 53 42 43 Q50 35 58 47 Q66 57 79 45" stroke="url(#tb-icing)" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M26 64 Q38 72 48 62 Q58 54 73 66" stroke="url(#tb-icing)" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M42 43 L41 50 M66 52 L67 58" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
      ${shine(38, 36, 10, 4, -25, 0.45)}`,

    donut: () => shadow(86, 38) + `<path fill-rule="evenodd" d="M13 55a37 31 0 1 0 74 0a37 31 0 1 0 -74 0Z M40 53a10 8 0 1 0 20 0a10 8 0 1 0 -20 0Z" fill="url(#tb-dough)" stroke="#9a5a1e" stroke-width="1.6"/>
      <path fill-rule="evenodd" d="M18 50 Q17 29 50 26 Q83 29 82 50 Q85 63 75 67 Q70 74 64 69 Q58 72 50 71 Q40 74 34 68 Q24 70 22 63 Q14 58 18 50Z M37 52a13 10 0 1 0 26 0a13 10 0 1 0 -26 0Z" fill="url(#tb-glaze)"/>
      <path d="M38 53 a12 8 0 0 0 24 0" stroke="#c94f7b" stroke-width="1.5" fill="none" opacity=".6"/>
      ${shine(36, 34, 11, 4, -15, 0.7)}${shine(70, 42, 4, 2, 30, 0.5)}` +
      sprinkles([[29, 46, 20, '#fff59d'], [42, 36, -30, '#81d4fa'], [60, 35, 40, '#fff'], [71, 46, -10, '#a5d6a7'], [69, 60, 60, '#fff59d'], [52, 66, 0, '#81d4fa'], [32, 60, -50, '#fff'], [56, 29, 80, '#ce93d8'], [24, 54, 70, '#ce93d8'], [77, 55, -30, '#fff']]),

    tart: () => shadow(86, 40) + `<path d="M9 54 L16 73 Q50 88 84 73 L91 54 Z" fill="url(#tb-crust)" stroke="#9a5f22" stroke-width="1.6"/>
      <path d="M17 60 L20 71 M28 65 L30 76 M40 67 L41 79 M52 67 L52 80 M64 67 L63 79 M76 64 L74 75 M85 58 L83 68" stroke="#a96a2a" stroke-width="2" opacity=".7"/>
      <ellipse cx="50" cy="54" rx="41" ry="15.5" fill="#e9b268" stroke="#9a5f22" stroke-width="1.6"/>
      <ellipse cx="50" cy="54" rx="35" ry="11.5" fill="url(#tb-custard)"/>` +
      berry(31, 51) + berry(50, 47) + berry(69, 51) + berry(40, 58, 0.95) + berry(60, 58, 0.95) +
      `<path d="M47 56 q3 -5 7 -3 q-2 4 -7 3Z" fill="#6fbf5f"/>${shine(30, 46, 7, 2.5, -10, 0.5)}`,

    macaron: () => shadow(84, 36) + `<ellipse cx="50" cy="64" rx="35" ry="13.5" fill="url(#tb-mac)" stroke="#8a5bb5" stroke-width="1.6"/>
      <path d="M16 63 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0" stroke="#a679cf" stroke-width="2" fill="none" transform="translate(0 -7)"/>
      <rect x="17" y="49" width="66" height="12" rx="6" fill="url(#tb-cream)" stroke="#e3cfb4" stroke-width="1"/>
      <path d="M16 50 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0 q3 3 6 0" stroke="#b78bdd" stroke-width="2" fill="none"/>
      <ellipse cx="50" cy="39" rx="35" ry="15.5" fill="url(#tb-mac)" stroke="#8a5bb5" stroke-width="1.6"/>
      ${shine(39, 33, 13, 4.5, -8, 0.75)}${shine(66, 66, 6, 2, 0, 0.35)}`,

    cupcake: () => shadow(90, 30) + `<path d="M23 56 L31 89 L69 89 L77 56 Z" fill="url(#tb-wrap)" stroke="#b9507a" stroke-width="1.6"/>
      <path d="M33 58 L37 88 M43 58 L45 88 M57 58 L55 88 M67 58 L63 88" stroke="#d66a93" stroke-width="2.5"/>
      <path d="M19 58 Q12 46 27 42 Q25 29 42 30 Q46 16 61 25 Q78 23 73 40 Q89 44 81 58 Q50 67 19 58Z" fill="url(#tb-frost)" stroke="#e39ab9" stroke-width="1.6"/>
      <path d="M28 51 Q42 45 54 52 Q64 56 74 50 M38 39 Q50 34 64 40" stroke="#f3bcd2" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${shine(36, 36, 9, 4, -20, 0.8)}
      <path d="M56 19 Q58 9 67 7" stroke="#557a26" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="56" cy="21" r="7.5" fill="url(#tb-cherry)"/>${shine(53.5, 18.5, 2.6, 1.6, -30, 0.95)}` +
      sprinkles([[33, 48, 30, '#81d4fa'], [62, 50, -20, '#fff59d'], [45, 41, 70, '#a5d6a7'], [71, 46, 10, '#ce93d8'], [52, 56, 50, '#81d4fa']]),

    puff: () => shadow(84, 38) + `<path d="M13 62 Q11 40 33 35 Q40 21 56 27 Q77 25 83 44 Q93 58 81 71 Q50 81 19 73 Q11 68 13 62Z" fill="url(#tb-puff)" stroke="#9a5a1e" stroke-width="1.6"/>
      <path d="M16 60 Q50 73 86 57 Q83 68 50 72 Q23 71 16 60Z" fill="url(#tb-cream)" stroke="#e3cfb4" stroke-width="1"/>
      <path d="M30 44 Q38 37 48 40 M56 33 Q66 33 72 42 M24 56 Q30 50 38 52" stroke="#b9772f" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".7"/>
      ${shine(42, 34, 12, 5, -15, 0.55)}` +
      [[32, 40], [44, 33], [58, 30], [70, 37], [38, 49], [62, 45], [52, 41], [76, 51], [28, 52], [66, 54]]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.7" fill="#fff" opacity=".95"/>`).join(''),
  };

  const GIFT = `<path d="M50 52 L30 86 L40 84 L44 92 L52 58Z" fill="#a8132f"/>
    <path d="M50 52 L70 86 L60 84 L56 92 L48 58Z" fill="#a8132f"/>
    <path d="M50 50 Q22 18 12 40 Q8 62 50 52Z" fill="url(#tb-ribbon)" stroke="#8a0c22" stroke-width="1.6"/>
    <path d="M50 50 Q78 18 88 40 Q92 62 50 52Z" fill="url(#tb-ribbon)" stroke="#8a0c22" stroke-width="1.6"/>
    <path d="M50 50 Q30 34 22 42 M50 50 Q70 34 78 42" stroke="#8a0c22" stroke-width="1.4" fill="none" opacity=".6"/>
    <ellipse cx="50" cy="51" rx="9" ry="8" fill="url(#tb-ribbon)" stroke="#8a0c22" stroke-width="1.6"/>
    ${shine(24, 36, 6, 2.5, -40, 0.6)}${shine(72, 34, 5, 2, 40, 0.5)}${shine(47, 48, 3, 1.5, 0, 0.6)}`;

  const cache = {};

  G.art = {
    pastry(id) {
      const p = G.pastries[id];
      if (p.img) return img(p.img, p.name);
      return cache[id] || (cache[id] = svg(PASTRY[id]()));
    },

    extra(id) {
      const e = G.extras[id];
      if (e.img) return img(e.img, e.name);
      return svg(shadow(90, 28) + `<path d="M62 22 L77 3" stroke="#b98a5e" stroke-width="5" stroke-linecap="round"/>
        <path d="M26 34 Q22 84 32 88 L68 88 Q78 84 74 34Z" fill="url(#tb-glass)" stroke="#e2adc0" stroke-width="2"/>
        <path d="M28 52 Q26 82 34 85 L66 85 Q74 82 72 52 Q50 58 28 52Z" fill="${e.color}" stroke="${e.edge}" stroke-width="1.5"/>
        <path d="M28 52 Q50 58 72 52 Q50 62 28 52Z" fill="#fff" opacity=".35"/>
        <rect x="21" y="21" width="58" height="15" rx="6" fill="url(#tb-lid)"/>
        <rect x="24" y="23" width="52" height="4" rx="2" fill="#fff" opacity=".35"/>
        <rect x="38" y="62" width="24" height="14" rx="4" fill="#fff8f1" opacity=".9"/>
        <path d="M33 42 L33 76" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>`);
    },

    gift() { return svg(shadow(90, 28) + GIFT); },
    giftBow() { return svg(GIFT); },

    drizzle(color, edge) {
      const d = 'M12 30 Q36 6 52 34 T96 30 T140 36 T184 28 T228 36 T288 30 M20 96 Q44 70 64 100 T110 96 T156 102 T200 92 T246 102 T290 94';
      return `<svg viewBox="0 0 300 130" preserveAspectRatio="none"><path d="${d}" stroke="${edge}" stroke-width="6" fill="none" stroke-linecap="round" opacity=".5"/><path d="${d}" stroke="${color}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".9"/></svg>`;
    },

    cat(happy) {
      const eyes = happy
        ? '<path d="M38 40 q4 -5 8 0 M54 40 q4 -5 8 0" stroke="#3a2626" stroke-width="2.6" fill="none" stroke-linecap="round"/>'
        : '<ellipse cx="42" cy="40" rx="3" ry="4" fill="#3a2626"/><ellipse cx="58" cy="40" rx="3" ry="4" fill="#3a2626"/><circle cx="43" cy="38.5" r="1.1" fill="#fff"/><circle cx="59" cy="38.5" r="1.1" fill="#fff"/>';
      return svg(`<ellipse cx="50" cy="94" rx="30" ry="5" fill="url(#tb-shadow)"/>
        <path d="M76 86 Q98 80 92 58 Q90 50 84 54 Q90 70 72 78Z" fill="#f39a3c" stroke="#b8651a" stroke-width="1.5"/>
        <path d="M26 92 Q22 60 50 58 Q78 60 74 92Z" fill="url(#tb-cat)" stroke="#b8651a" stroke-width="1.5"/>
        <path d="M40 70 Q50 66 60 70 M38 80 Q50 76 62 80" stroke="#e07f22" stroke-width="3" fill="none" stroke-linecap="round"/>
        <ellipse cx="50" cy="86" rx="13" ry="7" fill="#fff4e6"/>
        <path d="M27 30 L24 8 L42 22Z M73 30 L76 8 L58 22Z" fill="#f39a3c" stroke="#b8651a" stroke-width="1.5" stroke-linejoin="round"/>
        <path d="M29 26 L27 14 L37 22Z M71 26 L73 14 L63 22Z" fill="#ffb8c8"/>
        <ellipse cx="50" cy="40" rx="27" ry="23" fill="url(#tb-cat)" stroke="#b8651a" stroke-width="1.5"/>
        <path d="M44 20 L46 28 M50 18 L50 27 M56 20 L54 28" stroke="#e07f22" stroke-width="2.4" stroke-linecap="round"/>
        ${eyes}
        <path d="M48 47 L52 47 L50 49.5Z" fill="#e8607e"/>
        <path d="M50 49.5 Q47 53 44 51 M50 49.5 Q53 53 56 51" stroke="#3a2626" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <path d="M30 46 L18 44 M30 50 L18 52 M70 46 L82 44 M70 50 L82 52" stroke="#3a2626" stroke-width="1.2" opacity=".6"/>
        <ellipse cx="36" cy="49" rx="4" ry="2.4" fill="#ff8aa0" opacity=".5"/><ellipse cx="64" cy="49" rx="4" ry="2.4" fill="#ff8aa0" opacity=".5"/>
        <circle cx="50" cy="62" r="4" fill="#f5b83d" stroke="#c98a00" stroke-width="1"/>
        ${happy ? '<path d="M80 18 c-3 -5 -10 -2 -7 3 l7 7 l7 -7 c3 -5 -4 -8 -7 -3Z" fill="#e91e63"/>' : ''}`);
    },

    customer(look, mood, type) {
      const { skin, hair, shirt, style, cap } = look;
      const ink = '#3a2626';
      let back = '', front, acc = '';
      if (style === 1) back = `<path d="M28 62 Q24 24 60 22 Q96 24 92 62 L95 116 Q60 122 25 116Z" fill="${hair}"/>`;
      if (style === 2) back = `<circle cx="60" cy="27" r="13" fill="${hair}"/>`;
      front = [
        `<path d="M29 62 Q26 28 60 28 Q94 28 91 62 Q86 44 72 42 Q62 50 44 44 Q34 48 29 62Z" fill="${hair}"/>`,
        `<path d="M29 60 Q30 28 60 28 Q90 28 91 60 Q80 42 60 42 Q40 42 29 60Z" fill="${hair}"/>`,
        `<path d="M29 60 Q28 32 60 32 Q92 32 91 60 Q84 44 60 44 Q36 44 29 60Z" fill="${hair}"/>`,
        [[34, 52], [42, 40], [54, 34], [66, 34], [78, 40], [86, 52]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="11" fill="${hair}"/>`).join(''),
      ][style];

      const happy = mood === 'happy' || mood === 'love';
      let eyes = happy
        ? `<path d="M45 66 q5 -6 10 0 M65 66 q5 -6 10 0" stroke="${ink}" stroke-width="3" fill="none" stroke-linecap="round"/>`
        : `<circle cx="50" cy="65" r="3.6" fill="${ink}"/><circle cx="70" cy="65" r="3.6" fill="${ink}"/><circle cx="51" cy="64" r="1.1" fill="#fff"/><circle cx="71" cy="64" r="1.1" fill="#fff"/>`;
      if (mood === 'angry') eyes += `<path d="M42 55 L56 60 M78 55 L64 60" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>`;
      const mouth = {
        love: `<path d="M49 75 Q60 92 71 75Z" fill="#c2185b"/>`,
        happy: `<path d="M50 77 Q60 86 70 77" stroke="#7a2d2d" stroke-width="3" fill="none" stroke-linecap="round"/>`,
        neutral: `<path d="M52 80 L68 80" stroke="#7a2d2d" stroke-width="3" stroke-linecap="round"/>`,
        angry: `<path d="M50 84 Q60 75 70 84" stroke="#7a2d2d" stroke-width="3" fill="none" stroke-linecap="round"/>`,
      }[mood];
      const blush = `<ellipse cx="42" cy="75" rx="5" ry="3" fill="#ff7a90" opacity="${mood === 'angry' ? 0.75 : 0.4}"/><ellipse cx="78" cy="75" rx="5" ry="3" fill="#ff7a90" opacity="${mood === 'angry' ? 0.75 : 0.4}"/>`;

      if (type === 'vip') acc += `<path d="M42 32 L45 14 L53 24 L60 9 L67 24 L75 14 L78 32Z" fill="#f5b83d" stroke="#c98a00" stroke-width="2" stroke-linejoin="round"/><circle cx="60" cy="24" r="3" fill="#e91e63"/>`;
      if (type === 'critic') {
        front = `<path d="M29 58 Q30 36 60 36 Q90 36 91 58 Q80 46 60 46 Q40 46 29 58Z" fill="${hair}"/><ellipse cx="56" cy="36" rx="31" ry="10" fill="#37474f"/><circle cx="56" cy="26" r="3.5" fill="#37474f"/>`;
        acc += `<g fill="none" stroke="#222" stroke-width="2.5"><circle cx="50" cy="65" r="8"/><circle cx="70" cy="65" r="8"/><path d="M58 65 L62 65"/></g>
          <path d="M49 76 Q55 71 60 75 Q65 71 71 76 Q65 80 60 77 Q55 80 49 76Z" fill="#4e342e"/>
          <rect x="88" y="112" width="22" height="28" rx="3" fill="#fff" stroke="#90a4ae" stroke-width="2" transform="rotate(10 99 126)"/>`;
      }
      if (type === 'kid') front = `<path d="M30 54 Q30 28 60 28 Q90 28 90 54Z" fill="${cap}"/><path d="M60 50 L102 52 Q98 59 60 56Z" fill="${cap}" opacity=".85"/><circle cx="60" cy="28" r="4" fill="#fff"/>`;
      if (mood === 'angry') acc += `<path d="M88 34 l7 7 m0 -7 l-7 7" stroke="#e53935" stroke-width="3" stroke-linecap="round"/>`;
      if (mood === 'love') acc += `<path d="M98 30 c-4 -6 -12 -2 -8 4 l8 8 l8 -8 c4 -6 -4 -10 -8 -4Z" fill="#e91e63"/>`;

      return svg(`${back}
        <path d="M16 150 Q16 108 60 104 Q104 108 104 150Z" fill="${shirt}"/>
        <path d="M46 106 L60 118 L74 106" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/>
        <rect x="52" y="86" width="16" height="20" rx="6" fill="${skin}"/>
        <circle cx="30" cy="68" r="6" fill="${skin}"/><circle cx="90" cy="68" r="6" fill="${skin}"/>
        <circle cx="60" cy="64" r="30" fill="${skin}"/>
        ${front}${eyes}${blush}${mouth}${acc}`, '0 0 120 150');
    },

    bag(name) {
      const w = name.split(' '), h = Math.ceil(w.length / 2);
      const l1 = w.slice(0, h).join(' '), l2 = w.slice(h).join(' ');
      return svg(`<ellipse cx="100" cy="228" rx="80" ry="8" fill="#5a1a2c" opacity=".12"/>
        <path d="M68 76 Q66 26 100 26 Q134 26 132 76" fill="none" stroke="#d48aa3" stroke-width="7" stroke-linecap="round"/>
        <path d="M34 72 L166 72 L178 224 L22 224Z" fill="#f9c6d6" stroke="#e79ab3" stroke-width="3" stroke-linejoin="round"/>
        <path d="M150 72 L166 72 L178 224 L160 224Z" fill="#f2adc3"/>
        <circle cx="100" cy="152" r="48" fill="#fff8f1" stroke="#c2185b" stroke-width="3"/>
        <text x="100" y="148" text-anchor="middle" font-family="Playfair Display, Georgia, serif" font-style="italic" font-weight="700" font-size="17" fill="#8c1d40">${l1}</text>
        <text x="100" y="172" text-anchor="middle" font-family="Playfair Display, Georgia, serif" font-style="italic" font-weight="700" font-size="20" fill="#8c1d40">${l2}</text>
        <g transform="translate(58 34) scale(.84)">${GIFT}</g>`, '0 0 200 240');
    },

    register() {
      let keys = '';
      for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) keys += `<circle cx="${32 + c * 14}" cy="${62 + r * 10}" r="4.2" fill="#fff8f1" stroke="#c2185b" stroke-width="1"/>`;
      return svg(`<ellipse cx="60" cy="106" rx="50" ry="4" fill="#5a1a2c" opacity=".15"/>
        <path d="M14 50 L106 50 L100 104 L20 104Z" fill="#f48fb1" stroke="#c2185b" stroke-width="2.5" stroke-linejoin="round"/>
        <rect x="30" y="16" width="60" height="28" rx="6" fill="#f8bbd0" stroke="#c2185b" stroke-width="2.5"/>
        <rect x="36" y="22" width="48" height="16" rx="3" fill="#fff8f1"/>
        <rect x="54" y="44" width="12" height="7" fill="#c2185b"/>
        ${keys}
        <rect x="22" y="90" width="76" height="12" rx="3" fill="#ec7fa4" stroke="#c2185b" stroke-width="1.5"/>
        <circle cx="60" cy="96" r="2.5" fill="#fff8f1"/>
        <path d="M106 60 L114 52" stroke="#c2185b" stroke-width="4" stroke-linecap="round"/><circle cx="115" cy="51" r="4" fill="#f5b83d"/>`, '0 0 120 110');
    },
  };
})();
