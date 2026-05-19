const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { School } = require('../models/School');
const FileNode = require('../models/FileNode');
const { protect, generateToken } = require('../middleware/auth');
const { awardBadge, updateStreak } = require('../utils/gamification');

// @POST /api/auth/register — Multi-role registration
router.post('/register', async (req, res) => {
  try {
    let { email, phone, password, role, firstName, lastName, grade, state, board,
            // Parent fields
            relationship,
            // Institution fields
            institutionName, institutionType, registrationNumber, principalName,
            gradesOffered, city, district
          } = req.body;

    if (phone && phone.trim() === '') phone = undefined;

    const query = [{ email }];
    if (phone) query.push({ phone });

    const existingUser = await User.findOne({ $or: query });
    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Mobile number';
      return res.status(400).json({ success: false, message: `${field} already exists` });
    }

    const userRole = (email === 'jashankk908@gmail.com') ? 'admin' : (role || 'student');
    const userData = {
      email,
      phone,
      password,
      role: userRole,
    };

    // Build role-specific profile
    if (userRole === 'student') {
      userData.profile = {
        firstName, lastName,
        grade: grade ? parseInt(grade) : undefined,
        board,
        address: { state, city, district },
      };
    } else if (userRole === 'parent') {
      userData.profile = { firstName, lastName, address: { state, city } };
      userData.parentProfile = {
        occupation: req.body.occupation || '',
        children: [],
      };
    } else if (userRole === 'school' || userRole === 'university') {
      userData.profile = { firstName: institutionName, lastName: '' };
      userData.institutionProfile = {
        institutionName,
        institutionType: institutionType || 'private',
        registrationNumber,
        principalName,
        board,
        gradesOffered: gradesOffered || [],
        description: req.body.description || '',
        verificationStatus: 'pending',
      };
      userData.profile.address = { state, city, district };
      userData.isApproved = false; // Needs admin approval
    }

    const user = await User.create(userData);

    // Create predefined folders for students and parents
    if (user.role === 'student' || user.role === 'parent') {
      const predefinedFolders = [
        'Basic Documents',
        'Academics',
        'Sports & Other Activities',
        'Awards / Rewards / Certifications',
      ];

      const folderPromises = predefinedFolders.map((folderName) =>
        FileNode.create({
          name: folderName,
          type: 'folder',
          user: user._id,
          parent: null, // Top-level folders
        })
      );
      await Promise.all(folderPromises);
    }

    // If it's a school/institution, create a corresponding School document
    if (userRole === 'school' || userRole === 'university') {
      const school = await School.create({
        name: institutionName,
        board: board,
        type: institutionType || 'private',
        address: { state, city, district },
        contact: { email, phone },
        adminUsers: [user._id]
      });
      // Link school back to user
      user.profile.schoolId = school._id;
      user.institutionProfile.registrationNumber = registrationNumber; // Ensure this is set
      await user.save();
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = { code: otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
    await user.save();

    // Award first-time badge
    await awardBadge(user, 'FIRST_LOGIN');

    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      message: 'Registration successful. OTP sent.',
      token,
      otp, // Dev only
      user: { id: user._id, email: user.email, role: user.role, profile: user.profile },
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        success: false, 
        message: `${field === 'email' ? 'Email' : 'Mobile number'} already exists` 
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/auth/login — OTP-based login
router.post('/login', async (req, res) => {
  try {
    const { email, phone } = req.body;
    const query = email ? { email } : { phone };
    const user = await User.findOne(query);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found. Please register first.' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = { code: otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
    await user.save();

    res.json({
      success: true,
      message: 'OTP sent to your phone/email',
      otp, // Dev only
      userId: user._id,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.otp?.code || user.otp.code !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    // Update streak
    await updateStreak(user);

    const token = generateToken(user._id);
    res.json({
      success: true,
      message: 'OTP verified successfully',
      token,
      user: {
        id: user._id, email: user.email, role: user.role,
        profile: user.profile, gamification: user.gamification,
        institutionProfile: user.institutionProfile,
        parentProfile: user.parentProfile,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/auth/link-child — Parent links a child account
router.post('/link-child', protect, async (req, res) => {
  try {
    if (req.user.role !== 'parent') {
      return res.status(403).json({ success: false, message: 'Only parents can link children' });
    }

    const { childEmail, relationship } = req.body;
    const child = await User.findOne({ email: childEmail, role: 'student' });

    if (!child) {
      return res.status(404).json({ success: false, message: 'Student not found with this email' });
    }

    if (child.linkedParent) {
      return res.status(400).json({ success: false, message: 'This student is already linked to a parent' });
    }

    // Check if already linked
    const alreadyLinked = req.user.parentProfile?.children?.some(
      c => c.childId?.toString() === child._id.toString()
    );
    if (alreadyLinked) {
      return res.status(400).json({ success: false, message: 'Child already linked' });
    }

    // Link child to parent
    if (!req.user.parentProfile) req.user.parentProfile = { children: [] };
    req.user.parentProfile.children.push({
      childId: child._id,
      relationship: relationship || 'guardian',
      linkedAt: new Date(),
    });
    await req.user.save();

    // Set reverse link on child
    child.linkedParent = req.user._id;
    await child.save();

    res.json({
      success: true,
      message: `Successfully linked ${child.profile.firstName} to your account`,
      child: { id: child._id, name: child.fullName, grade: child.profile.grade },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.role === 'student') {
      user.calculateProfileScore();
      await user.save();
    }

    res.json({
      success: true,
      user: {
        id: user._id, email: user.email, phone: user.phone, role: user.role,
        profile: user.profile, gamification: user.gamification,
        profileScore: user.profileScore, preferences: user.preferences,
        parentProfile: user.parentProfile,
        institutionProfile: user.institutionProfile,
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/avatars')),
  filename: (req, file, cb) => cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ 
  storage, 
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only JPG and PNG are allowed.'));
  }
});

// @PUT /api/auth/profile — Update profile details or avatar
router.put('/profile', protect, upload.single('avatar'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Handle Avatar Upload
    if (req.file) {
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      user.profile.avatar = avatarUrl;
      if (user.role === 'school' || user.role === 'university') {
        if (!user.institutionProfile) user.institutionProfile = {};
        user.institutionProfile.logo = avatarUrl;
      }
    }

    // Handle Other Profile Updates
    if (req.body.profile) {
      const updates = JSON.parse(req.body.profile);
      Object.assign(user.profile, updates);
    }
    
    if (user.role === 'student') user.calculateProfileScore();
    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id, email: user.email, role: user.role,
        profile: user.profile, institutionProfile: user.institutionProfile,
        profileScore: user.profileScore
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
