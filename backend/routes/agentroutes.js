import express from 'express';
import {
  getSlaughterhouseInventory,
  addSlaughterhouseInventory,
  getButcheryOrders,
  getButchers,
  getMyPurchaseOrders,
  getAvailableMeatForPurchase,
  placeMeatOrder
} from '../controllers/agentcontroller.js'; // Import functions from the new controller
import { protect } from '../middleware/authMiddleware.js'; // Import protect middleware

const router = express.Router();

// 🥩 Inventory Management for the Agent's own slaughterhouse
router.get('/inventory', protect, getSlaughterhouseInventory); // Only agent can view their own inventory
router.post('/inventory', protect, addSlaughterhouseInventory); // Only agent can add to their own inventory

// 🧾 Orders placed by butchers to this slaughterhouse (Agent's inbound orders)
router.get('/orders', protect, getButcheryOrders);

// 👥 Get all registered butchers (for agent to view)
router.get('/butchers', protect, getButchers);

// 🛒 Agent's own purchase orders (from other slaughterhouses)
router.get('/purchase/myorders', protect, getMyPurchaseOrders);
router.get('/purchase/available', protect, getAvailableMeatForPurchase); // Meat available from others for agent to buy
router.post('/purchase/order', protect, placeMeatOrder); // Agent places order to another slaughterhouse


export default router;
