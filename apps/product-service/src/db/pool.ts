import pg from "pg";
import { config } from "../config.js";

export const pool = new pg.Pool({
  connectionString: config.databaseUrl
});

export async function checkDatabaseConnection() {
  const result = await pool.query("SELECT 1 AS ok");
  return result.rows[0]?.ok === 1;
}
