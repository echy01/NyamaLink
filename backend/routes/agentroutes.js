import express from 'express';
import Inventory from '../models/inventory.js';
import Order from '../models/order.js';
import Purchase from '../models/purchase.js';
import User from '../models/User.js';

const router = express.Router();

// 🥩 Get inventory
router.get('/inventory', async (req, res) => {
  const inventory = await Inventory.find();
  res.json(inventory);
});

// ➕ Add inventory
router.post('/inventory', async (req, res) => {
  const item = new Inventory(req.body);
  await item.save();
  res.json(item);
});

// 🧾 Get customer orders
router.get('/orders', async (req, res) => {
  const orders = await Order.find({ destination: 'slaughterhouse' });
  res.json(orders);
});

// 🐄 Get available meat from other slaughterhouses
router.get('/purchase/available', async (req, res) => {
  const available = await Inventory.find({ isPublic: true });
  res.json(available);
});

// 📦 View slaughterhouse's own orders from others
router.get('/purchase/myorders', async (req, res) => {
  const orders = await Purchase.find({ buyerType: 'slaughterhouse' });
  res.json(orders);
});

// 🛒 Order meat from another slaughterhouse
router.post('/purchase/order', async (req, res) => {
  const { meatId, quantity } = req.body;
  const order = new Purchase({ meatId, quantity, buyerType: 'slaughterhouse' });
  await order.save();
  res.json(order);
});

// 👥 Get all registered butchers
router.get('/butchers', async (req, res) => {
  try {
    const butchers = await User.find({ role: 'butcher' }).select('name contact');
    res.json(butchers);
  } catch (error) {
    console.error('Failed to fetch butchers:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/test', (req, res) => {
  res.send('Slaughterhouse is up 🚀');
});


export default router;
