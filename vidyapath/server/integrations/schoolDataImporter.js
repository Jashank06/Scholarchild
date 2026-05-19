/**
 * 🏫 School Data Importer
 * Pulls U-DISE school data from data.gov.in and populates the School model.
 */

const { fetchResourceData } = require('./dataGovClient');
const { School } = require('../models/School');

// Data.gov.in Resource ID for U-DISE School Data (Replace with actual ID when known)
const UDISE_RESOURCE_ID = process.env.UDISE_RESOURCE_ID || 'd7085600-75aa-4df7-8c43-b903c737f26c';

/**
 * Map U-DISE record to our School schema
 */
function mapUDISEToSchool(record) {
  // Safe extraction matching U-DISE typical headers
  const udise = record.udise_code || record.udise || null;
  const name = record.school_name || record.name || 'Unknown School';
  
  // Board parsing
  const rawBoard = (record.board || record.affiliation || '').toUpperCase();
  let board = 'State';
  if (rawBoard.includes('CBSE')) board = 'CBSE';
  else if (rawBoard.includes('ICSE') || rawBoard.includes('CISCE')) board = 'ICSE';
  else if (rawBoard.includes('IB')) board = 'IB';
  
  // Type parsing
  const rawType = (record.school_type || record.management || '').toLowerCase();
  let type = 'private';
  if (rawType.includes('gov') || rawType.includes('local body')) type = 'government';
  else if (rawType.includes('aid')) type = 'aided';

  // Stats
  const totalStudents = parseInt(record.total_students || record.enrollment || 0) || 0;
  const teachers = parseInt(record.total_teachers || record.teachers || 0) || 0;
  const ratio = (totalStudents > 0 && teachers > 0) ? +(totalStudents / teachers).toFixed(1) : 0;

  // Facilities
  const hasComputerLab = /yes|1/i.test(record.computer_lab || '');
  const hasLibrary = /yes|1/i.test(record.library || '');
  const hasPlayground = /yes|1/i.test(record.playground || '');

  return {
    udiseCode: udise,
    name,
    board,
    type,
    address: {
      state: record.state || record.state_name || '',
      district: record.district || record.district_name || '',
      city: record.city || record.village || record.block || '',
      pincode: record.pincode || record.pin || '',
      fullAddress: record.address || '',
    },
    location: {
      type: 'Point',
      // Ensure valid numbers, data.gov.in provides strings
      coordinates: [
        parseFloat(record.longitude) || 0,
        parseFloat(record.latitude) || 0
      ]
    },
    facilities: {
      hasComputerLab,
      hasLibrary,
      hasPlayground,
      hasSmartClasses: false,
    },
    stats: {
      totalStudents,
      studentTeacherRatio: ratio,
      avgPassPercentage: 0,
    },
    isVerified: true, // Data directly from gov is auto-verified
  };
}

/**
 * Sync U-DISE data from data.gov.in
 */
async function syncSchoolData(options = {}) {
  const { limit = 1000, offset = 0, stateFilters = {} } = options;
  const results = { fetched: 0, saved: 0, updated: 0, errors: 0 };

  try {
    console.log(`🏫 Syncing U-DISE Schools (limit: ${limit}, offset: ${offset})...`);
    
    const data = await fetchResourceData(UDISE_RESOURCE_ID, { limit, offset, filters: stateFilters });
    
    if (!data.records || data.records.length === 0) {
      console.log('No school records found.');
      return results;
    }

    results.fetched = data.records.length;

    for (const record of data.records) {
      try {
        const schoolData = mapUDISEToSchool(record);
        
        // Skip if essential data is missing
        if (!schoolData.name || !schoolData.address.state) continue;

        // Upsert by U-DISE code if available, otherwise by name + state + district
        if (schoolData.udiseCode) {
          const existing = await School.findOneAndUpdate(
            { udiseCode: schoolData.udiseCode },
            { $set: schoolData },
            { upsert: true, new: false }
          );
          if (existing) results.updated++;
          else results.saved++;
        } else {
          const existing = await School.findOneAndUpdate(
            { 
              name: schoolData.name, 
              'address.state': schoolData.address.state,
              'address.district': schoolData.address.district
            },
            { $set: schoolData },
            { upsert: true, new: false }
          );
          if (existing) results.updated++;
          else results.saved++;
        }
      } catch (err) {
        results.errors++;
        console.error(`Error saving school: ${err.message}`);
      }
    }

    console.log(`🏫 School Sync Complete: Fetched ${results.fetched}, Saved ${results.saved}, Updated ${results.updated}, Errors ${results.errors}`);
    return results;

  } catch (error) {
    console.error('🏫 School Sync Failed:', error.message);
    throw error;
  }
}

module.exports = {
  syncSchoolData,
  mapUDISEToSchool
};
