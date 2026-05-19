export class UpstreamError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly details?: unknown
  ) {
    super(message);
  }
}

type JsonRequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

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

  const response = await fetch(url, {
    ...init
  });

  const contentType = response.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    throw new UpstreamError("Upstream service returned an error", response.status, body);
  }

  return body as T;
}

export function fetchJson<T>(url: string): Promise<T> {
  return requestJson<T>(url);
}
