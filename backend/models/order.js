import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({

  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' 
  },

  butcherId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' 
  },
 
  butcheryName: {
    type: String,
    required: true
  },
 
  meatId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Inventory' 
  },

  meatType: { // e.g., 'Beef', 'Goat'
    type: String,
    required: true
  },
  pricePerKgAtOrder: { 
    type: Number,
    required: true
  },

  quantity: { // in kg
    type: Number,
    required: true,
    min: 0.1 
  },
  totalPrice: { 
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'ready', 'delivered', 'cancelled'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

OrderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Order = mongoose.model('Order', OrderSchema);
export default Order;
