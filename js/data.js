/* ==========================================================
   CẤU HÌNH GAME — chỉnh tên tiệm, bánh, giá, màn chơi ở đây
   ========================================================== */
window.GAME = window.GAME || {};

GAME.config = {
  name: 'Tiệm Bánh Hải Minh',
  tagline: 'Ngọt ngào mỗi ngày — kéo bánh, gói quà, làm khách vui!',
  boxSize: 6,          // số ô trong hộp bánh
  maxHearts: 3,        // số tim mỗi ngày
  shopOpen: 8,         // giờ mở cửa (đồng hồ trong game)
  shopClose: 18,       // giờ đóng cửa
};

/* Các loại bánh.
   img: để trống '' thì game tự vẽ hình. Khi có ảnh thật, điền đường dẫn,
   ví dụ img: 'assets/images/croissant.png' (nên dùng PNG nền trong suốt, hình vuông). */
GAME.pastries = {
  croissant: { name: 'Bánh sừng bò',    price: 12, bake: 6, img: '' },
  cookie:    { name: 'Bánh quy socola', price: 8,  bake: 4, img: '' },
  cinnamon:  { name: 'Bánh cuộn quế',   price: 10, bake: 5, img: '' },
  donut:     { name: 'Donut dâu',       price: 9,  bake: 4, img: '' },
  tart:      { name: 'Tart dâu tây',    price: 15, bake: 7, img: '' },
  macaron:   { name: 'Macaron',         price: 7,  bake: 3, img: '' },
  cupcake:   { name: 'Cupcake',         price: 11, bake: 5, img: '' },
  puff:      { name: 'Bánh su kem',     price: 9,  bake: 4, img: '' },
};

/* Sốt rưới lên hộp bánh */
GAME.extras = {
  cream:  { name: 'Sốt kem tươi', price: 5, color: '#fff6e6', edge: '#d9bf9a', img: '' },
  choco:  { name: 'Sốt socola',   price: 6, color: '#6b3a1e', edge: '#3e1f0c', img: '' },
  matcha: { name: 'Sốt matcha',   price: 7, color: '#9cc35a', edge: '#5f8a2a', img: '' },
};
GAME.giftPrice = 6;

/* Loại khách */
GAME.customerTypes = {
  normal: { label: '',             patienceMul: 1,    payMul: 1 },
  kid:    { label: 'Bé con',       patienceMul: 1.25, payMul: 1, maxItems: 2 },
  vip:    { label: '👑 VIP',       patienceMul: 0.7,  payMul: 2 },
  critic: { label: '🧐 Phê bình',  patienceMul: 0.85, payMul: 1.5, bonus: 40, heartLoss: 2 },
};

/* Nâng cấp mua bằng tiền tiết kiệm */
GAME.upgrades = [
  { id: 'patience',  icon: '🎵', name: 'Nhạc nền êm dịu',  desc: 'Khách kiên nhẫn hơn 15% mỗi cấp.',      costs: [80, 180, 350] },
  { id: 'tip',       icon: '🫙', name: 'Hũ tiền tip xinh', desc: 'Tiền tip tăng 25% mỗi cấp.',             costs: [100, 220, 400] },
  { id: 'ovenSpeed', icon: '🔥', name: 'Lò nướng turbo',   desc: 'Nướng nhanh hơn 20% mỗi cấp.',           costs: [90, 200, 380] },
  { id: 'ovenSlot',  icon: '🧺', name: 'Thêm khay lò',     desc: 'Nướng thêm 1 mẻ cùng lúc mỗi cấp.',      costs: [150, 350] },
  { id: 'batch',     icon: '🥐', name: 'Mẻ bánh lớn',      desc: 'Mỗi mẻ nướng ra thêm 2 bánh.',          costs: [120, 260] },
  { id: 'bell',      icon: '🔔', name: 'Chuông vàng phụ',  desc: 'Thêm 1 lần dùng Chuông vàng mỗi ngày.',  costs: [200] },
];

/* ---------- Màn chơi (mỗi màn = 1 ngày) ---------- */
const LV = o => Object.assign({
  duration: 90,        // số giây thật của 1 ngày
  slots: 2,            // số khách đứng quầy cùng lúc
  spawn: [6, 9],       // khoảng giây giữa 2 khách
  maxItems: 2,         // số bánh tối đa trong 1 đơn
  maxTypes: 2,         // số loại bánh tối đa trong 1 đơn
  sauces: [], sauceChance: 0,
  gift: 0,             // tỉ lệ khách muốn gói quà
  oven: false,         // bật giới hạn số bánh + lò nướng
  startStock: 5,
  vip: 0, critic: 0, kid: 0.2,
  patience: 30,        // giây chờ cơ bản (+4 giây mỗi bánh trong đơn)
  rush: false,         // giờ cao điểm
  bell: 0,             // số lần dùng chuông vàng
  intro: [],
}, o);

GAME.levels = [
  LV({ title: 'Ngày khai trương', pastries: ['croissant', 'cookie', 'cinnamon'], duration: 80, spawn: [7, 10], patience: 32, tutorial: true,
    intro: [
      ['👋', 'Chào mừng chủ tiệm!', 'Khách ghé quầy và gọi món trong bong bóng.'],
      ['👆', 'Bỏ bánh vào hộp', 'Chạm hoặc kéo bánh từ tủ kính vào hộp giấy.'],
      ['🛍️', 'Giao cho khách', 'Đủ món thì chạm vào khách (hoặc kéo cả hộp tới khách).'],
      ['❤️', 'Đừng để khách chờ lâu', 'Hết thanh kiên nhẫn là khách bỏ về, bạn mất 1 tim.'],
    ] }),
  LV({ title: 'Mẻ bánh đầu tiên', pastries: ['croissant', 'cookie', 'cinnamon', 'donut'], maxItems: 3, oven: true, startStock: 4, patience: 30, ovenTutorial: true,
    intro: [
      ['🔥', 'Lò nướng', 'Bánh trong tủ có hạn. Bấm "Nướng" để làm mẻ mới.'],
      ['✨', 'Canh lửa', 'Lấy bánh ra khi kim chạy vào vùng VÀNG để được thêm bánh và tiền thưởng. Để lâu quá bánh cháy!'],
    ] }),
  LV({ title: 'Ngọt ngào thêm sốt', pastries: ['croissant', 'cookie', 'cinnamon', 'donut'], duration: 95, slots: 3, maxItems: 3, oven: true, sauces: ['cream', 'choco'], sauceChance: 0.35, bell: 1,
    intro: [
      ['🍫', 'Sốt rưới bánh', 'Có khách muốn rưới sốt. Chạm hũ sốt để rưới lên hộp.'],
      ['🔔', 'Chuông vàng', 'Bấm chuông để khách vui vẻ chờ thêm 8 giây (1 lần/ngày).'],
      ['💫', 'Combo', 'Giao đúng liên tiếp để tiền tip tăng tới x1.5.'],
    ] }),
  LV({ title: 'Gói quà xinh', pastries: ['croissant', 'cookie', 'cinnamon', 'donut', 'tart'], duration: 100, slots: 3, maxItems: 3, maxTypes: 3, oven: true, sauces: ['cream', 'choco'], sauceChance: 0.3, gift: 0.3, bell: 1, patience: 28,
    intro: [['🎀', 'Gói quà', 'Khách có biểu tượng nơ muốn gói quà. Chạm nơ để thắt ruy băng.']] }),
  LV({ title: 'Khách VIP ghé thăm', pastries: ['croissant', 'cookie', 'cinnamon', 'donut', 'tart', 'macaron'], duration: 100, slots: 3, maxItems: 4, maxTypes: 3, oven: true, sauces: ['cream', 'choco', 'matcha'], sauceChance: 0.35, gift: 0.25, vip: 0.12, bell: 1, patience: 28,
    intro: [
      ['👑', 'Khách VIP', 'Trả gấp đôi nhưng rất thiếu kiên nhẫn!'],
      ['🍵', 'Sốt matcha', 'Thêm một loại sốt mới.'],
    ] }),
  LV({ title: 'Giờ cao điểm', pastries: ['croissant', 'cookie', 'cinnamon', 'donut', 'tart', 'macaron', 'cupcake'], duration: 105, slots: 3, spawn: [5, 8], maxItems: 4, maxTypes: 3, oven: true, sauces: ['cream', 'choco', 'matcha'], sauceChance: 0.35, gift: 0.25, vip: 0.12, rush: true, bell: 1, patience: 26,
    intro: [['⚡', 'Giờ cao điểm', 'Có lúc khách kéo đến dồn dập. Chuẩn bị sẵn bánh nhé!']] }),
  LV({ title: 'Nhà phê bình ẩm thực', pastries: ['croissant', 'cookie', 'cinnamon', 'donut', 'tart', 'macaron', 'cupcake'], duration: 110, slots: 3, spawn: [5, 8], maxItems: 5, maxTypes: 3, oven: true, sauces: ['cream', 'choco', 'matcha'], sauceChance: 0.35, gift: 0.25, vip: 0.1, critic: 0.1, rush: true, bell: 1, patience: 26,
    intro: [['🧐', 'Nhà phê bình ẩm thực', 'Phục vụ nhanh để được thưởng lớn. Để ông ấy bỏ về sẽ mất 2 tim!']] }),
  LV({ title: 'Su kem béo ngậy', pastries: ['croissant', 'cookie', 'cinnamon', 'donut', 'tart', 'macaron', 'cupcake', 'puff'], duration: 110, slots: 4, spawn: [5, 7], maxItems: 5, maxTypes: 3, oven: true, startStock: 6, sauces: ['cream', 'choco', 'matcha'], sauceChance: 0.35, gift: 0.25, vip: 0.1, critic: 0.08, bell: 1, patience: 25,
    intro: [['🪑', 'Thêm quầy', 'Giờ có 4 khách đứng quầy cùng lúc.']] }),
  LV({ title: 'Cuối tuần đông vui', pastries: ['croissant', 'cookie', 'cinnamon', 'donut', 'tart', 'macaron', 'cupcake', 'puff'], duration: 115, slots: 4, spawn: [5, 7], maxItems: 5, maxTypes: 4, oven: true, startStock: 6, sauces: ['cream', 'choco', 'matcha'], sauceChance: 0.4, gift: 0.3, vip: 0.12, critic: 0.08, rush: true, bell: 1, patience: 22,
    intro: [['🎉', 'Cuối tuần', 'Khách gọi nhiều món hơn và ít kiên nhẫn hơn.']] }),
  LV({ title: 'Lễ hội bánh ngọt', pastries: ['croissant', 'cookie', 'cinnamon', 'donut', 'tart', 'macaron', 'cupcake', 'puff'], duration: 120, slots: 4, spawn: [4, 6], maxItems: 6, maxTypes: 4, oven: true, startStock: 6, sauces: ['cream', 'choco', 'matcha'], sauceChance: 0.4, gift: 0.3, vip: 0.15, critic: 0.1, rush: true, bell: 2, patience: 24,
    intro: [['🎪', 'Lễ hội bánh ngọt', 'Ngày bận rộn nhất! Mọi loại khách đều đến.']] }),
];

/* Mục tiêu 1-2-3 sao: tự tính theo độ khó nếu màn không ghi sẵn `targets`. */
GAME.levels.forEach(lv => {
  if (lv.targets) return;
  const avgPrice = lv.pastries.reduce((s, id) => s + GAME.pastries[id].price, 0) / lv.pastries.length;
  const value = (((1 + lv.maxItems) / 2) * avgPrice + lv.sauceChance * 6 + lv.gift * GAME.giftPrice) * 1.3 * (1 + lv.vip);
  const customers = lv.duration / ((lv.spawn[0] + lv.spawn[1]) / 2);
  const max = value * customers;
  lv.targets = [0.38, 0.6, 0.8].map(f => Math.max(10, Math.round(max * f / 10) * 10));
});

/* ---------- Trang trí tiệm (đổi màu toàn bộ tiệm) ---------- */
GAME.themes = [
  { id: 'pink',     name: 'Hồng dâu',          cost: 0,   colors: ['#f48fb1', '#8c1d40', '#fde5ec'] },
  { id: 'mint',     name: 'Bạc hà mát lạnh',   cost: 150, colors: ['#7fd1b9', '#1f6b5c', '#e8f8f2'] },
  { id: 'choco',    name: 'Socola ấm áp',      cost: 200, colors: ['#c8946b', '#5a3220', '#f7ebe0'] },
  { id: 'lavender', name: 'Oải hương mộng mơ', cost: 250, colors: ['#b79be8', '#4b2a7a', '#f1eafc'] },
  { id: 'lemon',    name: 'Chanh vàng tươi',   cost: 300, colors: ['#f2c94c', '#7a5a00', '#fff8dc'] },
];

/* ---------- Thành tích (mỗi cái thưởng thêm tiền) ---------- */
GAME.achievements = [
  { id: 'first',     icon: '🥐', name: 'Khách đầu tiên',      desc: 'Phục vụ 1 khách',            stat: 'served',   goal: 1,    reward: 20 },
  { id: 'served50',  icon: '🏪', name: 'Tiệm quen',           desc: 'Phục vụ 50 khách',           stat: 'served',   goal: 50,   reward: 60 },
  { id: 'served200', icon: '🌟', name: 'Tiệm nổi tiếng',      desc: 'Phục vụ 200 khách',          stat: 'served',   goal: 200,  reward: 150 },
  { id: 'combo5',    icon: '⚡', name: 'Tay nhanh',           desc: 'Đạt combo ×5',               stat: 'maxCombo', goal: 5,    reward: 50 },
  { id: 'combo10',   icon: '🔥', name: 'Thần tốc',            desc: 'Đạt combo ×10',              stat: 'maxCombo', goal: 10,   reward: 120 },
  { id: 'perfect10', icon: '✨', name: 'Thợ nướng lành nghề', desc: '10 mẻ nướng hoàn hảo',       stat: 'perfect',  goal: 10,   reward: 80 },
  { id: 'gift20',    icon: '🎀', name: 'Gói quà khéo tay',    desc: 'Gói quà cho 20 khách',       stat: 'gifts',    goal: 20,   reward: 80 },
  { id: 'vip10',     icon: '👑', name: 'Bạn của VIP',         desc: 'Phục vụ 10 khách VIP',       stat: 'vip',      goal: 10,   reward: 100 },
  { id: 'critic',    icon: '🧐', name: 'Được khen ngon',      desc: 'Nhà phê bình khen 1 lần',    stat: 'critic',   goal: 1,    reward: 80 },
  { id: 'cat5',      icon: '🐱', name: 'Bạn của mèo',         desc: 'Vuốt mèo may mắn 5 lần',     stat: 'cats',     goal: 5,    reward: 60 },
  { id: 'missions5', icon: '🎯', name: 'Chăm chỉ',            desc: 'Hoàn thành 5 nhiệm vụ phụ',  stat: 'missions', goal: 5,    reward: 100 },
  { id: 'stars30',   icon: '🏆', name: 'Tiệm 5 sao',          desc: 'Đạt đủ 30 sao',              stat: 'stars',    goal: 30,   reward: 300 },
];
