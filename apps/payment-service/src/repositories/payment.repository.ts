import { randomUUID } from "crypto";
import { pool } from "../db/pool.js";
import type { PaymentMethod, PaymentRecord, PaymentStatus, VnpayParams } from "../types/payment.js";

type PaymentRow = {
  id: string;
  paymentCode: string;
  orderId: string;
  orderCode: string;
  userId: string;
  amount: string;
  method: PaymentMethod;
  status: PaymentStatus;
  provider: string;
  paymentUrl: string | null;
  providerTransactionNo: string | null;
  bankCode: string | null;
  bankTranNo: string | null;
  cardType: string | null;
  payDate: string | null;
  responseCode: string | null;
  transactionStatus: string | null;
  failureReason: string | null;
  rawPayload: Record<string, string> | null;
  createdAt: Date;
  updatedAt: Date;
};

export type NewPayment = {
  paymentCode: string;
  orderId: string;
  orderCode: string;
  userId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  provider: string;
  paymentUrl?: string;
};

export type PaymentProviderUpdate = {
  status: PaymentStatus;
  providerTransactionNo?: string;
  bankCode?: string;
  bankTranNo?: string;
  cardType?: string;
  payDate?: string;
  responseCode?: string;
  transactionStatus?: string;
  failureReason?: string;
  rawPayload?: Record<string, unknown> | VnpayParams;
};

const paymentSelect = `
  id,
  payment_code AS "paymentCode",
  order_id AS "orderId",
  order_code AS "orderCode",
  user_id AS "userId",
  amount,
  method,
  status,
  provider,
  payment_url AS "paymentUrl",
  provider_transaction_no AS "providerTransactionNo",
  bank_code AS "bankCode",
  bank_tran_no AS "bankTranNo",
  card_type AS "cardType",
  pay_date AS "payDate",
  response_code AS "responseCode",
  transaction_status AS "transactionStatus",
  failure_reason AS "failureReason",
  raw_payload AS "rawPayload",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

function mapPayment(row: PaymentRow): PaymentRecord {
  return row;
}

export async function createPayment(input: NewPayment) {
  const result = await pool.query<PaymentRow>(
    `
      INSERT INTO payments (
        id,
        payment_code,
        order_id,
        order_code,
        user_id,
        amount,
        method,
        status,
        provider,
        payment_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING ${paymentSelect}
    `,
    [
      randomUUID(),
      input.paymentCode,
      input.orderId,
      input.orderCode,
      input.userId,
      input.amount,
      input.method,
      input.status,
      input.provider,
      input.paymentUrl ?? null
    ]
  );

  return mapPayment(result.rows[0]);
}

export async function findPaymentByCode(paymentCode: string) {
  const result = await pool.query<PaymentRow>(
    `
      SELECT ${paymentSelect}
      FROM payments
      WHERE payment_code = $1
      LIMIT 1
    `,
    [paymentCode]
  );

  return result.rows[0] ? mapPayment(result.rows[0]) : null;
}

export async function findLatestPaymentByOrderCode(orderCode: string) {
  const result = await pool.query<PaymentRow>(
    `
      SELECT ${paymentSelect}
      FROM payments
      WHERE order_code = $1
      ORDER BY created_at DESC
      LIMIT 1
    `,
    [orderCode]
  );

  return result.rows[0] ? mapPayment(result.rows[0]) : null;
}

export async function updatePaymentProviderResult(paymentCode: string, input: PaymentProviderUpdate) {
  const result = await pool.query<PaymentRow>(
    `
      UPDATE payments
      SET status = $2,
          provider_transaction_no = COALESCE($3, provider_transaction_no),
          bank_code = COALESCE($4, bank_code),
          bank_tran_no = COALESCE($5, bank_tran_no),
          card_type = COALESCE($6, card_type),
          pay_date = COALESCE($7, pay_date),
          response_code = COALESCE($8, response_code),
          transaction_status = COALESCE($9, transaction_status),
          failure_reason = $10,
          raw_payload = COALESCE($11, raw_payload),
          updated_at = NOW()
      WHERE payment_code = $1
      RETURNING ${paymentSelect}
    `,
    [
      paymentCode,
      input.status,
      input.providerTransactionNo,
      input.bankCode,
      input.bankTranNo,
      input.cardType,
      input.payDate,
      input.responseCode,
      input.transactionStatus,
      input.failureReason ?? null,
      input.rawPayload ? JSON.stringify(input.rawPayload) : null
    ]
  );

  return result.rows[0] ? mapPayment(result.rows[0]) : null;
}
