import { ChevronLeft, ChevronRight, Heart, Minus, Plus, Star } from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";
import { fetchCatalogProducts, fetchProductDeals, type ProductDeal } from "../api/products";
import { CategoryIcon } from "../components/CategoryIcon";
import { ProductVisual } from "../components/ProductVisual";
import { products, type Category, type Product } from "../data/catalog";
import type { CartItem, Navigate } from "../types";
import { formatMoney } from "../utils/money";

type HomePageProps = {
  onNavigate: Navigate;
  onAddToCart: (productId: string) => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  favoriteProductIds: string[];
  onToggleFavorite: (productId: string) => void;
};

function RatingStars({ product }: { product: Product }) {
  const roundedRating = Math.round(product.ratingAverage ?? 0);

  return (
    <div className="rating">
      {Array.from({ length: 5 }).map((_, index) => {
        const rating = index + 1;

        return <Star key={rating} size={13} fill={rating <= roundedRating ? "currentColor" : "none"} />;
      })}
      <span>{(product.ratingAverage ?? 0).toFixed(1)} ({product.ratingCount ?? 0})</span>
    </div>
  );
}

const dealAccents = ["#dff8e9", "#fff2d4", "#e8f4ff", "#f7e8ff"];

function getVisibleDeals(deals: ProductDeal[], startIndex: number) {
  const visibleCount = Math.min(2, deals.length);

  return Array.from({ length: visibleCount }, (_, index) => deals[(startIndex + index) % deals.length]);
}

function getDealProductNames(deal: ProductDeal, catalogProducts: Product[]) {
  const names = deal.productIds
    .map((productId) => catalogProducts.find((product) => product.id === productId)?.name)
    .filter(Boolean);

  return names.length > 0 ? names.join(", ") : "Combo sản phẩm đang được áp dụng ưu đãi";
}

function parseMoney(value?: string) {
  return value ? Number(value.replace(/[^\d]/g, "")) : 0;
}

function applyDealDiscount(product: Product, deal: ProductDeal): Product {
  const originalPriceValue = parseMoney(product.oldPrice) || product.priceValue;
  const discountPrice = Math.round(originalPriceValue * (1 - deal.discountPercent / 100));

  return {
    ...product,
    price: formatMoney(discountPrice),
    priceValue: discountPrice,
    oldPrice: formatMoney(originalPriceValue),
    badge: `-${deal.discountPercent}%`
  };
}

export function HomePage({ onNavigate, onAddToCart, cartItems, onUpdateQuantity, favoriteProductIds, onToggleFavorite }: HomePageProps) {
  const [sidebarCategories, setSidebarCategories] = useState<Category[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [catalogDeals, setCatalogDeals] = useState<ProductDeal[]>([]);
  const [dealStartIndex, setDealStartIndex] = useState(0);
  const [selectedDeal, setSelectedDeal] = useState<ProductDeal | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadSidebarCategories() {
      setIsLoadingCategories(true);
      setCategoryError("");

      try {
        const [catalog, dealsResult] = await Promise.all([fetchCatalogProducts(), fetchProductDeals()]);

        if (!isActive) {
          return;
        }

        setSidebarCategories(catalog.categories);
        setCatalogProducts(catalog.products);
        setCatalogDeals(dealsResult.items.filter((deal) => deal.status === "active"));

        if (catalog.categories.length === 0) {
          setCategoryError("Chưa có danh mục trong Product Service.");
        }
      } catch {
        if (isActive) {
          setSidebarCategories([]);
          setCatalogProducts([]);
          setCatalogDeals([]);
          setCategoryError("Không lấy được danh mục từ Product Service.");
        }
      } finally {
        if (isActive) {
          setIsLoadingCategories(false);
        }
      }
    }

    loadSidebarCategories();

    return () => {
      isActive = false;
    };
  }, []);

  const homeProducts = catalogProducts.length > 0 ? catalogProducts : products;
  const activeDeal = selectedDeal && catalogDeals.some((deal) => deal.id === selectedDeal.id) ? selectedDeal : null;
  const visibleDeals = getVisibleDeals(catalogDeals, dealStartIndex);
  const activeDealProductIds = new Set(activeDeal?.productIds ?? []);
  const visibleProducts = activeDeal
    ? homeProducts.filter((product) => activeDealProductIds.has(product.id)).map((product) => applyDealDiscount(product, activeDeal))
    : homeProducts;

  function moveDeal(direction: "previous" | "next") {
    if (catalogDeals.length <= 1) {
      return;
    }

    setDealStartIndex((current) =>
      direction === "next" ? (current + 1) % catalogDeals.length : (current - 1 + catalogDeals.length) % catalogDeals.length
    );
  }

  function handleChooseDeal(deal: ProductDeal) {
    setSelectedDeal(deal);
    window.requestAnimationFrame(() => {
      document.getElementById("home-products")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <main className="page-grid">
      <aside className="sidebar">
        <section className="panel">
          <h2>Danh mục</h2>
          <div className="category-list">
            {isLoadingCategories ? <p className="sidebar-state">Đang tải danh mục...</p> : null}
            {!isLoadingCategories && categoryError ? <p className="sidebar-state error">{categoryError}</p> : null}
            {!isLoadingCategories && !categoryError
              ? sidebarCategories.map((category) => (
                  <button key={category.name} type="button" onClick={() => onNavigate("/categories")}>
                    <CategoryIcon icon={category.icon} />
                    <span>{category.name}</span>
                    <small>{category.count}</small>
                  </button>
                ))
              : null}
          </div>
        </section>

        <section className="panel tags-panel">
          <h2>Product Tags</h2>
          <div className="tag-cloud">
            <button type="button" onClick={() => onNavigate("/categories")}>Rau sạch</button>
            <button type="button" onClick={() => onNavigate("/categories")}>Organic</button>
            <button type="button" onClick={() => onNavigate("/categories")}>Snack</button>
            <button type="button" onClick={() => onNavigate("/categories")}>Trái cây</button>
            <button type="button" onClick={() => onNavigate("/categories")}>Đồ uống</button>
            <button type="button" onClick={() => onNavigate("/categories")}>Healthy</button>
          </div>
        </section>

        <section className="panel mini-products">
          <h2>Sản phẩm nổi bật</h2>
          {homeProducts.slice(0, 4).map((product) => (
            <article key={product.name} className="mini-product">
              <ProductVisual product={product} />
              <div>
                <h3>{product.name}</h3>
                <RatingStars product={product} />
                <strong>{product.price}</strong>
              </div>
            </article>
          ))}
        </section>
      </aside>

      <section className="content">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">Fresh vegetables</span>
            <h1>Giảm lớn cho thực phẩm tươi mỗi ngày</h1>
            <p>Tiết kiệm tới 50% cho đơn đầu tiên với rau củ, trái cây và ngũ cốc chọn lọc.</p>
            <form className="subscribe-form">
              <input placeholder="Nhập email để nhận ưu đãi" />
              <button type="button" onClick={() => onNavigate("/register")}>
                Đăng ký
              </button>
            </form>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="corn corn-one" />
            <div className="corn corn-two" />
            <div className="leaf leaf-one" />
            <div className="leaf leaf-two" />
            <div className="tomato" />
            <div className="plate" />
          </div>
        </section>

        <section className="section-heading" id="home-products">
          <div>
            <span>{activeDeal ? `Deal giảm ${activeDeal.discountPercent}%` : "Fresh market"}</span>
            <h2>{activeDeal ? activeDeal.description : "Sản phẩm phổ biến"}</h2>
          </div>
          <div className="product-tabs">
            <button className="active" type="button">
              {activeDeal ? "Sản phẩm trong deal" : "Tất cả"}
            </button>
            {activeDeal ? (
              <button type="button" onClick={() => setSelectedDeal(null)}>
                Xem tất cả
              </button>
            ) : null}
          </div>
        </section>

        {activeDeal ? (
          <div className="deal-filter-note">
            Đang hiển thị {visibleProducts.length} sản phẩm thuộc combo deal, giá đã giảm {activeDeal.discountPercent}%.
          </div>
        ) : null}

        {visibleProducts.length > 0 ? (
        <section className="product-grid">
          {visibleProducts.map((product) => {
            const cartQuantity = cartItems.find((item) => item.productId === product.id)?.quantity ?? 0;
            const isFavorite = favoriteProductIds.includes(product.id);

            return (
            <article key={product.name} className="product-card">
              <span className="badge">{product.badge}</span>
              <button className={isFavorite ? "wish active" : "wish"} type="button" aria-label={`Yêu thích ${product.name}`} onClick={() => onToggleFavorite(product.id)}>
                <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
              </button>
              <ProductVisual product={product} />
              <p>{product.category}</p>
              <h3>{product.name}</h3>
              <RatingStars product={product} />
              <small>By {product.brand}</small>
              <div className="price-row">
                <div>
                  <strong>{product.price}</strong>
                  {product.oldPrice ? <del>{product.oldPrice}</del> : null}
                </div>
                {cartQuantity > 0 ? (
                  <div className="quantity-control product-card-quantity">
                    <button type="button" aria-label="Giảm số lượng" onClick={() => onUpdateQuantity(product.id, cartQuantity - 1)}>
                      <Minus size={15} />
                    </button>
                    <span>{cartQuantity}</span>
                    <button type="button" aria-label="Tăng số lượng" onClick={() => onUpdateQuantity(product.id, cartQuantity + 1)}>
                      <Plus size={15} />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => onAddToCart(product.id)}>Thêm</button>
                )}
              </div>
            </article>
            );
          })}
        </section>
        ) : (
          <section className="empty-commerce deal-product-empty">
            <h2>Deal này chưa có sản phẩm hợp lệ</h2>
            <p>Admin cần kiểm tra lại danh sách sản phẩm được gắn vào deal.</p>
            <button className="secondary-button" type="button" onClick={() => setSelectedDeal(null)}>
              Xem tất cả sản phẩm
            </button>
          </section>
        )}

        <section className="section-heading deals-heading">
          <div>
            <span>Ưu đãi hôm nay</span>
            <h2>Deals Of The Day</h2>
          </div>
          {catalogDeals.length > 1 ? (
            <div className="deal-nav">
              <button type="button" aria-label="Deal trước" onClick={() => moveDeal("previous")}>
                <ChevronLeft size={18} />
              </button>
              <button type="button" aria-label="Deal sau" onClick={() => moveDeal("next")}>
                <ChevronRight size={18} />
              </button>
            </div>
          ) : null}
        </section>

        {visibleDeals.length > 0 ? (
        <section className="deal-grid">
          {visibleDeals.map((deal, index) => (
            <article
              key={deal.id}
              className="deal-card"
              style={{ "--deal-bg": dealAccents[(dealStartIndex + index) % dealAccents.length] } as CSSProperties}
            >
              <div>
                <span>Giảm {deal.discountPercent}%</span>
                <h3>{deal.description}</h3>
                <p>{getDealProductNames(deal, homeProducts)}</p>
                <button type="button" onClick={() => handleChooseDeal(deal)}>Mua ngay</button>
              </div>
            </article>
          ))}
        </section>
        ) : (
          <section className="deal-empty">
            <p>Chưa có deal đang hoạt động. Admin có thể thêm deal ở trang Kho.</p>
          </section>
        )}
      </section>
    </main>
  );
}
