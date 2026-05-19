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

export type UserProfileRecord = {
  id: string;
  authUserId: string;
  fullName: string;
  phone: string;
  birthday: string | Date | null;
  gender: string;
  avatarUrl: string | null;
  loyaltyPoint: number;
  marketingOptIn: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type UserAddressRecord = {
  id: string;
  userProfileId: string;
  label: string;
  receiverName: string;
  phone: string;
  line1: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type UserFavoriteRecord = {
  userProfileId: string;
  productId: string;
  createdAt: Date;
};

export type PublicAddress = {
  id: string;
  label: string;
  receiverName: string;
  phone: string;
  line1: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
};

export type PublicFavorite = {
  productId: string;
  createdAt: string;
};

export type PublicProfile = {
  id: string;
  authUserId: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  birthday: string;
  gender: string;
  role: AuthRole;
  memberSince: string;
  loyaltyPoint: number;
  marketingOptIn: boolean;
  addresses: PublicAddress[];
};

export type ProfileUpdateInput = {
  fullName?: string;
  phone?: string;
  birthday?: string;
  gender?: string;
  marketingOptIn?: boolean;
};

export type AddressInput = {
  label?: string;
  receiverName?: string;
  phone?: string;
  line1?: string;
  ward?: string;
  district?: string;
  city?: string;
  isDefault?: boolean;
};
