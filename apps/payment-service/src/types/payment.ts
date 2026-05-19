export type AuthRole = "customer" | "admin";
export type PaymentMethod = "cod" | "mock_card" | "bank_transfer" | "vnpay";
export type PaymentStatus = "pending" | "success" | "failed";

export type AccessTokenPayload = {
  sub: string;
  email: string;
  username: string;
  role: AuthRole;
  type: "access";
  iat: number;
  exp: number;
};

export type PaymentRecord = {
  id: string;
  paymentCode: string;
  orderId: string;
  orderCode: string;
  userId: string;
  amount: string;
  method: PaymentMethod;
  status: PaymentStatus;
  provider: string;
  paymentUrl: string | null;
  providerTransactionNo: string | null;
  bankCode: string | null;
  bankTranNo: string | null;
  cardType: string | null;
  payDate: string | null;
  responseCode: string | null;
  transactionStatus: string | null;
  failureReason: string | null;
  rawPayload: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PublicPayment = {
  id: string;
  paymentCode: string;
  orderId: string;
  orderCode: string;
  userId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  provider: string;
  paymentUrl?: string;
  providerTransactionNo?: string;
  bankCode?: string;
  responseCode?: string;
  transactionStatus?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreatePaymentInput = {
  orderId?: string;
  orderCode?: string;
  userId?: string;
  amount?: number;
  method?: PaymentMethod;
  orderInfo?: string;
  ipAddr?: string;
};

export type VnpayParams = Record<string, string>;
