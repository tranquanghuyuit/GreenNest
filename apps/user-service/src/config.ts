import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 4003),
  databaseUrl: process.env.DATABASE_URL ?? "postgresql://user_user:user_password@localhost:5435/user_db",
  jwtSecret: process.env.JWT_SECRET ?? "devsecops-shop-dev-secret",
  serviceName: "user-service"
};
