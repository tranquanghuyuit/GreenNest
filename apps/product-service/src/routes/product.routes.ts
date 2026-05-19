import { Router } from "express";
import { requireAdmin } from "../middleware/require-admin.js";
import {
  createCategory,
  createProduct,
  getProductById,
  listProducts,
  updateProductStock,
  type ProductQuery
} from "../services/product.service.js";

export const productRouter = Router();

productRouter.get("/", async (request, response, next) => {
  try {
    const products = await listProducts(request.query as ProductQuery);
    response.json(products);
  } catch (error) {
    next(error);
  }
});

productRouter.post("/categories", requireAdmin, async (request, response, next) => {
  try {
    const category = await createCategory(request.body);
    response.status(201).json(category);
  } catch (error) {
    next(error);
  }
});

productRouter.post("/", requireAdmin, async (request, response, next) => {
  try {
    const product = await createProduct(request.body);
    response.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

productRouter.patch("/:id/stock", requireAdmin, async (request, response, next) => {
  try {
    const product = await updateProductStock(String(request.params.id), request.body.stockQuantity);
    response.json(product);
  } catch (error) {
    next(error);
  }
});

productRouter.get("/:id", async (request, response, next) => {
  try {
    const product = await getProductById(request.params.id);

    if (!product) {
      response.status(404).json({
        error: "Not Found",
        message: "Product not found",
        statusCode: 404
      });
      return;
    }

    response.json(product);
  } catch (error) {
    next(error);
  }
});
