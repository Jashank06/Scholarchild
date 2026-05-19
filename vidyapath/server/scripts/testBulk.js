require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const AgentOpportunity = require('../models/AgentOpportunity');
const Opportunity = require('../models/Opportunity');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');
  
  const pending = await AgentOpportunity.findOne({ agentStatus: 'pending' });
  if (!pending) {
    console.log('No pending items found');
    process.exit(0);
  }
  
  console.log('Attempting to approve item:', pending._id, pending.title);
  
  try {
    const liveOpp = await Opportunity.create({
      type: ['scholarship', 'competition', 'scheme'].includes(pending.type) ? pending.type : 'scholarship',
      status: 'active',
      title: pending.title,
      description: pending.description,
      shortDescription: pending.shortDescription,
      organizer: pending.organizer,
      category: ['academic', 'arts', 'science', 'quiz', 'olympiad', 'coding', 'writing', 'debate', 'general'].includes(pending.category) ? pending.category : 'general',
      tags: pending.tags,
      eligibility: pending.eligibility,
      rewards: pending.rewards,
      dates: pending.dates,
      application: pending.application,
      isVerified: true,
    });
    console.log('Successfully created Opportunity:', liveOpp._id);
  } catch (err) {
    console.error('FAILED to create Opportunity:', err);
  }
  
  process.exit(0);
}

test();
