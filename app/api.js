import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const BASE_URL = "http://10.71.135.198:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Auth Endpoints ---
const register = (userData) => api.post("/auth/register", userData);
const login = (userData) => api.post("/auth/login", userData);
const getProfile = () => api.get("/auth/profile");

// --- Agent Endpoints ---
const getSlaughterhouseInventory = () => api.get("/agent/inventory");
const addSlaughterhouseInventory = (itemData) =>
  api.post("/agent/inventory", itemData);
const getButcheryOrders = () => api.get("/agent/orders");
const getButchers = () => api.get("/agent/butchers");
const getMyPurchaseOrders = () => api.get("/agent/purchase/myorders");
const getAvailableMeatForPurchase = () => api.get("/agent/purchase/available");
const placeMeatOrderToSlaughterhouse = (meatId, quantity) =>
  api.post("/agent/purchase/order", { meatId, quantity });

// --- Butcher Endpoints ---
const getButcherInventory = () => api.get("/butcher/inventory");
const addInventoryItem = (itemData) =>
  api.post("/butcher/inventory/add", itemData);
const updateInventoryItem = (itemId, itemData) =>
  api.put(`/butcher/inventory/${itemId}`, itemData);
const updateInventoryStock = (itemId, stock) =>
  api.put(`/butcher/inventory/${itemId}/stock`, { stock });
const getCustomerOrdersForButcher = () => api.get("/butcher/customer-orders");
const updateOrderStatus = (orderId, status) =>
  api.put(`/butcher/orders/${orderId}/status`, { status });
const getSlaughterhouseOrders = () => api.get("/butcher/slaughterhouse-orders");
const orderFromSlaughterhouse = (meatId, quantity) =>
  api.post("/butcher/order-from-slaughterhouse", { meatId, quantity });

// --- Customer Endpoints (NEW) ---
const getAvailableMeatForCustomers = () => api.get("/customer/available-meat");
const placeCustomerOrder = (meatId, quantity) =>
  api.post("/customer/place-order", { meatId, quantity });
const getMyCustomerOrders = () => api.get("/customer/my-orders");

export default {
  register,
  login,
  getProfile,
  getSlaughterhouseInventory,
  addSlaughterhouseInventory,
  getButcheryOrders,
  getButchers,
  getMyPurchaseOrders,
  getAvailableMeatForPurchase,
  placeMeatOrderToSlaughterhouse,
  getButcherInventory,
  addInventoryItem,
  updateInventoryItem,
  updateInventoryStock,
  getCustomerOrdersForButcher,
  updateOrderStatus,
  getSlaughterhouseOrders,
  orderFromSlaughterhouse,
  getAvailableMeatForCustomers,
  placeCustomerOrder,
  getMyCustomerOrders,
};
