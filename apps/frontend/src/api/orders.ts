import type { Order, Payment, PaymentMethod } from "../types";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");

type ApiErrorBody = {
  message?: string;
  details?: {
    message?: string;
  };
};

type OrderResponse = {
  order: Order;
  payment?: Payment;
  paymentUrl?: string;
};

type OrdersResponse = {
  items: Order[];
};

export class OrderApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
  }
}

async function requestOrder<T>(path: string, accessToken: string, options: RequestInit = {}) {
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
    throw new OrderApiError(data?.details?.message ?? data?.message ?? "Không thể gọi Order API.", response.status);
  }

  return data as T;
}

export function fetchMyOrders(accessToken: string) {
  return requestOrder<OrdersResponse>("/api/orders", accessToken);
}

export function fetchAdminOrders(accessToken: string) {
  return requestOrder<OrdersResponse>("/api/orders/admin", accessToken);
}

export function fetchMyOrder(accessToken: string, orderId: string) {
  return requestOrder<OrderResponse>(`/api/orders/${encodeURIComponent(orderId)}`, accessToken);
}

export function createMyOrder(accessToken: string, payload: { paymentMethod: PaymentMethod; addressId: string }) {
  return requestOrder<OrderResponse>("/api/orders", accessToken, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
