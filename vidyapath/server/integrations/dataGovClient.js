const axios = require('axios');
require('dotenv').config();

const DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY;
const BASE_URL = 'https://api.data.gov.in';

/**
 * Fetch records from data.gov.in using their CKAN API
 * @param {string} resourceId - The UUID of the dataset resource
 * @param {object} options - Pagination and filter options
 * @returns {Array} List of records
 */
async function fetchResourceData(resourceId, options = {}) {
  if (!DATA_GOV_API_KEY) {
    throw new Error('DATA_GOV_API_KEY is not defined in environment variables');
  }

  const { limit = 100, offset = 0, filters = {} } = options;
  
  try {
    const url = `${BASE_URL}/resource/${resourceId}`;
    
    // Construct query params
    const params = {
      'api-key': DATA_GOV_API_KEY,
      format: 'json',
      limit,
      offset,
    };

    // Add filters (e.g., filters[state]=Maharashtra)
    for (const [key, value] of Object.entries(filters)) {
      params[`filters[${key}]`] = value;
    }

    const response = await axios.get(url, {
      params,
      timeout: 15000, // 15 seconds
    });

    if (response.data && response.data.records) {
      return {
        records: response.data.records,
        total: response.data.total,
        count: response.data.count,
        version: response.data.version
      };
    }

    return { records: [], total: 0 };
  } catch (error) {
    console.error(`❌ Data.gov.in API Error for resource ${resourceId}:`, error.message);
    throw error;
  }
}

/**
 * Specifically fetch the Vidyasiri Scholarship data (and similar)
 */
async function fetchVidyasiriScholarships(limit = 100, offset = 0) {
  // Resource ID provided by the user for Vidyasiri Scholarship
  const RESOURCE_ID = '6ec0cf33-9c8b-434b-9030-6acfc83c841a';
  return fetchResourceData(RESOURCE_ID, { limit, offset });
}

module.exports = {
  fetchResourceData,
  fetchVidyasiriScholarships
};
