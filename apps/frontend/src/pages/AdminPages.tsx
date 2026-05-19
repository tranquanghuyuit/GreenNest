import { CheckCircle2, PackagePlus, RefreshCw, ShieldCheck, Tags } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { fetchCatalogProducts, type ProductPayload } from "../api/products";
import type { Order, Payment } from "../types";
import { formatMoney } from "../utils/money";

type AdminPageProps = {
  orders: Order[];
  paymentsByOrderCode: Record<string, Payment>;
  isLoading: boolean;
  notice: string;
  onRefresh: () => void;
  onConfirmPayment: (orderCode: string) => void;
  onCreateCategory: (payload: { name: string; slug?: string }) => Promise<void>;
  onCreateProduct: (payload: ProductPayload) => Promise<void>;
  onUpdateStock: (productId: string, stockQuantity: number) => Promise<void>;
};

type StockItem = {
  id: string;
  name: string;
  category: string;
  stockQuantity: number;
};

const defaultProductForm: ProductPayload = {
  name: "",
  brand: "GreenNest",
  categoryId: "",
  description: "",
  price: 0,
  oldPrice: null,
  stockQuantity: 0,
  unit: "1 gói",
  badge: "New",
  accent: "#3bb77e",
  status: "active"
};

function paymentLabel(payment?: Payment) {
  if (!payment) {
    return "Chưa tạo payment";
  }

  if (payment.status === "success") {
    return "Đã thanh toán";
  }

  return "Chưa thanh toán";
}

function orderStatusLabel(status: Order["status"]) {
  const labels: Record<Order["status"], string> = {
    created: "Chờ xử lý",
    paid: "Đã thanh toán",
    shipping: "Đang giao",
    completed: "Hoàn thành",
    cancelled: "Đã hủy"
  };

  return labels[status];
}

export function AdminPage({
  orders,
  paymentsByOrderCode,
  isLoading,
  notice,
  onRefresh,
  onConfirmPayment,
  onCreateCategory,
  onCreateProduct,
  onUpdateStock
}: AdminPageProps) {
  const [categoryName, setCategoryName] = useState("");
  const [productForm, setProductForm] = useState<ProductPayload>(defaultProductForm);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [stockDrafts, setStockDrafts] = useState<Record<string, number>>({});
  const [localNotice, setLocalNotice] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadProducts() {
      try {
        const result = await fetchCatalogProducts();

        if (!isActive) {
          return;
        }

        const items = result.products.map((product) => ({
          id: product.id,
          name: product.name,
          category: product.category,
          stockQuantity: product.stockQuantity
        }));
        setStockItems(items);
        setStockDrafts(Object.fromEntries(items.map((item) => [item.id, item.stockQuantity])));
      } catch {
        if (isActive) {
          setStockItems([]);
        }
      }
    }

    loadProducts();

    return () => {
      isActive = false;
    };
  }, [notice]);

  const pendingOrders = useMemo(() => {
    return orders.filter((order) => {
      const payment = paymentsByOrderCode[order.id];
      return order.status !== "paid" && payment?.status !== "success";
    });
  }, [orders, paymentsByOrderCode]);

  async function handleCreateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onCreateCategory({ name: categoryName });
    setCategoryName("");
    setLocalNotice("Đã thêm danh mục.");
  }

  async function handleCreateProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onCreateProduct(productForm);
    setProductForm(defaultProductForm);
    setLocalNotice("Đã thêm sản phẩm.");
  }

  async function handleUpdateStock(productId: string) {
    await onUpdateStock(productId, stockDrafts[productId] ?? 0);
    setLocalNotice("Đã cập nhật tồn kho.");
  }

  return (
    <main className="commerce-page admin-page">
      <section className="section-heading commerce-heading">
        <div>
          <span>Admin</span>
          <h1>Quản trị GreenNest</h1>
        </div>
        <button className="secondary-button" type="button" onClick={onRefresh}>
          <RefreshCw size={16} />
          Làm mới
        </button>
      </section>

      {notice || localNotice ? <div className="notice">{notice || localNotice}</div> : null}

      <section className="admin-metrics">
        <article>
          <ShieldCheck size={22} />
          <span>Đơn chờ xác nhận</span>
          <strong>{pendingOrders.length}</strong>
        </article>
        <article>
          <CheckCircle2 size={22} />
          <span>Đơn đã thanh toán</span>
          <strong>{orders.filter((order) => order.status === "paid").length}</strong>
        </article>
        <article>
          <PackagePlus size={22} />
          <span>Sản phẩm đang quản lý</span>
          <strong>{stockItems.length}</strong>
        </article>
      </section>

      <section className="admin-grid">
        <article className="checkout-section admin-panel">
          <div className="panel-title-row">
            <CheckCircle2 size={20} />
            <div>
              <h2>Xác nhận chuyển khoản</h2>
              <p>Đơn chọn VietQR sẽ nằm ở đây cho đến khi admin bấm xác nhận.</p>
            </div>
          </div>

          <div className="admin-order-list">
            {isLoading ? <p>Đang tải đơn hàng...</p> : null}
            {!isLoading && orders.length === 0 ? <p>Chưa có đơn hàng.</p> : null}
            {orders.map((order) => {
              const payment = paymentsByOrderCode[order.id];
              const canConfirm = order.status !== "paid" && payment?.status !== "success";

              return (
                <div className="admin-order-row" key={order.id}>
                  <div>
                    <strong>{order.id}</strong>
                    <span>{orderStatusLabel(order.status)} - {paymentLabel(payment)}</span>
                    <small>{formatMoney(order.totalAmount)}</small>
                  </div>
                  <button disabled={!canConfirm} type="button" onClick={() => onConfirmPayment(order.id)}>
                    Xác nhận đã chuyển khoản
                  </button>
                </div>
              );
            })}
          </div>
        </article>

        <article className="checkout-section admin-panel">
          <div className="panel-title-row">
            <Tags size={20} />
            <div>
              <h2>Thêm danh mục</h2>
              <p>Danh mục mới sẽ được Product Service lưu vào product-db.</p>
            </div>
          </div>
          <form className="admin-form" onSubmit={handleCreateCategory}>
            <label>
              Tên danh mục
              <input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} required />
            </label>
            <button className="submit-button compact" type="submit">
              Thêm danh mục
            </button>
          </form>
        </article>

        <article className="checkout-section admin-panel">
          <div className="panel-title-row">
            <PackagePlus size={20} />
            <div>
              <h2>Thêm sản phẩm</h2>
              <p>Nhập `categoryId` dạng `cat-...`, ví dụ `cat-vegetables`.</p>
            </div>
          </div>
          <form className="admin-form product-admin-form" onSubmit={handleCreateProduct}>
            <label>
              Tên sản phẩm
              <input value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} required />
            </label>
            <label>
              Thương hiệu
              <input value={productForm.brand} onChange={(event) => setProductForm({ ...productForm, brand: event.target.value })} required />
            </label>
            <label>
              Category ID
              <input value={productForm.categoryId} onChange={(event) => setProductForm({ ...productForm, categoryId: event.target.value })} required />
            </label>
            <label>
              Đơn vị
              <input value={productForm.unit} onChange={(event) => setProductForm({ ...productForm, unit: event.target.value })} required />
            </label>
            <label>
              Giá
              <input
                min="0"
                type="number"
                value={productForm.price}
                onChange={(event) => setProductForm({ ...productForm, price: Number(event.target.value) })}
                required
              />
            </label>
            <label>
              Tồn kho
              <input
                min="0"
                type="number"
                value={productForm.stockQuantity}
                onChange={(event) => setProductForm({ ...productForm, stockQuantity: Number(event.target.value) })}
                required
              />
            </label>
            <label className="wide">
              Mô tả
              <textarea
                value={productForm.description}
                onChange={(event) => setProductForm({ ...productForm, description: event.target.value })}
                required
              />
            </label>
            <button className="submit-button compact" type="submit">
              Thêm sản phẩm
            </button>
          </form>
        </article>

        <article className="checkout-section admin-panel">
          <div className="panel-title-row">
            <PackagePlus size={20} />
            <div>
              <h2>Tồn kho</h2>
              <p>Cập nhật số lượng còn lại của từng sản phẩm.</p>
            </div>
          </div>
          <div className="admin-stock-list">
            {stockItems.map((item) => (
              <div className="admin-stock-row" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.category}</span>
                </div>
                <input
                  min="0"
                  type="number"
                  value={stockDrafts[item.id] ?? item.stockQuantity}
                  onChange={(event) => setStockDrafts({ ...stockDrafts, [item.id]: Number(event.target.value) })}
                />
                <button type="button" onClick={() => handleUpdateStock(item.id)}>
                  Lưu
                </button>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
