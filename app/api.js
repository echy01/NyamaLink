import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.137.1:5000/api/slaughterhouse';

const instance = axios.create({
  baseURL: API_BASE_URL,
});

// Attach JWT to headers
instance.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const api = {
  // Customer endpoints
  getAvailableMeat: () => instance.get('/meat/available'),
  placeOrder: (items) => instance.post('/orders/place', { items }),
  getCustomerOrders: () => instance.get('/orders/customer'),

  // Butcher endpoints
  getButchers: () => instance.get('/butchers'),
  getButcherInventory: () => instance.get('/butcher/inventory'),
  addInventoryItem: (item) => instance.post('/butcher/inventory/add', item),
  updateInventoryStock: (id, stock) => instance.put(`/butcher/inventory/${id}/stock`, { stock }),
  getCustomerOrdersForButcher: () => instance.get('/butcher/customer-orders'),
  updateOrderStatus: (id, status) => instance.put(`/orders/${id}/status`, { status }),
  getSlaughterhouseMeat: () => instance.get('/available-meat'),
  orderFromSlaughterhouse: (meatId, quantity) =>
    instance.post('/butcher/order-from-slaughterhouse', { meatId, quantity }),

// Slaughterhouse endpoints
getSlaughterhouseInventory: () => instance.get('/inventory'),
addSlaughterhouseInventory: (item) => instance.post('/inventory', item),
getButcheryOrders: () => instance.get('/orders'),
getAvailableMeatForPurchase: () => instance.get('/purchase/available'),
placeMeatOrder: (meatId, quantity) =>
  instance.post('/purchase/order', { meatId, quantity }),
};

export default api;
