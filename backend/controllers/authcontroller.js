import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import sendEmail from '../utils/sendEmail.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const JWT_EXPIRES_IN = '7d';
const JWT_RESET_EXPIRES_IN = '15m';

// Generate a token
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// @route   POST /api/auth/signup
export const signup = async (req, res) => {
  const { name, email, password, phoneNumber, role } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists.' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      message: 'User created successfully',
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup.' });
  }
};

// @route   POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password.' });

    res.status(200).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// @route   GET /api/auth/profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.status(200).json({ user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Failed to fetch user profile.' });
  }
};

// @route   POST /api/auth/request-reset
export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No user found with that email.' });

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit

    user.resetCode = resetCode;
    user.resetCodeExpires = Date.now() + 10 * 60 * 1000; // expires in 10 mins
    await user.save();

    await sendEmail({
      to: email,
      subject: 'NyamaLink Password Reset Code',
      text: `Your password reset code is ${resetCode}. It expires in 10 minutes.`,
    });

    res.status(200).json({ message: 'OTP sent to your email.' });
  } catch (error) {
    console.error('Request reset error:', error);
    res.status(500).json({ message: 'Error sending reset code.' });
  }
};


// @route   POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  console.log('Reset Password Request received for email:', email);
  console.log('Received code:', code);

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log('Error: User not found for email:', email);
      return res.status(400).json({ message: 'Invalid or expired code.' });
    }

    console.log('User found. Stored resetCode:', user.resetCode);
    console.log('Stored resetCodeExpires:', user.resetCodeExpires);
    console.log('Current Date.now():', Date.now());

    if (user.resetCode !== code) {
      console.log('Error: Code mismatch. Received:', code, 'Stored:', user.resetCode);
      return res.status(400).json({ message: 'Invalid or expired code.' });
    }

    if (Date.now() > user.resetCodeExpires) {
      console.log('Error: Code expired. Current time:', Date.now(), 'Expires:', user.resetCodeExpires);
      return res.status(400).json({ message: 'Invalid or expired code.' });
    }

    // If all checks pass
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(400).json({ message: 'Failed to reset password.' });
  }
};
