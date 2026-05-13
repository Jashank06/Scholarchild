'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import styles from '../../dashboard/profile/profile.module.css';

export default function InstitutionSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [activeTab, setActiveTab] = useState('profile');
  const [form, setForm] = useState({
    institutionName: '', institutionType: 'private', registrationNumber: '',
    principalName: '', board: 'CBSE', website: '', description: '',
    street: '', city: '', district: '', state: '', pincode: '',
    phone: '', email: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.getMe();
        if (res.user) {
          const inst = res.user.institutionProfile || {};
          const p = res.user.profile || {};
          const addr = p.address || {};
          setForm({
            institutionName: inst.institutionName || '',
            institutionType: inst.institutionType || 'private',
            registrationNumber: inst.registrationNumber || '',
            principalName: inst.principalName || '',
            board: inst.board || 'CBSE',
            website: inst.website || '',
            description: inst.description || '',
            street: addr.street || '',
            city: addr.city || '',
            district: addr.district || '',
            state: addr.state || '',
            pincode: addr.pincode || '',
            phone: res.user.phone || '',
            email: res.user.email || ''
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
      const payload = {
        institutionName: form.institutionName,
        institutionType: form.institutionType,
        registrationNumber: form.registrationNumber,
        principalName: form.principalName,
        board: form.board,
        website: form.website,
        description: form.description,
        address: {
          street: form.street, city: form.city, district: form.district,
          state: form.state, pincode: form.pincode
        }
      };
      await api.updateProfile(payload);
      setMessage({ text: '✅ Institution settings updated successfully!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}>Loading Settings...</div>;

  return (
    <div className={styles.profilePage}>
      <div className={styles.header}>
        <h1 className={styles.title}>Institution Settings ⚙️</h1>
        <p className={styles.subtitle}>Manage your institution's profile, verification, and preferences.</p>
      </div>

      {message.text && <div className={`${styles.alert} ${styles[message.type]}`}>{message.text}</div>}

      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        {['profile', 'security', 'branding'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 24px', borderRadius: '100px', border: 'none', fontWeight: '800',
              background: activeTab === tab ? '#2563EB' : '#F3F4F6',
              color: activeTab === tab ? 'white' : '#6B7280',
              textTransform: 'capitalize', cursor: 'pointer'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className={styles.form}>
        {activeTab === 'profile' && (
          <>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>🏫 General Information</h2>
              <div className={styles.grid}>
                <div className={styles.inputGroup}><label>Institution Name</label><input name="institutionName" value={form.institutionName} onChange={handleChange} required /></div>
                <div className={styles.inputGroup}><label>Principal Name</label><input name="principalName" value={form.principalName} onChange={handleChange} /></div>
                <div className={styles.inputGroup}>
                  <label>Institution Type</label>
                  <select name="institutionType" value={form.institutionType} onChange={handleChange}>
                    <option value="government">Government</option><option value="private">Private</option><option value="aided">Aided</option>
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Educational Board</label>
                  <select name="board" value={form.board} onChange={handleChange}>
                    <option value="CBSE">CBSE</option><option value="ICSE">ICSE</option><option value="State">State Board</option>
                  </select>
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>📍 Location</h2>
              <div className={styles.grid}>
                <div className={styles.inputGroup}><label>City</label><input name="city" value={form.city} onChange={handleChange} /></div>
                <div className={styles.inputGroup}><label>District</label><input name="district" value={form.district} onChange={handleChange} /></div>
                <div className={styles.inputGroup}><label>State</label><input name="state" value={form.state} onChange={handleChange} /></div>
                <div className={styles.inputGroup}><label>Pincode</label><input name="pincode" value={form.pincode} onChange={handleChange} /></div>
              </div>
            </section>
          </>
        )}

        {activeTab === 'security' && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>🔐 Security & Credentials</h2>
            <div className={styles.grid}>
              <div className={styles.inputGroup}><label>Admin Email</label><input value={form.email} disabled /></div>
              <div className={styles.inputGroup}><label>Admin Phone</label><input value={form.phone} disabled /></div>
              <div className={styles.inputGroup}><label>New Password</label><input type="password" placeholder="••••••••" /></div>
            </div>
            <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '16px' }}>* Email and Phone can only be changed by contacting support for security reasons.</p>
          </section>
        )}

        {activeTab === 'branding' && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>✨ Branding & Web</h2>
            <div className={styles.grid}>
              <div className={styles.inputGroup}><label>Official Website</label><input name="website" value={form.website} onChange={handleChange} placeholder="https://..." /></div>
            </div>
            <div className={styles.inputGroup} style={{ marginTop: '20px' }}>
              <label>Institution Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows="4" placeholder="Tell students about your institution..." />
            </div>
          </section>
        )}

        <button type="submit" disabled={saving} className={styles.saveBtn}>
          {saving ? 'Updating Settings...' : 'Save Changes 🚀'}
        </button>
      </form>
    </div>
  );
}
