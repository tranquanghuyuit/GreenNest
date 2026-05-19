import { Router } from "express";
import { config } from "../config.js";
import { requestJson } from "../utils/http.js";

export const orderRouter = Router();

function buildOrderServiceUrl(path: string) {
  return new URL(path, config.orderServiceUrl).toString();
}

function authorizationHeader(value: string | undefined) {
  return value ? { Authorization: value } : undefined;
}

orderRouter.get("/", async (request, response, next) => {
  try {
    const data = await requestJson(buildOrderServiceUrl("/orders"), {
      headers: authorizationHeader(request.headers.authorization)
    });
    response.json(data);
  } catch (error) {
    next(error);
  }
});

orderRouter.get("/admin", async (request, response, next) => {
  try {
    const data = await requestJson(buildOrderServiceUrl("/orders/admin"), {
      headers: authorizationHeader(request.headers.authorization)
    });
    response.json(data);
  } catch (error) {
    next(error);
  }
});

orderRouter.get("/:id", async (request, response, next) => {
  try {
    const data = await requestJson(buildOrderServiceUrl(`/orders/${encodeURIComponent(request.params.id)}`), {
      headers: authorizationHeader(request.headers.authorization)
    });
    response.json(data);
  } catch (error) {
    next(error);
  }
});

orderRouter.post("/", async (request, response, next) => {
  try {
    const data = await requestJson(buildOrderServiceUrl("/orders"), {
      method: "POST",
      headers: authorizationHeader(request.headers.authorization),
      body: request.body
    });
    response.status(201).json(data);
  } catch (error) {
    next(error);
  }
});
