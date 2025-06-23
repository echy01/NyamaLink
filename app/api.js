import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_BASE_URL = "http://192.168.100.48:5000/api";

const instance = axios.create({
  baseURL: API_BASE_URL,
});

// Attach JWT token from AsyncStorage
instance.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Export grouped API calls
const api = {
  // 🔐 Auth
  login: (credentials) => instance.post("/auth/login", credentials),
  signup: (data) => instance.post("/auth/register", data),

  // 🧍‍♂️ Butcher Endpoints
  getButcherInventory: () => instance.get("/butcher/inventory"),
  // Pass meatType, price, stock for adding
  addInventoryItem: (item) =>
    instance.post("/butcher/inventory/add", {
      meatType: item.meatType,
      price: item.price,
      stock: item.stock,
    }),
  // Pass meatType, price, stock for updating
  updateInventoryItem: (id, updates) =>
    instance.put(`/butcher/inventory/${id}`, {
      meatType: updates.meatType,
      price: updates.price,
      stock: updates.stock,
    }),
  updateInventoryStock: (id, stock) =>
    instance.put(`/butcher/inventory/${id}/stock`, { stock }),
  getCustomerOrdersForButcher: () => instance.get("/butcher/customer-orders"),
  updateOrderStatus: (id, status) =>
    instance.put(`/orders/${id}/status`, { status }),
  getAvailableMeatForPurchase: () => instance.get("/agent/purchase/available"),
  orderFromSlaughterhouse: (meatId, quantity) =>
    instance.post("/butcher/order-from-slaughterhouse", { meatId, quantity }),
  getSlaughterhouseOrders: () => instance.get("/butcher/slaughterhouse-orders"),

  // 🧑‍🌾 Slaughterhouse Endpoints (Agent)
  getSlaughterhouseInventory: () => instance.get("/agent/inventory"),
  addSlaughterhouseInventory: (item) => instance.post("/agent/inventory", item),
  getButcheryOrders: () => instance.get("/agent/orders"),
  getMyPurchaseOrders: () => instance.get("/agent/purchase/myorders"),
  placeMeatOrder: (meatId, quantity) =>
    instance.post("/agent/purchase/order", { meatId, quantity }),
  getButchers: () => instance.get("/agent/butchers"),

  // 🧍‍♀️ Customer Endpoints (if used)
  getAvailableMeat: () => instance.get("/meat/available"),
  placeOrder: (items) => instance.post("/orders/place", { items }),
  getCustomerOrders: () => instance.get("/orders/customer"),
};

export default api;
