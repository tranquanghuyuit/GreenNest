import { CheckCircle2, PackagePlus, Percent, RefreshCw, ShieldCheck, Tags, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { fetchCatalogProducts, fetchProductDeals, type ProductDeal, type ProductDealPayload, type ProductPayload } from "../api/products";
import type { Category, Product } from "../data/catalog";
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
  onCreateDeal: (payload: ProductDealPayload) => Promise<void>;
  onDeleteDeal: (dealId: string) => Promise<void>;
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
  imageUrl: "",
  status: "active"
};

const defaultDealForm: ProductDealPayload = {
  description: "",
  productIds: [],
  discountPercent: 10,
  status: "active"
};

function paymentLabel(payment?: Payment) {
  if (!payment) {
    return "Chưa tạo payment";
  }

  return payment.status === "success" ? "Đã thanh toán" : "Chưa thanh toán";
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

function productNamesForDeal(deal: ProductDeal, products: Product[]) {
  const names = deal.productIds.map((productId) => products.find((product) => product.id === productId)?.name ?? productId);
  return names.join(", ");
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
  onCreateDeal,
  onDeleteDeal
}: AdminPageProps) {
  const [categoryName, setCategoryName] = useState("");
  const [productForm, setProductForm] = useState<ProductPayload>(defaultProductForm);
  const [dealForm, setDealForm] = useState<ProductDealPayload>(defaultDealForm);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [deals, setDeals] = useState<ProductDeal[]>([]);
  const [localNotice, setLocalNotice] = useState("");

  async function refreshProductData() {
    const [catalog, dealResult] = await Promise.all([fetchCatalogProducts(), fetchProductDeals()]);
    setProducts(catalog.products);
    setCategories(catalog.categories);
    setDeals(dealResult.items);
  }

  useEffect(() => {
    let isActive = true;

    async function loadData() {
      try {
        const [catalog, dealResult] = await Promise.all([fetchCatalogProducts(), fetchProductDeals()]);

        if (!isActive) {
          return;
        }

        setProducts(catalog.products);
        setCategories(catalog.categories);
        setDeals(dealResult.items);
      } catch {
        if (isActive) {
          setProducts([]);
          setCategories([]);
          setDeals([]);
        }
      }
    }

    loadData();

    return () => {
      isActive = false;
    };
  }, [notice]);

  const pendingOrders = useMemo(() => {
    return orders.filter((order) => {
      const payment = paymentsByOrderCode[order.id];
      return order.status !== "paid" && order.status !== "cancelled" && payment?.status !== "success";
    });
  }, [orders, paymentsByOrderCode]);

  async function handleCreateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onCreateCategory({ name: categoryName });
    setCategoryName("");
    setLocalNotice("Đã thêm danh mục.");
    await refreshProductData();
  }

  async function handleCreateProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onCreateProduct(productForm);
    setProductForm(defaultProductForm);
    setLocalNotice("Đã thêm sản phẩm.");
    await refreshProductData();
  }

  async function handleCreateDeal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onCreateDeal(dealForm);
    setDealForm(defaultDealForm);
    setLocalNotice("Đã thêm deal.");
    await refreshProductData();
  }

  async function handleDeleteDeal(dealId: string) {
    await onDeleteDeal(dealId);
    setLocalNotice("Đã xóa deal.");
    await refreshProductData();
  }

  return (
    <main className="commerce-page admin-page">
      <section className="section-heading commerce-heading">
        <div>
          <span>Admin</span>
          <h1>Quản lý kho GreenNest</h1>
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
          <strong>{products.length}</strong>
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
              const isCancelled = order.status === "cancelled";
              const canConfirm = !isCancelled && order.status !== "paid" && payment?.status !== "success";

              return (
                <div className="admin-order-row" key={order.id}>
                  <div>
                    <strong>{order.id}</strong>
                    <span>
                      {orderStatusLabel(order.status)} - {paymentLabel(payment)}
                    </span>
                    <small>{formatMoney(order.totalAmount)}</small>
                  </div>
                  <button className={isCancelled ? "cancelled" : ""} disabled={!canConfirm} type="button" onClick={() => onConfirmPayment(order.id)}>
                    {isCancelled ? "Đã hủy" : "Xác nhận đã chuyển khoản"}
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
              <p>Chọn danh mục từ danh sách có sẵn để tránh nhập sai categoryId.</p>
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
              Danh mục
              <select value={productForm.categoryId} onChange={(event) => setProductForm({ ...productForm, categoryId: event.target.value })} required>
                <option value="">Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category.id ?? category.name} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Đơn vị
              <input value={productForm.unit} onChange={(event) => setProductForm({ ...productForm, unit: event.target.value })} required />
            </label>
            <label>
              Giá đang bán
              <input min="0" type="number" value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: Number(event.target.value) })} required />
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
              Image URL
              <input value={productForm.imageUrl ?? ""} onChange={(event) => setProductForm({ ...productForm, imageUrl: event.target.value })} />
            </label>
            <label className="wide">
              Mô tả
              <textarea value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} required />
            </label>
            <button className="submit-button compact" type="submit">
              Thêm sản phẩm
            </button>
          </form>
        </article>

        <article className="checkout-section admin-panel">
          <div className="panel-title-row">
            <Percent size={20} />
            <div>
              <h2>Quản lý deal</h2>
              <p>Deal thuộc Product Service và được lưu trong product-db.</p>
            </div>
          </div>

          <form className="admin-form deal-admin-form" onSubmit={handleCreateDeal}>
            <label className="wide">
              Mô tả deal
              <input value={dealForm.description} onChange={(event) => setDealForm({ ...dealForm, description: event.target.value })} required />
            </label>
            <label>
              Phần trăm giảm
              <input
                max="90"
                min="1"
                type="number"
                value={dealForm.discountPercent}
                onChange={(event) => setDealForm({ ...dealForm, discountPercent: Number(event.target.value) })}
                required
              />
            </label>
            <label className="wide">
              Sản phẩm áp dụng
              <select
                multiple
                value={dealForm.productIds}
                onChange={(event) =>
                  setDealForm({
                    ...dealForm,
                    productIds: Array.from(event.target.selectedOptions).map((option) => option.value)
                  })
                }
                required
              >
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </label>
            <button className="submit-button compact" type="submit">
              Thêm deal
            </button>
          </form>

          <div className="admin-deal-list">
            {deals.length === 0 ? <p>Chưa có deal.</p> : null}
            {deals.map((deal) => (
              <article className="admin-deal-row" key={deal.id}>
                <div>
                  <strong>{deal.discountPercent}% - {deal.description}</strong>
                  <span>{productNamesForDeal(deal, products)}</span>
                </div>
                <button type="button" aria-label={`Xóa ${deal.id}`} onClick={() => handleDeleteDeal(deal.id)}>
                  <Trash2 size={16} />
                </button>
              </article>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
