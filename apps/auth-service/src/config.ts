import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 4002),
  databaseUrl: process.env.DATABASE_URL ?? "postgresql://auth_user:auth_password@localhost:5434/auth_db",
  jwtSecret: process.env.JWT_SECRET ?? "devsecops-shop-dev-secret",
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI ?? "http://localhost:5173/auth/google/callback",
  accessTokenExpiresSeconds: Number(process.env.ACCESS_TOKEN_EXPIRES_SECONDS ?? 900),
  refreshTokenExpiresDays: Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS ?? 7),
  serviceName: "auth-service"
};
