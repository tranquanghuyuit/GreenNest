import { useEffect, useState } from "react";
import {
  fetchCurrentUser,
  loginWithGoogleCode,
  loginWithPassword,
  logoutAuthSession,
  refreshAuthSession,
  registerAccount,
  type AuthApiUser,
  type AuthTokens
} from "./api/auth";
import { addMyCartItem, fetchMyCart, removeMyCartItem, updateMyCartItem } from "./api/cart";
import { fetchPaymentByOrderCode, confirmAdminPayment } from "./api/payments";
import { createMyOrder, fetchAdminOrders, fetchMyOrders } from "./api/orders";
import {
  createAdminCategory,
  createAdminDeal,
  createAdminProduct,
  deleteAdminDeal,
  rateProduct,
  updateAdminProduct,
  type ProductDealPayload,
  type ProductPayload
} from "./api/products";
import {
  addMyFavorite,
  createMyAddress,
  deleteMyFavorite,
  deleteMyAddress,
  fetchMyFavorites,
  fetchMyProfile,
  updateMyAddress,
  updateMyProfile,
  type AddressPayload
} from "./api/users";
import { Layout } from "./components/Layout";
import { AdminPage } from "./pages/AdminPages";
import {
  ForgotPasswordPage,
  GoogleCallbackPage,
  LoginPage,
  RegisterPage,
  type LoginPayload,
  type RegisterPayload
} from "./pages/AuthPages";
import {
  CartPage,
  CategoriesPage,
  CheckoutPage,
  FavoritesPage,
  getCartSummary,
  OrderDetailPage,
  OrdersPage,
  OrderSuccessPage,
  VnpayReturnPage
} from "./pages/CommercePages";
import { HomePage } from "./pages/HomePage";
import { AddressesPage, EditProfilePage, ProfilePage } from "./pages/ProfilePages";
import type { Address, CartItem, Order, Payment, PaymentMethod, RouteId, ThirdPartyProvider, UserProfile } from "./types";

const SESSION_STORAGE_KEY = "greennest-auth-session";
const AUTH_TOKENS_STORAGE_KEY = "greennest-auth-tokens";
const PROFILE_STORAGE_KEY = "greennest-user-profile";
const CART_STORAGE_KEY = "greennest-cart";
const FAVORITES_STORAGE_KEY = "greennest-favorites";
const ORDERS_STORAGE_KEY = "greennest-orders";
const GOOGLE_OAUTH_STATE_KEY = "greennest-google-oauth-state";

const routeByPath: Record<string, RouteId> = {
  "/": "home",
  "/categories": "categories",
  "/cart": "cart",
  "/checkout": "checkout",
  "/orders": "orders",
  "/orders/detail": "orderDetail",
  "/orders/success": "orderSuccess",
  "/payment/vnpay-return": "paymentReturn",
  "/admin": "admin",
  "/admin/products": "adminProducts",
  "/favorites": "favorites",
  "/login": "login",
  "/register": "register",
  "/forgot-password": "forgotPassword",
  "/auth/google/callback": "googleCallback",
  "/profile": "profile",
  "/profile/edit": "editProfile",
  "/profile/addresses": "addresses"
};

const pathByRoute: Record<RouteId, string> = {
  home: "/",
  categories: "/categories",
  cart: "/cart",
  checkout: "/checkout",
  orders: "/orders",
  orderDetail: "/orders/detail",
  orderSuccess: "/orders/success",
  paymentReturn: "/payment/vnpay-return",
  admin: "/admin",
  adminProducts: "/admin/products",
  favorites: "/favorites",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  googleCallback: "/auth/google/callback",
  profile: "/profile",
  editProfile: "/profile/edit",
  addresses: "/profile/addresses"
};

const protectedRoutes = new Set<RouteId>([
  "profile",
  "editProfile",
  "addresses",
  "checkout",
  "orders",
  "orderDetail",
  "orderSuccess",
  "admin",
  "adminProducts",
  "favorites"
]);

function normalizePath(pathname: string) {
  if (pathname !== "/" && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname || "/";
}

function getRouteFromLocation() {
  return routeByPath[normalizePath(window.location.pathname)] ?? "home";
}

function createDefaultUser(email = "demo@greennest.local", fullName = "Nguyễn Văn A"): UserProfile {
  const username = email.split("@")[0] || "demo-user";

  return {
    id: "usr-demo-001",
    authUserId: "auth-demo-001",
    fullName,
    username,
    email,
    phone: "0900 000 000",
    birthday: "2002-09-12",
    gender: "Nam",
    role: "customer",
    memberSince: "16/05/2026",
    loyaltyPoint: 1280,
    marketingOptIn: true,
    addresses: [
      {
        id: "addr-home",
        label: "Nhà riêng",
        receiverName: fullName,
        phone: "0900 000 000",
        line1: "12 Nguyễn Văn Bảo",
        ward: "Phường 4",
        district: "Gò Vấp",
        city: "TP. Hồ Chí Minh",
        isDefault: true
      }
    ]
  };
}

const thirdPartyProfiles: Record<ThirdPartyProvider, { email: string; fullName: string; username: string }> = {
  google: {
    email: "google.user@greennest.local",
    fullName: "Google User",
    username: "google_user"
  },
  github: {
    email: "github.user@greennest.local",
    fullName: "GitHub User",
    username: "github_user"
  },
  facebook: {
    email: "facebook.user@greennest.local",
    fullName: "Facebook User",
    username: "facebook_user"
  }
};

function readStoredProfile() {
  try {
    const rawProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
    return rawProfile ? (JSON.parse(rawProfile) as UserProfile) : null;
  } catch {
    return null;
  }
}

function readStoredAuthTokens() {
  try {
    const rawTokens = localStorage.getItem(AUTH_TOKENS_STORAGE_KEY);
    return rawTokens ? (JSON.parse(rawTokens) as AuthTokens) : null;
  } catch {
    return null;
  }
}

function loadInitialUser() {
  if (localStorage.getItem(SESSION_STORAGE_KEY) !== "active" || !readStoredAuthTokens()) {
    return null;
  }

  return readStoredProfile() ?? createDefaultUser();
}

function persistUser(profile: UserProfile) {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  localStorage.setItem(SESSION_STORAGE_KEY, "active");
}

function persistAuthSession(profile: UserProfile, tokens: AuthTokens) {
  persistUser(profile);
  localStorage.setItem(AUTH_TOKENS_STORAGE_KEY, JSON.stringify(tokens));
}

function clearAuthSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  localStorage.removeItem(AUTH_TOKENS_STORAGE_KEY);
}

function getStoredAccessToken() {
  const tokens = readStoredAuthTokens();

  if (!tokens?.accessToken) {
    throw new Error("Bạn cần đăng nhập lại để thực hiện thao tác này.");
  }

  return tokens.accessToken;
}

function getApiStatusCode(error: unknown) {
  if (typeof error === "object" && error !== null && "statusCode" in error) {
    const statusCode = Number((error as { statusCode?: unknown }).statusCode);
    return Number.isNaN(statusCode) ? null : statusCode;
  }

  return null;
}

function createProfileFromAuthUser(
  authUser: AuthApiUser,
  options: {
    existingProfile?: UserProfile | null;
    fullName?: string;
    marketingOptIn?: boolean;
  } = {}
): UserProfile {
  const existingProfile =
    options.existingProfile && options.existingProfile.authUserId === authUser.id ? options.existingProfile : null;

  return {
    id: existingProfile?.id ?? `profile-${authUser.id}`,
    authUserId: authUser.id,
    fullName: existingProfile?.fullName ?? options.fullName ?? authUser.username,
    username: authUser.username,
    email: authUser.email,
    phone: existingProfile?.phone ?? "",
    birthday: existingProfile?.birthday ?? "",
    gender: existingProfile?.gender ?? "",
    role: authUser.role,
    memberSince: existingProfile?.memberSince ?? new Intl.DateTimeFormat("vi-VN").format(new Date()),
    loyaltyPoint: existingProfile?.loyaltyPoint ?? 0,
    marketingOptIn: options.marketingOptIn ?? existingProfile?.marketingOptIn ?? true,
    addresses: existingProfile?.addresses ?? []
  };
}

async function loadProfileFromUserService(accessToken: string) {
  const result = await fetchMyProfile(accessToken);
  const storedProfile = readStoredProfile();

  if (
    storedProfile?.authUserId === result.profile.authUserId &&
    storedProfile.addresses.length > 0 &&
    result.profile.addresses.length === 0
  ) {
    for (const address of storedProfile.addresses) {
      await createMyAddress(accessToken, {
        label: address.label,
        receiverName: address.receiverName,
        phone: address.phone,
        line1: address.line1,
        ward: address.ward,
        district: address.district,
        city: address.city,
        isDefault: address.isDefault
      });
    }

    return (await fetchMyProfile(accessToken)).profile;
  }

  return result.profile;
}

async function loadCartFromCartService(accessToken: string) {
  const result = await fetchMyCart(accessToken);
  const storedCart = readStoredCart();

  if (storedCart.length > 0 && result.cart.items.length === 0) {
    for (const item of storedCart) {
      await addMyCartItem(accessToken, item);
    }

    return (await fetchMyCart(accessToken)).cart.items;
  }

  return result.cart.items;
}

async function loadCartForSession(accessToken: string) {
  try {
    return await loadCartFromCartService(accessToken);
  } catch {
    return readStoredCart();
  }
}

async function loadOrdersForSession(accessToken: string) {
  try {
    return (await fetchMyOrders(accessToken)).items;
  } catch {
    return readStoredOrders();
  }
}

async function loadFavoritesForSession(accessToken: string) {
  try {
    return (await fetchMyFavorites(accessToken)).items.map((favorite) => favorite.productId);
  } catch {
    return readStoredFavorites();
  }
}

async function loadPaymentsForOrders(ordersToLoad: Order[]) {
  const entries = await Promise.all(
    ordersToLoad.map(async (order) => {
      try {
        const result = await fetchPaymentByOrderCode(order.id);
        return [order.id, result.payment] as const;
      } catch {
        return null;
      }
    })
  );

  return Object.fromEntries(entries.filter(Boolean) as Array<readonly [string, Payment]>);
}

function readStoredCart() {
  try {
    const rawCart = localStorage.getItem(CART_STORAGE_KEY);
    return rawCart ? (JSON.parse(rawCart) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function persistCart(cartItems: CartItem[]) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
}

function readStoredOrders() {
  try {
    const rawOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
    return rawOrders ? (JSON.parse(rawOrders) as Order[]) : [];
  } catch {
    return [];
  }
}

function persistOrders(orders: Order[]) {
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
}

function readStoredFavorites() {
  try {
    const rawFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return rawFavorites ? (JSON.parse(rawFavorites) as string[]) : [];
  } catch {
    return [];
  }
}

function persistFavorites(productIds: string[]) {
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(productIds));
}

function orderBelongsToUser(order: Order, profile: UserProfile) {
  return order.userId === profile.authUserId || order.userId === profile.id;
}

function createGoogleOAuthUrl() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  if (!clientId || clientId.includes("your-google-client-id")) {
    return null;
  }

  const state = crypto.randomUUID();
  localStorage.setItem(GOOGLE_OAUTH_STATE_KEY, state);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${window.location.origin}/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    prompt: "select_account",
    access_type: "online",
    state
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

function App() {
  const [route, setRoute] = useState<RouteId>(() => getRouteFromLocation());
  const [user, setUser] = useState<UserProfile | null>(() => loadInitialUser());
  const [cartItems, setCartItems] = useState<CartItem[]>(() => readStoredCart());
  const [favoriteProductIds, setFavoriteProductIds] = useState<string[]>(() => readStoredFavorites());
  const [orders, setOrders] = useState<Order[]>(() => readStoredOrders());
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [paymentsByOrderCode, setPaymentsByOrderCode] = useState<Record<string, Payment>>({});
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [adminNotice, setAdminNotice] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  useEffect(() => {
    function handlePopState() {
      setRoute(getRouteFromLocation());
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    let isActive = true;

    async function verifyStoredSession() {
      const tokens = readStoredAuthTokens();

      if (!tokens) {
        return;
      }

      try {
        const currentUser = await fetchCurrentUser(tokens.accessToken);

        if (!isActive) {
          return;
        }

        const profile = await loadProfileFromUserService(tokens.accessToken);
        const syncedCart = await loadCartForSession(tokens.accessToken);
        const syncedOrders = await loadOrdersForSession(tokens.accessToken);
        const syncedFavorites = await loadFavoritesForSession(tokens.accessToken);
        persistUser(profile);
        setUser(profile);
        saveCart(syncedCart);
        saveOrders(syncedOrders);
        saveFavorites(syncedFavorites);
      } catch {
        try {
          const refreshed = await refreshAuthSession(tokens.refreshToken);

          if (!isActive) {
            return;
          }

          const profile = await loadProfileFromUserService(refreshed.accessToken);
          const syncedCart = await loadCartForSession(refreshed.accessToken);
          const syncedOrders = await loadOrdersForSession(refreshed.accessToken);
          const syncedFavorites = await loadFavoritesForSession(refreshed.accessToken);
          persistAuthSession(profile, {
            accessToken: refreshed.accessToken,
            refreshToken: refreshed.refreshToken
          });
          setUser(profile);
          saveCart(syncedCart);
          saveOrders(syncedOrders);
          saveFavorites(syncedFavorites);
        } catch {
          clearAuthSession();

          if (isActive) {
            setUser(null);
            saveCart([]);
            saveOrders([]);
            setFavoriteProductIds([]);
          }
        }
      }
    }

    verifyStoredSession();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (route === "admin" && user?.role === "admin") {
      loadAdminDashboard();
    }
  }, [route, user?.role]);

  function navigate(path: string) {
    const nextPath = normalizePath(path);
    window.history.pushState({}, "", nextPath);
    setRoute(routeByPath[nextPath] ?? "home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleLogin(payload: LoginPayload) {
    const result = await loginWithPassword({
      login: payload.email,
      password: payload.password
    });
    const nextUser = await loadProfileFromUserService(result.accessToken);
    const syncedCart = await loadCartForSession(result.accessToken);
    const syncedOrders = await loadOrdersForSession(result.accessToken);
    const syncedFavorites = await loadFavoritesForSession(result.accessToken);

    persistAuthSession(nextUser, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    });
    setUser(nextUser);
    saveCart(syncedCart);
    saveOrders(syncedOrders);
    saveFavorites(syncedFavorites);
    navigate(pathByRoute[protectedRoutes.has(route) ? route : "profile"]);
  }

  async function handleRegister(payload: RegisterPayload) {
    const result = await registerAccount({
      email: payload.email,
      username: payload.username,
      password: payload.password
    });
    const userProfile = await updateMyProfile(result.accessToken, {
      fullName: payload.fullName,
      phone: "",
      birthday: "",
      gender: "",
      marketingOptIn: payload.marketingOptIn
    });
    const nextUser = userProfile.profile;
    const syncedCart = await loadCartForSession(result.accessToken);
    const syncedOrders = await loadOrdersForSession(result.accessToken);
    const syncedFavorites = await loadFavoritesForSession(result.accessToken);

    persistAuthSession(nextUser, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    });
    setUser(nextUser);
    saveCart(syncedCart);
    saveOrders(syncedOrders);
    saveFavorites(syncedFavorites);
    navigate("/profile/edit");
  }

  function handleThirdPartyAuth(provider: ThirdPartyProvider) {
    if (provider === "google") {
      const googleOAuthUrl = createGoogleOAuthUrl();

      if (!googleOAuthUrl) {
        window.alert(
          "Bạn cần tạo file apps/frontend/.env.local và thêm VITE_GOOGLE_CLIENT_ID trước khi redirect sang Google."
        );
        return;
      }

      window.location.assign(googleOAuthUrl);
      return;
    }

    const providerProfile = thirdPartyProfiles[provider];
    const storedProfile = readStoredProfile();
    const nextUser =
      storedProfile && storedProfile.email === providerProfile.email
        ? storedProfile
        : {
            ...createDefaultUser(providerProfile.email, providerProfile.fullName),
            id: crypto.randomUUID(),
            authUserId: `${provider}-mock-${crypto.randomUUID()}`,
            username: providerProfile.username,
            phone: "",
            birthday: "",
            gender: "",
            addresses: []
          };

    persistUser(nextUser);
    setUser(nextUser);
    saveFavorites(readStoredFavorites());
    navigate("/profile/edit");
  }

  async function handleGoogleCallback(code: string, state: string) {
    const expectedState = localStorage.getItem(GOOGLE_OAUTH_STATE_KEY);

    if (!expectedState || expectedState !== state) {
      window.alert("State OAuth không hợp lệ. Vui lòng thử đăng nhập Google lại.");
      navigate("/login");
      return;
    }

    localStorage.removeItem(GOOGLE_OAUTH_STATE_KEY);

    const result = await loginWithGoogleCode({
      code,
      redirectUri: `${window.location.origin}/auth/google/callback`
    });
    const nextUser = await loadProfileFromUserService(result.accessToken);
    const syncedCart = await loadCartForSession(result.accessToken);
    const syncedOrders = await loadOrdersForSession(result.accessToken);
    const syncedFavorites = await loadFavoritesForSession(result.accessToken);

    persistAuthSession(nextUser, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    });
    setUser(nextUser);
    saveCart(syncedCart);
    saveOrders(syncedOrders);
    saveFavorites(syncedFavorites);
    window.history.replaceState({}, "", "/profile/edit");
    setRoute("editProfile");
  }

  async function handleLogout() {
    const tokens = readStoredAuthTokens();

    if (tokens?.refreshToken) {
      try {
        await logoutAuthSession(tokens.refreshToken);
      } catch {
        // User logout should still clear the browser session when the network is unavailable.
      }
    }

    clearAuthSession();
    setUser(null);
    saveCart([]);
    saveOrders([]);
    setFavoriteProductIds([]);
    navigate("/login");
  }

  async function runWithAuthRetry<T>(operation: (accessToken: string) => Promise<T>) {
    const tokens = readStoredAuthTokens();

    if (!tokens?.accessToken || !tokens.refreshToken) {
      throw new Error("Bạn cần đăng nhập lại để thực hiện thao tác này.");
    }

    try {
      return await operation(tokens.accessToken);
    } catch (error) {
      if (getApiStatusCode(error) !== 401) {
        throw error;
      }

      try {
        const refreshed = await refreshAuthSession(tokens.refreshToken);
        const profile = readStoredProfile() ?? user ?? createProfileFromAuthUser(refreshed.user);

        persistAuthSession(profile, {
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken
        });

        return await operation(refreshed.accessToken);
      } catch (refreshError) {
        clearAuthSession();
        setUser(null);
        saveCart([]);
        saveOrders([]);
        setFavoriteProductIds([]);
        navigate("/login");
        throw refreshError instanceof Error
          ? refreshError
          : new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      }
    }
  }

  async function loadAdminDashboard() {
    if (user?.role !== "admin") {
      return;
    }

    setIsAdminLoading(true);
    setAdminNotice("");

    try {
      await runWithAuthRetry(async (accessToken) => {
        const result = await fetchAdminOrders(accessToken);
        const payments = await loadPaymentsForOrders(result.items);
        setAdminOrders(result.items);
        setPaymentsByOrderCode((current) => ({ ...current, ...payments }));
      });
    } catch (error) {
      setAdminNotice(error instanceof Error ? error.message : "Không tải được dữ liệu admin.");
    } finally {
      setIsAdminLoading(false);
    }
  }

  async function handleConfirmPayment(orderCode: string) {
    try {
      await runWithAuthRetry(async (accessToken) => {
        const result = await confirmAdminPayment(accessToken, orderCode);
        setPaymentsByOrderCode((current) => ({ ...current, [orderCode]: result.payment }));
        const refreshedOrders = await fetchAdminOrders(accessToken);
        setAdminOrders(refreshedOrders.items);
        if (user) {
          const myOrders = await loadOrdersForSession(accessToken);
          saveOrders(myOrders);
        }
      });
      setAdminNotice(`Đã xác nhận thanh toán cho ${orderCode}.`);
    } catch (error) {
      setAdminNotice(error instanceof Error ? error.message : "Không xác nhận được thanh toán.");
    }
  }

  async function handleCreateCategory(payload: { name: string; slug?: string }) {
    await runWithAuthRetry(async (accessToken) => {
      await createAdminCategory(accessToken, payload);
    });
    setAdminNotice("Đã thêm danh mục mới.");
  }

  async function handleCreateProduct(payload: ProductPayload) {
    await runWithAuthRetry(async (accessToken) => {
      await createAdminProduct(accessToken, payload);
    });
    setAdminNotice("Đã thêm sản phẩm mới.");
  }

  async function handleUpdateProduct(productId: string, payload: ProductPayload) {
    await runWithAuthRetry(async (accessToken) => {
      await updateAdminProduct(accessToken, productId, payload);
    });
    setAdminNotice("Đã cập nhật sản phẩm.");
  }

  async function handleCreateDeal(payload: ProductDealPayload) {
    await runWithAuthRetry(async (accessToken) => {
      await createAdminDeal(accessToken, payload);
    });
    setAdminNotice("Đã thêm deal.");
  }

  async function handleDeleteDeal(dealId: string) {
    await runWithAuthRetry(async (accessToken) => {
      await deleteAdminDeal(accessToken, dealId);
    });
    setAdminNotice("Đã xóa deal.");
  }

  async function handleRateProduct(productId: string, rating: number) {
    if (!user) {
      window.alert("Bạn cần đăng nhập để đánh giá sản phẩm.");
      navigate("/login");
      return;
    }

    try {
      await runWithAuthRetry(async (accessToken) => {
        await rateProduct(accessToken, productId, { rating });
      });
      window.alert(`Đã lưu đánh giá ${rating} sao.`);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Không lưu được đánh giá sản phẩm.");
    }
  }

  async function handleToggleFavorite(productId: string) {
    if (!user) {
      window.alert("Bạn cần đăng nhập để lưu sản phẩm yêu thích.");
      navigate("/login");
      return;
    }

    const wasFavorite = favoriteProductIds.includes(productId);
    const nextProductIds = favoriteProductIds.includes(productId)
      ? favoriteProductIds.filter((currentProductId) => currentProductId !== productId)
      : [...favoriteProductIds, productId];

    saveFavorites(nextProductIds);

    if (!readStoredAuthTokens()?.accessToken) {
      return;
    }

    try {
      await runWithAuthRetry(async (accessToken) => {
        if (wasFavorite) {
          await deleteMyFavorite(accessToken, productId);
        } else {
          await addMyFavorite(accessToken, productId);
        }
      });
    } catch (error) {
      saveFavorites(favoriteProductIds);
      window.alert(error instanceof Error ? error.message : "Không lưu được sản phẩm yêu thích.");
    }
  }

  async function saveProfile(profile: UserProfile) {
    await runWithAuthRetry(async (accessToken) => {
      const result = await updateMyProfile(accessToken, {
        fullName: profile.fullName,
        phone: profile.phone,
        birthday: profile.birthday,
        gender: profile.gender,
        marketingOptIn: profile.marketingOptIn
      });

      persistUser(result.profile);
      setUser(result.profile);
    });
  }

  async function refreshProfileAfterAddressChange(accessToken: string) {
    const profile = (await fetchMyProfile(accessToken)).profile;
    persistUser(profile);
    setUser(profile);
    return profile.addresses;
  }

  async function addAddress(payload: AddressPayload) {
    return runWithAuthRetry(async (accessToken) => {
      await createMyAddress(accessToken, payload);
      return refreshProfileAfterAddressChange(accessToken);
    });
  }

  async function setDefaultAddress(addressId: string) {
    return runWithAuthRetry(async (accessToken) => {
      await updateMyAddress(accessToken, addressId, { isDefault: true });
      return refreshProfileAfterAddressChange(accessToken);
    });
  }

  async function removeAddress(addressId: string) {
    return runWithAuthRetry(async (accessToken) => {
      await deleteMyAddress(accessToken, addressId);
      return refreshProfileAfterAddressChange(accessToken);
    });
  }

  function saveCart(nextCartItems: CartItem[]) {
    setCartItems(nextCartItems);
    persistCart(nextCartItems);
  }

  function saveOrders(nextOrders: Order[]) {
    setOrders(nextOrders);
    persistOrders(nextOrders);
  }

  function saveFavorites(nextProductIds: string[]) {
    setFavoriteProductIds(nextProductIds);
    persistFavorites(nextProductIds);
  }

  function getOptionalAccessToken() {
    return user ? readStoredAuthTokens()?.accessToken ?? null : null;
  }

  function addCartItemLocally(productId: string) {
    setCartItems((current) => {
      const existing = current.find((item) => item.productId === productId);
      const nextCartItems = existing
        ? current.map((item) => (item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item))
        : [...current, { productId, quantity: 1 }];

      persistCart(nextCartItems);
      return nextCartItems;
    });
  }

  function updateCartItemLocally(productId: string, quantity: number) {
    const nextQuantity = Math.max(quantity, 0);
    const nextCartItems =
      nextQuantity === 0
        ? cartItems.filter((item) => item.productId !== productId)
        : cartItems.map((item) => (item.productId === productId ? { ...item, quantity: nextQuantity } : item));

    saveCart(nextCartItems);
  }

  function removeCartItemLocally(productId: string) {
    saveCart(cartItems.filter((item) => item.productId !== productId));
  }

  async function handleAddToCart(productId: string) {
    const accessToken = getOptionalAccessToken();

    if (!accessToken) {
      addCartItemLocally(productId);
      return;
    }

    try {
      const result = await addMyCartItem(accessToken, { productId, quantity: 1 });
      saveCart(result.cart.items);
    } catch {
      window.alert("Chưa gọi được Cart Service, tạm lưu giỏ hàng trong trình duyệt.");
      addCartItemLocally(productId);
    }
  }

  async function handleUpdateCartQuantity(productId: string, quantity: number) {
    const accessToken = getOptionalAccessToken();

    if (!accessToken) {
      updateCartItemLocally(productId, quantity);
      return;
    }

    try {
      const result = await updateMyCartItem(accessToken, productId, { quantity: Math.max(quantity, 0) });
      saveCart(result.cart.items);
    } catch {
      window.alert("Chưa cập nhật được Cart Service, tạm cập nhật giỏ hàng trong trình duyệt.");
      updateCartItemLocally(productId, quantity);
    }
  }

  async function handleRemoveCartItem(productId: string) {
    const accessToken = getOptionalAccessToken();

    if (!accessToken) {
      removeCartItemLocally(productId);
      return;
    }

    try {
      const result = await removeMyCartItem(accessToken, productId);
      saveCart(result.cart.items);
    } catch {
      window.alert("Chưa xóa được trên Cart Service, tạm xóa giỏ hàng trong trình duyệt.");
      removeCartItemLocally(productId);
    }
  }

  async function handlePlaceOrder(payload: { paymentMethod: PaymentMethod; addressId: string }) {
    if (!user) {
      navigate("/login");
      return;
    }

    const accessToken = getOptionalAccessToken();

    if (!accessToken) {
      navigate("/login");
      return;
    }

    const selectedAddress = user.addresses.find((address) => address.id === payload.addressId);
    const summary = getCartSummary(cartItems);

    if (!selectedAddress || summary.lines.length === 0) {
      return;
    }

    try {
      const result = await createMyOrder(accessToken, payload);
      const nextOrders = [result.order, ...orders.filter((order) => order.id !== result.order.id)];
      saveOrders(nextOrders);
      saveCart([]);
      setSelectedOrderId(result.order.id);
      if (result.payment) {
        setPaymentsByOrderCode((current) => ({ ...current, [result.order.id]: result.payment as Payment }));
      }
      if (result.paymentUrl && result.payment?.provider === "vnpay") {
        window.location.assign(result.paymentUrl);
        return;
      }
      navigate("/orders/success");
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Chưa tạo được đơn hàng trên Order Service. Vui lòng kiểm tra backend rồi thử lại."
      );
    }
  }

  function handleViewOrder(orderId: string) {
    setSelectedOrderId(orderId);
    fetchPaymentByOrderCode(orderId)
      .then((result) => {
        setPaymentsByOrderCode((current) => ({ ...current, [orderId]: result.payment }));
      })
      .catch(() => {
        // Payment may not exist for old local mock orders.
      });
    navigate("/orders/detail");
  }

  function renderPage() {
    if (protectedRoutes.has(route) && !user) {
      return (
        <LoginPage
          initialNotice="Bạn cần đăng nhập để xem hoặc chỉnh sửa hồ sơ cá nhân."
          onLogin={handleLogin}
          onThirdPartyAuth={handleThirdPartyAuth}
          onNavigate={navigate}
        />
      );
    }

    if ((route === "admin" || route === "adminProducts") && user?.role !== "admin") {
      return (
        <main className="commerce-page">
          <section className="empty-commerce">
            <h1>Không có quyền truy cập</h1>
            <p>Trang này chỉ dành cho tài khoản admin.</p>
            <button className="submit-button compact" type="button" onClick={() => navigate("/")}>
              Về trang chủ
            </button>
          </section>
        </main>
      );
    }

    switch (route) {
      case "categories":
        return (
          <CategoriesPage
            cartItems={cartItems}
            favoriteProductIds={user ? favoriteProductIds : []}
            onAddToCart={handleAddToCart}
            onRateProduct={handleRateProduct}
            onToggleFavorite={handleToggleFavorite}
            onUpdateQuantity={handleUpdateCartQuantity}
          />
        );
      case "favorites":
        return (
          <FavoritesPage
            cartItems={cartItems}
            favoriteProductIds={favoriteProductIds}
            onAddToCart={handleAddToCart}
            onNavigate={navigate}
            onRateProduct={handleRateProduct}
            onToggleFavorite={handleToggleFavorite}
            onUpdateQuantity={handleUpdateCartQuantity}
          />
        );
      case "cart":
        return (
          <CartPage
            cartItems={cartItems}
            onNavigate={navigate}
            onRemoveItem={handleRemoveCartItem}
            onUpdateQuantity={handleUpdateCartQuantity}
          />
        );
      case "checkout":
        return user ? (
          <CheckoutPage cartItems={cartItems} user={user} onNavigate={navigate} onPlaceOrder={handlePlaceOrder} />
        ) : null;
      case "orders": {
        const userOrders = user ? orders.filter((order) => orderBelongsToUser(order, user)) : [];
        return <OrdersPage orders={userOrders} onNavigate={navigate} onViewOrder={handleViewOrder} />;
      }
      case "orderDetail": {
        const userOrders = user ? orders.filter((order) => orderBelongsToUser(order, user)) : [];
        const activeOrder = userOrders.find((order) => order.id === selectedOrderId) ?? userOrders[0] ?? null;
        return <OrderDetailPage order={activeOrder} payment={activeOrder ? paymentsByOrderCode[activeOrder.id] : undefined} onNavigate={navigate} />;
      }
      case "orderSuccess": {
        const userOrders = user ? orders.filter((order) => orderBelongsToUser(order, user)) : [];
        const activeOrder = userOrders.find((order) => order.id === selectedOrderId) ?? userOrders[0] ?? null;
        return (
          <OrderSuccessPage
            order={activeOrder}
            payment={activeOrder ? paymentsByOrderCode[activeOrder.id] : undefined}
            onNavigate={navigate}
            onViewDetail={() => {
              if (activeOrder) {
                handleViewOrder(activeOrder.id);
              } else {
                navigate("/orders");
              }
            }}
          />
        );
      }
      case "admin":
        return (
          <AdminPage
            orders={adminOrders}
            paymentsByOrderCode={paymentsByOrderCode}
            isLoading={isAdminLoading}
            notice={adminNotice}
            onRefresh={loadAdminDashboard}
            onConfirmPayment={handleConfirmPayment}
            onCreateCategory={handleCreateCategory}
            onCreateProduct={handleCreateProduct}
            onCreateDeal={handleCreateDeal}
            onDeleteDeal={handleDeleteDeal}
          />
        );
      case "adminProducts":
        return (
          <CategoriesPage
            cartItems={cartItems}
            favoriteProductIds={[]}
            isAdmin
            onAddToCart={handleAddToCart}
            onRateProduct={handleRateProduct}
            onToggleFavorite={handleToggleFavorite}
            onUpdateProduct={handleUpdateProduct}
            onUpdateQuantity={handleUpdateCartQuantity}
          />
        );
      case "paymentReturn":
        return <VnpayReturnPage onNavigate={navigate} />;
      case "login":
        return <LoginPage onLogin={handleLogin} onThirdPartyAuth={handleThirdPartyAuth} onNavigate={navigate} />;
      case "register":
        return <RegisterPage onRegister={handleRegister} onThirdPartyAuth={handleThirdPartyAuth} onNavigate={navigate} />;
      case "forgotPassword":
        return <ForgotPasswordPage onNavigate={navigate} />;
      case "googleCallback":
        return <GoogleCallbackPage onComplete={handleGoogleCallback} onNavigate={navigate} />;
      case "profile":
        return user ? <ProfilePage route={route} user={user} onNavigate={navigate} /> : null;
      case "editProfile":
        return user ? <EditProfilePage route={route} user={user} onNavigate={navigate} onSaveProfile={saveProfile} /> : null;
      case "addresses":
        if (user?.role === "admin") {
          return <ProfilePage route="profile" user={user} onNavigate={navigate} />;
        }

        return user ? (
          <AddressesPage
            route={route}
            user={user}
            onNavigate={navigate}
            onAddAddress={addAddress}
            onSetDefaultAddress={setDefaultAddress}
            onRemoveAddress={removeAddress}
          />
        ) : null;
      case "home":
      default:
        return (
          <HomePage
            cartItems={cartItems}
            favoriteProductIds={user ? favoriteProductIds : []}
            onAddToCart={handleAddToCart}
            onNavigate={navigate}
            onToggleFavorite={handleToggleFavorite}
            onUpdateQuantity={handleUpdateCartQuantity}
          />
        );
    }
  }

  return (
    <Layout
      cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
      route={route}
      user={user}
      onNavigate={navigate}
      onLogout={handleLogout}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;
