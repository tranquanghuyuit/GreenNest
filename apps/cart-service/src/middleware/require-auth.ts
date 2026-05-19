import type { RequestHandler } from "express";
import { CartError } from "../errors/cart-error.js";
import { verifyAccessToken } from "../utils/tokens.js";

export const requireAuth: RequestHandler = (request, response, next) => {
  try {
    const authorization = request.headers.authorization ?? "";
    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new CartError("Missing bearer access token", 401);
    }

    const auth = verifyAccessToken(token);

    if (!auth) {
      throw new CartError("Invalid or expired access token", 401);
    }

    response.locals.auth = auth;
    next();
  } catch (error) {
    next(error);
  }
};
