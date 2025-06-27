import asyncHandler from 'express-async-handler';
import Inventory from '../models/inventory.js';
import Order from '../models/order.js';
import User from '../models/User.js';

// 🥩 Get available meat from public butcher inventory
const getAvailableMeat = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id || req.user.role !== 'customer') {
    res.status(401);
    throw new Error('Not authorized, customer user ID not found or not a customer');
  }

  const availableMeat = await Inventory.find({
    ownerType: 'butcher',
    quantity: { $gt: 0 },
    isPublic: true,
  }).populate({
    path: 'ownerId',
    model: 'User',
    select: 'name'
  }).sort({ createdAt: -1 });

  const formattedMeat = availableMeat.map(item => ({
    _id: item._id,
    name: `${item.meatType} - ${item.slaughterhouseName}`,
    meatType: item.meatType,
    quantity: item.quantity,
    pricePerKg: item.pricePerKg,
    butcheryName: item.ownerId ? item.ownerId.name : 'Unknown Butchery',
    slaughterhouseName: item.slaughterhouseName,
    createdAt: item.createdAt,
  }));

  res.json({ availableMeat: formattedMeat });
});

// 🛒 Place a customer order
const placeOrder = asyncHandler(async (req, res) => {
  const { meatId, quantity } = req.body;

  if (!meatId || !quantity || quantity <= 0) {
    res.status(400);
    throw new Error('Meat ID and a valid quantity are required.');
  }

  if (!req.user || !req.user._id || req.user.role !== 'customer') {
    res.status(401);
    throw new Error('Not authorized, user is not a customer or ID not found');
  }

  const meatToOrder = await Inventory.findOne({
    _id: meatId,
    ownerType: 'butcher',
    isPublic: true,
  });

  if (!meatToOrder) {
    res.status(404);
    throw new Error('Meat item not found or not available from a butcher.');
  }

  if (meatToOrder.quantity < quantity) {
    res.status(400);
    throw new Error(`Requested quantity (${quantity}kg) exceeds available stock (${meatToOrder.quantity}kg).`);
  }

  const totalPrice = meatToOrder.pricePerKg * quantity;

  const newOrder = new Order({
    customerId: req.user._id,
    butcherId: meatToOrder.ownerId,
    butcheryName: meatToOrder.slaughterhouseName,
    meatId: meatToOrder._id,
    meatType: meatToOrder.meatType,
    pricePerKgAtOrder: meatToOrder.pricePerKg,
    quantity: parseFloat(quantity),
    totalPrice,
    status: 'pending',
    paymentStatus: { status: 'unpaid' },
  });

  await newOrder.save();

  meatToOrder.quantity -= quantity;
  await meatToOrder.save();

  res.status(201).json({
    message: 'Order placed successfully!',
    order: newOrder,
    remainingStock: meatToOrder.quantity
  });
});

// 📜 Get customer's own orders
const getMyOrders = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id || req.user.role !== 'customer') {
    res.status(401);
    throw new Error('Not authorized, customer user ID not found or not a customer');
  }

  const orders = await Order.find({ customerId: req.user._id })
    .populate({
      path: 'butcherId',
      model: 'User',
      select: 'name email'
    })
    .populate({
      path: 'meatId',
      model: 'Inventory',
      select: 'meatType'
    })
    .sort({ createdAt: -1 });

  const formattedOrders = orders.map(order => ({
    _id: order._id,
    butcheryName: order.butcheryName,
    butcherContact: order.butcherId?.email || 'N/A',
    meatType: order.meatType,
    quantity: order.quantity,
    totalPrice: order.totalPrice,
    status: order.status,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
  }));

  res.json({ orders: formattedOrders }); // ✅ Corrected to return with named key
});
const getInventoryByButcherId = asyncHandler(async (req, res) => {
  const butcherId = req.params.butcherId;

  const inventory = await Inventory.find({
    ownerId: butcherId,
    ownerType: 'butcher',
    isPublic: true,
    quantity: { $gt: 0 },
  }).sort({ createdAt: -1 });

  res.status(200).json({ inventory });
});

export {
  getAvailableMeat,
  placeOrder,
  getMyOrders,
  getInventoryByButcherId,
};
