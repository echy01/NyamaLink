import asyncHandler from 'express-async-handler';
import Inventory from '../models/inventory.js';
import Order from '../models/order.js';
import Purchase from '../models/purchase.js';
import User from '../models/User.js';

export const getInventory = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id || req.user.role !== 'butcher') {
    res.status(401);
    throw new Error('Not authorized, butcher user ID not found or not a butcher');
  }
  const inventory = await Inventory.find({ ownerType: 'butcher', ownerId: req.user._id });

  const formattedInventory = inventory.map(item => ({
    _id: item._id,
    meatType: item.meatType,
    price: item.pricePerKg,
    stock: item.quantity,
    slaughterhouseName: item.slaughterhouseName,
  }));
  res.json({ inventory: formattedInventory });
});

export const addInventoryItem = asyncHandler(async (req, res) => {
  const { meatType, price, stock } = req.body;

  if (!meatType || !price || !stock) {
    res.status(400);
    throw new Error('All fields (meatType, price, stock) are required');
  }

  if (!req.user || !req.user._id || req.user.role !== 'butcher') {
    res.status(401);
    throw new Error('Not authorized, user is not a butcher or ID not found');
  }

  const newItem = new Inventory({
    meatType,
    quantity: parseFloat(stock),
    pricePerKg: parseFloat(price),
    slaughterhouseName: req.user.name,
    isPublic: true,
    ownerType: 'butcher',
    ownerId: req.user._id,
  });

  await newItem.save();
  res.status(201).json(newItem);
});

export const updateInventoryItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { meatType, price, stock } = req.body;

  const updates = {};
  if (meatType !== undefined) updates.meatType = meatType;
  if (price !== undefined) updates.pricePerKg = parseFloat(price);
  if (stock !== undefined) updates.quantity = parseFloat(stock);

  if (Object.keys(updates).length === 0) {
    res.status(400);
    throw new Error('No fields provided for update');
  }

  if (!req.user || !req.user._id || req.user.role !== 'butcher') {
    res.status(401);
    throw new Error('Not authorized, user is not a butcher or ID not found');
  }

  const updatedItem = await Inventory.findOneAndUpdate(
    { _id: itemId, ownerType: 'butcher', ownerId: req.user._id },
    { $set: updates, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );

  if (!updatedItem) {
    res.status(404);
    throw new Error('Inventory item not found or unauthorized');
  }

  res.json(updatedItem);
});

export const updateInventoryStock = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { stock } = req.body;

  if (stock === undefined || isNaN(parseFloat(stock))) {
    res.status(400);
    throw new Error('Stock quantity is required and must be a number');
  }

  if (!req.user || !req.user._id || req.user.role !== 'butcher') {
    res.status(401);
    throw new Error('Not authorized, user is not a butcher or ID not found');
  }

  const updatedItem = await Inventory.findOneAndUpdate(
    { _id: itemId, ownerType: 'butcher', ownerId: req.user._id },
    { $set: { quantity: parseFloat(stock), updatedAt: Date.now() } },
    { new: true }
  );

  if (!updatedItem) {
    res.status(404);
    throw new Error('Inventory item not found or unauthorized');
  }

  res.json(updatedItem);
});

export const getCustomerOrdersForButcher = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id || req.user.role !== 'butcher') {
    res.status(401);
    throw new Error('Not authorized, butcher user ID not found or not a butcher');
  }

  const orders = await Order.find({ butcherId: req.user._id })
    .populate({
      path: 'customerId',
      model: 'User',
      select: 'name email phoneNumber'
    })
    .populate({
      path: 'meatId',
      model: 'Inventory',
      select: 'meatType pricePerKg'
    })
    .sort({ createdAt: -1 });

  const formattedOrders = orders.map(order => ({
    _id: order._id,
    customerId: order.customerId?._id,
    customerName: order.customerId?.name || 'Unknown Customer',
    customerEmail: order.customerId?.email || 'N/A',
    customerphoneNumber: order.customerId?.phoneNumber || 'N/A',
    butcherId: order.butcherId,
    butcheryName: order.butcheryName,
    meatId: order.meatId?._id,
    meatType: order.meatType,
    pricePerKgAtOrder: order.pricePerKgAtOrder,
    quantity: order.quantity,
    totalPrice: order.totalPrice,
    status: order.status,
    dispatchDetails: order.dispatchDetails,
    paymentStatus: order.paymentStatus,
    deliveryConfirmation: order.deliveryConfirmation,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    deliveryLocation: order.deliveryLocation,
  }));

  res.json({ orders: formattedOrders });
});

export const updateCustomerOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status, dispatchDetails, deliveryConfirmation } = req.body;

  if (!status) {
    res.status(400);
    throw new Error('Order status is required');
  }

  const allowedStatuses = ['pending', 'accepted', 'processing', 'ready_for_pickup', 'dispatched', 'arrived', 'completed', 'cancelled'];
  if (!allowedStatuses.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status. Allowed values are: ${allowedStatuses.join(', ')}`);
  }

  if (!req.user || !req.user._id || req.user.role !== 'butcher') {
    res.status(401);
    throw new Error('Not authorized, user is not a butcher or ID not found');
  }

  const order = await Order.findById(orderId).populate('customerId', 'name phoneNumber');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.butcherId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this order');
  }

  const updateFields = { status, updatedAt: Date.now() };

  if (dispatchDetails) {
    updateFields.dispatchDetails = { ...dispatchDetails, dispatchDate: new Date() };
  }
  if (deliveryConfirmation) {
    updateFields.deliveryConfirmation = { ...deliveryConfirmation, receivedDate: new Date() };
  }

  const updatedOrder = await Order.findOneAndUpdate(
    { _id: orderId, butcherId: req.user._id },
    { $set: updateFields },
    { new: true, runValidators: true }
  ).populate('customerId', 'name phoneNumber');

  if (!updatedOrder) {
    res.status(404);
    throw new Error('Order not found or unauthorized');
  }

  if (status === 'arrived' && updatedOrder.customerId && updatedOrder.customerId.phoneNumber) {
    const sms = req.app.get('africasTalkingSms');
    const message = `Hi ${updatedOrder.customerId.name || 'Customer'}, your order ${updatedOrder._id} from NyamaLink has arrived! You ordered ${updatedOrder.quantity}kg of ${updatedOrder.meatType} from ${updatedOrder.butcheryName}.Thank you for choosing NyamaLink!`;

    try {
      await sms.send({
        to: [updatedOrder.customerId.phoneNumber],
        message,
      });
    } catch (err) {
      console.error('Failed to send SMS:', err);
    }
  } else {
    console.warn(`Customer phoneNumber number not found for order ${updatedOrder._id}, SMS not sent.`);
  }

  const io = req.app.get('io');
  io.emit('new_notification', {
    title: 'Order Status Update',
    message: `Order for ${updatedOrder.meatType} is now '${updatedOrder.status}'`,
    timestamp: new Date(),
    type: 'order_status_update',
    read: false,
  });

  res.json(updatedOrder);
});

export const getSlaughterhouseOrders = asyncHandler(async (req, res) => {
  if (!req.user || !req.user._id || req.user.role !== 'butcher') {
    res.status(401);
    throw new Error('Not authorized, butcher user ID not found or not a butcher');
  }

  const orders = await Purchase.find({
    buyerType: 'butcher',
    buyerId: req.user._id,
  })
    .populate({
      path: 'meatId',
      model: 'Inventory',
      select: 'meatType slaughterhouseName'
    })
    .sort({ createdAt: -1 });

  const formattedOrders = orders.map(order => ({
    _id: order._id,
    meatId: order.meatId?._id,
    meatType: order.meatId?.meatType || order.meatType,
    quantity: order.quantity,
    pricePerKgAtOrder: order.pricePerKgAtOrder,
    totalPrice: order.totalPrice,
    buyerType: order.buyerType,
    buyerId: order.buyerId,
    status: order.status,
    slaughterhouseName: order.meatId?.slaughterhouseName || order.slaughterhouseName || 'N/A',
    dispatchDetails: order.dispatchDetails,
    paymentStatus: order.paymentStatus,
    deliveryConfirmation: order.deliveryConfirmation,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  }));

  res.json({ orders: formattedOrders });
});


export const orderFromSlaughterhouse = asyncHandler(async (req, res) => {
  const { meatId, quantity } = req.body;

  if (!meatId || !quantity || quantity <= 0) {
    res.status(400);
    throw new Error('Meat ID and a valid quantity are required.');
  }

  if (!req.user || !req.user._id || req.user.role !== 'butcher') {
    res.status(401);
    throw new Error('Not authorized, user is not a butcher or ID not found');
  }

  const meatToPurchase = await Inventory.findOne({
    _id: meatId,
    isPublic: true,
    ownerType: 'agent'
  });

  if (!meatToPurchase) {
    res.status(404);
    throw new Error('Meat not found or not available for purchase (not public or not from an agent).');
  }

  if (meatToPurchase.quantity < quantity) {
    res.status(400);
    throw new Error(`Requested quantity (${quantity}kg) exceeds available stock (${meatToPurchase.quantity}kg).`);
  }

  const totalPrice = meatToPurchase.pricePerKg * quantity;

  const newPurchase = new Purchase({
    meatId,
    quantity,
    buyerType: 'butcher',
    buyerId: req.user._id,
    status: 'pending',
    meatType: meatToPurchase.meatType,
    slaughterhouseName: meatToPurchase.slaughterhouseName,
    pricePerKgAtOrder: meatToPurchase.pricePerKg,
    totalPrice: totalPrice,
  });

  await newPurchase.save();

  meatToPurchase.quantity -= quantity;
  await meatToPurchase.save();

  const io = req.app.get('io');
  io.emit('new_notification', {
    title: 'New Butcher Order Received',
    message: `${req.user.name || 'A butcher'} placed an order for ${quantity}kg of ${meatToPurchase.meatType} from your inventory.`,
    timestamp: new Date(),
    type: 'purchase_status_update',
    read: false,
    recipientId: meatToPurchase.ownerId
  });

  res.status(201).json({ message: 'Purchase order to slaughterhouse placed successfully!', order: newPurchase });
});

export const updateSlaughterhouseOrderStatus = asyncHandler(async (req, res) => {
  const { purchaseId } = req.params;
  const { status, dispatchDetails, deliveryConfirmation } = req.body;
  if (!status) {
    res.status(400);
    throw new Error('Purchase order status is required');
  }

  const allowedStatuses = ['pending', 'accepted', 'processing', 'ready_for_dispatch', 'dispatched', 'arrived', 'completed', 'cancelled'];
  if (!allowedStatuses.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status. Allowed values are: ${allowedStatuses.join(', ')}`);
  }

  if (!req.user || !req.user._id || req.user.role !== 'butcher') {
    res.status(401);
    throw new Error('Not authorized, user is not a butcher or ID not found');
  }

  const updateFields = { status, updatedAt: Date.now() };

  if (dispatchDetails) {
    updateFields.dispatchDetails = { ...dispatchDetails, dispatchDate: new Date() };
  }
  if (deliveryConfirmation) {
    updateFields.deliveryConfirmation = { ...deliveryConfirmation, receivedDate: new Date() };
  }

  const updatedPurchase = await Purchase.findOneAndUpdate(
    { _id: purchaseId, buyerType: 'butcher', buyerId: req.user._id },
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  if (!updatedPurchase) {
    res.status(404);
    throw new Error('Purchase order not found or unauthorized');
  }

  const io = req.app.get('io');
  io.emit('new_notification', {
    title: 'Slaughterhouse Dispatch',
    message: `Purchase order for ${updatedPurchase.meatType} is now '${updatedPurchase.status}'`,
    timestamp: new Date(),
    type: 'purchase_status_update',
    read: false,
  });

  res.json(updatedPurchase);
});

export const updateButcherProfile = asyncHandler(async (req, res) => {
  const { name, latitude, longitude } = req.body;

  const user = await User.findById(req.user._id);
  if (!user || user.role !== 'butcher') {
    res.status(404);
    throw new Error('Butcher not found');
  }

  if (name) user.name = name;
  if (latitude && longitude) {
    user.location = {
      type: 'Point',
      coordinates: [Number(longitude), Number(latitude)],
    };
  }

  await user.save();
  res.status(200).json({ message: 'Butcher profile updated successfully.' });
});

export const getNearbyButchers = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 5000 } = req.query;

  if (!lat || !lng) {
    res.status(400);
    throw new Error('Latitude and longitude are required');
  }

  const nearbyButchers = await User.find({
    role: 'butcher',
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        $maxDistance: parseInt(radius),
      },
    },
  }).select('-password');

  res.status(200).json({ nearbyButchers });
});

export const placeCustomerOrder = asyncHandler(async (req, res) => {
  const { meatId, quantity, deliveryLocation } = req.body;

  if (!meatId || !quantity || quantity <= 0) {
    res.status(400);
    throw new Error('Meat ID and a valid quantity are required.');
  }

  if (!req.user || !req.user._id || req.user.role !== 'customer') {
    res.status(401);
    throw new Error('Not authorized, user is not a customer or ID not found');
  }

  const meat = await Inventory.findById(meatId);
  if (!meat) {
    res.status(404);
    throw new Error('Meat item not found');
  }

  if (meat.quantity < quantity) {
    res.status(400);
    throw new Error(`Requested quantity (${quantity}kg) exceeds available stock (${meat.quantity}kg).`);
  }

  const totalPrice = meat.pricePerKg * quantity;

  const newOrder = new Order({
    meatId,
    quantity,
    totalPrice,
    pricePerKgAtOrder: meat.pricePerKg,
    meatType: meat.meatType,
    butcherId: meat.ownerId,
    butcheryName: meat.slaughterhouseName,
    customerId: req.user._id,
    status: 'pending',
    deliveryLocation: deliveryLocation ? {
      type: 'Point',
      coordinates: deliveryLocation.coordinates,
    } : undefined,
  });

  await newOrder.save();

  meat.quantity -= quantity;
  await meat.save();

  const io = req.app.get('io');
  io.emit('new_notification', {
    title: 'New Customer Order',
    message: `${req.user.name || 'A customer'} placed an order for ${quantity}kg of ${meat.meatType} from your inventory.`,
    timestamp: new Date(),
    type: 'order_status_update',
    read: false,
    recipientId: meat.ownerId
  });

  res.status(201).json({ message: 'Order placed successfully', order: newOrder });
});
