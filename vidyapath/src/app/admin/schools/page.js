'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import styles from './schools.module.css';

export default function AdminSchoolsPage() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ state: '', search: '' });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [editSchool, setEditSchool] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState([]);
  const [fields, setFields] = useState([]);
  
  // Category/Field inline forms state
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newFieldForms, setNewFieldForms] = useState({}); // categoryId -> { label: '', type: 'text', options: '' }

  const [selectedSchools, setSelectedSchools] = useState([]);
  const [emailSending, setEmailSending] = useState(false);

  const toggleSelectSchool = (id) => {
    if (selectedSchools.includes(id)) {
      setSelectedSchools(selectedSchools.filter((schoolId) => schoolId !== id));
    } else {
      setSelectedSchools([...selectedSchools, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedSchools.length === schools.length && schools.length > 0) {
      setSelectedSchools([]);
    } else {
      setSelectedSchools(schools.map((s) => s._id));
    }
  };

  const handleSendEmails = async () => {
    if (selectedSchools.length === 0) return;
    setEmailSending(true);
    setMessage({ text: '📨 Sending update forms to selected schools...', type: 'success' });
    try {
      const res = await api.request('/schools/send-update-requests', {
        method: 'POST',
        body: JSON.stringify({ schoolIds: selectedSchools })
      });
      if (res.success) {
        setMessage({ text: `✅ Email request sent successfully! ${res.sentCount} sent, ${res.failedCount} failed.`, type: 'success' });
        setSelectedSchools([]);
        fetchSchools();
      } else {
        setMessage({ text: res.message || 'Failed to send emails', type: 'error' });
      }
    } catch (e) {
      setMessage({ text: e.message || 'Error occurred while sending requests', type: 'error' });
    } finally {
      setEmailSending(false);
    }
  };

  const [form, setForm] = useState({
    name: '', board: 'CBSE', type: 'private', 
    city: '', district: '', state: '', 
    email: '', phone: '', website: '',
    customFields: {}
  });

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSchools();
    fetchConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        contact: { email: form.email.trim() || undefined, phone: form.phone, website: form.website },
        customFields: form.customFields,
      };

      if (editSchool) {
        await api.updateSchool(editSchool._id, body);
        setMessage({ text: '✅ School updated successfully', type: 'success' });
      } else {
        await api.createSchool(body);
        setMessage({ text: '✅ School created successfully', type: 'success' });
      }
      setForm({
        name: '', board: 'CBSE', type: 'private', 
        city: '', district: '', state: '', 
        email: '', phone: '', website: '',
        customFields: {}
      });
      setShowForm(false);
      setEditSchool(null);
      fetchSchools();
    } catch (e) {
      setMessage({ text: e.message, type: 'error' });
    }
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      await api.createSchoolCategory({ name: newCatName.trim(), description: newCatDesc.trim() });
      setNewCatName('');
      setNewCatDesc('');
      fetchConfig();
      setMessage({ text: '✅ Custom category created successfully', type: 'success' });
    } catch (e) {
      setMessage({ text: e.message, type: 'error' });
    }
  };

  const handleUpdateCategory = async (category) => {
    const name = prompt('Rename Category to:', category.name);
    if (!name) return;
    try {
      await api.updateSchoolCategory(category._id, { name });
      fetchConfig();
    } catch (e) {
      setMessage({ text: e.message, type: 'error' });
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category globally? All fields and values inside this category across all schools will be removed.')) return;
    try {
      await api.deleteSchoolCategory(categoryId);
      fetchConfig();
    } catch (e) {
      setMessage({ text: e.message, type: 'error' });
    }
  };

  const handleCreateFieldForCategory = async (categoryId) => {
    const fieldForm = newFieldForms[categoryId];
    if (!fieldForm || !fieldForm.label) return;
    try {
      const key = fieldForm.label.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
      const payload = {
        categoryId,
        key,
        label: fieldForm.label.trim(),
        type: fieldForm.type || 'text',
        options: fieldForm.options ? fieldForm.options.split(',').map((o) => o.trim()).filter(Boolean) : [],
      };
      await api.createSchoolField(payload);
      setNewFieldForms(prev => ({
        ...prev,
        [categoryId]: { label: '', type: 'text', options: '' }
      }));
      fetchConfig();
      setMessage({ text: `✅ Field "${fieldForm.label}" created successfully`, type: 'success' });
    } catch (e) {
      setMessage({ text: e.message, type: 'error' });
    }
  };

  const handleUpdateField = async (field) => {
    const label = prompt('Rename Field Label to:', field.label);
    if (!label) return;
    try {
      await api.updateSchoolField(field._id, { label });
      fetchConfig();
    } catch (e) {
      setMessage({ text: e.message, type: 'error' });
    }
  };

  const handleDeleteField = async (fieldId) => {
    if (!confirm('Are you sure you want to delete this custom field globally? It will be removed from all schools.')) return;
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
      className: styles.formInput
    };

    if (field.type === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={(e) => setForm({ ...form, customFields: { ...form.customFields, [field.key]: e.target.value } })}
          placeholder={field.placeholder || `Enter ${field.label}`}
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
          className={styles.formSelect}
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
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', color: '#475569', marginTop: '10px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => setForm({ ...form, customFields: { ...form.customFields, [field.key]: e.target.checked } })}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
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
        placeholder={field.placeholder || `Enter ${field.label}`}
        {...commonProps}
      />
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerSection}>
        <div>
          <h1 className={styles.title}>School Management 🏫</h1>
          <p className={styles.subtitle}>Approve, edit, and manage registered educational institutions.</p>
        </div>
        <button 
          onClick={() => { 
            if (!showForm) {
              setForm({
                name: '', board: 'CBSE', type: 'private', 
                city: '', district: '', state: '', 
                email: '', phone: '', website: '',
                customFields: {}
              });
            }
            setShowForm(!showForm); 
            setEditSchool(null); 
          }} 
          className={showForm ? styles.cancelBtn : styles.addBtn}
        >
          {showForm ? 'Cancel' : '+ Add School'}
        </button>
      </div>

      {message.text && (
        <div className={`${styles.alert} ${message.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <div className={styles.formCard}>
          <h3 className={styles.formTitle}>
            {editSchool ? '✏️ Edit School' : '➕ Add New School'}
          </h3>
          <form onSubmit={handleSave}>
            <div className={styles.grid2}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>School Name</label>
                <input 
                  name="name" 
                  value={form.name} 
                  onChange={(e) => setForm({...form, name: e.target.value})} 
                  required 
                  className={styles.formInput} 
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Board</label>
                <select 
                  name="board" 
                  value={form.board} 
                  onChange={(e) => setForm({...form, board: e.target.value})}
                  className={styles.formSelect}
                >
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                  <option value="State">State Board</option>
                  <option value="IB">IB</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>City</label>
                <input 
                  name="city" 
                  value={form.city} 
                  onChange={(e) => setForm({...form, city: e.target.value})}
                  className={styles.formInput} 
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>State</label>
                <input 
                  name="state" 
                  value={form.state} 
                  onChange={(e) => setForm({...form, state: e.target.value})}
                  className={styles.formInput} 
                />
              </div>
            </div>

            <div className={styles.grid2} style={{ marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>School Email</label>
                <input 
                  type="email"
                  name="email" 
                  value={form.email} 
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  className={styles.formInput} 
                  placeholder="contact@school.edu"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>School Phone</label>
                <input 
                  name="phone" 
                  value={form.phone} 
                  onChange={(e) => setForm({...form, phone: e.target.value})}
                  className={styles.formInput} 
                  placeholder="e.g. 011-23456789"
                />
              </div>
              <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                <label className={styles.formLabel}>School Website</label>
                <input 
                  name="website" 
                  value={form.website} 
                  onChange={(e) => setForm({...form, website: e.target.value})}
                  className={styles.formInput} 
                  placeholder="e.g. https://school.edu"
                />
              </div>
            </div>

            {/* Custom Info Section with inline category/field creators */}
            <div className={styles.customSection}>
              <h4 className={styles.customSectionHeader}>⚙️ Custom School Info</h4>
              
              {categories.map((category) => {
                const categoryFields = fields.filter((f) => f.categoryId === category._id || f.categoryId?.toString() === category._id);
                return (
                  <div key={category._id} className={styles.categoryCard}>
                    <div className={styles.categoryHeader}>
                      <div className={styles.categoryName}>
                        🏫 {category.name}
                      </div>
                      <div className={styles.categoryActions}>
                        <button type="button" onClick={() => handleUpdateCategory(category)} className={styles.actionIconBtn}>✏️ Rename</button>
                        <button type="button" onClick={() => handleDeleteCategory(category._id)} className={styles.actionIconBtnDanger}>🗑️ Delete Category</button>
                      </div>
                    </div>
                    
                    <div className={styles.fieldsGrid}>
                      {categoryFields.map((field) => (
                        <div key={field._id} className={styles.fieldItem}>
                          <div className={styles.fieldLabelRow}>
                            <span className={styles.formLabel}>{field.label}</span>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button type="button" onClick={() => handleUpdateField(field)} className={styles.fieldDeleteBtn} style={{ color: '#2563eb' }}>Rename</button>
                              <button type="button" onClick={() => handleDeleteField(field._id)} className={styles.fieldDeleteBtn}>Delete</button>
                            </div>
                          </div>
                          {renderCustomField(field)}
                        </div>
                      ))}
                      {categoryFields.length === 0 && (
                        <div style={{ gridColumn: 'span 2', fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', padding: '10px 0' }}>
                          No custom fields added yet. Add a field for this category below!
                        </div>
                      )}
                    </div>

                    {/* Add Field Inline Form */}
                    <div className={styles.inlineAddForm}>
                      <div className={styles.inlineFormTitle}>➕ Add Custom Field to ({category.name})</div>
                      <div className={styles.inlineFormFields}>
                        <input 
                          type="text" 
                          placeholder="e.g. Hostel Available" 
                          value={newFieldForms[category._id]?.label || ''} 
                          onChange={(e) => setNewFieldForms({
                            ...newFieldForms,
                            [category._id]: { ...(newFieldForms[category._id] || { type: 'text' }), label: e.target.value }
                          })}
                          className={styles.inlineFormInput}
                        />
                        <select 
                          value={newFieldForms[category._id]?.type || 'text'} 
                          onChange={(e) => setNewFieldForms({
                            ...newFieldForms,
                            [category._id]: { ...(newFieldForms[category._id] || {}), type: e.target.value }
                          })}
                          className={styles.inlineFormSelect}
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="textarea">Textarea</option>
                          <option value="select">Dropdown Select</option>
                          <option value="date">Date</option>
                          <option value="boolean">Yes/No (Checkbox)</option>
                        </select>
                        {newFieldForms[category._id]?.type === 'select' ? (
                          <input 
                            type="text" 
                            placeholder="Options (comma separated)" 
                            value={newFieldForms[category._id]?.options || ''} 
                            onChange={(e) => setNewFieldForms({
                              ...newFieldForms,
                              [category._id]: { ...(newFieldForms[category._id] || {}), options: e.target.value }
                            })}
                            className={styles.inlineFormInput}
                          />
                        ) : null}
                        <button 
                          type="button" 
                          onClick={() => handleCreateFieldForCategory(category._id)}
                          className={styles.inlineAddBtn}
                          style={{ gridColumn: newFieldForms[category._id]?.type === 'select' ? 'auto' : 'span 2' }}
                        >
                          Add Field
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add New Category Form */}
              <div className={styles.addCategorySection}>
                <div className={styles.addCategoryHeader}>
                  📂 Create New Custom Category Globally
                </div>
                <div className={styles.addCategoryForm}>
                  <input 
                    type="text" 
                    placeholder="e.g. Infrastructure Facilities" 
                    value={newCatName} 
                    onChange={(e) => setNewCatName(e.target.value)}
                    className={styles.formInput}
                  />
                  <input 
                    type="text" 
                    placeholder="Category Description (optional)" 
                    value={newCatDesc} 
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    className={styles.formInput}
                  />
                  <button 
                    type="button" 
                    onClick={handleCreateCategory}
                    className={styles.inlineAddBtn}
                    style={{ height: '46px' }}
                  >
                    ➕ Create Category
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn}>
              {editSchool ? 'Update School Profile' : 'Create School Profile'}
            </button>
          </form>
        </div>
      )}

      {/* Bulk Actions Toolbar */}
      {selectedSchools.length > 0 && (
        <div className={styles.bulkToolbar}>
          <div className={styles.bulkInfo}>
            <span className={styles.bulkCount}>{selectedSchools.length}</span> {selectedSchools.length === 1 ? 'school' : 'schools'} selected
          </div>
          <button 
            type="button" 
            onClick={handleSendEmails} 
            disabled={emailSending} 
            className={styles.bulkSendBtn}
          >
            {emailSending ? 'Sending Emails...' : '✉️ Send Profile Update Request Email'}
          </button>
        </div>
      )}

      {/* Schools Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.tableTh} style={{ width: '40px', textAlign: 'center' }}>
                <input 
                  type="checkbox" 
                  checked={schools.length > 0 && selectedSchools.length === schools.length} 
                  onChange={toggleSelectAll}
                  style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                />
              </th>
              <th className={styles.tableTh}>School Name</th>
              <th className={styles.tableTh}>Board</th>
              <th className={styles.tableTh}>Location</th>
              <th className={styles.tableTh}>Rating</th>
              <th className={styles.tableTh}>Verification</th>
              <th className={styles.tableTh}>Email Request</th>
              <th className={styles.tableTh}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {schools.map((school) => (
              <tr key={school._id} className={styles.tableTr}>
                <td className={styles.tableTd} style={{ textAlign: 'center' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedSchools.includes(school._id)} 
                    onChange={() => toggleSelectSchool(school._id)}
                    style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                  />
                </td>
                <td className={`${styles.tableTd} ${styles.schoolName}`}>{school.name}</td>
                <td className={styles.tableTd}>
                  <span className={styles.schoolBoard}>{school.board}</span>
                </td>
                <td className={`${styles.tableTd} ${styles.schoolLocation}`}>
                  {school.address?.city ? `${school.address.city}, ` : ''}{school.address?.state || ''}
                </td>
                <td className={`${styles.tableTd} ${styles.schoolRating}`}>
                  ⭐ {school.ratings?.overall ?? 'N/A'}
                </td>
                <td className={styles.tableTd}>
                  <span className={`${styles.badge} ${school.isVerified ? styles.badgeVerified : styles.badgePending}`}>
                    {school.isVerified ? 'VERIFIED' : 'PENDING'}
                  </span>
                </td>
                <td className={styles.tableTd}>
                  <span className={`${styles.badge} ${
                    school.updateRequestStatus === 'updated' ? styles.badgeUpdated :
                    school.updateRequestStatus === 'visited' ? styles.badgeVisited :
                    school.updateRequestStatus === 'sent' ? styles.badgeSent : styles.badgeNone
                  }`}>
                    {school.updateRequestStatus === 'updated' ? '✅ Updated' :
                     school.updateRequestStatus === 'visited' ? '👀 Visited' :
                     school.updateRequestStatus === 'sent' ? '📨 Sent' : '⚪ No Request'}
                  </span>
                </td>
                <td className={styles.tableTd}>
                  {!school.isVerified && (
                    <button 
                      onClick={() => handleVerify(school._id)} 
                      className={styles.btnVerify}
                    >
                      Verify
                    </button>
                  )}
                  <button 
                    onClick={() => handleEdit(school)} 
                    className={styles.btnEdit}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(school._id)} 
                    className={styles.btnDelete}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {schools.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                  No schools registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
