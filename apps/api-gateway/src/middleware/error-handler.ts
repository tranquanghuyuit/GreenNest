import type { ErrorRequestHandler } from "express";
import { UpstreamError } from "../utils/http.js";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof UpstreamError) {
    response.status(error.statusCode).json({
      error: "Upstream Error",
      message: error.message,
      statusCode: error.statusCode,
      details: error.details
    });
    return;
  }

  console.error(error);

  response.status(500).json({
    error: "Internal Server Error",
    message: "Unexpected api-gateway error",
    statusCode: 500
  });
};
