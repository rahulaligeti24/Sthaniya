const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const mongoose = require('mongoose');
const User = require('./models/User');
const StoryRoutes = require('./routes/stories'); 
const crypto = require('crypto');
require('dotenv').config();


const verificationCodes = new Map();
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'sthaniya-secret-key-2024';
const GOOGLE_CLIENT_ID = '947940324164-otntqkg63sr421g1qqr25pel3rso4ec9.apps.googleusercontent.com';

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/stories', StoryRoutes);

// Request validation middleware to catch malformed URLs
app.use((req, res, next) => {
  try {
    // Basic URL validation
    if (req.url && req.url.includes('://')) {
      // If URL contains protocol, it might be malformed
      const cleanUrl = req.url.replace(/https?:\/\/[^\/]+/, '');
      req.url = cleanUrl || '/';
    }
    next();
  } catch (error) {
    console.error('URL parsing error:', error);
    res.status(400).json({ message: 'Invalid request URL' });
  }
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sthaniya', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Health check - move this to the top
app.get('/api/health', (req, res) => {
  res.json({ message: 'Sthaniya API is running!' });
});

 
// Email transporter setup (uncomment and configure your existing code)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Helper function to send verification code
const sendVerificationCode = async (email, code) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Sthaniya - Email Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Sthaniya!</h2>
          <p>Thank you for signing up. Please use the verification code below to complete your registration:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px; margin: 0;">${code}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
          <hr style="margin-top: 30px;">
          <p style="color: #666; font-size: 12px;">This is an automated message from Sthaniya. Please do not reply.</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    return { status: "success", message: "Verification code sent" };
  } catch (err) {
    console.error("Send verification code error:", err);
    throw new Error("Failed to send verification code");
  }
};

// Generate random 6-digit code
const generateVerificationCode = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Add these routes after your existing auth routes

// Send verification code route
app.post('/api/auth/send-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Generate verification code
    const code = generateVerificationCode();
    
    // Store code with expiration (10 minutes)
    verificationCodes.set(email, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      attempts: 0
    });

    // Send email
    await sendVerificationCode(email, code);

    res.json({
      message: 'Verification code sent successfully',
      email
    });

  } catch (error) {
    console.error('Send verification error:', error);
    res.status(500).json({ message: error.message || 'Failed to send verification code' });
  }
});

// Modified register route to include verification
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, verificationCode } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!verificationCode) {
      return res.status(400).json({ message: 'Verification code is required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check verification code
    const storedVerification = verificationCodes.get(email);
    
    if (!storedVerification) {
      return res.status(400).json({ message: 'Verification code not found. Please request a new one.' });
    }

    if (Date.now() > storedVerification.expiresAt) {
      verificationCodes.delete(email);
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }

    if (storedVerification.attempts >= 3) {
      verificationCodes.delete(email);
      return res.status(400).json({ message: 'Too many verification attempts. Please request a new code.' });
    }

    if (storedVerification.code !== verificationCode) {
      storedVerification.attempts += 1;
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Check if user already exists (double check)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      verificationCodes.delete(email);
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      authProvider: 'local',
      emailVerified: true // Mark as verified since they completed email verification
    });

    await newUser.save();

    // Clean up verification code
    verificationCodes.delete(email);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      authProvider: newUser.authProvider,
      emailVerified: newUser.emailVerified,
      createdAt: newUser.createdAt
    };

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Clean up expired verification codes (run every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [email, verification] of verificationCodes.entries()) {
    if (now > verification.expiresAt) {
      verificationCodes.delete(email);
    }
  }
}, 5 * 60 * 1000); // 5 minutes

// Normal Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user registered with Google
    if (user.authProvider === 'google' && !user.password) {
      return res.status(400).json({ message: 'Please sign in with Google' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      authProvider: user.authProvider,
      createdAt: user.createdAt
    };

    res.json({
      message: 'Login successful',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Updated Google Registration Route
app.post('/api/auth/google-register', async (req, res) => {
  try {
    const { token } = req.body;

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email },
        { googleId }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Generate verification code
    const code = generateVerificationCode();
    
    // Store verification data including Google info
    verificationCodes.set(email, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      attempts: 0,
      // Store Google data for later use
      googleData: {
        name,
        email,
        googleId,
        profilePicture: picture
      },
      registrationType: 'google'
    });

    // Send verification email
    await sendVerificationCode(email, code);

    res.json({
      message: 'Verification code sent to your email',
      email,
      registrationType: 'google'
    });

  } catch (error) {
    console.error('Google registration error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
});

// Updated verification route to handle Google data
app.post('/api/auth/verify-google-registration', async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    if (!verificationCode) {
      return res.status(400).json({ message: 'Verification code is required' });
    }

    // Check verification code
    const storedVerification = verificationCodes.get(email);
    
    if (!storedVerification || storedVerification.registrationType !== 'google') {
      return res.status(400).json({ message: 'Verification code not found. Please request a new one.' });
    }

    if (Date.now() > storedVerification.expiresAt) {
      verificationCodes.delete(email);
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }

    if (storedVerification.attempts >= 3) {
      verificationCodes.delete(email);
      return res.status(400).json({ message: 'Too many verification attempts. Please request a new code.' });
    }

    if (storedVerification.code !== verificationCode) {
      storedVerification.attempts += 1;
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Check if user already exists (double check)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      verificationCodes.delete(email);
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user with Google data
    const { googleData } = storedVerification;
    const newUser = new User({
      name: googleData.name,
      email: googleData.email,
      googleId: googleData.googleId,
      profilePicture: googleData.profilePicture,
      authProvider: 'google',
      emailVerified: true
    });

    await newUser.save();

    // Clean up verification code
    verificationCodes.delete(email);

    // Generate JWT token
    const jwtToken = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data
    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      profilePicture: newUser.profilePicture,
      authProvider: newUser.authProvider,
      emailVerified: newUser.emailVerified,
      createdAt: newUser.createdAt
    };

    res.status(201).json({
      message: 'User registered successfully with Google',
      token: jwtToken,
      user: userResponse
    });

  } catch (error) {
    console.error('Google verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        authProvider: user.authProvider,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



app.post('/api/auth/google-login', async (req, res) => {
  try {
    const { token } = req.body;

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Find existing user
    const user = await User.findOne({ 
      $or: [
        { email },
        { googleId }
      ]
    });

    if (!user) {
      return res.status(404).json({ 
        message: 'No account found. Please register first.',
        shouldRegister: true
      });
    }

    // Update Google info if missing
    if (!user.googleId) {
      user.googleId = googleId;
      user.profilePicture = picture;
      await user.save();
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      authProvider: user.authProvider,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt
    };

    res.json({
      message: 'Google login successful',
      token: jwtToken,
      user: userResponse
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
});
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler - simplified to avoid path-to-regexp issues
app.use((req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});


 
 

app.listen(PORT, () => {
  console.log(`Sthaniya server running on port ${PORT}`);
});