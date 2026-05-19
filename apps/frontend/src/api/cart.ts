import type { CartItem } from "../types";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");

type ApiErrorBody = {
  message?: string;
  details?: {
    message?: string;
  };
};

export type CartResponse = {
  cart: {
    id: string;
    userId: string;
    items: CartItem[];
    updatedAt: string;
  };
};

export class CartApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
  }
}

async function requestCart<T>(path: string, accessToken: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers
    }
  });

  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json") ? ((await response.json()) as ApiErrorBody) : null;

  if (!response.ok) {
    throw new CartApiError(data?.details?.message ?? data?.message ?? "Không thể gọi Cart API.", response.status);
  }

  return data as T;
}

export function fetchMyCart(accessToken: string) {
  return requestCart<CartResponse>("/api/cart", accessToken);
}

export function addMyCartItem(accessToken: string, payload: { productId: string; quantity?: number }) {
  return requestCart<CartResponse>("/api/cart/items", accessToken, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateMyCartItem(accessToken: string, productId: string, payload: { quantity: number }) {
  return requestCart<CartResponse>(`/api/cart/items/${encodeURIComponent(productId)}`, accessToken, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function removeMyCartItem(accessToken: string, productId: string) {
  return requestCart<CartResponse>(`/api/cart/items/${encodeURIComponent(productId)}`, accessToken, {
    method: "DELETE"
  });
}

export function clearMyCart(accessToken: string) {
  return requestCart<CartResponse>("/api/cart", accessToken, {
    method: "DELETE"
  });
}
