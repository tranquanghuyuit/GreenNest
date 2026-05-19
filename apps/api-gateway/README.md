# API Gateway

Điểm vào duy nhất của backend. Service này chịu trách nhiệm định tuyến request, logging và chuẩn hóa lỗi upstream.

## Stack

- Node.js
- Express
- TypeScript

## Lệnh Chạy

```bash
npm install
npm run dev
```

Khi chạy bằng Docker Compose, Gateway gọi service phía sau qua biến:

```text
AUTH_SERVICE_URL=http://auth-service:4002
PRODUCT_SERVICE_URL=http://product-service:4001
USER_SERVICE_URL=http://user-service:4003
CART_SERVICE_URL=http://cart-service:4004
ORDER_SERVICE_URL=http://order-service:4005
PAYMENT_SERVICE_URL=http://payment-service:4006
```

## Endpoint Hiện Có

- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google/callback`
- `GET /api/auth/me`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/users/me`
- `PUT /api/users/me`
- `GET /api/users/me/addresses`
- `POST /api/users/me/addresses`
- `PATCH /api/users/me/addresses/:id`
- `DELETE /api/users/me/addresses/:id`
- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:productId`
- `DELETE /api/cart/items/:productId`
- `DELETE /api/cart`
- `GET /api/orders`
- `GET /api/orders/:id`
- `POST /api/orders`
- `GET /api/payments/order/:orderCode`
- `GET /api/payments/vnpay/ipn`
- `GET /api/payments/vnpay/return`
- `GET /api/products`
- `GET /api/products/:id`
