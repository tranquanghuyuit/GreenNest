import { Router, type Response } from "express";
import { requireAuth } from "../middleware/require-auth.js";
import {
  addMyCartItem,
  clearMyCart,
  getMyCart,
  removeMyCartItem,
  updateMyCartItem
} from "../services/cart.service.js";
import type { AccessTokenPayload } from "../types/cart.js";

export const cartRouter = Router();

function getAuth(response: Response) {
  return response.locals.auth as AccessTokenPayload;
}

cartRouter.use(requireAuth);

cartRouter.get("/", async (_request, response, next) => {
  try {
    const result = await getMyCart(getAuth(response));
    response.json(result);
  } catch (error) {
    next(error);
  }
});

cartRouter.post("/items", async (request, response, next) => {
  try {
    const result = await addMyCartItem(getAuth(response), request.body);
    response.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

cartRouter.patch("/items/:productId", async (request, response, next) => {
  try {
    const result = await updateMyCartItem(getAuth(response), request.params.productId, request.body);
    response.json(result);
  } catch (error) {
    next(error);
  }
});

cartRouter.delete("/items/:productId", async (request, response, next) => {
  try {
    const result = await removeMyCartItem(getAuth(response), request.params.productId);
    response.json(result);
  } catch (error) {
    next(error);
  }
});

cartRouter.delete("/", async (_request, response, next) => {
  try {
    const result = await clearMyCart(getAuth(response));
    response.json(result);
  } catch (error) {
    next(error);
  }
});
