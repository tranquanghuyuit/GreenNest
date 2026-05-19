# Cart Service

Quản lý giỏ hàng thật của user đã đăng nhập, tách khỏi frontend `localStorage`.

## Stack

- Node.js
- Express
- TypeScript
- PostgreSQL
- pg

## Endpoint Nội Bộ

- `GET /health`
- `GET /cart`
- `POST /cart/items`
- `PATCH /cart/items/:productId`
- `DELETE /cart/items/:productId`
- `DELETE /cart`

Các endpoint `/cart/...` cần header:

```text
Authorization: Bearer <accessToken>
```

## Database

SQL tạo bảng nằm ở:

```text
db/init/001-create-schema.sql
```

Bảng chính:

- `carts`
- `cart_items`
