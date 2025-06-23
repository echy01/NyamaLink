import asyncHandler from 'express-async-handler';
import Inventory from '../models/inventory.js';
import Order from '../models/order.js';
import Purchase from '../models/purchase.js';
import User from '../models/User.js';

export const getInventory = asyncHandler(async (req, res) => {
  const inventory = await Inventory.find({ ownerType: 'slaughterhouse', ownerId: req.user._id });
  res.json(inventory);
});

export const addInventoryItem = asyncHandler(async (req, res) => {
  const { meatType, quantity, pricePerKg, isPublic = false } = req.body;
  const item = new Inventory({
    meatType,
    quantity,
    pricePerKg,
    isPublic,
    slaughterhouseName: req.user.name,
    ownerType: 'slaughterhouse',
    ownerId: req.user._id,
  });
  await item.save();
  res.status(201).json(item);
});

export const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ destination: 'slaughterhouse', slaughterhouseId: req.user._id });
  res.json(orders);
});

export const getAvailableMeat = asyncHandler(async (req, res) => {
  const meat = await Inventory.find({
    isPublic: true,
    ownerType: 'slaughterhouse',
    ownerId: { $ne: req.user._id },
  });
  res.json(meat);
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Purchase.find({ buyerType: 'slaughterhouse', buyerId: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

export const placeOrder = asyncHandler(async (req, res) => {
  const { meatId, quantity } = req.body;
  const order = new Purchase({
    meatId,
    quantity,
    buyerType: 'slaughterhouse',
    buyerId: req.user._id,
  });
  await order.save();
  res.status(201).json(order);
});

export const getButchers = asyncHandler(async (req, res) => {
  const butchers = await User.find({ role: 'butcher' }).select('name contact');
  res.json(butchers);
});
