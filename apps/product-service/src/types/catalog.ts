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
  imageUrl: string;
  status: "active" | "inactive";
  ratingAverage: number;
  ratingCount: number;
};

export type ProductReview = {
  id: string;
  productId: string;
  userId: string;
  userEmail: string;
  username: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
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
  imageUrl?: string;
  status?: "active" | "inactive";
};

export type ReviewProductInput = {
  rating?: number;
  comment?: string;
};

export type CreateProductDealInput = {
  description?: string;
  productIds?: string[];
  discountPercent?: number;
  status?: "active" | "inactive";
};
