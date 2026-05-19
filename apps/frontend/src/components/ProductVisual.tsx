import type { CSSProperties } from "react";
import type { Product } from "../data/catalog";

export function ProductVisual({ product }: { product: Product }) {
  if (product.imageUrl) {
    return (
      <div className="product-visual product-visual-image" aria-hidden="true">
        <img src={product.imageUrl} alt="" />
      </div>
    );
  }

  return (
    <div className="product-visual" aria-hidden="true">
      <div className="pack-shadow" />
      <div className="pack" style={{ "--accent": product.accent } as CSSProperties}>
        <div className="pack-top" />
        <div className="pack-label">
          <span>{product.category}</span>
          <strong>{product.name.split(" ").slice(0, 2).join(" ")}</strong>
        </div>
      </div>
    </div>
  );
}
