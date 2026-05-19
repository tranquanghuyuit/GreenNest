import { Router, type Response } from "express";
import { requireAuth } from "../middleware/require-auth.js";
import {
  addMyAddress,
  addMyFavorite,
  deleteMyAddress,
  getMyAddresses,
  getMyFavorites,
  getMyProfile,
  removeMyFavorite,
  updateMyAddress,
  updateMyProfile
} from "../services/user.service.js";
import type { AccessTokenPayload } from "../types/user.js";

export const userRouter = Router();

function getAuth(response: Response) {
  return response.locals.auth as AccessTokenPayload;
}

userRouter.use(requireAuth);

userRouter.get("/me", async (_request, response, next) => {
  try {
    const result = await getMyProfile(getAuth(response));
    response.json(result);
  } catch (error) {
    next(error);
  }
});

userRouter.put("/me", async (request, response, next) => {
  try {
    const result = await updateMyProfile(getAuth(response), request.body);
    response.json(result);
  } catch (error) {
    next(error);
  }
});

userRouter.get("/me/addresses", async (_request, response, next) => {
  try {
    const result = await getMyAddresses(getAuth(response));
    response.json(result);
  } catch (error) {
    next(error);
  }
});

userRouter.get("/me/favorites", async (_request, response, next) => {
  try {
    const result = await getMyFavorites(getAuth(response));
    response.json(result);
  } catch (error) {
    next(error);
  }
});

userRouter.post("/me/favorites/:productId", async (request, response, next) => {
  try {
    const result = await addMyFavorite(getAuth(response), request.params.productId);
    response.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

userRouter.delete("/me/favorites/:productId", async (request, response, next) => {
  try {
    const result = await removeMyFavorite(getAuth(response), request.params.productId);
    response.json(result);
  } catch (error) {
    next(error);
  }
});

userRouter.post("/me/addresses", async (request, response, next) => {
  try {
    const result = await addMyAddress(getAuth(response), request.body);
    response.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

userRouter.patch("/me/addresses/:id", async (request, response, next) => {
  try {
    const result = await updateMyAddress(getAuth(response), request.params.id, request.body);
    response.json(result);
  } catch (error) {
    next(error);
  }
});

userRouter.delete("/me/addresses/:id", async (request, response, next) => {
  try {
    const result = await deleteMyAddress(getAuth(response), request.params.id);
    response.json(result);
  } catch (error) {
    next(error);
  }
});
