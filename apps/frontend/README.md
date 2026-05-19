# Frontend

Ứng dụng giao diện web cho khách hàng và admin. Frontend chỉ gọi API Gateway, không gọi trực tiếp các service nội bộ.

## Stack

- React
- Vite
- TypeScript
- lucide-react cho icon

## Lệnh Chạy

```bash
npm install
npm run dev
```

## Trang Hiện Có

- Home page theo phong cách grocery e-commerce: header, sidebar danh mục, banner khuyến mãi, grid sản phẩm, deals.
- Login page: đăng nhập demo, sau này nối `POST /api/auth/login`.
- Register page: đăng ký demo, sau này nối `POST /api/auth/register`.
- Google login callback: nhận `code` từ Google rồi gọi `POST /api/auth/google/callback`.
- Forgot password page: reset mật khẩu mức demo.
- Profile page: xem hồ sơ người dùng qua `GET /api/users/me`.
- Edit profile page: chỉnh sửa hồ sơ qua `PUT /api/users/me`.
- Addresses page: quản lý địa chỉ giao hàng qua `/api/users/me/addresses`.
- Logout action: xóa session demo và quay về trang đăng nhập.
- Categories page: xem/lọc danh mục sản phẩm, sau này nối `GET /api/products`.
- Cart page: quản lý giỏ hàng demo, sau này nối Cart Service.
- Checkout page: tạo đơn hàng demo, sau này nối Order Service và Payment Service.
- Order success page: xác nhận đặt hàng thành công.
- Orders page: lịch sử đơn hàng.
- Order detail page: chi tiết đơn hàng và snapshot sản phẩm/địa chỉ.

## Cấu Trúc Source Chính

```text
src/
  App.tsx
  main.tsx
  styles.css
  types.ts
  api/
    auth.ts
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

## Ghi Chú

Trang Categories đã gọi `GET /api/products` qua API Gateway bằng `src/api/products.ts`. Login/register/logout/Google callback đã gọi `/api/auth` qua `src/api/auth.ts`. Profile và địa chỉ đã gọi `/api/users` qua `src/api/users.ts`. Trang Home và các luồng cart/order vẫn dùng mock state, `localStorage` và dữ liệu fallback trong `src/data/catalog.ts`.

Để bật nút Google thật, tạo `apps/frontend/.env.local`:

```text
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_API_BASE_URL=http://localhost:4000
```

Khi backend sẵn sàng:

- Product data đang có lát đầu tiên qua `GET /api/products`.
- Login đang gọi `POST /api/auth/login`.
- Register đang gọi `POST /api/auth/register`.
- Google callback đang gọi `POST /api/auth/google/callback`.
- Profile đang gọi `GET /api/users/me`.
- Edit profile đang gọi `PUT /api/users/me`.
- Addresses đang gọi `/api/users/me/addresses`.
- Cart sẽ gọi `GET /api/cart`, `POST /api/cart/items`, `PATCH /api/cart/items/:id`, `DELETE /api/cart/items/:id`.
- Checkout sẽ gọi `POST /api/orders`.
- Orders sẽ gọi `GET /api/orders` và `GET /api/orders/:id`.
