/**
 * 🧠 Entity Enricher — Auto-fill missing data using OpenAI
 * Triggers when total (schools + institutions + events) >= 50
 */

const { callAI } = require('./geminiClient');
const mongoose = require('mongoose');

const ENRICHMENT_THRESHOLD = 50;
let enrichmentRan = false;

async function getTotalCount() {
  const { School } = require('../models/School');
  const Institution = require('../models/Institution');
  const Event = require('../models/Event');
  
  try {
    const [s, i, e] = await Promise.all([
      School.countDocuments(),
      Institution.countDocuments(),
      Event.countDocuments(),
    ]);
    return { schools: s, institutions: i, events: e, total: s + i + e };
  } catch {
    return { schools: 0, institutions: 0, events: 0, total: 0 };
  }
}

function getMissingFields(doc, entityType) {
  const missing = [];
  const fieldMap = {
    school: [
      { key: 'board', label: 'Board (CBSE/ICSE/State/IB/IGCSE)' },
      { key: 'type', label: 'Type (government/private/aided)' },
      { key: 'description', label: 'Short description' },
      { key: 'contact.email', label: 'Contact email' },
      { key: 'contact.phone', label: 'Contact phone' },
      { key: 'contact.website', label: 'Official website' },
      { key: 'address.city', label: 'City' },
      { key: 'address.state', label: 'State' },
      { key: 'address.district', label: 'District' },
      { key: 'facilities.hasComputerLab', label: 'Has Computer Lab?' },
      { key: 'facilities.hasLibrary', label: 'Has Library?' },
      { key: 'stats.totalStudents', label: 'Total Students (approx)' },
    ],
    institution: [
      { key: 'type', label: 'Type (ITI/Diploma/College/University)' },
      { key: 'affiliation', label: 'Affiliation (AICTE/UGC/etc)' },
      { key: 'description', label: 'Short description' },
      { key: 'courses', label: 'Popular courses (comma separated)' },
      { key: 'contact.email', label: 'Contact email' },
      { key: 'contact.phone', label: 'Contact phone' },
      { key: 'contact.website', label: 'Official website' },
      { key: 'address.city', label: 'City' },
      { key: 'address.state', label: 'State' },
      { key: 'address.district', label: 'District' },
      { key: 'stats.placementRate', label: 'Placement Rate % (approx)' },
    ],
    event: [
      { key: 'category', label: 'Category (Sports/Cultural/Competition/Workshop/Other)' },
      { key: 'description', label: 'Event description' },
      { key: 'eventDate', label: 'Event date (YYYY-MM-DD)' },
      { key: 'organizer.name', label: 'Organizer name' },
      { key: 'organizer.contact', label: 'Organizer contact' },
      { key: 'organizer.website', label: 'Organizer website' },
      { key: 'eligibility', label: 'Eligibility criteria' },
      { key: 'prizes', label: 'Prizes/Rewards' },
      { key: 'fees', label: 'Entry fees (0 if free)' },
      { key: 'venue.city', label: 'City' },
      { key: 'venue.state', label: 'State' },
    ],
  };

  const fields = fieldMap[entityType] || [];
  
  for (const f of fields) {
    const keys = f.key.split('.');
    let val = doc;
    for (const k of keys) {
      val = val?.[k];
    }
    if (val === undefined || val === null || val === '' || val === 0) {
      missing.push(f);
    }
  }
  return missing;
}

function setNestedValue(doc, key, value) {
  const keys = key.split('.');
  let current = doc;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) current[keys[i]] = {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
}

async function enrichEntity(doc, entityType) {
  const missing = getMissingFields(doc, entityType);
  if (missing.length === 0) {
    return { enriched: false, reason: 'No missing fields' };
  }

  const missingLabels = missing.map(f => f.label).join(', ');
  const prompt = `You know about Indian educational institutions and events. Fill in the missing information for this "${entityType}" entity using your knowledge.

Entity Name: "${doc.name || doc.title || 'Unknown'}"
Entity Type: ${entityType}

Missing fields that need values: ${missingLabels}

Current known data:
${JSON.stringify(doc, null, 2)}

Return a JSON object with only the missing fields. Use your knowledge of real Indian schools/colleges/events.
- For contact info, provide realistic but generic values based on the entity name
- For website, provide the most likely official domain
- For stats/counts, provide realistic estimates
- For descriptions, write 1-2 sentences in English
- For boolean fields, answer true/false
- NEVER make up obviously fake data — if uncertain, leave the field empty`;

  try {
    const result = await callAI(prompt, {
      cacheKey: `entity-enrich:${entityType}:${doc._id || doc.name}`,
    });

    if (!result) return { enriched: false, reason: 'AI call failed' };

    let changes = 0;
    for (const f of missing) {
      const keys = f.key.split('.');
      let aiVal = result;
      for (const k of keys) {
        aiVal = aiVal?.[k];
      }
      if (aiVal !== undefined && aiVal !== null && aiVal !== '') {
        setNestedValue(doc, f.key, aiVal);
        changes++;
      }
    }

    return { enriched: changes > 0, fieldsUpdated: changes, missingCount: missing.length };
  } catch (e) {
    return { enriched: false, reason: e.message };
  }
}

async function enrichAll() {
  console.log('\n🧠 AUTO-ENRICH: Starting batch enrichment...');
  const { School } = require('../models/School');
  const Institution = require('../models/Institution');
  const Event = require('../models/Event');

  let totalEnriched = 0;

  // Enrich Schools
  const schools = await School.find({}).select('name address board type contact facilities stats').lean();
  for (const school of schools) {
    const result = await enrichEntity(school, 'school');
    if (result.enriched) {
      await School.updateOne({ _id: school._id }, { $set: school });
      totalEnriched++;
    }
  }
  console.log(`  🏫 Schools: ${totalEnriched} enriched`);

  // Enrich Institutions
  let instEnriched = 0;
  const institutions = await Institution.find({}).lean();
  for (const inst of institutions) {
    const result = await enrichEntity(inst, 'institution');
    if (result.enriched) {
      await Institution.updateOne({ _id: inst._id }, { $set: inst });
      instEnriched++;
    }
  }
  totalEnriched += instEnriched;
  console.log(`  🎓 Institutions: ${instEnriched} enriched`);

  // Enrich Events
  let evtEnriched = 0;
  const events = await Event.find({}).lean();
  for (const evt of events) {
    const result = await enrichEntity(evt, 'event');
    if (result.enriched) {
      await Event.updateOne({ _id: evt._id }, { $set: evt });
      evtEnriched++;
    }
  }
  totalEnriched += evtEnriched;
  console.log(`  🎪 Events: ${evtEnriched} enriched`);
  console.log(`🧠 AUTO-ENRICH: Complete — ${totalEnriched} entities enriched\n`);

  enrichmentRan = true;
  return totalEnriched;
}

async function checkAndEnrich() {
  if (enrichmentRan) return { triggered: false, reason: 'Already ran' };

  const counts = await getTotalCount();
  console.log(`📊 Entity count: ${counts.total}/50`);

  if (counts.total >= ENRICHMENT_THRESHOLD) {
    const enriched = await enrichAll();
    return { triggered: true, enriched };
  }

  return { triggered: false, reason: `Need ${ENRICHMENT_THRESHOLD - counts.total} more entries` };
}

module.exports = { checkAndEnrich, enrichAll, enrichEntity, getTotalCount };
