import type { Payment } from "../types";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");

type VnpayReturnResponse = {
  validSignature: boolean;
  responseCode?: string;
  transactionStatus?: string;
  payment?: {
    orderCode: string;
    status: "pending" | "success" | "failed";
  } | null;
};

type PaymentResponse = {
  payment: Payment;
};

export async function verifyVnpayReturn(search: string) {
  const response = await fetch(`${API_BASE_URL}/api/payments/vnpay/return${search}`);

  if (!response.ok) {
    throw new Error("Cannot verify VNPAY return data.");
  }

  return (await response.json()) as VnpayReturnResponse;
}

export async function fetchPaymentByOrderCode(orderCode: string) {
  const response = await fetch(`${API_BASE_URL}/api/payments/order/${encodeURIComponent(orderCode)}`);

  if (!response.ok) {
    throw new Error("Cannot load payment data.");
  }

  return (await response.json()) as PaymentResponse;
}

export async function confirmAdminPayment(accessToken: string, orderCode: string) {
  const response = await fetch(`${API_BASE_URL}/api/payments/admin/orders/${encodeURIComponent(orderCode)}/confirm`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error("Cannot confirm payment.");
  }

  return (await response.json()) as PaymentResponse;
}
