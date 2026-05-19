import { pool } from "../db/pool.js";
import { randomUUID } from "crypto";
import type { Category, Product, ProductDeal, ProductReview } from "../types/catalog.js";

export type ProductFilter = {
  category?: string;
  keyword?: string;
  limit: number;
  offset: number;
};

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  categoryId: string;
  category: string;
  description: string;
  price: string;
  oldPrice: string | null;
  stockQuantity: number;
  unit: string;
  badge: string;
  accent: string;
  imageUrl: string;
  status: "active" | "inactive";
  ratingAverage: string | null;
  ratingCount: string;
};

type ProductReviewRow = {
  id: string;
  productId: string;
  userId: string;
  userEmail: string;
  username: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
};

type ProductDealRow = {
  id: string;
  description: string;
  productIds: string[];
  discountPercent: number;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
};

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    brand: row.brand,
    categoryId: row.categoryId,
    category: row.category,
    description: row.description,
    price: Number(row.price),
    oldPrice: row.oldPrice ? Number(row.oldPrice) : undefined,
    stockQuantity: row.stockQuantity,
    unit: row.unit,
    badge: row.badge,
    accent: row.accent,
    imageUrl: row.imageUrl,
    status: row.status,
    ratingAverage: row.ratingAverage ? Number(row.ratingAverage) : 0,
    ratingCount: Number(row.ratingCount)
  };
}

function toProductReview(row: ProductReviewRow): ProductReview {
  return {
    id: row.id,
    productId: row.productId,
    userId: row.userId,
    userEmail: row.userEmail,
    username: row.username,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

function toProductDeal(row: ProductDealRow): ProductDeal {
  return {
    id: row.id,
    description: row.description,
    productIds: row.productIds,
    discountPercent: row.discountPercent,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

function buildProductWhereClause(filter: Pick<ProductFilter, "category" | "keyword">) {
  const conditions = ["p.status = 'active'"];
  const values: string[] = [];

  if (filter.category) {
    values.push(filter.category.trim().toLowerCase());
    const index = values.length;
    conditions.push(
      `(LOWER(c.name) = $${index} OR LOWER(c.id) = $${index} OR LOWER(c.slug) = $${index} OR LOWER(p.slug) LIKE '%' || $${index} || '%')`
    );
  }

  if (filter.keyword) {
    values.push(`%${filter.keyword.trim().toLowerCase()}%`);
    const index = values.length;
    conditions.push(`(LOWER(p.name) LIKE $${index} OR LOWER(p.brand) LIKE $${index} OR LOWER(p.description) LIKE $${index})`);
  }

  return {
    whereClause: `WHERE ${conditions.join(" AND ")}`,
    values
  };
}

export async function listCategories() {
  const result = await pool.query<Category>(
    `
      SELECT id, name, slug
      FROM categories
      ORDER BY name ASC
    `
  );

  return result.rows;
}

export async function countProducts(filter: Pick<ProductFilter, "category" | "keyword">) {
  const { whereClause, values } = buildProductWhereClause(filter);
  const result = await pool.query<{ count: string }>(
    `
      SELECT COUNT(*) AS count
      FROM products p
      JOIN categories c ON c.id = p.category_id
      ${whereClause}
    `,
    values
  );

  return Number(result.rows[0]?.count ?? 0);
}

export async function listProducts(filter: ProductFilter) {
  const { whereClause, values } = buildProductWhereClause(filter);
  const limitIndex = values.length + 1;
  const offsetIndex = values.length + 2;

  const result = await pool.query<ProductRow>(
    `
      SELECT
        p.id,
        p.name,
        p.slug,
        p.brand,
        p.category_id AS "categoryId",
        c.name AS category,
        p.description,
        p.price,
        p.old_price AS "oldPrice",
        p.stock_quantity AS "stockQuantity",
        p.unit,
        p.badge,
        p.accent,
        p.image_url AS "imageUrl",
        p.status,
        COALESCE(ROUND(r.rating_average, 1), 0) AS "ratingAverage",
        COALESCE(r.rating_count, 0) AS "ratingCount"
      FROM products p
      JOIN categories c ON c.id = p.category_id
      LEFT JOIN (
        SELECT product_id, AVG(rating)::numeric AS rating_average, COUNT(*) AS rating_count
        FROM product_reviews
        GROUP BY product_id
      ) r ON r.product_id = p.id
      ${whereClause}
      ORDER BY p.name ASC
      LIMIT $${limitIndex}
      OFFSET $${offsetIndex}
    `,
    [...values, filter.limit, filter.offset]
  );

  return result.rows.map(toProduct);
}

export async function findProductById(productId: string) {
  const result = await pool.query<ProductRow>(
    `
      SELECT
        p.id,
        p.name,
        p.slug,
        p.brand,
        p.category_id AS "categoryId",
        c.name AS category,
        p.description,
        p.price,
        p.old_price AS "oldPrice",
        p.stock_quantity AS "stockQuantity",
        p.unit,
        p.badge,
        p.accent,
        p.image_url AS "imageUrl",
        p.status,
        COALESCE(ROUND(r.rating_average, 1), 0) AS "ratingAverage",
        COALESCE(r.rating_count, 0) AS "ratingCount"
      FROM products p
      JOIN categories c ON c.id = p.category_id
      LEFT JOIN (
        SELECT product_id, AVG(rating)::numeric AS rating_average, COUNT(*) AS rating_count
        FROM product_reviews
        GROUP BY product_id
      ) r ON r.product_id = p.id
      WHERE p.id = $1 AND p.status = 'active'
      LIMIT 1
    `,
    [productId]
  );

  return result.rows[0] ? toProduct(result.rows[0]) : null;
}

export async function createCategory(input: Category) {
  const result = await pool.query<Category>(
    `
      INSERT INTO categories (id, name, slug)
      VALUES ($1, $2, $3)
      RETURNING id, name, slug
    `,
    [input.id, input.name, input.slug]
  );

  return result.rows[0];
}

export async function createProduct(input: Omit<Product, "category" | "ratingAverage" | "ratingCount">) {
  const result = await pool.query<ProductRow>(
    `
      INSERT INTO products (
        id,
        name,
        slug,
        brand,
        category_id,
        description,
        price,
        old_price,
        stock_quantity,
        unit,
        badge,
        accent,
        image_url,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING
        id,
        name,
        slug,
        brand,
        category_id AS "categoryId",
        (SELECT name FROM categories WHERE id = $5) AS category,
        description,
        price,
        old_price AS "oldPrice",
        stock_quantity AS "stockQuantity",
        unit,
        badge,
        accent,
        image_url AS "imageUrl",
        status,
        0 AS "ratingAverage",
        0 AS "ratingCount"
    `,
    [
      input.id,
      input.name,
      input.slug,
      input.brand,
      input.categoryId,
      input.description,
      input.price,
      input.oldPrice ?? null,
      input.stockQuantity,
      input.unit,
      input.badge,
      input.accent,
      input.imageUrl,
      input.status
    ]
  );

  return toProduct(result.rows[0]);
}

export async function updateProductStock(productId: string, stockQuantity: number) {
  const result = await pool.query<ProductRow>(
    `
      UPDATE products p
      SET stock_quantity = $2,
          updated_at = NOW()
      FROM categories c
      WHERE p.category_id = c.id
        AND p.id = $1
      RETURNING
        p.id,
        p.name,
        p.slug,
        p.brand,
        p.category_id AS "categoryId",
        c.name AS category,
        p.description,
        p.price,
        p.old_price AS "oldPrice",
        p.stock_quantity AS "stockQuantity",
        p.unit,
        p.badge,
        p.accent,
        p.image_url AS "imageUrl",
        p.status,
        (
          SELECT COALESCE(ROUND(AVG(pr.rating)::numeric, 1), 0)
          FROM product_reviews pr
          WHERE pr.product_id = p.id
        ) AS "ratingAverage",
        (
          SELECT COUNT(*)
          FROM product_reviews pr
          WHERE pr.product_id = p.id
        ) AS "ratingCount"
    `,
    [productId, stockQuantity]
  );

  return result.rows[0] ? toProduct(result.rows[0]) : null;
}

export async function updateProduct(productId: string, input: Omit<Product, "id" | "slug" | "category" | "ratingAverage" | "ratingCount">) {
  const result = await pool.query<ProductRow>(
    `
      UPDATE products p
      SET name = $2,
          brand = $3,
          category_id = $4,
          description = $5,
          price = $6,
          old_price = $7,
          stock_quantity = $8,
          unit = $9,
          badge = $10,
          accent = $11,
          image_url = $12,
          status = $13,
          updated_at = NOW()
      FROM categories c
      WHERE c.id = $4
        AND p.id = $1
      RETURNING
        p.id,
        p.name,
        p.slug,
        p.brand,
        p.category_id AS "categoryId",
        c.name AS category,
        p.description,
        p.price,
        p.old_price AS "oldPrice",
        p.stock_quantity AS "stockQuantity",
        p.unit,
        p.badge,
        p.accent,
        p.image_url AS "imageUrl",
        p.status,
        (
          SELECT COALESCE(ROUND(AVG(pr.rating)::numeric, 1), 0)
          FROM product_reviews pr
          WHERE pr.product_id = p.id
        ) AS "ratingAverage",
        (
          SELECT COUNT(*)
          FROM product_reviews pr
          WHERE pr.product_id = p.id
        ) AS "ratingCount"
    `,
    [
      productId,
      input.name,
      input.brand,
      input.categoryId,
      input.description,
      input.price,
      input.oldPrice ?? null,
      input.stockQuantity,
      input.unit,
      input.badge,
      input.accent,
      input.imageUrl,
      input.status
    ]
  );

  return result.rows[0] ? toProduct(result.rows[0]) : null;
}

export async function upsertProductReview(input: {
  productId: string;
  userId: string;
  userEmail: string;
  username: string;
  rating: number;
  comment: string;
}) {
  const result = await pool.query<ProductReviewRow>(
    `
      INSERT INTO product_reviews (id, product_id, user_id, user_email, username, rating, comment)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (product_id, user_id)
      DO UPDATE SET
        rating = EXCLUDED.rating,
        comment = EXCLUDED.comment,
        user_email = EXCLUDED.user_email,
        username = EXCLUDED.username,
        updated_at = NOW()
      RETURNING
        id,
        product_id AS "productId",
        user_id AS "userId",
        user_email AS "userEmail",
        username,
        rating,
        comment,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    [`review-${randomUUID()}`, input.productId, input.userId, input.userEmail, input.username, input.rating, input.comment]
  );

  return toProductReview(result.rows[0]);
}

export async function listProductReviews(productId: string) {
  const result = await pool.query<ProductReviewRow>(
    `
      SELECT
        id,
        product_id AS "productId",
        user_id AS "userId",
        user_email AS "userEmail",
        username,
        rating,
        comment,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM product_reviews
      WHERE product_id = $1
      ORDER BY updated_at DESC
    `,
    [productId]
  );

  return result.rows.map(toProductReview);
}

export async function listProductDeals() {
  const result = await pool.query<ProductDealRow>(
    `
      SELECT
        id,
        description,
        product_ids AS "productIds",
        discount_percent AS "discountPercent",
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM product_deals
      ORDER BY created_at DESC
    `
  );

  return result.rows.map(toProductDeal);
}

export async function createProductDeal(input: {
  id: string;
  description: string;
  productIds: string[];
  discountPercent: number;
  status: "active" | "inactive";
}) {
  const result = await pool.query<ProductDealRow>(
    `
      INSERT INTO product_deals (id, description, product_ids, discount_percent, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        description,
        product_ids AS "productIds",
        discount_percent AS "discountPercent",
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    [input.id, input.description, input.productIds, input.discountPercent, input.status]
  );

  return toProductDeal(result.rows[0]);
}

export async function deleteProductDeal(dealId: string) {
  const result = await pool.query<{ id: string }>(
    `
      DELETE FROM product_deals
      WHERE id = $1
      RETURNING id
    `,
    [dealId]
  );

  return Boolean(result.rows[0]);
}
