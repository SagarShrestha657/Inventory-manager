// Request OTP for password change
export const requestChangePasswordOtp = async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const user = await User.findById(userId).select('+email +username');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    // Generate OTP
    const otp = crypto.randomBytes(3).toString('hex').toUpperCase();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();
    await sendForgotPasswordOtp(user.email, otp); // Reuse email template
    res.status(200).json({ message: 'OTP sent to your email.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Change password via OTP
export const changePasswordWithOtp = async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    const { otp, newPassword } = req.body;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!otp || !newPassword) return res.status(400).json({ message: 'OTP and new password required.' });
    const user = await User.findById(userId).select('+otp +otpExpires');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.otp !== otp || user.otpExpires! < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    await sendPasswordResetConfirmation(user.email); // Notify user
    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
// Step 1: Request account deletion (verify password, send OTP)
export const requestDeleteAccount = async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    const { password } = req.body;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!password) return res.status(400).json({ message: 'Password required.' });
    const user = await User.findById(userId).select('+password +email +username');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) return res.status(400).json({ message: 'Password is incorrect.' });
    // Generate OTP
    const otp = crypto.randomBytes(3).toString('hex').toUpperCase();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();
    await sendForgotPasswordOtp(user.email, otp); // Reuse email template
    res.status(200).json({ message: 'OTP sent to your email.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Step 2: Confirm account deletion (verify OTP, delete user)
export const confirmDeleteAccount = async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    const { otp } = req.body;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!otp) return res.status(400).json({ message: 'OTP required.' });
    const user = await User.findById(userId).select('+otp +otpExpires +email +username');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.otp !== otp || user.otpExpires! < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }
    const email = user.email;
    const username = user.username;
    await User.deleteOne({ _id: userId });
    await sendPasswordResetConfirmation(email); // Notify user of account deletion (reuse template)
    res.status(200).json({ message: 'Account deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
// Change Password (Authenticated)
export const changePassword = async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password required.' });
    }
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password || '');
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    await sendPasswordResetConfirmation(user.email); // Notify user
    res.status(200).json({ message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import crypto from 'crypto';
import { sendRegistrationOtp, sendForgotPasswordOtp, sendPasswordResetConfirmation, sendSuccessfulRegistration } from '../lib/email/emailService'; // Import new email services

// Register User
export const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({ username, email, password, isVerified: false }); // Set isVerified to false

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Generate OTP for email verification
    const otp = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 character alphanumeric OTP
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 3600000); // OTP expires in 1 hour
    await user.save();

    // Send OTP via email
    await sendRegistrationOtp(user.email, otp);

    res.status(201).json({ message: 'User registered successfully. Please check your email for OTP.' });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Verify OTP
export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email }).select('+otp +otpExpires +isVerified');
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or OTP' });
    }

    if (user.otp !== otp || user.otpExpires! < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.otp = undefined;
    user.otpExpires = undefined;
    user.isVerified = true; // Mark user as verified
    await user.save();

    // Send successful registration email
    await sendSuccessfulRegistration(user.email, user.username);

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.status(200).json({ message: 'OTP verified successfully.', token, userId: user.id, username: user.username, email: user.email });
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Login User
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;


  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please register if you don\'t have an account.' });
    }

    const isMatch = await bcrypt.compare(password, user.password!); // Use non-null assertion
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is verified
    if (!user.isVerified) {
      // Generate new OTP for re-verification
      const otp = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 character alphanumeric OTP
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 3600000); // OTP expires in 1 hour
      await user.save();

      // Send OTP via email
      await sendRegistrationOtp(user.email, otp);

      return res.status(401).json({ message: 'Account not verified. Please verify your OTP.' });
    }

    const payload = { user: { id: user.id } };

    jwt.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({ token, userId: user.id, username: user.username, email: user.email }); // Return userId along with the token
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Forgot Password - Request OTP
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otp = crypto.randomBytes(3).toString('hex').toUpperCase();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 3600000); // OTP expires in 1 hour
    await user.save();

    // Send OTP via email
    await sendForgotPasswordOtp(user.email, otp);

    res.status(200).json({ message: 'OTP sent to your email for password reset.' });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Reset Password
export const resetPassword = async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email }).select('+otp +otpExpires');
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or OTP' });
    }

    if (user.otp !== otp || user.otpExpires! < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Send password reset confirmation email
    await sendPasswordResetConfirmation(user.email);

    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
