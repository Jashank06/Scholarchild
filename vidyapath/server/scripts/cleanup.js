const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const Review = require('../models/Review');
const ServiceRequest = require('../models/ServiceRequest');

const cleanup = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vidyapath');
    console.log(`Connected to DB: ${mongoose.connection.name}`);

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in DB:');
    for (const coll of collections) {
      const count = await mongoose.connection.db.collection(coll.name).countDocuments();
      console.log(` - ${coll.name}: ${count}`);
    }

    const res1 = await mongoose.connection.db.collection('opportunities').deleteMany({});
    const res2 = await mongoose.connection.db.collection('applications').deleteMany({});
    const res3 = await mongoose.connection.db.collection('notifications').deleteMany({});
    const res4 = await mongoose.connection.db.collection('reviews').deleteMany({});
    const res5 = await mongoose.connection.db.collection('servicerequests').deleteMany({});

    console.log(`Deleted ${res1.deletedCount} Opportunities`);
    console.log(`Deleted ${res2.deletedCount} Applications`);
    console.log(`Deleted ${res3.deletedCount} Notifications`);
    console.log(`Deleted ${res4.deletedCount} Reviews`);
    console.log(`Deleted ${res5.deletedCount} Service Requests`);

    console.log('✅ Dummy data cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
};

cleanup();
