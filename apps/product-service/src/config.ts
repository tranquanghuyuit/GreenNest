import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 4001),
  databaseUrl: process.env.DATABASE_URL ?? "postgresql://product_user:product_password@localhost:5433/product_db",
  jwtSecret: process.env.JWT_SECRET ?? "devsecops-shop-dev-secret",
  serviceName: "product-service"
};
