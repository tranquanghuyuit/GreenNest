import { Router } from "express";
import { config } from "../config.js";
import { requestJson } from "../utils/http.js";

export const authRouter = Router();

function buildAuthServiceUrl(path: string) {
  return new URL(path, config.authServiceUrl).toString();
}

function authorizationHeader(value: string | undefined) {
  return value ? { Authorization: value } : undefined;
}

authRouter.post("/register", async (request, response, next) => {
  try {
    const data = await requestJson(buildAuthServiceUrl("/auth/register"), {
      method: "POST",
      body: request.body
    });
    response.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", async (request, response, next) => {
  try {
    const data = await requestJson(buildAuthServiceUrl("/auth/login"), {
      method: "POST",
      body: request.body
    });
    response.json(data);
  } catch (error) {
    next(error);
  }
});

authRouter.post("/google/callback", async (request, response, next) => {
  try {
    const data = await requestJson(buildAuthServiceUrl("/auth/google/callback"), {
      method: "POST",
      body: request.body
    });
    response.json(data);
  } catch (error) {
    next(error);
  }
});

authRouter.get("/me", async (request, response, next) => {
  try {
    const data = await requestJson(buildAuthServiceUrl("/auth/me"), {
      headers: authorizationHeader(request.headers.authorization)
    });
    response.json(data);
  } catch (error) {
    next(error);
  }
});

authRouter.post("/refresh", async (request, response, next) => {
  try {
    const data = await requestJson(buildAuthServiceUrl("/auth/refresh"), {
      method: "POST",
      body: request.body
    });
    response.json(data);
  } catch (error) {
    next(error);
  }
});

authRouter.post("/logout", async (request, response, next) => {
  try {
    const data = await requestJson(buildAuthServiceUrl("/auth/logout"), {
      method: "POST",
      body: request.body
    });
    response.json(data);
  } catch (error) {
    next(error);
  }
});
