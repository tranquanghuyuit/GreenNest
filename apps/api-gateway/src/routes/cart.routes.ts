import { Router } from "express";
import { config } from "../config.js";
import { requestJson } from "../utils/http.js";

export const cartRouter = Router();

function buildCartServiceUrl(path: string) {
  return new URL(path, config.cartServiceUrl).toString();
}

function authorizationHeader(value: string | undefined) {
  return value ? { Authorization: value } : undefined;
}

cartRouter.get("/", async (request, response, next) => {
  try {
    const data = await requestJson(buildCartServiceUrl("/cart"), {
      headers: authorizationHeader(request.headers.authorization)
    });
    response.json(data);
  } catch (error) {
    next(error);
  }
});

cartRouter.post("/items", async (request, response, next) => {
  try {
    const data = await requestJson(buildCartServiceUrl("/cart/items"), {
      method: "POST",
      headers: authorizationHeader(request.headers.authorization),
      body: request.body
    });
    response.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

cartRouter.patch("/items/:productId", async (request, response, next) => {
  try {
    const data = await requestJson(buildCartServiceUrl(`/cart/items/${encodeURIComponent(request.params.productId)}`), {
      method: "PATCH",
      headers: authorizationHeader(request.headers.authorization),
      body: request.body
    });
    response.json(data);
  } catch (error) {
    next(error);
  }
});

cartRouter.delete("/items/:productId", async (request, response, next) => {
  try {
    const data = await requestJson(buildCartServiceUrl(`/cart/items/${encodeURIComponent(request.params.productId)}`), {
      method: "DELETE",
      headers: authorizationHeader(request.headers.authorization)
    });
    response.json(data);
  } catch (error) {
    next(error);
  }
});

cartRouter.delete("/", async (request, response, next) => {
  try {
    const data = await requestJson(buildCartServiceUrl("/cart"), {
      method: "DELETE",
      headers: authorizationHeader(request.headers.authorization)
    });
    response.json(data);
  } catch (error) {
    next(error);
  }
});
