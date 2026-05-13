'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function AdminOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState({ type: '', search: '' });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [form, setForm] = useState({
    title: '', type: 'scholarship', category: 'academic', description: '', shortDescription: '',
    organizerName: '', organizerType: 'government', level: 'national',
    grades: '', states: '', categories: '', maxFamilyIncome: '', minPercentage: '',
    rewardType: 'cash', cashAmount: '', rewardDescription: '',
    applicationDeadline: '', applicationStart: '', examDate: '', resultDate: '', awardDate: '',
    appMode: 'external', externalLink: '', isFree: 'true',
    tags: '',
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (filter.type) params.type = filter.type;
      if (filter.search) params.search = filter.search;
      const res = await api.getOpportunities(params);
      setOpportunities(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({
      title: '', type: 'scholarship', category: 'academic', description: '', shortDescription: '',
      organizerName: '', organizerType: 'government', level: 'national',
      grades: '', states: '', categories: '', maxFamilyIncome: '', minPercentage: '',
      rewardType: 'cash', cashAmount: '', rewardDescription: '',
      applicationDeadline: '', applicationStart: '', examDate: '', resultDate: '', awardDate: '',
      appMode: 'external', externalLink: '', isFree: 'true',
      tags: '',
    });
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      const body = {
        title: form.title,
        type: form.type,
        category: form.category,
        description: form.description,
        shortDescription: form.shortDescription,
        organizer: { name: form.organizerName, type: form.organizerType, level: form.level },
        eligibility: {
          grades: form.grades ? form.grades.split(',').map(g => parseInt(g.trim())) : [],
          states: form.states ? form.states.split(',').map(s => s.trim()) : [],
          categories: form.categories ? form.categories.split(',').map(c => c.trim()) : [],
          maxFamilyIncome: form.maxFamilyIncome ? parseInt(form.maxFamilyIncome) : undefined,
          minPercentage: form.minPercentage ? parseInt(form.minPercentage) : undefined,
        },
        rewards: { type: form.rewardType, cashAmount: form.cashAmount ? parseInt(form.cashAmount) : 0, description: form.rewardDescription },
        dates: { 
          applicationDeadline: form.applicationDeadline || undefined,
          applicationStart: form.applicationStart || undefined,
          examDate: form.examDate || undefined,
          resultDate: form.resultDate || undefined,
          awardDate: form.awardDate || undefined,
        },
        application: { mode: form.appMode, externalLink: form.externalLink, isFree: form.isFree === 'true' },
        tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
        status: 'active',
      };

      if (editId) {
        await api.request(`/opportunities/${editId}`, { method: 'PUT', body: JSON.stringify(body) });
        setMessage({ text: '✅ Opportunity updated!', type: 'success' });
      } else {
        await api.request('/opportunities', { method: 'POST', body: JSON.stringify(body) });
        setMessage({ text: '✅ Opportunity created!', type: 'success' });
      }
      setShowForm(false);
      resetForm();
      fetchData();
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (opp) => {
    setEditId(opp._id);
    setForm({
      title: opp.title || '', type: opp.type || 'scholarship', category: opp.category || 'academic',
      description: opp.description || '', shortDescription: opp.shortDescription || '',
      organizerName: opp.organizer?.name || '', organizerType: opp.organizer?.type || 'government',
      level: opp.organizer?.level || 'national',
      grades: opp.eligibility?.grades?.join(', ') || '', states: opp.eligibility?.states?.join(', ') || '',
      categories: opp.eligibility?.categories?.join(', ') || '',
      maxFamilyIncome: opp.eligibility?.maxFamilyIncome || '', minPercentage: opp.eligibility?.minPercentage || '',
      rewardType: opp.rewards?.type || 'cash', cashAmount: opp.rewards?.cashAmount || '',
      rewardDescription: opp.rewards?.description || '',
      applicationDeadline: opp.dates?.applicationDeadline ? new Date(opp.dates.applicationDeadline).toISOString().split('T')[0] : '',
      applicationStart: opp.dates?.applicationStart ? new Date(opp.dates.applicationStart).toISOString().split('T')[0] : '',
      examDate: opp.dates?.examDate ? new Date(opp.dates.examDate).toISOString().split('T')[0] : '',
      resultDate: opp.dates?.resultDate ? new Date(opp.dates.resultDate).toISOString().split('T')[0] : '',
      awardDate: opp.dates?.awardDate ? new Date(opp.dates.awardDate).toISOString().split('T')[0] : '',
      appMode: opp.application?.mode || 'external', externalLink: opp.application?.externalLink || '',
      isFree: opp.application?.isFree !== false ? 'true' : 'false',
      tags: opp.tags?.join(', ') || '',
    });
    setShowForm(true);
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setMessage({ text: '⏳ Uploading and processing CSV...', type: 'info' });

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Using raw fetch for FormData
      const res = await fetch(`${api.baseUrl}/admin/bulk-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${api.getToken()}`
        },
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ text: `✅ Success! ${data.message}`, type: 'success' });
        fetchData();
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (err) {
      setMessage({ text: `❌ ${err.message}`, type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleSeed = async () => {
    if (!confirm('This will add 10+ sample opportunities. Continue?')) return;
    setSeeding(true);
    setMessage({ text: '⏳ Seeding sample data...', type: 'info' });
    try {
      const res = await api.request('/admin/seed', { method: 'POST' });
      setMessage({ text: `✅ ${res.message}`, type: 'success' });
      fetchData();
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setSeeding(false);
    }
  };

  const Field = ({ label, name, type = 'text', placeholder, required, options, wide }) => (
    <div style={{ gridColumn: wide ? '1 / -1' : 'auto' }}>
      <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>{label}</label>
      {options ? (
        <select name={name} value={form[name]} onChange={handleChange} style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '14px', fontSize: '14px' }}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea name={name} value={form[name]} onChange={handleChange} rows="3" placeholder={placeholder}
          style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '14px', fontSize: '14px', resize: 'vertical', outline: 'none' }} />
      ) : (
        <input name={name} type={type} value={form[name]} onChange={handleChange} placeholder={placeholder} required={required}
          style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '14px', fontSize: '14px', outline: 'none' }} />
      )}
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0B0B1A', marginBottom: '8px' }}>Opportunity Management 🎓</h1>
          <p style={{ color: '#6B7280' }}>Create, edit, and manage scholarships, competitions, and schemes.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleBulkUpload} 
              disabled={uploading}
              style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
            />
            <button style={{
              padding: '12px 24px', background: '#ECFDF5', color: '#059669',
              border: '1px solid #10B981', borderRadius: '100px', fontWeight: '800', cursor: 'pointer',
            }}>{uploading ? 'Processing...' : '📤 Bulk Upload CSV'}</button>
          </div>
          <button onClick={handleSeed} disabled={seeding} style={{
            padding: '12px 24px', background: '#FFF7ED', color: '#C2410C',
            border: '1px solid #F97316', borderRadius: '100px', fontWeight: '800', cursor: 'pointer',
          }}>{seeding ? 'Seeding...' : '🌱 Seed Sample Data'}</button>
          <button onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }} style={{
            padding: '12px 24px', background: showForm ? '#6B7280' : '#2563EB', color: 'white',
            border: 'none', borderRadius: '100px', fontWeight: '800', cursor: 'pointer',
          }}>{showForm ? 'Cancel' : '+ Create Opportunity'}</button>
        </div>
      </div>

      <div style={{ padding: '16px', background: '#F3F4F6', borderRadius: '16px', marginBottom: '24px', fontSize: '13px', color: '#4B5563', border: '1px solid #E5E7EB' }}>
        <strong>CSV Format:</strong> type, title, organizer, category, reward_amount, deadline (YYYY-MM-DD), app_mode, external_link, grades (1;2;3), states (State1;State2)
      </div>

      {message.text && (
        <div style={{ padding: '14px', borderRadius: '14px', marginBottom: '24px', fontWeight: '700', fontSize: '14px', background: message.type === 'success' ? '#ECFDF5' : '#FEF2F2', color: message.type === 'success' ? '#059669' : '#DC2626' }}>
          {message.text}
        </div>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '28px', padding: '36px', marginBottom: '32px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>
            {editId ? '✏️ Edit Opportunity' : '➕ New Opportunity'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <Field label="Title" name="title" placeholder="Opportunity Title" required />
              <Field label="Type" name="type" options={[
                { value: 'scholarship', label: 'Scholarship' }, { value: 'competition', label: 'Competition' }, { value: 'scheme', label: 'Govt. Scheme' },
              ]} />
              <Field label="Category" name="category" options={[
                { value: 'academic', label: 'Academic' }, { value: 'science', label: 'Science' }, { value: 'arts', label: 'Arts' },
                { value: 'quiz', label: 'Quiz' }, { value: 'olympiad', label: 'Olympiad' }, { value: 'coding', label: 'Coding' },
                { value: 'writing', label: 'Writing' }, { value: 'general', label: 'General' },
              ]} />
              <Field label="Tags (comma separated)" name="tags" placeholder="NSP, merit, national" />
              <Field label="Description" name="description" type="textarea" placeholder="Full description..." wide />
              <Field label="Organizer Name" name="organizerName" placeholder="Dept. of Education" />
              <Field label="Organizer Type" name="organizerType" options={[
                { value: 'government', label: 'Government' }, { value: 'ngo', label: 'NGO' },
                { value: 'corporate', label: 'Corporate' }, { value: 'trust', label: 'Trust' }, { value: 'institution', label: 'Institution' },
              ]} />
              <Field label="Level" name="level" options={[
                { value: 'taluka', label: 'Taluka' }, { value: 'district', label: 'District' },
                { value: 'state', label: 'State' }, { value: 'national', label: 'National' }, { value: 'international', label: 'International' },
              ]} />
              <Field label="Eligible Grades (comma separated)" name="grades" placeholder="1, 2, 3, ... 12" />
              <Field label="Eligible States (comma separated)" name="states" placeholder="Leave empty for All India" />
              <Field label="Eligible Categories" name="categories" placeholder="General, SC, ST, OBC" />
              <Field label="Max Family Income (₹)" name="maxFamilyIncome" type="number" placeholder="250000" />
              <Field label="Min Percentage (%)" name="minPercentage" type="number" placeholder="60" />
              <Field label="Award Amount (₹)" name="cashAmount" type="number" placeholder="10000" />
              <Field label="App. Start Date" name="applicationStart" type="date" />
              <Field label="App. Deadline" name="applicationDeadline" type="date" />
              <Field label="Exam Date" name="examDate" type="date" />
              <Field label="Result Date" name="resultDate" type="date" />
              <Field label="Award Date" name="awardDate" type="date" />
              <Field label="Application Mode" name="appMode" options={[
                { value: 'external', label: 'External Link' }, { value: 'internal', label: 'Internal' }, { value: 'both', label: 'Both' },
              ]} />
              <Field label="External Link" name="externalLink" placeholder="https://..." />
              <Field label="Free to Apply?" name="isFree" options={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]} />
            </div>
            <button type="submit" disabled={saving} style={{
              padding: '14px 36px', background: '#2563EB', color: 'white',
              border: 'none', borderRadius: '100px', fontWeight: '800', cursor: 'pointer',
            }}>{saving ? 'Saving...' : editId ? 'Update Opportunity →' : 'Create Opportunity →'}</button>
          </form>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <input type="text" placeholder="Search..." value={filter.search}
          onChange={(e) => setFilter({...filter, search: e.target.value})}
          style={{ flex: '1', maxWidth: '300px', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '14px', outline: 'none' }} />
        <select value={filter.type} onChange={(e) => setFilter({...filter, type: e.target.value})}
          style={{ padding: '12px', border: '1px solid #E5E7EB', borderRadius: '14px' }}>
          <option value="">All Types</option>
          <option value="scholarship">Scholarship</option><option value="competition">Competition</option><option value="scheme">Scheme</option>
        </select>
        <button onClick={fetchData} style={{ padding: '12px 24px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '100px', fontWeight: '800', cursor: 'pointer' }}>
          Search
        </button>
      </div>

      {/* Table */}
      <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '24px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #E5E7EB', background: '#F9FAFB' }}>
              {['Title', 'Type', 'Organizer', 'Award', 'Deadline', 'Apps', 'Actions'].map(h => (
                <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {opportunities.map((opp) => (
              <tr key={opp._id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '700', maxWidth: '220px' }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opp.title}</div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    fontSize: '10px', fontWeight: '800', padding: '4px 10px', borderRadius: '100px', textTransform: 'uppercase',
                    background: opp.type === 'scholarship' ? '#EFF6FF' : opp.type === 'competition' ? '#FFFBEB' : '#ECFDF5',
                    color: opp.type === 'scholarship' ? '#2563EB' : opp.type === 'competition' ? '#D97706' : '#059669',
                  }}>{opp.type}</span>
                </td>
                <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6B7280' }}>{opp.organizer?.name}</td>
                <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '700', color: '#059669' }}>
                  {opp.rewards?.cashAmount > 0 ? `₹${opp.rewards.cashAmount.toLocaleString()}` : '—'}
                </td>
                <td style={{ padding: '14px 16px', fontSize: '12px', color: '#6B7280' }}>
                  {opp.dates?.applicationDeadline ? new Date(opp.dates.applicationDeadline).toLocaleDateString('en-IN') : '—'}
                </td>
                <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '700' }}>{opp.stats?.totalApplications || 0}</td>
                <td style={{ padding: '14px 16px' }}>
                  <button onClick={() => handleEdit(opp)} style={{ background: '#EFF6FF', color: '#2563EB', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', marginRight: '6px' }}>Edit</button>
                  <button onClick={() => handleDelete(opp._id)} style={{ background: '#FEF2F2', color: '#DC2626', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {opportunities.length === 0 && !loading && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>No opportunities found.</div>
        )}
      </div>
    </div>
  );
}
