/**
 * 📈 Analytics Intelligence Engine
 * Aggregates platform data to generate insights for schools, admins, and parents.
 */

const Opportunity = require('../models/Opportunity');
const User = require('../models/User');

async function generatePlatformInsights() {
  const [totalOpps, activeOpps, oppsByCategory, oppsByState] = await Promise.all([
    Opportunity.countDocuments(),
    Opportunity.countDocuments({ status: 'open' }),
    
    // Aggregate by category
    Opportunity.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    
    // Aggregate by State (unwinding the states array)
    Opportunity.aggregate([
      { $unwind: '$eligibility.states' },
      { $group: { _id: '$eligibility.states', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ])
  ]);

  const categoryBreakdown = {};
  oppsByCategory.forEach(c => categoryBreakdown[c._id || 'general'] = c.count);

  const stateBreakdown = {};
  oppsByState.forEach(s => stateBreakdown[s._id] = s.count);

  return {
    overview: {
      totalOpportunities: totalOpps,
      activeOpportunities: activeOpps,
    },
    categoryBreakdown,
    topStates: stateBreakdown,
    generatedAt: new Date()
  };
}

module.exports = { generatePlatformInsights };
