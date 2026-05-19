import type { ErrorRequestHandler } from "express";
import { CartError } from "../errors/cart-error.js";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof CartError) {
    response.status(error.statusCode).json({
      error: "Cart Error",
      message: error.message,
      statusCode: error.statusCode
    });
    return;
  }

  console.error(error);

  response.status(500).json({
    error: "Internal Server Error",
    message: "Unexpected cart-service error",
    statusCode: 500
  });
};
