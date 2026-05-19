require('dotenv').config({ path: __dirname + '/../.env' });
const { scrapeWithPlaywright } = require('../aiAgent/crawlerStrategies/playwrightStrategy');
const { syncSchoolData } = require('../integrations/schoolDataImporter');
const mongoose = require('mongoose');

async function testPlaywright() {
  console.log('--- Testing Playwright Stealth Crawler ---');
  const testUrl = 'https://scholarships.gov.in/'; // National Scholarship Portal
  console.log(`Scraping ${testUrl}...`);
  try {
    const data = await scrapeWithPlaywright(testUrl, { timeout: 15000, waitSelector: null });
    if (data) {
      console.log(`✅ Success! Title: ${data.title}`);
      console.log(`Extracted Text snippet (${data.text.length} chars):`, data.text.substring(0, 150).replace(/\n/g, ' ') + '...');
    } else {
      console.log('❌ Failed to extract data.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function testSchoolImporter() {
  console.log('\n--- Testing U-DISE Data.gov.in Importer ---');
  
  // Need to connect to mongoose to test the importer, or we can just mock it or let it fail gracefully.
  // Actually, since we don't have the real DB URL, we'll just test the API fetch part by mocking the DB or connecting if MONGODB_URI exists.
  
  if (!process.env.MONGODB_URI) {
    console.log('⚠️ No MONGODB_URI found. Skipping DB save and just testing the API fetch...');
    // We can't easily mock the DB without modifying the code, let's just attempt it. If it fails on DB connection, we know the API fetch succeeded.
  } else {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Connected to MongoDB');
    } catch (e) {
      console.log('⚠️ Could not connect to MongoDB:', e.message);
    }
  }

  try {
    const results = await syncSchoolData({ limit: 5 }); // Just fetch 5 for test
    console.log('✅ Importer Results:', results);
  } catch (error) {
    console.error('❌ Importer Error:', error.message);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

async function runTests() {
  await testPlaywright();
  await testSchoolImporter();
  console.log('\n🎉 Test run complete!');
  process.exit(0);
}

runTests();
