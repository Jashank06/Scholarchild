'use client';

import { useState } from 'react';
import api from '@/lib/api';

const TYPE_OPTIONS = ['', 'ITI', 'Diploma', 'College', 'University'];

export default function AddInstitutionModal({ open, onClose, onSaved, editInstitution }) {
  const [form, setForm] = useState({
    name: editInstitution?.name || '',
    type: editInstitution?.type || '',
    affiliation: editInstitution?.affiliation || '',
    city: editInstitution?.address?.city || '',
    state: editInstitution?.address?.state || '',
    district: editInstitution?.address?.district || '',
    pincode: editInstitution?.address?.pincode || '',
    email: editInstitution?.contact?.email || '',
    phone: editInstitution?.contact?.phone || '',
    website: editInstitution?.contact?.website || '',
    courses: editInstitution?.courses?.join(', ') || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) { setError('Institution name is required'); return; }
    if (!form.type) { setError('Institution type is required'); return; }
    if (!form.city.trim() && !form.state.trim()) { setError('At least city or state is required'); return; }

    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        type: form.type,
        affiliation: form.affiliation.trim() || undefined,
        address: {
          city: form.city.trim() || undefined,
          state: form.state.trim() || undefined,
          district: form.district.trim() || undefined,
          pincode: form.pincode.trim() || undefined,
        },
        contact: {
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          website: form.website.trim() || undefined,
        },
        courses: form.courses ? form.courses.split(',').map(c => c.trim()).filter(Boolean) : [],
      };

      if (editInstitution) {
        await api.updateInstitution(editInstitution._id, body);
      } else {
        await api.createInstitution(body);
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '20px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#fff', borderRadius: '24px',
        width: '100%', maxWidth: '540px', maxHeight: '92vh',
        overflow: 'auto', boxShadow: '0 40px 100px rgba(0,0,0,0.25)',
      }}>
        <div style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, #00B4DB 0%, #0083B0 100%)',
          color: '#fff',
        }}>
          <h2 style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>
            {editInstitution ? '✏️ Edit Institution' : '🎓 Add an Institution'}
          </h2>
          <p style={{ fontSize: '13px', opacity: 0.85, margin: '6px 0 0' }}>
            {editInstitution ? 'Update institution information' : 'Add ITI, Diploma, College or University'}
          </p>
        </div>

        <form onSubmit={handleSave} style={{ padding: '28px' }}>
          {error && (
            <div style={{ padding: '12px 16px', borderRadius: '12px', background: '#FEF2F2', color: '#DC2626', fontSize: '13px', fontWeight: '600', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          <div style={{ padding: '16px', border: '2px solid #EEF2FF', borderRadius: '16px', background: '#FAFAFE', marginBottom: '24px' }}>
            <p style={{ fontSize: '11px', fontWeight: '800', color: '#6366F1', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Required Fields</p>

            <label style={{ display: 'block', marginBottom: '14px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937', display: 'block', marginBottom: '6px' }}>Institution Name ✱</span>
              <input type="text" placeholder="e.g. IIT Bombay" value={form.name} onChange={(e) => set('name', e.target.value)} style={inp} />
            </label>

            <label style={{ display: 'block', marginBottom: '14px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937', display: 'block', marginBottom: '6px' }}>Type ✱</span>
              <select value={form.type} onChange={(e) => set('type', e.target.value)} style={inp}>
                {TYPE_OPTIONS.map((t) => (<option key={t} value={t}>{t || 'Select type'}</option>))}
              </select>
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937', display: 'block', marginBottom: '6px' }}>City ✱</span>
                <input type="text" placeholder="e.g. Mumbai" value={form.city} onChange={(e) => set('city', e.target.value)} style={inp} />
              </label>
              <label>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937', display: 'block', marginBottom: '6px' }}>State ✱</span>
                <input type="text" placeholder="e.g. Maharashtra" value={form.state} onChange={(e) => set('state', e.target.value)} style={inp} />
              </label>
            </div>
          </div>

          <p style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>Optional Details</p>

          <label style={{ display: 'block', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Affiliation</span>
            <input type="text" placeholder="e.g. AICTE, UGC" value={form.affiliation} onChange={(e) => set('affiliation', e.target.value)} style={inp} />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <label>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>District</span>
              <input type="text" placeholder="District" value={form.district} onChange={(e) => set('district', e.target.value)} style={inp} />
            </label>
            <label>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Pincode</span>
              <input type="text" placeholder="Pincode" value={form.pincode} onChange={(e) => set('pincode', e.target.value)} style={inp} />
            </label>
          </div>

          <label style={{ display: 'block', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Courses (comma separated)</span>
            <input type="text" placeholder="e.g. B.Tech, M.Tech, B.Sc" value={form.courses} onChange={(e) => set('courses', e.target.value)} style={inp} />
          </label>

          <label style={{ marginBottom: '14px', display: 'block' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Email</span>
            <input type="email" placeholder="contact@institute.edu" value={form.email} onChange={(e) => set('email', e.target.value)} style={inp} />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <label>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Phone</span>
              <input type="text" placeholder="Phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} style={inp} />
            </label>
            <label>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Website</span>
              <input type="text" placeholder="Website" value={form.website} onChange={(e) => set('website', e.target.value)} style={inp} />
            </label>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={cancelBtn}>Cancel</button>
            <button type="submit" disabled={saving} style={{ ...saveBtn, background: saving ? '#93C5FD' : '#2563EB', cursor: saving ? 'default' : 'pointer' }}>
              {saving ? 'Saving...' : editInstitution ? '💾 Save Changes' : '➕ Add Institution'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inp = { width: '100%', padding: '11px 14px', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#fff' };
const cancelBtn = { padding: '12px 28px', borderRadius: '100px', border: '1px solid #E5E7EB', background: '#fff', color: '#6B7280', fontWeight: '700', fontSize: '14px', cursor: 'pointer' };
const saveBtn = { padding: '12px 28px', borderRadius: '100px', border: 'none', color: '#fff', fontWeight: '800', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' };
