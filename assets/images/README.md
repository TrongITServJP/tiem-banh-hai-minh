# Ảnh cho game

Hiện game đang dùng hình vẽ tạm. Khi có ảnh thật:

1. Bỏ ảnh vào thư mục này (nên dùng **PNG nền trong suốt, hình vuông, khoảng 256×256**).
2. Mở `js/data.js`, điền đường dẫn vào ô `img` của bánh/sốt tương ứng, ví dụ:

```js
croissant: { name: 'Bánh sừng bò', price: 12, bake: 6, img: 'assets/images/croissant.png' },
```

Tên gợi ý: `croissant.png`, `cookie.png`, `cinnamon.png`, `donut.png`, `tart.png`,
`macaron.png`, `cupcake.png`, `puff.png`, `sauce-cream.png`, `sauce-choco.png`, `sauce-matcha.png`.

Ô `img` để trống `''` thì game tự quay về hình vẽ.
