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
  // Meat item from the butcher's inventory that was ordered
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
  // Quantity ordered by customer
  quantity: { 
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
    enum: ['pending', 'accepted', 'processing', 'ready_for_pickup', 'dispatched', 'arrived', 'completed', 'cancelled'],
    default: 'pending',
  },

  dispatchDetails: {
    trackingNumber: { type: String },
    carrier: { type: String }, // e.g., "In-house delivery", "Third-party Courier"
    dispatchDate: { type: Date },
    estimatedDeliveryDate: { type: Date },
  },
  paymentStatus: {
    status: {
      type: String,
      enum: ['unpaid', 'pending', 'paid', 'refunded', 'failed'],
      default: 'unpaid'
    },
    transactionId: { type: String }, 
    paymentGateway: { type: String },
    paymentDate: { type: Date },
    amountPaid: { type: Number }, 

  deliveryConfirmation: {
    receivedBy: { type: String }, 
    receivedDate: { type: Date },

  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}});


OrderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Order = mongoose.model('Order', OrderSchema);
export default Order;
