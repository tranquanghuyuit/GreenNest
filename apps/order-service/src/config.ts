import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 4005),
  databaseUrl: process.env.DATABASE_URL ?? "postgresql://order_user:order_password@localhost:5437/order_db",
  jwtSecret: process.env.JWT_SECRET ?? "devsecops-shop-dev-secret",
  cartServiceUrl: process.env.CART_SERVICE_URL ?? "http://localhost:4004",
  productServiceUrl: process.env.PRODUCT_SERVICE_URL ?? "http://localhost:4001",
  userServiceUrl: process.env.USER_SERVICE_URL ?? "http://localhost:4003",
  paymentServiceUrl: process.env.PAYMENT_SERVICE_URL ?? "http://localhost:4006",
  internalServiceToken: process.env.INTERNAL_SERVICE_TOKEN ?? "devsecops-shop-internal-token",
  serviceName: "order-service"
};
