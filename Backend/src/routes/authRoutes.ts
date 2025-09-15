import express from 'express';
import { register, login, forgotPassword, resetPassword, verifyOtp, changePassword, requestDeleteAccount, confirmDeleteAccount, requestChangePasswordOtp, changePasswordWithOtp } from '../controllers/authController';
import auth from '../middleware/authMiddleware';

const router = express.Router();

// Change password via OTP
router.post('/request-change-password-otp', auth, requestChangePasswordOtp);
router.post('/change-password-otp', auth, changePasswordWithOtp);
// Account deletion (password, then OTP)
router.post('/request-delete-account', auth, requestDeleteAccount);
router.post('/confirm-delete-account', auth, confirmDeleteAccount);

router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Authenticated password change
router.post('/change-password', auth, changePassword);

export default router;

