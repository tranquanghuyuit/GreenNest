import { randomUUID } from "crypto";
import { pool } from "../db/pool.js";
import type {
  AddressInput,
  ProfileUpdateInput,
  UserAddressRecord,
  UserFavoriteRecord,
  UserProfileRecord
} from "../types/user.js";

type UserProfileRow = {
  id: string;
  authUserId: string;
  fullName: string;
  phone: string;
  birthday: string | Date | null;
  gender: string;
  avatarUrl: string | null;
  loyaltyPoint: number;
  marketingOptIn: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type UserAddressRow = {
  id: string;
  userProfileId: string;
  label: string;
  receiverName: string;
  phone: string;
  line1: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type UserFavoriteRow = {
  userProfileId: string;
  productId: string;
  createdAt: Date;
};

function mapProfile(row: UserProfileRow): UserProfileRecord {
  return row;
}

function mapAddress(row: UserAddressRow): UserAddressRecord {
  return row;
}

function mapFavorite(row: UserFavoriteRow): UserFavoriteRecord {
  return row;
}

const profileSelect = `
  id,
  auth_user_id AS "authUserId",
  full_name AS "fullName",
  phone,
  birthday,
  gender,
  avatar_url AS "avatarUrl",
  loyalty_point AS "loyaltyPoint",
  marketing_opt_in AS "marketingOptIn",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

const addressSelect = `
  id,
  user_profile_id AS "userProfileId",
  label,
  receiver_name AS "receiverName",
  phone,
  line1,
  ward,
  district,
  city,
  is_default AS "isDefault",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

const favoriteSelect = `
  user_profile_id AS "userProfileId",
  product_id AS "productId",
  created_at AS "createdAt"
`;

export async function findProfileByAuthUserId(authUserId: string) {
  const result = await pool.query<UserProfileRow>(
    `
      SELECT ${profileSelect}
      FROM user_profiles
      WHERE auth_user_id = $1
    `,
    [authUserId]
  );

  return result.rows[0] ? mapProfile(result.rows[0]) : null;
}

export async function createProfile(input: { authUserId: string; fullName: string }) {
  const result = await pool.query<UserProfileRow>(
    `
      INSERT INTO user_profiles (id, auth_user_id, full_name)
      VALUES ($1, $2, $3)
      RETURNING ${profileSelect}
    `,
    [randomUUID(), input.authUserId, input.fullName]
  );

  return mapProfile(result.rows[0]);
}

export async function updateProfile(profileId: string, input: ProfileUpdateInput) {
  const result = await pool.query<UserProfileRow>(
    `
      UPDATE user_profiles
      SET full_name = COALESCE($2, full_name),
          phone = COALESCE($3, phone),
          birthday = $4,
          gender = COALESCE($5, gender),
          marketing_opt_in = COALESCE($6, marketing_opt_in),
          updated_at = NOW()
      WHERE id = $1
      RETURNING ${profileSelect}
    `,
    [
      profileId,
      input.fullName,
      input.phone,
      input.birthday?.trim() ? input.birthday : null,
      input.gender,
      input.marketingOptIn
    ]
  );

  return mapProfile(result.rows[0]);
}

export async function listAddresses(profileId: string) {
  const result = await pool.query<UserAddressRow>(
    `
      SELECT ${addressSelect}
      FROM user_addresses
      WHERE user_profile_id = $1
      ORDER BY is_default DESC, created_at DESC
    `,
    [profileId]
  );

  return result.rows.map(mapAddress);
}

export async function createAddress(
  profileId: string,
  input: Required<Omit<AddressInput, "isDefault">> & { isDefault: boolean }
) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (input.isDefault) {
      await client.query("UPDATE user_addresses SET is_default = FALSE, updated_at = NOW() WHERE user_profile_id = $1", [
        profileId
      ]);
    }

    const result = await client.query<UserAddressRow>(
      `
        INSERT INTO user_addresses
          (id, user_profile_id, label, receiver_name, phone, line1, ward, district, city, is_default)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING ${addressSelect}
      `,
      [
        randomUUID(),
        profileId,
        input.label,
        input.receiverName,
        input.phone,
        input.line1,
        input.ward,
        input.district,
        input.city,
        input.isDefault
      ]
    );

    await client.query("COMMIT");
    return mapAddress(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function updateAddress(profileId: string, addressId: string, input: AddressInput) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (input.isDefault) {
      await client.query("UPDATE user_addresses SET is_default = FALSE, updated_at = NOW() WHERE user_profile_id = $1", [
        profileId
      ]);
    }

    const result = await client.query<UserAddressRow>(
      `
        UPDATE user_addresses
        SET label = COALESCE($3, label),
            receiver_name = COALESCE($4, receiver_name),
            phone = COALESCE($5, phone),
            line1 = COALESCE($6, line1),
            ward = COALESCE($7, ward),
            district = COALESCE($8, district),
            city = COALESCE($9, city),
            is_default = COALESCE($10, is_default),
            updated_at = NOW()
        WHERE user_profile_id = $1 AND id = $2
        RETURNING ${addressSelect}
      `,
      [
        profileId,
        addressId,
        input.label,
        input.receiverName,
        input.phone,
        input.line1,
        input.ward,
        input.district,
        input.city,
        input.isDefault
      ]
    );

    await client.query("COMMIT");
    return result.rows[0] ? mapAddress(result.rows[0]) : null;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteAddress(profileId: string, addressId: string) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const deleted = await client.query<{ isDefault: boolean }>(
      `
        DELETE FROM user_addresses
        WHERE user_profile_id = $1 AND id = $2
        RETURNING is_default AS "isDefault"
      `,
      [profileId, addressId]
    );

    if (!deleted.rowCount) {
      await client.query("COMMIT");
      return false;
    }

    if (deleted.rows[0].isDefault) {
      await client.query(
        `
          UPDATE user_addresses
          SET is_default = TRUE, updated_at = NOW()
          WHERE id = (
            SELECT id
            FROM user_addresses
            WHERE user_profile_id = $1
            ORDER BY created_at DESC
            LIMIT 1
          )
        `,
        [profileId]
      );
    }

    await client.query("COMMIT");
    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listFavorites(profileId: string) {
  const result = await pool.query<UserFavoriteRow>(
    `
      SELECT ${favoriteSelect}
      FROM user_favorites
      WHERE user_profile_id = $1
      ORDER BY created_at DESC
    `,
    [profileId]
  );

  return result.rows.map(mapFavorite);
}

export async function createFavorite(profileId: string, productId: string) {
  const result = await pool.query<UserFavoriteRow>(
    `
      INSERT INTO user_favorites (user_profile_id, product_id)
      VALUES ($1, $2)
      ON CONFLICT (user_profile_id, product_id)
      DO UPDATE SET product_id = EXCLUDED.product_id
      RETURNING ${favoriteSelect}
    `,
    [profileId, productId]
  );

  return mapFavorite(result.rows[0]);
}

export async function deleteFavorite(profileId: string, productId: string) {
  const result = await pool.query(
    `
      DELETE FROM user_favorites
      WHERE user_profile_id = $1 AND product_id = $2
    `,
    [profileId, productId]
  );

  return Boolean(result.rowCount);
}
