export type AuthRole = "customer" | "admin";
export type AuthStatus = "active" | "blocked";

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  role: AuthRole;
  status: AuthStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type PublicUser = {
  id: string;
  email: string;
  username: string;
  role: AuthRole;
  status: AuthStatus;
};

export type AccessTokenPayload = {
  sub: string;
  email: string;
  username: string;
  role: AuthRole;
  type: "access";
  iat: number;
  exp: number;
};
