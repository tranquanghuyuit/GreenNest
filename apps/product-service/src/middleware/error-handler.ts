import type { ErrorRequestHandler } from "express";
import { ProductError } from "../errors/product-error.js";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  console.error(error);

  if (error instanceof ProductError) {
    response.status(error.statusCode).json({
      error: "Product Error",
      message: error.message,
      statusCode: error.statusCode
    });
    return;
  }

  response.status(500).json({
    error: "Internal Server Error",
    message: "Unexpected product-service error",
    statusCode: 500
  });
};
