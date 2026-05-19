import { Router } from "express";
import { config } from "../config.js";
import { fetchJson, requestJson } from "../utils/http.js";

export const productRouter = Router();

function buildProductServiceUrl(path: string, queryString = "") {
  const url = new URL(path, config.productServiceUrl);

  if (queryString) {
    url.search = queryString;
  }

  return url.toString();
}

function authorizationHeader(value: string | undefined) {
  return value ? { Authorization: value } : undefined;
}

productRouter.get("/", async (request, response, next) => {
  try {
    const data = await fetchJson(buildProductServiceUrl("/products", request.url.split("?")[1] ?? ""));
    response.json(data);
  } catch (error) {
    next(error);
  }
});

productRouter.post("/categories", async (request, response, next) => {
  try {
    const data = await requestJson(buildProductServiceUrl("/products/categories"), {
      method: "POST",
      headers: authorizationHeader(request.headers.authorization),
      body: request.body
    });
    response.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

productRouter.get("/deals", async (request, response, next) => {
  try {
    const data = await fetchJson(buildProductServiceUrl("/products/deals"));
    response.json(data);
  } catch (error) {
    next(error);
  }
});

productRouter.post("/deals", async (request, response, next) => {
  try {
    const data = await requestJson(buildProductServiceUrl("/products/deals"), {
      method: "POST",
      headers: authorizationHeader(request.headers.authorization),
      body: request.body
    });
    response.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

productRouter.delete("/deals/:id", async (request, response, next) => {
  try {
    const data = await requestJson(buildProductServiceUrl(`/products/deals/${encodeURIComponent(request.params.id)}`), {
      method: "DELETE",
      headers: authorizationHeader(request.headers.authorization)
    });
    response.json(data);
  } catch (error) {
    next(error);
  }
});

productRouter.post("/", async (request, response, next) => {
  try {
    const data = await requestJson(buildProductServiceUrl("/products"), {
      method: "POST",
      headers: authorizationHeader(request.headers.authorization),
      body: request.body
    });
    response.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

productRouter.patch("/:id", async (request, response, next) => {
  try {
    const data = await requestJson(buildProductServiceUrl(`/products/${encodeURIComponent(request.params.id)}`), {
      method: "PATCH",
      headers: authorizationHeader(request.headers.authorization),
      body: request.body
    });
    response.json(data);
  } catch (error) {
    next(error);
  }
});

productRouter.patch("/:id/stock", async (request, response, next) => {
  try {
    const data = await requestJson(buildProductServiceUrl(`/products/${encodeURIComponent(request.params.id)}/stock`), {
      method: "PATCH",
      headers: authorizationHeader(request.headers.authorization),
      body: request.body
    });
    response.json(data);
  } catch (error) {
    next(error);
  }
});

productRouter.get("/:id/reviews", async (request, response, next) => {
  try {
    const data = await fetchJson(buildProductServiceUrl(`/products/${encodeURIComponent(request.params.id)}/reviews`));
    response.json(data);
  } catch (error) {
    next(error);
  }
});

productRouter.post("/:id/reviews", async (request, response, next) => {
  try {
    const data = await requestJson(buildProductServiceUrl(`/products/${encodeURIComponent(request.params.id)}/reviews`), {
      method: "POST",
      headers: authorizationHeader(request.headers.authorization),
      body: request.body
    });
    response.json(data);
  } catch (error) {
    next(error);
  }
});

productRouter.get("/:id", async (request, response, next) => {
  try {
    const data = await fetchJson(buildProductServiceUrl(`/products/${encodeURIComponent(request.params.id)}`));
    response.json(data);
  } catch (error) {
    next(error);
  }
});
