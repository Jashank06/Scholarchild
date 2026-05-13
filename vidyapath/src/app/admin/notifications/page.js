'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function AdminNotificationsPage() {
  const [formData, setFormData] = useState({
    target: 'all',
    targetRole: 'student',
    targetId: '',
    title: '',
    message: '',
    type: 'system',
    link: '',
    icon: '🔔'
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await api.request('/notifications/admin/push', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      if (res.success) {
        setStatus({ type: 'success', message: res.message });
        setFormData({ ...formData, title: '', message: '', link: '' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0F172A', marginBottom: '8px' }}>📢 Broadcast System</h1>
      <p style={{ color: '#64748B', marginBottom: '40px' }}>Send mass notifications to users across the platform.</p>

      <div style={{ 
        background: 'white', padding: '40px', borderRadius: '32px', 
        border: '1px solid #E2E8F0', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' 
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Target Audience</label>
              <select 
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0' }}
              >
                <option value="all">All Users</option>
                <option value="role">By Role</option>
                <option value="single">Single User (ID)</option>
              </select>
            </div>

            {formData.target === 'role' && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Select Role</label>
                <select 
                  value={formData.targetRole}
                  onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                  style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0' }}
                >
                  <option value="student">Students</option>
                  <option value="parent">Parents</option>
                  <option value="school">Schools</option>
                  <option value="university">Universities</option>
                </select>
              </div>
            )}

            {formData.target === 'single' && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>User ID</label>
                <input 
                  type="text"
                  value={formData.targetId}
                  onChange={(e) => setFormData({ ...formData, targetId: e.target.value })}
                  placeholder="Paste User MongoDB ID"
                  style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0' }}
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Notif Type</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0' }}
              >
                <option value="system">🚀 System Update</option>
                <option value="deadline">⏰ Deadline Reminder</option>
                <option value="new_opportunity">🎓 New Opportunity</option>
                <option value="achievement">🏅 Achievement</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Notification Title</label>
            <input 
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. New Scholarship Available!"
              required
              style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Message Body</label>
            <textarea 
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Detailed description..."
              required
              rows={4}
              style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0', fontFamily: 'inherit' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase' }}>Redirect Link (Optional)</label>
            <input 
              type="text"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder="e.g. /dashboard/scholarships"
              style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0' }}
            />
          </div>

          {status && (
            <div style={{ 
              padding: '16px', borderRadius: '14px', 
              background: status.type === 'success' ? '#ECFDF5' : '#FEF2F2',
              color: status.type === 'success' ? '#059669' : '#DC2626',
              fontSize: '14px', fontWeight: '700'
            }}>
              {status.type === 'success' ? '✅' : '❌'} {status.message}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            style={{ 
              padding: '16px', borderRadius: '16px', background: 'linear-gradient(135deg, #2563EB 0%, #6366F1 100%)',
              color: 'white', border: 'none', fontWeight: '900', fontSize: '16px', cursor: 'pointer',
              boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)', opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Sending Broadcast...' : '🚀 Send Notification'}
          </button>
        </form>
      </div>
    </div>
  );
}
