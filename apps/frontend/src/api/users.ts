import type { Address, UserProfile } from "../types";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");

type ApiErrorBody = {
  message?: string;
  details?: {
    message?: string;
  };
};

type ProfileResponse = {
  profile: UserProfile;
};

type AddressesResponse = {
  items: Address[];
};

type AddressResponse = {
  address: Address;
};

type FavoriteResponse = {
  favorite: {
    productId: string;
    createdAt: string;
  };
};

type FavoritesResponse = {
  items: Array<{
    productId: string;
    createdAt: string;
  }>;
};

export type ProfileUpdatePayload = {
  fullName: string;
  phone: string;
  birthday: string;
  gender: string;
  marketingOptIn: boolean;
};

export type AddressPayload = {
  label: string;
  receiverName: string;
  phone: string;
  line1: string;
  ward: string;
  district: string;
  city: string;
  isDefault?: boolean;
};

export class UserApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
  }
}

async function requestUser<T>(path: string, accessToken: string, options: RequestInit = {}) {
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
    throw new UserApiError(data?.details?.message ?? data?.message ?? "Không thể gọi User API.", response.status);
  }

  return data as T;
}

export function fetchMyProfile(accessToken: string) {
  return requestUser<ProfileResponse>("/api/users/me", accessToken);
}

export function updateMyProfile(accessToken: string, payload: ProfileUpdatePayload) {
  return requestUser<ProfileResponse>("/api/users/me", accessToken, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function fetchMyAddresses(accessToken: string) {
  return requestUser<AddressesResponse>("/api/users/me/addresses", accessToken);
}

export function createMyAddress(accessToken: string, payload: AddressPayload) {
  return requestUser<AddressResponse>("/api/users/me/addresses", accessToken, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateMyAddress(accessToken: string, addressId: string, payload: Partial<AddressPayload>) {
  return requestUser<AddressResponse>(`/api/users/me/addresses/${encodeURIComponent(addressId)}`, accessToken, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function deleteMyAddress(accessToken: string, addressId: string) {
  return requestUser<{ success: boolean }>(`/api/users/me/addresses/${encodeURIComponent(addressId)}`, accessToken, {
    method: "DELETE"
  });
}

export function fetchMyFavorites(accessToken: string) {
  return requestUser<FavoritesResponse>("/api/users/me/favorites", accessToken);
}

export function addMyFavorite(accessToken: string, productId: string) {
  return requestUser<FavoriteResponse>(`/api/users/me/favorites/${encodeURIComponent(productId)}`, accessToken, {
    method: "POST"
  });
}

export function deleteMyFavorite(accessToken: string, productId: string) {
  return requestUser<{ success: boolean }>(`/api/users/me/favorites/${encodeURIComponent(productId)}`, accessToken, {
    method: "DELETE"
  });
}
