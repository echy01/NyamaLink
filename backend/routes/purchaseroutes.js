import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createPurchaseOrder } from '../controllers/purchasecontroller.js';

const router = express.Router();

// @route   POST /api/purchase
// @desc    Create a new purchase order (butcher or agent)
// @access  Private
router.post('/', protect, createPurchaseOrder);

// Add other routes here (getMyPurchaseOrders, updatePurchaseOrder etc.)

export default router;
