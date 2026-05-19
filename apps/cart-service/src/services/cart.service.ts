import { CartError } from "../errors/cart-error.js";
import {
  addCartItem,
  clearCartItems,
  ensureActiveCart,
  listCartItems,
  removeCartItem,
  setCartItemQuantity
} from "../repositories/cart.repository.js";
import type { AccessTokenPayload, CartRecord, PublicCart } from "../types/cart.js";

type CartItemInput = {
  productId?: string;
  quantity?: number;
};

function normalizeProductId(productId: string | undefined) {
  return productId?.trim() ?? "";
}

function normalizeQuantity(quantity: number | undefined, fallback = 1) {
  if (quantity === undefined) {
    return fallback;
  }

  return Math.floor(Number(quantity));
}

async function toPublicCart(cart: CartRecord): Promise<PublicCart> {
  const items = await listCartItems(cart.id);

  return {
    id: cart.id,
    userId: cart.userId,
    items: items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity
    })),
    updatedAt: cart.updatedAt.toISOString()
  };
}

export async function getMyCart(auth: AccessTokenPayload) {
  const cart = await ensureActiveCart(auth.sub);

  return {
    cart: await toPublicCart(cart)
  };
}

export async function addMyCartItem(auth: AccessTokenPayload, input: CartItemInput) {
  const productId = normalizeProductId(input.productId);
  const quantity = normalizeQuantity(input.quantity, 1);

  if (!productId) {
    throw new CartError("Product id is required", 400);
  }

  if (quantity <= 0) {
    throw new CartError("Quantity must be greater than 0", 400);
  }

  const cart = await ensureActiveCart(auth.sub);
  await addCartItem(cart.id, productId, quantity);

  return {
    cart: await toPublicCart(cart)
  };
}

export async function updateMyCartItem(auth: AccessTokenPayload, productId: string, input: CartItemInput) {
  const normalizedProductId = normalizeProductId(productId);
  const quantity = normalizeQuantity(input.quantity, 0);
  const cart = await ensureActiveCart(auth.sub);

  if (!normalizedProductId) {
    throw new CartError("Product id is required", 400);
  }

  if (quantity <= 0) {
    await removeCartItem(cart.id, normalizedProductId);
    return {
      cart: await toPublicCart(cart)
    };
  }

  await setCartItemQuantity(cart.id, normalizedProductId, quantity);

  return {
    cart: await toPublicCart(cart)
  };
}

export async function removeMyCartItem(auth: AccessTokenPayload, productId: string) {
  const normalizedProductId = normalizeProductId(productId);
  const cart = await ensureActiveCart(auth.sub);

  if (!normalizedProductId) {
    throw new CartError("Product id is required", 400);
  }

  await removeCartItem(cart.id, normalizedProductId);

  return {
    cart: await toPublicCart(cart)
  };
}

export async function clearMyCart(auth: AccessTokenPayload) {
  const cart = await ensureActiveCart(auth.sub);
  await clearCartItems(cart.id);

  return {
    cart: await toPublicCart(cart)
  };
}
