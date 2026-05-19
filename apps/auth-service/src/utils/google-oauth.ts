import { config } from "../config.js";
import { AuthError } from "../errors/auth-error.js";

type GoogleTokenResponse = {
  id_token?: string;
  error?: string;
  error_description?: string;
};

type GoogleTokenInfo = {
  sub: string;
  aud: string;
  email: string;
  email_verified: "true" | "false" | boolean;
  name?: string;
};

export type GoogleProfile = {
  sub: string;
  email: string;
  name?: string;
};

export async function exchangeGoogleCodeForProfile(code: string, redirectUri: string): Promise<GoogleProfile> {
  if (!config.googleClientId || !config.googleClientSecret) {
    throw new AuthError("Google OAuth is not configured", 503);
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json"
    },
    body: new URLSearchParams({
      code,
      client_id: config.googleClientId,
      client_secret: config.googleClientSecret,
      redirect_uri: redirectUri || config.googleRedirectUri,
      grant_type: "authorization_code"
    })
  });

  const tokenData = (await tokenResponse.json()) as GoogleTokenResponse;

  if (!tokenResponse.ok || !tokenData.id_token) {
    throw new AuthError(tokenData.error_description ?? tokenData.error ?? "Cannot exchange Google authorization code", 401);
  }

  const tokenInfoResponse = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(tokenData.id_token)}`,
    {
      headers: {
        Accept: "application/json"
      }
    }
  );

  const tokenInfo = (await tokenInfoResponse.json()) as GoogleTokenInfo;

  if (!tokenInfoResponse.ok) {
    throw new AuthError("Cannot verify Google ID token", 401);
  }

  if (tokenInfo.aud !== config.googleClientId) {
    throw new AuthError("Google token audience is invalid", 401);
  }

  if (tokenInfo.email_verified !== true && tokenInfo.email_verified !== "true") {
    throw new AuthError("Google email is not verified", 401);
  }

  return {
    sub: tokenInfo.sub,
    email: tokenInfo.email,
    name: tokenInfo.name
  };
}
