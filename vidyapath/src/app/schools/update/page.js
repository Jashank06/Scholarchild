'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import styles from './update.module.css';

function SchoolUpdateForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const [school, setSchool] = useState(null);
  const [categories, setCategories] = useState([]);
  const [fields, setFields] = useState([]);

  const [form, setForm] = useState({
    board: 'CBSE',
    type: 'private',
    city: '',
    district: '',
    state: '',
    email: '',
    phone: '',
    website: '',
    customFields: {}
  });

  useEffect(() => {
    if (!token) {
      setError('Invalid request. No token was provided in the update link.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await api.request(`/schools/public-profile/${token}`);
        if (res.success) {
          const { school: s, categories: c, fields: f } = res.data;
          setSchool(s);
          setCategories(c || []);
          setFields(f || []);
          
          setForm({
            board: s.board || 'CBSE',
            type: s.type || 'private',
            city: s.address?.city || '',
            district: s.address?.district || '',
            state: s.address?.state || '',
            email: s.contact?.email || '',
            phone: s.contact?.phone || '',
            website: s.contact?.website || '',
            customFields: s.customFields || {}
          });
        } else {
          setError(res.message || 'Could not fetch school details.');
        }
      } catch (err) {
        setError(err.message || 'Invalid or expired update token.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCustomFieldChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [key]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.request(`/schools/public-profile/${token}`, {
        method: 'POST',
        body: JSON.stringify({
          board: form.board,
          type: form.type,
          address: {
            city: form.city,
            district: form.district,
            state: form.state
          },
          contact: {
            email: form.email,
            phone: form.phone,
            website: form.website
          },
          customFields: form.customFields
        })
      });

      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.message || 'Failed to save updates.');
      }
    } catch (err) {
      setError(err.message || 'Error occurred while saving data.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.card}>
        <div className={styles.loadingCard}>
          <div className={styles.loadingSpinner}></div>
          <p style={{ color: '#475569', fontWeight: 600 }}>Loading school details...</p>
          <p style={{ color: '#94a3b8', fontSize: '13px' }}>Verifying your secure link token</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.card}>
        <div className={styles.errorCard}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2 style={{ color: '#0f172a', fontWeight: 800, fontSize: '22px', marginBottom: '8px' }}>Verification Link Failed</h2>
          <p style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.6, maxWidth: '420px', margin: '0 auto' }}>
            {error}
          </p>
          <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '16px' }}>
            Please ask your system administrator to generate and send a new link.
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className={styles.card}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>🎉</div>
          <h2 className={styles.successTitle}>Profile Updated Successfully</h2>
          <p className={styles.successText}>
            Thank you! Your institution's profile for <strong>{school?.name}</strong> has been updated in the VidyaPath database.
          </p>
          <p className={styles.successText} style={{ marginTop: '12px', fontSize: '13px' }}>
            This page can now be closed safely.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.portalBadge}>Institutional self-service portal</span>
        <h1 className={styles.title}>🏫 Update School Profile</h1>
        <p className={styles.subtitle}>Institutional verification dashboard for <strong>{school?.name}</strong></p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Core details */}
        <h3 className={styles.sectionTitle}>⚙️ Core Information</h3>
        
        <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
          <label className={styles.label}>School Name</label>
          <input 
            type="text" 
            value={school?.name || ''} 
            disabled 
            className={styles.input} 
          />
        </div>

        <div className={styles.grid2}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Academic Board</label>
            <select 
              name="board" 
              value={form.board} 
              onChange={handleInputChange} 
              className={styles.select}
            >
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE/ISC</option>
              <option value="State">State Board</option>
              <option value="IB">IB (International Baccalaureate)</option>
              <option value="IGCSE">IGCSE</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Institution Type</label>
            <select 
              name="type" 
              value={form.type} 
              onChange={handleInputChange} 
              className={styles.select}
            >
              <option value="private">Private</option>
              <option value="government">Government</option>
              <option value="aided">Govt. Aided</option>
            </select>
          </div>
        </div>

        {/* Location Details */}
        <h3 className={styles.sectionTitle}>📍 Location Address</h3>
        <div className={styles.grid2}>
          <div className={styles.formGroup}>
            <label className={styles.label}>City</label>
            <input 
              type="text" 
              name="city" 
              value={form.city} 
              onChange={handleInputChange} 
              placeholder="e.g. Gurugram"
              className={styles.input} 
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>District</label>
            <input 
              type="text" 
              name="district" 
              value={form.district} 
              onChange={handleInputChange} 
              placeholder="e.g. Gurugram"
              className={styles.input} 
            />
          </div>
        </div>

        <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
          <label className={styles.label}>State</label>
          <input 
            type="text" 
            name="state" 
            value={form.state} 
            onChange={handleInputChange} 
            placeholder="e.g. Haryana"
            className={styles.input} 
          />
        </div>

        {/* Contact Details */}
        <h3 className={styles.sectionTitle}>📞 Contact & Communication</h3>
        <div className={styles.grid2}>
          <div className={styles.formGroup}>
            <label className={styles.label}>School Email</label>
            <input 
              type="email" 
              name="email" 
              value={form.email} 
              onChange={handleInputChange} 
              placeholder="e.g. contact@school.edu"
              className={styles.input} 
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>School Phone</label>
            <input 
              type="text" 
              name="phone" 
              value={form.phone} 
              onChange={handleInputChange} 
              placeholder="e.g. 011-23456789"
              className={styles.input} 
            />
          </div>
        </div>

        <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
          <label className={styles.label}>School Website</label>
          <input 
            type="url" 
            name="website" 
            value={form.website} 
            onChange={handleInputChange} 
            placeholder="e.g. https://school.edu"
            className={styles.input} 
          />
        </div>

        {/* Dynamic Categories & Custom Fields */}
        {categories.map((category) => {
          const categoryFields = fields.filter((f) => f.categoryId === category._id);
          if (categoryFields.length === 0) return null;

          return (
            <div key={category._id} className={styles.categoryBlock}>
              <div className={styles.categoryTitle}>
                <span>📂</span> {category.name}
              </div>
              
              <div className={styles.grid2}>
                {categoryFields.map((field) => {
                  const currentValue = form.customFields[field.key] !== undefined ? form.customFields[field.key] : '';

                  return (
                    <div key={field._id} className={styles.formGroup} style={{ gridColumn: field.type === 'textarea' ? 'span 2' : 'auto' }}>
                      {field.type === 'boolean' ? (
                        <label className={styles.checkboxContainer}>
                          <input 
                            type="checkbox" 
                            checked={!!currentValue} 
                            onChange={(e) => handleCustomFieldChange(field.key, e.target.checked)}
                            className={styles.checkbox}
                          />
                          <span className={styles.checkboxLabel}>{field.label}</span>
                        </label>
                      ) : (
                        <>
                          <label className={styles.label}>{field.label}</label>
                          {field.type === 'select' ? (
                            <select 
                              value={currentValue} 
                              onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                              className={styles.select}
                            >
                              <option value="">Select option</option>
                              {(field.options || '').split(',').map((opt) => (
                                <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
                              ))}
                            </select>
                          ) : field.type === 'textarea' ? (
                            <textarea 
                              value={currentValue} 
                              onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                              placeholder={`Enter ${field.label.toLowerCase()}`}
                              className={styles.textarea}
                              rows={3}
                            />
                          ) : (
                            <input 
                              type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'} 
                              value={currentValue} 
                              onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                              placeholder={`Enter ${field.label.toLowerCase()}`}
                              className={styles.input} 
                            />
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <button type="submit" disabled={saving} className={styles.submitBtn}>
          {saving ? 'Saving Profile Updates...' : '💾 Submit Profile Updates'}
        </button>
      </form>
    </div>
  );
}

export default function PublicSchoolUpdatePage() {
  return (
    <div className={styles.container}>
      <Suspense fallback={
        <div className={styles.card}>
          <div className={styles.loadingCard}>
            <div className={styles.loadingSpinner}></div>
            <p style={{ color: '#475569', fontWeight: 600 }}>Initializing portal...</p>
          </div>
        </div>
      }>
        <SchoolUpdateForm />
      </Suspense>
    </div>
  );
}
