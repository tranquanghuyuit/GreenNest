# Product Service

Service quản lý danh mục, sản phẩm, giá và tồn kho cơ bản.

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

Khi chạy local bằng `npm run dev`, cần có PostgreSQL ở `localhost:5433` và biến môi trường:

```bash
DATABASE_URL=postgresql://product_user:product_password@localhost:5433/product_db
```

## Docker

Build riêng service:

```bash
docker build -t devsecops-shop/product-service:dev .
```

## Endpoint

- `GET /health`
- `GET /products`
- `GET /products/:id`

Hiện service đọc dữ liệu thật từ PostgreSQL `product-db`.

SQL tạo bảng và seed dữ liệu nằm ở:

```text
db/init/001-create-schema.sql
db/init/002-seed-data.sql
```
