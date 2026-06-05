export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
];

export const CASTE_CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS'];

export const GENDER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

export const INCOME_SLABS = [
  { value: '100000', label: 'Below ₹1L' },
  { value: '250000', label: '₹1L – ₹2.5L' },
  { value: '500000', label: '₹2.5L – ₹5L' },
  { value: '999999999', label: 'Above ₹5L' },
];

export const ORGANIZER_TYPES = [
  { value: 'government', label: 'Government' },
  { value: 'ngo', label: 'NGO' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'trust', label: 'Trust' },
  { value: 'institution', label: 'Institution' },
];

export const LEVELS = [
  { value: 'school', label: 'School' },
  { value: 'district', label: 'District' },
  { value: 'state', label: 'State' },
  { value: 'national', label: 'National' },
  { value: 'international', label: 'International' },
];

export const REWARD_TYPES = [
  { value: 'cash', label: 'Cash' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'recognition', label: 'Recognition' },
  { value: 'mixed', label: 'Mixed' },
  { value: 'prize', label: 'Prize' },
];

export const MODE_OPTIONS = [
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
  { value: 'both', label: 'Both' },
];

export const SORT_OPTIONS = [
  { value: 'deadline', label: 'Deadline' },
  { value: 'newest', label: 'Newest' },
  { value: 'match', label: 'Match Score' },
  { value: 'popular', label: 'Popular' },
  { value: 'reward', label: 'Reward' },
];

export const DEADLINE_FILTERS = [
  { value: '', label: 'All Deadlines' },
  { value: 'urgent', label: '🔴 Urgent (≤7 days)' },
  { value: 'upcoming', label: '🕐 Upcoming' },
];

export const ALL_GRADES = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `Grade ${i + 1}`,
}));
