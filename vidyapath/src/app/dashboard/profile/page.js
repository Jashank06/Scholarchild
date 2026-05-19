'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import styles from './profile.module.css';

const BOARDS = ['CBSE', 'ICSE', 'State', 'IB', 'IGCSE', 'Other'];
const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS', 'Other'];
const INTERESTS = ['academic', 'arts', 'science', 'quiz', 'olympiad', 'coding', 'writing', 'debate', 'music', 'other'];

export default function StudentProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [user, setUser] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [form, setForm] = useState({
    firstName: '', lastName: '', dateOfBirth: '', gender: '',
    grade: '', board: '', schoolName: '', mediumOfInstruction: '',
    street: '', city: '', district: '', state: '', pincode: '', country: '',
    schoolStreet: '', schoolCity: '', schoolState: '', schoolPincode: '', schoolCountry: '',
    familyIncome: '', category: '', religion: '', parentOccupation: '',
    previousGradePercentage: '', achievements: '', interests: []
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Client-side size check (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: '❌ File too large. Max limit is 5MB.', type: 'error' });
      return;
    }

    setAvatarPreview(URL.createObjectURL(file));
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await api.request('/auth/profile', {
        method: 'PUT',
        body: formData,
      });
      if (res.success) {
        setUser(res.user);
        setMessage({ text: '✅ Profile picture updated!', type: 'success' });
      }
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await api.getMe();
      if (res.user) {
        setUser(res.user);
        const p = res.user.profile || {};
        const addr = p.address || {};
        const schoolAddr = p.schoolAddress || {};
        setForm({
          firstName: p.firstName || '',
          lastName: p.lastName || '',
          dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth).toISOString().split('T')[0] : '',
          gender: p.gender || '',
          grade: p.grade || '',
          board: p.board || '',
          schoolName: p.schoolName || '',
          mediumOfInstruction: p.mediumOfInstruction || '',
          street: addr.street || '',
          city: addr.city || '',
          district: addr.district || '',
          state: addr.state || '',
          pincode: addr.pincode || '',
          country: addr.country || '',
          schoolStreet: schoolAddr.street || '',
          schoolCity: schoolAddr.city || '',
          schoolState: schoolAddr.state || '',
          schoolPincode: schoolAddr.pincode || '',
          schoolCountry: schoolAddr.country || '',
          familyIncome: p.familyIncome || '',
          category: p.category || '',
          religion: p.religion || '',
          parentOccupation: p.parentOccupation || '',
          previousGradePercentage: p.previousGradePercentage || '',
          achievements: p.achievements?.join(', ') || '',
          interests: p.interests || []
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleInterestToggle = (interest) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        grade: parseInt(form.grade),
        board: form.board,
        schoolName: form.schoolName,
        mediumOfInstruction: form.mediumOfInstruction,
        address: {
          street: form.street,
          city: form.city,
          district: form.district,
          state: form.state,
          pincode: form.pincode,
          country: form.country
        },
        schoolAddress: {
          street: form.schoolStreet,
          city: form.schoolCity,
          state: form.schoolState,
          pincode: form.schoolPincode,
          country: form.schoolCountry,
        },
        familyIncome: parseInt(form.familyIncome),
        category: form.category,
        religion: form.religion,
        parentOccupation: form.parentOccupation,
        previousGradePercentage: parseFloat(form.previousGradePercentage),
        achievements: form.achievements.split(',').map(a => a.trim()).filter(a => a),
        interests: form.interests
      };

      const res = await api.updateProfile(payload);
      if (res.success) {
        setMessage({ text: '✅ Profile updated successfully! Your score has increased.', type: 'success' });
        setUser(res.user);
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      }
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading Profile...</div>;

  return (
    <div className={styles.profilePage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Complete Your Profile 💎</h1>
          <p className={styles.subtitle}>A complete profile increases your scholarship match accuracy by 95%.</p>
        </div>
        <div className={styles.scoreCard}>
          <div className={styles.scoreRing}>
            <svg viewBox="0 0 36 36" className={styles.circularChart}>
              <path className={styles.circleBg} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className={styles.circle} strokeDasharray={`${user?.profileScore || 0}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <text x="18" y="20.35" className={styles.percentage}>{user?.profileScore || 0}%</text>
            </svg>
          </div>
          <div className={styles.scoreText}>Profile Score</div>
        </div>
      </div>

      {message.text && (
        <div className={`${styles.alert} ${styles[message.type]}`}>{message.text}</div>
      )}

      <form onSubmit={handleSave} className={styles.form}>
        {/* Avatar Section */}
        <section className={styles.avatarSection}>
          <div className={styles.avatarWrapper}>
            <div className={styles.avatarCircleLarge}>
              {avatarPreview || user?.profile?.avatar ? (
                <img src={avatarPreview || api.getImageUrl(user.profile.avatar)} alt="Avatar" />
              ) : (
                <span>🧑‍🎓</span>
              )}
              <label htmlFor="avatar-upload" className={styles.avatarEditBtn}>
                📸
              </label>
            </div>
            <input 
              id="avatar-upload"
              type="file" 
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
            <div className={styles.avatarInfo}>
              <h3>Profile Picture</h3>
              <p>Upload a professional photo for your profile.</p>
            </div>
          </div>
        </section>

        {/* Personal Information */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>👤 Personal Information</h2>
          <div className={styles.grid}>
            <div className={styles.inputGroup}>
              <label>First Name</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} required />
            </div>
            <div className={styles.inputGroup}>
              <label>Last Name</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} required />
            </div>
            <div className={styles.inputGroup}>
              <label>Date of Birth</label>
              <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} />
            </div>
            <div className={styles.inputGroup}>
              <label>Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange}>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </section>

        {/* Academic Details */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🎓 Academic Details</h2>
          <div className={styles.grid}>
            <div className={styles.inputGroup}>
              <label>Current Grade</label>
              <select name="grade" value={form.grade} onChange={handleChange}>
                <option value="">Select Grade</option>
                {[...Array(12)].map((_, i) => <option key={i} value={i+1}>Grade {i+1}</option>)}
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label>Educational Board</label>
              <select name="board" value={form.board} onChange={handleChange}>
                <option value="">Select Board</option>
                {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label>School Name</label>
              <input name="schoolName" value={form.schoolName} onChange={handleChange} placeholder="Current school" />
            </div>
            <div className={styles.inputGroup}>
              <label>Medium of Instruction</label>
              <input name="mediumOfInstruction" value={form.mediumOfInstruction} onChange={handleChange} placeholder="e.g. English, Hindi" />
            </div>
            <div className={styles.inputGroup}>
              <label>Previous Year %</label>
              <input name="previousGradePercentage" type="number" step="0.01" value={form.previousGradePercentage} onChange={handleChange} placeholder="e.g. 85.5" />
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🏫 School Address</h2>
          <div className={styles.grid}>
            <div className={styles.inputGroup}>
              <label>Address</label>
              <input name="schoolStreet" value={form.schoolStreet} onChange={handleChange} placeholder="School address" />
            </div>
            <div className={styles.inputGroup}>
              <label>City</label>
              <input name="schoolCity" value={form.schoolCity} onChange={handleChange} />
            </div>
            <div className={styles.inputGroup}>
              <label>State</label>
              <input name="schoolState" value={form.schoolState} onChange={handleChange} />
            </div>
            <div className={styles.inputGroup}>
              <label>Pin Code</label>
              <input name="schoolPincode" value={form.schoolPincode} onChange={handleChange} />
            </div>
            <div className={styles.inputGroup}>
              <label>Country</label>
              <input name="schoolCountry" value={form.schoolCountry} onChange={handleChange} />
            </div>
          </div>
        </section>

        {/* Family & Social */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🏠 Family & Social Info</h2>
          <div className={styles.grid}>
            <div className={styles.inputGroup}>
              <label>Annual Family Income (₹)</label>
              <input name="familyIncome" type="number" value={form.familyIncome} onChange={handleChange} placeholder="e.g. 200000" />
            </div>
            <div className={styles.inputGroup}>
              <label>Category</label>
              <select name="category" value={form.category} onChange={handleChange}>
                <option value="">Select Category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label>Religion</label>
              <input name="religion" value={form.religion} onChange={handleChange} />
            </div>
            <div className={styles.inputGroup}>
              <label>Parent's Occupation</label>
              <input name="parentOccupation" value={form.parentOccupation} onChange={handleChange} />
            </div>
          </div>
        </section>

        {/* Home Address */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>🏠 Home Address</h2>
          <div className={styles.grid}>
            <div className={styles.inputGroup}>
              <label>Street Address</label>
              <input name="street" value={form.street} onChange={handleChange} />
            </div>
            <div className={styles.inputGroup}>
              <label>City / Village</label>
              <input name="city" value={form.city} onChange={handleChange} />
            </div>
            <div className={styles.inputGroup}>
              <label>District</label>
              <input name="district" value={form.district} onChange={handleChange} />
            </div>
            <div className={styles.inputGroup}>
              <label>State</label>
              <input name="state" value={form.state} onChange={handleChange} />
            </div>
            <div className={styles.inputGroup}>
              <label>Pincode</label>
              <input name="pincode" value={form.pincode} onChange={handleChange} />
            </div>
            <div className={styles.inputGroup}>
              <label>Country</label>
              <input name="country" value={form.country} onChange={handleChange} />
            </div>
          </div>
        </section>

        {/* Interests */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>✨ Interests & Achievements</h2>
          <div className={styles.interestsGrid}>
            {INTERESTS.map(interest => (
              <div 
                key={interest} 
                className={`${styles.interestTag} ${form.interests.includes(interest) ? styles.activeInterest : ''}`}
                onClick={() => handleInterestToggle(interest)}
              >
                {interest.charAt(0).toUpperCase() + interest.slice(1)}
              </div>
            ))}
          </div>
          <div className={styles.inputGroup} style={{ marginTop: '20px' }}>
            <label>Achievements (Comma separated)</label>
            <textarea name="achievements" value={form.achievements} onChange={handleChange} rows="3" placeholder="State winner in quiz, 1st in singing competition..." />
          </div>
        </section>

        <div className={styles.actions}>
          <button type="submit" disabled={saving} className={styles.saveBtn}>
            {saving ? 'Updating Profile...' : 'Save Profile Changes 🚀'}
          </button>
        </div>
      </form>
    </div>
  );
}
