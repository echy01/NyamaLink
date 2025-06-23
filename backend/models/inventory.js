import mongoose from 'mongoose';

const InventorySchema = new mongoose.Schema({
  meatType: { type: String, required: true },
  quantity: { type: Number, required: true }, 
  pricePerKg: { type: Number, required: true }, 
  slaughterhouseName: { type: String, required: true },
  isPublic: { type: Boolean, default: false },


  ownerType: {
    type: String,
    enum: ['butcher', 'agent'], 
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'ownerType' 
  },


  createdAt: { type: Date, default: Date.now }
});

const Inventory = mongoose.model('Inventory', InventorySchema);
export default Inventory;
