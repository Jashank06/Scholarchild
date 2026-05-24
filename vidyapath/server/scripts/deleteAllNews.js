require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const Opportunity = require('../models/Opportunity');
const AgentOpportunity = require('../models/AgentOpportunity');

async function deleteNewsBasedOpportunities() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected.\n');

    // News source patterns at end of title
    const sourcePatterns = [
      /-\s*(The\s+)?Times of India$/i,
      /-\s*(The\s+)?Hindustan Times$/i,
      /-\s*(The\s+)?Indian Express$/i,
      /-\s*NDTV$/i,
      /-\s*Jagran Josh$/i,
      /-\s*Sakshi Education$/i,
      /-\s*Careers360$/i,
      /-\s*Google News$/i,
      /-\s*India Today$/i,
    ];

    // Generic patterns
    const genericPatterns = [
      /-\s*Google News$/i,
      /-\s*News$/i,
      /news$/i,
    ];

    // ─── Delete from Opportunity (Approved) ───
    console.log('🏠 Checking Opportunity (approved)...\n');

    const opps = await Opportunity.find({ type: { $in: ['scholarship', 'competition', 'scheme'] } });
    
    const toDelete = opps.filter(o => 
      sourcePatterns.some(p => p.test(o.title)) ||
      genericPatterns.some(p => p.test(o.title)) ||
      /-\s*News$/.test(o.title)
    );

    console.log(`   Found ${toDelete.length} entries to delete:\n`);
    toDelete.forEach(o => console.log(`   • ${o.type}: ${o.title.substring(0, 80)}...`));
    console.log('');

    if (toDelete.length > 0) {
      const ids = toDelete.map(o => o._id);
      
      // Delete related applications if Application model exists
      let Application;
      try { Application = require('../models/Application'); } catch (e) {}
      
      if (Application) {
        const appsDeleted = await Application.deleteMany({ opportunityId: { $in: ids } });
        console.log(`🗑️  Deleted ${appsDeleted.deletedCount} related applications.`);
      }
      
      const result = await Opportunity.deleteMany({ _id: { $in: ids } });
      console.log(`✅ Deleted ${result.deletedCount} opportunities.\n`);
    }

    // ─── Delete from AgentOpportunity (Staging) ───
    console.log('📦 Checking AgentOpportunity (staging)...\n');
    
    const agentOpps = await AgentOpportunity.find({ type: { $in: ['scholarship', 'competition', 'scheme'] } });
    
    const agentToDelete = agentOpps.filter(o => {
      // Check source.url for news domains
      if (o.source?.url && /news|timesofindia|hindustantimes|indianexpress|ndtv|jagranjosh|sakshi|careers360|google/i.test(o.source.url)) {
        return true;
      }
      // Check source.domain
      if (o.source?.domain && /news|google/i.test(o.source.domain)) {
        return true;
      }
      // Check title for source patterns
      if (sourcePatterns.some(p => p.test(o.title))) {
        return true;
      }
      return false;
    });

    if (agentToDelete.length > 0) {
      console.log(`   Found ${agentToDelete.length} entries to delete.\n`);
      const agentIds = agentToDelete.map(o => o._id);
      const agentResult = await AgentOpportunity.deleteMany({ _id: { $in: agentIds } });
      console.log(`✅ Deleted ${agentResult.deletedCount} staging opportunities.\n`);
    } else {
      console.log('   No staging entries found.\n');
    }

    // ─── Summary ───
    const total = toDelete.length + agentToDelete.length;
    console.log('═══════════════════════════════════════');
    console.log(`📊 Total Deleted: ${total}`);
    console.log('═══════════════════════════════════════\n');

    console.log('🎉 Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
    process.exit(0);
  }
}

deleteNewsBasedOpportunities();