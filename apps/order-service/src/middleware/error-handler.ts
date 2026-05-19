import type { ErrorRequestHandler } from "express";
import { OrderError } from "../errors/order-error.js";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof OrderError) {
    response.status(error.statusCode).json({
      error: "Order Error",
      message: error.message,
      statusCode: error.statusCode
    });
    return;
  }

  console.error(error);

  response.status(500).json({
    error: "Internal Server Error",
    message: "Unexpected order-service error",
    statusCode: 500
  });
};
