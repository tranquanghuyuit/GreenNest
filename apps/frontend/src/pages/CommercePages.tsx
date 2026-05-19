import {
  CheckCircle2,
  CreditCard,
  Minus,
  PackageCheck,
  Plus,
  QrCode,
  ReceiptText,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  Truck
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { verifyVnpayReturn } from "../api/payments";
import { fetchCatalogProducts } from "../api/products";
import { CategoryIcon } from "../components/CategoryIcon";
import { ProductVisual } from "../components/ProductVisual";
import { categories as fallbackCategories, products, type Category, type Product } from "../data/catalog";
import type { CartItem, Navigate, Order, Payment, PaymentMethod, UserProfile } from "../types";
import { formatMoney } from "../utils/money";

type CartLine = {
  product: Product;
  quantity: number;
  lineTotal: number;
};

function buildCartLines(cartItems: CartItem[]) {
  return cartItems
    .map((item) => {
      const product = products.find((candidate) => candidate.id === item.productId);

      if (!product) {
        return null;
      }

      return {
        product,
        quantity: item.quantity,
        lineTotal: product.priceValue * item.quantity
      };
    })
    .filter(Boolean) as CartLine[];
}

function getCartSummary(cartItems: CartItem[]) {
  const lines = buildCartLines(cartItems);
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const shippingFee = subtotal >= 300000 || subtotal === 0 ? 0 : 18000;
  const discount = subtotal >= 400000 ? 25000 : 0;

  return {
    lines,
    subtotal,
    shippingFee,
    discount,
    total: Math.max(subtotal + shippingFee - discount, 0)
  };
}

type ProductTileProps = {
  product: Product;
  onAddToCart: (productId: string) => void;
};

function ProductTile({ product, onAddToCart }: ProductTileProps) {
  return (
    <article className="product-card commerce-product-card">
      <span className="badge">{product.badge}</span>
      <ProductVisual product={product} />
      <p>{product.category}</p>
      <h3>{product.name}</h3>
      <small>
        {product.brand} - {product.unit}
      </small>
      <div className="stock-line">
        <span>Còn {product.stockQuantity}</span>
        <span>{product.description}</span>
      </div>
      <div className="price-row">
        <div>
          <strong>{product.price}</strong>
          {product.oldPrice ? <del>{product.oldPrice}</del> : null}
        </div>
        <button type="button" onClick={() => onAddToCart(product.id)}>
          Thêm
        </button>
      </div>
    </article>
  );
}

type CategoriesPageProps = {
  onAddToCart: (productId: string) => void;
};

const ALL_CATEGORIES_LABEL = "Tất cả";

export function CategoriesPage({ onAddToCart }: CategoriesPageProps) {
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES_LABEL);
  const [keyword, setKeyword] = useState("");
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(products);
  const [catalogCategories, setCatalogCategories] = useState<Category[]>(fallbackCategories);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadCatalog() {
      setIsLoading(true);
      setLoadError("");

      try {
        const catalog = await fetchCatalogProducts();

        if (!isActive) {
          return;
        }

        setCatalogProducts(catalog.products.length > 0 ? catalog.products : products);
        setCatalogCategories(catalog.categories.length > 0 ? catalog.categories : fallbackCategories);
      } catch {
        if (!isActive) {
          return;
        }

        setCatalogProducts(products);
        setCatalogCategories(fallbackCategories);
        setLoadError("Chưa gọi được API Gateway, đang hiển thị dữ liệu mock trong frontend.");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadCatalog();

    return () => {
      isActive = false;
    };
  }, []);

  const visibleProducts = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return catalogProducts.filter((product) => {
      const matchCategory = selectedCategory === ALL_CATEGORIES_LABEL || product.category === selectedCategory;
      const matchKeyword =
        !normalizedKeyword ||
        product.name.toLowerCase().includes(normalizedKeyword) ||
        product.brand.toLowerCase().includes(normalizedKeyword);

      return matchCategory && matchKeyword;
    });
  }, [catalogProducts, keyword, selectedCategory]);

  const categoryCounts = useMemo(() => {
    return catalogProducts.reduce((result, product) => {
      result.set(product.category, (result.get(product.category) ?? 0) + 1);
      return result;
    }, new Map<string, number>());
  }, [catalogProducts]);

  return (
    <main className="commerce-page">
      <section className="commerce-hero">
        <div>
          <span className="eyebrow">Product Service</span>
          <h1>Danh mục sản phẩm</h1>
          <p>
            Trang này gọi `GET /api/products` qua API Gateway. Gateway nhận request từ browser rồi gọi Product Service
            để lấy danh sách sản phẩm.
          </p>
        </div>
        <label className="commerce-search">
          <span>Tìm sản phẩm</span>
          <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Nhập tên hoặc hãng" />
        </label>
      </section>

      {isLoading ? <div className="notice">Đang tải sản phẩm từ API Gateway...</div> : null}
      {loadError ? <div className="notice">{loadError}</div> : null}

      <section className="category-overview">
        <button
          className={selectedCategory === ALL_CATEGORIES_LABEL ? "active" : ""}
          type="button"
          onClick={() => setSelectedCategory(ALL_CATEGORIES_LABEL)}
        >
          <ShoppingBag size={20} />
          <span>{ALL_CATEGORIES_LABEL}</span>
          <strong>{catalogProducts.length}</strong>
        </button>
        {catalogCategories.map((category) => (
          <button
            className={selectedCategory === category.name ? "active" : ""}
            key={category.name}
            type="button"
            onClick={() => setSelectedCategory(category.name)}
          >
            <CategoryIcon icon={category.icon} />
            <span>{category.name}</span>
            <strong>{categoryCounts.get(category.name) ?? category.count}</strong>
          </button>
        ))}
      </section>

      <section className="section-heading commerce-heading">
        <div>
          <span>{selectedCategory}</span>
          <h2>{visibleProducts.length} sản phẩm phù hợp</h2>
        </div>
      </section>

      {visibleProducts.length > 0 ? (
        <section className="product-grid">
          {visibleProducts.map((product) => (
            <ProductTile key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </section>
      ) : (
        <section className="empty-commerce">
          <ShoppingBag size={42} />
          <h2>Không có sản phẩm phù hợp</h2>
          <p>Thử đổi danh mục hoặc từ khóa tìm kiếm để xem sản phẩm khác.</p>
        </section>
      )}
    </main>
  );
}

type CartPageProps = {
  cartItems: CartItem[];
  onNavigate: Navigate;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
};

export function CartPage({ cartItems, onNavigate, onUpdateQuantity, onRemoveItem }: CartPageProps) {
  const summary = getCartSummary(cartItems);

  return (
    <main className="commerce-page">
      <section className="section-heading commerce-heading">
        <div>
          <span>Cart Service</span>
          <h1>Giỏ hàng</h1>
        </div>
        <button className="secondary-button" type="button" onClick={() => onNavigate("/categories")}>
          Tiếp tục mua
        </button>
      </section>

      {summary.lines.length === 0 ? (
        <section className="empty-commerce">
          <ShoppingCart size={42} />
          <h2>Giỏ hàng đang trống</h2>
          <p>Chọn vài sản phẩm từ danh mục để tạo luồng Cart sang Order đầu tiên.</p>
          <button className="submit-button compact" type="button" onClick={() => onNavigate("/categories")}>
            Xem danh mục
          </button>
        </section>
      ) : (
        <section className="cart-layout">
          <div className="cart-list">
            {summary.lines.map((line) => (
              <article className="cart-row" key={line.product.id}>
                <ProductVisual product={line.product} />
                <div className="cart-row-info">
                  <span>{line.product.category}</span>
                  <h2>{line.product.name}</h2>
                  <p>
                    {line.product.brand} - {line.product.unit}
                  </p>
                  <strong>{formatMoney(line.product.priceValue)}</strong>
                </div>
                <div className="quantity-control">
                  <button
                    type="button"
                    aria-label="Giảm số lượng"
                    onClick={() => onUpdateQuantity(line.product.id, line.quantity - 1)}
                  >
                    <Minus size={16} />
                  </button>
                  <span>{line.quantity}</span>
                  <button
                    type="button"
                    aria-label="Tăng số lượng"
                    onClick={() => onUpdateQuantity(line.product.id, line.quantity + 1)}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <strong className="line-total">{formatMoney(line.lineTotal)}</strong>
                <button className="remove-button" type="button" aria-label="Xóa sản phẩm" onClick={() => onRemoveItem(line.product.id)}>
                  <Trash2 size={18} />
                </button>
              </article>
            ))}
          </div>

          <OrderSummary
            subtotal={summary.subtotal}
            shippingFee={summary.shippingFee}
            discount={summary.discount}
            total={summary.total}
            actionLabel="Tạo đơn hàng"
            onAction={() => onNavigate("/checkout")}
          />
        </section>
      )}
    </main>
  );
}

type OrderSummaryProps = {
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  actionLabel?: string;
  onAction?: () => void;
};

function OrderSummary({ subtotal, shippingFee, discount, total, actionLabel, onAction }: OrderSummaryProps) {
  return (
    <aside className="order-summary">
      <h2>Tóm tắt đơn hàng</h2>
      <dl>
        <div>
          <dt>Tạm tính</dt>
          <dd>{formatMoney(subtotal)}</dd>
        </div>
        <div>
          <dt>Phí giao hàng</dt>
          <dd>{shippingFee === 0 ? "Miễn phí" : formatMoney(shippingFee)}</dd>
        </div>
        <div>
          <dt>Ưu đãi</dt>
          <dd>-{formatMoney(discount)}</dd>
        </div>
        <div className="summary-total">
          <dt>Tổng thanh toán</dt>
          <dd>{formatMoney(total)}</dd>
        </div>
      </dl>
      {actionLabel && onAction ? (
        <button className="submit-button" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </aside>
  );
}

type CheckoutPageProps = {
  cartItems: CartItem[];
  user: UserProfile;
  onNavigate: Navigate;
  onPlaceOrder: (payload: { paymentMethod: PaymentMethod; addressId: string }) => void;
};

export function CheckoutPage({ cartItems, user, onNavigate, onPlaceOrder }: CheckoutPageProps) {
  const summary = getCartSummary(cartItems);
  const defaultAddress = user.addresses.find((address) => address.isDefault) ?? user.addresses[0];
  const [addressId, setAddressId] = useState(defaultAddress?.id ?? "");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  const [notice, setNotice] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (summary.lines.length === 0) {
      setNotice("Giỏ hàng trống, chưa thể tạo đơn.");
      return;
    }

    if (!addressId) {
      setNotice("Bạn cần thêm hoặc chọn địa chỉ giao hàng.");
      return;
    }

    onPlaceOrder({ paymentMethod, addressId });
  }

  return (
    <main className="commerce-page">
      <section className="section-heading commerce-heading">
        <div>
          <span>Order Service</span>
          <h1>Tạo đơn hàng</h1>
        </div>
      </section>

      <section className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          {notice ? <div className="notice">{notice}</div> : null}

          <section className="checkout-section">
            <div className="panel-title-row">
              <Truck size={20} />
              <div>
                <h2>Địa chỉ giao hàng</h2>
                <p>Order Service sẽ dùng snapshot địa chỉ tại thời điểm tạo đơn.</p>
              </div>
            </div>

            {user.addresses.length === 0 ? (
              <div className="empty-state">
                <p>Bạn chưa có địa chỉ giao hàng.</p>
                <button className="secondary-button" type="button" onClick={() => onNavigate("/profile/addresses")}>
                  Thêm địa chỉ
                </button>
              </div>
            ) : (
              <div className="checkout-options">
                {user.addresses.map((address) => (
                  <label className="checkout-option" key={address.id}>
                    <input
                      checked={addressId === address.id}
                      name="address"
                      onChange={() => setAddressId(address.id)}
                      type="radio"
                    />
                    <span>
                      <strong>
                        {address.label} {address.isDefault ? "(Mặc định)" : ""}
                      </strong>
                      {address.receiverName} - {address.phone}
                      <small>
                        {address.line1}, {address.ward}, {address.district}, {address.city}
                      </small>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </section>

          <section className="checkout-section">
            <div className="panel-title-row">
              <CreditCard size={20} />
              <div>
                <h2>Phương thức thanh toán</h2>
                <p>Chọn COD hoặc chuyển khoản VietQR.</p>
              </div>
            </div>
            <div className="checkout-options">
              <label className="checkout-option">
                <input
                  checked={paymentMethod === "bank_transfer"}
                  name="payment"
                  onChange={() => setPaymentMethod("bank_transfer")}
                  type="radio"
                />
                <span>
                  <strong>Chuyển khoản VietQR</strong>
                  Tự sinh QR đúng số tiền và nội dung đơn hàng
                </span>
              </label>
              <label className="checkout-option">
                <input checked={paymentMethod === "cod"} name="payment" onChange={() => setPaymentMethod("cod")} type="radio" />
                <span>
                  <strong>COD</strong>
                  Thanh toán khi nhận hàng, admin sẽ xác nhận sau
                </span>
              </label>
            </div>
          </section>

          <div className="form-actions">
            <button className="secondary-button" type="button" onClick={() => onNavigate("/cart")}>
              Quay lại giỏ
            </button>
            <button className="submit-button compact" type="submit">
              Đặt hàng
            </button>
          </div>
        </form>

        <OrderSummary
          subtotal={summary.subtotal}
          shippingFee={summary.shippingFee}
          discount={summary.discount}
          total={summary.total}
        />
      </section>
    </main>
  );
}

type OrdersPageProps = {
  orders: Order[];
  onNavigate: Navigate;
  onViewOrder: (orderId: string) => void;
};

export function OrdersPage({ orders, onNavigate, onViewOrder }: OrdersPageProps) {
  return (
    <main className="commerce-page">
      <section className="section-heading commerce-heading">
        <div>
          <span>Order history</span>
          <h1>Lịch sử đơn hàng</h1>
        </div>
        <button className="secondary-button" type="button" onClick={() => onNavigate("/categories")}>
          Mua thêm
        </button>
      </section>

      {orders.length === 0 ? (
        <section className="empty-commerce">
          <ReceiptText size={42} />
          <h2>Chưa có đơn hàng</h2>
          <p>Sau khi checkout thành công, đơn hàng sẽ xuất hiện ở đây.</p>
        </section>
      ) : (
        <section className="orders-list">
          {orders.map((order) => (
            <article className="order-card" key={order.id}>
              <div>
                <span>Mã đơn</span>
                <strong>{order.id}</strong>
              </div>
              <div>
                <span>Ngày tạo</span>
                <strong>{order.createdAt}</strong>
              </div>
              <div>
                <span>Trạng thái</span>
                <strong>{renderStatus(order.status)}</strong>
              </div>
              <div>
                <span>Tổng tiền</span>
                <strong>{formatMoney(order.totalAmount)}</strong>
              </div>
              <button type="button" onClick={() => onViewOrder(order.id)}>
                Xem chi tiết
              </button>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

type OrderDetailPageProps = {
  order: Order | null;
  payment?: Payment;
  onNavigate: Navigate;
};

function BankTransferQrCard({ payment, order }: { payment?: Payment; order: Order }) {
  if (order.paymentMethod !== "bank_transfer" || !payment?.paymentUrl) {
    return null;
  }

  return (
    <section className="vietqr-panel">
      <div className="panel-title-row">
        <QrCode size={20} />
        <div>
          <h2>VietQR chuyển khoản</h2>
          <p>Nội dung chuyển khoản: GN {order.id}</p>
        </div>
      </div>
      <img alt={`VietQR ${order.id}`} src={payment.paymentUrl} />
      <dl>
        <div>
          <dt>Số tiền</dt>
          <dd>{formatMoney(payment.amount)}</dd>
        </div>
        <div>
          <dt>Trạng thái</dt>
          <dd>{payment.status === "success" ? "Đã thanh toán" : "Chưa thanh toán"}</dd>
        </div>
      </dl>
    </section>
  );
}

export function OrderDetailPage({ order, payment, onNavigate }: OrderDetailPageProps) {
  if (!order) {
    return (
      <main className="commerce-page">
        <section className="empty-commerce">
          <ReceiptText size={42} />
          <h2>Không tìm thấy đơn hàng</h2>
          <button className="submit-button compact" type="button" onClick={() => onNavigate("/orders")}>
            Về lịch sử đơn
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="commerce-page">
      <section className="section-heading commerce-heading">
        <div>
          <span>Chi tiết đơn hàng</span>
          <h1>{order.id}</h1>
        </div>
        <button className="secondary-button" type="button" onClick={() => onNavigate("/orders")}>
          Lịch sử đơn
        </button>
      </section>

      <section className="order-detail-layout">
        <article className="order-detail-main">
          <div className="panel-title-row">
            <PackageCheck size={20} />
            <div>
              <h2>Sản phẩm đã đặt</h2>
              <p>Giá và tên sản phẩm được snapshot tại thời điểm tạo đơn.</p>
            </div>
          </div>

          <div className="order-items">
            {order.items.map((item) => (
              <div className="order-item-row" key={item.productId}>
                <div>
                  <strong>{item.productName}</strong>
                  <span>{item.category}</span>
                </div>
                <span>x{item.quantity}</span>
                <span>{formatMoney(item.unitPrice)}</span>
                <strong>{formatMoney(item.lineTotal)}</strong>
              </div>
            ))}
          </div>
        </article>

        <aside className="order-side">
          <section>
            <h2>Thông tin đơn</h2>
            <dl>
              <div>
                <dt>Trạng thái</dt>
                <dd>{renderStatus(order.status)}</dd>
              </div>
              <div>
                <dt>Thanh toán</dt>
                <dd>{renderPayment(order.paymentMethod)}</dd>
              </div>
              <div>
                <dt>Ngày tạo</dt>
                <dd>{order.createdAt}</dd>
              </div>
            </dl>
          </section>
          <BankTransferQrCard order={order} payment={payment} />
          <section>
            <h2>Giao hàng</h2>
            <p>
              {order.shippingAddress.receiverName} - {order.shippingAddress.phone}
            </p>
            <span>
              {order.shippingAddress.line1}, {order.shippingAddress.ward}, {order.shippingAddress.district},{" "}
              {order.shippingAddress.city}
            </span>
          </section>
          <OrderSummary
            subtotal={order.subtotal}
            shippingFee={order.shippingFee}
            discount={order.discount}
            total={order.totalAmount}
          />
        </aside>
      </section>
    </main>
  );
}

type OrderSuccessPageProps = {
  order: Order | null;
  payment?: Payment;
  onNavigate: Navigate;
  onViewDetail: () => void;
};

export function OrderSuccessPage({ order, payment, onNavigate, onViewDetail }: OrderSuccessPageProps) {
  return (
    <main className="commerce-page">
      <section className="success-panel">
        <CheckCircle2 size={58} />
        <span className="eyebrow">Đặt hàng thành công</span>
        <h1>{order ? `Đơn ${order.id} đã được tạo` : "Đơn hàng đã được tạo"}</h1>
        <p>
          Order Service đã tạo đơn, Payment Service lưu giao dịch thanh toán và trạng thái sẽ được cập nhật theo phương thức đã chọn.
        </p>
        {order ? <BankTransferQrCard order={order} payment={payment} /> : null}
        <div className="success-actions">
          <button className="submit-button compact" type="button" onClick={onViewDetail}>
            Xem chi tiết
          </button>
          <button className="secondary-button" type="button" onClick={() => onNavigate("/categories")}>
            Tiếp tục mua
          </button>
        </div>
      </section>
    </main>
  );
}

function renderStatus(status: Order["status"]) {
  const labels: Record<Order["status"], string> = {
    created: "Đã tạo",
    paid: "Đã thanh toán",
    shipping: "Đang giao",
    completed: "Hoàn thành",
    cancelled: "Đã hủy"
  };

  return labels[status];
}

function renderPayment(method: PaymentMethod) {
  const labels: Record<PaymentMethod, string> = {
    cod: "COD",
    mock_card: "Thẻ demo",
    bank_transfer: "Chuyển khoản VietQR",
    vnpay: "Chuyển khoản"
  };

  return labels[method];
}

type VnpayReturnPageProps = {
  onNavigate: Navigate;
};

export function VnpayReturnPage({ onNavigate }: VnpayReturnPageProps) {
  const [state, setState] = useState<{
    isLoading: boolean;
    isValid: boolean;
    isSuccess: boolean;
    orderCode: string;
  }>({
    isLoading: true,
    isValid: false,
    isSuccess: false,
    orderCode: ""
  });

  useEffect(() => {
    let isActive = true;

    async function verifyReturn() {
      try {
        const result = await verifyVnpayReturn(window.location.search);

        if (!isActive) {
          return;
        }

        setState({
          isLoading: false,
          isValid: result.validSignature,
          isSuccess: result.responseCode === "00" && result.transactionStatus === "00",
          orderCode: result.payment?.orderCode ?? ""
        });
      } catch {
        if (isActive) {
          setState({ isLoading: false, isValid: false, isSuccess: false, orderCode: "" });
        }
      }
    }

    verifyReturn();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <main className="commerce-page">
      <section className="empty-commerce">
        <CreditCard size={42} />
        <h1>Kết quả thanh toán VNPAY</h1>
        {state.isLoading ? <p>Đang kiểm tra chữ ký phản hồi từ VNPAY...</p> : null}
        {!state.isLoading && !state.isValid ? <p>Chữ ký phản hồi không hợp lệ. Không cập nhật trạng thái từ trang này.</p> : null}
        {!state.isLoading && state.isValid ? (
          <p>
            {state.isSuccess ? "Thanh toán thành công." : "Thanh toán chưa thành công."}{" "}
            {state.orderCode ? `Mã đơn: ${state.orderCode}` : ""}
          </p>
        ) : null}
        <div className="form-actions">
          <button className="submit-button compact" type="button" onClick={() => onNavigate("/orders")}>
            Xem đơn hàng
          </button>
          <button className="secondary-button" type="button" onClick={() => onNavigate("/")}>
            Về trang chủ
          </button>
        </div>
      </section>
    </main>
  );
}

export { getCartSummary };
