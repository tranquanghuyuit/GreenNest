# Order Service

Quản lý đơn hàng thật của user đã đăng nhập.

## Endpoint nội bộ

- `GET /health`
- `GET /orders`
- `GET /orders/:id`
- `POST /orders`

`POST /orders` lấy cart từ Cart Service, lấy địa chỉ từ User Service, lấy snapshot sản phẩm từ Product Service rồi ghi vào `order-db`.
