import type { RequestHandler } from "express";
import { UserError } from "../errors/user-error.js";
import { verifyAccessToken } from "../utils/tokens.js";

export const requireAuth: RequestHandler = (request, response, next) => {
  try {
    const authorization = request.headers.authorization ?? "";
    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new UserError("Missing bearer access token", 401);
    }

    const auth = verifyAccessToken(token);

    if (!auth) {
      throw new UserError("Invalid or expired access token", 401);
    }

    response.locals.auth = auth;
    next();
  } catch (error) {
    next(error);
  }
};
