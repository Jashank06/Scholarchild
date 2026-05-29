'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

const categories = ['school', 'coaching', 'tuition', 'test-prep', 'library', 'training', 'consultancy', 'other'];
const categoryEmoji = { school: '🏫', coaching: '📚', tuition: '✏️', 'test-prep': '📝', library: '📖', training: '🎯', consultancy: '💼', other: '🏪' };

export default function AdminServiceProvidersPage() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState({ category: '' });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '', tagline: '', description: '', link: '', linkLabel: 'Visit Site',
    category: 'coaching', servicesOffered: '',
    contactPhone: '', contactEmail: '', address: '', city: '', state: '',
    website: '', establishedYear: '', discountInfo: '',
    featured: false, order: 0, startDate: '', endDate: '', rating: 0, isActive: true,
  });

  useEffect(() => { fetchData(); }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.category) params.category = filter.category;
      const res = await api.getAdminServiceProviders(params);
      setProviders(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const resetForm = () => {
    setForm({
      name: '', tagline: '', description: '', link: '', linkLabel: 'Visit Site',
      image: '', category: 'coaching', servicesOffered: '',
      contactPhone: '', contactEmail: '', address: '', city: '', state: '',
      website: '', establishedYear: '', discountInfo: '',
      featured: false, order: 0, startDate: '', endDate: '', rating: 0, isActive: true,
    });
    setEditId(null);
  };

  const openEdit = async (id) => {
    try {
      const res = await api.getAdminServiceProvider(id);
      const p = res.data;
      setForm({
        name: p.name || '', tagline: p.tagline || '', description: p.description || '',
        link: p.link || '', linkLabel: p.linkLabel || 'Visit Site',
        category: p.category || 'coaching',
        servicesOffered: (p.servicesOffered || []).join(', '),
        contactPhone: p.contactPhone || '', contactEmail: p.contactEmail || '',
        address: p.address || '', city: p.city || '', state: p.state || '',
        website: p.website || '', establishedYear: p.establishedYear || '',
        discountInfo: p.discountInfo || '',
        featured: p.featured || false, order: p.order || 0,
        startDate: p.startDate ? p.startDate.slice(0, 10) : '',
        endDate: p.endDate ? p.endDate.slice(0, 10) : '',
        rating: p.rating || 0, isActive: p.isActive !== false,
      });
      setEditId(id);
      setShowForm(true);
    } catch (e) {
      setMessage({ text: 'Failed to load provider', type: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      const body = {
        ...form,
        servicesOffered: form.servicesOffered ? form.servicesOffered.split(',').map(s => s.trim()).filter(Boolean) : [],
        establishedYear: form.establishedYear ? parseInt(form.establishedYear) : undefined,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        order: parseInt(form.order) || 0,
        rating: parseFloat(form.rating) || 0,
      };

      if (editId) {
        await api.updateServiceProvider(editId, body);
        setMessage({ text: '✅ Provider updated!', type: 'success' });
      } else {
        await api.createServiceProvider(body);
        setMessage({ text: '✅ Provider created!', type: 'success' });
      }
      setShowForm(false);
      resetForm();
      fetchData();
    } catch (e) {
      setMessage({ text: e.message || 'Failed to save', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this provider?')) return;
    try {
      await api.deleteServiceProvider(id);
      setMessage({ text: '🗑️ Deleted', type: 'success' });
      fetchData();
    } catch (e) {
      setMessage({ text: 'Failed to delete', type: 'error' });
    }
  };

  const handleToggle = async (id, field, value) => {
    try {
      await api.toggleServiceProvider(id, { [field]: value });
      fetchData();
    } catch (e) {
      setMessage({ text: 'Toggle failed', type: 'error' });
    }
  };

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0B0B1A', margin: 0 }}>🏪 Service Providers</h1>
          <p style={{ color: '#6B7280', margin: '4px 0 0' }}>Manage schools, coaching centers, and training providers</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          style={{ padding: '10px 24px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '100px', fontWeight: '800', cursor: 'pointer', fontSize: '14px' }}>
          + New Provider
        </button>
      </div>

      {message.text && (
        <div style={{ padding: '12px 20px', borderRadius: '12px', marginBottom: '16px', fontWeight: '600', background: message.type === 'error' ? '#FEE2E2' : '#D1FAE5', color: message.type === 'error' ? '#DC2626' : '#065F46' }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button onClick={() => setFilter({ category: '' })}
          style={{ padding: '6px 16px', border: 'none', borderRadius: '100px', fontWeight: '700', cursor: 'pointer', background: !filter.category ? '#2563EB' : '#F3F4F6', color: !filter.category ? 'white' : '#6B7280', fontSize: '12px' }}>
          All
        </button>
        {categories.map(c => (
          <button key={c} onClick={() => setFilter({ category: c })}
            style={{ padding: '6px 16px', border: 'none', borderRadius: '100px', fontWeight: '700', cursor: 'pointer', background: filter.category === c ? '#2563EB' : '#F3F4F6', color: filter.category === c ? 'white' : '#6B7280', fontSize: '12px' }}>
            {categoryEmoji[c]} {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>Loading...</div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {providers.map(p => (
            <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: p.featured ? '#FEF3C7' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                  {categoryEmoji[p.category] || '🏪'}
              </div>
              <div style={{ flex: '1', minWidth: 0 }}>
                <div style={{ fontWeight: '800', color: '#0B0B1A', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {p.name}
                  {p.featured && <span style={{ fontSize: '10px', background: '#FEF3C7', color: '#D97706', padding: '2px 8px', borderRadius: '100px', fontWeight: '800' }}>FEATURED</span>}
                </div>
                <div style={{ color: '#6B7280', fontSize: '12px', marginTop: '2px' }}>
                  {p.category} · {p.city || 'No city'} · {p.clickCount || 0} clicks
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                  <input type="checkbox" checked={p.isActive} onChange={(e) => handleToggle(p._id, 'isActive', e.target.checked)} />
                  Active
                </label>
                <button onClick={() => openEdit(p._id)}
                  style={{ padding: '6px 14px', border: '1px solid #E5E7EB', borderRadius: '8px', background: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>
                  Edit
                </button>
                <button onClick={() => handleDelete(p._id)}
                  style={{ padding: '6px 14px', border: '1px solid #FCA5A5', borderRadius: '8px', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>
                  Del
                </button>
              </div>
            </div>
          ))}
          {providers.length === 0 && <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>No providers yet.</div>}
        </div>
      )}

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}
          onClick={(e) => { if (e.target === e.currentTarget) { setShowForm(false); resetForm(); } }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '32px', maxWidth: '720px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0B0B1A', marginBottom: '24px' }}>{editId ? 'Edit Provider' : 'New Service Provider'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ fontWeight: '700', fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Name *</label>
                    <input name="name" value={form.name} onChange={handleChange} required
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '14px' }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: '700', fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Category</label>
                    <select name="category" value={form.category} onChange={handleChange}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '14px' }}>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontWeight: '700', fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Tagline</label>
                  <input name="tagline" value={form.tagline} onChange={handleChange}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ fontWeight: '700', fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', resize: 'vertical' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ fontWeight: '700', fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Link URL</label>
                    <input name="link" value={form.link} onChange={handleChange} placeholder="https://..."
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '14px' }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: '700', fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Link Label</label>
                    <input name="linkLabel" value={form.linkLabel} onChange={handleChange}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '14px' }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontWeight: '700', fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Services Offered (comma separated)</label>
                  <input name="servicesOffered" value={form.servicesOffered} onChange={handleChange} placeholder="Math, JEE, NEET, Spoken English..."
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '14px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ fontWeight: '700', fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Phone</label>
                    <input name="contactPhone" value={form.contactPhone} onChange={handleChange}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '14px' }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: '700', fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Email</label>
                    <input name="contactEmail" type="email" value={form.contactEmail} onChange={handleChange}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '14px' }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: '700', fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Website</label>
                    <input name="website" value={form.website} onChange={handleChange}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '14px' }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ fontWeight: '700', fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>City</label>
                    <input name="city" value={form.city} onChange={handleChange}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '14px' }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: '700', fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>State</label>
                    <input name="state" value={form.state} onChange={handleChange}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '14px' }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: '700', fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Est. Year</label>
                    <input name="establishedYear" type="number" value={form.establishedYear} onChange={handleChange}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '14px' }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontWeight: '700', fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Address</label>
                  <input name="address" value={form.address} onChange={handleChange}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ fontWeight: '700', fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Discount / Offer Info</label>
                  <input name="discountInfo" value={form.discountInfo} onChange={handleChange}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '14px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ fontWeight: '700', fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Rating (0-5)</label>
                    <input name="rating" type="number" min="0" max="5" step="0.1" value={form.rating} onChange={handleChange}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '14px' }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: '700', fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Order</label>
                    <input name="order" type="number" value={form.order} onChange={handleChange}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '14px' }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: '700', fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Display Period</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input name="startDate" type="date" value={form.startDate} onChange={handleChange} placeholder="Start"
                        style={{ flex: 1, padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '14px' }} />
                      <input name="endDate" type="date" value={form.endDate} onChange={handleChange} placeholder="End"
                        style={{ flex: 1, padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '14px' }} />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
                    <input name="featured" type="checkbox" checked={form.featured} onChange={handleChange} />
                    Featured
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
                    <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange} />
                    Active
                  </label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setShowForm(false); resetForm(); }}
                  style={{ padding: '10px 24px', border: '1px solid #E5E7EB', borderRadius: '100px', background: 'white', fontWeight: '700', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  style={{ padding: '10px 24px', border: 'none', borderRadius: '100px', background: '#2563EB', color: 'white', fontWeight: '800', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                  {saving ? 'Saving...' : editId ? 'Update Provider' : 'Create Provider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
