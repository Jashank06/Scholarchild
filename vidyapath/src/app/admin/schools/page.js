'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function AdminSchoolsPage() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ state: '', search: '' });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [editSchool, setEditSchool] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState([]);
  const [fields, setFields] = useState([]);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [fieldForm, setFieldForm] = useState({ categoryId: '', key: '', label: '', type: 'text', options: '' });
  const [form, setForm] = useState({
    name: '', board: 'CBSE', type: 'private', 
    city: '', district: '', state: '', 
    email: '', phone: '', website: '',
    customFields: {}
  });

  useEffect(() => {
    fetchSchools();
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const [catRes, fieldRes] = await Promise.all([
        api.getSchoolCategories(),
        api.getSchoolFields(),
      ]);
      setCategories(catRes.data || []);
      setFields(fieldRes.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const res = await api.getSchools(filter);
      setSchools(res.data || []);
    } catch (e) {
      console.error(e);
      setMessage({ text: 'Failed to fetch schools', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      const res = await api.verifySchool(id);
      if (res.success) {
        setMessage({ text: '✅ School verified successfully', type: 'success' });
        fetchSchools();
      }
    } catch (e) {
      setMessage({ text: e.message, type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this school? This action cannot be undone.')) return;
    try {
      // Assuming a delete endpoint exists or using general request
      await api.request(`/schools/${id}`, { method: 'DELETE' });
      setMessage({ text: '✅ School deleted', type: 'success' });
      fetchSchools();
    } catch (e) {
      setMessage({ text: e.message, type: 'error' });
    }
  };

  const handleEdit = (school) => {
    setEditSchool(school);
    setForm({
      name: school.name || '',
      board: school.board || 'CBSE',
      type: school.type || 'private',
      city: school.address?.city || '',
      district: school.address?.district || '',
      state: school.address?.state || '',
      email: school.contact?.email || '',
      phone: school.contact?.phone || '',
      website: school.contact?.website || '',
      customFields: school.customFields || {}
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const body = {
        name: form.name,
        board: form.board,
        type: form.type,
        address: { city: form.city, district: form.district, state: form.state },
        contact: { email: form.email, phone: form.phone, website: form.website },
        customFields: form.customFields,
      };

      if (editSchool) {
        await api.updateSchool(editSchool._id, body);
        setMessage({ text: '✅ School updated successfully', type: 'success' });
      } else {
        await api.createSchool(body);
        setMessage({ text: '✅ School created successfully', type: 'success' });
      }
      setShowForm(false);
      setEditSchool(null);
      fetchSchools();
    } catch (e) {
      setMessage({ text: e.message, type: 'error' });
    }
  };

  const handleCreateCategory = async () => {
    if (!categoryForm.name.trim()) return;
    try {
      await api.createSchoolCategory({ name: categoryForm.name.trim(), description: categoryForm.description });
      setCategoryForm({ name: '', description: '' });
      fetchConfig();
    } catch (e) {
      setMessage({ text: e.message, type: 'error' });
    }
  };

  const handleUpdateCategory = async (category) => {
    const name = prompt('Category name', category.name);
    if (!name) return;
    try {
      await api.updateSchoolCategory(category._id, { name });
      fetchConfig();
    } catch (e) {
      setMessage({ text: e.message, type: 'error' });
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Delete this category and its fields?')) return;
    try {
      await api.deleteSchoolCategory(categoryId);
      fetchConfig();
    } catch (e) {
      setMessage({ text: e.message, type: 'error' });
    }
  };

  const handleCreateField = async () => {
    if (!fieldForm.categoryId || !fieldForm.key || !fieldForm.label) return;
    try {
      const payload = {
        categoryId: fieldForm.categoryId,
        key: fieldForm.key.trim(),
        label: fieldForm.label.trim(),
        type: fieldForm.type,
        options: fieldForm.options ? fieldForm.options.split(',').map((o) => o.trim()).filter(Boolean) : [],
      };
      await api.createSchoolField(payload);
      setFieldForm({ categoryId: fieldForm.categoryId, key: '', label: '', type: 'text', options: '' });
      fetchConfig();
    } catch (e) {
      setMessage({ text: e.message, type: 'error' });
    }
  };

  const handleUpdateField = async (field) => {
    const label = prompt('Field label', field.label);
    if (!label) return;
    try {
      await api.updateSchoolField(field._id, { label });
      fetchConfig();
    } catch (e) {
      setMessage({ text: e.message, type: 'error' });
    }
  };

  const handleDeleteField = async (fieldId) => {
    if (!confirm('Delete this field?')) return;
    try {
      await api.deleteSchoolField(fieldId);
      fetchConfig();
    } catch (e) {
      setMessage({ text: e.message, type: 'error' });
    }
  };

  const renderCustomField = (field) => {
    const value = form.customFields?.[field.key] ?? '';
    const commonProps = {
      style: { width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '14px' },
    };

    if (field.type === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={(e) => setForm({ ...form, customFields: { ...form.customFields, [field.key]: e.target.value } })}
          placeholder={field.placeholder || ''}
          rows={3}
          {...commonProps}
        />
      );
    }
    if (field.type === 'select') {
      return (
        <select
          value={value}
          onChange={(e) => setForm({ ...form, customFields: { ...form.customFields, [field.key]: e.target.value } })}
          {...commonProps}
        >
          <option value="">Select</option>
          {(field.options || []).map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }
    if (field.type === 'boolean') {
      return (
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', color: '#6B7280' }}>
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => setForm({ ...form, customFields: { ...form.customFields, [field.key]: e.target.checked } })}
          />
          {field.label}
        </label>
      );
    }

    return (
      <input
        type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
        value={value}
        onChange={(e) => setForm({ ...form, customFields: { ...form.customFields, [field.key]: e.target.value } })}
        placeholder={field.placeholder || ''}
        {...commonProps}
      />
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0B0B1A', marginBottom: '8px' }}>School Management 🏫</h1>
          <p style={{ color: '#6B7280' }}>Approve, edit, and manage registered educational institutions.</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditSchool(null); }} style={{
          padding: '12px 24px', background: '#2563EB', color: 'white',
          border: 'none', borderRadius: '100px', fontWeight: '800', cursor: 'pointer',
        }}>
          {showForm ? 'Cancel' : '+ Add School'}
        </button>
      </div>

      {message.text && (
        <div style={{
          padding: '14px', borderRadius: '14px', marginBottom: '24px', fontWeight: '700', fontSize: '14px',
          background: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          color: message.type === 'success' ? '#059669' : '#DC2626',
          border: `1px solid ${message.type === 'success' ? '#10B981' : '#EF4444'}`,
        }}>{message.text}</div>
      )}

      {showForm && (
        <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '28px', padding: '36px', marginBottom: '32px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px' }}>
            {editSchool ? '✏️ Edit School' : '➕ Add New School'}
          </h3>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>School Name</label>
                <input name="name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required 
                  style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '14px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Board</label>
                <select name="board" value={form.board} onChange={(e) => setForm({...form, board: e.target.value})}
                  style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '14px' }}>
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="State">State Board</option>
                  <option value="IB">IB</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>City</label>
                <input name="city" value={form.city} onChange={(e) => setForm({...form, city: e.target.value})}
                  style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '14px' }} />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>State</label>
                <input name="state" value={form.state} onChange={(e) => setForm({...form, state: e.target.value})}
                  style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '14px' }} />
              </div>
            </div>

            {categories.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '14px' }}>Custom School Info</h4>
                {categories.map((category) => {
                  const categoryFields = fields.filter((f) => f.categoryId === category._id || f.categoryId?.toString() === category._id);
                  if (categoryFields.length === 0) return null;
                  return (
                    <div key={category._id} style={{ marginBottom: '20px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#2563EB', marginBottom: '10px' }}>{category.name}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        {categoryFields.map((field) => (
                          <div key={field._id}>
                            {field.type !== 'boolean' && (
                              <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>{field.label}</label>
                            )}
                            {renderCustomField(field)}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <button type="submit" style={{
              padding: '14px 36px', background: '#2563EB', color: 'white',
              border: 'none', borderRadius: '100px', fontWeight: '800', cursor: 'pointer',
            }}>{editSchool ? 'Update School' : 'Create School'}</button>
          </form>
        </div>
      )}

      {/* Schools Table */}
      <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '24px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #E5E7EB', background: '#F9FAFB' }}>
              {['School Name', 'Board', 'Location', 'Rating', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '16px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schools.map((school) => (
              <tr key={school._id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '700' }}>{school.name}</td>
                <td style={{ padding: '16px 20px', fontSize: '13px' }}>{school.board}</td>
                <td style={{ padding: '16px 20px', fontSize: '13px', color: '#6B7280' }}>{school.address?.city}, {school.address?.state}</td>
                <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '700', color: '#F59E0B' }}>⭐ {school.ratings?.overall || 'N/A'}</td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{
                    fontSize: '10px', fontWeight: '800', padding: '4px 10px', borderRadius: '100px',
                    background: school.isVerified ? '#ECFDF5' : '#FFFBEB',
                    color: school.isVerified ? '#059669' : '#D97706',
                  }}>{school.isVerified ? 'VERIFIED' : 'PENDING'}</span>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  {!school.isVerified && (
                    <button onClick={() => handleVerify(school._id)} style={{ background: '#059669', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', marginRight: '6px' }}>Verify</button>
                  )}
                  <button onClick={() => handleEdit(school)} style={{ background: '#EFF6FF', color: '#2563EB', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', marginRight: '6px' }}>Edit</button>
                  <button onClick={() => handleDelete(school._id)} style={{ background: '#FEF2F2', color: '#DC2626', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '40px', background: 'white', border: '1px solid #E5E7EB', borderRadius: '24px', padding: '28px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '12px' }}>School Categories & Fields</h3>
        <p style={{ color: '#6B7280', marginBottom: '20px' }}>Create flexible categories and fields for school profiles.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Category Name</label>
            <input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '14px' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Description</label>
            <input value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '14px' }} />
          </div>
        </div>
        <button onClick={handleCreateCategory} style={{ padding: '10px 18px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '999px', fontWeight: '800', cursor: 'pointer', marginBottom: '24px' }}>Create Category</button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Category</label>
            <select value={fieldForm.categoryId} onChange={(e) => setFieldForm({ ...fieldForm, categoryId: e.target.value })}
              style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '14px' }}>
              <option value="">Select</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Field Key</label>
            <input value={fieldForm.key} onChange={(e) => setFieldForm({ ...fieldForm, key: e.target.value })}
              placeholder="eg. hostel_available"
              style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '14px' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Label</label>
            <input value={fieldForm.label} onChange={(e) => setFieldForm({ ...fieldForm, label: e.target.value })}
              placeholder="Hostel Available"
              style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '14px' }} />
          </div>
          <div>
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Type</label>
            <select value={fieldForm.type} onChange={(e) => setFieldForm({ ...fieldForm, type: e.target.value })}
              style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '14px' }}>
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="textarea">Textarea</option>
              <option value="select">Select</option>
              <option value="date">Date</option>
              <option value="boolean">Boolean</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
          <input value={fieldForm.options} onChange={(e) => setFieldForm({ ...fieldForm, options: e.target.value })}
            placeholder="Options (comma separated for select)"
            style={{ flex: 1, padding: '12px', border: '1px solid #E5E7EB', borderRadius: '14px' }} />
          <button onClick={handleCreateField} style={{ padding: '10px 18px', background: '#0F172A', color: 'white', border: 'none', borderRadius: '999px', fontWeight: '800', cursor: 'pointer' }}>Add Field</button>
        </div>

        {categories.map((cat) => (
          <div key={cat._id} style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: '800' }}>{cat.name}</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleUpdateCategory(cat)} style={{ padding: '6px 12px', borderRadius: '999px', border: 'none', background: '#EFF6FF', color: '#2563EB', fontWeight: '800', cursor: 'pointer', fontSize: '11px' }}>Edit</button>
                <button onClick={() => handleDeleteCategory(cat._id)} style={{ padding: '6px 12px', borderRadius: '999px', border: 'none', background: '#FEF2F2', color: '#DC2626', fontWeight: '800', cursor: 'pointer', fontSize: '11px' }}>Delete</button>
              </div>
            </div>
            <div style={{ display: 'grid', gap: '10px', marginTop: '10px' }}>
              {fields.filter((f) => f.categoryId === cat._id || f.categoryId?.toString() === cat._id).map((field) => (
                <div key={field._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F9FAFB', borderRadius: '12px', padding: '10px 12px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '800' }}>{field.label}</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>{field.key} • {field.type}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleUpdateField(field)} style={{ padding: '6px 12px', borderRadius: '999px', border: 'none', background: '#EFF6FF', color: '#2563EB', fontWeight: '800', cursor: 'pointer', fontSize: '11px' }}>Edit</button>
                    <button onClick={() => handleDeleteField(field._id)} style={{ padding: '6px 12px', borderRadius: '999px', border: 'none', background: '#FEF2F2', color: '#DC2626', fontWeight: '800', cursor: 'pointer', fontSize: '11px' }}>Delete</button>
                  </div>
                </div>
              ))}
              {fields.filter((f) => f.categoryId === cat._id || f.categoryId?.toString() === cat._id).length === 0 && (
                <div style={{ fontSize: '12px', color: '#94A3B8' }}>No fields yet.</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
