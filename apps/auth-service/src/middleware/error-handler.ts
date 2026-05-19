import type { ErrorRequestHandler } from "express";
import { AuthError } from "../errors/auth-error.js";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof AuthError) {
    response.status(error.statusCode).json({
      error: "Auth Error",
      message: error.message,
      statusCode: error.statusCode
    });
    return;
  }

  console.error(error);

  response.status(500).json({
    error: "Internal Server Error",
    message: "Unexpected auth-service error",
    statusCode: 500
  });
};
