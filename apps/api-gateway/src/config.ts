import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 4000),
  authServiceUrl: process.env.AUTH_SERVICE_URL ?? "http://localhost:4002",
  productServiceUrl: process.env.PRODUCT_SERVICE_URL ?? "http://localhost:4001",
  userServiceUrl: process.env.USER_SERVICE_URL ?? "http://localhost:4003",
  cartServiceUrl: process.env.CART_SERVICE_URL ?? "http://localhost:4004",
  orderServiceUrl: process.env.ORDER_SERVICE_URL ?? "http://localhost:4005",
  paymentServiceUrl: process.env.PAYMENT_SERVICE_URL ?? "http://localhost:4006",
  serviceName: "api-gateway"
};
