import { PackagePlus, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { ProductPayload } from "../api/products";
import type { Category, Product } from "../data/catalog";

type ProductEditForm = ProductPayload & {
  salePercent: number;
};

type ProductEditModalProps = {
  product: Product;
  categories: Category[];
  onClose: () => void;
  onSave: (productId: string, payload: ProductPayload) => Promise<void>;
};

function parseMoney(value?: string) {
  return value ? Number(value.replace(/[^\d]/g, "")) : 0;
}

function getSalePercent(product: Product) {
  const oldPriceValue = parseMoney(product.oldPrice);

  if (!oldPriceValue || oldPriceValue <= product.priceValue) {
    return 0;
  }

  return Math.round((1 - product.priceValue / oldPriceValue) * 100);
}

function toProductEditForm(product: Product): ProductEditForm {
  return {
    name: product.name,
    brand: product.brand,
    categoryId: product.categoryId ?? "",
    description: product.description,
    price: product.priceValue,
    oldPrice: product.oldPrice ? parseMoney(product.oldPrice) : null,
    stockQuantity: product.stockQuantity,
    unit: product.unit,
    badge: product.badge,
    accent: product.accent,
    imageUrl: product.imageUrl ?? "",
    status: "active",
    salePercent: getSalePercent(product)
  };
}

function toProductPayload(form: ProductEditForm): ProductPayload {
  const salePercent = Math.max(0, Math.min(90, Number(form.salePercent) || 0));
  const oldPrice = salePercent > 0 ? Math.round(Number(form.price) / (1 - salePercent / 100)) : form.oldPrice ?? null;

  return {
    name: form.name,
    brand: form.brand,
    categoryId: form.categoryId,
    description: form.description,
    price: Number(form.price),
    oldPrice,
    stockQuantity: Math.floor(Number(form.stockQuantity)),
    unit: form.unit,
    badge: salePercent > 0 ? `${salePercent}%` : form.badge,
    accent: form.accent,
    imageUrl: form.imageUrl,
    status: form.status
  };
}

export function ProductEditModal({ product, categories, onClose, onSave }: ProductEditModalProps) {
  const [form, setForm] = useState<ProductEditForm>(() => toProductEditForm(product));
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    try {
      await onSave(product.id, toProductPayload(form));
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="admin-edit-backdrop" role="presentation">
      <form className="admin-edit-modal" onSubmit={handleSubmit}>
        <div className="panel-title-row">
          <PackagePlus size={20} />
          <div>
            <h2>Chỉnh sửa sản phẩm</h2>
            <p>{product.name}</p>
          </div>
          <button className="modal-close-button" type="button" aria-label="Đóng" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="admin-form product-admin-form">
          <label>
            Tên sản phẩm
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          </label>
          <label>
            Thương hiệu
            <input value={form.brand} onChange={(event) => setForm({ ...form, brand: event.target.value })} required />
          </label>
          <label>
            Danh mục
            <select value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })} required>
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
            <input value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} required />
          </label>
          <label>
            Giá đang bán
            <input min="0" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} required />
          </label>
          <label>
            Sale (%)
            <input max="90" min="0" type="number" value={form.salePercent} onChange={(event) => setForm({ ...form, salePercent: Number(event.target.value) })} />
          </label>
          <label>
            Tồn kho
            <input
              min="0"
              type="number"
              value={form.stockQuantity}
              onChange={(event) => setForm({ ...form, stockQuantity: Number(event.target.value) })}
              required
            />
          </label>
          <label>
            Trạng thái
            <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as ProductPayload["status"] })}>
              <option value="active">Đang bán</option>
              <option value="inactive">Ẩn sản phẩm</option>
            </select>
          </label>
          <label className="wide">
            Image URL
            <input value={form.imageUrl ?? ""} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} />
          </label>
          <label className="wide">
            Mô tả
            <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
          </label>
        </div>

        <div className="modal-actions">
          <button className="secondary-button" type="button" onClick={onClose}>
            Hủy
          </button>
          <button className="submit-button compact" disabled={isSaving} type="submit">
            {isSaving ? "Đang lưu" : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
}
