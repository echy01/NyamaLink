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
    enum: ['pending', 'accepted', 'processing', 'ready_for_dispatch', 'dispatched', 'arrived', 'completed', 'cancelled'], // Expanded statuses
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


PurchaseSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Purchase = mongoose.model('Purchase', PurchaseSchema);
export default Purchase;
