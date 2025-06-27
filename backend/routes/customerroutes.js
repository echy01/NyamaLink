import express from 'express';
import {
  getAvailableMeat,
  placeOrder,
  getMyOrders,
  getInventoryByButcherId
} from '../controllers/customercontroller.js'; 
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// 🥩 Get publicly available meat from butchers
router.get('/available-meat', protect, getAvailableMeat);

router.get('/butcher-inventory/:butcherId', getInventoryByButcherId);

// 🛒 Place an order to a butcher
router.post('/place-order', protect, placeOrder);

// 🧾 Get customer's own order history
router.get('/my-orders', protect, getMyOrders);

export default router;
