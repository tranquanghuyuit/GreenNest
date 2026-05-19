import { Router } from "express";
import { config } from "../config.js";
import { requestJson } from "../utils/http.js";

export const paymentRouter = Router();

function buildPaymentServiceUrl(path: string, query?: string) {
  const url = new URL(path, config.paymentServiceUrl);

  if (query) {
    url.search = query;
  }

  return url.toString();
}

function authorizationHeader(value: string | undefined) {
  return value ? { Authorization: value } : undefined;
}

paymentRouter.get("/order/:orderCode", async (request, response, next) => {
  try {
    const data = await requestJson(buildPaymentServiceUrl(`/payments/order/${encodeURIComponent(request.params.orderCode)}`));
    response.json(data);
  } catch (error) {
    next(error);
  }
});

paymentRouter.patch("/admin/orders/:orderCode/confirm", async (request, response, next) => {
  try {
    const data = await requestJson(buildPaymentServiceUrl(`/payments/admin/orders/${encodeURIComponent(request.params.orderCode)}/confirm`), {
      method: "PATCH",
      headers: authorizationHeader(request.headers.authorization)
    });
    response.json(data);
  } catch (error) {
    next(error);
  }
});

paymentRouter.get("/vnpay/ipn", async (request, response, next) => {
  try {
    const data = await requestJson(buildPaymentServiceUrl("/payments/vnpay/ipn", new URLSearchParams(request.query as Record<string, string>).toString()));
    response.json(data);
  } catch (error) {
    next(error);
  }
});

paymentRouter.get("/vnpay/return", async (request, response, next) => {
  try {
    const data = await requestJson(
      buildPaymentServiceUrl("/payments/vnpay/return", new URLSearchParams(request.query as Record<string, string>).toString())
    );
    response.json(data);
  } catch (error) {
    next(error);
  }
});
