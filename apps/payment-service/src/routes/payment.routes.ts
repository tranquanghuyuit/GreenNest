import { Router } from "express";
import { requireAdmin } from "../middleware/require-admin.js";
import { requireInternal } from "../middleware/require-internal.js";
import {
  confirmPaymentByOrderCode,
  createOrderPayment,
  getPaymentByOrderCode,
  handleVnpayIpn,
  verifyVnpayReturn
} from "../services/payment.service.js";
import type { AccessTokenPayload } from "../types/payment.js";
import type { VnpayParams } from "../types/payment.js";

export const paymentRouter = Router();

function getVnpayQuery(query: Record<string, unknown>) {
  return Object.entries(query).reduce<VnpayParams>((result, [key, value]) => {
    if (key.startsWith("vnp_")) {
      result[key] = String(value);
    }

    return result;
  }, {});
}

paymentRouter.post("/", requireInternal, async (request, response, next) => {
  try {
    const result = await createOrderPayment(request.body);
    response.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

paymentRouter.get("/order/:orderCode", async (request, response, next) => {
  try {
    const result = await getPaymentByOrderCode(request.params.orderCode);
    response.json(result);
  } catch (error) {
    next(error);
  }
});

paymentRouter.patch("/admin/orders/:orderCode/confirm", requireAdmin, async (request, response, next) => {
  try {
    const auth = response.locals.auth as AccessTokenPayload;
    const result = await confirmPaymentByOrderCode(String(request.params.orderCode), auth.sub);
    response.json(result);
  } catch (error) {
    next(error);
  }
});

paymentRouter.get("/vnpay/ipn", async (request, response) => {
  const result = await handleVnpayIpn(getVnpayQuery(request.query));
  response.json(result);
});

paymentRouter.get("/vnpay/return", async (request, response, next) => {
  try {
    const result = await verifyVnpayReturn(getVnpayQuery(request.query));
    response.json(result);
  } catch (error) {
    next(error);
  }
});
