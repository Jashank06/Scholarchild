'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import styles from '../../dashboard/profile/profile.module.css';

export default function InstitutionProfilePage() {
  const [user, setUser] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

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
        setMessage({ text: '✅ Institution logo updated!', type: 'success' });
      }
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };
  const [form, setForm] = useState({
    institutionName: '', institutionType: 'private', board: '', registrationNumber: '',
    principalName: '', totalStudents: '', website: '', description: '',
    state: '', city: '', district: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const me = await api.getMe();
        setUser(me.user);
        const inst = me.user?.institutionProfile || {};
        const addr = me.user?.profile?.address || {};
        setForm({
          institutionName: inst.institutionName || '',
          institutionType: inst.institutionType || 'private',
          board: inst.board || '',
          registrationNumber: inst.registrationNumber || '',
          principalName: inst.principalName || '',
          totalStudents: inst.totalStudents || '',
          website: inst.website || '',
          description: inst.description || '',
          state: addr.state || '',
          city: addr.city || '',
          district: addr.district || '',
        });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await api.updateProfile({
        firstName: form.institutionName,
        address: { state: form.state, city: form.city, district: form.district },
      });
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}>Loading...</div>;

  const verStatus = user?.institutionProfile?.verificationStatus || 'pending';

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0B0B1A', marginBottom: '8px' }}>School Profile 🏫</h1>
      <p style={{ color: '#6B7280', marginBottom: '32px' }}>Manage your institution's public profile.</p>

      {/* Verification Badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
        borderRadius: '100px', marginBottom: '32px',
        background: verStatus === 'approved' ? '#ECFDF5' : verStatus === 'rejected' ? '#FEF2F2' : '#FFFBEB',
        color: verStatus === 'approved' ? '#059669' : verStatus === 'rejected' ? '#DC2626' : '#D97706',
        fontWeight: '800', fontSize: '13px',
      }}>
        {verStatus === 'approved' ? '✓ Verified Institution' : verStatus === 'rejected' ? '✗ Not Verified' : '⏳ Verification Pending'}
      </div>

      {message.text && (
        <div style={{
          padding: '12px 16px', borderRadius: '12px', marginBottom: '24px', fontWeight: '700', fontSize: '14px',
          background: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          color: message.type === 'success' ? '#059669' : '#DC2626',
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave}>
        {/* Avatar/Logo Section */}
        <section className={styles.avatarSection}>
          <div className={styles.avatarWrapper}>
            <div className={styles.avatarCircleLarge}>
              {avatarPreview || user?.profile?.avatar ? (
                <img src={avatarPreview || api.getImageUrl(user.profile.avatar)} alt="Logo" />
              ) : (
                <span>🏫</span>
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
              <h3>Institution Logo</h3>
              <p>Upload your institution's official logo for better recognition.</p>
            </div>
          </div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
          {[
            { label: 'Institution Name', name: 'institutionName', type: 'text', placeholder: 'ABC Public School' },
            { label: 'Registration Number', name: 'registrationNumber', type: 'text', placeholder: 'SCH/2024/XXXX' },
            { label: 'Principal Name', name: 'principalName', type: 'text', placeholder: 'Dr. Example Name' },
            { label: 'Total Students', name: 'totalStudents', type: 'number', placeholder: '500' },
            { label: 'Website', name: 'website', type: 'url', placeholder: 'https://school.edu.in' },
            { label: 'State', name: 'state', type: 'text', placeholder: 'Maharashtra' },
            { label: 'City', name: 'city', type: 'text', placeholder: 'Mumbai' },
            { label: 'District', name: 'district', type: 'text', placeholder: 'Mumbai' },
          ].map((field, i) => (
            <div key={i}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>
                {field.label}
              </label>
              <input name={field.name} type={field.type} placeholder={field.placeholder} value={form[field.name]} onChange={handleChange}
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '14px', fontSize: '15px', outline: 'none' }}
              />
            </div>
          ))}
          <div>
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>Type</label>
            <select name="institutionType" value={form.institutionType} onChange={handleChange}
              style={{ width: '100%', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '14px', fontSize: '15px' }}>
              <option value="private">Private</option><option value="government">Government</option>
              <option value="aided">Aided</option><option value="autonomous">Autonomous</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>Board</label>
            <select name="board" value={form.board} onChange={handleChange}
              style={{ width: '100%', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '14px', fontSize: '15px' }}>
              <option value="">Select</option><option value="CBSE">CBSE</option><option value="ICSE">ICSE</option>
              <option value="State">State Board</option><option value="IB">IB</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows="4" placeholder="Tell parents about your institution..."
            style={{ width: '100%', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '14px', fontSize: '15px', outline: 'none', resize: 'vertical' }}
          />
        </div>

        <button type="submit" disabled={saving} style={{
          padding: '14px 36px', background: '#2563EB', color: 'white',
          border: 'none', borderRadius: '100px', fontWeight: '800', cursor: 'pointer', fontSize: '15px',
        }}>
          {saving ? 'Saving...' : 'Save Profile →'}
        </button>
      </form>
    </div>
  );
}
