import asyncHandler from 'express-async-handler';
import Inventory from '../models/inventory.js';
import Order from '../models/order.js'; 
import Purchase from '../models/purchase.js'; 
import User from '../models/User.js';

export const getSlaughterhouseInventory = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id || req.user.role !== 'agent') {
    res.status(401);
    throw new Error('Not authorized, agent user ID not found or not an agent');
  }
  const inventory = await Inventory.find({ ownerType: 'agent', ownerId: req.user._id });
  res.json(inventory);
});

export const addSlaughterhouseInventory = asyncHandler(async (req, res) => {
  const { meatType, quantity, pricePerKg, slaughterhouseName, isPublic } = req.body;

  if (!meatType || !quantity || !pricePerKg || !slaughterhouseName) {
    res.status(400);
    throw new Error('Please fill all required fields: meatType, quantity, pricePerKg, slaughterhouseName');
  }

  if (!req.user || !req.user._id || req.user.role !== 'agent') {
    res.status(401);
    throw new Error('Not authorized, user is not an agent or ID not found');
  }

  const newItem = new Inventory({
    meatType,
    quantity: parseFloat(quantity),
    pricePerKg: parseFloat(pricePerKg),
    slaughterhouseName,
    isPublic: isPublic !== undefined ? isPublic : false,
    ownerType: 'agent',
    ownerId: req.user._id,
  });

  await newItem.save();
  res.status(201).json(newItem);
});

export const getButcheryOrders = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id || req.user.role !== 'agent') {
    res.status(401);
    throw new Error('Not authorized, user is not an agent or ID not found');
  }

  const agentInventoryIds = await Inventory.find({ ownerType: 'agent', ownerId: req.user._id })
                                          .select('_id'); 

  const inventoryIdList = agentInventoryIds.map(item => item._id);

  const inboundButcherPurchases = await Purchase.find({
    meatId: { $in: inventoryIdList }, 
    buyerType: 'butcher' 
  })
  .populate({
    path: 'buyerId', 
    model: 'User',   
    select: 'name'  
  })
  .sort({ createdAt: -1 });

  const formattedOrders = inboundButcherPurchases.map(purchase => ({
    _id: purchase._id,
    butcherName: purchase.buyerId ? purchase.buyerId.name : 'Unknown Butcher', 
    meatType: purchase.meatType, 
    quantity: purchase.quantity,
    status: purchase.status,
    pickupDetails: purchase.pickupDetails,
    receptionConfirmation: purchase.receptionConfirmation,
    paymentStatus: purchase.paymentStatus,
    totalPrice: purchase.totalPrice,
    createdAt: purchase.createdAt,
    slaughterhouseName: purchase.slaughterhouseName, 
  }));

  res.json(formattedOrders); 
});

export const getButchers = asyncHandler(async (req, res) => {
  const butchers = await User.find({ role: 'butcher' }).select('-password');
  res.json({ butchers });
});

export const getAvailableMeatForPurchase = asyncHandler(async (req, res) => {
  const availableMeat = await Inventory.find({ isPublic: true, ownerType: 'agent', ownerId: { $ne: req.user._id } });
  res.json(availableMeat);
});

export const placeMeatOrder = asyncHandler(async (req, res) => {
  const { meatId, quantity } = req.body;

  if (!meatId || !quantity || quantity <= 0) {
    res.status(400);
    throw new Error('Meat ID and a valid quantity are required.');
  }
  if (!req.user || !req.user._id || req.user.role !== 'agent') {
    res.status(401);
    throw new Error('Not authorized, user is not an agent or ID not found');
  }

  const meatToPurchase = await Inventory.findOne({ _id: meatId, isPublic: true, ownerType: 'agent', ownerId: { $ne: req.user._id } });

  if (!meatToPurchase) {
    res.status(404);
    throw new Error('Meat not found or not available for purchase (not public or owned by you).');
  }

  if (meatToPurchase.quantity < quantity) {
    res.status(400);
    throw new Error('Requested quantity exceeds available stock.');
  }

  const totalPrice = meatToPurchase.pricePerKg * quantity;

  const newPurchase = new Purchase({
    meatId,
    quantity,
    buyerType: 'agent',
    buyerId: req.user._id,
    status: 'pending',
    meatType: meatToPurchase.meatType,
    slaughterhouseName: meatToPurchase.slaughterhouseName,
    totalPrice,
  });

  await newPurchase.save();

  // Removed inventory deduction from here as per clarification that agents only receive orders.
  // The deduction now occurs in butchercontroller.js when a butcher orders from an agent.

  // Removed direct Socket.IO emission from here related to inventory decrement as the butcher's
  // controller now handles notifying the agent when a butcher places an order from them.

  res.status(201).json({ message: 'Purchase order placed successfully!', order: newPurchase });
});

export const updateButcherOrderStatus = asyncHandler(async (req, res) => {
  const order = await Purchase.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const { status, dispatchDetails, deliveryConfirmation } = req.body;

  order.status = status;
  if (dispatchDetails) order.pickupDetails = dispatchDetails;
  if (deliveryConfirmation) order.receptionConfirmation = deliveryConfirmation;

  const updatedOrder = await order.save();
  res.json(updatedOrder);
});
export const getNearbySlaughterhouses = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 5000 } = req.query;

  if (!lat || !lng) {
    res.status(400);
    throw new Error('Latitude and longitude are required');
  }

  const nearby = await User.find({
    role: 'agent', 
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        $maxDistance: parseFloat(radius),
      },
    },
  }).select('-password');

  res.status(200).json({ nearbyAgents: nearby });
});

export const updateAgentLocation = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body;

  if (!lat || !lng) {
    res.status(400);
    throw new Error('Latitude and longitude are required.');
  }

  const user = await User.findById(req.user._id);
  if (!user || user.role !== 'agent') {
    res.status(403);
    throw new Error('Unauthorized: agent not found');
  }

  user.location = {
    type: 'Point',
    coordinates: [parseFloat(lng), parseFloat(lat)],
  };

  await user.save();
  res.status(200).json({ message: 'Location updated successfully.' });
});
export const getInventoryBySlaughterhouseId = asyncHandler(async (req, res) => {
  const { slaughterhouseId } = req.params;

  const inventory = await Inventory.find({
    ownerId: slaughterhouseId,
    ownerType: 'agent',
    isPublic: true,
  });

  res.status(200).json({ inventory });
});