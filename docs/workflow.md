# Workflow Hệ Thống

## Mục Đích

File này giúp đọc lại luồng hoạt động của dự án theo kiểu:

```text
file nào nhận việc -> file đó làm gì -> vì sao nó gọi file kế tiếp
```

Quy tắc chung của hệ thống:

```text
Frontend -> API Gateway -> Service nội bộ -> Database riêng của service
```

Frontend không gọi trực tiếp `auth-service`, `user-service`, `product-service`. Frontend chỉ gọi `api-gateway`.

## 1. Workflow Product: Xem Danh Mục Và Sản Phẩm

Chức năng:

- Trang `/categories` hiển thị sản phẩm.
- Frontend gọi `GET /api/products`.
- API Gateway chuyển request sang Product Service.
- Product Service đọc dữ liệu từ `product-db`.

Endpoint chính:

```text
GET /api/products
GET /api/products/:id
```

Luồng chi tiết:

**B1. `apps/frontend/src/pages/CommercePages.tsx`**

File này là UI của trang danh mục, cart, checkout, order.

Với trang categories, nó cần danh sách sản phẩm để render card sản phẩm. Vì UI không nên tự biết backend nằm ở port nào, nó gọi helper trong `src/api/products.ts`.

**B2. `apps/frontend/src/api/products.ts`**

File này chuyên gọi API sản phẩm từ frontend.

Nó tạo request HTTP tới:

```text
GET http://localhost:4000/api/products
```

Lý do gọi API Gateway: frontend chỉ biết một cửa vào duy nhất là Gateway, không gọi thẳng `product-service:4001`.

**B3. `apps/api-gateway/src/server.ts`**

File này khởi động API Gateway.

Nó mount route:

```text
/api/products -> productRouter
```

Lý do chuyển sang `product.routes.ts`: server chỉ khai báo route tổng, còn logic từng nhóm API được tách riêng để dễ quản lý.

**B4. `apps/api-gateway/src/routes/product.routes.ts`**

File này nhận request public `/api/products`.

Nó tạo URL nội bộ sang Product Service, ví dụ:

```text
http://product-service:4001/products
```

Lý do gọi Product Service: API Gateway không xử lý nghiệp vụ sản phẩm và không đọc `product-db`.

**B5. `apps/api-gateway/src/config.ts`**

File này đọc địa chỉ service từ biến môi trường:

```text
PRODUCT_SERVICE_URL=http://product-service:4001
```

Lý do cần config: khi chạy local có thể dùng `localhost:4001`, khi chạy Docker dùng `product-service:4001`.

**B6. `apps/api-gateway/src/utils/http.ts`**

File này chứa helper `requestJson`/`fetchJson` để Gateway gọi HTTP sang service nội bộ.

Lý do tách file này: nhiều route như auth, user, product đều cần gọi service khác theo cùng một cách và xử lý lỗi upstream giống nhau.

**B7. `apps/product-service/src/server.ts`**

File này khởi động Product Service.

Nó mount route:

```text
/products -> productRouter
```

Lý do chuyển sang route riêng: Product Service có thể có nhiều endpoint như list, detail, admin create/update sau này.

**B8. `apps/product-service/src/routes/product.routes.ts`**

File này nhận endpoint nội bộ:

```text
GET /products
GET /products/:id
```

Nó không query DB trực tiếp, mà gọi `product.service.ts`.

Lý do: route chỉ nên nhận request/response; nghiệp vụ lọc, phân trang, xử lý dữ liệu nằm ở service layer.

**B9. `apps/product-service/src/services/product.service.ts`**

File này xử lý logic sản phẩm:

- chuẩn hóa `page`, `limit`
- nhận filter category/keyword
- gọi repository lấy sản phẩm, tổng số, danh mục

Lý do gọi repository: service không viết SQL trực tiếp để tách nghiệp vụ khỏi truy vấn database.

**B10. `apps/product-service/src/repositories/product.repository.ts`**

File này chứa SQL query thật tới `product-db`.

Nó đọc bảng:

```text
categories
products
```

Lý do gọi `db/pool.ts`: repository cần connection pool để nói chuyện với PostgreSQL.

**B11. `apps/product-service/src/db/pool.ts`**

File này tạo kết nối PostgreSQL bằng `pg`.

Nó dùng `DATABASE_URL` để kết nối tới `product-db`.

Kết quả cuối cùng:

```text
product-db -> Product Service -> API Gateway -> Frontend
```

## 2. Workflow Auth: Đăng Ký, Đăng Nhập, Token, Logout

Chức năng:

- Đăng ký tài khoản.
- Đăng nhập bằng email/password.
- Lấy user hiện tại bằng access token.
- Refresh token.
- Logout bằng cách revoke refresh token.

Endpoint chính:

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/refresh
POST /api/auth/logout
```

Luồng chi tiết:

**B1. `apps/frontend/src/pages/AuthPages.tsx`**

File này chứa UI form login/register/forgot password/Google callback.

Nó chỉ thu dữ liệu người dùng nhập, ví dụ email/password. Sau đó gọi hàm xử lý được truyền từ `App.tsx`.

Lý do không gọi API trực tiếp trong page: page chỉ nên lo giao diện, còn điều phối login xong lưu session và chuyển trang nằm ở `App.tsx`.

**B2. `apps/frontend/src/App.tsx`**

File này điều phối state chính của frontend:

- user hiện tại
- access token/refresh token trong localStorage
- route hiện tại
- login/logout/register

Khi user submit login/register, `App.tsx` gọi `src/api/auth.ts`.

Lý do gọi API layer: `App.tsx` không nên tự viết `fetch`; API layer giúp gom endpoint và xử lý lỗi.

**B3. `apps/frontend/src/api/auth.ts`**

File này chuyên gọi Auth API:

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/refresh
POST /api/auth/logout
```

Nó gọi `http://localhost:4000`, tức API Gateway.

Lý do gọi Gateway: frontend không gọi trực tiếp Auth Service để giữ đúng mô hình microservices.

**B4. `apps/api-gateway/src/server.ts`**

File này mount:

```text
/api/auth -> authRouter
```

Lý do chuyển sang `auth.routes.ts`: toàn bộ route public của auth được gom riêng.

**B5. `apps/api-gateway/src/routes/auth.routes.ts`**

File này nhận các route public `/api/auth/...`.

Nó forward body và Authorization header sang Auth Service.

Lý do gọi Auth Service: Gateway chỉ định tuyến, không hash password, không tạo token, không đọc `auth-db`.

**B6. `apps/api-gateway/src/config.ts`**

File này cung cấp địa chỉ Auth Service:

```text
AUTH_SERVICE_URL=http://auth-service:4002
```

Lý do cần config: địa chỉ service thay đổi giữa local, Docker, Kubernetes.

**B7. `apps/api-gateway/src/utils/http.ts`**

File này gửi HTTP request sang Auth Service và chuẩn hóa lỗi upstream.

Lý do dùng helper chung: Gateway có nhiều route phải proxy, không muốn lặp code fetch ở từng route.

**B8. `apps/auth-service/src/server.ts`**

File này khởi động Auth Service và mount:

```text
/auth -> authRouter
```

Nó cũng có `/health` để kiểm tra service và database.

**B9. `apps/auth-service/src/routes/auth.routes.ts`**

File này nhận endpoint nội bộ:

```text
POST /auth/register
POST /auth/login
GET  /auth/me
POST /auth/refresh
POST /auth/logout
```

Nó gọi `auth.service.ts`.

Lý do: route chỉ nhận request và trả response; logic xác thực nằm ở service layer.

**B10. `apps/auth-service/src/services/auth.service.ts`**

File này xử lý nghiệp vụ auth:

- validate email/password
- gọi `password.ts` để hash/verify password
- gọi `tokens.ts` để tạo access token/refresh token
- gọi repository để lưu user/token vào DB

Lý do gọi nhiều utility/repository: Auth Service cần tách rõ nghiệp vụ, mã hóa password, token và database.

**B11. `apps/auth-service/src/utils/password.ts`**

File này hash và verify password bằng `scrypt`.

Lý do tồn tại riêng: password hashing là logic bảo mật, không nên viết lẫn trong route.

**B12. `apps/auth-service/src/utils/tokens.ts`**

File này tạo và verify access token, tạo refresh token, hash refresh token.

Lý do tồn tại riêng: token sẽ được dùng ở nhiều hàm như login, me, refresh.

**B13. `apps/auth-service/src/repositories/auth.repository.ts`**

File này query `auth-db`:

```text
users_auth
refresh_tokens
```

Lý do gọi repository: service không viết SQL trực tiếp.

**B14. `apps/auth-service/src/db/pool.ts`**

File này tạo PostgreSQL connection pool tới `auth-db`.

Kết quả cuối cùng:

```text
auth-db -> Auth Service -> API Gateway -> Frontend
```

## 3. Workflow Google OAuth

Chức năng:

- Bấm nút Google ở frontend.
- Redirect sang Google.
- Google trả authorization code về `/auth/google/callback`.
- Frontend gửi code về backend.
- Auth Service đổi code lấy thông tin Google user.

Endpoint chính:

```text
POST /api/auth/google/callback
```

Luồng chi tiết:

**B1. `apps/frontend/src/App.tsx`**

File này tạo URL Google OAuth bằng `VITE_GOOGLE_CLIENT_ID`.

Nó lưu `state` vào localStorage để chống callback giả.

Lý do redirect sang Google: user phải chọn tài khoản Google trên trang Google thật.

**B2. `apps/frontend/src/pages/AuthPages.tsx`**

File này có `GoogleCallbackPage`.

Nó đọc `code` và `state` từ URL callback.

Lý do gọi lại `App.tsx`: `App.tsx` đang giữ logic login và lưu session.

**B3. `apps/frontend/src/api/auth.ts`**

File này gửi:

```text
POST /api/auth/google/callback
```

Body gồm `code` và `redirectUri`.

Lý do gửi code cho backend: client secret không được để ở frontend; chỉ backend mới đổi code với Google.

**B4. `apps/api-gateway/src/routes/auth.routes.ts`**

Gateway nhận `/api/auth/google/callback` và forward sang Auth Service.

Lý do Gateway không tự gọi Google: nghiệp vụ auth phải nằm trong Auth Service.

**B5. `apps/auth-service/src/routes/auth.routes.ts`**

Auth Service nhận `/auth/google/callback`, rồi gọi `loginWithGoogle`.

Lý do chuyển sang service layer: xử lý Google OAuth, tạo user, tạo token là nghiệp vụ.

**B6. `apps/auth-service/src/services/auth.service.ts`**

File này gọi `google-oauth.ts` để lấy Google profile.

Sau đó:

- nếu email đã có user: tạo token
- nếu chưa có user: tạo user mới rồi tạo token

Lý do gọi repository: cần đọc/ghi `users_auth` và `refresh_tokens`.

**B7. `apps/auth-service/src/utils/google-oauth.ts`**

File này gọi Google API:

- đổi authorization code lấy `id_token`
- verify `id_token`
- lấy email/name/sub

Lý do tách riêng: đây là logic tích hợp bên thứ ba, không nên trộn vào auth service chính.

Ghi chú: code đã có, nhưng muốn chạy thật cần Google Cloud:

```text
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI
```

## 4. Workflow User: Profile Và Địa Chỉ Giao Hàng

Chức năng:

- Lấy profile hiện tại.
- Cập nhật profile.
- Thêm/sửa/xóa địa chỉ giao hàng.
- Nếu user mới chưa có profile, User Service tự tạo profile lần đầu.

Endpoint chính:

```text
GET    /api/users/me
PUT    /api/users/me
GET    /api/users/me/addresses
POST   /api/users/me/addresses
PATCH  /api/users/me/addresses/:id
DELETE /api/users/me/addresses/:id
```

### 4.1 Đọc Profile

**B1. `apps/frontend/src/pages/ProfilePages.tsx`**

File này là UI hiển thị profile, form edit profile, danh sách địa chỉ.

Nó nhận `user` và callback từ `App.tsx`.

Lý do không tự gọi API: page chỉ lo render form/card; `App.tsx` giữ state user chung cho toàn app.

**B2. `apps/frontend/src/App.tsx`**

File này có hàm `loadProfileFromUserService`.

Nó lấy access token từ localStorage rồi gọi `api/users.ts`.

Lý do gọi User Service sau login/reload: Auth Service chỉ biết tài khoản đăng nhập, còn profile/address nằm ở User Service.

**B3. `apps/frontend/src/api/users.ts`**

File này chuyên gọi User API:

```text
GET /api/users/me
```

Nó tự gắn header:

```text
Authorization: Bearer <accessToken>
```

Lý do cần token: User Service phải biết profile này thuộc user nào.

**B4. `apps/api-gateway/src/routes/user.routes.ts`**

Gateway nhận `/api/users/me`.

Nó forward request sang:

```text
http://user-service:4003/users/me
```

Nó cũng forward Authorization header.

Lý do forward token: Gateway không tự verify profile, User Service mới là owner dữ liệu user.

**B5. `apps/user-service/src/middleware/require-auth.ts`**

Middleware này lấy Bearer token và verify token.

Nếu token sai/hết hạn, request dừng ở đây.

Lý do gọi `utils/tokens.ts`: logic verify JWT nên tách riêng.

**B6. `apps/user-service/src/utils/tokens.ts`**

File này verify access token bằng `JWT_SECRET`.

Token hợp lệ sẽ cho ra:

```text
sub, email, username, role
```

Lý do cần `sub`: `sub` chính là `auth_user_id`, dùng để tìm profile trong `user-db`.

**B7. `apps/user-service/src/routes/user.routes.ts`**

Route `/users/me` lấy thông tin auth đã verify từ `response.locals.auth`.

Sau đó gọi `user.service.ts`.

Lý do route không query DB: route chỉ biết request/response, nghiệp vụ nằm ở service.

**B8. `apps/user-service/src/services/user.service.ts`**

Service gọi `ensureProfile`.

Nếu chưa có profile theo `auth_user_id`, nó tự tạo profile mới.

Lý do tự tạo: khi user vừa register/login, Auth Service đã có account nhưng User Service chưa chắc có profile.

**B9. `apps/user-service/src/repositories/user.repository.ts`**

Repository query:

```text
user_profiles
user_addresses
```

Lý do query cả hai bảng: frontend cần profile kèm danh sách địa chỉ để render.

**B10. `apps/user-service/src/db/pool.ts`**

File này tạo PostgreSQL connection pool tới `user-db`.

Kết quả cuối cùng:

```text
user-db -> User Service -> API Gateway -> Frontend
```

### 4.2 Sửa Profile

**B1. `EditProfilePage` trong `ProfilePages.tsx`**

Form cho người dùng sửa:

- fullName
- phone
- birthday
- gender
- marketingOptIn

Khi submit, nó gọi callback `onSaveProfile`.

Lý do không sửa DB trực tiếp: frontend phải gửi dữ liệu qua API Gateway.

**B2. `App.tsx`**

Hàm `saveProfile` nhận profile từ form.

Nó gọi `updateMyProfile` trong `api/users.ts`.

Sau khi backend trả profile mới, `App.tsx` cập nhật state và localStorage.

Lý do vẫn lưu localStorage: để UI giữ session/profile khi reload, nhưng dữ liệu thật vẫn nằm ở `user-db`.

**B3. `api/users.ts`**

Gọi:

```text
PUT /api/users/me
```

Gửi token và body profile.

Lý do gọi API Gateway: giữ đúng một cửa vào backend.

**B4. `api-gateway/src/routes/user.routes.ts`**

Forward request sang:

```text
PUT /users/me
```

Lý do Gateway không sửa DB: `user-db` thuộc User Service.

**B5. `user-service/src/services/user.service.ts`**

Hàm `updateMyProfile` validate dữ liệu và gọi repository update.

Lý do validate ở service: service là nơi nắm nghiệp vụ profile.

**B6. `user-service/src/repositories/user.repository.ts`**

Update bảng:

```text
user_profiles
```

### 4.3 Thêm/Sửa/Xóa Địa Chỉ

**B1. `AddressesPage` trong `ProfilePages.tsx`**

File này render danh sách địa chỉ và form thêm địa chỉ.

Khi thêm/sửa/xóa, nó gọi callback từ `App.tsx`.

Lý do: page chỉ lo UI, App điều phối API và state.

**B2. `App.tsx`**

Các hàm chính:

```text
addAddress()
setDefaultAddress()
removeAddress()
refreshProfileAfterAddressChange()
```

Sau mỗi thay đổi address, `App.tsx` gọi lại `GET /api/users/me` để lấy profile mới nhất.

Lý do gọi lại profile: backend có thể tự đổi địa chỉ mặc định, nên frontend nên nhận dữ liệu chuẩn từ server.

**B3. `api/users.ts`**

Gọi các endpoint:

```text
POST   /api/users/me/addresses
PATCH  /api/users/me/addresses/:id
DELETE /api/users/me/addresses/:id
```

Lý do tách API file: tất cả request liên quan User Service được gom ở một nơi.

**B4. `api-gateway/src/routes/user.routes.ts`**

Gateway forward request và Authorization header sang User Service.

Lý do: User Service cần token để biết địa chỉ này thuộc profile nào.

**B5. `user-service/src/middleware/require-auth.ts`**

Verify token trước khi cho thêm/sửa/xóa địa chỉ.

Lý do bảo mật: user chỉ được sửa địa chỉ của chính mình.

**B6. `user-service/src/services/user.service.ts`**

Các hàm chính:

```text
addMyAddress()
updateMyAddress()
deleteMyAddress()
```

Service luôn lấy profile theo `auth_user_id` trước, rồi mới xử lý địa chỉ.

Lý do: request không tin client gửi `profileId`; backend tự xác định profile từ token.

**B7. `user-service/src/repositories/user.repository.ts`**

Insert/update/delete bảng:

```text
user_addresses
```

Khi đặt một địa chỉ làm mặc định, repository tắt `is_default` của địa chỉ cũ trước.

Lý do: mỗi profile chỉ nên có một địa chỉ mặc định.

### 4.4 Sync LocalStorage Cũ Lên User Service

Trước khi nối User Service, frontend từng lưu địa chỉ trong localStorage.

Trong `App.tsx`, nếu:

```text
localStorage có address
user-db chưa có address
```

thì frontend sẽ gọi `createMyAddress` để đẩy address cũ lên User Service.

Lý do: tránh mất dữ liệu demo cũ của người dùng khi chuyển từ frontend-only sang backend thật.

## 5. Workflow Cart: Giỏ Hàng Của User Đã Đăng Nhập

Chức năng:

- User đăng nhập xem giỏ hàng thật từ `cart-db`.
- Thêm sản phẩm từ Home/Categories.
- Tăng/giảm số lượng trong Cart.
- Xóa từng item hoặc xóa toàn bộ giỏ khi checkout mock thành công.
- User chưa đăng nhập vẫn dùng `localStorage` tạm ở frontend.

Trạng thái hiện tại:

- Đã code `cart-service`.
- Đã thêm `cart-db` vào Docker Compose.
- Đã nối API Gateway qua `/api/cart`.
- Đã nối frontend cart vào Cart API cho user đã đăng nhập.
- Đã test build và test API qua Gateway thành công.

Endpoint chính:

```text
GET    /api/cart
POST   /api/cart/items
PATCH  /api/cart/items/:productId
DELETE /api/cart/items/:productId
DELETE /api/cart
```

Luồng chi tiết:

**B1. `apps/frontend/src/pages/HomePage.tsx` và `apps/frontend/src/pages/CommercePages.tsx`**

Các page này render nút thêm giỏ, cart page, checkout page.

Khi user bấm thêm/sửa/xóa giỏ, page không tự gọi backend mà gọi callback từ `App.tsx`.

Lý do: page chỉ lo UI; `App.tsx` mới biết user đã đăng nhập chưa và có access token không.

**B2. `apps/frontend/src/App.tsx`**

File này giữ `cartItems` để header/cart/checkout dùng chung.

Nếu user chưa đăng nhập, `App.tsx` lưu giỏ bằng `localStorage`.

Nếu user đã đăng nhập, `App.tsx` gọi `src/api/cart.ts` bằng access token.

Lý do cần nhánh này: khách vãng lai vẫn thêm giỏ được, còn user đăng nhập thì dữ liệu phải nằm trong backend thật.

**B3. `apps/frontend/src/api/cart.ts`**

File này gom toàn bộ request Cart API:

```text
fetchMyCart()
addMyCartItem()
updateMyCartItem()
removeMyCartItem()
clearMyCart()
```

Nó gửi request tới API Gateway ở `http://localhost:4000/api/cart...` và gắn header:

```text
Authorization: Bearer <accessToken>
```

Lý do: Cart Service cần token để biết giỏ này thuộc user nào.

**B4. `apps/api-gateway/src/server.ts`**

Gateway mount route:

```text
/api/cart -> cartRouter
```

Lý do: frontend chỉ gọi một cửa là API Gateway, không gọi thẳng Cart Service.

**B5. `apps/api-gateway/src/routes/cart.routes.ts`**

Route này nhận request public `/api/cart...`, rồi forward sang Cart Service:

```text
GET    /api/cart                 -> GET    /cart
POST   /api/cart/items           -> POST   /cart/items
PATCH  /api/cart/items/:productId -> PATCH /cart/items/:productId
DELETE /api/cart/items/:productId -> DELETE /cart/items/:productId
DELETE /api/cart                 -> DELETE /cart
```

Nó forward cả Authorization header.

Lý do: Gateway không tự verify token và không đọc `cart-db`; Cart Service là nơi sở hữu nghiệp vụ cart.

**B6. `apps/api-gateway/src/config.ts`**

File này đọc địa chỉ Cart Service:

```text
CART_SERVICE_URL=http://cart-service:4004
```

Lý do: chạy Docker dùng tên service `cart-service`, còn chạy local ngoài Docker có thể dùng `localhost:4004`.

**B7. `apps/cart-service/src/server.ts`**

File này khởi động Cart Service, có `/health` kiểm tra database và mount:

```text
/cart -> cartRouter
```

Lý do: server chỉ khai báo app-level middleware và route tổng.

**B8. `apps/cart-service/src/middleware/require-auth.ts`**

Middleware này đọc Bearer token, gọi `utils/tokens.ts` để verify token.

Nếu token hợp lệ, nó gắn thông tin user vào `response.locals.auth`.

Lý do: các endpoint cart đều cần biết `auth.sub`, tức id user từ Auth Service.

**B9. `apps/cart-service/src/routes/cart.routes.ts`**

Route nhận endpoint nội bộ `/cart...`.

Nó lấy `response.locals.auth`, rồi gọi `cart.service.ts`.

Lý do: route chỉ nhận request/response; logic thêm/sửa/xóa giỏ nằm ở service layer.

**B10. `apps/cart-service/src/services/cart.service.ts`**

Service xử lý nghiệp vụ:

- `getMyCart`: lấy hoặc tự tạo active cart.
- `addMyCartItem`: validate `productId`, `quantity`, rồi thêm item.
- `updateMyCartItem`: quantity `<= 0` thì xóa item.
- `removeMyCartItem`: xóa một product khỏi giỏ.
- `clearMyCart`: xóa toàn bộ item.

Lý do gọi repository: service không viết SQL trực tiếp để tách nghiệp vụ khỏi database query.

**B11. `apps/cart-service/src/repositories/cart.repository.ts`**

Repository query PostgreSQL:

```text
carts
cart_items
```

Nó đảm bảo mỗi user có một cart `active`, add trùng product thì tăng `quantity`, và update `updated_at`.

Lý do gọi `db/pool.ts`: repository cần PostgreSQL connection pool.

**B12. `apps/cart-service/src/db/pool.ts`**

File này tạo connection pool tới `cart-db` bằng `DATABASE_URL`.

Kết quả cuối cùng:

```text
cart-db -> Cart Service -> API Gateway -> Frontend
```

Cách test nhanh:

```bash
curl http://localhost:4004/health
curl http://localhost:4000/health
```

Với các endpoint `/api/cart`, cần đăng nhập trước để lấy access token từ Auth Service, sau đó gửi header:

```text
Authorization: Bearer <accessToken>
```

## 6. Workflow Order: Tạo Đơn Hàng Thật Từ Cart

Chức năng:

- User đăng nhập checkout từ giỏ hàng hiện tại.
- Order Service tạo mã đơn public dạng `ORD-xxxxxx`.
- Lưu snapshot địa chỉ và snapshot sản phẩm vào `order-db`.
- Sau khi tạo đơn thành công, Cart Service được gọi để xóa giỏ.

Trạng thái hiện tại:

- Đã code `order-service`.
- Đã thêm `order-db` vào Docker Compose.
- Đã nối API Gateway qua `/api/orders`.
- Đã nối frontend checkout, order success, order history vào Order API.
- Đã test tạo đơn thật thành công, ví dụ mã `ORD-306499`.

Endpoint chính:

```text
GET  /api/orders
GET  /api/orders/:id
POST /api/orders
```

Luồng chi tiết:

**B1. `apps/frontend/src/pages/CommercePages.tsx`**

File này render Cart, Checkout, Order Success, Orders và Order Detail.

Khi user bấm đặt hàng ở Checkout, page gọi callback `onPlaceOrder` từ `App.tsx`.

Lý do: page chỉ lo UI; `App.tsx` giữ token, cart state và điều phối gọi API.

**B2. `apps/frontend/src/App.tsx`**

Hàm `handlePlaceOrder` kiểm tra user đã đăng nhập, cart không rỗng và có địa chỉ giao hàng.

Sau đó nó gọi `createMyOrder` trong `src/api/orders.ts`.

Lý do: frontend không tự tạo mã `ORD-...` nữa; mã đơn phải do Order Service tạo và lưu DB.

**B3. `apps/frontend/src/api/orders.ts`**

File này gọi:

```text
POST /api/orders
GET  /api/orders
GET  /api/orders/:id
```

Nó gửi kèm:

```text
Authorization: Bearer <accessToken>
```

Lý do: Order Service cần token để biết user nào đang tạo/xem đơn.

**B4. `apps/api-gateway/src/server.ts`**

Gateway mount route:

```text
/api/orders -> orderRouter
```

Lý do: frontend vẫn chỉ gọi API Gateway, không gọi thẳng Order Service.

**B5. `apps/api-gateway/src/routes/order.routes.ts`**

Route này forward:

```text
GET  /api/orders     -> GET  /orders
GET  /api/orders/:id -> GET  /orders/:id
POST /api/orders     -> POST /orders
```

Nó forward cả Authorization header.

Lý do: Gateway chỉ định tuyến, không tạo đơn và không đọc `order-db`.

**B6. `apps/order-service/src/routes/order.routes.ts`**

Route nội bộ `/orders` yêu cầu `require-auth`.

Nó lấy auth từ `response.locals.auth`, rồi gọi `order.service.ts`.

Lý do: route chỉ xử lý request/response; nghiệp vụ tạo đơn nằm trong service layer.

**B7. `apps/order-service/src/services/order.service.ts`**

Service tạo đơn theo các bước:

```text
1. Lấy cart từ Cart Service.
2. Lấy profile/địa chỉ từ User Service.
3. Lấy product snapshot từ Product Service.
4. Tính subtotal, shipping_fee, discount, total_amount.
5. Tạo order_code dạng ORD-xxxxxx.
6. Gọi repository ghi orders + order_items.
7. Gọi Payment Service để tạo payment.
8. Gọi Cart Service để clear cart.
```

Lý do Order Service gọi nhiều service: đơn hàng là nghiệp vụ tổng hợp từ cart, user address và product price tại thời điểm checkout.

**B8. `apps/order-service/src/repositories/order.repository.ts`**

Repository ghi và đọc:

```text
orders
order_items
```

Nó dùng transaction để insert order và order items cùng lúc.

Lý do: nếu insert item lỗi thì order cũng rollback, tránh đơn hàng bị thiếu dòng sản phẩm.

**B9. `apps/order-service/src/db/pool.ts`**

File này tạo PostgreSQL connection pool tới `order-db`.

Kết quả cuối cùng:

```text
order-db -> Order Service -> API Gateway -> Frontend
```

Khi tạo đơn, Order Service còn gọi:

```text
Cart Service
User Service
Product Service
Payment Service
```

## 7. Workflow Payment: VNPAY Sandbox

Chức năng:

- Lưu payment vào `payment-db`.
- Với `cod`, payment ở trạng thái `pending`; sau này admin sẽ xác nhận thanh toán khi xử lý đơn.
- Với `vnpay`, Payment Service tạo URL thanh toán sandbox và frontend redirect user sang VNPAY.
- Khi VNPAY gọi IPN, Payment Service verify chữ ký, kiểm tra amount, kiểm tra payment còn pending rồi cập nhật DB.

Trạng thái hiện tại:

- Đã code `payment-service`.
- Đã thêm `payment-db` vào Docker Compose.
- Đã nối Order Service gọi Payment Service khi checkout.
- Checkout frontend chỉ hiển thị 2 phương thức: `COD` và `Chuyển khoản`.
- Khi user chọn `Chuyển khoản`, frontend gửi `paymentMethod = "vnpay"`.
- Đã thêm route Return URL `/payment/vnpay-return` ở frontend.
- Đã cấu hình credential VNPAY sandbox qua `deploy/docker-compose/.env` local.
- Đã test được luồng tạo `paymentUrl` sang `sandbox.vnpayment.vn`.

Luồng tạo URL VNPAY:

```text
Frontend checkout
-> POST /api/orders
-> Order Service tạo order
-> Order Service gọi Payment Service POST /payments
-> Payment Service tạo payment_code
-> Payment Service build vnp_* params
-> Payment Service ký HMAC-SHA512 bằng VNPAY_HASH_SECRET
-> Payment Service trả paymentUrl
-> Frontend redirect sang VNPAY sandbox
```

Luồng xác thực IPN:

```text
VNPAY -> GET /api/payments/vnpay/ipn
```

Payment Service xử lý:

```text
B1. Lấy tất cả query `vnp_*`.
B2. Bỏ `vnp_SecureHash`, sort key tăng dần, ký lại bằng `VNPAY_HASH_SECRET`.
B3. So sánh chữ ký tự tính với `vnp_SecureHash`.
B4. Dùng `vnp_TxnRef` tìm `payments.payment_code`.
B5. Kiểm tra `payments.amount * 100 == vnp_Amount`.
B6. Kiểm tra payment còn `pending` để tránh xử lý lặp.
B7. Nếu `vnp_ResponseCode == 00` và `vnp_TransactionStatus == 00`, cập nhật payment `success`.
B8. Payment Service gọi Order Service internal để cập nhật order `paid`.
B9. Trả JSON `RspCode` và `Message` cho VNPAY.
```

Điểm quan trọng:

- VNPAY không tự kiểm tra đúng user trong hệ thống của mình.
- Hệ thống mình tự kiểm tra user bằng cách tìm payment từ `vnp_TxnRef`, vì payment đã lưu sẵn `user_id`, `order_id`, `order_code`, `amount`.
- Return URL chỉ dùng để hiển thị kết quả cho người dùng; cập nhật DB chuẩn phải dựa vào IPN.
- IPN sandbox muốn chạy thật từ VNPAY về máy local thì cần public HTTPS URL, ví dụ dùng ngrok rồi cấu hình `VNPAY_RETURN_URL`/IPN ở sandbox.

## 8. Workflow Container Local

Docker Compose hiện chạy:

```text
api-gateway:     localhost:4000
product-service: localhost:4001
auth-service:    localhost:4002
user-service:    localhost:4003
cart-service:    localhost:4004
order-service:   localhost:4005
payment-service: localhost:4006
product-db:      localhost:5433
auth-db:         localhost:5434
user-db:         localhost:5435
cart-db:         localhost:5436
order-db:        localhost:5437
payment-db:      localhost:5438
```

Lệnh chạy:

```bash
docker compose -f deploy/docker-compose/docker-compose.yml up -d --build
```

Lý do phải chạy container:

- PostgreSQL là server database, không phải file tĩnh.
- Service backend cần chạy để nhận HTTP request.
- API Gateway cần chạy để frontend gọi `localhost:4000`.

## 9. Workflow Admin: Kho, Danh Mục Sản Phẩm, Sửa Product

Chức năng:

- Admin chỉ dùng các màn hình chính: `Kho`, `Danh mục sản phẩm`, `Hồ sơ`.
- Trang `Kho` dùng để xác nhận thanh toán, thêm category, thêm product và quản lý deal.
- Trang `Danh mục sản phẩm` dùng lại UI danh mục của user, nhưng mỗi product có nút cây bút để sửa.
- Hồ sơ admin không hiển thị mục địa chỉ giao hàng.

Luồng chính:

**B1. `apps/frontend/src/components/Layout.tsx`**

Layout kiểm tra `user.role`.

- Nếu là admin: nav chỉ hiện `Kho`, `Danh mục sản phẩm`, `Hồ sơ`.
- Nút bánh răng dẫn đến `/admin` và hiển thị chữ `Kho`.
- Admin không thấy các tab user như giỏ hàng/yêu thích trong header.

Lý do: admin và customer có workflow khác nhau, không nên dùng chung toàn bộ menu.

**B2. `apps/frontend/src/App.tsx`**

File này điều phối route admin:

```text
/admin          -> AdminPage
/admin/products -> CategoriesPage ở chế độ admin
```

Nó cũng chặn user thường vào trang admin.

Lý do: `App.tsx` là nơi giữ user session và quyết định quyền truy cập route.

**B3. `apps/frontend/src/pages/AdminPages.tsx`**

Trang `Kho` hiện:

- danh sách đơn hàng cần admin xác nhận thanh toán
- form thêm category
- form thêm product
- form thêm/xóa deal

Đơn hàng đã hủy sẽ hiện nút xám `Đã hủy`, không còn hiện nút xác nhận giao dịch.

Lý do: đơn đã hủy không được phép xác nhận thanh toán nữa.

**B4. `apps/frontend/src/pages/CommercePages.tsx`**

Khi route là `/admin/products`, `CategoriesPage` chạy ở chế độ admin.

Mỗi product card hiện nút cây bút thay vì nút yêu thích/thêm giỏ.

Lý do: admin cần sửa product trực tiếp trên danh mục, còn user cần mua hàng.

**B5. `apps/frontend/src/components/ProductEditModal.tsx`**

Modal sửa product gồm:

- tên
- mô tả
- ảnh
- giá
- sale %
- tồn kho
- category
- trạng thái

Category được chọn bằng dropdown từ danh sách category thật.

Lý do: nhập tay category dễ sai `categoryId`, nên admin phải chọn từ dữ liệu có sẵn.

**B6. `apps/frontend/src/api/products.ts`**

Frontend gọi Product Admin API qua API Gateway:

```text
POST   /api/products/categories
POST   /api/products
PATCH  /api/products/:id
```

Lý do: frontend không gọi trực tiếp Product Service.

## 10. Workflow Product: Rating, Review Và Rating Thật Trên UI

Chức năng:

- User đánh giá sao cho sản phẩm.
- Home và Categories hiển thị `ratingAverage`, `ratingCount` thật từ Product Service.
- Không dùng cố định `4.8 sao` nữa.

Luồng chính:

**B1. `apps/frontend/src/pages/CommercePages.tsx` và `HomePage.tsx`**

Product card hiển thị sao dựa trên:

```text
product.ratingAverage
product.ratingCount
```

Khi user bấm sao, frontend gọi callback trong `App.tsx`.

**B2. `apps/frontend/src/App.tsx`**

Hàm `handleRateProduct` yêu cầu user đăng nhập rồi gọi API products.

Lý do: rating phải gắn với user thật, không để khách vãng lai ghi rating ẩn danh.

**B3. `apps/frontend/src/api/products.ts`**

Gọi:

```text
POST /api/products/:id/reviews
```

Gửi kèm Bearer token.

**B4. `apps/api-gateway/src/routes/product.routes.ts`**

Gateway forward request sang Product Service.

**B5. `apps/product-service/src/routes/product.routes.ts`**

Product Service dùng `require-auth` để đọc user từ access token rồi gọi service layer.

**B6. `apps/product-service/src/services/product.service.ts`**

Service validate rating, rồi gọi repository lưu review.

**B7. `apps/product-service/src/repositories/product.repository.ts`**

Repository ghi/đọc bảng review trong `product-db`, sau đó tính lại rating trung bình cho product.

Kết quả:

```text
product_reviews -> Product Service -> API Gateway -> Frontend
```

## 11. Workflow User: Yêu Thích Sản Phẩm

Chức năng:

- User bấm trái tim để lưu product vào danh sách yêu thích.
- Dữ liệu yêu thích được lưu trong `user-db`, không chỉ lưu ở frontend.
- Trang `/favorites` hiển thị sản phẩm yêu thích.

Endpoint chính:

```text
GET    /api/users/me/favorites
POST   /api/users/me/favorites/:productId
DELETE /api/users/me/favorites/:productId
```

Luồng chính:

**B1. `apps/frontend/src/pages/HomePage.tsx` và `CommercePages.tsx`**

Product card có nút trái tim.

Khi bấm, page gọi callback `onToggleFavorite`.

**B2. `apps/frontend/src/App.tsx`**

`App.tsx` kiểm tra user đã đăng nhập chưa.

- Nếu chưa đăng nhập: chuyển sang login.
- Nếu đã đăng nhập: cập nhật UI trước, rồi gọi User API.

Lý do: UI phản hồi nhanh, nhưng dữ liệu thật vẫn phải lưu trong backend.

**B3. `apps/frontend/src/api/users.ts`**

Gọi API favorite qua API Gateway.

**B4. `apps/api-gateway/src/routes/user.routes.ts`**

Gateway forward request sang User Service và giữ lại Authorization header.

**B5. `apps/user-service/src/routes/user.routes.ts`**

User Service verify token bằng `require-auth`, sau đó gọi service layer.

**B6. `apps/user-service/src/services/user.service.ts`**

Service lấy profile theo token, rồi thêm/xóa product trong danh sách yêu thích.

**B7. `apps/user-service/src/repositories/user.repository.ts`**

Repository đọc/ghi bảng:

```text
user_favorites
```

Kết quả:

```text
user_favorites -> User Service -> API Gateway -> Frontend
```

## 12. Workflow Deal: Quản Lý Deal Và Lọc Sản Phẩm Theo Combo

Chức năng:

- Deal nằm trong Product Service vì deal áp dụng lên product/combo product.
- Admin thêm/xóa deal ở trang `Kho`.
- Home hiển thị tối đa 2 deal/lần trong `Deals Of The Day`.
- Có nút mũi tên để chuyển qua lại giữa các deal.
- User bấm `Mua ngay` ở deal thì danh sách sản phẩm phía trên chỉ hiện các product thuộc deal đó.
- Giá deal được tính từ giá gốc, không cộng dồn sale cũ.

Ví dụ:

```text
Giá gốc: 100.000
Product sale riêng: 14% -> 86.000
Deal: 30%
Giá theo deal = 100.000 * 70% = 70.000
```

Không tính:

```text
86.000 * 70%
```

Endpoint chính:

```text
GET    /api/products/deals
POST   /api/products/deals
DELETE /api/products/deals/:id
```

Luồng admin tạo deal:

**B1. `apps/frontend/src/pages/AdminPages.tsx`**

Admin nhập:

- mô tả deal
- danh sách product áp dụng
- phần trăm giảm

Sau đó gọi callback trong `App.tsx`.

**B2. `apps/frontend/src/App.tsx`**

`App.tsx` gọi `createAdminDeal` hoặc `deleteAdminDeal` với access token admin.

**B3. `apps/frontend/src/api/products.ts`**

API client gọi:

```text
POST /api/products/deals
DELETE /api/products/deals/:id
```

**B4. `apps/api-gateway/src/routes/product.routes.ts`**

Gateway forward request sang Product Service.

**B5. `apps/product-service/src/routes/product.routes.ts`**

Product Service dùng `requireAdmin` để chỉ admin mới được thêm/xóa deal.

**B6. `apps/product-service/src/services/product.service.ts`**

Service validate:

- mô tả không rỗng
- `productIds` có ít nhất một product
- `discountPercent` từ 1 đến 90
- product trong deal phải tồn tại

**B7. `apps/product-service/src/repositories/product.repository.ts`**

Repository đọc/ghi bảng:

```text
product_deals
```

Luồng user bấm `Mua ngay`:

**B1. `apps/frontend/src/pages/HomePage.tsx`**

Home gọi:

```text
GET /api/products
GET /api/products/deals
```

Sau đó render tối đa 2 deal trong `Deals Of The Day`.

**B2. User bấm `Mua ngay`**

Home lưu deal đang chọn vào state `selectedDeal`.

**B3. Home lọc sản phẩm**

Chỉ giữ các product có `product.id` nằm trong:

```text
selectedDeal.productIds
```

**B4. Home tính giá deal**

Nếu product đã có `oldPrice`, xem `oldPrice` là giá gốc.

Nếu product chưa có `oldPrice`, dùng `priceValue` làm giá gốc.

Sau đó:

```text
dealPrice = originalPrice * (100 - discountPercent) / 100
```

Lý do: deal là chương trình giá riêng, không giảm chồng lên giá đã sale trước đó.

## 13. Workflow CI/CD Tiếp Theo

Theo `docs/devsecops-pipeline.md`, sau khi core service đã có code thật và Docker Compose chạy được, bước tiếp theo đúng quy trình là làm CI/CD.

Thứ tự nên làm:

**B1. CI cơ bản**

Tạo GitHub Actions trong:

```text
.github/workflows/
```

Workflow đầu tiên nên chạy:

- checkout source code
- cài dependencies bằng `npm ci`
- build frontend
- build từng backend service
- chạy test nếu service có test

Lý do: trước khi deploy, phải đảm bảo code build được trên môi trường sạch của GitHub Actions.

**B2. Security scan**

Thêm các bước scan:

- secret scan bằng Gitleaks
- dependency scan bằng `npm audit` hoặc Trivy filesystem scan
- SAST bằng Semgrep

Lý do: đây là phần DevSecOps, bắt lỗi bảo mật sớm trước khi build image/deploy.

**B3. Build Docker image**

Build image cho các backend service đã có Dockerfile.

Frontend hiện chưa cần Dockerfile vì đang chạy Vite local; khi chuẩn bị deploy thật sẽ thêm Dockerfile frontend sau.

**B4. Container scan và SBOM**

Sau khi build image, dùng Trivy scan image và tạo SBOM.

**B5. CD**

CD lên dev/staging/production chỉ nên làm sau khi có:

- CI xanh ổn định
- image registry
- Kubernetes manifest hoặc Helm chart rõ ràng
- secret/config theo môi trường

Kết luận:

```text
Bước tiếp theo nên code CI trước, chưa vội CD lên cloud.
```

## Workflow Sẽ Thêm Sau

14. Notification Service: nhận event và ghi log/gửi thông báo.
15. Kubernetes manifests và Helm chart.
16. Monitoring runtime: Prometheus, Grafana, Alertmanager.
17. Logging runtime: Loki/Promtail hoặc ELK.
