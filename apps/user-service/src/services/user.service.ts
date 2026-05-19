import { UserError } from "../errors/user-error.js";
import {
  createAddress,
  createFavorite,
  createProfile,
  deleteAddress,
  deleteFavorite,
  findProfileByAuthUserId,
  listAddresses,
  listFavorites,
  updateAddress,
  updateProfile
} from "../repositories/user.repository.js";
import type {
  AccessTokenPayload,
  AddressInput,
  ProfileUpdateInput,
  PublicAddress,
  PublicFavorite,
  PublicProfile,
  UserAddressRecord,
  UserFavoriteRecord,
  UserProfileRecord
} from "../types/user.js";

function normalizeText(value: string | undefined) {
  return value?.trim() ?? "";
}

function formatBirthday(value: string | Date | null) {
  if (!value) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value.slice(0, 10);
}

function formatMemberSince(value: Date) {
  return new Intl.DateTimeFormat("vi-VN").format(value);
}

function toPublicAddress(address: UserAddressRecord): PublicAddress {
  return {
    id: address.id,
    label: address.label,
    receiverName: address.receiverName,
    phone: address.phone,
    line1: address.line1,
    ward: address.ward,
    district: address.district,
    city: address.city,
    isDefault: address.isDefault
  };
}

function toPublicFavorite(favorite: UserFavoriteRecord): PublicFavorite {
  return {
    productId: favorite.productId,
    createdAt: favorite.createdAt.toISOString()
  };
}

function toPublicProfile(
  profile: UserProfileRecord,
  addresses: UserAddressRecord[],
  auth: AccessTokenPayload
): PublicProfile {
  return {
    id: profile.id,
    authUserId: profile.authUserId,
    fullName: profile.fullName,
    username: auth.username,
    email: auth.email,
    phone: profile.phone,
    birthday: formatBirthday(profile.birthday),
    gender: profile.gender,
    role: auth.role,
    memberSince: formatMemberSince(profile.createdAt),
    loyaltyPoint: profile.loyaltyPoint,
    marketingOptIn: profile.marketingOptIn,
    addresses: addresses.map(toPublicAddress)
  };
}

async function ensureProfile(auth: AccessTokenPayload) {
  const existing = await findProfileByAuthUserId(auth.sub);

  if (existing) {
    return existing;
  }

  return createProfile({
    authUserId: auth.sub,
    fullName: auth.username || auth.email.split("@")[0] || "Khách hàng"
  });
}

async function getProfileResponse(auth: AccessTokenPayload, profile?: UserProfileRecord) {
  const activeProfile = profile ?? (await ensureProfile(auth));
  const addresses = await listAddresses(activeProfile.id);

  return {
    profile: toPublicProfile(activeProfile, addresses, auth)
  };
}

export async function getMyProfile(auth: AccessTokenPayload) {
  return getProfileResponse(auth);
}

export async function updateMyProfile(auth: AccessTokenPayload, input: ProfileUpdateInput) {
  const profile = await ensureProfile(auth);
  const fullName = normalizeText(input.fullName);

  if (input.fullName !== undefined && !fullName) {
    throw new UserError("Full name cannot be empty", 400);
  }

  const updatedProfile = await updateProfile(profile.id, {
    fullName: input.fullName === undefined ? undefined : fullName,
    phone: input.phone === undefined ? undefined : normalizeText(input.phone),
    birthday: input.birthday === undefined ? formatBirthday(profile.birthday) : normalizeText(input.birthday),
    gender: input.gender === undefined ? undefined : normalizeText(input.gender),
    marketingOptIn: input.marketingOptIn
  });

  return getProfileResponse(auth, updatedProfile);
}

export async function getMyAddresses(auth: AccessTokenPayload) {
  const profile = await ensureProfile(auth);
  const addresses = await listAddresses(profile.id);

  return {
    items: addresses.map(toPublicAddress)
  };
}

export async function addMyAddress(auth: AccessTokenPayload, input: AddressInput) {
  const profile = await ensureProfile(auth);
  const existingAddresses = await listAddresses(profile.id);
  const label = normalizeText(input.label);
  const receiverName = normalizeText(input.receiverName);
  const phone = normalizeText(input.phone);
  const line1 = normalizeText(input.line1);
  const city = normalizeText(input.city) || "TP. Hồ Chí Minh";

  if (!label || !receiverName || !phone || !line1) {
    throw new UserError("Label, receiver name, phone and address line are required", 400);
  }

  const address = await createAddress(profile.id, {
    label,
    receiverName,
    phone,
    line1,
    ward: normalizeText(input.ward),
    district: normalizeText(input.district),
    city,
    isDefault: input.isDefault ?? existingAddresses.length === 0
  });

  return {
    address: toPublicAddress(address)
  };
}

export async function updateMyAddress(auth: AccessTokenPayload, addressId: string, input: AddressInput) {
  const profile = await ensureProfile(auth);
  const updatedAddress = await updateAddress(profile.id, addressId, {
    label: input.label === undefined ? undefined : normalizeText(input.label),
    receiverName: input.receiverName === undefined ? undefined : normalizeText(input.receiverName),
    phone: input.phone === undefined ? undefined : normalizeText(input.phone),
    line1: input.line1 === undefined ? undefined : normalizeText(input.line1),
    ward: input.ward === undefined ? undefined : normalizeText(input.ward),
    district: input.district === undefined ? undefined : normalizeText(input.district),
    city: input.city === undefined ? undefined : normalizeText(input.city),
    isDefault: input.isDefault
  });

  if (!updatedAddress) {
    throw new UserError("Address not found", 404);
  }

  return {
    address: toPublicAddress(updatedAddress)
  };
}

export async function deleteMyAddress(auth: AccessTokenPayload, addressId: string) {
  const profile = await ensureProfile(auth);
  const deleted = await deleteAddress(profile.id, addressId);

  if (!deleted) {
    throw new UserError("Address not found", 404);
  }

  return {
    success: true
  };
}

export async function getMyFavorites(auth: AccessTokenPayload) {
  const profile = await ensureProfile(auth);
  const favorites = await listFavorites(profile.id);

  return {
    items: favorites.map(toPublicFavorite)
  };
}

export async function addMyFavorite(auth: AccessTokenPayload, productId: string) {
  const profile = await ensureProfile(auth);
  const normalizedProductId = normalizeText(productId);

  if (!normalizedProductId) {
    throw new UserError("Product id is required", 400);
  }

  const favorite = await createFavorite(profile.id, normalizedProductId);

  return {
    favorite: toPublicFavorite(favorite)
  };
}

export async function removeMyFavorite(auth: AccessTokenPayload, productId: string) {
  const profile = await ensureProfile(auth);
  const normalizedProductId = normalizeText(productId);

  if (!normalizedProductId) {
    throw new UserError("Product id is required", 400);
  }

  await deleteFavorite(profile.id, normalizedProductId);

  return {
    success: true
  };
}
