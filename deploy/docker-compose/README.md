# Docker Compose

Dùng để chạy hệ thống ở môi trường local/dev.

## File Hiện Có

- `docker-compose.yml`: chạy lát backend gồm API Gateway, Auth Service, User Service, Product Service, Cart Service, Order Service, Payment Service và PostgreSQL `auth-db`, `user-db`, `product-db`, `cart-db`, `order-db`, `payment-db`.

## Lệnh Chạy

Chạy từ root project:

```bash
docker compose -f deploy/docker-compose/docker-compose.yml up --build
```

Chạy nền:

```bash
docker compose -f deploy/docker-compose/docker-compose.yml up -d --build
```

Nếu muốn test chuyển khoản qua VNPAY sandbox, cần set credential trước khi chạy compose:

```powershell
$env:VNPAY_TMN_CODE="your-vnpay-tmn-code"
$env:VNPAY_HASH_SECRET="your-vnpay-hash-secret"
$env:VNPAY_RETURN_URL="http://localhost:5173/payment/vnpay-return"
docker compose -f deploy/docker-compose/docker-compose.yml up -d --build payment-service order-service
```

Dừng:

```bash
docker compose -f deploy/docker-compose/docker-compose.yml down
```

## Endpoint Sau Khi Chạy

- API Gateway: `http://localhost:4000`
- Product Service: `http://localhost:4001`
- Auth Service: `http://localhost:4002`
- User Service: `http://localhost:4003`
- Cart Service: `http://localhost:4004`
- Order Service: `http://localhost:4005`
- Payment Service: `http://localhost:4006`
- Auth DB PostgreSQL: `localhost:5434`
- User DB PostgreSQL: `localhost:5435`
- Product DB PostgreSQL: `localhost:5433`
- Cart DB PostgreSQL: `localhost:5436`
- Order DB PostgreSQL: `localhost:5437`
- Payment DB PostgreSQL: `localhost:5438`

Kiểm tra:

```bash
curl http://localhost:4000/health
curl http://localhost:4002/health
curl http://localhost:4003/health
curl http://localhost:4004/health
curl http://localhost:4005/health
curl http://localhost:4006/health
curl http://localhost:4000/api/products
```

Kiểm tra database:

```bash
docker exec -it devsecops-auth-db psql -U auth_user -d auth_db
docker exec -it devsecops-user-db psql -U user_user -d user_db
docker exec -it devsecops-product-db psql -U product_user -d product_db
docker exec -it devsecops-cart-db psql -U cart_user -d cart_db
docker exec -it devsecops-order-db psql -U order_user -d order_db
docker exec -it devsecops-payment-db psql -U payment_user -d payment_db
```

Trong Docker network, API Gateway gọi service nội bộ bằng URL:

```text
http://auth-service:4002
http://user-service:4003
http://product-service:4001
http://cart-service:4004
http://order-service:4005
http://payment-service:4006
```
