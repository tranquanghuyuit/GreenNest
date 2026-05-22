import type { NextFunction, Request, Response } from "express";
import client from "prom-client";
import { config } from "../config.js";

const register = new client.Registry();

register.setDefaultLabels({
  service: config.serviceName
});

client.collectDefaultMetrics({
  register,
  prefix: "greennest_"
});

const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests handled by the service.",
  labelNames: ["method", "route", "status_code"],
  registers: [register]
});

const httpRequestDurationSeconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds.",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [register]
});

function normalizePath(path: string) {
  return path
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi, ":id")
    .replace(/\d+/g, ":id");
}

function resolveRouteLabel(request: Request) {
  const routePath = request.route?.path;
  if (typeof routePath === "string") {
    const route = `${request.baseUrl}${routePath}`;
    return route === "" ? "/" : normalizePath(route);
  }

  const path = request.originalUrl.split("?")[0] ?? request.path;
  return normalizePath(path);
}

export function metricsMiddleware(request: Request, response: Response, next: NextFunction) {
  if (request.path === "/metrics") {
    next();
    return;
  }

  const stopTimer = httpRequestDurationSeconds.startTimer();

  response.on("finish", () => {
    const labels = {
      method: request.method,
      route: resolveRouteLabel(request),
      status_code: String(response.statusCode)
    };

    httpRequestsTotal.inc(labels);
    stopTimer(labels);
  });

  next();
}

export async function metricsHandler(_request: Request, response: Response) {
  response.setHeader("Content-Type", register.contentType);
  response.end(await register.metrics());
}
