export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type AuthRole = "customer" | "admin";

export type AccessTokenPayload = {
  sub: string;
  email: string;
  username: string;
  role: AuthRole;
  type: "access";
  iat: number;
  exp: number;
};

export type Product = {
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

export type CreateCategoryInput = {
  name?: string;
  slug?: string;
};

export type CreateProductInput = {
  name?: string;
  slug?: string;
  brand?: string;
  categoryId?: string;
  description?: string;
  price?: number;
  oldPrice?: number | null;
  stockQuantity?: number;
  unit?: string;
  badge?: string;
  accent?: string;
  status?: "active" | "inactive";
};
