'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function InstitutionOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', type: 'scholarship', category: 'academic', description: '',
    cashAmount: '', deadline: '', grades: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => { fetchOpps(); }, []);

  const fetchOpps = async () => {
    try {
      const res = await api.getOpportunities({});
      setOpportunities(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });
    // Note: This requires admin role. For institution posting, admin needs to add this ability.
    setMessage({ text: 'Opportunity creation requires admin approval. Contact admin to post.', type: 'error' });
    setSaving(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0B0B1A', marginBottom: '8px' }}>Opportunities 🎓</h1>
          <p style={{ color: '#6B7280' }}>Post and manage scholarship opportunities for your students.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          padding: '12px 24px', background: '#2563EB', color: 'white',
          border: 'none', borderRadius: '100px', fontWeight: '800', cursor: 'pointer',
        }}>
          {showForm ? 'Cancel' : '+ Post Opportunity'}
        </button>
      </div>

      {message.text && (
        <div style={{
          padding: '12px', borderRadius: '12px', marginBottom: '24px', fontWeight: '700', fontSize: '14px',
          background: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          color: message.type === 'success' ? '#059669' : '#DC2626',
        }}>{message.text}</div>
      )}

      {/* Post Form */}
      {showForm && (
        <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '24px', padding: '32px', marginBottom: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px' }}>Post New Opportunity</h3>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Title</label>
                <input name="title" value={form.title} onChange={handleChange} required placeholder="Scholarship Name"
                  style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '14px', fontSize: '15px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Type</label>
                <select name="type" value={form.type} onChange={handleChange}
                  style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '14px' }}>
                  <option value="scholarship">Scholarship</option>
                  <option value="competition">Competition</option>
                  <option value="scheme">Scheme</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Award (₹)</label>
                <input name="cashAmount" type="number" value={form.cashAmount} onChange={handleChange} placeholder="10000"
                  style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '14px', fontSize: '15px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Deadline</label>
                <input name="deadline" type="date" value={form.deadline} onChange={handleChange}
                  style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '14px', fontSize: '15px' }} />
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows="3" placeholder="Describe the opportunity..."
                style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '14px', fontSize: '15px', resize: 'vertical' }} />
            </div>
            <button type="submit" disabled={saving} style={{
              padding: '12px 32px', background: '#2563EB', color: 'white',
              border: 'none', borderRadius: '100px', fontWeight: '800', cursor: 'pointer',
            }}>{saving ? 'Posting...' : 'Submit for Review →'}</button>
          </form>
        </div>
      )}

      {/* Existing Opportunities */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>Loading...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {opportunities.slice(0, 8).map((opp) => (
            <div key={opp._id} style={{
              background: 'white', border: '1px solid #E5E7EB', borderRadius: '24px', padding: '24px',
            }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#2563EB', background: '#EFF6FF', padding: '4px 10px', borderRadius: '100px', textTransform: 'uppercase' }}>{opp.type}</span>
                <span style={{ fontSize: '10px', fontWeight: '700', color: '#6B7280', background: '#F3F4F6', padding: '4px 10px', borderRadius: '100px' }}>{opp.category}</span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0B0B1A', marginBottom: '8px' }}>{opp.title}</h3>
              <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>{opp.organizer?.name}</p>
              {opp.rewards?.cashAmount > 0 && (
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#059669' }}>₹{opp.rewards.cashAmount.toLocaleString()}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
