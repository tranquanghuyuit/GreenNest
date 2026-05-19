# Yêu Cầu Hệ Thống

## 1. Mục Tiêu Hệ Thống

Dự án xây dựng một website thương mại điện tử mini theo kiến trúc Microservices, được thiết kế để demo quy trình DevSecOps từ code, build, scan bảo mật, container hóa, deploy lên Kubernetes, monitoring và logging.

Mục tiêu không chỉ là tạo website chạy được, mà là chứng minh được một mô hình DevSecOps có thể áp dụng cho hệ thống microservices hiện đại.

## 2. Bài Toán Cần Giải Quyết

Hệ thống cho phép người dùng:

- Đăng ký và đăng nhập tài khoản.
- Xem danh sách sản phẩm.
- Xem chi tiết sản phẩm.
- Thêm sản phẩm vào giỏ hàng.
- Tạo đơn hàng.
- Thanh toán giả lập.
- Theo dõi trạng thái đơn hàng.

Hệ thống cho phép admin:

- Quản lý sản phẩm.
- Xem danh sách đơn hàng.
- Theo dõi tình trạng dịch vụ thông qua dashboard monitoring.

## 3. Người Dùng Chính

### Khách Hàng

Người dùng cuối của website. Họ có thể đăng ký, đăng nhập, tìm sản phẩm, thêm vào giỏ hàng và đặt hàng.

### Quản Trị Viên

Người quản trị hệ thống. Họ có thể quản lý sản phẩm, xem đơn hàng và theo dõi tình trạng hệ thống.

### Nhà Phát Triển / Kỹ Sư DevOps

Người phát triển và vận hành hệ thống. Họ cần pipeline CI/CD, logging, monitoring, security scan và tài liệu để debug lỗi.

### Người Đánh Giá Bảo Mật

Người kiểm tra các rủi ro bảo mật: secret leak, image có CVE, API thiếu auth, token không an toàn, network policy quá rộng.

## 4. Tính Năng Bắt Buộc Cho MVP

### Frontend

- Trang đăng nhập.
- Trang đăng ký.
- Trang quên mật khẩu hoặc reset mật khẩu ở mức demo.
- Trang chủ hoặc dashboard người dùng sau khi đăng nhập.
- Trang danh sách sản phẩm.
- Trang chi tiết sản phẩm.
- Tìm kiếm và lọc sản phẩm theo danh mục/từ khóa.
- Giỏ hàng.
- Trang cập nhật số lượng hoặc xóa sản phẩm khỏi giỏ hàng.
- Trang tạo đơn hàng.
- Trang xác nhận đơn hàng sau khi đặt thành công.
- Trang lịch sử đơn hàng của người dùng.
- Trang chi tiết đơn hàng.
- Trang hồ sơ cá nhân.
- Trang chỉnh sửa hồ sơ cá nhân.
- Trang quản lý địa chỉ giao hàng.
- Giao diện admin cơ bản để quản lý sản phẩm và xem đơn hàng.

### Các Service Backend

- API Gateway: điểm vào duy nhất cho frontend.
- Auth Service: đăng ký, đăng nhập, phát hành JWT.
- User Service: quản lý thông tin người dùng.
- Product Service: quản lý danh sách sản phẩm.
- Cart Service: quản lý giỏ hàng.
- Order Service: tạo và quản lý đơn hàng.
- Payment Service: tạo giao dịch thanh toán, hỗ trợ COD và chuyển khoản qua VNPAY sandbox.
- Notification Service: nhận event và gửi thông báo giả lập.

### DevSecOps

- Dockerfile cho từng service.
- Docker Compose cho môi trường dev.
- Kubernetes manifests cho từng service.
- CI pipeline: lint, test, build.
- Security pipeline: secret scan, SAST, dependency scan, container scan.
- CD pipeline: deploy dev, deploy staging, deploy production có approval.
- Monitoring: Prometheus và Grafana.
- Logging: Loki/Promtail hoặc ELK.

## 5. Phạm Vi Chưa Làm Trong MVP

- Thanh toán thật qua cổng thanh toán.
- Email/SMS thật.
- Recommendation engine.
- Multi-vendor marketplace.
- High availability production-grade database.
- Auto-scaling phức tạp.

## 6. Ràng Buộc Kỹ Thuật

- Mỗi service nên có Dockerfile riêng.
- Mỗi service nên có endpoint `/health`.
- Mỗi service nên có endpoint `/metrics` nếu có thể.
- Không dùng chung database cho tất cả service trong thiết kế production.
- Secret không được commit vào git.
- Image nên được pin version, tránh dùng `latest` cho production.
- Config của dev, staging, production phải tách riêng.

## 7. Tiêu Chí Hoàn Thành

Dự án được xem là hoàn thành khi:

- Chạy được local bằng Docker Compose.
- Có Kubernetes manifests hoặc Helm chart để deploy.
- Có pipeline CI/CD có security scan.
- Có tài liệu architecture, database, API, threat model và pipeline.
- Có ít nhất một luồng chức năng hoàn chỉnh: login -> xem product -> add cart -> tạo order.
- Có dashboard monitoring có thể xem health/metrics cơ bản.

## 8. Luật Làm Việc Cho Agent

Khi Agent code dự án này, bắt buộc:

- Đọc file này trước khi implement.
- Không thêm service mới hoặc workflow mới nếu chưa cập nhật workflow.md.
- Không thêm bảng database nếu chưa cập nhật database.md.
- Không thêm endpoint nếu chưa cập nhật workflow.md.
- Không thêm tool DevSecOps nếu chưa cập nhật devsecops-pipeline.md.
- Sau mỗi thay đổi lớn, cập nhật file-structure.md nếu có thêm file/thư mục mới.
