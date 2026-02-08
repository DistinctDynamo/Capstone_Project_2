const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { protect } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validators');

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerValidation, async (req, res, next) => {
  try {
    const { username, email, password, first_name, last_name, user_type, date_of_birth } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Username';
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    // Validate date of birth
    if (!date_of_birth) {
      return res.status(400).json({
        success: false,
        message: 'Date of birth is required'
      });
    }

    const birthDate = new Date(date_of_birth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    if (age < 5 || age > 100) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid date of birth'
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      first_name,
      last_name,
      date_of_birth: birthDate,
      user_type: user_type || 'player'
    });

    // TODO: Send verification email using Resend (100 emails/day free) or Brevo (300 emails/day free)
    // Recommended: Resend - https://resend.com (simplest API, great developer experience)
    // Alternative: Brevo/Sendinblue - https://www.brevo.com (more emails, but more complex)
    // For frontend-only option: EmailJS - https://www.emailjs.com (200/month free, no backend needed)

    // Generate token
    const token = generateToken(user._id);

    // Set cookie
    res.cookie('token', token, cookieOptions);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          user_type: user.user_type,
          date_of_birth: user.date_of_birth
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.isValidPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Set cookie
    res.cookie('token', token, cookieOptions);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          user_type: user.user_type,
          avatar: user.avatar,
          team: user.team
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('team', 'team_name logo');

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/auth/check-email
// @desc    Check if email is available
// @access  Public
router.get('/check-email', async (req, res, next) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });

    res.json({
      success: true,
      data: { available: !exists }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/auth/check-username
// @desc    Check if username is available
// @access  Public
router.get('/check-username', async (req, res, next) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      });
    }

    const exists = await User.findOne({ username });

    res.json({
      success: true,
      data: { available: !exists }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change password
// @access  Private
router.put('/change-password', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.isValidPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// EMAIL VERIFICATION ROUTES (PLACEHOLDER)
// ============================================================================
// TODO: Implement email sending using one of these free services:
//
// RECOMMENDED: Resend (https://resend.com)
// - 100 emails/day free tier
// - Simple, modern API
// - Great developer experience
// - npm install resend
//
// ALTERNATIVE: Brevo/Sendinblue (https://www.brevo.com)
// - 300 emails/day free tier
// - More complex setup but higher limits
// - npm install @sendinblue/client
//
// FRONTEND-ONLY: EmailJS (https://www.emailjs.com)
// - 200 emails/month free
// - No backend code needed
// - Good for simple use cases
// ============================================================================

const crypto = require('crypto');

// @route   POST /api/auth/send-verification
// @desc    Send email verification link
// @access  Private
router.post('/send-verification', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

    // Save token to user
    user.email_verification_token = hashedToken;
    user.email_verification_expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    // TODO: Send email with verification link
    // const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    // await sendEmail({
    //   to: user.email,
    //   subject: 'Verify your SoccerConnect email',
    //   html: `Click here to verify: <a href="${verificationUrl}">${verificationUrl}</a>`
    // });

    res.json({
      success: true,
      message: 'Verification email sent (placeholder - email sending not yet implemented)',
      // In production, remove this - only for development testing
      debug: {
        note: 'Email sending not implemented. Use token below for testing.',
        token: verificationToken
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/auth/verify-email/:token
// @desc    Verify email with token
// @access  Public
router.get('/verify-email/:token', async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      email_verification_token: hashedToken,
      email_verification_expires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    user.email_verified = true;
    user.email_verification_token = null;
    user.email_verification_expires = null;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Request password reset email
// @access  Public
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link will be sent'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.password_reset_token = hashedToken;
    user.password_reset_expires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // TODO: Send password reset email
    // const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    // await sendEmail({
    //   to: user.email,
    //   subject: 'Reset your SoccerConnect password',
    //   html: `Click here to reset: <a href="${resetUrl}">${resetUrl}</a>`
    // });

    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link will be sent',
      // In production, remove this - only for development testing
      debug: {
        note: 'Email sending not implemented. Use token below for testing.',
        token: resetToken
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password with token
// @access  Public
router.post('/reset-password/:token', async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      password_reset_token: hashedToken,
      password_reset_expires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    user.password = password;
    user.password_reset_token = null;
    user.password_reset_expires = null;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
