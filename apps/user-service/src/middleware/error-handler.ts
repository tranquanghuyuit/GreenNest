import type { ErrorRequestHandler } from "express";
import { UserError } from "../errors/user-error.js";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof UserError) {
    response.status(error.statusCode).json({
      error: "User Error",
      message: error.message,
      statusCode: error.statusCode
    });
    return;
  }

  console.error(error);

  response.status(500).json({
    error: "Internal Server Error",
    message: "Unexpected user-service error",
    statusCode: 500
  });
};
