'use client';

import { useState } from 'react';
import api from '@/lib/api';

const BOARD_OPTIONS = ['', 'CBSE', 'ICSE', 'State', 'IB', 'IGCSE', 'Other'];
const TYPE_OPTIONS = ['', 'government', 'private', 'aided'];

export default function AddSchoolModal({ open, onClose, onSaved, editSchool }) {
  const [form, setForm] = useState({
    name: editSchool?.name || '',
    board: editSchool?.board || '',
    type: editSchool?.type || '',
    city: editSchool?.address?.city || '',
    state: editSchool?.address?.state || '',
    district: editSchool?.address?.district || '',
    pincode: editSchool?.address?.pincode || '',
    email: editSchool?.contact?.email || '',
    phone: editSchool?.contact?.phone || '',
    website: editSchool?.contact?.website || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) { setError('School name is required'); return; }
    if (!form.city.trim() && !form.state.trim()) { setError('At least city or state is required'); return; }

    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        board: form.board || undefined,
        type: form.type || undefined,
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
      };

      if (editSchool) {
        await api.updateSchool(editSchool._id, body);
      } else {
        await api.createSchool(body);
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
        {/* Header */}
        <div style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
          color: '#fff',
        }}>
          <h2 style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>
            {editSchool ? '✏️ Edit School' : '🏫 Add a School'}
          </h2>
          <p style={{ fontSize: '13px', opacity: 0.85, margin: '6px 0 0' }}>
            {editSchool ? 'Update school information' : 'Help build the school directory'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} style={{ padding: '28px' }}>
          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: '12px',
              background: '#FEF2F2', color: '#DC2626',
              fontSize: '13px', fontWeight: '600', marginBottom: '20px',
            }}>
              {error}
            </div>
          )}

          {/* Required fields */}
          <div style={{
            padding: '16px', border: '2px solid #EEF2FF', borderRadius: '16px',
            background: '#FAFAFE', marginBottom: '24px',
          }}>
            <p style={{ fontSize: '11px', fontWeight: '800', color: '#6366F1', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
              Required Fields
            </p>

            <label style={{ display: 'block', marginBottom: '14px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937', display: 'block', marginBottom: '6px' }}>
                School Name ✱
              </span>
              <input
                type="text" placeholder="e.g. Delhi Public School"
                value={form.name} onChange={(e) => set('name', e.target.value)}
                style={inputStyle}
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937', display: 'block', marginBottom: '6px' }}>
                  City ✱
                </span>
                <input
                  type="text" placeholder="e.g. Mumbai"
                  value={form.city} onChange={(e) => set('city', e.target.value)}
                  style={inputStyle}
                />
              </label>
              <label>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937', display: 'block', marginBottom: '6px' }}>
                  State ✱
                </span>
                <input
                  type="text" placeholder="e.g. Maharashtra"
                  value={form.state} onChange={(e) => set('state', e.target.value)}
                  style={inputStyle}
                />
              </label>
            </div>
          </div>

          {/* Optional fields */}
          <p style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
            Optional Details
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <label>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Board</span>
              <select value={form.board} onChange={(e) => set('board', e.target.value)} style={inputStyle}>
                {BOARD_OPTIONS.map((b) => (
                  <option key={b} value={b}>{b || 'Select board'}</option>
                ))}
              </select>
            </label>
            <label>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Type</span>
              <select value={form.type} onChange={(e) => set('type', e.target.value)} style={inputStyle}>
                {TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t ? t.charAt(0).toUpperCase() + t.slice(1) : 'Select type'}</option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <label>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>District</span>
              <input type="text" placeholder="e.g. Mumbai Suburban" value={form.district} onChange={(e) => set('district', e.target.value)} style={inputStyle} />
            </label>
            <label>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Pincode</span>
              <input type="text" placeholder="e.g. 400001" value={form.pincode} onChange={(e) => set('pincode', e.target.value)} style={inputStyle} />
            </label>
          </div>

          <label style={{ marginBottom: '14px', display: 'block' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Email</span>
            <input type="email" placeholder="contact@school.edu" value={form.email} onChange={(e) => set('email', e.target.value)} style={inputStyle} />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <label>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Phone</span>
              <input type="text" placeholder="e.g. +91 98765 43210" value={form.phone} onChange={(e) => set('phone', e.target.value)} style={inputStyle} />
            </label>
            <label>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Website</span>
              <input type="text" placeholder="e.g. dps.edu" value={form.website} onChange={(e) => set('website', e.target.value)} style={inputStyle} />
            </label>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button" onClick={onClose}
              style={{
                padding: '12px 28px', borderRadius: '100px', border: '1px solid #E5E7EB',
                background: '#fff', color: '#6B7280', fontWeight: '700', fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit" disabled={saving}
              style={{
                padding: '12px 28px', borderRadius: '100px', border: 'none',
                background: saving ? '#93C5FD' : '#2563EB', color: '#fff',
                fontWeight: '800', fontSize: '14px', cursor: saving ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              {saving ? 'Saving...' : editSchool ? '💾 Save Changes' : '➕ Add School'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '11px 14px',
  border: '1px solid #E5E7EB', borderRadius: '12px',
  fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  background: '#fff',
};
