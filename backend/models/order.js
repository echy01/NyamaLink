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
  meatType: {
    type: String,
    required: true
  },
  pricePerKgAtOrder: {
    type: Number,
    required: true
  },
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
  deliveryLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: false
    }
  },
  dispatchDetails: {
    trackingNumber: { type: String },
    carrier: { type: String },
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
  },
  deliveryConfirmation: {
    receivedBy: { type: String },
    receivedDate: { type: Date },
  }
}, { timestamps: true }); 

const Order = mongoose.model('Order', OrderSchema);
export default Order;
