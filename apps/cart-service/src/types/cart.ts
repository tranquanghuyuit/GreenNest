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

export type CartRecord = {
  id: string;
  userId: string;
  status: "active" | "checked_out";
  createdAt: Date;
  updatedAt: Date;
};

export type CartItemRecord = {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  addedAt: Date;
  updatedAt: Date;
};

export type PublicCartItem = {
  productId: string;
  quantity: number;
};

export type PublicCart = {
  id: string;
  userId: string;
  items: PublicCartItem[];
  updatedAt: string;
};
