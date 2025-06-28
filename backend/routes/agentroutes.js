import express from 'express';
import {
  getSlaughterhouseInventory,
  addSlaughterhouseInventory,
  getButcheryOrders,
  getButchers,
  getAvailableMeatForPurchase,
  placeMeatOrder, 
  // getMyPurchaseOrders,
  updateButcherOrderStatus,
  getNearbySlaughterhouses, 
  updateAgentLocation,
  getInventoryBySlaughterhouseId,
} from '../controllers/agentcontroller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// 📦 Inventory
router.get('/inventory', getSlaughterhouseInventory);
router.post('/inventory', addSlaughterhouseInventory);
router.get('/inventory/:slaughterhouseId', getInventoryBySlaughterhouseId);

// 📬 Orders from butchers to agents
router.get('/orders', getButcheryOrders);
router.put('/orders/:id/status', updateButcherOrderStatus);

// 📖 Butcher directory
router.get('/butchers', getButchers);

// // 🛒 Slaughterhouse purchases
router.get('/purchase/available', getAvailableMeatForPurchase);
router.post('/purchase/order', placeMeatOrder);

router.get('/slaughterhouses/nearby', getNearbySlaughterhouses);
router.put('/profile/location', protect, updateAgentLocation);

export default router;
