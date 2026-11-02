/* ==========================================================
   ÂM THANH — tạo bằng Web Audio, không cần file âm thanh
   ========================================================== */
(() => {
  const G = window.GAME;
  let ctx = null, master = null, muted = false;

  function unlock() {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        master = ctx.createGain();
        master.gain.value = 0.8;
        master.connect(ctx.destination);
      } catch (e) { return; }
    }
    if (ctx.state === 'suspended') ctx.resume();
  }

  function tone(freq, dur, type = 'sine', vol = 0.15, delay = 0, slideTo) {
    if (muted || !ctx) return;
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.05);
  }
  const seq = (notes, step, type, vol) => notes.forEach((f, i) => f && tone(f, step * 1.6, type, vol, i * step));

  G.sfx = {
    unlock,
    setMuted(m) { muted = m; },
    click:   () => tone(520, 0.05, 'triangle', 0.08),
    pop:     () => tone(600, 0.08, 'triangle', 0.14, 0, 900),
    remove:  () => tone(500, 0.08, 'triangle', 0.1, 0, 300),
    cash:    () => { tone(1568, 0.08, 'square', 0.05); tone(2093, 0.3, 'triangle', 0.12, 0.07); },
    error:   () => tone(200, 0.2, 'sawtooth', 0.07, 0, 140),
    angry:   () => tone(330, 0.35, 'sawtooth', 0.07, 0, 160),
    ok:      () => seq([660, 880], 0.08, 'triangle', 0.1),
    perfect: () => seq([784, 988, 1175, 1568], 0.07, 'triangle', 0.12),
    burnt:   () => tone(140, 0.5, 'sawtooth', 0.06, 0, 80),
    bake:    () => tone(300, 0.15, 'sine', 0.1, 0, 500),
    bell:    () => { tone(1318, 1.2, 'sine', 0.15); tone(1976, 1, 'sine', 0.08, 0.02); },
    star:    () => seq([1046, 1318, 1568], 0.06, 'triangle', 0.12),
    win:     () => seq([523, 659, 784, 1046, 0, 784, 1046], 0.12, 'triangle', 0.13),
    lose:    () => seq([523, 466, 415, 349], 0.18, 'triangle', 0.12),
    sauce:   () => tone(250, 0.18, 'sine', 0.12, 0, 120),
    ribbon:  () => seq([880, 1175], 0.06, 'sine', 0.1),
    rush:    () => seq([660, 880, 660, 880], 0.09, 'square', 0.05),
    door:    () => seq([1318, 1046], 0.12, 'sine', 0.07),
    meow:    () => { tone(650, 0.14, 'sine', 0.1, 0, 950); tone(950, 0.35, 'sine', 0.1, 0.12, 520); },
  };

  // Nhạc nền hộp nhạc nhẹ nhàng
  const melody = [523, 659, 784, 659, 587, 698, 880, 698, 523, 659, 784, 1046, 988, 784, 659, 587];
  const bass = [131, 175, 147, 196];
  let musicOn = false, step = 0, timer = null;
  G.sfx.music = on => {
    musicOn = on;
    if (on && !timer) {
      timer = setInterval(() => {
        if (!musicOn || muted || !ctx) return;
        tone(melody[step % melody.length], 0.5, 'sine', 0.03);
        if (step % 4 === 0) tone(bass[(step / 4) % bass.length], 1.1, 'triangle', 0.035);
        step++;
      }, 300);
    }
    if (!on && timer) { clearInterval(timer); timer = null; }
  };
})();
