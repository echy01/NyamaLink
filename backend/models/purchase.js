import mongoose from 'mongoose';

const PurchaseSchema = new mongoose.Schema({
  meatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
  quantity: { type: Number, required: true },
  buyerType: { type: String, enum: ['butcher', 'slaughterhouse'], required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'declined', 'delivered'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now }
});

const Purchase = mongoose.model('Purchase', PurchaseSchema);
export default Purchase;
