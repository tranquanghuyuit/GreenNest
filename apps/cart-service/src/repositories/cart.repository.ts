import { randomUUID } from "crypto";
import { pool } from "../db/pool.js";
import type { CartItemRecord, CartRecord } from "../types/cart.js";

type CartRow = {
  id: string;
  userId: string;
  status: "active" | "checked_out";
  createdAt: Date;
  updatedAt: Date;
};

type CartItemRow = {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  addedAt: Date;
  updatedAt: Date;
};

const cartSelect = `
  id,
  user_id AS "userId",
  status,
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

const cartItemSelect = `
  id,
  cart_id AS "cartId",
  product_id AS "productId",
  quantity,
  added_at AS "addedAt",
  updated_at AS "updatedAt"
`;

function mapCart(row: CartRow): CartRecord {
  return row;
}

function mapCartItem(row: CartItemRow): CartItemRecord {
  return row;
}

export async function findActiveCartByUserId(userId: string) {
  const result = await pool.query<CartRow>(
    `
      SELECT ${cartSelect}
      FROM carts
      WHERE user_id = $1 AND status = 'active'
    `,
    [userId]
  );

  return result.rows[0] ? mapCart(result.rows[0]) : null;
}

export async function createActiveCart(userId: string) {
  const result = await pool.query<CartRow>(
    `
      INSERT INTO carts (id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id) WHERE status = 'active'
      DO UPDATE SET updated_at = NOW()
      RETURNING ${cartSelect}
    `,
    [randomUUID(), userId]
  );

  return mapCart(result.rows[0]);
}

export async function ensureActiveCart(userId: string) {
  return (await findActiveCartByUserId(userId)) ?? (await createActiveCart(userId));
}

export async function listCartItems(cartId: string) {
  const result = await pool.query<CartItemRow>(
    `
      SELECT ${cartItemSelect}
      FROM cart_items
      WHERE cart_id = $1
      ORDER BY added_at ASC
    `,
    [cartId]
  );

  return result.rows.map(mapCartItem);
}

export async function addCartItem(cartId: string, productId: string, quantity: number) {
  await pool.query(
    `
      INSERT INTO cart_items (id, cart_id, product_id, quantity)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (cart_id, product_id)
      DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity,
                    updated_at = NOW()
    `,
    [randomUUID(), cartId, productId, quantity]
  );

  await touchCart(cartId);
}

export async function setCartItemQuantity(cartId: string, productId: string, quantity: number) {
  const result = await pool.query<CartItemRow>(
    `
      UPDATE cart_items
      SET quantity = $3,
          updated_at = NOW()
      WHERE cart_id = $1 AND product_id = $2
      RETURNING ${cartItemSelect}
    `,
    [cartId, productId, quantity]
  );

  await touchCart(cartId);
  return result.rows[0] ? mapCartItem(result.rows[0]) : null;
}

export async function removeCartItem(cartId: string, productId: string) {
  const result = await pool.query(
    `
      DELETE FROM cart_items
      WHERE cart_id = $1 AND product_id = $2
    `,
    [cartId, productId]
  );

  await touchCart(cartId);
  return (result.rowCount ?? 0) > 0;
}

export async function clearCartItems(cartId: string) {
  await pool.query("DELETE FROM cart_items WHERE cart_id = $1", [cartId]);
  await touchCart(cartId);
}

async function touchCart(cartId: string) {
  await pool.query("UPDATE carts SET updated_at = NOW() WHERE id = $1", [cartId]);
}
