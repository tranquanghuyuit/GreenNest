# Cấu Trúc Thư Mục

## 1. Mục Đích

File này giải thích cấu trúc thư mục dự kiến của dự án. Agent phải đọc file này trước khi tạo file mới để tránh tạo lung tung hoặc trùng chức năng.

Dự án tham khảo cách chia thư mục của `microservices-demo`, nhưng bổ sung thêm các phần cần thiết cho DevSecOps hiện đại.

## 2. Cấu Trúc Dự Kiến

```text
my_devops_project/
  apps/
    frontend/
    api-gateway/
    auth-service/
    user-service/
    product-service/
    cart-service/
    order-service/
    payment-service/
    notification-service/

  deploy/
    docker-compose/
      docker-compose.yml
      docker-compose.monitoring.yml
    kubernetes/
      manifests/
      manifests-policy/
        neuvector/
      manifests-monitoring/
      manifests-logging/
    helm-chart/
      templates/

  dev/
  staging/
  production/

  install/
    local/
    aws/
    azure/
  openapi/
  healthcheck/
  monitoring/
    prometheus/
      prometheus.yml
      blackbox.yml
      alerts.yml
    grafana/
      greennest-overview.dashboard.json
      provisioning/
        dashboards.yml
        datasources.yml
    alertmanager/
      alertmanager.yml
  graphs/
  security/
    semgrep/
    trivy/
    gitleaks/
    zap/
    dependency-check/
  docs/
  scripts/
  .github/
    workflows/

  README.md
  Makefile
  .env.example
  .gitignore
```

## 3. Giải Thích Từng Thư Mục

### apps/

Chứa source code của các service.

Mỗi service nên có:

- `Dockerfile`
- `README.md`
- source code riêng
- test riêng
- config example nếu cần

Không đặt file deploy Kubernetes trực tiếp trong service, trừ khi có lý do rõ ràng.

### apps/frontend/

Ứng dụng giao diện web. Gọi API Gateway thay vì gọi trực tiếp service nội bộ.

Stack hiện tại:

- React
- Vite
- TypeScript
- lucide-react

Cấu trúc hiện tại:

```text
apps/frontend/
  index.html
  package.json
  package-lock.json
  tsconfig.json
  vite.config.ts
  dist/
    index.html
    assets/
  src/
    App.tsx
    main.tsx
    styles.css
    types.ts
    api/
      auth.ts
      cart.ts
      orders.ts
      payments.ts
      products.ts
    data/
      catalog.ts
    components/
      CategoryIcon.tsx
      Layout.tsx
      ProductVisual.tsx
    pages/
      AuthPages.tsx
      CommercePages.tsx
      HomePage.tsx
      ProfilePages.tsx
    utils/
      money.ts
```

Giải thích nhanh:

- `index.html`: HTML entrypoint của Vite. File này chứa thẻ `#root` để React render app vào.
- `package.json`: khai báo dependency và script như `npm run dev`, `npm run build`.
- `package-lock.json`: khóa version dependency để cài lại đúng phiên bản.
- `tsconfig.json`: cấu hình TypeScript.
- `vite.config.ts`: cấu hình Vite dev server/build.
- `dist/`: thư mục sinh ra sau khi chạy `npm run build`. Đây là bản production build, không sửa code trực tiếp trong thư mục này.
- `dist/assets/`: chứa file JS/CSS đã được Vite bundle và hash tên file.
- `src/`: source code thật của frontend. Khi sửa giao diện hoặc logic, ưu tiên sửa trong `src/`.
- `src/main.tsx`: điểm khởi động React app, render `App` vào DOM.
- `src/App.tsx`: điều phối route nội bộ, auth session, profile state, cart state, order state và chọn page cần hiển thị.
- `src/styles.css`: CSS toàn cục cho layout, home, auth, profile, cart, order và responsive.
- `src/types.ts`: khai báo type dùng chung như `UserProfile`, `Address`, `CartItem`, `Order`.
- `src/api/`: chứa hàm gọi API Gateway từ frontend. Không đặt UI component trong thư mục này.
- `src/api/auth.ts`: gọi `/api/auth/register`, `/api/auth/login`, `/api/auth/google/callback`, `/api/auth/me`, `/api/auth/refresh`, `/api/auth/logout`.
- `src/api/cart.ts`: gọi `/api/cart`, `/api/cart/items` qua API Gateway để đọc/thêm/sửa/xóa giỏ hàng của user đã đăng nhập.
- `src/api/orders.ts`: gọi `/api/orders` qua API Gateway để tạo đơn, lấy lịch sử đơn và xem chi tiết đơn.
- `src/api/payments.ts`: gọi `/api/payments/vnpay/return` để kiểm tra chữ ký dữ liệu khi trình duyệt được VNPAY redirect về.
- `src/api/products.ts`: gọi `GET /api/products` qua API Gateway và map dữ liệu backend về kiểu `Product` mà UI đang dùng.
- `src/data/`: chứa dữ liệu mock dùng trong giai đoạn chưa có backend.
- `src/data/catalog.ts`: mock category/product/deal; hiện dùng làm fallback nếu frontend chưa gọi được API Gateway.
- `src/components/`: chứa component dùng lại ở nhiều page.
- `src/components/Layout.tsx`: layout chung gồm header, nav, footer và các action chính.
- `src/components/CategoryIcon.tsx`: icon danh mục dạng CSS class.
- `src/components/ProductVisual.tsx`: hình minh họa sản phẩm dạng component dùng lại ở Home, Category, Cart.
- `src/pages/`: chứa các màn hình lớn theo từng nhóm chức năng.
- `src/pages/HomePage.tsx`: trang Home.
- `src/pages/AuthPages.tsx`: login, register, forgot password và Google OAuth callback.
- `src/pages/ProfilePages.tsx`: profile, edit profile, addresses.
- `src/pages/CommercePages.tsx`: categories, cart, checkout, order success, orders, order detail.
- `src/utils/`: chứa helper function nhỏ, không phụ thuộc UI.
- `src/utils/money.ts`: format tiền Việt Nam cho cart/order.

Không đưa logic thật vào `dist/` hoặc `node_modules/`. Hai thư mục này là output/dependency được sinh ra từ lệnh build/install.

Các page hiện có:

- Home page.
- Login page.
- Register page.
- Forgot password page.
- Profile page.
- Edit profile page.
- Addresses page.
- Categories page.
- Cart page.
- Checkout page.
- Order success page.
- Orders page.
- Order detail page.

Cart hiện đã nối Cart Service khi user đăng nhập; user chưa đăng nhập vẫn lưu tạm bằng `localStorage`. Order hiện đã nối Order Service cho user đăng nhập.

### apps/api-gateway/

Điểm vào backend. Chịu trách nhiệm route, auth middleware, rate limit, logging và chuẩn hóa error.

Stack hiện tại:

- Node.js
- Express
- TypeScript

Cấu trúc hiện tại:

```text
apps/api-gateway/
  Dockerfile
  .dockerignore
  package.json
  package-lock.json
  tsconfig.json
  .env.example
  src/
    server.ts
    config.ts
    middleware/
      error-handler.ts
      request-logger.ts
    routes/
      auth.routes.ts
      cart.routes.ts
      order.routes.ts
      product.routes.ts
      user.routes.ts
    utils/
      http.ts
```

Giải thích nhanh:

- `src/server.ts`: khởi động API Gateway, khai báo `/health` và mount route `/api/auth`, `/api/products`, `/api/users`, `/api/cart`, `/api/orders`.
- `src/config.ts`: đọc cấu hình như `PORT`, `AUTH_SERVICE_URL`, `PRODUCT_SERVICE_URL`, `USER_SERVICE_URL`, `CART_SERVICE_URL`, `ORDER_SERVICE_URL`.
- `src/routes/auth.routes.ts`: nhận request public `/api/auth/...` rồi gọi Auth Service.
- `src/routes/cart.routes.ts`: nhận request public `/api/cart...` rồi gọi Cart Service, có forward Authorization header.
- `src/routes/order.routes.ts`: nhận request public `/api/orders...` rồi gọi Order Service, có forward Authorization header.
- `src/routes/product.routes.ts`: nhận request public `/api/products`, `/api/products/:id` rồi gọi Product Service.
- `src/routes/user.routes.ts`: nhận request public `/api/users/...` rồi gọi User Service.
- `src/middleware/request-logger.ts`: log request cơ bản.
- `src/middleware/error-handler.ts`: chuẩn hóa lỗi khi Gateway hoặc upstream service lỗi.
- `src/utils/http.ts`: helper gọi HTTP sang service nội bộ.
- `Dockerfile`: build image production cho API Gateway.
- `.dockerignore`: loại `node_modules`, `dist`, `.env` khỏi Docker build context.

Endpoint hiện có:

- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
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
- `GET /api/products`
- `GET /api/products/:id`

### apps/auth-service/

Xử lý đăng ký, đăng nhập, password hashing, JWT và refresh token.

Stack hiện tại:

- Node.js
- Express
- TypeScript
- PostgreSQL
- pg

Cấu trúc hiện tại:

```text
apps/auth-service/
  Dockerfile
  .dockerignore
  package.json
  package-lock.json
  tsconfig.json
  .env.example
  db/
    init/
      001-create-schema.sql
  src/
    server.ts
    config.ts
    db/
      pool.ts
    errors/
      auth-error.ts
    middleware/
      error-handler.ts
    repositories/
      auth.repository.ts
    routes/
      auth.routes.ts
    services/
      auth.service.ts
    types/
      auth.ts
    utils/
      google-oauth.ts
      password.ts
      tokens.ts
```

Giải thích nhanh:

- `db/init/001-create-schema.sql`: tạo bảng `users_auth`, `refresh_tokens` trong PostgreSQL `auth-db`.
- `src/server.ts`: khởi động Auth Service, khai báo `/health` có kiểm tra DB và mount route `/auth`.
- `src/config.ts`: đọc cấu hình như `PORT`, `DATABASE_URL`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
- `src/db/pool.ts`: tạo PostgreSQL connection pool bằng `pg`.
- `src/errors/auth-error.ts`: lỗi nghiệp vụ của Auth Service, kèm HTTP status code.
- `src/repositories/auth.repository.ts`: query DB cho user và refresh token.
- `src/routes/auth.routes.ts`: định nghĩa endpoint `/auth/register`, `/auth/login`, `/auth/google/callback`, `/auth/me`, `/auth/refresh`, `/auth/logout`.
- `src/services/auth.service.ts`: xử lý nghiệp vụ register/login/Google callback/token.
- `src/utils/google-oauth.ts`: đổi Google authorization code lấy thông tin email đã xác thực.
- `src/utils/password.ts`: hash và verify password bằng `scrypt`.
- `src/utils/tokens.ts`: tạo access token, refresh token và hash refresh token.

Endpoint hiện có:

- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/google/callback`
- `GET /auth/me`
- `POST /auth/refresh`
- `POST /auth/logout`

### apps/user-service/

Quản lý profile và địa chỉ người dùng.

Stack hiện tại:

- Node.js
- Express
- TypeScript
- PostgreSQL
- pg

Cấu trúc hiện tại:

```text
apps/user-service/
  Dockerfile
  .dockerignore
  package.json
  package-lock.json
  tsconfig.json
  .env.example
  db/
    init/
      001-create-schema.sql
  src/
    server.ts
    config.ts
    db/
      pool.ts
    errors/
      user-error.ts
    middleware/
      error-handler.ts
      require-auth.ts
    repositories/
      user.repository.ts
    routes/
      user.routes.ts
    services/
      user.service.ts
    types/
      user.ts
    utils/
      tokens.ts
```

Giải thích nhanh:

- `db/init/001-create-schema.sql`: tạo bảng `user_profiles`, `user_addresses` trong PostgreSQL `user-db`.
- `src/server.ts`: khởi động User Service, khai báo `/health` có kiểm tra DB và mount route `/users`.
- `src/config.ts`: đọc cấu hình như `PORT`, `DATABASE_URL`, `JWT_SECRET`.
- `src/middleware/require-auth.ts`: kiểm tra Bearer access token từ Auth Service.
- `src/repositories/user.repository.ts`: query DB cho profile và địa chỉ.
- `src/routes/user.routes.ts`: định nghĩa endpoint `/users/me` và `/users/me/addresses`.
- `src/services/user.service.ts`: xử lý nghiệp vụ tạo profile lần đầu, cập nhật profile, thêm/sửa/xóa địa chỉ.
- `src/utils/tokens.ts`: verify access token bằng `JWT_SECRET` giống Auth Service.

Endpoint hiện có:

- `GET /health`
- `GET /users/me`
- `PUT /users/me`
- `GET /users/me/addresses`
- `POST /users/me/addresses`
- `PATCH /users/me/addresses/:id`
- `DELETE /users/me/addresses/:id`

### apps/product-service/

Quản lý sản phẩm, danh mục và tồn kho cơ bản.

Stack hiện tại:

- Node.js
- Express
- TypeScript

Cấu trúc hiện tại:

```text
apps/product-service/
  Dockerfile
  .dockerignore
  package.json
  package-lock.json
  tsconfig.json
  .env.example
  db/
    init/
      001-create-schema.sql
      002-seed-data.sql
  src/
    server.ts
    config.ts
    db/
      pool.ts
    middleware/
      error-handler.ts
    repositories/
      product.repository.ts
    routes/
      product.routes.ts
    services/
      product.service.ts
    types/
      catalog.ts
```

Giải thích nhanh:

- `db/init/001-create-schema.sql`: tạo bảng `categories`, `products`, index và ràng buộc dữ liệu cho PostgreSQL.
- `db/init/002-seed-data.sql`: seed danh mục và sản phẩm mẫu vào `product-db`.
- `src/server.ts`: khởi động Product Service, khai báo `/health` có kiểm tra DB và mount route `/products`.
- `src/config.ts`: đọc cấu hình như `PORT`, `DATABASE_URL`.
- `src/db/pool.ts`: tạo PostgreSQL connection pool bằng thư viện `pg`.
- `src/repositories/product.repository.ts`: query PostgreSQL để lấy categories/products, filter, search, pagination.
- `src/routes/product.routes.ts`: định nghĩa endpoint nội bộ `/products`, `/products/:id`.
- `src/services/product.service.ts`: xử lý input page/limit rồi gọi repository để lấy dữ liệu từ DB.
- `src/types/catalog.ts`: type dùng chung cho `Category`, `Product`.
- `src/middleware/error-handler.ts`: chuẩn hóa lỗi của Product Service.
- `Dockerfile`: build image production cho Product Service.
- `.dockerignore`: loại `node_modules`, `dist`, `.env` khỏi Docker build context.

Endpoint hiện có:

- `GET /health`
- `GET /products`
- `GET /products/:id`

### apps/cart-service/

Quản lý giỏ hàng của user đã đăng nhập.

Stack hiện tại:

- Node.js
- Express
- TypeScript
- PostgreSQL
- pg

Cấu trúc hiện tại:

```text
apps/cart-service/
  Dockerfile
  .dockerignore
  package.json
  package-lock.json
  tsconfig.json
  .env.example
  db/
    init/
      001-create-schema.sql
  src/
    server.ts
    config.ts
    db/
      pool.ts
    errors/
      cart-error.ts
    middleware/
      error-handler.ts
      require-auth.ts
    repositories/
      cart.repository.ts
    routes/
      cart.routes.ts
    services/
      cart.service.ts
    types/
      cart.ts
    utils/
      tokens.ts
```

Giải thích nhanh:

- `db/init/001-create-schema.sql`: tạo bảng `carts`, `cart_items` trong PostgreSQL `cart-db`.
- `src/server.ts`: khởi động Cart Service, khai báo `/health` có kiểm tra DB và mount route `/cart`.
- `src/config.ts`: đọc `PORT`, `DATABASE_URL`, `JWT_SECRET`.
- `src/middleware/require-auth.ts`: kiểm tra Bearer access token từ Auth Service.
- `src/routes/cart.routes.ts`: định nghĩa endpoint `/cart` và `/cart/items`.
- `src/services/cart.service.ts`: xử lý nghiệp vụ lấy giỏ, thêm item, cập nhật số lượng, xóa item, xóa toàn bộ giỏ.
- `src/repositories/cart.repository.ts`: query PostgreSQL cho bảng `carts`, `cart_items`.
- `src/utils/tokens.ts`: verify access token bằng `JWT_SECRET` giống Auth Service.

Endpoint hiện có:

- `GET /health`
- `GET /cart`
- `POST /cart/items`
- `PATCH /cart/items/:productId`
- `DELETE /cart/items/:productId`
- `DELETE /cart`

### apps/order-service/

Quản lý đơn hàng và order items.

Stack hiện tại:

- Node.js
- Express
- TypeScript
- PostgreSQL
- pg

Cấu trúc hiện tại:

```text
apps/order-service/
  Dockerfile
  .dockerignore
  package.json
  package-lock.json
  tsconfig.json
  .env.example
  db/
    init/
      001-create-schema.sql
  src/
    server.ts
    config.ts
    db/
      pool.ts
    errors/
      order-error.ts
    middleware/
      error-handler.ts
      require-auth.ts
    repositories/
      order.repository.ts
    routes/
      order.routes.ts
    services/
      order.service.ts
    types/
      order.ts
    utils/
      http.ts
      tokens.ts
```

Giải thích nhanh:

- `db/init/001-create-schema.sql`: tạo bảng `orders`, `order_items` trong PostgreSQL `order-db`.
- `src/server.ts`: khởi động Order Service, khai báo `/health` có kiểm tra DB và mount route `/orders`.
- `src/config.ts`: đọc `PORT`, `DATABASE_URL`, `JWT_SECRET`, `CART_SERVICE_URL`, `PRODUCT_SERVICE_URL`, `USER_SERVICE_URL`.
- `src/middleware/require-auth.ts`: kiểm tra Bearer access token từ Auth Service.
- `src/routes/order.routes.ts`: định nghĩa endpoint `/orders`.
- `src/services/order.service.ts`: xử lý nghiệp vụ tạo đơn từ cart, lấy địa chỉ từ User Service, lấy snapshot sản phẩm từ Product Service.
- `src/repositories/order.repository.ts`: query PostgreSQL cho bảng `orders`, `order_items`.
- `src/utils/http.ts`: helper gọi HTTP sang Cart/User/Product Service.
- `src/utils/tokens.ts`: verify access token bằng `JWT_SECRET` giống Auth Service.

Endpoint hiện có:

- `GET /health`
- `GET /orders`
- `GET /orders/:id`
- `POST /orders`

### apps/payment-service/

Thanh toán, lưu payment transaction và tích hợp VNPAY sandbox.

Stack hiện tại:

- Node.js
- Express
- TypeScript
- PostgreSQL
- pg

Cấu trúc hiện tại:

```text
apps/payment-service/
  Dockerfile
  .dockerignore
  package.json
  package-lock.json
  tsconfig.json
  .env.example
  db/
    init/
      001-create-schema.sql
  src/
    server.ts
    config.ts
    db/
      pool.ts
    errors/
      payment-error.ts
    middleware/
      error-handler.ts
      require-internal.ts
    repositories/
      payment.repository.ts
    routes/
      payment.routes.ts
    services/
      payment.service.ts
    types/
      payment.ts
    utils/
      vnpay.ts
```

Giải thích nhanh:

- `db/init/001-create-schema.sql`: tạo bảng `payments` trong PostgreSQL `payment-db`.
- `src/utils/vnpay.ts`: tạo chữ ký HMAC-SHA512, build payment URL và verify checksum VNPAY trả về.
- `src/services/payment.service.ts`: tạo payment, sinh URL VNPAY, xử lý IPN, verify Return URL.
- `src/routes/payment.routes.ts`: định nghĩa `/payments`, `/payments/order/:orderCode`, `/payments/vnpay/ipn`, `/payments/vnpay/return`.
- `src/middleware/require-internal.ts`: bảo vệ endpoint tạo payment để chỉ Order Service gọi được.

Endpoint hiện có:

- `GET /health`
- `POST /payments`
- `GET /payments/order/:orderCode`
- `GET /payments/vnpay/ipn`
- `GET /payments/vnpay/return`

### apps/notification-service/

Nhận event từ message broker và ghi log/gửi thông báo giả lập.

## 4. deploy/

Chứa các file deploy hệ thống.

### deploy/docker-compose/

Dùng để chạy local/dev.

File dự kiến:

- `docker-compose.yml`: chạy app core. Hiện đã có API Gateway, Auth Service, User Service, Product Service, Cart Service, Order Service, Payment Service và PostgreSQL tương ứng.
- `docker-compose.monitoring.yml`: Prometheus, Grafana.
- `docker-compose.logging.yml`: Loki/Promtail hoặc ELK.

Compose hiện tại:

```text
deploy/docker-compose/
  docker-compose.yml
  docker-compose.monitoring.yml
  README.md
```

Service đang chạy trong `docker-compose.yml`:

- `auth-db`: PostgreSQL cho Auth Service, expose ra host ở port `5434`, tự chạy SQL init trong `apps/auth-service/db/init/`.
- `auth-service`: expose port `4002`, cung cấp `/health`, `/auth/register`, `/auth/login`, `/auth/google/callback`, `/auth/me`, `/auth/refresh`, `/auth/logout`.
- `user-db`: PostgreSQL cho User Service, expose ra host ở port `5435`, tự chạy SQL init trong `apps/user-service/db/init/`.
- `user-service`: expose port `4003`, cung cấp `/health`, `/users/me`, `/users/me/addresses`.
- `cart-db`: PostgreSQL cho Cart Service, expose ra host ở port `5436`, tự chạy SQL init trong `apps/cart-service/db/init/`.
- `cart-service`: expose port `4004`, cung cấp `/health`, `/cart`, `/cart/items`.
- `order-db`: PostgreSQL cho Order Service, expose ra host ở port `5437`, tự chạy SQL init trong `apps/order-service/db/init/`.
- `order-service`: expose port `4005`, cung cấp `/health`, `/orders`.
- `payment-db`: PostgreSQL cho Payment Service, expose ra host ở port `5438`, tự chạy SQL init trong `apps/payment-service/db/init/`.
- `payment-service`: expose port `4006`, cung cấp `/health`, `/payments`, `/payments/vnpay/ipn`, `/payments/vnpay/return`.
- `api-gateway`: expose port `4000`, gọi Auth/User/Product/Cart/Order Service qua các biến `*_SERVICE_URL`.
- `product-service`: expose port `4001`, cung cấp `/health`, `/products`, `/products/:id`, đọc dữ liệu từ `product-db`.
- `product-db`: PostgreSQL cho Product Service, expose ra host ở port `5433`, tự chạy SQL init trong `apps/product-service/db/init/`.

Compose monitoring overlay:

- `prometheus`: expose port `9090`, scrape target từ `monitoring/prometheus/prometheus.yml`.
- `grafana`: expose port `3000`, tự load datasource và dashboard từ `monitoring/grafana/`.
- `alertmanager`: expose port `9093`, nhận alert từ Prometheus.
- `blackbox-exporter`: expose port `9115`, kiểm tra HTTP endpoint như frontend, API Gateway và `/health` của từng service.
- `cadvisor`: expose port `8081`, thu metric container.
- `node-exporter`: expose port `9100`, thu metric host/container runtime.
- `jaeger`: expose port `16686`, chuẩn bị distributed tracing.

### deploy/kubernetes/

Chứa Kubernetes manifests.

Có thể chia theo style giống `microservices-demo`:

```text
deploy/kubernetes/
  manifests/
  manifests-policy/
  manifests-monitoring/
  manifests-logging/
  complete-demo.yaml
  README.md
```

### deploy/helm-chart/

Chứa Helm chart nếu cần deploy linh hoạt hơn.

File dự kiến:

- `Chart.yaml`
- `values.yaml`
- `values-dev.yaml`
- `values-staging.yaml`
- `values-prod.yaml`
- `templates/`

## 5. dev/, staging/, production/

Chứa config theo môi trường.

### dev/

Môi trường phát triển. Dùng cho local hoặc namespace dev.

### staging/

Môi trường gần production. Dùng để chạy integration test, DAST, smoke test.

### production/

Môi trường production. Cần approval, secret thật, monitoring và rollback plan.

Lưu ý: Không copy source code thành 3 bản. Chỉ tách config/deploy/infra theo môi trường.

## 6. install/

Chứa hướng dẫn/script cài đặt hạ tầng, ví dụ:

- local cluster.
- AWS.
- Azure.
- Kubernetes tools.

Các thư mục con hiện tại:

- `install/local/`: hướng dẫn hoặc script cho môi trường local.
- `install/aws/`: hướng dẫn hoặc script cho AWS.
- `install/azure/`: hướng dẫn hoặc script cho Azure.

## 7. openapi/

Chứa OpenAPI specs cho từng service:

- `auth.yaml`
- `user.yaml`
- `product.yaml`
- `cart.yaml`
- `order.yaml`
- `payment.yaml`

## 8. healthcheck/

Chứa script hoặc container kiểm tra tình trạng hệ thống sau deploy.

## 9. monitoring/

Chứa cấu hình monitoring runtime cho hệ thống.

Các thư mục con hiện tại:

- `monitoring/prometheus/`: cấu hình Prometheus, scrape config và alert rules.
- `monitoring/prometheus/prometheus.yml`: khai báo target Prometheus scrape.
- `monitoring/prometheus/blackbox.yml`: cấu hình HTTP probe cho Blackbox Exporter.
- `monitoring/prometheus/alerts.yml`: alert rule local cho endpoint down/latency cao/container memory cao.
- `monitoring/grafana/`: cấu hình Grafana.
- `monitoring/grafana/greennest-overview.dashboard.json`: dashboard tổng quan GreenNest.
- `monitoring/grafana/provisioning/`: datasource/dashboard provisioning.
- `monitoring/grafana/provisioning/datasources.yml`: tự tạo Prometheus và Jaeger datasource.
- `monitoring/grafana/provisioning/dashboards.yml`: tự load dashboard JSON.
- `monitoring/alertmanager/`: cấu hình cảnh báo.
- `monitoring/alertmanager/alertmanager.yml`: route alert local, chưa gửi email/Slack.

Đây là nơi chính để đặt cấu hình Prometheus, Grafana và Alertmanager.

## 10. graphs/

Chứa dashboard mẫu hoặc script tạo dashboard theo phong cách demo. Nếu file là cấu hình runtime để chạy monitoring, ưu tiên đặt trong `monitoring/`.

## 11. security/

Chứa config cho security tools:

- Semgrep rules.
- Trivy config.
- Gitleaks config.
- OWASP ZAP baseline config.
- Dependency-Check config.

Các thư mục con hiện tại:

- `security/semgrep/`
- `security/trivy/`
- `security/gitleaks/`
- `security/zap/`
- `security/dependency-check/`

## 12. docs/

Chứa tài liệu thiết kế và quy trình. Đây là bộ nhớ của dự án.

Hiện tại gồm:

- `requirements.md`
- `database.md`
- `workflow.md`
- `devsecops-pipeline.md`
- `file-structure.md`
- `threat-model.md`
- `progress-log.md`

Trong đó `progress-log.md` là nhật ký phát triển. Mỗi lần Agent hoặc người dùng hoàn thành một phần việc, cần ghi lại thay đổi, file đã sửa, cách kiểm tra và việc còn lại.

## 13. scripts/

Chứa script tiện ích:

- setup dev.
- seed data.
- run healthcheck.
- generate complete Kubernetes manifest.

Cấu trúc hiện tại có thêm:

```text
scripts/
  ci/
    smoke-test.sh
```

- `scripts/ci/smoke-test.sh`: script CI chạy sau khi Docker Compose stack đã lên, dùng `curl` để kiểm tra API Gateway, Product API, frontend Nginx và proxy `/api` của frontend.

## 14. .github/workflows/

Chứa GitHub Actions workflows:

- `ci.yml`
- `security.yml`
- `deploy-dev.yml`
- `deploy-staging.yml`
- `deploy-prod.yml`

`ci.yml` hiện là pipeline chính của dự án:

- build frontend và các backend service bằng `npm ci`, `npm run build`.
- chạy unit test bằng `npm test` trong từng app.
- chạy SAST bằng Semgrep.
- chạy CodeQL để tạo code scanning report trên GitHub.
- chạy Trivy filesystem scan để kiểm tra dependency, secret và misconfig.
- chạy OWASP Dependency-Check để tạo báo cáo SCA dạng artifact.
- build Docker image cho từng service.
- scan Docker image bằng Trivy ở chế độ report-only.
- validate Docker Compose config.
- validate Docker Compose monitoring overlay.
- chạy API smoke test bằng Docker Compose.

Ghi chú: hiện chưa push image lên GHCR, chưa CD Kubernetes. Monitoring runtime đã có compose overlay và CI validate config, nhưng chưa chạy monitoring stack trong CI.

### Test trong từng app

Các app có thư mục `tests/` và script:

```text
npm test
```

Quy ước:

- `tests/*.test.ts`: unit test hoặc service-level test nhỏ.
- Test hiện dùng Node.js built-in test runner với `tsx`.
- Các test chưa đụng database thật; API smoke test mới là lớp kiểm tra container/API thật qua Docker Compose.

## 15. Luật Tạo File Cho Agent

Trước khi tạo file mới, Agent phải trả lời:

- File nằm ở đâu?
- File phục vụ mục đích gì?
- Có file nào hiện có đã làm việc này chưa?
- Có cần cập nhật docs nào không?

Sau khi tạo file mới, Agent phải cập nhật file này nếu file/thư mục đó là thành phần quan trọng của hệ thống.
