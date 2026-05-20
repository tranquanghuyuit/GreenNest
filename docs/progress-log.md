# Nhật Ký Phát Triển Dự Án

## 1. Mục Đích

File này dùng để lưu lại quá trình làm dự án theo thời gian. Mỗi khi viết code, sửa cấu trúc, thêm service, thêm pipeline, sửa bug hoặc thay đổi thiết kế, Agent phải ghi lại vào file này.

Mục tiêu:

- Biết dự án đã làm tới đâu.
- Biết file nào đã được tạo hoặc chỉnh sửa.
- Biết lý do của từng thay đổi.
- Biết đã test gì và kết quả ra sao.
- Biết phần nào còn nợ để làm tiếp.
- Giúp chuyển conversation với AI mà không mất ngữ cảnh.

## 2. Quy Tắc Ghi Nhật Ký

Mỗi lần hoàn thành một task, thêm một entry mới lên đầu mục "Nhật ký thay đổi".

Mỗi entry nên có:

- Ngày giờ.
- Người thực hiện: User hoặc Agent.
- Mục tiêu task.
- File/thư mục đã tạo hoặc chỉnh sửa.
- Nội dung đã làm.
- Cách kiểm tra.
- Kết quả kiểm tra.
- Việc còn lại.

Không ghi chung chung kiểu "đã sửa code". Phải ghi đủ để người khác đọc lại hiểu được chuyện gì đã xảy ra.

## 3. Mẫu Entry

```md
### YYYY-MM-DD HH:mm - Tên task

**Người thực hiện:** Agent/User

**Mục tiêu:**
- Mô tả ngắn mục tiêu của task.

**File/thư mục thay đổi:**
- `path/to/file`

**Nội dung đã làm:**
- Đã thêm/sửa/xóa gì.
- Vì sao làm như vậy.

**Kiểm tra:**
- Lệnh đã chạy hoặc cách kiểm tra thủ công.

**Kết quả:**
- Thành công/thất bại.
- Lỗi còn tồn tại nếu có.

**Việc còn lại:**
- Task tiếp theo hoặc phần cần review.
```

## 4. Nhật Ký Thay Đổi

### 2026-05-21 - Bổ sung test, CodeQL, OWASP Dependency-Check và API smoke test vào CI

**Người thực hiện:** Agent

**Mục tiêu:**
- Hoàn thiện thêm phần CI theo hướng DevSecOps: có unit test, code scanning, OWASP SCA report và API smoke test.
- Chưa làm GHCR, CD Kubernetes hoặc monitoring runtime theo yêu cầu hiện tại.

**File/thư mục thay đổi:**
- `.github/workflows/ci.yml`
- `scripts/ci/smoke-test.sh`
- `apps/*/package.json`
- `apps/frontend/package-lock.json`
- `apps/*/tests/*.test.ts`
- `docs/file-structure.md`
- `docs/workflow.md`
- `docs/progress-log.md`

**Nội dung đã làm:**
- Thêm script `npm test` cho frontend và 7 backend service chính.
- Thêm unit test cho auth, API Gateway, product, user, cart, order, payment và frontend.
- Thêm CodeQL analysis vào CI để có GitHub code scanning report.
- Thêm OWASP Dependency-Check ở chế độ report-only và upload artifact.
- Thêm API smoke test bằng Docker Compose để kiểm tra `/health`, `/api/products`, frontend Nginx và proxy `/api`.
- Cập nhật docs để ghi rõ CI hiện tại đã có gì và phần nào chưa làm.

**Kiểm tra:**
- Chạy `npm run build` cho frontend, api-gateway, auth-service, user-service, product-service, cart-service, order-service, payment-service.
- Chạy `npm test` cho frontend, api-gateway, auth-service, user-service, product-service, cart-service, order-service, payment-service.
- Chạy `docker compose -f deploy/docker-compose/docker-compose.yml config --quiet`.
- Kiểm tra smoke endpoint bằng PowerShell: `localhost:4000/health`, `localhost:4000/api/products?limit=1`, `localhost:8080`, `localhost:8080/api/products?limit=1`.

**Kết quả:**
- Build và unit test local đều pass.
- Docker Compose config hợp lệ.
- Các endpoint smoke test local đều trả `200`.
- Không chạy được `scripts/ci/smoke-test.sh` trực tiếp trên máy Windows vì môi trường hiện tại không có Bash/WSL đầy đủ; GitHub Actions runner Ubuntu có Bash nên vẫn dùng được trong CI.

**Việc còn lại:**
- Push lên GitHub để kiểm tra CI thật.
- Sau khi CI ổn định mới làm GHCR, CD Kubernetes và monitoring Prometheus/Grafana.

### 2026-05-20 - Ghi lại workflow admin, deal, favorite và xác nhận bước CI/CD tiếp theo

**Người thực hiện:** Agent

**Mục tiêu:**
- Ghi ngắn gọn các workflow mới đã làm gần đây.
- Xác nhận bước tiếp theo theo tài liệu DevSecOps pipeline.

**File/thư mục thay đổi:**
- `docs/workflow.md`
- `docs/progress-log.md`

**Nội dung đã làm:**
- Bổ sung workflow admin: trang `Kho`, trang `Danh mục sản phẩm`, modal sửa product và hồ sơ admin.
- Bổ sung workflow rating/review để Home và Categories dùng số sao thật từ Product Service.
- Bổ sung workflow favorite: user bấm trái tim, frontend gọi User Service và lưu vào bảng `user_favorites`.
- Bổ sung workflow deal: admin thêm/xóa deal, deal lưu trong `product_deals`, Home chỉ hiện tối đa 2 deal và có mũi tên chuyển deal.
- Ghi rõ logic giá deal: deal tính trên giá gốc, không giảm chồng lên giá đã sale trước đó.
- Ghi rõ bước tiếp theo đúng quy trình là code CI trước: build, test, secret scan, dependency scan, SAST; CD/cloud làm sau khi CI ổn và có deploy manifest rõ.

**Kiểm tra:**
- Đọc `docs/devsecops-pipeline.md` và `docs/file-structure.md` để đối chiếu thứ tự CI/CD.
- Chỉ sửa tài liệu Markdown, không chạy build code.

**Kết quả:**
- `docs/workflow.md` đã có thêm các mục workflow mới theo thứ tự.
- `docs/progress-log.md` đã ghi lại thay đổi tài liệu và hướng đi tiếp theo.

**Việc còn lại:**
- Code GitHub Actions CI cơ bản trong `.github/workflows/`.
- Sau CI mới làm security scan sâu hơn, build image, scan image, SBOM và CD.

### 2026-05-18 - Hoàn thiện Order Service và nối checkout vào backend thật

**Người thực hiện:** Agent

**Mục tiêu:**
- Tạo Order Service thật để checkout tạo đơn trong `order-db`.
- Sinh mã đơn public dạng `ORD-xxxxxx`.
- Nối frontend checkout, order success và order history vào API Gateway.

**File/thư mục thay đổi:**
- `apps/order-service/`
- `apps/frontend/src/api/orders.ts`
- `apps/frontend/src/App.tsx`
- `apps/api-gateway/src/routes/order.routes.ts`
- `apps/api-gateway/src/config.ts`
- `apps/api-gateway/src/server.ts`
- `deploy/docker-compose/docker-compose.yml`
- `docs/workflow.md`
- `docs/file-structure.md`
- `docs/database.md`
- `deploy/docker-compose/README.md`
- `docs/progress-log.md`

**Nội dung đã làm:**
- Thêm `order-service` với endpoint tạo đơn, lấy danh sách đơn và xem chi tiết đơn.
- Thêm `order-db` với bảng `orders`, `order_items`.
- Order Service khi tạo đơn sẽ lấy cart từ Cart Service, địa chỉ từ User Service, product snapshot từ Product Service rồi lưu vào DB.
- API Gateway nhận `/api/orders...` rồi forward sang Order Service.
- Frontend checkout gọi Order API thay vì tự tạo đơn mock.

**Kiểm tra:**
- `npm run build` trong `apps/order-service`, `apps/api-gateway`, `apps/frontend`.
- `docker compose -f deploy/docker-compose/docker-compose.yml up -d --build`.
- Test register/login, thêm địa chỉ, thêm cart, checkout qua `/api/orders`.
- Kiểm tra `order-db` bằng `psql`.

**Kết quả:**
- Build thành công.
- `devsecops-order-db`, `devsecops-order-service`, `devsecops-api-gateway` chạy healthy.
- Tạo đơn thật thành công, mã ví dụ `ORD-306499`.
- `orders` và `order_items` có dữ liệu trong PostgreSQL.
- Cart được clear sau khi tạo đơn.

**Việc còn lại:**
- Làm tiếp Payment Service để xử lý thanh toán mock tách riêng khỏi Order Service.

### 2026-05-18 - Hoàn thiện Cart Service và nối frontend vào API Gateway

**Người thực hiện:** Agent

**Mục tiêu:**
- Tạo Cart Service thật để user đăng nhập có giỏ hàng lưu trong `cart-db`.
- Nối frontend cart vào API Gateway thay vì chỉ dùng `localStorage`.

**File/thư mục thay đổi:**
- `apps/cart-service/`
- `apps/frontend/src/api/cart.ts`
- `apps/frontend/src/App.tsx`
- `apps/api-gateway/src/routes/cart.routes.ts`
- `apps/api-gateway/src/config.ts`
- `apps/api-gateway/src/server.ts`
- `deploy/docker-compose/docker-compose.yml`
- `docs/workflow.md`
- `docs/file-structure.md`
- `docs/database.md`
- `deploy/docker-compose/README.md`
- `docs/progress-log.md`

**Nội dung đã làm:**
- Thêm `cart-service` với các endpoint lấy giỏ, thêm item, cập nhật số lượng, xóa item và xóa toàn bộ giỏ.
- Thêm `cart-db` với bảng `carts`, `cart_items`.
- API Gateway nhận `/api/cart...` rồi forward sang Cart Service.
- Frontend gọi Cart API khi user đã đăng nhập; user chưa đăng nhập vẫn lưu giỏ tạm bằng `localStorage`.

**Kiểm tra:**
- `npm run build` trong `apps/cart-service`, `apps/api-gateway`, `apps/frontend`.
- `docker compose -f deploy/docker-compose/docker-compose.yml up -d --build`.
- Test `GET /health`, `GET /api/cart`, `POST /api/cart/items`, `PATCH /api/cart/items/:productId`, `DELETE /api/cart/items/:productId`.

**Kết quả:**
- Build thành công.
- `devsecops-cart-db`, `devsecops-cart-service`, `devsecops-api-gateway` chạy healthy.
- Có token thì thao tác cart qua API Gateway thành công; không token thì `/api/cart` trả `401`.

**Việc còn lại:**
- Làm tiếp Order Service để tạo đơn hàng thật từ cart.

### 2026-05-18 - Viết lại workflow chi tiết để học luồng file

**Người thực hiện:** Agent

**Mục tiêu:**
- Làm rõ không chỉ file nào gọi file nào, mà còn file đó làm gì và vì sao phải gọi file kế tiếp.

**File/thư mục thay đổi:**
- `docs/workflow.md`
- `docs/progress-log.md`

**Nội dung đã làm:**
- Viết lại workflow Product, Auth, Google OAuth và User theo từng bước.
- Mỗi bước ghi vai trò của file, trách nhiệm của file và lý do chuyển sang lớp tiếp theo.
- Làm rõ các tầng: UI page, `App.tsx`, API client frontend, API Gateway route, service route, service layer, repository, DB pool và database.

**Kiểm tra:**
- Không chạy build vì chỉ sửa tài liệu Markdown.

**Việc còn lại:**
- Khi thêm Cart/Order/Payment Service, tiếp tục ghi workflow theo cùng kiểu này.

### 2026-05-18 - Nối frontend profile/address vào User Service

**Người thực hiện:** Agent

**Nội dung đã làm:**
- Thêm `apps/frontend/src/api/users.ts`.
- Sửa frontend để profile, edit profile và địa chỉ gọi `/api/users/...` thay vì chỉ lưu `localStorage`.
- Thêm sync địa chỉ cũ từ localStorage lên `user-db` khi profile backend chưa có địa chỉ.

**Kiểm tra:** chạy `npm run build` trong `apps/frontend`, mở `/profile/addresses` HTTP 200.

**Việc còn lại:** đăng nhập trên UI, thêm địa chỉ mới và kiểm tra bảng `user_addresses`.

### 2026-05-18 - Tóm tắt hoàn thiện Auth Service

**Người thực hiện:** Agent

**Nội dung đã làm:**
- Hoàn thiện Auth Service với `register`, `login`, `me`, `refresh`, `logout`.
- Thêm `auth-db`, bảng `users_auth`, `refresh_tokens`.
- Nối API Gateway qua `/api/auth/...`.
- Thêm luồng Google OAuth callback, credential Google sẽ cấu hình sau.

**Kiểm tra:** build `auth-service`, `api-gateway`, chạy Docker Compose và test register/login/token qua API Gateway.

**Việc còn lại:** cấu hình Google Cloud credential khi cần dùng Google login thật.

### 2026-05-18 - Tóm tắt tạo User Service

**Người thực hiện:** Agent

**Nội dung đã làm:**
- Tạo User Service quản lý profile và địa chỉ giao hàng.
- Thêm `user-db`, bảng `user_profiles`, `user_addresses`.
- Nối API Gateway qua `/api/users/...`.
- Thêm Docker Compose cho `user-db` và `user-service`.

**Kiểm tra:** build `user-service`, chạy Docker Compose, test luồng register -> lấy token -> profile -> update profile -> thêm/sửa/xóa địa chỉ.

**Việc còn lại:** nối frontend profile/edit profile/addresses vào `/api/users/...`.

### 2026-05-17 - Docker hóa API Gateway và Product Service

**Người thực hiện:** Agent

**Mục tiêu:**
- Container hóa lát backend đầu tiên gồm `api-gateway` và `product-service`.
- Tạo Docker Compose để chạy local/dev theo đúng hướng DevOps từng lát nhỏ.

**File/thư mục thay đổi:**
- `apps/api-gateway/Dockerfile`
- `apps/api-gateway/.dockerignore`
- `apps/api-gateway/README.md`
- `apps/product-service/Dockerfile`
- `apps/product-service/.dockerignore`
- `apps/product-service/README.md`
- `deploy/docker-compose/docker-compose.yml`
- `deploy/docker-compose/README.md`
- `docs/file-structure.md`

**Nội dung đã làm:**
- Thêm Dockerfile multi-stage cho `api-gateway`.
- Thêm Dockerfile multi-stage cho `product-service`.
- Thêm `.dockerignore` để loại `node_modules`, `dist`, `.env`, log khỏi Docker build context.
- Tạo `deploy/docker-compose/docker-compose.yml` gồm 2 service:
  - `product-service` expose port `4001`.
  - `api-gateway` expose port `4000`.
- Cấu hình API Gateway trong Docker network gọi Product Service qua `PRODUCT_SERVICE_URL=http://product-service:4001`.
- Thêm healthcheck cho cả hai container.
- Cập nhật README và `docs/file-structure.md` để phản ánh cấu trúc Docker mới.

**Kiểm tra:**
- Chạy `npm run build` trong `apps/api-gateway`.
- Chạy `npm run build` trong `apps/product-service`.
- Chạy `docker compose -f deploy/docker-compose/docker-compose.yml config`.
- Thử chạy `docker compose -f deploy/docker-compose/docker-compose.yml up -d --build`.

**Kết quả:**
- Build TypeScript của `api-gateway` thành công.
- Build TypeScript của `product-service` thành công.
- Docker Compose config hợp lệ.

**Việc còn lại:**
- Mở Docker Desktop và đợi Docker engine chạy.
- Chạy lại:
  - `docker compose -f deploy/docker-compose/docker-compose.yml up -d --build`
- Test:
  - `http://localhost:4000/health`
  - `http://localhost:4000/api/products`
- Sau khi Docker Compose chạy ổn, nối frontend gọi API Gateway thay cho dữ liệu mock sản phẩm.

### 2026-05-16 - Code trang danh mục, giỏ hàng và đơn hàng frontend

**Người thực hiện:** Agent

**Mục tiêu:**
- Bổ sung các trang commerce còn thiếu sau Home và nhóm tài khoản: danh mục sản phẩm, giỏ hàng, checkout, xác nhận đặt hàng, lịch sử đơn hàng và chi tiết đơn hàng.
- Tạo được luồng frontend demo: xem sản phẩm -> thêm giỏ -> chỉnh số lượng -> checkout -> tạo đơn -> xem đơn.

**File/thư mục thay đổi:**
- `apps/frontend/src/App.tsx`
- `apps/frontend/src/types.ts`
- `apps/frontend/src/data/catalog.ts`
- `apps/frontend/src/components/Layout.tsx`
- `apps/frontend/src/pages/HomePage.tsx`
- `apps/frontend/src/pages/CommercePages.tsx`
- `apps/frontend/src/utils/money.ts`
- `apps/frontend/src/styles.css`
- `apps/frontend/README.md`
- `docs/file-structure.md`
- `docs/progress-log.md`

**Nội dung đã làm:**
- Mở rộng `Product` mock với `id`, `priceValue`, `unit`, `stockQuantity` và `description` để dùng cho cart/order.
- Thêm type `CartItem`, `Order`, `OrderItem`, `PaymentMethod`, `OrderStatus`.
- Thêm route frontend cho `/categories`, `/cart`, `/checkout`, `/orders`, `/orders/detail`, `/orders/success`.
- Tạo Categories page có filter danh mục và tìm kiếm theo tên/hãng.
- Tạo Cart page có cập nhật số lượng, xóa sản phẩm và tính tạm tính/phí ship/ưu đãi.
- Tạo Checkout page chọn địa chỉ giao hàng và phương thức thanh toán demo.
- Tạo Order Success page, Orders page và Order Detail page.
- Lưu giỏ hàng và đơn hàng demo bằng `localStorage`.
- Cập nhật header/nav để có nút danh mục, giỏ hàng có số lượng và lịch sử đơn hàng.

**Kiểm tra:**
- Chạy `npm run build` trong `apps/frontend`.

**Kết quả:**
- Build thành công.

**Việc còn lại:**
- Kiểm tra trực tiếp UX trên trình duyệt và tinh chỉnh nếu cần.
- Sau khi có backend, thay mock bằng API thật:
  - `GET /api/products`
  - `GET /api/cart`
  - `POST /api/cart/items`
  - `PATCH /api/cart/items/:id`
  - `DELETE /api/cart/items/:id`
  - `POST /api/orders`
  - `GET /api/orders`
  - `GET /api/orders/:id`
- Cân nhắc thêm Product Detail page và Admin Product Management page.

### 2026-05-16 - Code luồng đăng nhập, đăng ký và hồ sơ frontend

**Người thực hiện:** Agent

**Mục tiêu:**
- Bổ sung các trang thuộc nhóm tài khoản người dùng theo yêu cầu: đăng nhập, đăng ký, đăng xuất, quên mật khẩu, xem hồ sơ, chỉnh sửa hồ sơ và quản lý địa chỉ giao hàng.
- Giữ giao diện đồng bộ với Home page grocery e-commerce đã tạo trước đó.

**File/thư mục thay đổi:**
- `apps/frontend/src/App.tsx`
- `apps/frontend/src/types.ts`
- `apps/frontend/src/data/catalog.ts`
- `apps/frontend/src/components/Layout.tsx`
- `apps/frontend/src/components/ProductVisual.tsx`
- `apps/frontend/src/components/CategoryIcon.tsx`
- `apps/frontend/src/pages/HomePage.tsx`
- `apps/frontend/src/pages/AuthPages.tsx`
- `apps/frontend/src/pages/ProfilePages.tsx`
- `apps/frontend/src/styles.css`
- `apps/frontend/README.md`
- `docs/file-structure.md`
- `docs/progress-log.md`

**Nội dung đã làm:**
- Tách Home page khỏi `App.tsx` sang `pages/HomePage.tsx`.
- Tách dữ liệu mock sản phẩm/danh mục/deal sang `data/catalog.ts`.
- Tạo layout dùng chung gồm header, nav, account action, logout action và footer.
- Tạo trang Login với form email/password, remember checkbox và link quên mật khẩu.
- Tạo trang Register với form họ tên, username, email, mật khẩu và tùy chọn nhận thông báo.
- Tạo trang Forgot Password ở mức demo để hoàn thiện luồng tài khoản.
- Tạo trang Profile để xem thông tin cá nhân, trạng thái thành viên và địa chỉ mặc định.
- Tạo trang Edit Profile để chỉnh sửa thông tin người dùng.
- Tạo trang Addresses để thêm, xóa và đặt địa chỉ mặc định.
- Tạo mock auth state bằng `localStorage` để demo đăng nhập, đăng ký, logout và chỉnh sửa hồ sơ trước khi có backend.

**Kiểm tra:**
- Chạy `npm run build` trong `apps/frontend`.
- Kiểm tra `http://localhost:5173`, `http://localhost:5173/login`, `http://localhost:5173/profile/edit` trả HTTP 200.

**Kết quả:**
- Build thành công.
- Các route frontend mới mở được trên dev server.

**Việc còn lại:**
- Review giao diện trực tiếp trên trình duyệt và tinh chỉnh spacing/màu nếu cần.
- Sau khi có API Gateway, thay mock auth/profile bằng API thật:
  - `POST /api/auth/login`
  - `POST /api/auth/register`
  - `GET /api/users/me`
  - `PUT /api/users/me`
- Cân nhắc thêm trang đổi mật khẩu riêng khi backend Auth Service có endpoint tương ứng.

### 2026-05-16 - Code trang Home frontend

**Người thực hiện:** Agent

**Mục tiêu:**
- Xây dựng trang Home đầu tiên theo phong cách grocery e-commerce giống ảnh tham khảo.
- Tạo nền giao diện để các trang sau phát triển đồng bộ.

**File/thư mục thay đổi:**
- `apps/frontend/package.json`
- `apps/frontend/package-lock.json`
- `apps/frontend/tsconfig.json`
- `apps/frontend/vite.config.ts`
- `apps/frontend/index.html`
- `apps/frontend/src/main.tsx`
- `apps/frontend/src/App.tsx`
- `apps/frontend/src/styles.css`
- `apps/frontend/README.md`
- `docs/file-structure.md`
- `docs/progress-log.md`

**Nội dung đã làm:**
- Scaffold frontend bằng React + Vite + TypeScript.
- Dựng Home page gồm header nhiều lớp, search box, menu điều hướng, sidebar danh mục, hero banner, grid sản phẩm, deals và footer.
- Dùng dữ liệu mock trong `src/App.tsx` cho categories, products và deals.
- Dùng `lucide-react` cho icon ở header, search, giỏ hàng, tài khoản và rating.
- Viết CSS responsive trong `src/styles.css` để giao diện chạy được trên desktop/tablet/mobile.
- Cập nhật README frontend với stack và lệnh chạy.

**Kiểm tra:**
- Chạy `npm install` trong `apps/frontend`.
- Chạy `npm run build`.
- Chạy Vite dev server ở port `5173`.
- Kiểm tra `http://localhost:5173` trả HTTP 200.

**Kết quả:**
- Build thành công.
- Dev server chạy thành công tại `http://localhost:5173`.

**Việc còn lại:**
- Review giao diện trực tiếp và tinh chỉnh màu/khoảng cách nếu cần.
- Tách component nếu trang Home bắt đầu lớn.
- Sau khi có API Gateway và Product Service, thay dữ liệu mock bằng API `GET /api/products`.
- Tiếp tục phát triển các trang Product List, Product Detail, Profile và Cart theo cùng design language.

### 2026-05-16 - Bổ sung thư mục monitoring

**Người thực hiện:** Agent

**Mục tiêu:**
- Tạo nơi riêng để chứa cấu hình Prometheus, Grafana và Alertmanager.

**File/thư mục thay đổi:**
- `monitoring/`
- `monitoring/README.md`
- `monitoring/prometheus/`
- `monitoring/prometheus/README.md`
- `monitoring/grafana/`
- `monitoring/grafana/README.md`
- `monitoring/grafana/dashboards/`
- `monitoring/grafana/provisioning/`
- `monitoring/alertmanager/`
- `monitoring/alertmanager/README.md`
- `docs/file-structure.md`
- `docs/progress-log.md`

**Nội dung đã làm:**
- Thêm thư mục `monitoring/` ở root để chứa cấu hình monitoring runtime.
- Tách rõ vai trò giữa `monitoring/` và `graphs/`.
- Cập nhật `docs/file-structure.md` để Agent biết Prometheus/Grafana/Alertmanager phải đặt trong `monitoring/`.

**Kiểm tra:**
- Liệt kê cây thư mục `monitoring/`.
- Kiểm tra `docs/file-structure.md` có nhắc đến `monitoring/`.

**Kết quả:**
- Hoàn thành bổ sung cấu trúc monitoring.

**Việc còn lại:**
- Sau khi có service thật, tạo `prometheus.yml`, Grafana datasource, dashboard JSON và alert rules.

### 2026-05-16 - Tạo skeleton cấu trúc thư mục dự án

**Người thực hiện:** Agent

**Mục tiêu:**
- Tạo cấu trúc thư mục theo `docs/file-structure.md`.
- Chuẩn bị khung ban đầu để sau này implement service, deploy, security scan và monitoring.

**File/thư mục thay đổi:**
- `README.md`
- `Makefile`
- `.env.example`
- `.gitignore`
- `apps/`
- `apps/frontend/`
- `apps/api-gateway/`
- `apps/auth-service/`
- `apps/user-service/`
- `apps/product-service/`
- `apps/cart-service/`
- `apps/order-service/`
- `apps/payment-service/`
- `apps/notification-service/`
- `deploy/`
- `deploy/docker-compose/`
- `deploy/kubernetes/`
- `deploy/kubernetes/manifests/`
- `deploy/kubernetes/manifests-policy/`
- `deploy/kubernetes/manifests-monitoring/`
- `deploy/kubernetes/manifests-logging/`
- `deploy/helm-chart/`
- `dev/`
- `staging/`
- `production/`
- `install/`
- `openapi/`
- `healthcheck/`
- `graphs/`
- `security/`
- `scripts/`
- `.github/workflows/`
- `docs/file-structure.md`
- `docs/progress-log.md`

**Nội dung đã làm:**
- Tạo cây thư mục skeleton dựa theo cấu trúc đã định nghĩa.
- Thêm README placeholder cho các thư mục chính và từng service.
- Thêm `.gitkeep` cho các thư mục chưa có nội dung thật nhưng cần giữ lại trong git.
- Tạo `.env.example` để mô tả biến môi trường mẫu.
- Tạo `.gitignore` để tránh commit `.env`, secret, build output, dependency và Terraform state.
- Cập nhật `docs/file-structure.md` để phản ánh các thư mục con đã tạo.

**Kiểm tra:**
- Chạy lệnh liệt kê thư mục gốc.
- Chạy lệnh liệt kê file bằng `rg --files`.
- Kiểm tra nội dung README/placeholder được tạo đúng vị trí.

**Kết quả:**
- Hoàn thành skeleton thư mục ban đầu.
- Chưa tạo code service, Docker Compose thật, Kubernetes manifests thật hoặc GitHub Actions workflow thật vì chưa chốt stack kỹ thuật.

**Việc còn lại:**
- Chọn stack frontend/backend/database.
- Implement vertical slice đầu tiên.
- Tạo Dockerfile và docker-compose cho các service đầu tiên.
- Tạo pipeline CI/security sau khi có code thực tế.

### 2026-05-16 - Tạo bộ tài liệu nền cho dự án

**Người thực hiện:** Agent

**Mục tiêu:**
- Tạo các tài liệu nền để định hướng dự án DevSecOps Microservices Shop.

**File/thư mục thay đổi:**
- `docs/requirements.md`
- `docs/architecture.md`
- `docs/database.md`
- `docs/api.md`
- `docs/devsecops-pipeline.md`
- `docs/file-structure.md`
- `docs/threat-model.md`
- `docs/progress-log.md`

**Nội dung đã làm:**
- Tạo tài liệu requirements, architecture, database, API, pipeline DevSecOps, cấu trúc thư mục và threat model.
- Chuyển toàn bộ tài liệu sang tiếng Việt có dấu.
- Mở rộng requirements cho phần frontend: profile, chỉnh sửa profile, địa chỉ giao hàng, lịch sử đơn hàng, chi tiết đơn hàng.
- Viết lại `database.md` để thể hiện rõ liên kết giữa các trường, phân biệt FK vật lý, Logic Ref và Snapshot.
- Tạo file nhật ký này để theo dõi tiến độ về sau.

**Kiểm tra:**
- Đọc lại danh sách file trong `docs/`.
- Kiểm tra nội dung Markdown hiển thị đúng UTF-8.

**Kết quả:**
- Hoàn thành bộ tài liệu nền ban đầu.

**Việc còn lại:**
- Tạo skeleton thư mục dự án theo `docs/file-structure.md`.
- Chọn stack frontend/backend/database cụ thể.
- Thiết kế chi tiết service đầu tiên để implement theo vertical slice.

### 2026-05-18 - Chuyển Product Service sang PostgreSQL thật

**Người thực hiện:** Agent

**Mục tiêu:**
- Thay dữ liệu mock backend của Product Service bằng PostgreSQL thật.
- Giữ đúng luồng microservices: Frontend -> API Gateway -> Product Service -> product-db.

**File/thư mục thay đổi:**
- `apps/product-service/db/init/001-create-schema.sql`
- `apps/product-service/db/init/002-seed-data.sql`
- `apps/product-service/src/db/pool.ts`
- `apps/product-service/src/repositories/product.repository.ts`
- `apps/product-service/src/services/product.service.ts`
- `apps/product-service/src/routes/product.routes.ts`
- `apps/product-service/src/server.ts`
- `apps/product-service/src/types/catalog.ts`
- `apps/product-service/.env.example`
- `apps/product-service/package.json`
- `apps/product-service/package-lock.json`
- `deploy/docker-compose/docker-compose.yml`
- `deploy/docker-compose/README.md`
- `docs/database.md`
- `docs/file-structure.md`
- `docs/workflow.md`

**Nội dung đã làm:**
- Thêm PostgreSQL container `product-db`, expose ra host ở port `5433`.
- Tạo bảng `categories` và `products` bằng SQL init.
- Seed 9 categories và 8 products mẫu vào `product_db`.
- Thêm thư viện `pg` cho Product Service.
- Thêm PostgreSQL connection pool.
- Thêm repository query `products`/`categories` từ DB.
- Sửa Product Service để `/products` và `/products/:id` đọc dữ liệu từ DB thay vì `src/data/catalog.ts`.
- Sửa `/health` của Product Service để kiểm tra kết nối DB.
- Xóa mock backend `apps/product-service/src/data/catalog.ts`.

**Kiểm tra:**
- Chạy `npm run build` trong `apps/product-service`.
- Chạy `docker compose -f deploy/docker-compose/docker-compose.yml up -d --build`.
- Kiểm tra container `devsecops-product-db`, `devsecops-product-service`, `devsecops-api-gateway` đều healthy.
- Gọi `GET http://localhost:4001/health`, kết quả có `database: ok`.
- Gọi `GET http://localhost:4000/api/products`, kết quả trả 8 sản phẩm.
- Query trực tiếp DB bằng `docker exec devsecops-product-db psql ...`, kết quả có 8 products và 9 categories.

**Kết quả:**
- Product Service đã dùng PostgreSQL thật.
- Frontend `/categories` vẫn gọi API Gateway, còn API Gateway gọi Product Service, Product Service đọc từ `product-db`.
- Không cần tạo database/bảng thủ công trong pgAdmin; Docker Compose tự tạo DB khi volume mới được tạo.

**Việc còn lại:**
- Sau này cần migration tool chuyên nghiệp hơn nếu schema thay đổi nhiều.
- Có thể thêm API admin để tạo/sửa/xóa product thay vì chỉ seed bằng SQL.

### 2026-05-18 - Tạo Auth Service, Auth DB và route `/api/auth`

**Người thực hiện:** Agent

**Mục tiêu:**
- Hoàn thiện Auth Service tối thiểu cho register, login, me, refresh token và logout.
- Giữ đúng luồng microservices: Frontend -> API Gateway -> Auth Service -> auth-db.

**File/thư mục thay đổi:**
- `apps/auth-service/`
- `apps/auth-service/db/init/001-create-schema.sql`
- `apps/auth-service/src/config.ts`
- `apps/auth-service/src/db/pool.ts`
- `apps/auth-service/src/middleware/error-handler.ts`
- `apps/auth-service/src/repositories/auth.repository.ts`
- `apps/auth-service/src/routes/auth.routes.ts`
- `apps/auth-service/src/services/auth.service.ts`
- `apps/auth-service/src/types/auth.ts`
- `apps/auth-service/src/utils/password.ts`
- `apps/auth-service/src/utils/tokens.ts`
- `apps/auth-service/src/server.ts`
- `apps/api-gateway/src/config.ts`
- `apps/api-gateway/src/routes/auth.routes.ts`
- `apps/api-gateway/src/server.ts`
- `apps/api-gateway/src/utils/http.ts`
- `deploy/docker-compose/docker-compose.yml`
- `deploy/docker-compose/README.md`
- `docs/database.md`
- `docs/file-structure.md`
- `docs/workflow.md`

**Nội dung đã làm:**
- Tạo Auth Service Node.js/Express/TypeScript.
- Thêm PostgreSQL container `auth-db`, expose ra host ở port `5434`.
- Tạo bảng `users_auth` và `refresh_tokens`.
- Hash password bằng `scrypt`.
- Tạo access token dạng JWT HMAC SHA-256.
- Tạo refresh token random và chỉ lưu `token_hash` trong database.
- Implement endpoint nội bộ:
  - `POST /auth/register`
  - `POST /auth/login`
  - `GET /auth/me`
  - `POST /auth/refresh`
  - `POST /auth/logout`
- Thêm API Gateway route public:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
  - `POST /api/auth/refresh`
  - `POST /api/auth/logout`
- Cập nhật `requestJson` trong API Gateway để proxy được POST body và Authorization header.

**Kiểm tra:**
- Chạy `npm run build` trong `apps/auth-service`.
- Chạy `npm run build` trong `apps/api-gateway`.
- Chạy `docker compose -f deploy/docker-compose/docker-compose.yml up -d --build`.
- Kiểm tra `devsecops-auth-db`, `devsecops-auth-service`, `devsecops-api-gateway` đều healthy.
- Gọi `GET http://localhost:4002/health`, kết quả có `database: ok`.
- Gọi `GET http://localhost:4000/health`, kết quả có `authServiceUrl`.
- Test qua API Gateway:
  - `POST /api/auth/register` tạo user thành công.
  - `GET /api/auth/me` đọc user bằng Bearer access token thành công.
  - `POST /api/auth/login` đăng nhập thành công.
  - `POST /api/auth/refresh` đổi refresh token thành công.
  - `POST /api/auth/logout` revoke refresh token thành công.
- Query trực tiếp `auth-db`, thấy user mới trong `users_auth` và token trong `refresh_tokens`.

**Kết quả:**
- Auth Service backend đã hoạt động qua API Gateway.
- `auth-db` có thể xem bằng pgAdmin qua `localhost:5434`, database `auth_db`, user `auth_user`.
- Frontend hiện vẫn chưa nối login/register thật, nhưng backend auth đã sẵn sàng.

**Việc còn lại:**
- Nối frontend login/register/logout/me vào `/api/auth`.
- Bổ sung User Service để quản lý profile và địa chỉ riêng với `user-db`.
- Sau này nên thay JWT tự implement bằng thư viện chuẩn nếu dự án mở rộng production.

### 2026-05-18 21:34 - Payment Service Và VNPAY Sandbox

**Nội dung đã làm:**
- Hoàn thiện Payment Service để lưu giao dịch thanh toán vào `payment-db`.
- Tích hợp luồng `COD` và `Chuyển khoản`; trong đó `Chuyển khoản` được map sang `paymentMethod = "vnpay"`.
- Bỏ các lựa chọn thanh toán không dùng nữa ở checkout: thẻ demo, mock card, bank transfer.
- Cấu hình VNPAY sandbox bằng `.env` local cho Docker Compose.
- Payment Service tạo `paymentUrl` sang `sandbox.vnpayment.vn` bằng `vnp_TmnCode`, `vnp_Amount`, `vnp_ReturnUrl`, `vnp_TxnRef` và `vnp_SecureHash`.
- Order Service gọi Payment Service khi tạo đơn hàng.
- Frontend redirect sang VNPAY khi backend trả về `paymentUrl`.

**File/thư mục đã tạo/sửa:**
- `apps/payment-service/`
- `apps/payment-service/db/init/001-create-schema.sql`
- `apps/payment-service/src/config.ts`
- `apps/payment-service/src/services/payment.service.ts`
- `apps/payment-service/src/routes/payment.routes.ts`
- `apps/payment-service/src/utils/vnpay.ts`
- `apps/payment-service/src/types/payment.ts`
- `apps/order-service/src/services/order.service.ts`
- `apps/order-service/src/types/order.ts`
- `apps/order-service/src/utils/http.ts`
- `apps/order-service/db/init/001-create-schema.sql`
- `apps/frontend/src/pages/CommercePages.tsx`
- `apps/frontend/src/api/payments.ts`
- `apps/frontend/src/types.ts`
- `apps/api-gateway/src/routes/payment.routes.ts`
- `deploy/docker-compose/docker-compose.yml`
- `deploy/docker-compose/.env`
- `deploy/docker-compose/README.md`
- `docs/workflow.md`
- `docs/database.md`
- `docs/file-structure.md`
- `docs/requirements.md`

**Kiểm tra:**
- Chạy `npm run build` trong `apps/frontend`.
- Chạy `npm run build` trong `apps/order-service`.
- Chạy `npm run build` trong `apps/payment-service`.
- Chạy lại Docker Compose bằng `--env-file deploy/docker-compose/.env`.
- Kiểm tra `payment-service`, `order-service`, `api-gateway` đều `health ok`.
- Test trực tiếp `POST http://localhost:4006/payments`, kết quả tạo được `paymentUrl` sang `sandbox.vnpayment.vn`.
- Test qua API Gateway: register user test, thêm địa chỉ, thêm sản phẩm vào cart, tạo order với `paymentMethod = "vnpay"`.
- Kết quả test tạo được đơn `ORD-363367`, trạng thái `created`, có `paymentUrl` VNPAY.

**Ghi chú:**
- File `.env` chứa credential sandbox local và đã được `.gitignore` bỏ qua.
- Return URL hiện là `http://localhost:5173/payment/vnpay-return`.
- IPN thật từ VNPAY về máy local chưa test được nếu chưa có public URL như ngrok hoặc domain cloud.

## 5. Quy Tắc Cho Agent

Khi Agent hoàn thành bất kỳ task nào trong dự án:

- Phải cập nhật file này trước khi kết thúc lượt làm việc.
- Phải ghi rõ file nào đã tạo/sửa.
- Phải ghi rõ đã kiểm tra bằng cách nào.
- Nếu chưa test được, phải ghi rõ lý do.
- Nếu thay đổi ảnh hưởng kiến trúc, database, API hoặc pipeline, phải cập nhật file docs tương ứng.
