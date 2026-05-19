import { createHash, createHmac, timingSafeEqual } from "crypto";
import qs from "qs";
import { config } from "../config.js";
import type { VnpayParams } from "../types/payment.js";

function encodeVnpay(value: string) {
  return encodeURIComponent(value).replace(/%20/g, "+");
}

export function formatVnpayDate(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));

  return `${parts.year}${parts.month}${parts.day}${parts.hour}${parts.minute}${parts.second}`;
}

function sortVnpayParams(params: VnpayParams) {
  return Object.keys(params)
    .filter((key) => key !== "vnp_SecureHash" && key !== "vnp_SecureHashType" && params[key] !== undefined && params[key] !== "")
    .sort()
    .reduce<VnpayParams>((result, key) => {
      result[encodeVnpay(key)] = encodeVnpay(params[key]);
      return result;
    }, {});
}

export function buildHashData(params: VnpayParams) {
  return qs.stringify(sortVnpayParams(params), { encode: false });
}

export function signVnpayParams(params: VnpayParams) {
  const hashData = buildHashData(params);

  if (config.vnpayHashAlgorithm === "sha256") {
    return createHash("sha256")
      .update(Buffer.from(`${config.vnpayHashSecret}${hashData}`, "utf8"))
      .digest("hex");
  }

  if (config.vnpayHashAlgorithm === "hmac-sha256") {
    return createHmac("sha256", config.vnpayHashSecret).update(Buffer.from(hashData, "utf8")).digest("hex");
  }

  return createHmac("sha512", config.vnpayHashSecret).update(Buffer.from(hashData, "utf8")).digest("hex");
}

export function appendSecureHash(params: VnpayParams) {
  const secureHash = signVnpayParams(params);

  if (config.vnpayHashAlgorithm === "sha256") {
    return {
      ...params,
      vnp_SecureHashType: "SHA256",
      vnp_SecureHash: secureHash
    };
  }

  return {
    ...params,
    vnp_SecureHash: secureHash
  };
}

export function buildQueryString(params: VnpayParams) {
  const queryParams = sortVnpayParams(params);

  if (params.vnp_SecureHashType) {
    queryParams.vnp_SecureHashType = params.vnp_SecureHashType;
  }

  if (params.vnp_SecureHash) {
    queryParams.vnp_SecureHash = params.vnp_SecureHash;
  }

  return qs.stringify(queryParams, { encode: false });
}

export function verifyVnpayParams(params: VnpayParams) {
  const secureHash = params.vnp_SecureHash ?? "";
  const signedParams = { ...params };
  delete signedParams.vnp_SecureHash;
  delete signedParams.vnp_SecureHashType;
  const expected = signVnpayParams(signedParams);
  const left = Buffer.from(expected);
  const right = Buffer.from(secureHash);

  return left.length === right.length && timingSafeEqual(left, right);
}
