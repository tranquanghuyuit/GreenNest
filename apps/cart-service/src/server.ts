import "./monitoring/tracing.js";
import cors from "cors";
import express from "express";
import { config } from "./config.js";
import { checkDatabaseConnection } from "./db/pool.js";
import { errorHandler } from "./middleware/error-handler.js";
import { metricsHandler, metricsMiddleware } from "./monitoring/metrics.js";
import { cartRouter } from "./routes/cart.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(metricsMiddleware);

app.get("/health", async (_request, response) => {
  try {
    await checkDatabaseConnection();
    response.json({
      service: config.serviceName,
      status: "ok",
      database: "ok"
    });
  } catch {
    response.status(503).json({
      service: config.serviceName,
      status: "unhealthy",
      database: "unavailable"
    });
  }
});

app.get("/metrics", metricsHandler);

app.use("/cart", cartRouter);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`${config.serviceName} listening on port ${config.port}`);
});
