# Payment Service

Quản lý thanh toán và tích hợp VNPAY sandbox.

## Endpoint nội bộ

- `GET /health`
- `POST /payments`
- `GET /payments/order/:orderCode`
- `GET /payments/vnpay/ipn`
- `GET /payments/vnpay/return`

`POST /payments` được Order Service gọi sau khi tạo order. Với method `vnpay`, service tạo payment URL để frontend redirect sang VNPAY sandbox.
