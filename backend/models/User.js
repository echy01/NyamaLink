import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: { 
    type: String, 
    unique: true, 
    required: true 
  }, 
  role: {
    type: String,
    enum: ['customer', 'butcher', 'agent', 'admin'],
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0],
    },
  },
        resetCode: String,
      resetCodeExpires: Date,
});

userSchema.index({ location: '2dsphere' });

const User = mongoose.model('User', userSchema);
export default User;