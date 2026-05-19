import { Router } from "express";
import { config } from "../config.js";
import { requestJson } from "../utils/http.js";

export const userRouter = Router();

function buildUserServiceUrl(path: string) {
  return new URL(path, config.userServiceUrl).toString();
}

function authorizationHeader(value: string | undefined) {
  return value ? { Authorization: value } : undefined;
}

userRouter.get("/me", async (request, response, next) => {
  try {
    const data = await requestJson(buildUserServiceUrl("/users/me"), {
      headers: authorizationHeader(request.headers.authorization)
    });
    response.json(data);
  } catch (error) {
    next(error);
  }
});

userRouter.put("/me", async (request, response, next) => {
  try {
    const data = await requestJson(buildUserServiceUrl("/users/me"), {
      method: "PUT",
      headers: authorizationHeader(request.headers.authorization),
      body: request.body
    });
    response.json(data);
  } catch (error) {
    next(error);
  }
});

userRouter.get("/me/addresses", async (request, response, next) => {
  try {
    const data = await requestJson(buildUserServiceUrl("/users/me/addresses"), {
      headers: authorizationHeader(request.headers.authorization)
    });
    response.json(data);
  } catch (error) {
    next(error);
  }
});

userRouter.get("/me/favorites", async (request, response, next) => {
  try {
    const data = await requestJson(buildUserServiceUrl("/users/me/favorites"), {
      headers: authorizationHeader(request.headers.authorization)
    });
    response.json(data);
  } catch (error) {
    next(error);
  }
});

userRouter.post("/me/favorites/:productId", async (request, response, next) => {
  try {
    const data = await requestJson(buildUserServiceUrl(`/users/me/favorites/${encodeURIComponent(request.params.productId)}`), {
      method: "POST",
      headers: authorizationHeader(request.headers.authorization)
    });
    response.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

userRouter.delete("/me/favorites/:productId", async (request, response, next) => {
  try {
    const data = await requestJson(buildUserServiceUrl(`/users/me/favorites/${encodeURIComponent(request.params.productId)}`), {
      method: "DELETE",
      headers: authorizationHeader(request.headers.authorization)
    });
    response.json(data);
  } catch (error) {
    next(error);
  }
});

userRouter.post("/me/addresses", async (request, response, next) => {
  try {
    const data = await requestJson(buildUserServiceUrl("/users/me/addresses"), {
      method: "POST",
      headers: authorizationHeader(request.headers.authorization),
      body: request.body
    });
    response.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

userRouter.patch("/me/addresses/:id", async (request, response, next) => {
  try {
    const data = await requestJson(buildUserServiceUrl(`/users/me/addresses/${encodeURIComponent(request.params.id)}`), {
      method: "PATCH",
      headers: authorizationHeader(request.headers.authorization),
      body: request.body
    });
    response.json(data);
  } catch (error) {
    next(error);
  }
});

userRouter.delete("/me/addresses/:id", async (request, response, next) => {
  try {
    const data = await requestJson(buildUserServiceUrl(`/users/me/addresses/${encodeURIComponent(request.params.id)}`), {
      method: "DELETE",
      headers: authorizationHeader(request.headers.authorization)
    });
    response.json(data);
  } catch (error) {
    next(error);
  }
});
