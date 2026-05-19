import { Router } from "express";
import { getMe, login, loginWithGoogle, logout, refresh, register } from "../services/auth.service.js";

export const authRouter = Router();

function getBearerToken(header: string | undefined) {
  if (!header?.startsWith("Bearer ")) {
    return undefined;
  }

  return header.slice("Bearer ".length).trim();
}

authRouter.post("/register", async (request, response, next) => {
  try {
    const result = await register(request.body);
    response.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", async (request, response, next) => {
  try {
    const result = await login(request.body);
    response.json(result);
  } catch (error) {
    next(error);
  }
});

authRouter.post("/google/callback", async (request, response, next) => {
  try {
    const result = await loginWithGoogle(request.body);
    response.json(result);
  } catch (error) {
    next(error);
  }
});

authRouter.get("/me", async (request, response, next) => {
  try {
    const result = await getMe(getBearerToken(request.headers.authorization));
    response.json(result);
  } catch (error) {
    next(error);
  }
});

authRouter.post("/refresh", async (request, response, next) => {
  try {
    const result = await refresh(request.body?.refreshToken);
    response.json(result);
  } catch (error) {
    next(error);
  }
});

authRouter.post("/logout", async (request, response, next) => {
  try {
    const result = await logout(request.body?.refreshToken);
    response.json(result);
  } catch (error) {
    next(error);
  }
});
