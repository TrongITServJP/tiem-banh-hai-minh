# Prompt tạo ảnh bằng AI (ChatGPT / Gemini / Midjourney...)

Dán **phần chung** + **từng dòng bánh** vào công cụ tạo ảnh. Nếu công cụ có tuỳ chọn
"nền trong suốt" (transparent background) thì bật lên; không có thì dùng nền trắng trơn
rồi tách nền bằng remove.bg hoặc Canva.

## Phần chung (dán trước mỗi prompt)

> Cute stylized 3D illustration of a single pastry for a cozy bakery mobile game,
> soft studio lighting, glossy highlights, warm pastel colors, slight top-down 3/4 view,
> centered, whole item visible with small margin, no plate, no text, no logo,
> transparent background, square 1:1, 1024x1024.

## Từng loại (lưu đúng tên file)

| File | Prompt thêm vào |
|---|---|
| `croissant.png` | a golden flaky butter croissant |
| `cookie.png` | a round chocolate chip cookie with melty chocolate chunks |
| `cinnamon.png` | a cinnamon roll swirl with white icing drizzle |
| `donut.png` | a donut with glossy pink strawberry glaze and rainbow sprinkles |
| `tart.png` | a small round strawberry tart with custard and fresh strawberries |
| `macaron.png` | a lavender purple macaron with cream filling |
| `cupcake.png` | a cupcake with pink striped paper, swirl of pink frosting and a cherry on top |
| `puff.png` | a choux cream puff dusted with powdered sugar, cream peeking out |
| `sauce-cream.png` | a small glass jar of vanilla cream sauce with a pink lid and a wooden spoon |
| `sauce-choco.png` | a small glass jar of chocolate sauce with a pink lid and a wooden spoon |
| `sauce-matcha.png` | a small glass jar of green matcha sauce with a pink lid and a wooden spoon |

## Gắn vào game

Bỏ file vào thư mục này rồi điền đường dẫn vào `js/data.js`, ví dụ:

```js
croissant: { name: 'Bánh sừng bò', price: 12, bake: 6, img: 'assets/images/croissant.png' },
cream:     { name: 'Sốt kem tươi', price: 5, ..., img: 'assets/images/sauce-cream.png' },
```

Hoặc chỉ cần bỏ ảnh vào đây và nhờ Claude gắn giúp.
