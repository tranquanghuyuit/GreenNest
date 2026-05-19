# Auth Service

Xử lý đăng ký, đăng nhập, password hashing, access token và refresh token.

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

Khi chạy local bằng `npm run dev`, cần có PostgreSQL ở `localhost:5434` và biến môi trường:

```bash
DATABASE_URL=postgresql://auth_user:auth_password@localhost:5434/auth_db
JWT_SECRET=change-this-dev-secret
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
```

## Endpoint Nội Bộ

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/google/callback`
- `GET /auth/me`
- `POST /auth/refresh`
- `POST /auth/logout`

`/auth/google/callback` nhận `code` từ frontend, đổi code với Google OAuth, sau đó tạo user nếu email chưa tồn tại và trả access token + refresh token.

## Database

SQL tạo bảng nằm ở:

```text
db/init/001-create-schema.sql
```

Bảng chính:

- `users_auth`
- `refresh_tokens`
