import asyncHandler from 'express-async-handler';
import Purchase from '../models/purchase.js';
import Inventory from '../models/inventory.js';
import User from '../models/User.js'; 

// POST /api/purchase
export const createPurchaseOrder = asyncHandler(async (req, res) => {
  const { meatId, quantity } = req.body;
  const buyerId = req.user._id;
  const buyerType = req.user.role; // e.g., 'butcher' or 'agent'

  // Validate meat selection
  const inventoryItem = await Inventory.findById(meatId);
  if (!inventoryItem) {
    res.status(404);
    throw new Error('Inventory item not found');
  }

  const pricePerKgAtOrder = inventoryItem.pricePerKg;
  const totalPrice = pricePerKgAtOrder * quantity;

  // Get slaughterhouse name (assumes inventory.ownerId is a user ID)
  const slaughterhouse = await User.findById(inventoryItem.ownerId);
  const slaughterhouseName = slaughterhouse ? slaughterhouse.name : 'Unknown';

  const newPurchase = new Purchase({
    meatId,
    quantity,
    buyerId,
    buyerType,
    meatType: inventoryItem.meatType,
    slaughterhouseName,
    pricePerKgAtOrder,
    totalPrice,
  });

  const saved = await newPurchase.save();
  res.status(201).json({
    message: 'Purchase order created successfully',
    purchaseOrder: saved,
  });
});
