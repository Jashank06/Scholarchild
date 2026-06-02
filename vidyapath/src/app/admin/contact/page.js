'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function AdminContactPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchEnquiries(); }, []);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await api.getContactEnquiries();
      setEnquiries(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await api.updateContactEnquiry(id, { status });
      setMessage(`✅ Status updated to ${status}`);
      setSelected(null);
      fetchEnquiries();
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0B0B1A', marginBottom: '32px' }}>Contact Enquiries 📬</h1>

      {message && <div style={{ padding: '12px', background: '#ECFDF5', color: '#059669', borderRadius: '12px', fontWeight: '700', marginBottom: '20px' }}>{message}</div>}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['all', 'new', 'read', 'replied'].map((s) => (
          <button
            key={s}
            onClick={async () => {
              setLoading(true);
              try {
                const res = s === 'all' ? await api.getContactEnquiries() : await api.getContactEnquiries({ status: s });
                setEnquiries(res.data || []);
              } catch (e) { console.error(e); }
              finally { setLoading(false); }
            }}
            style={{
              padding: '8px 16px', border: 'none', borderRadius: '100px', fontWeight: '700', fontSize: '12px', cursor: 'pointer',
              background: '#F3F4F6', color: '#374151', textTransform: 'capitalize',
            }}
          >{s === 'all' ? 'All' : s}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF', fontSize: '14px' }}>Loading enquiries...</div>
      ) : enquiries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF', fontSize: '14px' }}>No enquiries found.</div>
      ) : (
        <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '24px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E7EB', background: '#F9FAFB' }}>
                {['Name', 'Email', 'Mobile', 'Subject', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '800', color: '#6B7280', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enquiries.map((enq) => (
                <tr key={enq._id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: '700' }}>{enq.firstName} {enq.lastName}</td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#6B7280' }}>{enq.email}</td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#6B7280' }}>{enq.mobile}</td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#374151' }}>{enq.subject}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      fontSize: '10px', fontWeight: '800', padding: '4px 10px', borderRadius: '100px',
                      background: enq.status === 'new' ? '#EFF6FF' : enq.status === 'read' ? '#FFFBEB' : '#ECFDF5',
                      color: enq.status === 'new' ? '#2563EB' : enq.status === 'read' ? '#D97706' : '#059669',
                    }}>{enq.status.toUpperCase()}</span>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '12px', color: '#6B7280' }}>
                    {new Date(enq.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <button onClick={() => setSelected(enq)} style={{
                      padding: '6px 12px', background: '#F3F4F6', border: 'none', borderRadius: '8px',
                      fontSize: '11px', fontWeight: '800', cursor: 'pointer'
                    }}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', padding: '40px', borderRadius: '30px', width: '500px', maxWidth: '90%' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>{selected.firstName} {selected.lastName}</h3>
            <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '20px' }}>
              {new Date(selected.createdAt).toLocaleString()}
            </p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <span style={{ padding: '4px 12px', background: '#EFF6FF', color: '#2563EB', borderRadius: '100px', fontSize: '12px', fontWeight: '700' }}>{selected.email}</span>
              <span style={{ padding: '4px 12px', background: '#F3F4F6', color: '#374151', borderRadius: '100px', fontSize: '12px', fontWeight: '700' }}>{selected.mobile}</span>
              <span style={{ padding: '4px 12px', background: '#FFF7ED', color: '#C2410C', borderRadius: '100px', fontSize: '12px', fontWeight: '700' }}>{selected.subject}</span>
            </div>
            {selected.message && (
              <div style={{ background: '#F9FAFB', padding: '16px', borderRadius: '16px', marginBottom: '24px' }}>
                <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: 0 }}>{selected.message}</p>
              </div>
            )}
            <label style={{ fontSize: '11px', fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Update Status</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => handleStatus(selected._id, 'read')} style={{ flex: 1, padding: '12px', background: '#FFFBEB', color: '#D97706', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>Mark Read</button>
              <button onClick={() => handleStatus(selected._id, 'replied')} style={{ flex: 1, padding: '12px', background: '#ECFDF5', color: '#059669', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>Mark Replied</button>
              <button onClick={() => setSelected(null)} style={{ flex: 1, padding: '12px', background: '#F3F4F6', color: '#6B7280', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
