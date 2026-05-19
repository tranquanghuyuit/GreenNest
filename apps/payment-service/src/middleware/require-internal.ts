import type { RequestHandler } from "express";
import { config } from "../config.js";
import { PaymentError } from "../errors/payment-error.js";

export const requireInternal: RequestHandler = (request, _response, next) => {
  if (request.headers["x-internal-service-token"] !== config.internalServiceToken) {
    next(new PaymentError("Invalid internal service token", 401));
    return;
  }

  next();
};
