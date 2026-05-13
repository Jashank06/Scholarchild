/**
 * 🌐 Source Registry — 200+ curated opportunity sources
 * Each source has metadata for smart crawling
 */

const SOURCES = [
  // ═══ CENTRAL GOVERNMENT SCHOLARSHIPS ═══
  { id: 'nsp', name: 'National Scholarship Portal', url: 'https://scholarships.gov.in/', strategy: 'puppeteer', priority: 'critical', scanInterval: 12, category: 'scholarship', region: 'national', enabled: true },
  { id: 'myscheme', name: 'MyScheme Portal', url: 'https://www.myscheme.gov.in/', strategy: 'puppeteer', priority: 'critical', scanInterval: 12, category: 'scheme', region: 'national', enabled: true },
  { id: 'inspire', name: 'INSPIRE Awards', url: 'https://www.inspireawards-dst.gov.in/', strategy: 'cheerio', priority: 'high', scanInterval: 24, category: 'scholarship', region: 'national', enabled: true },
  { id: 'aim', name: 'Atal Innovation Mission', url: 'https://aim.gov.in/', strategy: 'cheerio', priority: 'high', scanInterval: 24, category: 'competition', region: 'national', enabled: true },
  { id: 'dst', name: 'Dept of Science & Tech', url: 'https://www.dst.gov.in/', strategy: 'cheerio', priority: 'high', scanInterval: 24, category: 'scheme', region: 'national', enabled: true },
  { id: 'services-india', name: 'Services India Portal', url: 'https://services.india.gov.in/', strategy: 'cheerio', priority: 'medium', scanInterval: 48, category: 'scheme', region: 'national', enabled: true },
  { id: 'data-gov', name: 'Open Data India', url: 'https://data.gov.in/', strategy: 'cheerio', priority: 'low', scanInterval: 72, category: 'scheme', region: 'national', enabled: true },
  { id: 'pmcares', name: 'PM CARES Scholarship', url: 'https://pmcaresforchildren.in/scholarship', strategy: 'puppeteer', priority: 'high', scanInterval: 24, category: 'scholarship', region: 'national', enabled: true },

  // ═══ STATE GOVERNMENT PORTALS ═══
  { id: 'mahadbt', name: 'MahaDBT Maharashtra', url: 'https://mahadbt.maharashtra.gov.in/', strategy: 'puppeteer', priority: 'critical', scanInterval: 12, category: 'scholarship', region: 'Maharashtra', enabled: true },
  { id: 'maha-edu', name: 'Maharashtra Education', url: 'https://education.maharashtra.gov.in/', strategy: 'cheerio', priority: 'high', scanInterval: 24, category: 'scheme', region: 'Maharashtra', enabled: true },
  { id: 'maha-exam', name: 'Maharashtra Exam Council', url: 'https://maa.ac.in/', strategy: 'cheerio', priority: 'high', scanInterval: 24, category: 'competition', region: 'Maharashtra', enabled: true },
  { id: 'up-scholarship', name: 'UP Scholarship', url: 'https://scholarship.up.gov.in/', strategy: 'puppeteer', priority: 'high', scanInterval: 24, category: 'scholarship', region: 'Uttar Pradesh', enabled: true },
  { id: 'karnataka-ssp', name: 'Karnataka SSP', url: 'https://ssp.karnataka.gov.in/', strategy: 'puppeteer', priority: 'high', scanInterval: 24, category: 'scholarship', region: 'Karnataka', enabled: true },
  { id: 'telangana-epass', name: 'Telangana ePass', url: 'https://telanganaepass.cgg.gov.in/', strategy: 'puppeteer', priority: 'high', scanInterval: 24, category: 'scholarship', region: 'Telangana', enabled: true },
  { id: 'ap-jnanabhumi', name: 'AP Jnanabhumi', url: 'https://jnanabhumi.ap.gov.in/', strategy: 'puppeteer', priority: 'high', scanInterval: 24, category: 'scholarship', region: 'Andhra Pradesh', enabled: true },
  { id: 'bihar-pms', name: 'Bihar PMS Online', url: 'https://pmsonline.bihar.gov.in/', strategy: 'puppeteer', priority: 'high', scanInterval: 24, category: 'scholarship', region: 'Bihar', enabled: true },
  { id: 'bihar-medha', name: 'Bihar Medhasoft', url: 'https://medhasoft.bihar.gov.in/', strategy: 'puppeteer', priority: 'medium', scanInterval: 48, category: 'scholarship', region: 'Bihar', enabled: true },
  { id: 'jharkhand-scholarship', name: 'Jharkhand Scholarship', url: 'https://scholarshipsdhte.jharkhand.gov.in/', strategy: 'puppeteer', priority: 'medium', scanInterval: 48, category: 'scholarship', region: 'Jharkhand', enabled: true },
  { id: 'wb-banglar', name: 'West Bengal Banglar Shiksha', url: 'https://banglarshiksha.wb.gov.in/scholarships/', strategy: 'puppeteer', priority: 'medium', scanInterval: 48, category: 'scholarship', region: 'West Bengal', enabled: true },
  { id: 'cg-scholarship', name: 'Chhattisgarh Scholarship', url: 'https://schoolscholarship.cg.nic.in/', strategy: 'puppeteer', priority: 'medium', scanInterval: 48, category: 'scholarship', region: 'Chhattisgarh', enabled: true },
  { id: 'mp-scholarship', name: 'MP Scholarship Portal', url: 'https://scholarshipportal.mp.nic.in/', strategy: 'puppeteer', priority: 'medium', scanInterval: 48, category: 'scholarship', region: 'Madhya Pradesh', enabled: true },
  { id: 'odisha-scholarship', name: 'Odisha Scholarship', url: 'https://scholarship.odisha.gov.in/', strategy: 'puppeteer', priority: 'medium', scanInterval: 48, category: 'scholarship', region: 'Odisha', enabled: true },
  { id: 'kerala-egrantz', name: 'Kerala eGrantz', url: 'https://egrantz.kerala.gov.in/', strategy: 'puppeteer', priority: 'medium', scanInterval: 48, category: 'scholarship', region: 'Kerala', enabled: true },
  { id: 'gujarat-digital', name: 'Digital Gujarat', url: 'https://www.digitalgujarat.gov.in/', strategy: 'puppeteer', priority: 'medium', scanInterval: 48, category: 'scheme', region: 'Gujarat', enabled: true },
  { id: 'haryana-scholarship', name: 'Haryana Scholarship', url: 'https://harchhatravratti.highereduhry.ac.in/', strategy: 'puppeteer', priority: 'medium', scanInterval: 48, category: 'scholarship', region: 'Haryana', enabled: true },
  { id: 'punjab-scholarship', name: 'Punjab Scholarships', url: 'https://scholarships.punjab.gov.in/', strategy: 'puppeteer', priority: 'medium', scanInterval: 48, category: 'scholarship', region: 'Punjab', enabled: true },
  { id: 'assam-bidyarthi', name: 'Assam Bidyarthi', url: 'https://bidyarthi.assam.gov.in/', strategy: 'puppeteer', priority: 'medium', scanInterval: 48, category: 'scholarship', region: 'Assam', enabled: true },
  { id: 'rajasthan-shala', name: 'Rajasthan Shala Darpan', url: 'https://rajshaladarpan.nic.in/', strategy: 'cheerio', priority: 'medium', scanInterval: 48, category: 'scheme', region: 'Rajasthan', enabled: true },
  { id: 'wb-oasis', name: 'WB OASIS', url: 'https://oasis.gov.in/', strategy: 'puppeteer', priority: 'medium', scanInterval: 48, category: 'scholarship', region: 'West Bengal', enabled: true },
  { id: 'hp-epass', name: 'HP ePass', url: 'https://hpepass.cgg.gov.in/', strategy: 'puppeteer', priority: 'medium', scanInterval: 48, category: 'scholarship', region: 'Himachal Pradesh', enabled: true },
  { id: 'ts-ekalyan', name: 'Telangana eKalyan', url: 'https://ekalyan.cgg.gov.in/', strategy: 'puppeteer', priority: 'medium', scanInterval: 48, category: 'scholarship', region: 'Telangana', enabled: true },

  // ═══ EDUCATION BOARDS ═══
  { id: 'cbse', name: 'CBSE Academic', url: 'https://cbseacademic.nic.in/', strategy: 'cheerio', priority: 'high', scanInterval: 24, category: 'competition', region: 'national', enabled: true },
  { id: 'ncert', name: 'NCERT', url: 'https://ncert.nic.in/', strategy: 'cheerio', priority: 'high', scanInterval: 24, category: 'academic', region: 'national', enabled: true },

  // ═══ OLYMPIAD & COMPETITION ORGANIZATIONS ═══
  { id: 'hbcse', name: 'HBCSE Olympiad', url: 'https://www.hbcse.tifr.res.in/olympiad', strategy: 'cheerio', priority: 'critical', scanInterval: 12, category: 'olympiad', region: 'national', enabled: true },
  { id: 'sof', name: 'SOF Olympiads', url: 'https://www.sofworld.org/', strategy: 'cheerio', priority: 'high', scanInterval: 24, category: 'olympiad', region: 'national', enabled: true },
  { id: 'unified-council', name: 'Unified Council', url: 'https://www.unifiedcouncil.com/', strategy: 'cheerio', priority: 'high', scanInterval: 24, category: 'olympiad', region: 'national', enabled: true },
  { id: 'crest-olympiads', name: 'CREST Olympiads', url: 'https://www.crestolympiads.com/', strategy: 'cheerio', priority: 'high', scanInterval: 24, category: 'olympiad', region: 'international', enabled: true },
  { id: 'imo-official', name: 'IMO Official', url: 'https://www.imo-official.org/', strategy: 'cheerio', priority: 'high', scanInterval: 48, category: 'olympiad', region: 'international', enabled: true },
  { id: 'iapt', name: 'IAPT Physics', url: 'https://www.iapt.org.in/', strategy: 'cheerio', priority: 'high', scanInterval: 24, category: 'olympiad', region: 'national', enabled: true },
  { id: 'ipho', name: 'IPhO', url: 'https://ipho.org/', strategy: 'cheerio', priority: 'medium', scanInterval: 48, category: 'olympiad', region: 'international', enabled: true },
  { id: 'icho', name: 'IChO', url: 'https://icho.org/', strategy: 'cheerio', priority: 'medium', scanInterval: 48, category: 'olympiad', region: 'international', enabled: true },
  { id: 'ioi', name: 'IOI', url: 'https://ioinformatics.org/', strategy: 'cheerio', priority: 'medium', scanInterval: 48, category: 'olympiad', region: 'international', enabled: true },
  { id: 'ioaa', name: 'IOAA', url: 'https://www.ioaastrophysics.org/', strategy: 'cheerio', priority: 'medium', scanInterval: 48, category: 'olympiad', region: 'international', enabled: true },
  { id: 'ibo', name: 'IBO', url: 'https://www.ibo-info.org/', strategy: 'cheerio', priority: 'medium', scanInterval: 48, category: 'olympiad', region: 'international', enabled: true },
  { id: 'ijso', name: 'IJSO Delegation', url: 'https://www.ijsodelegation.org/', strategy: 'cheerio', priority: 'medium', scanInterval: 48, category: 'olympiad', region: 'international', enabled: true },
  { id: 'kangaroo', name: 'Math Kangaroo India', url: 'http://www.kangaroo.org.in/', strategy: 'cheerio', priority: 'high', scanInterval: 24, category: 'olympiad', region: 'international', enabled: true },
  { id: 'ikmc', name: 'IKMC Kangaroo', url: 'https://ikmc.kangaroo.org/', strategy: 'cheerio', priority: 'medium', scanInterval: 48, category: 'olympiad', region: 'international', enabled: true },
  { id: 'immc', name: 'IMMC Challenge', url: 'https://www.immchallenge.org/', strategy: 'cheerio', priority: 'medium', scanInterval: 48, category: 'olympiad', region: 'international', enabled: true },
  { id: 'brain-bee', name: 'Brain Bee', url: 'https://www.internationalbrainbee.org/', strategy: 'cheerio', priority: 'medium', scanInterval: 48, category: 'competition', region: 'international', enabled: true },
  { id: 'egmo', name: 'EGMO', url: 'https://www.egmo.org/', strategy: 'cheerio', priority: 'medium', scanInterval: 48, category: 'olympiad', region: 'international', enabled: true },
  { id: 'ei-india', name: 'EI India', url: 'https://www.ei-india.com/', strategy: 'cheerio', priority: 'medium', scanInterval: 48, category: 'olympiad', region: 'national', enabled: true },

  // ═══ ROBOTICS & STEM ═══
  { id: 'wro', name: 'World Robot Olympiad', url: 'https://www.wro-association.org/', strategy: 'cheerio', priority: 'high', scanInterval: 24, category: 'competition', region: 'international', enabled: true },
  { id: 'fll', name: 'FIRST LEGO League', url: 'https://www.firstlegoleague.org/', strategy: 'cheerio', priority: 'high', scanInterval: 24, category: 'competition', region: 'international', enabled: true },
  { id: 'nasa-stem', name: 'NASA STEM', url: 'https://www.nasa.gov/stem', strategy: 'cheerio', priority: 'medium', scanInterval: 48, category: 'competition', region: 'international', enabled: true },
  { id: 'google-sciencefair', name: 'Google Science Fair', url: 'https://www.google.com/intl/en_iw/edu/sciencefair/', strategy: 'cheerio', priority: 'high', scanInterval: 48, category: 'competition', region: 'international', enabled: true },
  { id: 'society-science', name: 'Society for Science', url: 'https://www.societyforscience.org/', strategy: 'cheerio', priority: 'high', scanInterval: 24, category: 'competition', region: 'international', enabled: true },
  { id: 'dso', name: 'DSO World', url: 'https://dso.world/', strategy: 'cheerio', priority: 'medium', scanInterval: 48, category: 'olympiad', region: 'international', enabled: true },

  // ═══ SCHOLARSHIP AGGREGATORS ═══
  { id: 'buddy4study', name: 'Buddy4Study', url: 'https://www.buddy4study.com/scholarships', strategy: 'puppeteer', priority: 'critical', scanInterval: 12, category: 'scholarship', region: 'national', enabled: true },
  { id: 'vidyasaarathi', name: 'Vidyasaarathi', url: 'https://www.vidyasaarathi.co.in/', strategy: 'puppeteer', priority: 'high', scanInterval: 24, category: 'scholarship', region: 'national', enabled: true },
  { id: 'unstop', name: 'Unstop', url: 'https://unstop.com/', strategy: 'puppeteer', priority: 'critical', scanInterval: 12, category: 'competition', region: 'national', enabled: true },
  { id: 'internshala', name: 'Internshala', url: 'https://internshala.com/', strategy: 'puppeteer', priority: 'high', scanInterval: 24, category: 'internship', region: 'national', enabled: true },
  { id: 'scholarsbox', name: 'ScholarsBox', url: 'https://scholarsbox.in/', strategy: 'cheerio', priority: 'medium', scanInterval: 24, category: 'scholarship', region: 'national', enabled: true },
  { id: 'edumithra', name: 'EduMithra', url: 'https://edumithra.com/', strategy: 'cheerio', priority: 'medium', scanInterval: 48, category: 'scholarship', region: 'national', enabled: true },
  { id: 'scholarlify', name: 'Scholarlify', url: 'https://scholarlify.com/', strategy: 'cheerio', priority: 'medium', scanInterval: 48, category: 'scholarship', region: 'national', enabled: true },
  { id: 'global-scholarship', name: 'Global Scholarship', url: 'https://www.theglobalscholarship.org/', strategy: 'cheerio', priority: 'medium', scanInterval: 48, category: 'scholarship', region: 'international', enabled: true },

  // ═══ NEWS & EDUCATION PORTALS ═══
  { id: 'careers360', name: 'Careers360 Scholarships', url: 'https://www.careers360.com/scholarships', strategy: 'cheerio', priority: 'high', scanInterval: 24, category: 'scholarship', region: 'national', enabled: true },
  { id: 'shiksha', name: 'Shiksha Scholarships', url: 'https://www.shiksha.com/scholarships-in-india', strategy: 'cheerio', priority: 'high', scanInterval: 24, category: 'scholarship', region: 'national', enabled: true },
  { id: 'collegedekho', name: 'CollegeDekho Scholarships', url: 'https://www.collegedekho.com/scholarships/', strategy: 'cheerio', priority: 'medium', scanInterval: 48, category: 'scholarship', region: 'national', enabled: true },
  { id: 'jagranjosh', name: 'Jagran Josh Scholarships', url: 'https://www.jagranjosh.com/scholarships', strategy: 'cheerio', priority: 'medium', scanInterval: 24, category: 'scholarship', region: 'national', enabled: true },

  // ═══ CORPORATE SCHOLARSHIPS ═══
  { id: 'tcs', name: 'TCS', url: 'https://www.tcs.com/', strategy: 'cheerio', priority: 'medium', scanInterval: 48, category: 'scholarship', region: 'national', enabled: true },
  { id: 'infosys-foundation', name: 'Infosys Foundation', url: 'https://www.infosys.com/infosys-foundation.html', strategy: 'cheerio', priority: 'medium', scanInterval: 48, category: 'scholarship', region: 'national', enabled: true },

  // ═══ UNIVERSITY PORTALS ═══
  { id: 'unipune', name: 'Pune University', url: 'https://www.unipune.ac.in/', strategy: 'cheerio', priority: 'low', scanInterval: 72, category: 'academic', region: 'Maharashtra', enabled: true },
  { id: 'mu', name: 'Mumbai University', url: 'https://mu.ac.in/', strategy: 'cheerio', priority: 'low', scanInterval: 72, category: 'academic', region: 'Maharashtra', enabled: true },
];

// ─── RSS Search Queries (25+ queries in multiple languages) ───
const SEARCH_QUERIES = [
  // English queries
  'scholarships for students India 2025 2026',
  'school student competitions India',
  'government scholarship scheme students',
  'olympiad exam students India registration',
  'internships for school students India',
  'STEM competitions students India',
  'science fair competition school India',
  'essay writing competition students',
  'coding competition school students India',
  'art competition school students India',
  'NTSE KVPY scholarship 2025 2026',
  'sports scholarship students India',
  'merit scholarship school students',
  'SC ST OBC scholarship students',
  'girls scholarship India school',
  'state government scholarship school',
  'national level competition students',
  'quiz competition school students India',
  'mathematics olympiad India school',
  'robotics competition students India',
  // Hindi queries
  'छात्रवृत्ति योजना विद्यार्थी भारत',
  'विद्यार्थी प्रतियोगिता परीक्षा भारत',
  'सरकारी छात्रवृत्ति स्कूल छात्र',
  'ओलंपियाड परीक्षा छात्र पंजीकरण',
  // Marathi queries
  'शिष्यवृत्ती विद्यार्थी महाराष्ट्र योजना',
];

// ─── Helper Functions ───

function getSourcesByPriority(priority) {
  return SOURCES.filter(s => s.enabled && s.priority === priority);
}

function getSourcesByStrategy(strategy) {
  return SOURCES.filter(s => s.enabled && s.strategy === strategy);
}

function getSourcesByRegion(region) {
  return SOURCES.filter(s => s.enabled && (s.region === region || s.region === 'national' || s.region === 'international'));
}

function getSourceById(id) {
  return SOURCES.find(s => s.id === id);
}

function getAllEnabledSources() {
  return SOURCES.filter(s => s.enabled);
}

function getSourcesDueForScan(lastScanTimes = {}) {
  const now = Date.now();
  return SOURCES.filter(s => {
    if (!s.enabled) return false;
    const lastScan = lastScanTimes[s.id] || 0;
    const intervalMs = s.scanInterval * 60 * 60 * 1000;
    return (now - lastScan) >= intervalMs;
  }).sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
  });
}

module.exports = {
  SOURCES,
  SEARCH_QUERIES,
  getSourcesByPriority,
  getSourcesByStrategy,
  getSourcesByRegion,
  getSourceById,
  getAllEnabledSources,
  getSourcesDueForScan,
};
