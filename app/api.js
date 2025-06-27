import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_BASE_URL = "http://10.71.143.101:5000/api";

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
  // 🔐 Auth Endpoints
  login: (credentials) => instance.post("/auth/login", credentials),
  signup: (data) => instance.post("/auth/signup", data),
  getProfile: () => instance.get("/auth/profile"),

  // 🏭 Agent (Slaughterhouse) Endpoints
  getSlaughterhouseInventory: () => instance.get("/agent/inventory"),
  addSlaughterhouseInventory: (itemData) =>
    instance.post("/agent/inventory", itemData),
  getButcheryOrders: () => instance.get("/agent/orders"),
  getButchers: () => instance.get("/agent/butchers"),
  getMyPurchaseOrders: () => instance.get("/agent/purchase/myorders"),
  getAvailableMeatForPurchase: () => instance.get("/agent/purchase/available"),
  placeMeatOrderToSlaughterhouse: (meatId, quantity) =>
    instance.post("/agent/purchase/order", { meatId, quantity }),
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

  updateOrder: (orderId, newStatus, pickupDetails, receptionConfirmation) =>
    instance.put(`/agent/orders/${orderId}/status`, {
      status: newStatus,
      dispatchDetails: pickupDetails,
      deliveryConfirmation: receptionConfirmation,
    }),

  // 🛒 Butcher Endpoints
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
  getMySlaughterhouseOrders: () =>
    instance.get("/butcher/slaughterhouse-orders"),
  orderFromSlaughterhouse: (meatId, quantity) =>
    instance.post("/butcher/order-from-slaughterhouse", { meatId, quantity }),
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

  // 🤝 Butcher places order to agent
  createAgentPurchaseOrder: ({ meatId, quantity }) =>
    instance.post("/purchase", { meatId, quantity }),

  // 👤 Customer Endpoints
  getAvailableMeatForCustomers: () => instance.get("/customer/available-meat"),
  placeCustomerOrder: (meatId, quantity) =>
    instance.post("/customer/place-order", { meatId, quantity }),
  getMyCustomerOrders: () => instance.get("/customer/my-orders"),
  updateMyCustomerOrderStatus: (orderId, status, deliveryConfirmation = {}) =>
    instance.put(`/customer/my-orders/${orderId}/status`, {
      status,
      deliveryConfirmation,
    }),

  // 💳 Payment Endpoints
  initializePayment: (payload) => instance.post(`/payment/initialize`, payload),
  verifyPayment: (transactionRef) =>
    instance.get(`/payment/verify/${transactionRef}`),
};

export default api;
