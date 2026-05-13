/**
 * 🌐 AI Agent Data Source Connectors
 * Manages known opportunity sources and parses Excel/CSV data.
 */

// ─── Known Government Sources ───
const KNOWN_SOURCES = [
  { name: 'National Scholarship Portal (NSP)', url: 'https://scholarships.gov.in/', type: 'government', category: 'scholarship' },
  { name: 'MyScheme Portal', url: 'https://www.myscheme.gov.in/', type: 'government', category: 'scheme' },
  { name: 'INSPIRE Awards', url: 'https://www.inspireawards-dst.gov.in/', type: 'government', category: 'scholarship' },
  { name: 'Atal Innovation Mission', url: 'https://aim.gov.in/', type: 'government', category: 'competition' },
  { name: 'HBCSE Olympiad', url: 'https://www.hbcse.tifr.res.in/olympiad', type: 'institution', category: 'competition' },
  { name: 'SOF Olympiads', url: 'https://www.sofworld.org/', type: 'institution', category: 'competition' },
  { name: 'NCERT', url: 'https://ncert.nic.in/', type: 'government', category: 'academic' },
  { name: 'CBSE Academic', url: 'https://cbseacademic.nic.in/', type: 'government', category: 'competition' },
  { name: 'Maharashtra Education', url: 'https://education.maharashtra.gov.in/', type: 'government', category: 'scheme' },
  { name: 'Maharashtra Exam Council', url: 'https://maa.ac.in/', type: 'government', category: 'competition' },
];

/**
 * Parse Excel row from scholarship competitions.xlsx
 * Columns: Sr., Name, Subject area, Level, Organising institution, Website
 */
function parseExcelRow(row) {
  const title = row['Name of exam / competition / scholarship'] || row['Name'] || row[1] || '';
  if (!title || title.trim().length < 3) return null;

  const subjectArea = row['Subject area'] || row[2] || '';
  const level = row['Level'] || row[3] || '';
  const organizer = row['Organising institution'] || row[4] || '';
  const website = row['Website / contact link'] || row['Website'] || row[5] || '';

  // Combine all text for analysis
  const combinedText = `${title} ${subjectArea} ${level} ${organizer}`;

  return {
    title: title.trim(),
    subjectArea: subjectArea.trim(),
    levelRaw: level.trim(),
    organizerRaw: organizer.trim(),
    websiteRaw: website.trim(),
    combinedText,
  };
}

/**
 * Parse raw URL text into opportunity-like data for the pipeline
 */
function parseUrlContent(text, url) {
  return {
    rawText: text,
    url,
    domain: extractDomain(url),
  };
}

function extractDomain(url) {
  try { return new URL(url).hostname; } catch { return ''; }
}

module.exports = { KNOWN_SOURCES, parseExcelRow, parseUrlContent, extractDomain };
