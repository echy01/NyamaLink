import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_BASE_URL = "http://192.168.1.3:5000/api";

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

  // Forgot password (request reset token)
  requestReset: ({ email }) => instance.post("/auth/requestreset", { email }),

  // Reset password with token
  resetPassword: ({ email, code, newPassword }) =>
    instance.post("/auth/resetpassword", { email, code, newPassword }),

  // 🔑 OTP
  sendOtp: ({ phoneNumber }) => instance.post("/otp/send", { phoneNumber }),
  verifyOtp: ({ phoneNumber, code }) =>
    instance.post("/otp/verify", { phoneNumber, code }),

  // 🏭 Agent (Slaughterhouse) Endpoints
  getSlaughterhouseInventory: () => instance.get("/agent/inventory"),
  addSlaughterhouseInventory: (itemData) =>
    instance.post("/agent/inventory", itemData),
  getButcheryOrders: () => instance.get("/agent/orders"),
  // getButchers: () => instance.get("/agent/butchers"),
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
  updateAgentLocation: ({ lat, lng }) =>
    instance.put("/agent/profile/location", { lat, lng }),

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
  getNearbySlaughterhouses: (lat, lng, radius = 5000) =>
    instance.get(
      `/agent/slaughterhouses/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
    ),

  // 🤝 Butcher places order to agent
  createAgentPurchaseOrder: ({ meatId, quantity }) =>
    instance.post("/purchase", { meatId, quantity }),
  updateButcherProfile: (data) => instance.put("/butcher/profile", data),
  getInventoryBySlaughterhouseId: (slaughterhouseId) =>
    instance.get(`/agent/inventory/${slaughterhouseId}`),
  placeButcherOrder: (meatId, quantity) =>
    instance.post("/butcher/order-from-slaughterhouse", { meatId, quantity }),

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
  getNearbyButchers: (lat, lng, radius = 5000) =>
    instance.get(`/butcher/nearby?lat=${lat}&lng=${lng}&radius=${radius}`),
  getInventoryByButcherId: (butcherId) =>
    instance.get(`/customer/butcher-inventory/${butcherId}`),
  updateCustomerLocation: ({ lat, lng }) =>
  instance.put('/customer/profile/location', { lat, lng }),


  // 💳 Payment Endpoints
  initializePayment: (payload) => instance.post(`/payment/initialize`, payload),
  verifyPayment: (transactionRef) =>
    instance.get(`/payment/verify/${transactionRef}`),
};

export default api;
