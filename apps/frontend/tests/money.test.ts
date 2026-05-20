import test from "node:test";
import assert from "node:assert/strict";
import { formatMoney } from "../src/utils/money.js";

test("formatMoney formats a number with Vietnamese thousands separator", () => {
  assert.match(formatMoney(84000), /^84\.000/);
});
