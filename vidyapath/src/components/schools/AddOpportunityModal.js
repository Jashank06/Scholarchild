'use client';

import { useState } from 'react';
import api from '@/lib/api';

const TYPE_OPTIONS = ['scholarship', 'competition', 'scheme', 'fellowship', 'internship', 'camp', 'workshop', 'exam', 'other'];
const CATEGORY_OPTIONS = ['', 'academic', 'science', 'arts', 'quiz', 'olympiad', 'coding', 'writing', 'debate', 'sports', 'music', 'general'];

export default function AddOpportunityModal({ open, onClose, onSaved, editOpportunity, defaultType }) {
  const [form, setForm] = useState({
    title: editOpportunity?.title || '',
    type: editOpportunity?.type || defaultType || 'scholarship',
    category: editOpportunity?.category || '',
    description: editOpportunity?.description || '',
    deadline: editOpportunity?.dates?.applicationDeadline ? editOpportunity.dates.applicationDeadline.slice(0, 10) : '',
    amount: editOpportunity?.rewards?.cashAmount || '',
    eligibility: editOpportunity?.eligibility?.otherCriteria || '',
    organizer: editOpportunity?.organizer?.name || '',
    website: editOpportunity?.organizer?.website || editOpportunity?.application?.externalLink || '',
    grade: editOpportunity?.eligibility?.grades?.[0] || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!form.type) { setError('Type is required'); return; }

    setSaving(true);
    try {
      const body = {
        title: form.title.trim(),
        type: form.type,
        category: form.category || undefined,
        description: form.description.trim() || undefined,
        dates: form.deadline ? { applicationDeadline: new Date(form.deadline).toISOString(), examDate: form.type === 'exam' ? new Date(form.deadline).toISOString() : undefined } : undefined,
        rewards: form.amount ? { cashAmount: Number(form.amount), type: 'cash', description: `₹${Number(form.amount).toLocaleString('en-IN')}` } : undefined,
        eligibility: {
          grades: form.grade ? [Number(form.grade)] : [],
          otherCriteria: form.eligibility.trim() || undefined,
        },
        organizer: {
          name: form.organizer.trim() || undefined,
          website: form.website.trim() || undefined,
        },
        application: { mode: 'external', externalLink: form.website.trim() || undefined, isFree: true },
      };

      if (editOpportunity) {
        await api.updateOpportunity(editOpportunity._id, body);
      } else {
        await api.createOpportunity(body);
      }
      onSaved?.();
      onClose();
    } catch (err) { setError(err.message || 'Something went wrong'); }
    finally { setSaving(false); }
  };

  if (!open) return null;

  const typeLabels = {
    scholarship: '🎓 Scholarship', competition: '🏆 Competition', scheme: '🏛️ Govt Scheme',
    fellowship: '📚 Fellowship', internship: '💼 Internship', camp: '🏕️ Camp',
    workshop: '🔧 Workshop', exam: '📝 Competitive Exam',
  };

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
          background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
          color: '#fff',
        }}>
          <h2 style={{ fontSize: '22px', fontWeight: '900', margin: 0 }}>
            {editOpportunity ? '✏️ Edit Opportunity' : `${typeLabels[form.type] || '➕'} Add Opportunity`}
          </h2>
          <p style={{ fontSize: '13px', opacity: 0.85, margin: '6px 0 0' }}>
            {editOpportunity ? 'Update opportunity details' : 'Add a scholarship, competition, or scheme'}
          </p>
        </div>

        <form onSubmit={handleSave} style={{ padding: '28px' }}>
          {error && (
            <div style={{ padding: '12px 16px', borderRadius: '12px', background: '#FEF2F2', color: '#DC2626', fontSize: '13px', fontWeight: '600', marginBottom: '20px' }}>
              {error}
            </div>
          )}

          <label style={{ display: 'block', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937', display: 'block', marginBottom: '6px' }}>Title ✱</span>
            <input type="text" placeholder="e.g. PM Scholarship Scheme 2026" value={form.title} onChange={(e) => set('title', e.target.value)} style={inp} />
          </label>

          <label style={{ display: 'block', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#1F2937', display: 'block', marginBottom: '6px' }}>Type ✱</span>
            <select value={form.type} onChange={(e) => set('type', e.target.value)} style={inp}>
              {TYPE_OPTIONS.map((t) => (<option key={t} value={t}>{typeLabels[t] || t}</option>))}
            </select>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <label>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Category</span>
              <select value={form.category} onChange={(e) => set('category', e.target.value)} style={inp}>
                {CATEGORY_OPTIONS.map((c) => (<option key={c} value={c}>{c || 'Select'}</option>))}
              </select>
            </label>
            <label>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Deadline</span>
              <input type="date" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} style={inp} />
            </label>
          </div>

          <label style={{ display: 'block', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Description</span>
            <textarea placeholder="Describe the opportunity..." value={form.description} onChange={(e) => set('description', e.target.value)} style={{ ...inp, minHeight: '80px', resize: 'vertical' }} rows={3} />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <label>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Amount (₹)</span>
              <input type="number" placeholder="e.g. 50000" value={form.amount} onChange={(e) => set('amount', e.target.value)} style={inp} />
            </label>
            <label>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Grade</span>
              <input type="number" placeholder="e.g. 12" value={form.grade} onChange={(e) => set('grade', e.target.value)} style={inp} />
            </label>
          </div>

          <label style={{ display: 'block', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Eligibility</span>
            <textarea placeholder="Who can apply?" value={form.eligibility} onChange={(e) => set('eligibility', e.target.value)} style={{ ...inp, minHeight: '60px', resize: 'vertical' }} rows={2} />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <label>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Organizer</span>
              <input type="text" placeholder="Organizer name" value={form.organizer} onChange={(e) => set('organizer', e.target.value)} style={inp} />
            </label>
            <label>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#4B5563', display: 'block', marginBottom: '6px' }}>Website</span>
              <input type="text" placeholder="Application URL" value={form.website} onChange={(e) => set('website', e.target.value)} style={inp} />
            </label>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={cancelBtn}>Cancel</button>
            <button type="submit" disabled={saving} style={{ ...saveBtn, background: saving ? '#93C5FD' : '#2563EB', cursor: saving ? 'default' : 'pointer' }}>
              {saving ? 'Saving...' : editOpportunity ? '💾 Save Changes' : '➕ Add Opportunity'}
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
