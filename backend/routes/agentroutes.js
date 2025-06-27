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
} from '../controllers/agentcontroller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// 📦 Inventory
router.get('/inventory', getSlaughterhouseInventory);
router.post('/inventory', addSlaughterhouseInventory);

// 📬 Orders from butchers to agents
router.get('/orders', getButcheryOrders);
router.put('/orders/:id/status', updateButcherOrderStatus);

// 📖 Butcher directory
router.get('/butchers', getButchers);

// // 🛒 Slaughterhouse purchases
router.get('/purchase/available', getAvailableMeatForPurchase);
router.post('/purchase/order', placeMeatOrder);

export default router;
