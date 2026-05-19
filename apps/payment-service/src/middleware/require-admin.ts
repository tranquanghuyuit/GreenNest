import type { RequestHandler } from "express";
import { PaymentError } from "../errors/payment-error.js";
import { verifyAccessToken } from "../utils/tokens.js";

export const requireAdmin: RequestHandler = (request, response, next) => {
  const authorization = request.headers.authorization;
  const token = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : "";
  const payload = verifyAccessToken(token);

  if (!payload) {
    next(new PaymentError("Invalid or missing access token", 401));
    return;
  }

  if (payload.role !== "admin") {
    next(new PaymentError("Admin permission is required", 403));
    return;
  }

  response.locals.auth = payload;
  next();
};
