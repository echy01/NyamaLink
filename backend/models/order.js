import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  butcheryName: { type: String, required: true },
  animalType: { type: String, required: true },
  quantity: { type: Number, required: true }, // in kg
  status: {
    type: String,
    enum: ['pending', 'processing', 'ready', 'delivered'],
    default: 'pending',
  },
  assignedTo: { type: String, default: 'slaughterhouse' },
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', OrderSchema);
export default Order;
