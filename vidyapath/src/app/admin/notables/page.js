'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

const categories = ['announcement', 'achievement', 'news', 'event', 'featured', 'success-story', 'other'];
const categoryEmoji = { announcement: '📢', achievement: '🏅', news: '📰', event: '🎪', featured: '⭐', 'success-story': '🌟', other: '📌' };

export default function AdminNotablesPage() {
  const [notables, setNotables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState({ category: '' });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '', description: '', content: '', link: '', linkLabel: 'Learn More',
    category: 'other', tags: '', source: '', featured: false,
    order: 0, startDate: '', endDate: '', isActive: true,
  });

  useEffect(() => { fetchData(); }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.category) params.category = filter.category;
      const res = await api.getAdminNotables(params);
      setNotables(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const resetForm = () => {
    setForm({
      title: '', description: '', content: '', link: '', linkLabel: 'Learn More',
      image: '', category: 'other', tags: '', source: '', featured: false,
      order: 0, startDate: '', endDate: '', isActive: true,
    });
    setEditId(null);
  };

  const openEdit = async (id) => {
    try {
      const res = await api.getAdminNotable(id);
      const n = res.data;
      setForm({
        title: n.title || '', description: n.description || '', content: n.content || '',
        link: n.link || '', linkLabel: n.linkLabel || 'Learn More',
        category: n.category || 'other',
        tags: (n.tags || []).join(', '), source: n.source || '',
        featured: n.featured || false, order: n.order || 0,
        startDate: n.startDate ? n.startDate.slice(0, 10) : '',
        endDate: n.endDate ? n.endDate.slice(0, 10) : '',
        isActive: n.isActive !== false,
      });
      setEditId(id);
      setShowForm(true);
    } catch (e) {
      setMessage({ text: 'Failed to load notable', type: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      const body = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
        order: parseInt(form.order) || 0,
      };

      if (editId) {
        await api.updateNotable(editId, body);
        setMessage({ text: '✅ Notable updated!', type: 'success' });
      } else {
        await api.createNotable(body);
        setMessage({ text: '✅ Notable created!', type: 'success' });
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
    if (!confirm('Delete this notable?')) return;
    try {
      await api.deleteNotable(id);
      setMessage({ text: '🗑️ Deleted', type: 'success' });
      fetchData();
    } catch (e) {
      setMessage({ text: 'Failed to delete', type: 'error' });
    }
  };

  const handleToggle = async (id, field, value) => {
    try {
      await api.toggleNotable(id, { [field]: value });
      fetchData();
    } catch (e) {
      setMessage({ text: 'Toggle failed', type: 'error' });
    }
  };

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#0B0B1A', margin: 0 }}>⭐ Notables</h1>
          <p style={{ color: '#6B7280', margin: '4px 0 0' }}>Manage featured content, announcements, and success stories</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          style={{ padding: '10px 24px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '100px', fontWeight: '800', cursor: 'pointer', fontSize: '14px' }}>
          + New Notable
        </button>
      </div>

      {message.text && (
        <div style={{ padding: '12px 20px', borderRadius: '12px', marginBottom: '16px', fontWeight: '600', background: message.type === 'error' ? '#FEE2E2' : '#D1FAE5', color: message.type === 'error' ? '#DC2626' : '#065F46' }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
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
          {notables.map(n => (
            <div key={n._id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: n.featured ? '#FEF3C7' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                {categoryEmoji[n.category] || '📌'}
              </div>
              <div style={{ flex: '1', minWidth: 0 }}>
                <div style={{ fontWeight: '800', color: '#0B0B1A', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {n.title}
                  {n.featured && <span style={{ fontSize: '10px', background: '#FEF3C7', color: '#D97706', padding: '2px 8px', borderRadius: '100px', fontWeight: '800' }}>FEATURED</span>}
                </div>
                <div style={{ color: '#6B7280', fontSize: '12px', marginTop: '2px' }}>
                  {n.category} · {n.link ? '🔗 Has link' : 'No link'} · {n.clickCount || 0} clicks
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                  <input type="checkbox" checked={n.isActive} onChange={(e) => handleToggle(n._id, 'isActive', e.target.checked)} />
                  Active
                </label>
                <button onClick={() => openEdit(n._id)}
                  style={{ padding: '6px 14px', border: '1px solid #E5E7EB', borderRadius: '8px', background: 'white', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>
                  Edit
                </button>
                <button onClick={() => handleDelete(n._id)}
                  style={{ padding: '6px 14px', border: '1px solid #FCA5A5', borderRadius: '8px', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}>
                  Del
                </button>
              </div>
            </div>
          ))}
          {notables.length === 0 && <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>No notables yet.</div>}
        </div>
      )}

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}
          onClick={(e) => { if (e.target === e.currentTarget) { setShowForm(false); resetForm(); } }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '32px', maxWidth: '640px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0B0B1A', marginBottom: '24px' }}>{editId ? 'Edit Notable' : 'New Notable'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: '14px' }}>
                <div>
                  <label style={{ fontWeight: '700', fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Title *</label>
                  <input name="title" value={form.title} onChange={handleChange} required
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '14px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ fontWeight: '700', fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Category</label>
                    <select name="category" value={form.category} onChange={handleChange}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '14px' }}>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontWeight: '700', fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Order</label>
                    <input name="order" type="number" value={form.order} onChange={handleChange}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '14px' }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontWeight: '700', fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={2}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', resize: 'vertical' }} />
                </div>
                <div>
                  <label style={{ fontWeight: '700', fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Content (detailed)</label>
                  <textarea name="content" value={form.content} onChange={handleChange} rows={3}
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
                  <label style={{ fontWeight: '700', fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Tags (comma separated)</label>
                  <input name="tags" value={form.tags} onChange={handleChange}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ fontWeight: '700', fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Source</label>
                  <input name="source" value={form.source} onChange={handleChange}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '14px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ fontWeight: '700', fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>Start Date</label>
                    <input name="startDate" type="date" value={form.startDate} onChange={handleChange}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '14px' }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: '700', fontSize: '13px', color: '#374151', display: 'block', marginBottom: '4px' }}>End Date</label>
                    <input name="endDate" type="date" value={form.endDate} onChange={handleChange}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '10px', fontSize: '14px' }} />
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
                  {saving ? 'Saving...' : editId ? 'Update Notable' : 'Create Notable'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
