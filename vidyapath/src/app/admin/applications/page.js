'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', search: '' });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.getApplications(filter);
      setApplications(res.data || []);
    } catch (e) {
      console.error(e);
      setMessage({ text: 'Failed to fetch applications', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await api.request(`/applications/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      setMessage({ text: `✅ Status updated to ${status}`, type: 'success' });
      fetchApplications();
    } catch (e) {
      setMessage({ text: e.message, type: 'error' });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0B0B1A', marginBottom: '8px' }}>Application Management 📋</h1>
        <p style={{ color: '#6B7280' }}>Track and manage all user applications across the platform.</p>
      </div>

      {message.text && (
        <div style={{
          padding: '14px', borderRadius: '14px', marginBottom: '24px', fontWeight: '700', fontSize: '14px',
          background: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          color: message.type === 'success' ? '#059669' : '#DC2626',
          border: `1px solid ${message.type === 'success' ? '#10B981' : '#EF4444'}`,
        }}>{message.text}</div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        <input 
          type="text" 
          placeholder="Search by student or opportunity..." 
          value={filter.search}
          onChange={(e) => setFilter({...filter, search: e.target.value})}
          style={{ flex: '1', maxWidth: '300px', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '14px', outline: 'none' }}
        />
        <select 
          value={filter.status} 
          onChange={(e) => setFilter({...filter, status: e.target.value})}
          style={{ padding: '12px', border: '1px solid #E5E7EB', borderRadius: '14px' }}
        >
          <option value="">All Statuses</option>
          <option value="applied">Applied</option>
          <option value="under_review">Under Review</option>
          <option value="interview">Interview</option>
          <option value="selected">Selected</option>
          <option value="rejected">Rejected</option>
        </select>
        <button onClick={fetchApplications} style={{
          padding: '12px 24px', background: '#2563EB', color: 'white',
          border: 'none', borderRadius: '100px', fontWeight: '800', cursor: 'pointer',
        }}>Search</button>
      </div>

      <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '24px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #E5E7EB', background: '#F9FAFB' }}>
              {['Student', 'Opportunity', 'Status', 'Date', 'Actions'].map(h => (
                <th key={h} style={{ padding: '16px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app._id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '700' }}>{app.userId?.profile?.firstName} {app.userId?.profile?.lastName}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>{app.userId?.email}</div>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '700' }}>{app.opportunity?.title}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>{app.opportunity?.type?.toUpperCase()}</div>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{
                    fontSize: '10px', fontWeight: '800', padding: '4px 10px', borderRadius: '100px',
                    background: app.status === 'selected' ? '#ECFDF5' : app.status === 'rejected' ? '#FEF2F2' : '#EFF6FF',
                    color: app.status === 'selected' ? '#059669' : app.status === 'rejected' ? '#DC2626' : '#2563EB',
                    textTransform: 'uppercase'
                  }}>{app.status.replace('_', ' ')}</span>
                </td>
                <td style={{ padding: '16px 20px', fontSize: '13px', color: '#6B7280' }}>
                  {new Date(app.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <select 
                    disabled={updatingId === app._id}
                    value={app.status}
                    onChange={(e) => handleUpdateStatus(app._id, e.target.value)}
                    style={{ padding: '6px 10px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px' }}
                  >
                    <option value="applied">Applied</option>
                    <option value="under_review">Under Review</option>
                    <option value="interview">Interview</option>
                    <option value="selected">Selected</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {applications.length === 0 && !loading && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>No applications found.</div>
        )}
      </div>
    </div>
  );
}
