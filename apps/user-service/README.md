# User Service

Quản lý hồ sơ người dùng và địa chỉ giao hàng, tách khỏi Auth Service.

## Stack

- Node.js
- Express
- TypeScript
- PostgreSQL
- pg

## Lệnh Chạy

```bash
npm install
npm run dev
```

Khi chạy local bằng `npm run dev`, cần có PostgreSQL ở `localhost:5435` và biến môi trường:

```text
DATABASE_URL=postgresql://user_user:user_password@localhost:5435/user_db
JWT_SECRET=devsecops-shop-local-secret
```

`JWT_SECRET` phải khớp với Auth Service để User Service verify access token.

## Endpoint Nội Bộ

- `GET /health`
- `GET /users/me`
- `PUT /users/me`
- `GET /users/me/addresses`
- `POST /users/me/addresses`
- `PATCH /users/me/addresses/:id`
- `DELETE /users/me/addresses/:id`

Các endpoint `/users/...` cần header:

```text
Authorization: Bearer <accessToken>
```

## Database

SQL tạo bảng nằm ở:

```text
db/init/001-create-schema.sql
```

Bảng chính:

- `user_profiles`
- `user_addresses`
