import { config } from "../config.js";
import { OrderError } from "../errors/order-error.js";
import {
  createOrderWithItems,
  findOrderByUserIdAndPublicId,
  listAllOrders,
  listOrderItems,
  listOrdersByUserId,
  updateOrderStatus,
  type NewOrder,
  type NewOrderItem
} from "../repositories/order.repository.js";
import type {
  AccessTokenPayload,
  CartResponse,
  OrderItemRecord,
  OrderRecord,
  PaymentMethod,
  ProductResponse,
  PublicAddress,
  PublicOrder,
  PublicOrderItem,
  PublicPayment,
  UserProfileResponse
} from "../types/order.js";
import { requestJson } from "../utils/http.js";

type CreateOrderInput = {
  paymentMethod?: PaymentMethod;
  addressId?: string;
};

type CreatePaymentResponse = {
  payment: PublicPayment;
  paymentUrl?: string;
};

function buildServiceUrl(baseUrl: string, path: string) {
  return new URL(path, baseUrl).toString();
}

function authorizationHeader(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`
  };
}

function normalizePaymentMethod(value: PaymentMethod | undefined): PaymentMethod {
  if (value === "cod" || value === "bank_transfer" || value === "vnpay") {
    return value;
  }

  throw new OrderError("Payment method is invalid", 400);
}

function generateOrderCode() {
  return `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
}

function calculateSummary(items: NewOrderItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const shippingFee = subtotal >= 300000 || subtotal === 0 ? 0 : 18000;
  const discount = subtotal >= 400000 ? 25000 : 0;

  return {
    subtotal,
    shippingFee,
    discount,
    totalAmount: Math.max(subtotal + shippingFee - discount, 0)
  };
}

function toNumber(value: string | number) {
  return Number(value);
}

function normalizeAddressSnapshot(value: PublicAddress | string): PublicAddress {
  return typeof value === "string" ? (JSON.parse(value) as PublicAddress) : value;
}

function toPublicOrderItem(item: OrderItemRecord): PublicOrderItem {
  return {
    productId: item.productId,
    productName: item.productNameSnapshot,
    category: item.categorySnapshot,
    unitPrice: toNumber(item.unitPriceSnapshot),
    quantity: item.quantity,
    lineTotal: toNumber(item.lineTotal)
  };
}

async function toPublicOrder(order: OrderRecord): Promise<PublicOrder> {
  const items = await listOrderItems(order.id);

  return {
    id: order.orderCode,
    internalId: order.id,
    userId: order.userId,
    status: order.status,
    items: items.map(toPublicOrderItem),
    subtotal: toNumber(order.subtotal),
    shippingFee: toNumber(order.shippingFee),
    discount: toNumber(order.discount),
    totalAmount: toNumber(order.totalAmount),
    paymentMethod: order.paymentMethod,
    shippingAddress: normalizeAddressSnapshot(order.shippingAddressSnapshot),
    createdAt: order.createdAt.toISOString()
  };
}

async function getMyCart(accessToken: string) {
  return requestJson<CartResponse>(buildServiceUrl(config.cartServiceUrl, "/cart"), {
    headers: authorizationHeader(accessToken)
  });
}

async function clearMyCart(accessToken: string) {
  return requestJson<CartResponse>(buildServiceUrl(config.cartServiceUrl, "/cart"), {
    method: "DELETE",
    headers: authorizationHeader(accessToken)
  });
}

async function getMyProfile(accessToken: string) {
  return requestJson<UserProfileResponse>(buildServiceUrl(config.userServiceUrl, "/users/me"), {
    headers: authorizationHeader(accessToken)
  });
}

async function getProduct(productId: string) {
  return requestJson<ProductResponse>(buildServiceUrl(config.productServiceUrl, `/products/${encodeURIComponent(productId)}`));
}

async function createPayment(input: {
  order: PublicOrder;
  method: PaymentMethod;
  amount: number;
  userId: string;
  ipAddr: string;
}) {
  return requestJson<CreatePaymentResponse>(buildServiceUrl(config.paymentServiceUrl, "/payments"), {
    method: "POST",
    headers: {
      "X-Internal-Service-Token": config.internalServiceToken
    },
    body: {
      orderId: input.order.internalId,
      orderCode: input.order.id,
      userId: input.userId,
      amount: input.amount,
      method: input.method,
      orderInfo: `Thanh toan don hang ${input.order.id}`,
      ipAddr: input.ipAddr
    }
  });
}

async function buildOrderItems(cart: CartResponse["cart"]) {
  const orderItems: NewOrderItem[] = [];

  for (const cartItem of cart.items) {
    const product = await getProduct(cartItem.productId);

    if (product.status !== "active") {
      throw new OrderError(`Product ${product.id} is inactive`, 400);
    }

    orderItems.push({
      productId: product.id,
      productNameSnapshot: product.name,
      categorySnapshot: product.category,
      unitPriceSnapshot: product.price,
      quantity: cartItem.quantity,
      lineTotal: product.price * cartItem.quantity
    });
  }

  return orderItems;
}

async function insertOrderWithGeneratedCode(input: Omit<NewOrder, "orderCode">) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await createOrderWithItems({
        ...input,
        orderCode: generateOrderCode()
      });
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
        continue;
      }

      throw error;
    }
  }

  throw new OrderError("Cannot generate unique order code", 500);
}

export async function createMyOrder(auth: AccessTokenPayload, accessToken: string, input: CreateOrderInput, ipAddr: string) {
  const paymentMethod = normalizePaymentMethod(input.paymentMethod);
  const addressId = input.addressId?.trim();

  if (!addressId) {
    throw new OrderError("Address id is required", 400);
  }

  const [cartResult, profileResult] = await Promise.all([getMyCart(accessToken), getMyProfile(accessToken)]);

  if (cartResult.cart.items.length === 0) {
    throw new OrderError("Cart is empty", 400);
  }

  const selectedAddress = profileResult.profile.addresses.find((address) => address.id === addressId);

  if (!selectedAddress) {
    throw new OrderError("Shipping address not found", 404);
  }

  const items = await buildOrderItems(cartResult.cart);
  const summary = calculateSummary(items);
  const createdOrder = await insertOrderWithGeneratedCode({
    userId: auth.sub,
    status: "created",
    paymentMethod,
    shippingAddressSnapshot: selectedAddress,
    items,
    ...summary
  });
  const publicOrder = await toPublicOrder(createdOrder);
  let paymentResult: CreatePaymentResponse;

  try {
    paymentResult = await createPayment({
      order: publicOrder,
      method: paymentMethod,
      amount: summary.totalAmount,
      userId: auth.sub,
      ipAddr
    });
  } catch (error) {
    await updateOrderStatus(createdOrder.id, "cancelled");
    throw error;
  }

  const nextOrder =
    paymentResult.payment.status === "success"
      ? await updateOrderStatus(createdOrder.id, "paid")
      : createdOrder;

  try {
    await clearMyCart(accessToken);
  } catch (error) {
    console.warn("Order created but cart could not be cleared", error);
  }

  return {
    order: await toPublicOrder(nextOrder ?? createdOrder),
    payment: paymentResult.payment,
    paymentUrl: paymentResult.paymentUrl
  };
}

export async function listMyOrders(auth: AccessTokenPayload) {
  const orders = await listOrdersByUserId(auth.sub);
  const items = await Promise.all(orders.map(toPublicOrder));

  return {
    items
  };
}

export async function listOrdersForAdmin(auth: AccessTokenPayload) {
  if (auth.role !== "admin") {
    throw new OrderError("Admin permission is required", 403);
  }

  const orders = await listAllOrders();
  const items = await Promise.all(orders.map(toPublicOrder));

  return {
    items
  };
}

export async function getMyOrder(auth: AccessTokenPayload, orderId: string) {
  const order = await findOrderByUserIdAndPublicId(auth.sub, orderId);

  if (!order) {
    throw new OrderError("Order not found", 404);
  }

  return {
    order: await toPublicOrder(order)
  };
}

export async function updateOrderPaymentResult(orderId: string, paymentStatus: "pending" | "success" | "failed") {
  const nextStatus = paymentStatus === "success" ? "paid" : "created";
  const order = await updateOrderStatus(orderId, nextStatus);

  if (!order) {
    throw new OrderError("Order not found", 404);
  }

  return {
    order: await toPublicOrder(order)
  };
}
