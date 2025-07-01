import User from '../models/User.js';
import Order from '../models/Order.js';

// Function to get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    console.error("Error in getAllUsers:", err);
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
};

// Function to get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({});
    res.json(orders);
  } catch (err) {
    console.error("Error in getAllOrders:", err);
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
};

// Function to get users by role
export const getUsersByRole = async (req, res) => {
  try {
    const role = req.params.role;
    const users = await User.find({ role: role });
    res.json(users);
  } catch (err) {
    console.error("Error in getUsersByRole:", err);
    res.status(500).json({ message: `Error fetching ${req.params.role}s`, error: err.message });
  }
};

export const authenticateAdmin = (req, res, next) => {

  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Not an admin.' });
  }
  next(); 
};
