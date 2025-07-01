// backend/routes/adminroutes.js

import express from 'express';
import {
  getAllUsers,
  getAllOrders,
  getUsersByRole,
  authenticateAdmin 
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js'; 

const router = express.Router();

router.use(protect); 

router.use(authenticateAdmin); 

// GET all users (PROTECTED and Admin-only)
router.get('/users', getAllUsers);

// GET all orders (PROTECTED and Admin-only)
router.get('/orders', getAllOrders);

// GET users by role (PROTECTED and Admin-only)
router.get('/users/role/:role', getUsersByRole);

export default router;
