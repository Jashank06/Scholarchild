const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const connectDB = require('../config/db');
const Opportunity = require('../models/Opportunity');
const User = require('../models/User');

const opportunities = [
  {
    type: 'scholarship', title: 'NTSE Stage-1 Scholarship 2026', description: 'National Talent Search Examination for Grade 10 students. A prestigious scholarship by NCERT.', shortDescription: 'Merit scholarship for Grade 10 students across India.',
    organizer: { name: 'NCERT, Government of India', type: 'government', level: 'national' },
    category: 'academic', tags: ['NTSE', 'merit', 'national', 'grade-10'],
    eligibility: { grades: [10], gender: 'all', categories: ['General', 'OBC', 'SC', 'ST', 'EWS'], minPercentage: 55 },
    rewards: { type: 'cash', cashAmount: 1250, description: '₹1,250/month till completion of PhD' },
    dates: { applicationStart: new Date('2026-04-01'), applicationDeadline: new Date('2026-06-30'), examDate: new Date('2026-11-05') },
    application: { mode: 'external', externalLink: 'https://ncert.nic.in/ntse.php', isFree: true },
    isVerified: true, status: 'active',
  },
  {
    type: 'scholarship', title: 'PM YASASVI Scholarship Scheme', description: 'PM Young Achievers Scholarship Award for OBC, EBC, and DNT students.', shortDescription: 'Scholarship for OBC/EBC/DNT students.',
    organizer: { name: 'Ministry of Social Justice & Empowerment', type: 'government', level: 'national' },
    category: 'academic', tags: ['YASASVI', 'OBC', 'need-based', 'government'],
    eligibility: { grades: [9, 10, 11, 12], categories: ['OBC', 'EWS'], maxFamilyIncome: 250000 },
    rewards: { type: 'cash', cashAmount: 75000, description: '₹75,000/year' },
    dates: { applicationStart: new Date('2026-05-01'), applicationDeadline: new Date('2026-07-31') },
    application: { mode: 'external', externalLink: 'https://yet.nta.ac.in', isFree: true },
    isVerified: true, status: 'active',
  },
  {
    type: 'scholarship', title: 'KVPY Fellowship Program', description: 'Kishore Vaigyanik Protsahan Yojana for science students.', shortDescription: 'Science fellowship for Grade 11-12.',
    organizer: { name: 'IISc Bangalore', type: 'institution', level: 'national' },
    category: 'science', tags: ['KVPY', 'science', 'fellowship', 'IISc'],
    eligibility: { grades: [11, 12], categories: ['General', 'OBC', 'SC', 'ST'], minPercentage: 60 },
    rewards: { type: 'cash', cashAmount: 7000, description: '₹5,000–7,000/month fellowship' },
    dates: { applicationStart: new Date('2026-06-01'), applicationDeadline: new Date('2026-08-15') },
    application: { mode: 'external', isFree: true },
    isVerified: true, status: 'active',
  },
  {
    type: 'competition', title: 'International Math Olympiad (IMO)', description: 'One of the most prestigious math competitions globally.', shortDescription: 'Math olympiad for all grades.',
    organizer: { name: 'Science Olympiad Foundation', type: 'institution', level: 'international' },
    category: 'olympiad', tags: ['IMO', 'math', 'olympiad', 'international'],
    eligibility: { grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    rewards: { type: 'mixed', cashAmount: 50000, description: '₹50,000 + Gold Medal + Certificate' },
    dates: { applicationStart: new Date('2026-05-01'), applicationDeadline: new Date('2026-07-15'), examDate: new Date('2026-12-10') },
    application: { mode: 'external', applicationFee: 125, isFree: false },
    isVerified: true, status: 'active',
  },
  {
    type: 'competition', title: 'National Science Olympiad (NSO)', description: 'National level science competition by SOF.', shortDescription: 'Science olympiad for all grades.',
    organizer: { name: 'Science Olympiad Foundation', type: 'institution', level: 'national' },
    category: 'science', tags: ['NSO', 'science', 'olympiad'],
    eligibility: { grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    rewards: { type: 'mixed', cashAmount: 50000, description: '₹50,000 + Medal' },
    dates: { applicationDeadline: new Date('2026-08-20'), examDate: new Date('2026-11-20') },
    application: { mode: 'external', applicationFee: 125, isFree: false },
    isVerified: true, status: 'active',
  },
  {
    type: 'competition', title: 'INSPIRE Awards – MANAK', description: 'Million minds Augmenting National Aspirations — innovation awards.', shortDescription: 'Innovation awards for Grade 6-10.',
    organizer: { name: 'Dept. of Science & Technology', type: 'government', level: 'national' },
    category: 'science', tags: ['INSPIRE', 'innovation', 'MANAK'],
    eligibility: { grades: [6, 7, 8, 9, 10] },
    rewards: { type: 'mixed', cashAmount: 10000, description: '₹10,000 + mentorship' },
    dates: { applicationDeadline: new Date('2026-06-05') },
    application: { mode: 'external', isFree: true },
    isVerified: true, status: 'active',
  },
  {
    type: 'scheme', title: 'Samagra Shiksha Abhiyan', description: 'Comprehensive education scheme for holistic school development.', shortDescription: 'Free education scheme for govt. school students.',
    organizer: { name: 'Ministry of Education', type: 'government', level: 'national' },
    category: 'general', tags: ['education', 'free', 'welfare'],
    eligibility: { grades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    rewards: { type: 'recognition', description: 'Free education, textbooks, uniforms' },
    dates: {},
    application: { mode: 'external', isFree: true },
    isVerified: true, status: 'active',
  },
  {
    type: 'scheme', title: 'National Means-cum-Merit Scholarship', description: 'For Grade 8 students with merit and financial need.', shortDescription: 'Merit + need based for Grade 8.',
    organizer: { name: 'MHRD', type: 'government', level: 'national' },
    category: 'academic', tags: ['NMMS', 'merit', 'need-based'],
    eligibility: { grades: [8], maxFamilyIncome: 350000, minPercentage: 55 },
    rewards: { type: 'cash', cashAmount: 12000, description: '₹12,000/year for Grade 9-12' },
    dates: { applicationDeadline: new Date('2026-09-15') },
    application: { mode: 'external', isFree: true },
    isVerified: true, status: 'active',
  },
  {
    type: 'scholarship', title: 'INSPIRE Scholarship for Higher Education', description: 'For top 1% in Grade 12 board exams pursuing science.', shortDescription: 'Fellowship for science students.',
    organizer: { name: 'DST, Government of India', type: 'government', level: 'national' },
    category: 'science', tags: ['INSPIRE', 'SHE', 'science'],
    eligibility: { grades: [12], minPercentage: 95 },
    rewards: { type: 'cash', cashAmount: 80000, description: '₹80,000/year' },
    dates: { applicationDeadline: new Date('2026-08-31') },
    application: { mode: 'external', isFree: true },
    isVerified: true, status: 'active',
  },
  {
    type: 'competition', title: 'Atal Tinkering Lab Innovation Marathon', description: 'National innovation challenge for ATL schools.', shortDescription: 'Innovation marathon by NITI Aayog.',
    organizer: { name: 'NITI Aayog', type: 'government', level: 'national' },
    category: 'coding', tags: ['ATL', 'innovation', 'tinkering'],
    eligibility: { grades: [6, 7, 8, 9, 10, 11, 12] },
    rewards: { type: 'mixed', cashAmount: 100000, description: '₹1,00,000 + incubation' },
    dates: { applicationDeadline: new Date('2026-07-30') },
    application: { mode: 'external', isFree: true },
    isVerified: true, status: 'active',
  },
];

async function seed() {
  try {
    await connectDB();
    console.log('🗑️  Clearing existing data...');
    // Drop old indexes to avoid stale compound index issues
    try { await Opportunity.collection.dropIndexes(); } catch(e) {}
    await Opportunity.deleteMany({});

    console.log('🌱 Seeding opportunities...');
    await Opportunity.insertMany(opportunities);
    console.log(`✅ Seeded ${opportunities.length} opportunities`);

    // Create a test admin user
    try { await User.collection.dropIndexes(); } catch(e) {}
    await User.deleteMany({});

    const admin = new User({
      email: 'admin@vidyapath.in', phone: '+919999999999', role: 'admin', isVerified: true,
      password: 'admin123', profile: { firstName: 'Admin', lastName: 'VidyaPath' },
    });
    await admin.save();
    console.log('✅ Created admin user: admin@vidyapath.in / admin123');

    const student = new User({
      email: 'priya@test.com', phone: '+919876543210', role: 'student', isVerified: true,
      password: 'test123',
      profile: {
        firstName: 'Priya', lastName: 'Sharma', grade: 10, board: 'CBSE',
        schoolName: 'DAV Public School', gender: 'female',
        address: { city: 'Jaipur', district: 'Jaipur', state: 'Rajasthan', pincode: '302001' },
        familyIncome: 450000, category: 'General', previousGradePercentage: 94.5,
        interests: ['science', 'academic', 'olympiad', 'coding'],
      },
      gamification: { xp: 2450, level: 5, badges: [
        { badgeId: 'first_login', badgeName: 'First Steps', badgeIcon: '🌟' },
        { badgeId: 'streak_7', badgeName: '7-Day Streak', badgeIcon: '🔥' },
        { badgeId: 'five_applications', badgeName: 'Application Star', badgeIcon: '⭐' },
        { badgeId: 'first_win', badgeName: 'Winner', badgeIcon: '🏆' },
      ], streakDays: 12 },
      profileScore: 92,
    });
    await student.save();
    console.log('✅ Created test student: priya@test.com / test123');

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
}

seed();
