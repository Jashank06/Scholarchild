'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function AdminServicesPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Admins get all requests
      const res = await api.getServiceRequests();
      setRequests(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.request(`/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status, note })
      });
      setMessage('✅ Ticket status updated');
      setNote('');
      setSelectedRequest(null);
      fetchRequests();
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0B0B1A', marginBottom: '32px' }}>Support Ticket Management 🛠️</h1>

      {message && <div style={{ padding: '12px', background: '#ECFDF5', color: '#059669', borderRadius: '12px', fontWeight: '700', marginBottom: '20px' }}>{message}</div>}

      <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '24px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #E5E7EB', background: '#F9FAFB' }}>
              {['User', 'Subject', 'Type', 'Priority', 'Status', 'Date', 'Actions'].map(h => (
                <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req._id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: '700' }}>
                  {req.userId?.profile?.firstName} {req.userId?.profile?.lastName || 'User'}
                </td>
                <td style={{ padding: '14px 20px', fontSize: '14px' }}>{req.subject}</td>
                <td style={{ padding: '14px 20px', fontSize: '12px', color: '#6B7280' }}>{req.type}</td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{
                    fontSize: '10px', fontWeight: '800', padding: '4px 10px', borderRadius: '100px',
                    background: req.priority === 'urgent' ? '#FEF2F2' : '#F9FAFB',
                    color: req.priority === 'urgent' ? '#DC2626' : '#6B7280',
                  }}>{req.priority.toUpperCase()}</span>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{
                    fontSize: '10px', fontWeight: '800', padding: '4px 10px', borderRadius: '100px',
                    background: req.status === 'open' ? '#EFF6FF' : req.status === 'in_progress' ? '#FFFBEB' : '#ECFDF5',
                    color: req.status === 'open' ? '#2563EB' : req.status === 'in_progress' ? '#D97706' : '#059669',
                  }}>{req.status.replace('_', ' ').toUpperCase()}</span>
                </td>
                <td style={{ padding: '14px 20px', fontSize: '12px', color: '#6B7280' }}>
                  {new Date(req.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <button onClick={() => setSelectedRequest(req)} style={{
                    padding: '6px 12px', background: '#F3F4F6', border: 'none', borderRadius: '8px',
                    fontSize: '11px', fontWeight: '800', cursor: 'pointer'
                  }}>Review</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedRequest && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', padding: '40px', borderRadius: '30px', width: '500px', maxWidth: '90%' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '20px' }}>Review Ticket #{selectedRequest._id.slice(-6).toUpperCase()}</h3>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '10px' }}><strong>User:</strong> {selectedRequest.userId?.email}</p>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px' }}><strong>Issue:</strong> {selectedRequest.description}</p>
            
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Admin Note</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows="3" placeholder="Add a note for the user..."
              style={{ width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '14px', marginBottom: '20px' }} />

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => handleUpdateStatus(selectedRequest._id, 'in_progress')} style={{ flex: 1, padding: '12px', background: '#FFFBEB', color: '#D97706', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>In Progress</button>
              <button onClick={() => handleUpdateStatus(selectedRequest._id, 'resolved')} style={{ flex: 1, padding: '12px', background: '#ECFDF5', color: '#059669', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>Resolve</button>
              <button onClick={() => setSelectedRequest(null)} style={{ flex: 1, padding: '12px', background: '#F3F4F6', color: '#6B7280', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
