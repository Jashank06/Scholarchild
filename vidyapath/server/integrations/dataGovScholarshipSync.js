/**
 * 🏛️ data.gov.in Scholarship Sync
 * Directly imports structured government data, bypassing AI detection
 * to guarantee 100% accuracy and zero token cost.
 */

const { fetchVidyasiriScholarships } = require('./dataGovClient');
const AgentOpportunity = require('../models/AgentOpportunity');
const { generateTags, normalizeOrganizerType } = require('../aiAgent/enricher');

/**
 * Map a raw data.gov.in record to the AgentOpportunity schema
 */
function mapRecordToOpportunity(record) {
  // Extract values, handling different possible column names
  const title = record.scholarship_name || record.scheme_name || record.title || 'Government Scholarship';
  const state = record.state_name || record.state || 'National';
  const dept = record.department_name || record.ministry_name || 'Government Department';
  const category = record.category || record.caste_category || 'All';
  const desc = record.description || record.details || `Official government scholarship scheme provided by ${dept}.`;

  const tags = generateTags(`${title} ${desc} ${category}`);
  if (category && category !== 'All' && category !== 'General') {
    tags.push('reserved-category');
  }
  tags.push('government', 'official');

  return {
    type: 'scholarship',
    title: title,
    description: desc,
    shortDescription: desc.substring(0, 250),
    organizer: {
      name: dept,
      type: 'government',
      level: state.toLowerCase() === 'national' ? 'national' : 'state',
    },
    category: 'academic',
    tags: [...new Set(tags)],
    eligibility: {
      states: state.toLowerCase() === 'national' ? [] : [state],
      categories: category === 'All' ? [] : [category],
      gender: 'all',
    },
    rewards: {
      type: 'mixed',
      description: 'As per government norms',
    },
    application: {
      mode: 'external',
      externalLink: 'https://scholarships.gov.in', // Fallback URL
      isFree: true,
    },
    aiMetadata: {
      detectionConfidence: 100,
      classificationConfidence: 100,
      overallConfidence: 100,
      trustLevel: 'verified',
      trustScore: 100,
      classificationReasoning: 'Sourced directly from data.gov.in API',
      detectedKeywords: [],
      inferredFields: [],
    },
    source: {
      type: 'api_fetch',
      domain: 'data.gov.in',
      url: 'https://api.data.gov.in',
      rawData: JSON.stringify(record),
      scrapedAt: new Date(),
    },
    priorityScore: {
      overall: 85,
      relevance: 90,
      benefitValue: 80,
      urgency: 50,
      audienceSize: 90,
    },
    agentStatus: 'pending', // Pending review before going live
  };
}

/**
 * Run the sync process
 */
async function syncDataGovScholarships(options = {}) {
  const { limit = 100, offset = 0 } = options;
  const results = { fetched: 0, saved: 0, duplicates: 0, errors: 0 };

  try {
    console.log(`🏛️ Syncing from data.gov.in (limit: ${limit}, offset: ${offset})...`);
    const data = await fetchVidyasiriScholarships(limit, offset);
    
    if (!data.records || data.records.length === 0) {
      console.log('No records found.');
      return results;
    }

    results.fetched = data.records.length;

    for (const record of data.records) {
      try {
        const mappedData = mapRecordToOpportunity(record);

        // Simple duplicate check by title & state
        const isDuplicate = await AgentOpportunity.exists({
          title: mappedData.title,
          'eligibility.states': mappedData.eligibility.states[0],
          'source.type': 'api_fetch'
        });

        if (isDuplicate) {
          results.duplicates++;
          continue;
        }

        const opp = new AgentOpportunity(mappedData);
        await opp.save();
        results.saved++;
      } catch (err) {
        results.errors++;
        console.error(`Error saving record: ${err.message}`);
      }
    }

    console.log(`🏛️ Sync Complete: Fetched ${results.fetched}, Saved ${results.saved}, Dups ${results.duplicates}`);
    return results;

  } catch (error) {
    console.error('🏛️ Sync Failed:', error.message);
    throw error;
  }
}

module.exports = {
  syncDataGovScholarships,
  mapRecordToOpportunity
};
