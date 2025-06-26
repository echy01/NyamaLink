import express from 'express';
import { initiatePayment, handlePaystackWebhook } from '../controllers/paymentcontroller.js';
import { protect } from '../middleware/authMiddleware.js'; 

const router = express.Router();
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
console.log('💥 Payment routes loaded');
router.post('/initialize', protect, initiatePayment);
router.post('/webhook', express.json({ type: 'application/json' }), handlePaystackWebhook);

export default router;
