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
  status: "active" | "inactive";
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
  status?: "active" | "inactive";
};

type ProductListResponse = {
  items: ApiProduct[];
  page: number;
  limit: number;
  total: number;
  categories: ApiCategory[];
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
    category: apiProduct.category,
    price: formatMoney(apiProduct.price),
    priceValue: apiProduct.price,
    oldPrice: apiProduct.oldPrice ? formatMoney(apiProduct.oldPrice) : undefined,
    badge: apiProduct.badge,
    accent: apiProduct.accent,
    unit: apiProduct.unit,
    stockQuantity: apiProduct.stockQuantity,
    description: apiProduct.description
  };
}

function toCategories(apiCategories: ApiCategory[], mappedProducts: Product[]): Category[] {
  const counts = mappedProducts.reduce((result, product) => {
    result.set(product.category, (result.get(product.category) ?? 0) + 1);
    return result;
  }, new Map<string, number>());

  return apiCategories.map((category) => ({
    name: category.name,
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

export function updateAdminProductStock(accessToken: string, productId: string, stockQuantity: number) {
  return requestProductAdmin<ApiProduct>(`/api/products/${encodeURIComponent(productId)}/stock`, accessToken, {
    method: "PATCH",
    body: JSON.stringify({ stockQuantity })
  });
}
