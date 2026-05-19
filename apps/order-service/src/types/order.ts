export type AuthRole = "customer" | "admin";

export type AccessTokenPayload = {
  sub: string;
  email: string;
  username: string;
  role: AuthRole;
  type: "access";
  iat: number;
  exp: number;
};

export type PaymentMethod = "cod" | "mock_card" | "bank_transfer" | "vnpay";
export type OrderStatus = "created" | "paid" | "shipping" | "completed" | "cancelled";

export type PublicAddress = {
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

export type PublicOrderItem = {
  productId: string;
  productName: string;
  category: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type PublicOrder = {
  id: string;
  internalId: string;
  userId: string;
  status: OrderStatus;
  items: PublicOrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  shippingAddress: PublicAddress;
  createdAt: string;
};

export type PublicPayment = {
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
};

export type OrderRecord = {
  id: string;
  orderCode: string;
  userId: string;
  status: OrderStatus;
  subtotal: string;
  shippingFee: string;
  discount: string;
  totalAmount: string;
  paymentMethod: PaymentMethod;
  shippingAddressSnapshot: PublicAddress;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderItemRecord = {
  id: string;
  orderId: string;
  productId: string;
  productNameSnapshot: string;
  categorySnapshot: string;
  unitPriceSnapshot: string;
  quantity: number;
  lineTotal: string;
  createdAt: Date;
};

export type CartResponse = {
  cart: {
    id: string;
    userId: string;
    items: Array<{
      productId: string;
      quantity: number;
    }>;
    updatedAt: string;
  };
};

export type ProductResponse = {
  id: string;
  name: string;
  category: string;
  price: number;
  status: "active" | "inactive";
};

export type UserProfileResponse = {
  profile: {
    id: string;
    authUserId: string;
    addresses: PublicAddress[];
  };
};
