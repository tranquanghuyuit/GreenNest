import {
  BadgeCheck,
  Clock3,
  CreditCard,
  Heart,
  Headphones,
  LogOut,
  Mail,
  MapPin,
  Menu,
  PhoneCall,
  Search,
  ShieldCheck,
  Settings,
  ShoppingCart,
  Shuffle,
  SlidersHorizontal,
  Truck,
  UserRound
} from "lucide-react";
import type { ReactNode } from "react";
import type { Navigate, RouteId, UserProfile } from "../types";

type LayoutProps = {
  children: ReactNode;
  route: RouteId;
  user: UserProfile | null;
  cartItemCount: number;
  onNavigate: Navigate;
  onLogout: () => void;
};

const navItems = [
  { label: "Home", path: "/", route: "home" },
  { label: "Danh mục", path: "/categories", route: "categories" },
  { label: "Sản phẩm", path: "/categories", route: "categories" },
  { label: "Giỏ hàng", path: "/cart", route: "cart" },
  { label: "Đơn hàng", path: "/orders", route: "orders" },
  { label: "Cửa hàng", path: "/", route: "home" },
  { label: "Khuyến mãi", path: "/", route: "home" },
  { label: "Liên hệ", path: "/", route: "home" }
] satisfies Array<{ label: string; path: string; route: RouteId }>;

export function Layout({ children, route, user, cartItemCount, onNavigate, onLogout }: LayoutProps) {
  const accountRoutes: RouteId[] = ["profile", "editProfile", "addresses"];
  const isAccountRoute = accountRoutes.includes(route);
  const commerceRoutes: RouteId[] = ["cart", "checkout", "orders", "orderDetail", "orderSuccess"];

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="top-strip">
          <div className="top-links">
            <button type="button" onClick={() => onNavigate("/")}>
              Giới thiệu
            </button>
            <button type="button" onClick={() => onNavigate(user ? "/profile" : "/login")}>
              Tài khoản
            </button>
            <button type="button" onClick={() => onNavigate(user ? "/orders" : "/login")}>
              Theo dõi đơn
            </button>
            <button type="button">Hỗ trợ</button>
          </div>
          <p>Giao hàng miễn phí cho đơn từ 300.000đ</p>
          <div className="top-links">
            <button type="button">Tiếng Việt</button>
            <button type="button">VND</button>
          </div>
        </div>

        <div className="main-header">
          <button className="brand" type="button" onClick={() => onNavigate("/")} aria-label="GreenNest home">
            <span className="brand-mark">GN</span>
            <span>
              <strong>GreenNest</strong>
              <small>Fresh market</small>
            </span>
          </button>

          <label className="search-box">
            <Search size={18} />
            <input placeholder="Tìm sản phẩm, rau củ, đồ uống..." />
            <button type="button">
              <SlidersHorizontal size={16} />
              Bộ lọc
            </button>
          </label>

          <div className="header-actions">
            {user?.role === "admin" ? (
              <button
                className={route === "admin" ? "active" : ""}
                type="button"
                aria-label="Admin"
                onClick={() => onNavigate("/admin")}
              >
                <Settings size={19} />
                <span>Admin</span>
              </button>
            ) : null}
            <button type="button" aria-label="So sánh">
              <Shuffle size={19} />
              <span>So sánh</span>
            </button>
            <button type="button" aria-label="Yêu thích">
              <Heart size={19} />
              <span>Yêu thích</span>
            </button>
            <button
              className={commerceRoutes.includes(route) ? "active" : ""}
              type="button"
              aria-label="Giỏ hàng"
              onClick={() => onNavigate("/cart")}
            >
              <ShoppingCart size={19} />
              <span>Giỏ hàng{cartItemCount > 0 ? ` (${cartItemCount})` : ""}</span>
            </button>
            <button
              className={isAccountRoute ? "active" : ""}
              type="button"
              aria-label="Tài khoản"
              onClick={() => onNavigate(user ? "/profile" : "/login")}
            >
              <UserRound size={19} />
              <span>{user ? user.fullName.split(" ")[0] : "Tài khoản"}</span>
            </button>
            {user ? (
              <button className="logout-action" type="button" aria-label="Đăng xuất" onClick={onLogout}>
                <LogOut size={19} />
                <span>Đăng xuất</span>
              </button>
            ) : null}
          </div>
        </div>

        <nav className="nav-bar">
          <button className="browse-button" type="button" onClick={() => onNavigate("/categories")}>
            <Menu size={18} />
            Tất cả danh mục
          </button>
          <div className="nav-links">
            {navItems.map((item) => (
              <button
                className={route === item.route ? "active" : ""}
                key={item.label}
                type="button"
                onClick={() => onNavigate(item.path)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="support-line">
            <PhoneCall size={19} />
            <span>1900 888 123</span>
          </div>
        </nav>
      </header>

      {children}

      <footer className="site-footer">
        <div className="footer-service-row">
          <div>
            <Truck size={22} />
            <span>
              <strong>Giao nhanh 2 giờ</strong>
              Nội thành TP. Hồ Chí Minh
            </span>
          </div>
          <div>
            <ShieldCheck size={22} />
            <span>
              <strong>Thanh toán demo an toàn</strong>
              Mock payment qua Payment Service
            </span>
          </div>
          <div>
            <BadgeCheck size={22} />
            <span>
              <strong>Thực phẩm chọn lọc</strong>
              Rau củ, ngũ cốc, đồ uống
            </span>
          </div>
        </div>

        <div className="footer-main">
          <section className="footer-brand">
            <button className="brand footer-logo" type="button" onClick={() => onNavigate("/")} aria-label="GreenNest home">
              <span className="brand-mark">GN</span>
              <span>
                <strong>GreenNest</strong>
                <small>Fresh market</small>
              </span>
            </button>
            <p>
              Website thương mại điện tử mini dùng để demo kiến trúc Microservices và quy trình DevSecOps cho đồ án.
            </p>
            <div className="footer-contact">
              <span>
                <MapPin size={16} />
                Kho hàng DevSecOps Shop, TP. Hồ Chí Minh
              </span>
              <span>
                <PhoneCall size={16} />
                1900 888 123
              </span>
              <span>
                <Mail size={16} />
                support@greennest.local
              </span>
            </div>
          </section>

          <section className="footer-column">
            <h2>Mua hàng</h2>
            <button type="button" onClick={() => onNavigate("/categories")}>
              Danh mục sản phẩm
            </button>
            <button type="button" onClick={() => onNavigate("/cart")}>
              Giỏ hàng
            </button>
            <button type="button" onClick={() => onNavigate(user ? "/checkout" : "/login")}>
              Tạo đơn hàng
            </button>
            <button type="button" onClick={() => onNavigate(user ? "/orders" : "/login")}>
              Theo dõi đơn hàng
            </button>
          </section>

          <section className="footer-column">
            <h2>Tài khoản</h2>
            <button type="button" onClick={() => onNavigate(user ? "/profile" : "/login")}>
              Hồ sơ cá nhân
            </button>
            <button type="button" onClick={() => onNavigate(user ? "/profile/edit" : "/login")}>
              Chỉnh sửa hồ sơ
            </button>
            <button type="button" onClick={() => onNavigate(user ? "/profile/addresses" : "/login")}>
              Địa chỉ giao hàng
            </button>
            <button type="button" onClick={() => onNavigate(user ? "/orders" : "/login")}>
              Lịch sử đơn hàng
            </button>
          </section>

          <section className="footer-column footer-status">
            <h2>DevSecOps</h2>
            <div>
              <Clock3 size={16} />
              <span>Frontend mock đang chạy local</span>
            </div>
            <div>
              <CreditCard size={16} />
              <span>Payment Service đang ở chế độ giả lập</span>
            </div>
            <div>
              <Headphones size={16} />
              <span>Monitoring sẽ nối Prometheus/Grafana ở bước sau</span>
            </div>
          </section>
        </div>

        <div className="footer-bottom">
          <span>GreenNest Market - DevSecOps Microservices Shop</span>
          <span>API Gateway sang Auth/User/Product/Cart/Order/Payment</span>
        </div>
      </footer>
    </div>
  );
}
