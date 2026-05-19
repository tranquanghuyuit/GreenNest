import { randomUUID } from "crypto";
import { pool } from "../db/pool.js";
import type { AuthRole, AuthUser } from "../types/auth.js";

type AuthUserRow = {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  role: AuthRole;
  status: "active" | "blocked";
  createdAt: Date;
  updatedAt: Date;
};

type RefreshTokenRow = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
};

function toAuthUser(row: AuthUserRow): AuthUser {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    passwordHash: row.passwordHash,
    role: row.role,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

const userSelect = `
  SELECT
    id,
    email,
    username,
    password_hash AS "passwordHash",
    role,
    status,
    created_at AS "createdAt",
    updated_at AS "updatedAt"
  FROM users_auth
`;

export async function createUser(input: {
  email: string;
  username: string;
  passwordHash: string;
  role?: AuthRole;
}) {
  const result = await pool.query<AuthUserRow>(
    `
      INSERT INTO users_auth (id, email, username, password_hash, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        email,
        username,
        password_hash AS "passwordHash",
        role,
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `,
    [randomUUID(), input.email, input.username, input.passwordHash, input.role ?? "customer"]
  );

  return toAuthUser(result.rows[0]);
}

export async function findUserByLogin(login: string) {
  const normalized = login.trim().toLowerCase();
  const result = await pool.query<AuthUserRow>(
    `
      ${userSelect}
      WHERE email = $1 OR username = $1
      LIMIT 1
    `,
    [normalized]
  );

  return result.rows[0] ? toAuthUser(result.rows[0]) : null;
}

export async function findUserById(userId: string) {
  const result = await pool.query<AuthUserRow>(
    `
      ${userSelect}
      WHERE id = $1
      LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] ? toAuthUser(result.rows[0]) : null;
}

export async function createRefreshToken(input: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}) {
  const result = await pool.query<RefreshTokenRow>(
    `
      INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        user_id AS "userId",
        token_hash AS "tokenHash",
        expires_at AS "expiresAt",
        revoked_at AS "revokedAt",
        created_at AS "createdAt"
    `,
    [randomUUID(), input.userId, input.tokenHash, input.expiresAt]
  );

  return result.rows[0];
}

export async function findActiveRefreshToken(tokenHash: string) {
  const result = await pool.query<RefreshTokenRow>(
    `
      SELECT
        id,
        user_id AS "userId",
        token_hash AS "tokenHash",
        expires_at AS "expiresAt",
        revoked_at AS "revokedAt",
        created_at AS "createdAt"
      FROM refresh_tokens
      WHERE token_hash = $1
        AND revoked_at IS NULL
        AND expires_at > NOW()
      LIMIT 1
    `,
    [tokenHash]
  );

  return result.rows[0] ?? null;
}

export async function revokeRefreshToken(tokenHash: string) {
  await pool.query(
    `
      UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE token_hash = $1 AND revoked_at IS NULL
    `,
    [tokenHash]
  );
}
