import "./monitoring/tracing.js";
import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { errorHandler } from "./middleware/error-handler.js";
import { requestLogger } from "./middleware/request-logger.js";
import { metricsHandler, metricsMiddleware } from "./monitoring/metrics.js";
import { authRouter } from "./routes/auth.routes.js";
import { cartRouter } from "./routes/cart.routes.js";
import { orderRouter } from "./routes/order.routes.js";
import { paymentRouter } from "./routes/payment.routes.js";
import { productRouter } from "./routes/product.routes.js";
import { userRouter } from "./routes/user.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(metricsMiddleware);
app.use(requestLogger);

app.get("/health", (_request, response) => {
  response.json({
    service: config.serviceName,
    status: "ok",
    upstream: {
      authServiceUrl: config.authServiceUrl,
      productServiceUrl: config.productServiceUrl,
      userServiceUrl: config.userServiceUrl,
      cartServiceUrl: config.cartServiceUrl,
      orderServiceUrl: config.orderServiceUrl,
      paymentServiceUrl: config.paymentServiceUrl
    }
  });
});

app.get("/metrics", metricsHandler);

app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/users", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/payments", paymentRouter);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`${config.serviceName} listening on port ${config.port}`);
});
