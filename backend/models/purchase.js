import mongoose from 'mongoose';

const PurchaseSchema = new mongoose.Schema({
  meatId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Inventory' 
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  pricePerKgAtOrder: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  buyerType: {
    type: String,
    enum: ['butcher', 'agent'], 
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'buyerType' 
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'processing', 'ready_for_dispatch', 'dispatched', 'arrived', 'completed', 'cancelled'],
    default: 'pending'
  },
  meatType: { 
    type: String,
    required: true
  },
  slaughterhouseName: { 
    type: String,
    required: true
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

// Auto-update totalPrice and updatedAt
PurchaseSchema.pre('save', function (next) {
  if (this.quantity && this.pricePerKgAtOrder) {
    this.totalPrice = this.quantity * this.pricePerKgAtOrder;
  }
  this.updatedAt = Date.now();
  next();
});

const Purchase = mongoose.model('Purchase', PurchaseSchema);
export default Purchase;
