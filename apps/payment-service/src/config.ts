import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 4006),
  databaseUrl: process.env.DATABASE_URL ?? "postgresql://payment_user:payment_password@localhost:5438/payment_db",
  jwtSecret: process.env.JWT_SECRET ?? "devsecops-shop-dev-secret",
  internalServiceToken: process.env.INTERNAL_SERVICE_TOKEN ?? "devsecops-shop-internal-token",
  orderServiceUrl: process.env.ORDER_SERVICE_URL ?? "http://localhost:4005",
  vnpayTmnCode: process.env.VNPAY_TMN_CODE ?? "",
  vnpayHashSecret: process.env.VNPAY_HASH_SECRET ?? "",
  vnpayHashAlgorithm: (process.env.VNPAY_HASH_ALGORITHM ?? "hmac-sha512").toLowerCase(),
  vnpayPaymentUrl: process.env.VNPAY_PAYMENT_URL ?? "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  vnpayReturnUrl: process.env.VNPAY_RETURN_URL ?? "http://localhost:5173/payment/vnpay-return",
  vnpayLocale: process.env.VNPAY_LOCALE ?? "vn",
  vnpayOrderType: process.env.VNPAY_ORDER_TYPE ?? "other",
  vietqrBankId: process.env.VIETQR_BANK_ID ?? "vietcombank",
  vietqrAccountNo: process.env.VIETQR_ACCOUNT_NO ?? "0000000000",
  vietqrAccountName: process.env.VIETQR_ACCOUNT_NAME ?? "GREENNEST MARKET",
  vietqrTemplate: process.env.VIETQR_TEMPLATE ?? "compact2",
  vietqrTransferPrefix: process.env.VIETQR_TRANSFER_PREFIX ?? "GN",
  serviceName: "payment-service"
};
