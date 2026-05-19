import { Router } from "express";
import { requireAuth } from "../middleware/require-auth.js";
import { requireAdmin } from "../middleware/require-admin.js";
import {
  createCategory,
  createProductDeal,
  createProduct,
  deleteProductDeal,
  getProductById,
  getProductDeals,
  getProductReviews,
  listProducts,
  reviewProduct,
  updateProduct,
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

productRouter.get("/deals", async (request, response, next) => {
  try {
    const deals = await getProductDeals();
    response.json({ items: deals });
  } catch (error) {
    next(error);
  }
});

productRouter.post("/deals", requireAdmin, async (request, response, next) => {
  try {
    const deal = await createProductDeal(request.body);
    response.status(201).json(deal);
  } catch (error) {
    next(error);
  }
});

productRouter.delete("/deals/:id", requireAdmin, async (request, response, next) => {
  try {
    const result = await deleteProductDeal(String(request.params.id));
    response.json(result);
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

productRouter.patch("/:id", requireAdmin, async (request, response, next) => {
  try {
    const product = await updateProduct(String(request.params.id), request.body);
    response.json(product);
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

productRouter.get("/:id/reviews", async (request, response, next) => {
  try {
    const reviews = await getProductReviews(String(request.params.id));
    response.json({ items: reviews });
  } catch (error) {
    next(error);
  }
});

productRouter.post("/:id/reviews", requireAuth, async (request, response, next) => {
  try {
    const result = await reviewProduct(String(request.params.id), request.body, response.locals.auth);
    response.json(result);
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
