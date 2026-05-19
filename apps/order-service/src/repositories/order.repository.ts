import { randomUUID } from "crypto";
import { pool } from "../db/pool.js";
import type { OrderItemRecord, OrderRecord, OrderStatus, PaymentMethod, PublicAddress } from "../types/order.js";

type OrderRow = {
  id: string;
  orderCode: string;
  userId: string;
  status: OrderStatus;
  subtotal: string;
  shippingFee: string;
  discount: string;
  totalAmount: string;
  paymentMethod: PaymentMethod;
  shippingAddressSnapshot: PublicAddress;
  createdAt: Date;
  updatedAt: Date;
};

type OrderItemRow = {
  id: string;
  orderId: string;
  productId: string;
  productNameSnapshot: string;
  categorySnapshot: string;
  unitPriceSnapshot: string;
  quantity: number;
  lineTotal: string;
  createdAt: Date;
};

export type NewOrderItem = {
  productId: string;
  productNameSnapshot: string;
  categorySnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  lineTotal: number;
};

export type NewOrder = {
  orderCode: string;
  userId: string;
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  shippingAddressSnapshot: PublicAddress;
  items: NewOrderItem[];
};

const orderSelect = `
  id,
  order_code AS "orderCode",
  user_id AS "userId",
  status,
  subtotal,
  shipping_fee AS "shippingFee",
  discount,
  total_amount AS "totalAmount",
  payment_method AS "paymentMethod",
  shipping_address_snapshot AS "shippingAddressSnapshot",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

const orderItemSelect = `
  id,
  order_id AS "orderId",
  product_id AS "productId",
  product_name_snapshot AS "productNameSnapshot",
  category_snapshot AS "categorySnapshot",
  unit_price_snapshot AS "unitPriceSnapshot",
  quantity,
  line_total AS "lineTotal",
  created_at AS "createdAt"
`;

function mapOrder(row: OrderRow): OrderRecord {
  return row;
}

function mapOrderItem(row: OrderItemRow): OrderItemRecord {
  return row;
}

export async function createOrderWithItems(input: NewOrder) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const orderResult = await client.query<OrderRow>(
      `
        INSERT INTO orders (
          id,
          order_code,
          user_id,
          status,
          subtotal,
          shipping_fee,
          discount,
          total_amount,
          payment_method,
          shipping_address_snapshot
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING ${orderSelect}
      `,
      [
        randomUUID(),
        input.orderCode,
        input.userId,
        input.status,
        input.subtotal,
        input.shippingFee,
        input.discount,
        input.totalAmount,
        input.paymentMethod,
        JSON.stringify(input.shippingAddressSnapshot)
      ]
    );
    const order = mapOrder(orderResult.rows[0]);

    for (const item of input.items) {
      await client.query(
        `
          INSERT INTO order_items (
            id,
            order_id,
            product_id,
            product_name_snapshot,
            category_snapshot,
            unit_price_snapshot,
            quantity,
            line_total
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
        [
          randomUUID(),
          order.id,
          item.productId,
          item.productNameSnapshot,
          item.categorySnapshot,
          item.unitPriceSnapshot,
          item.quantity,
          item.lineTotal
        ]
      );
    }

    await client.query("COMMIT");

    return order;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listOrdersByUserId(userId: string) {
  const result = await pool.query<OrderRow>(
    `
      SELECT ${orderSelect}
      FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC
    `,
    [userId]
  );

  return result.rows.map(mapOrder);
}

export async function listAllOrders() {
  const result = await pool.query<OrderRow>(
    `
      SELECT ${orderSelect}
      FROM orders
      ORDER BY created_at DESC
    `
  );

  return result.rows.map(mapOrder);
}

export async function findOrderByUserIdAndPublicId(userId: string, publicId: string) {
  const result = await pool.query<OrderRow>(
    `
      SELECT ${orderSelect}
      FROM orders
      WHERE user_id = $1 AND (order_code = $2 OR id::text = $2)
      LIMIT 1
    `,
    [userId, publicId]
  );

  return result.rows[0] ? mapOrder(result.rows[0]) : null;
}

export async function listOrderItems(orderId: string) {
  const result = await pool.query<OrderItemRow>(
    `
      SELECT ${orderItemSelect}
      FROM order_items
      WHERE order_id = $1
      ORDER BY created_at ASC
    `,
    [orderId]
  );

  return result.rows.map(mapOrderItem);
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const result = await pool.query<OrderRow>(
    `
      UPDATE orders
      SET status = $2,
          updated_at = NOW()
      WHERE id = $1
      RETURNING ${orderSelect}
    `,
    [orderId, status]
  );

  return result.rows[0] ? mapOrder(result.rows[0]) : null;
}
