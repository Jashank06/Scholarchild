const mongoose = require('mongoose');
const path = require('path');

// Fix paths to be absolute relative to this script
const User = require(path.join(__dirname, '..', 'server', 'models', 'User'));
const { School } = require(path.join(__dirname, '..', 'server', 'models', 'School'));
require('dotenv').config({ path: path.join(__dirname, '..', 'server', '.env') });

async function syncSchools() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI not found in .env');
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const institutionUsers = await User.find({ role: { $in: ['school', 'university'] } });
    console.log(`Found ${institutionUsers.length} institution users`);

    for (const user of institutionUsers) {
      const existingSchool = await School.findOne({ adminUsers: user._id });
      if (!existingSchool) {
        console.log(`Creating school for ${user.email}`);
        const inst = user.institutionProfile || {};
        const addr = user.profile?.address || {};
        const school = await School.create({
          name: inst.institutionName || user.profile?.firstName || 'Unnamed School',
          board: inst.board || 'CBSE',
          type: inst.institutionType || 'private',
          address: {
            state: addr.state,
            city: addr.city,
            district: addr.district
          },
          contact: {
            email: user.email,
            phone: user.phone
          },
          adminUsers: [user._id]
        });
        
        if (!user.profile) user.profile = {};
        user.profile.schoolId = school._id;
        await user.save();
        console.log(`Successfully created and linked school for ${user.email}`);
      } else {
        console.log(`School already exists for ${user.email}`);
      }
    }

    console.log('Sync complete');
    process.exit(0);
  } catch (error) {
    console.error('Sync failed:', error);
    process.exit(1);
  }
}

syncSchools();
