'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import styles from '../../dashboard/profile/profile.module.css';

export default function ParentProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [user, setUser] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [form, setForm] = useState({
    firstName: '', lastName: '', street: '', city: '', district: '', state: '', pincode: '',
    occupation: ''
  });

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: '❌ File too large. Max limit is 5MB.', type: 'error' });
      return;
    }

    setAvatarPreview(URL.createObjectURL(file));
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await api.request('/auth/profile', { method: 'PUT', body: formData });
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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.getMe();
        if (res.user) {
          setUser(res.user);
          const p = res.user.profile || {};
          const addr = p.address || {};
          setForm({
            firstName: p.firstName || '',
            lastName: p.lastName || '',
            street: addr.street || '',
            city: addr.city || '',
            district: addr.district || '',
            state: addr.state || '',
            pincode: addr.pincode || '',
            occupation: res.user.parentProfile?.occupation || ''
          });
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        address: {
          street: form.street, city: form.city, district: form.district,
          state: form.state, pincode: form.pincode
        },
        occupation: form.occupation
      });
      setMessage({ text: '✅ Profile updated successfully!', type: 'success' });
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div className={styles.profilePage}>
      <div className={styles.header}>
        <h1 className={styles.title}>Your Profile 👤</h1>
        <p className={styles.subtitle}>Manage your personal information and contact details.</p>
      </div>

      {message.text && <div className={`${styles.alert} ${styles[message.type]}`}>{message.text}</div>}

      <form onSubmit={handleSave} className={styles.form}>
        {/* Avatar Section */}
        <section className={styles.avatarSection}>
          <div className={styles.avatarWrapper}>
            <div className={styles.avatarCircleLarge}>
              {avatarPreview || user?.profile?.avatar ? (
                <img src={avatarPreview || api.getImageUrl(user.profile.avatar)} alt="Avatar" />
              ) : (
                <span>👨‍👩‍👧</span>
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
              <p>Add a photo to personalize your parent profile.</p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Basic Info</h2>
          <div className={styles.grid}>
            <div className={styles.inputGroup}><label>First Name</label><input name="firstName" value={form.firstName} onChange={handleChange} required /></div>
            <div className={styles.inputGroup}><label>Last Name</label><input name="lastName" value={form.lastName} onChange={handleChange} required /></div>
            <div className={styles.inputGroup}><label>Occupation</label><input name="occupation" value={form.occupation} onChange={handleChange} placeholder="e.g. Teacher, Engineer" /></div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeaderRow}>
            <div>
              <h2 className={styles.sectionTitle}>My Children</h2>
              <p className={styles.sectionSubtitle}>Manage your linked child profiles here.</p>
            </div>
            <button type="button" className={styles.manageBtn} onClick={() => window.location.href='/parent/children'}>Manage →</button>
          </div>
          <div className={styles.childrenGrid}>
            {(user?.parentProfile?.children || []).length === 0 ? (
              <div className={styles.emptyState}>No children linked yet.</div>
            ) : (user?.parentProfile?.children || []).map((child, i) => (
              <div key={i} className={styles.childCard}>
                <div className={styles.childBadge}>👶</div>
                <div>
                  <div className={styles.childName}>Child {i + 1}</div>
                  <div className={styles.childMeta}>{child.relationship || 'Child'} • Linked {new Date(child.linkedAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Location</h2>
          <div className={styles.grid}>
            <div className={styles.inputGroup}><label>City</label><input name="city" value={form.city} onChange={handleChange} /></div>
            <div className={styles.inputGroup}><label>State</label><input name="state" value={form.state} onChange={handleChange} /></div>
          </div>
        </section>

        <button type="submit" disabled={saving} className={styles.saveBtn}>
          {saving ? 'Saving...' : 'Save Profile Changes 🚀'}
        </button>
      </form>
    </div>
  );
}
