import { Router, type Request, type Response } from "express";
import { config } from "../config.js";
import { OrderError } from "../errors/order-error.js";
import { requireAuth } from "../middleware/require-auth.js";
import { createMyOrder, getMyOrder, listMyOrders, listOrdersForAdmin, updateOrderPaymentResult } from "../services/order.service.js";
import type { AccessTokenPayload } from "../types/order.js";

export const orderRouter = Router();

function getAuth(response: Response) {
  return response.locals.auth as AccessTokenPayload;
}

function getAccessToken(request: Request) {
  const authorization = request.headers.authorization;
  const token = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : "";

  if (!token) {
    throw new OrderError("Invalid or missing access token", 401);
  }

  return token;
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers["x-forwarded-for"];
  const firstForwardedIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(",")[0];

  return firstForwardedIp?.trim() || request.socket.remoteAddress || "127.0.0.1";
}

function requireInternalToken(request: Request) {
  if (request.headers["x-internal-service-token"] !== config.internalServiceToken) {
    throw new OrderError("Invalid internal service token", 401);
  }
}

orderRouter.patch("/internal/:id/payment-result", async (request, response, next) => {
  try {
    requireInternalToken(request);
    const result = await updateOrderPaymentResult(request.params.id, request.body.paymentStatus);
    response.json(result);
  } catch (error) {
    next(error);
  }
});

orderRouter.use(requireAuth);

orderRouter.get("/admin", async (_request, response, next) => {
  try {
    const result = await listOrdersForAdmin(getAuth(response));
    response.json(result);
  } catch (error) {
    next(error);
  }
});

orderRouter.get("/", async (_request, response, next) => {
  try {
    const result = await listMyOrders(getAuth(response));
    response.json(result);
  } catch (error) {
    next(error);
  }
});

orderRouter.get("/:id", async (request, response, next) => {
  try {
    const result = await getMyOrder(getAuth(response), request.params.id);
    response.json(result);
  } catch (error) {
    next(error);
  }
});

orderRouter.post("/", async (request, response, next) => {
  try {
    const result = await createMyOrder(getAuth(response), getAccessToken(request), request.body, getClientIp(request));
    response.status(201).json(result);
  } catch (error) {
    next(error);
  }
});
