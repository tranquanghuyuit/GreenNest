import test from "node:test";
import assert from "node:assert/strict";
import { createCategory, createProduct, createProductDeal, updateProductStock } from "../src/services/product.service.js";
import { ProductError } from "../src/errors/product-error.js";

test("createCategory rejects an empty category name before touching database", async () => {
  await assert.rejects(() => createCategory({ name: "   " }), ProductError);
});

test("createProduct rejects invalid product input before touching database", async () => {
  await assert.rejects(
    () =>
      createProduct({
        name: "",
        brand: "Brand",
        categoryId: "cat-test",
        description: "Description",
        price: 10000,
        stockQuantity: 1,
        unit: "item"
      }),
    ProductError
  );
});

test("updateProductStock rejects negative stock before touching database", async () => {
  await assert.rejects(() => updateProductStock("prod-test", -1), ProductError);
});

test("createProductDeal rejects invalid discount percent before touching database", async () => {
  await assert.rejects(
    () =>
      createProductDeal({
        description: "Invalid deal",
        productIds: ["prod-test"],
        discountPercent: 0
      }),
    ProductError
  );
});
