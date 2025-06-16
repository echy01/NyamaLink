import mongoose from 'mongoose';

const InventorySchema = new mongoose.Schema({
  meatType: { type: String, required: true },
  quantity: { type: Number, required: true }, // in kg
  pricePerKg: { type: Number, required: true },
  slaughterhouseName: { type: String, required: true },
  isPublic: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Inventory = mongoose.model('Inventory', InventorySchema);
export default Inventory;
