import type { RequestHandler } from "express";
import { OrderError } from "../errors/order-error.js";
import { verifyAccessToken } from "../utils/tokens.js";

export const requireAuth: RequestHandler = (request, response, next) => {
  const authorization = request.headers.authorization;
  const token = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : "";
  const payload = verifyAccessToken(token);

  if (!payload) {
    next(new OrderError("Invalid or missing access token", 401));
    return;
  }

  response.locals.auth = payload;
  next();
};
