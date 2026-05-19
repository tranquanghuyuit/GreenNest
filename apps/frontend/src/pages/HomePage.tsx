import { Heart, Star } from "lucide-react";
import type { CSSProperties } from "react";
import { CategoryIcon } from "../components/CategoryIcon";
import { ProductVisual } from "../components/ProductVisual";
import { categories, deals, products } from "../data/catalog";
import type { Navigate } from "../types";

type HomePageProps = {
  onNavigate: Navigate;
  onAddToCart: (productId: string) => void;
};

export function HomePage({ onNavigate, onAddToCart }: HomePageProps) {
  return (
    <main className="page-grid">
      <aside className="sidebar">
        <section className="panel">
          <h2>Danh mục</h2>
          <div className="category-list">
            {categories.map((category) => (
              <button key={category.name} type="button" onClick={() => onNavigate("/categories")}>
                <CategoryIcon icon={category.icon} />
                <span>{category.name}</span>
                <small>{category.count}</small>
              </button>
            ))}
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
          {products.slice(0, 4).map((product) => (
            <article key={product.name} className="mini-product">
              <ProductVisual product={product} />
              <div>
                <h3>{product.name}</h3>
                <div className="rating">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={12} fill="currentColor" />
                  ))}
                </div>
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

        <section className="section-heading">
          <div>
            <span>Fresh market</span>
            <h2>Sản phẩm phổ biến</h2>
          </div>
          <div className="product-tabs">
            <button className="active" type="button">
              Tất cả
            </button>
            <button type="button">Rau củ</button>
            <button type="button">Trái cây</button>
            <button type="button">Đồ uống</button>
            <button type="button">Ngũ cốc</button>
          </div>
        </section>

        <section className="product-grid">
          {products.map((product) => (
            <article key={product.name} className="product-card">
              <span className="badge">{product.badge}</span>
              <button className="wish" type="button" aria-label={`Yêu thích ${product.name}`}>
                <Heart size={16} />
              </button>
              <ProductVisual product={product} />
              <p>{product.category}</p>
              <h3>{product.name}</h3>
              <div className="rating">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={13} fill="currentColor" />
                ))}
                <span>4.8</span>
              </div>
              <small>By {product.brand}</small>
              <div className="price-row">
                <div>
                  <strong>{product.price}</strong>
                  {product.oldPrice ? <del>{product.oldPrice}</del> : null}
                </div>
                <button type="button" onClick={() => onAddToCart(product.id)}>Thêm</button>
              </div>
            </article>
          ))}
        </section>

        <section className="section-heading deals-heading">
          <div>
            <span>Ưu đãi hôm nay</span>
            <h2>Deals Of The Day</h2>
          </div>
        </section>

        <section className="deal-grid">
          {deals.map((deal) => (
            <article key={deal.title} className="deal-card" style={{ "--deal-bg": deal.accent } as CSSProperties}>
              <div>
                <span>Giảm tới 35%</span>
                <h3>{deal.title}</h3>
                <p>{deal.text}</p>
                  <button type="button" onClick={() => onNavigate("/categories")}>Mua ngay</button>
              </div>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
