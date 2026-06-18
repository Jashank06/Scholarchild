'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

const FORMAT_LABEL = {
  'name': 'Name',
  'type': 'Type',
  'board': 'Board',
  'affiliation': 'Affiliation',
  'category': 'Category',
  'address.city': 'City',
  'address.state': 'State',
  'address.district': 'District',
  'address.pincode': 'Pincode',
  'contact.email': 'Email',
  'contact.phone': 'Phone',
  'contact.website': 'Website',
  'venue.city': 'City',
  'venue.state': 'State',
  'venue.fullAddress': 'Address',
  'organizer.name': 'Organizer',
  'organizer.contact': 'Organizer Contact',
  'organizer.website': 'Organizer Website',
  'description': 'Description',
  'eligibility': 'Eligibility',
  'prizes': 'Prizes',
  'fees': 'Fees',
  'status': 'Status',
  'eventDate': 'Event Date',
  'registrationDeadline': 'Reg. Deadline',
};

const FORMAT_VAL = (key, val) => {
  if (val === undefined || val === null || val === '') return '(empty)';
  if (key === 'fees') return `₹${val}`;
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  return String(val);
};

export default function HistoryPanel({ entityType, entityId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getActivityHistory(entityType, entityId);
      setLogs(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (entityId) fetchHistory();
  }, [entityType, entityId]);

  const getInitials = (name) => {
    if (!name) return '?'; return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (date) => {
    const d = new Date(date); const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return (
    <div style={{ background: '#F9FAFB', borderRadius: '12px', padding: '20px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>
      Loading history...
    </div>
  );

  if (logs.length === 0) return (
    <div style={{ background: '#F9FAFB', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
      <div style={{ fontSize: '24px', marginBottom: '8px' }}>🕐</div>
      <p style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: '600' }}>No activity yet</p>
    </div>
  );

  return (
    <div>
      {/* Timeline */}
      <div style={{ position: 'relative' }}>
        {/* Vertical line */}
        <div style={{
          position: 'absolute', left: '11px', top: '8px', bottom: '8px',
          width: '2px', background: 'linear-gradient(to bottom, #E5E7EB, #D1D5DB)',
        }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {logs.map((log, idx) => {
            const userName = log.userId?.profile?.firstName
              ? `${log.userId.profile.firstName} ${log.userId?.profile?.lastName?.[0] || ''}.`
              : 'Unknown';
            const avatar = getInitials(userName);
            const isFirst = idx === 0;
            const isCreate = log.action === 'created';

            return (
              <div key={log._id} style={{
                position: 'relative', paddingLeft: '30px', paddingBottom: '12px',
                opacity: isFirst ? 1 : 0.75,
              }}>
                {/* Dot */}
                <div style={{
                  position: 'absolute', left: '4px', top: '5px',
                  width: isCreate ? '16px' : '10px', height: isCreate ? '16px' : '10px',
                  borderRadius: '50%',
                  background: isCreate ? '#10B981' : '#F59E0B',
                  border: '2px solid white',
                  boxShadow: isFirst ? `0 0 0 3px ${isCreate ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}` : 'none',
                  zIndex: 1,
                }} />

                {/* Content */}
                <div style={{
                  background: isFirst ? '#fff' : '#FAFAFA',
                  borderRadius: '12px', padding: '12px 14px',
                  border: isFirst ? '1px solid #E5E7EB' : '1px solid #F3F4F6',
                }}>
                  {/* User + Action + Time */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <div style={{
                      width: '22px', height: '22px', borderRadius: '50%',
                      background: isCreate ? 'linear-gradient(135deg, #34D399, #10B981)' : 'linear-gradient(135deg, #FBBF24, #F59E0B)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: '700', fontSize: '10px', flexShrink: 0,
                    }}>
                      {avatar}
                    </div>
                    <span style={{ fontWeight: '700', fontSize: '12px', color: '#1F2937', flex: 1 }}>
                      {userName}
                    </span>
                    <span style={{
                      fontSize: '10px', fontWeight: '800',
                      padding: '2px 8px', borderRadius: '100px',
                      background: isCreate ? '#ECFDF5' : '#FEF3C7',
                      color: isCreate ? '#059669' : '#D97706',
                    }}>
                      {isCreate ? 'Created' : 'Edited'}
                    </span>
                  </div>

                  {/* Timestamp */}
                  <div style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: isCreate ? 0 : '6px' }}>
                    🕐 {formatDate(log.createdAt)} at {formatTime(log.createdAt)}
                  </div>

                  {/* Changes for updates */}
                  {!isCreate && log.changes && Object.keys(log.changes).length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '2px' }}>
                      {Object.entries(log.changes).map(([key, change]) => (
                        <div key={key} style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          fontSize: '11px', padding: '3px 8px',
                          background: '#FFFBEB', borderRadius: '6px',
                        }}>
                          <span style={{ fontWeight: '700', color: '#92400E', minWidth: '70px' }}>
                            {FORMAT_LABEL[key] || key}:
                          </span>
                          <span style={{
                            color: '#DC2626', textDecoration: 'line-through',
                            maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {FORMAT_VAL(key, change.from)}
                          </span>
                          <span style={{ color: '#9CA3AF', fontWeight: '700' }}>→</span>
                          <span style={{ color: '#059669', fontWeight: '600', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {FORMAT_VAL(key, change.to)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
