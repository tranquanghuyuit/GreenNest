import type { ErrorRequestHandler } from "express";
import { PaymentError } from "../errors/payment-error.js";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof PaymentError) {
    response.status(error.statusCode).json({
      error: "Payment Error",
      message: error.message,
      statusCode: error.statusCode
    });
    return;
  }

  console.error(error);

  response.status(500).json({
    error: "Internal Server Error",
    message: "Unexpected payment-service error",
    statusCode: 500
  });
};
