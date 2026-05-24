require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const FileNode = require('../models/FileNode');
const connectDB = require('../config/db');

const addPredefinedFolders = async () => {
  try {
    await connectDB();

    const users = await User.find({ role: { $in: ['student', 'parent'] } });
    console.log(`Found ${users.length} student/parent users.`);

    const predefinedFolders = [
      'Basic Documents',
      'Academics',
      'Sports & Other Activities',
      'Awards / Rewards / Certifications',
    ];

    for (const user of users) {
      console.log(`Processing user: ${user.email}`);
      const existingFolders = await FileNode.find({ userId: user._id, parentId: null, type: 'folder' });
      const existingFolderNames = existingFolders.map(f => f.name);

      const foldersToCreate = predefinedFolders.filter(
        (folderName) => !existingFolderNames.includes(folderName)
      );

      if (foldersToCreate.length > 0) {
        console.log(`Creating ${foldersToCreate.length} folders for ${user.email}`);
        const folderPromises = foldersToCreate.map((folderName) =>
          FileNode.create({
            name: folderName,
            type: 'folder',
            userId: user._id,
            parentId: null, // Top-level folders
          })
        );
        await Promise.all(folderPromises);
      } else {
        console.log(`User ${user.email} already has all predefined folders.`);
      }
    }

    console.log('Script finished successfully.');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error running script:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

addPredefinedFolders();
