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
    enum: ['butcher', 'agent', 'customer'], 
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'buyerType' 
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'], 
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Purchase = mongoose.model('Purchase', PurchaseSchema);
export default Purchase;
