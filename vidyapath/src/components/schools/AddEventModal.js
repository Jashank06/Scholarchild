'use client';

import { useState } from 'react';
import api from '@/lib/api';

const CATEGORY_OPTIONS = ['', 'Sports', 'Cultural', 'Competition', 'Workshop', 'Other'];
const STATUS_OPTIONS = ['upcoming', 'ongoing', 'completed', 'cancelled'];

export default function AddEventModal({ open, onClose, onSaved, editEvent }) {
  const [form, setForm] = useState({
    name: editEvent?.name || '',
    category: editEvent?.category || '',
    description: editEvent?.description || '',
    eventDate: editEvent?.eventDate ? editEvent.eventDate.slice(0, 10) : '',
    registrationDeadline: editEvent?.registrationDeadline ? editEvent.registrationDeadline.slice(0, 10) : '',
    city: editEvent?.venue?.city || '',
    state: editEvent?.venue?.state || '',
    fullAddress: editEvent?.venue?.fullAddress || '',
    organizerName: editEvent?.organizer?.name || '',
    organizerContact: editEvent?.organizer?.contact || '',
    organizerWebsite: editEvent?.organizer?.website || '',
    eligibility: editEvent?.eligibility || '',
    prizes: editEvent?.prizes || '',
    fees: editEvent?.fees ?? '',
    status: editEvent?.status || 'upcoming',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) { setError('Event name is required'); return; }
    if (!form.category) { setError('Event category is required'); return; }
    if (!form.city.trim() && !form.state.trim()) { setError('At least city or state is required'); return; }

    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        category: form.category,
        description: form.description.trim() || undefined,
        eventDate: form.eventDate || undefined,
        registrationDeadline: form.registrationDeadline || undefined,
        venue: {
          city: form.city.trim() || undefined,
          state: form.state.trim() || undefined,
          fullAddress: form.fullAddress.trim() || undefined,
        },
        organizer: {
          name: form.organizerName.trim() || undefined,
          contact: form.organizerContact.trim() || undefined,
          website: form.organizerWebsite.trim() || undefined,
        },
        eligibility: form.eligibility.trim() || undefined,
        prizes: form.prizes.trim() || undefined,
        fees: form.fees !== '' ? Number(form.fees) : 0,
        status: form.status,
      };

      if (editEvent) {
        await api.updateEvent(editEvent._id, body);
      } else {
        await api.createEvent(body);
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
          background: 'linear-gradient(135deg, #F093FB 0%, #F5576C 100%)',
          color: '#fff',
        }}>
          <h2 style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>
            {editEvent ? '✏️ Edit Event' : '🎪 Add an Event'}
          </h2>
          <p style={{ fontSize: '13px', opacity: 0.85, margin: '6px 0 0' }}>
            {editEvent ? 'Update event information' : 'Add sports, cultural events & competitions'}
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
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937', display: 'block', marginBottom: '6px' }}>Event Name ✱</span>
              <input type="text" placeholder="e.g. State Level Chess Championship" value={form.name} onChange={(e) => set('name', e.target.value)} style={inp} />
            </label>

            <label style={{ display: 'block', marginBottom: '14px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937', display: 'block', marginBottom: '6px' }}>Category ✱</span>
              <select value={form.category} onChange={(e) => set('category', e.target.value)} style={inp}>
                {CATEGORY_OPTIONS.map((c) => (<option key={c} value={c}>{c || 'Select category'}</option>))}
              </select>
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937', display: 'block', marginBottom: '6px' }}>City ✱</span>
                <input type="text" placeholder="e.g. Delhi" value={form.city} onChange={(e) => set('city', e.target.value)} style={inp} />
              </label>
              <label>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937', display: 'block', marginBottom: '6px' }}>State ✱</span>
                <input type="text" placeholder="e.g. Delhi" value={form.state} onChange={(e) => set('state', e.target.value)} style={inp} />
              </label>
            </div>
          </div>

          <p style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>Optional Details</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <label>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Event Date</span>
              <input type="date" value={form.eventDate} onChange={(e) => set('eventDate', e.target.value)} style={inp} />
            </label>
            <label>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Reg. Deadline</span>
              <input type="date" value={form.registrationDeadline} onChange={(e) => set('registrationDeadline', e.target.value)} style={inp} />
            </label>
          </div>

          <label style={{ display: 'block', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Venue Address</span>
            <input type="text" placeholder="Full address" value={form.fullAddress} onChange={(e) => set('fullAddress', e.target.value)} style={inp} />
          </label>

          <label style={{ display: 'block', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Description</span>
            <textarea placeholder="Describe the event..." value={form.description} onChange={(e) => set('description', e.target.value)} style={{ ...inp, minHeight: '80px', resize: 'vertical' }} rows={3} />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <label>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Organizer Name</span>
              <input type="text" placeholder="Organizer" value={form.organizerName} onChange={(e) => set('organizerName', e.target.value)} style={inp} />
            </label>
            <label>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Organizer Contact</span>
              <input type="text" placeholder="Phone/Email" value={form.organizerContact} onChange={(e) => set('organizerContact', e.target.value)} style={inp} />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <label>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Eligibility</span>
              <input type="text" placeholder="e.g. Grade 9-12" value={form.eligibility} onChange={(e) => set('eligibility', e.target.value)} style={inp} />
            </label>
            <label>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Prizes</span>
              <input type="text" placeholder="e.g. ₹10,000 + Trophy" value={form.prizes} onChange={(e) => set('prizes', e.target.value)} style={inp} />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <label>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Fees (₹)</span>
              <input type="number" placeholder="0 = Free" value={form.fees} onChange={(e) => set('fees', e.target.value)} style={inp} min="0" />
            </label>
            <label>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Status</span>
              <select value={form.status} onChange={(e) => set('status', e.target.value)} style={inp}>
                {STATUS_OPTIONS.map((s) => (<option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>))}
              </select>
            </label>
          </div>

          <label style={{ display: 'block', marginBottom: '24px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Organizer Website</span>
            <input type="text" placeholder="Website URL" value={form.organizerWebsite} onChange={(e) => set('organizerWebsite', e.target.value)} style={inp} />
          </label>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={cancelBtn}>Cancel</button>
            <button type="submit" disabled={saving} style={{ ...saveBtn, background: saving ? '#F9A8D4' : '#F5576C', cursor: saving ? 'default' : 'pointer' }}>
              {saving ? 'Saving...' : editEvent ? '💾 Save Changes' : '➕ Add Event'}
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
