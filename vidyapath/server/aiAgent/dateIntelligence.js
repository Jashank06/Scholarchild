/**
 * 📅 Date Intelligence & Lifecycle Manager
 * Automatically transitions opportunities between states based on dates:
 * Upcoming -> Open -> Closing Soon -> Closed -> Archived
 */

const Opportunity = require('../models/Opportunity');

async function updateOpportunityLifecycles() {
  console.log('📅 Running Date Intelligence Lifecycle Manager...');
  const now = new Date();
  const warningDate = new Date();
  warningDate.setDate(now.getDate() + 7); // Closing within 7 days

  const results = { opened: 0, closing_soon: 0, closed: 0, archived: 0 };

  try {
    // 1. Upcoming -> Open
    const opened = await Opportunity.updateMany(
      { 
        status: 'upcoming', 
        'dates.applicationStart': { $lte: now },
        $or: [
          { 'dates.applicationDeadline': { $gt: now } },
          { 'dates.applicationDeadline': null }
        ]
      },
      { $set: { status: 'open' } }
    );
    results.opened = opened.modifiedCount;

    // 2. Open -> Closing Soon
    const closing = await Opportunity.updateMany(
      { 
        status: 'open', 
        'dates.applicationDeadline': { $lte: warningDate, $gt: now }
      },
      { $set: { status: 'closing_soon' } }
    );
    results.closing_soon = closing.modifiedCount;

    // 3. Open/Closing Soon -> Closed
    const closed = await Opportunity.updateMany(
      { 
        status: { $in: ['open', 'closing_soon'] }, 
        'dates.applicationDeadline': { $lt: now }
      },
      { $set: { status: 'closed' } }
    );
    results.closed = closed.modifiedCount;

    // 4. Closed -> Archived (6 months after deadline)
    const archiveDate = new Date();
    archiveDate.setMonth(now.getMonth() - 6);
    
    const archived = await Opportunity.updateMany(
      { 
        status: 'closed', 
        'dates.applicationDeadline': { $lt: archiveDate }
      },
      { $set: { status: 'archived' } }
    );
    results.archived = archived.modifiedCount;

    console.log(`📅 Lifecycle Update Complete: ${results.opened} Opened | ${results.closing_soon} Closing Soon | ${results.closed} Closed | ${results.archived} Archived`);
    return results;
  } catch (error) {
    console.error('📅 Lifecycle Manager Error:', error.message);
    throw error;
  }
}

/**
 * Normalizes and infers missing dates based on historic patterns
 */
function inferMissingDates(extractedDates, historicalData = null) {
  const normalized = { ...extractedDates };
  
  // If we only have deadline but no start date, infer start date as 30 days before deadline
  if (normalized.applicationDeadline && !normalized.applicationStart) {
    const start = new Date(normalized.applicationDeadline);
    start.setDate(start.getDate() - 30);
    normalized.applicationStart = start;
  }

  // If no year specified but month has passed, assume next year
  if (normalized.applicationDeadline) {
    const deadline = new Date(normalized.applicationDeadline);
    const now = new Date();
    if (deadline.getTime() < now.getTime() && (now.getTime() - deadline.getTime()) > 31536000000) { // Older than 1 year
      // Most likely a recurring scholarship, update to next year
      deadline.setFullYear(now.getFullYear());
      if (deadline.getTime() < now.getTime()) {
        deadline.setFullYear(now.getFullYear() + 1);
      }
      normalized.applicationDeadline = deadline;
    }
  }

  return normalized;
}

module.exports = {
  updateOpportunityLifecycles,
  inferMissingDates
};
