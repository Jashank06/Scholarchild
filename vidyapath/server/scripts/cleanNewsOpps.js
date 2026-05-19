require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const AgentOpportunity = require('../models/AgentOpportunity');
const Opportunity = require('../models/Opportunity');

// Try to require News model, fallback if it doesn't exist
let News;
try {
  News = require('../models/News');
} catch (e) {
  // If News model is not exported properly, define inline schema
  News = mongoose.model('News', new mongoose.Schema({}, { strict: false }));
}

async function cleanDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected.');

    // 1. Clear News collection completely
    console.log('🧹 Clearing News collection...');
    const newsDeleteResult = await News.deleteMany({});
    console.log(`✅ Deleted ${newsDeleteResult.deletedCount} records from News collection.`);

    // 2. Identify news sources & domains
    const newsPatterns = [
      /news/i,
      /rss/i,
      /feed/i,
      /timesofindia/i,
      /hindustantimes/i,
      /indianexpress/i,
      /jagranjosh/i,
      /ndtv/i,
      /moneycontrol/i,
      /livemint/i,
      /financialexpress/i,
      /dainik/i,
      /bhaskar/i,
      /patrika/i,
      /amarujala/i,
      /oneindia/i,
      /news18/i,
      /thehindu/i,
      /economictimes/i
    ];

    // Build the query for News-related Opportunities
    const newsQuery = {
      $or: [
        { 'source.url': { $in: newsPatterns } },
        { 'source.domain': { $in: newsPatterns } },
        { 'source.rawData': { $in: newsPatterns } },
        { title: { $regex: 'news|rss|feed', $options: 'i' } }
      ]
    };

    // 3. Delete from AgentOpportunity
    console.log('🧹 Scanning AgentOpportunities for news articles...');
    const agentOppsCountBefore = await AgentOpportunity.countDocuments(newsQuery);
    console.log(`Found ${agentOppsCountBefore} news-related staging opportunities.`);
    
    if (agentOppsCountBefore > 0) {
      const agentDeleteResult = await AgentOpportunity.deleteMany(newsQuery);
      console.log(`✅ Deleted ${agentDeleteResult.deletedCount} staging opportunities.`);
    }

    // 4. Delete from Opportunity
    console.log('🧹 Scanning Opportunities for news articles...');
    const oppsCountBefore = await Opportunity.countDocuments(newsQuery);
    console.log(`Found ${oppsCountBefore} news-related approved opportunities.`);
    
    if (oppsCountBefore > 0) {
      const oppDeleteResult = await Opportunity.deleteMany(newsQuery);
      console.log(`✅ Deleted ${oppDeleteResult.deletedCount} approved opportunities.`);
    }

    console.log('🎉 Database Cleanup Complete!');
  } catch (error) {
    console.error('❌ Error cleaning database:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
    process.exit(0);
  }
}

cleanDatabase();
