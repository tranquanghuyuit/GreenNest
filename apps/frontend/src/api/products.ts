import type { Category, Product } from "../data/catalog";
import { formatMoney } from "../utils/money";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");

type ApiCategory = {
  id: string;
  name: string;
  slug: string;
};

type ApiProduct = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  categoryId: string;
  category: string;
  description: string;
  price: number;
  oldPrice?: number;
  stockQuantity: number;
  unit: string;
  badge: string;
  accent: string;
  imageUrl: string;
  status: "active" | "inactive";
  ratingAverage: number;
  ratingCount: number;
};

export type ProductPayload = {
  name: string;
  brand: string;
  categoryId: string;
  description: string;
  price: number;
  oldPrice?: number | null;
  stockQuantity: number;
  unit: string;
  badge?: string;
  accent?: string;
  imageUrl?: string;
  status?: "active" | "inactive";
};

export type ProductDeal = {
  id: string;
  description: string;
  productIds: string[];
  discountPercent: number;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
};

export type ProductDealPayload = {
  description: string;
  productIds: string[];
  discountPercent: number;
  status?: "active" | "inactive";
};

type ProductReviewResponse = {
  review: {
    id: string;
    productId: string;
    rating: number;
    comment: string;
    updatedAt: string;
  };
  product: ApiProduct;
};

type ProductListResponse = {
  items: ApiProduct[];
  page: number;
  limit: number;
  total: number;
  categories: ApiCategory[];
};

type ProductDealsResponse = {
  items: ProductDeal[];
};

export type CatalogProductsResult = {
  products: Product[];
  categories: Category[];
  total: number;
};

type FetchCatalogProductsOptions = {
  category?: string;
  keyword?: string;
};

const categoryIconById: Record<string, string> = {
  "cat-vegetables": "leaf",
  "cat-fruits": "berry",
  "cat-drinks": "juice",
  "cat-dairy-eggs": "milk",
  "cat-grains": "grain",
  "cat-snacks": "snack",
  "cat-organic": "organic",
  "cat-fast-food": "snack",
  "cat-bakery": "grain"
};

function toProduct(apiProduct: ApiProduct): Product {
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    brand: apiProduct.brand,
    categoryId: apiProduct.categoryId,
    category: apiProduct.category,
    price: formatMoney(apiProduct.price),
    priceValue: apiProduct.price,
    oldPrice: apiProduct.oldPrice ? formatMoney(apiProduct.oldPrice) : undefined,
    badge: apiProduct.badge,
    accent: apiProduct.accent,
    imageUrl: apiProduct.imageUrl,
    unit: apiProduct.unit,
    stockQuantity: apiProduct.stockQuantity,
    description: apiProduct.description,
    ratingAverage: apiProduct.ratingAverage,
    ratingCount: apiProduct.ratingCount
  };
}

function toCategories(apiCategories: ApiCategory[], mappedProducts: Product[]): Category[] {
  const counts = mappedProducts.reduce((result, product) => {
    result.set(product.category, (result.get(product.category) ?? 0) + 1);
    return result;
  }, new Map<string, number>());

  return apiCategories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    icon: categoryIconById[category.id] ?? "organic",
    count: counts.get(category.name) ?? 0
  }));
}

export async function fetchCatalogProducts(options: FetchCatalogProductsOptions = {}): Promise<CatalogProductsResult> {
  const searchParams = new URLSearchParams({ limit: "50" });

  if (options.category) {
    searchParams.set("category", options.category);
  }

  if (options.keyword) {
    searchParams.set("keyword", options.keyword);
  }

  const response = await fetch(`${API_BASE_URL}/api/products?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error(`Cannot load products from API Gateway: ${response.status}`);
  }

  const data = (await response.json()) as ProductListResponse;
  const mappedProducts = data.items.map(toProduct);

  return {
    products: mappedProducts,
    categories: toCategories(data.categories, mappedProducts),
    total: data.total
  };
}

async function requestProductAdmin<T>(path: string, accessToken: string, options: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    throw new Error("Cannot call Product Admin API.");
  }

  return (await response.json()) as T;
}

export function createAdminCategory(accessToken: string, payload: { name: string; slug?: string }) {
  return requestProductAdmin<ApiCategory>("/api/products/categories", accessToken, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function createAdminProduct(accessToken: string, payload: ProductPayload) {
  return requestProductAdmin<ApiProduct>("/api/products", accessToken, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateAdminProduct(accessToken: string, productId: string, payload: ProductPayload) {
  return requestProductAdmin<ApiProduct>(`/api/products/${encodeURIComponent(productId)}`, accessToken, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function updateAdminProductStock(accessToken: string, productId: string, stockQuantity: number) {
  return requestProductAdmin<ApiProduct>(`/api/products/${encodeURIComponent(productId)}/stock`, accessToken, {
    method: "PATCH",
    body: JSON.stringify({ stockQuantity })
  });
}

export async function fetchProductDeals() {
  const response = await fetch(`${API_BASE_URL}/api/products/deals`);

  if (!response.ok) {
    throw new Error("Không tải được danh sách deal.");
  }

  return (await response.json()) as ProductDealsResponse;
}

export function createAdminDeal(accessToken: string, payload: ProductDealPayload) {
  return requestProductAdmin<ProductDeal>("/api/products/deals", accessToken, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function deleteAdminDeal(accessToken: string, dealId: string) {
  return requestProductAdmin<{ deleted: boolean }>(`/api/products/deals/${encodeURIComponent(dealId)}`, accessToken, {
    method: "DELETE"
  });
}

export async function rateProduct(accessToken: string, productId: string, payload: { rating: number; comment?: string }) {
  const response = await fetch(`${API_BASE_URL}/api/products/${encodeURIComponent(productId)}/reviews`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Không lưu được đánh giá sản phẩm.");
  }

  const data = (await response.json()) as ProductReviewResponse;

  return {
    review: data.review,
    product: toProduct(data.product)
  };
}
