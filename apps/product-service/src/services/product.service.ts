import {
  countProducts,
  createCategory as createCategoryInDatabase,
  createProductDeal as createProductDealInDatabase,
  createProduct as createProductInDatabase,
  deleteProductDeal as deleteProductDealInDatabase,
  findProductById,
  listProductDeals,
  listProductReviews,
  listCategories,
  listProducts as listProductsFromDatabase,
  updateProduct as updateProductInDatabase,
  upsertProductReview,
  updateProductStock as updateProductStockInDatabase
} from "../repositories/product.repository.js";
import { ProductError } from "../errors/product-error.js";
import type {
  AccessTokenPayload,
  Category,
  CreateCategoryInput,
  CreateProductDealInput,
  CreateProductInput,
  Product,
  ReviewProductInput
} from "../types/catalog.js";

export type ProductQuery = {
  page?: string;
  limit?: string;
  category?: string;
  keyword?: string;
};

export type ProductListResponse = {
  items: Product[];
  page: number;
  limit: number;
  total: number;
  categories: Category[];
};

function toPositiveNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeText(value: string | undefined) {
  return value?.trim() ?? "";
}

function slugify(value: string) {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `item-${Date.now()}`;
}

function assertNonNegativeNumber(value: unknown, fieldName: string) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue) || numberValue < 0) {
    throw new ProductError(`${fieldName} is invalid`, 400);
  }

  return numberValue;
}

export async function listProducts(query: ProductQuery): Promise<ProductListResponse> {
  const page = toPositiveNumber(query.page, 1);
  const limit = Math.min(toPositiveNumber(query.limit, 20), 50);
  const offset = (page - 1) * limit;
  const filter = {
    category: query.category,
    keyword: query.keyword
  };

  const [items, total, categories] = await Promise.all([
    listProductsFromDatabase({
      ...filter,
      limit,
      offset
    }),
    countProducts(filter),
    listCategories()
  ]);

  return {
    items,
    page,
    limit,
    total,
    categories
  };
}

export function getProductById(productId: string) {
  return findProductById(productId);
}

export async function createCategory(input: CreateCategoryInput) {
  const name = normalizeText(input.name);

  if (!name) {
    throw new ProductError("Category name is required", 400);
  }

  const slug = slugify(input.slug || name);

  try {
    return await createCategoryInDatabase({
      id: `cat-${slug}`,
      name,
      slug
    });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      throw new ProductError("Category already exists", 409);
    }

    throw error;
  }
}

export async function createProduct(input: CreateProductInput) {
  const name = normalizeText(input.name);
  const brand = normalizeText(input.brand);
  const categoryId = normalizeText(input.categoryId);
  const description = normalizeText(input.description);
  const unit = normalizeText(input.unit);
  const price = assertNonNegativeNumber(input.price, "Price");
  const stockQuantity = Math.floor(assertNonNegativeNumber(input.stockQuantity ?? 0, "Stock quantity"));

  if (!name || !brand || !categoryId || !description || !unit) {
    throw new ProductError("Name, brand, categoryId, description and unit are required", 400);
  }

  if (input.oldPrice !== undefined && input.oldPrice !== null && Number(input.oldPrice) < price) {
    throw new ProductError("Old price must be greater than or equal to price", 400);
  }

  const slug = slugify(input.slug || name);

  try {
    return await createProductInDatabase({
      id: `prod-${slug}`,
      name,
      slug,
      brand,
      categoryId,
      description,
      price,
      oldPrice: input.oldPrice ?? undefined,
      stockQuantity,
      unit,
      badge: normalizeText(input.badge),
      accent: normalizeText(input.accent) || "#3bb77e",
      imageUrl: normalizeText(input.imageUrl),
      status: input.status === "inactive" ? "inactive" : "active"
    });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23503") {
      throw new ProductError("Category does not exist", 404);
    }

    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      throw new ProductError("Product already exists", 409);
    }

    throw error;
  }
}

function normalizeProductInput(input: CreateProductInput) {
  const name = normalizeText(input.name);
  const brand = normalizeText(input.brand);
  const categoryId = normalizeText(input.categoryId);
  const description = normalizeText(input.description);
  const unit = normalizeText(input.unit);
  const price = assertNonNegativeNumber(input.price, "Price");
  const stockQuantity = Math.floor(assertNonNegativeNumber(input.stockQuantity ?? 0, "Stock quantity"));

  if (!name || !brand || !categoryId || !description || !unit) {
    throw new ProductError("Name, brand, categoryId, description and unit are required", 400);
  }

  if (input.oldPrice !== undefined && input.oldPrice !== null && Number(input.oldPrice) < price) {
    throw new ProductError("Old price must be greater than or equal to price", 400);
  }

  return {
    name,
    brand,
    categoryId,
    description,
    price,
    oldPrice: input.oldPrice ?? undefined,
    stockQuantity,
    unit,
    badge: normalizeText(input.badge),
    accent: normalizeText(input.accent) || "#3bb77e",
    imageUrl: normalizeText(input.imageUrl),
    status: input.status === "inactive" ? "inactive" : "active"
  } satisfies Omit<Product, "id" | "slug" | "category" | "ratingAverage" | "ratingCount">;
}

export async function updateProduct(productId: string, input: CreateProductInput) {
  try {
    const product = await updateProductInDatabase(productId, normalizeProductInput(input));

    if (!product) {
      throw new ProductError("Product not found", 404);
    }

    return product;
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23503") {
      throw new ProductError("Category does not exist", 404);
    }

    throw error;
  }
}

export async function updateProductStock(productId: string, stockQuantity: unknown) {
  const nextStockQuantity = Math.floor(assertNonNegativeNumber(stockQuantity, "Stock quantity"));
  const product = await updateProductStockInDatabase(productId, nextStockQuantity);

  if (!product) {
    throw new ProductError("Product not found", 404);
  }

  return product;
}

export async function reviewProduct(productId: string, input: ReviewProductInput, auth: AccessTokenPayload) {
  const rating = Math.floor(Number(input.rating));

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new ProductError("Rating must be between 1 and 5", 400);
  }

  const product = await findProductById(productId);

  if (!product) {
    throw new ProductError("Product not found", 404);
  }

  const review = await upsertProductReview({
    productId,
    userId: auth.sub,
    userEmail: auth.email,
    username: auth.username,
    rating,
    comment: normalizeText(input.comment)
  });
  const updatedProduct = await findProductById(productId);

  return {
    review,
    product: updatedProduct
  };
}

export function getProductReviews(productId: string) {
  return listProductReviews(productId);
}

export function getProductDeals() {
  return listProductDeals();
}

export async function createProductDeal(input: CreateProductDealInput) {
  const description = normalizeText(input.description);
  const productIds = Array.isArray(input.productIds) ? input.productIds.map((productId) => normalizeText(productId)).filter(Boolean) : [];
  const discountPercent = Math.floor(Number(input.discountPercent));

  if (!description) {
    throw new ProductError("Deal description is required", 400);
  }

  if (productIds.length === 0) {
    throw new ProductError("Deal must apply to at least one product", 400);
  }

  if (!Number.isInteger(discountPercent) || discountPercent < 1 || discountPercent > 90) {
    throw new ProductError("Discount percent must be between 1 and 90", 400);
  }

  const uniqueProductIds = [...new Set(productIds)];
  const products = await Promise.all(uniqueProductIds.map((productId) => findProductById(productId)));

  if (products.some((product) => !product)) {
    throw new ProductError("One or more products do not exist", 404);
  }

  return createProductDealInDatabase({
    id: `deal-${Date.now()}`,
    description,
    productIds: uniqueProductIds,
    discountPercent,
    status: input.status === "inactive" ? "inactive" : "active"
  });
}

export async function deleteProductDeal(dealId: string) {
  const deleted = await deleteProductDealInDatabase(dealId);

  if (!deleted) {
    throw new ProductError("Deal not found", 404);
  }

  return { deleted: true };
}
