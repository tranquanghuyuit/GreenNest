export type RouteId =
  | "home"
  | "categories"
  | "cart"
  | "checkout"
  | "orders"
  | "orderDetail"
  | "orderSuccess"
  | "paymentReturn"
  | "admin"
  | "adminProducts"
  | "favorites"
  | "login"
  | "register"
  | "forgotPassword"
  | "googleCallback"
  | "profile"
  | "editProfile"
  | "addresses";

export type Navigate = (path: string) => void;

export type ThirdPartyProvider = "google" | "github" | "facebook";

export type Address = {
  id: string;
  label: string;
  receiverName: string;
  phone: string;
  line1: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
};

export type UserProfile = {
  id: string;
  authUserId: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  birthday: string;
  gender: string;
  role: "customer" | "admin";
  memberSince: string;
  loyaltyPoint: number;
  marketingOptIn: boolean;
  addresses: Address[];
};

export type CartItem = {
  productId: string;
  quantity: number;
};

export type OrderStatus = "created" | "paid" | "shipping" | "completed" | "cancelled";

export type PaymentMethod = "cod" | "mock_card" | "bank_transfer" | "vnpay";

export type Payment = {
  id: string;
  paymentCode: string;
  orderId: string;
  orderCode: string;
  userId: string;
  amount: number;
  method: PaymentMethod;
  status: "pending" | "success" | "failed";
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

export type OrderItem = {
  productId: string;
  productName: string;
  category: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type Order = {
  id: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  shippingAddress: Address;
  createdAt: string;
};
