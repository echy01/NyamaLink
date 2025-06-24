import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_BASE_URL = "http://192.168.100.48:5000/api";

const instance = axios.create({
  baseURL: API_BASE_URL,
});

instance.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const api = {
  //  Auth Endpoints
  login: (credentials) => instance.post("/auth/login", credentials),
  signup: (data) => instance.post("/auth/register", data),
  getProfile: () => instance.get("/auth/profile"),

  //  Agent (Slaughterhouse) Endpoints
  getSlaughterhouseInventory: () => instance.get("/agent/inventory"),
  addSlaughterhouseInventory: (itemData) =>
    instance.post("/agent/inventory", itemData),
  getButcheryOrders: () => instance.get("/agent/orders"),
  getButchers: () => instance.get("/agent/butchers"),
  getMyPurchaseOrders: () => instance.get("/agent/purchase/myorders"),
  getAvailableMeatForPurchase: () => instance.get("/agent/purchase/available"),
  placeMeatOrderToSlaughterhouse: (meatId, quantity) =>
    instance.post("/agent/purchase/order", { meatId, quantity }),
  // New Agent actions for Purchases (butcher orders to agent's slaughterhouse)
  updateButcherOrderStatus: (
    purchaseId,
    status,
    dispatchDetails = {},
    deliveryConfirmation = {}
  ) =>
    instance.put(`/agent/orders/${purchaseId}/status`, {
      status,
      dispatchDetails,
      deliveryConfirmation,
    }),

  //  Butcher Endpoints
  getButcherInventory: () => instance.get("/butcher/inventory"),
  addInventoryItem: (itemData) =>
    instance.post("/butcher/inventory/add", itemData),
  updateInventoryItem: (itemId, updates) =>
    instance.put(`/butcher/inventory/${itemId}`, updates),
  updateInventoryStock: (itemId, stock) =>
    instance.put(`/butcher/inventory/${itemId}/stock`, { stock }),
  getCustomerOrdersForButcher: () => instance.get("/butcher/customer-orders"),
  updateCustomerOrderStatus: (
    orderId,
    status,
    dispatchDetails = {},
    deliveryConfirmation = {}
  ) =>
    instance.put(`/butcher/customer-orders/${orderId}/status`, {
      status,
      dispatchDetails,
      deliveryConfirmation,
    }),
  getSlaughterhouseOrders: () => instance.get("/butcher/slaughterhouse-orders"),
  orderFromSlaughterhouse: (meatId, quantity) =>
    instance.post("/butcher/order-from-slaughterhouse", { meatId, quantity }),
  // New Butcher actions for Slaughterhouse orders (butcher's own purchases)
  updateSlaughterhouseOrderStatus: (
    purchaseId,
    status,
    dispatchDetails = {},
    deliveryConfirmation = {}
  ) =>
    instance.put(`/butcher/slaughterhouse-orders/${purchaseId}/status`, {
      status,
      dispatchDetails,
      deliveryConfirmation,
    }),

  //  Customer Endpoints
  getAvailableMeatForCustomers: () => instance.get("/customer/available-meat"),
  placeCustomerOrder: (meatId, quantity) =>
    instance.post("/customer/place-order", { meatId, quantity }),
  getMyCustomerOrders: () => instance.get("/customer/my-orders"),
  // New Customer actions for their own orders
  updateMyCustomerOrderStatus: (orderId, status, deliveryConfirmation = {}) =>
    instance.put(`/customer/my-orders/${orderId}/status`, {
      status,
      deliveryConfirmation,
    }),

  //  Payment Endpoints (Placeholders for Paystack integration)
  initializePayment: (orderId, amount, email) =>
    instance.post(`/payment/initialize`, { orderId, amount, email }),
  verifyPayment: (transactionRef) =>
    instance.get(`/payment/verify/${transactionRef}`),
};

export default api;
