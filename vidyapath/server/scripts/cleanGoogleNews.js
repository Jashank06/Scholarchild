require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const AgentOpportunity = require('../models/AgentOpportunity');
const Opportunity = require('../models/Opportunity');

const googlePattern = /news\.google\.com/i;

async function cleanGoogleNews() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.\n');

    // Count
    const agentCount = await AgentOpportunity.countDocuments({
      $or: [
        { 'source.url': googlePattern },
        { 'application.externalLink': googlePattern },
      ]
    });
    const oppCount = await Opportunity.countDocuments({ 'application.externalLink': googlePattern });

    console.log(`AgentOpportunities with Google News links: ${agentCount}`);
    console.log(`Opportunities with Google News links: ${oppCount}\n`);

    // Delete AgentOpportunities
    if (agentCount > 0) {
      const agentResult = await AgentOpportunity.deleteMany({
        $or: [
          { 'source.url': googlePattern },
          { 'application.externalLink': googlePattern },
        ]
      });
      console.log(`Deleted ${agentResult.deletedCount} AgentOpportunities`);
    }

    // Delete Opportunities
    if (oppCount > 0) {
      const oppResult = await Opportunity.deleteMany({ 'application.externalLink': googlePattern });
      console.log(`Deleted ${oppResult.deletedCount} Opportunities`);
    }

    console.log('\nCleanup complete!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

cleanGoogleNews();
