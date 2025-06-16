import express from 'express';
import {
  getInventory,
  addInventoryItem,
  updateInventoryStock,
  getCustomerOrders,
  updateOrderStatus,
  getSlaughterhouseOrders,
  orderFromSlaughterhouse,
} from '../controllers/butchercontroller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Inventory routes
router.get('/inventory', protect, getInventory);
router.post('/inventory/add', protect, addInventoryItem);
router.put('/inventory/:itemId/stock', protect, updateInventoryStock);

// Customer orders
router.get('/customer-orders', protect, getCustomerOrders);
router.put('/orders/:orderId/status', protect, updateOrderStatus);

// Slaughterhouse orders
router.get('/slaughterhouse-orders', protect, getSlaughterhouseOrders);
router.post('/order-from-slaughterhouse', protect, orderFromSlaughterhouse);

export default router;
