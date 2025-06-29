import axios from 'axios';
import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import Order from '../models/order.js';
import PurchaseOrder from '../models/purchase.js'; 

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

const getPaystackHeaders = () => ({
  Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
  'Content-Type': 'application/json',
});

// 📤 POST /api/payments/initiate
export const initiatePayment = asyncHandler(async (req, res) => {
  console.log("📡 Payment Initiation Hit");

  const { orderId } = req.body;
  const email = req.user?.email || req.body.email;

  if (!email) {
    res.status(400);
    throw new Error('User email not found');
  }

  let orderOrPurchase = await Order.findById(orderId);
  if (!orderOrPurchase) {
    orderOrPurchase = await PurchaseOrder.findById(orderId);
  }

  if (!orderOrPurchase) {
    res.status(404);
    throw new Error('Order or Purchase not found');
  }

  if (orderOrPurchase.paymentStatus?.status === 'paid') {
    res.status(400);
    throw new Error('Already paid');
  }

  if (!orderOrPurchase.totalPrice || isNaN(orderOrPurchase.totalPrice)) {
    res.status(400);
    console.log("🧾 Debug totalPrice:", orderOrPurchase.totalPrice);
    throw new Error('Invalid or missing total price for payment');
  }

  const amountInKobo = Math.round(orderOrPurchase.totalPrice * 100);

  console.log("🔥 Sending to Paystack:", {
    email,
    amount: amountInKobo,
    metadata: { orderId: orderOrPurchase._id.toString() }
  });

  const response = await axios.post(
    'https://api.paystack.co/transaction/initialize',
    {
      email,
      amount: amountInKobo,
      metadata: {
        orderId: orderOrPurchase._id.toString(),
      },
      redirect_url: 'https://2f69-41-90-69-155.ngrok-free.app/payment-success',
    },
    {
      headers: getPaystackHeaders(),
    }
  );

  res.status(200).json({
    message: 'Payment initiation successful',
    paymentUrl: response.data.data.authorization_url,
  });
});


// 📥 POST /api/payments/webhook
export const handlePaystackWebhook = asyncHandler(async (req, res) => {
  const secret = PAYSTACK_SECRET_KEY;

  const hash = crypto
    .createHmac('sha512', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  const signature = req.headers['x-paystack-signature'];
  if (hash !== signature) {
    console.warn('⚠️ Invalid webhook signature attempt');
    return res.status(401).send('Invalid signature');
  }

  const event = req.body;

  if (event.event === 'charge.success') {
    const data = event.data;
    const { reference, amount, metadata, transaction_date } = data;
    const orderId = metadata?.orderId;

    if (!orderId) return res.status(400).send('Missing orderId in metadata');

    try {
      let order = await Order.findById(orderId);
      if (!order) {
        order = await PurchaseOrder.findById(orderId);
        if (!order) return res.status(404).send('Order not found');
      }

      const parsedDate = new Date(transaction_date);
      const paymentDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

      order.paymentStatus = {
        status: 'paid',
        transactionId: reference,
        paymentGateway: 'Paystack',
        paymentDate,
        amountPaid: amount / 100,
      };

      await order.save();
      console.log(`✅ Order ${orderId} marked as paid via webhook`);
      res.status(200).send('Webhook received and processed');
    } catch (err) {
      console.error('❌ Error saving webhook payment:', err);
      res.status(500).send('Server error');
    }
  } else {
    res.status(200).send('Unhandled event');
  }
});
