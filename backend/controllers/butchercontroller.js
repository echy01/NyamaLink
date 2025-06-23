import asyncHandler from 'express-async-handler';
import Inventory from '../models/inventory.js'; // Ensure correct path to your Inventory model
import Order from '../models/order.js';
import Purchase from '../models/purchase.js';

// 📦 GET butcher's inventory
export const getInventory = asyncHandler(async (req, res) => {
  // Ensure req.user exists before querying for ownerId
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error('Not authorized, user ID not found');
  }
  const inventoryItems = await Inventory.find({ ownerType: 'butcher', ownerId: req.user._id });
  // Map DB fields to frontend expected names (pricePerKg -> price, quantity -> stock)
  // Also include original _id and ensure meatType is passed.
  const formattedInventory = inventoryItems.map(item => ({
    _id: item._id,
    meatType: item.meatType,
    price: item.pricePerKg, // Map pricePerKg from DB to 'price' for frontend
    stock: item.quantity,    // Map quantity from DB to 'stock' for frontend
    // If you need slaughterhouseName for display purposes for butcher-owned items,
    // you might include item.slaughterhouseName here, but it's not necessary for the fix.
  }));
  res.json({ inventory: formattedInventory }); // Wrap in 'inventory' key as frontend expects
});

// ➕ ADD new inventory item
export const addInventoryItem = asyncHandler(async (req, res) => {
  // Destructure meatType, price, stock instead of name, category
  const { meatType, price, stock } = req.body;

  if (!meatType || !price || !stock) {
    res.status(400);
    throw new Error('All fields (meatType, price, stock) are required');
  }

  // Ensure req.user exists and has an _id for ownerId
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error('Not authorized, user ID not found');
  }

  const newItem = new Inventory({
    meatType,           // Use meatType
    quantity: stock,    // Map 'stock' from frontend to 'quantity' in DB
    pricePerKg: price,  // Map 'price' from frontend to 'pricePerKg' in DB
    slaughterhouseName: 'Butcher Self-Owned', // Provide a default/placeholder value for butcher's own inventory
    isPublic: true,     // Assuming butcher inventory items are generally public for customers
    ownerType: 'butcher', // This field is used in your controller but not in the uploaded model schema.
    ownerId: req.user._id, // This field is used in your controller but not in the uploaded model schema.
  });

  await newItem.save();
  res.status(201).json({ message: 'Item added successfully', item: newItem }); // Return item for confirmation
});

// ✏️ UPDATE inventory item (fields: meatType, price, stock)
export const updateInventoryItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  // Destructure meatType, price, stock from body
  const { meatType, price, stock } = req.body;

  const updates = {};
  if (meatType !== undefined) updates.meatType = meatType;
  if (price !== undefined) updates.pricePerKg = parseFloat(price); // Map to pricePerKg
  if (stock !== undefined) updates.quantity = parseFloat(stock);   // Map to quantity

  // Ensure req.user exists for authorization
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error('Not authorized, user ID not found');
  }

  const updatedItem = await Inventory.findOneAndUpdate(
    { _id: itemId, ownerType: 'butcher', ownerId: req.user._id }, // Filter by owner to ensure only current butcher can update
    { $set: updates },
    { new: true, runValidators: true } // runValidators ensures updates adhere to schema
  );

  if (!updatedItem) {
    res.status(404);
    throw new Error('Inventory item not found or unauthorized');
  }

  res.json({ message: 'Inventory item updated', item: updatedItem }); // Return updated item for confirmation
});

// @desc    Update stock of an inventory item (kept for specific stock update if needed)
// @route   PUT /api/butcher/inventory/:itemId/stock
export const updateInventoryStock = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { stock } = req.body; // Expects 'stock' from frontend

  // Ensure req.user exists for authorization
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error('Not authorized, user ID not found');
  }

  const updatedItem = await Inventory.findOneAndUpdate(
    { _id: itemId, ownerType: 'butcher', ownerId: req.user._id }, // Filter by owner
    { quantity: parseFloat(stock) }, // Update 'quantity' in DB
    { new: true }
  );

  if (!updatedItem) {
    res.status(404);
    throw new Error('Inventory item not found or unauthorized');
  }

  res.json({ message: `Stock updated`, item: updatedItem });
});

// 🧾 GET customer orders placed to this butcher
export const getCustomerOrders = asyncHandler(async (req, res) => {
  // Ensure req.user exists for authorization
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error('Not authorized, user ID not found');
  }
  const orders = await Order.find({ butcherId: req.user._id }).sort({ createdAt: -1 });
  res.json({ orders }); // Wrap in 'orders' key as frontend expects
});

// 🔄 UPDATE customer order status
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  // Ensure req.user exists for authorization
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error('Not authorized, user ID not found');
  }

  const updatedOrder = await Order.findOneAndUpdate(
    { _id: orderId, butcherId: req.user._id }, // Filter by butcherId for security
    { status },
    { new: true }
  );

  if (!updatedOrder) {
    res.status(404);
    throw new Error('Order not found or unauthorized');
  }

  res.json({ message: `Order updated`, order: updatedOrder });
});

// 📦 GET orders this butcher made to slaughterhouses
export const getSlaughterhouseOrders = asyncHandler(async (req, res) => {
  // Ensure req.user exists for authorization
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error('Not authorized, user ID not found');
  }
  console.log('--- getSlaughterhouseOrders called ---');
  console.log('Fetching orders for buyerId (butcher):', req.user._id);
  console.log('Fetching orders for buyerType:', 'butcher');

  const orders = await Purchase.find({
    buyerType: 'butcher',
    buyerId: req.user._id,
  }).sort({ createdAt: -1 });

  console.log('Resulting slaughterhouse orders from DB:', orders);
  res.json({ orders });
});

// 🛒 PLACE order from slaughterhouse
export const orderFromSlaughterhouse = asyncHandler(async (req, res) => {
  const { meatId, quantity } = req.body;

  console.log('--- orderFromSlaughterhouse called ---');
  console.log('Request Body (meatId, quantity):', { meatId, quantity });
  console.log('Authenticated User ID (req.user._id):', req.user?._id);
  console.log('Authenticated User Role (req.user.role):', req.user?.role);


  // Validate meatId and quantity
  if (!meatId || !quantity || quantity <= 0) {
    res.status(400);
    throw new Error('Meat ID and a valid quantity are required.');
  }

  // Ensure req.user exists for authorization
  if (!req.user || !req.user._id) {
    res.status(401);
    throw new Error('Not authorized, user ID not found');
  }

  // Find the meat available from slaughterhouse
  const availableMeat = await Inventory.findById(meatId);
  console.log('Found Available Meat for Order:', availableMeat);

  // IMPORTANT: You might need to update this logic if your Inventory model
  // doesn't have an ownerType/ownerId, or if it's not clear which inventory
  // belongs to a slaughterhouse. This assumes slaughterhouse-owned inventory
  // has ownerType 'agent'.
  if (!availableMeat || (availableMeat.ownerType && availableMeat.ownerType !== 'agent')) {
    res.status(404);
    throw new Error('Meat not found or not available from a slaughterhouse (must be owned by agent).');
  }

  if (availableMeat.quantity < quantity) {
    res.status(400);
    throw new Error('Requested quantity exceeds available stock from slaughterhouse.');
  }

  // Create a new Purchase order
  const newPurchase = new Purchase({
    meatId,
    quantity,
    buyerType: 'butcher', // The buyer is a butcher
    buyerId: req.user._id, // Assign butcher's ID as the buyer
    status: 'pending', // Initial status for butcher's purchase order
    meatType: availableMeat.meatType,
    slaughterhouseName: availableMeat.slaughterhouseName, // Name of the slaughterhouse from whom it's purchased
  });

  console.log('New Purchase Object before saving:', newPurchase);
  await newPurchase.save();
  console.log('New Purchase Object AFTER saving:', newPurchase);

  // Optionally, reduce the slaughterhouse's inventory
  // This part is commented out but would be a critical next step for real inventory management:
  /*
  availableMeat.quantity -= quantity;
  await availableMeat.save();
  console.log('Updated availableMeat after purchase (if uncommented):', availableMeat);
  */

  res.status(201).json({ message: 'Order placed successfully with slaughterhouse', order: newPurchase });
});
