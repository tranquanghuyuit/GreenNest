import { OrderError } from "../errors/order-error.js";

type JsonRequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

function getUpstreamErrorMessage(data: unknown, fallback: string) {
  if (typeof data === "object" && data !== null) {
    const body = data as { message?: unknown; details?: { message?: unknown } };
    const message = body.details?.message ?? body.message;

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return fallback;
}

export async function requestJson<T>(url: string, options: JsonRequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...options.headers
  };

  const init: RequestInit = {
    method: options.method ?? "GET",
    headers
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
    init.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, init);
  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    throw new OrderError(getUpstreamErrorMessage(data, `Upstream service error: ${response.status}`), response.status);
  }

  return data as T;
}
