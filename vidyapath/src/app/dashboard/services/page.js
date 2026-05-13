'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

const SERVICE_TYPES = [
  { value: 'application_help', label: 'Scholarship Application Help', icon: '📝' },
  { value: 'document_verification', label: 'Document Verification', icon: '📎' },
  { value: 'scholarship_guidance', label: 'Career & Scholarship Guidance', icon: '🧭' },
  { value: 'technical_support', label: 'Technical Issue', icon: '⚙️' },
  { value: 'complaint', label: 'Lodge a Complaint', icon: '⚠️' },
  { value: 'feedback', label: 'Share Feedback', icon: '💬' },
  { value: 'other', label: 'Other Support', icon: '❓' },
];

export default function ServicesPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [form, setForm] = useState({ type: 'application_help', subject: '', description: '', priority: 'medium' });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.getServiceRequests();
      setRequests(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await api.createServiceRequest(form);
      if (res.success) {
        setMessage({ text: '✅ Support ticket created! Our team will reach out soon.', type: 'success' });
        setForm({ type: 'application_help', subject: '', description: '', priority: 'medium' });
        setShowForm(false);
        fetchRequests();
      }
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0B0B1A', marginBottom: '8px' }}>Support Center 🛠️</h1>
          <p style={{ color: '#6B7280', fontSize: '16px' }}>Need help with an application or have a query? We're here for you.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '14px 28px', background: showForm ? '#6B7280' : '#2563EB', color: 'white',
            border: 'none', borderRadius: '100px', fontWeight: '800', cursor: 'pointer',
            boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)'
          }}
        >
          {showForm ? 'Close Form' : 'New Support Request'}
        </button>
      </div>

      {message.text && (
        <div style={{
          padding: '16px 24px', borderRadius: '18px', marginBottom: '30px', fontWeight: '700', fontSize: '15px',
          background: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          color: message.type === 'success' ? '#059669' : '#DC2626',
          border: `1px solid ${message.type === 'success' ? '#10B981' : '#EF4444'}`,
          textAlign: 'center'
        }}>{message.text}</div>
      )}

      {showForm && (
        <div style={{
          background: 'white', border: '1px solid #E5E7EB', borderRadius: '30px',
          padding: '40px', marginBottom: '40px', boxShadow: '0 20px 50px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '30px', color: '#0B0B1A' }}>Create a Support Ticket</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Issue Type</label>
                <select name="type" value={form.type} onChange={handleChange} style={{ width: '100%', padding: '14px', border: '1px solid #E5E7EB', borderRadius: '16px', fontSize: '15px', background: '#F9FAFB' }}>
                  {SERVICE_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Priority</label>
                <select name="priority" value={form.priority} onChange={handleChange} style={{ width: '100%', padding: '14px', border: '1px solid #E5E7EB', borderRadius: '16px', fontSize: '15px', background: '#F9FAFB' }}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Subject</label>
              <input name="subject" value={form.subject} onChange={handleChange} required placeholder="Quick summary of your issue"
                style={{ width: '100%', padding: '14px', border: '1px solid #E5E7EB', borderRadius: '16px', fontSize: '15px', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '30px' }}>
              <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Detailed Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} required rows="5" placeholder="Tell us exactly what you need help with..."
                style={{ width: '100%', padding: '14px', border: '1px solid #E5E7EB', borderRadius: '16px', fontSize: '15px', outline: 'none', resize: 'vertical' }} />
            </div>
            <button type="submit" disabled={submitting} style={{
              padding: '16px 40px', background: '#2563EB', color: 'white',
              border: 'none', borderRadius: '100px', fontWeight: '900', cursor: 'pointer', fontSize: '16px',
              boxShadow: '0 15px 30px rgba(37, 99, 235, 0.2)'
            }}>{submitting ? 'Creating Ticket...' : 'Submit Support Request 🚀'}</button>
          </form>
        </div>
      )}

      {/* Requests History */}
      <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0B0B1A', marginBottom: '24px' }}>Recent Tickets</h2>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>Loading your requests...</div>
      ) : requests.length === 0 ? (
        <div style={{
          background: '#F9FAFB', border: '2px dashed #E5E7EB', borderRadius: '30px',
          padding: '80px', textAlign: 'center', color: '#6B7280'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>📬</div>
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0B0B1A', marginBottom: '8px' }}>No support tickets yet</h3>
          <p>Any requests you make will appear here for tracking.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {requests.map(req => (
            <div key={req._id} style={{
              background: 'white', border: '1px solid #E5E7EB', borderRadius: '24px',
              padding: '28px', transition: 'all 0.3s ease', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px' }}>{SERVICE_TYPES.find(t => t.value === req.type)?.icon || '🎫'}</span>
                  <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#0B0B1A' }}>{req.subject}</h4>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#6B7280' }}>
                    TICKET #{req._id.slice(-6).toUpperCase()}
                  </span>
                  <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                    Created on {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: '11px', fontWeight: '900', padding: '4px 12px', borderRadius: '100px',
                    textTransform: 'uppercase', letterSpacing: '1px',
                    background: req.status === 'open' ? '#EFF6FF' : req.status === 'in_progress' ? '#FFFBEB' : '#ECFDF5',
                    color: req.status === 'open' ? '#2563EB' : req.status === 'in_progress' ? '#D97706' : '#059669',
                    marginBottom: '4px'
                  }}>
                    {req.status.replace('_', ' ')}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF' }}>
                    Priority: <span style={{ color: req.priority === 'urgent' || req.priority === 'high' ? '#DC2626' : '#6B7280' }}>{req.priority}</span>
                  </div>
                </div>
                <button style={{
                  background: '#F3F4F6', border: 'none', padding: '10px 20px', borderRadius: '100px',
                  fontSize: '13px', fontWeight: '700', color: '#0B0B1A', cursor: 'pointer'
                }}>View Details</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
