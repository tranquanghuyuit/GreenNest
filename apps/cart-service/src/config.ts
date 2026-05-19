import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 4004),
  databaseUrl: process.env.DATABASE_URL ?? "postgresql://cart_user:cart_password@localhost:5436/cart_db",
  jwtSecret: process.env.JWT_SECRET ?? "devsecops-shop-dev-secret",
  serviceName: "cart-service"
};
