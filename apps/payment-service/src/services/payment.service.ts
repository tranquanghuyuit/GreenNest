import { config } from "../config.js";
import { PaymentError } from "../errors/payment-error.js";
import {
  createPayment,
  findLatestPaymentByOrderCode,
  findPaymentByCode,
  updatePaymentProviderResult,
  type NewPayment
} from "../repositories/payment.repository.js";
import type { CreatePaymentInput, PaymentMethod, PaymentRecord, PaymentStatus, PublicPayment, VnpayParams } from "../types/payment.js";
import { appendSecureHash, buildQueryString, formatVnpayDate, verifyVnpayParams } from "../utils/vnpay.js";
import { buildVietqrImageUrl, buildVietqrTransferContent } from "../utils/vietqr.js";

function normalizeText(value: string | undefined) {
  return value?.trim() ?? "";
}

function normalizeVnpayOrderInfo(value: string, fallbackOrderCode: string) {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalized || `Thanh toan don hang ${fallbackOrderCode.replace(/[^a-zA-Z0-9]/g, "")}`;
}

function normalizeMethod(value: PaymentMethod | undefined): PaymentMethod {
  if (value === "cod" || value === "bank_transfer" || value === "vnpay") {
    return value;
  }

  throw new PaymentError("Payment method is invalid", 400);
}

function generatePaymentCode() {
  return `PAY${Date.now().toString().slice(-10)}${Math.floor(1000 + Math.random() * 9000)}`;
}

function toPublicPayment(payment: PaymentRecord): PublicPayment {
  return {
    id: payment.id,
    paymentCode: payment.paymentCode,
    orderId: payment.orderId,
    orderCode: payment.orderCode,
    userId: payment.userId,
    amount: Number(payment.amount),
    method: payment.method,
    status: payment.status,
    provider: payment.provider,
    paymentUrl: payment.paymentUrl ?? undefined,
    providerTransactionNo: payment.providerTransactionNo ?? undefined,
    bankCode: payment.bankCode ?? undefined,
    responseCode: payment.responseCode ?? undefined,
    transactionStatus: payment.transactionStatus ?? undefined,
    failureReason: payment.failureReason ?? undefined,
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString()
  };
}

function requireVnpayConfig() {
  if (!config.vnpayTmnCode || !config.vnpayHashSecret) {
    throw new PaymentError("VNPAY sandbox credentials are missing", 500);
  }
}

function buildVnpayPaymentUrl(paymentCode: string, amount: number, orderInfo: string, ipAddr: string) {
  requireVnpayConfig();

  const now = new Date();
  const expireAt = new Date(now.getTime() + 15 * 60 * 1000);
  const params = appendSecureHash({
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: config.vnpayTmnCode,
    vnp_Amount: String(Math.round(amount * 100)),
    vnp_CurrCode: "VND",
    vnp_TxnRef: paymentCode,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: config.vnpayOrderType,
    vnp_Locale: config.vnpayLocale,
    vnp_ReturnUrl: config.vnpayReturnUrl,
    vnp_IpAddr: ipAddr || "127.0.0.1",
    vnp_CreateDate: formatVnpayDate(now),
    vnp_ExpireDate: formatVnpayDate(expireAt)
  });

  return `${config.vnpayPaymentUrl}?${buildQueryString(params)}`;
}

function resolveInitialStatus(method: PaymentMethod): PaymentStatus {
  return "pending";
}

function resolveProvider(method: PaymentMethod) {
  if (method === "vnpay") {
    return "vnpay";
  }

  if (method === "bank_transfer") {
    return "vietqr";
  }

  return "internal";
}

async function createPaymentWithUniqueCode(input: Omit<NewPayment, "paymentCode">) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await createPayment({
        ...input,
        paymentCode: generatePaymentCode()
      });
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
        continue;
      }

      throw error;
    }
  }

  throw new PaymentError("Cannot generate unique payment code", 500);
}

export async function createOrderPayment(input: CreatePaymentInput) {
  const method = normalizeMethod(input.method);
  const orderId = normalizeText(input.orderId);
  const orderCode = normalizeText(input.orderCode);
  const userId = normalizeText(input.userId);
  const amount = Number(input.amount);

  if (!orderId || !orderCode || !userId) {
    throw new PaymentError("Order id, order code and user id are required", 400);
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new PaymentError("Payment amount is invalid", 400);
  }

  if (method === "bank_transfer") {
    const transferContent = buildVietqrTransferContent(orderCode);
    const payment = await createPaymentWithUniqueCode({
      orderId,
      orderCode,
      userId,
      amount,
      method,
      status: "pending",
      provider: "vietqr",
      paymentUrl: buildVietqrImageUrl(amount, transferContent)
    });

    return {
      payment: toPublicPayment(payment),
      paymentUrl: payment.paymentUrl ?? undefined
    };
  }

  if (method !== "vnpay") {
    const payment = await createPaymentWithUniqueCode({
      orderId,
      orderCode,
      userId,
      amount,
      method,
      status: resolveInitialStatus(method),
      provider: resolveProvider(method)
    });

    return {
      payment: toPublicPayment(payment)
    };
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const paymentCode = generatePaymentCode();
    const paymentUrl = buildVnpayPaymentUrl(
      paymentCode,
      amount,
      normalizeVnpayOrderInfo(normalizeText(input.orderInfo) || `Thanh toan don hang ${orderCode}`, orderCode),
      normalizeText(input.ipAddr) || "127.0.0.1"
    );

    try {
      const payment = await createPayment({
        paymentCode,
        orderId,
        orderCode,
        userId,
        amount,
        method,
        status: "pending",
        provider: "vnpay",
        paymentUrl
      });

      return {
        payment: toPublicPayment(payment),
        paymentUrl
      };
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
        continue;
      }

      throw error;
    }
  }

  throw new PaymentError("Cannot generate unique payment code", 500);
}

export async function getPaymentByOrderCode(orderCode: string) {
  const payment = await findLatestPaymentByOrderCode(orderCode);

  if (!payment) {
    throw new PaymentError("Payment not found", 404);
  }

  return {
    payment: toPublicPayment(payment)
  };
}

export async function confirmPaymentByOrderCode(orderCode: string, adminUserId: string) {
  const payment = await findLatestPaymentByOrderCode(orderCode);

  if (!payment) {
    throw new PaymentError("Payment not found", 404);
  }

  if (payment.status === "success") {
    return {
      payment: toPublicPayment(payment)
    };
  }

  const updatedPayment = await updatePaymentProviderResult(payment.paymentCode, {
    status: "success",
    providerTransactionNo: `ADMIN-${Date.now()}`,
    responseCode: "00",
    transactionStatus: "00",
    rawPayload: {
      source: "admin_manual_confirmation",
      confirmedBy: adminUserId,
      confirmedAt: new Date().toISOString()
    }
  });

  if (!updatedPayment) {
    throw new PaymentError("Payment not found", 404);
  }

  await notifyOrderService(updatedPayment, "success");

  return {
    payment: toPublicPayment(updatedPayment)
  };
}

function getVnpayPaymentStatus(params: VnpayParams): PaymentStatus {
  return params.vnp_ResponseCode === "00" && params.vnp_TransactionStatus === "00" ? "success" : "failed";
}

function isSameAmount(payment: PaymentRecord, vnpAmount: string | undefined) {
  return Math.round(Number(payment.amount) * 100) === Number(vnpAmount);
}

async function notifyOrderService(payment: PaymentRecord, status: PaymentStatus) {
  try {
    await fetch(`${config.orderServiceUrl}/orders/internal/${encodeURIComponent(payment.orderId)}/payment-result`, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Internal-Service-Token": config.internalServiceToken
      },
      body: JSON.stringify({
        paymentStatus: status
      })
    });
  } catch (error) {
    console.warn("Cannot notify order-service payment result", error);
  }
}

export async function handleVnpayIpn(params: VnpayParams) {
  try {
    if (!verifyVnpayParams(params)) {
      return { RspCode: "97", Message: "Invalid signature" };
    }

    const payment = await findPaymentByCode(params.vnp_TxnRef ?? "");

    if (!payment) {
      return { RspCode: "01", Message: "Order not found" };
    }

    if (!isSameAmount(payment, params.vnp_Amount)) {
      return { RspCode: "04", Message: "Invalid amount" };
    }

    if (payment.status !== "pending") {
      return { RspCode: "02", Message: "Order already confirmed" };
    }

    const nextStatus = getVnpayPaymentStatus(params);
    const updatedPayment = await updatePaymentProviderResult(payment.paymentCode, {
      status: nextStatus,
      providerTransactionNo: params.vnp_TransactionNo,
      bankCode: params.vnp_BankCode,
      bankTranNo: params.vnp_BankTranNo,
      cardType: params.vnp_CardType,
      payDate: params.vnp_PayDate,
      responseCode: params.vnp_ResponseCode,
      transactionStatus: params.vnp_TransactionStatus,
      failureReason: nextStatus === "failed" ? `VNPAY response ${params.vnp_ResponseCode}` : undefined,
      rawPayload: params
    });

    if (updatedPayment) {
      await notifyOrderService(updatedPayment, nextStatus);
    }

    return { RspCode: "00", Message: "Confirm Success" };
  } catch {
    return { RspCode: "99", Message: "Unknown error" };
  }
}

export async function verifyVnpayReturn(params: VnpayParams) {
  const validSignature = verifyVnpayParams(params);
  const payment = validSignature ? await findPaymentByCode(params.vnp_TxnRef ?? "") : null;

  return {
    validSignature,
    responseCode: params.vnp_ResponseCode,
    transactionStatus: params.vnp_TransactionStatus,
    payment: payment ? toPublicPayment(payment) : null
  };
}
