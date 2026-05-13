const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vidyapath');
    console.log(`Connected to: ${mongoose.connection.name}`);
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    for (const coll of collections) {
      const data = await db.collection(coll.name).find({}).limit(5).toArray();
      console.log(`\n--- Collection: ${coll.name} (Total: ${await db.collection(coll.name).countDocuments()}) ---`);
      console.log(JSON.stringify(data, null, 2));
    }
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

check();
