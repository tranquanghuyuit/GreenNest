import { pool } from "../db/pool.js";
import type { Category, Product } from "../types/catalog.js";

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
  status: "active" | "inactive";
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
    status: row.status
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
        p.status
      FROM products p
      JOIN categories c ON c.id = p.category_id
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
        p.status
      FROM products p
      JOIN categories c ON c.id = p.category_id
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

export async function createProduct(input: Omit<Product, "category">) {
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
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
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
        status
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
        p.status
    `,
    [productId, stockQuantity]
  );

  return result.rows[0] ? toProduct(result.rows[0]) : null;
}
