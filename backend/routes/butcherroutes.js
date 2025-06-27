import express from 'express';
import {
  getNearbyButchers,
  getInventory,
  addInventoryItem,
  updateInventoryItem,
  updateInventoryStock,
  getCustomerOrdersForButcher,
  updateCustomerOrderStatus, 
  getSlaughterhouseOrders,
  orderFromSlaughterhouse,
  updateSlaughterhouseOrderStatus 
} from '../controllers/butchercontroller.js';
import { protect } from '../middleware/authMiddleware.js';
import { updateButcherProfile } from '../controllers/butchercontroller.js';


const router = express.Router();

// Butcher's own inventory management
router.get('/inventory', protect, getInventory);
router.post('/inventory/add', protect, addInventoryItem);
router.put('/inventory/:itemId', protect, updateInventoryItem);
router.put('/inventory/:itemId/stock', protect, updateInventoryStock);

// Customer orders to this butcher
router.get('/customer-orders', protect, getCustomerOrdersForButcher);
router.put('/customer-orders/:orderId/status', protect, updateCustomerOrderStatus);

//  Butcher's own purchase orders from slaughterhouses
router.get('/slaughterhouse-orders', protect, getSlaughterhouseOrders);
router.post('/order-from-slaughterhouse', protect, orderFromSlaughterhouse);
router.put('/slaughterhouse-orders/:purchaseId/status', protect, updateSlaughterhouseOrderStatus);
router.put('/profile', protect, updateButcherProfile);

router.get('/nearby', getNearbyButchers);

export default router;
