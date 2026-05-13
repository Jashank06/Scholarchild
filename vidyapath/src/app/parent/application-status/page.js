'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

const statusColor = (status) => {
  if (status === 'approved') return '#10B981';
  if (status === 'rejected') return '#EF4444';
  if (status === 'under_review') return '#F59E0B';
  if (status === 'draft') return '#64748B';
  return '#2563EB';
};

export default function ParentApplicationStatusPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getParentApplications();
        setData(res.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#0B0B1A', marginBottom: '8px' }}>Application Status 📌</h1>
      <p style={{ color: '#6B7280', marginBottom: '28px' }}>Track the progress of applications submitted for your child.</p>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>Loading applications...</div>
      ) : data.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280', background: '#F8FAFC', borderRadius: '18px' }}>
          No applications found for linked children yet.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '24px' }}>
          {data.map((child) => (
            <div key={child.childId} style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '22px', padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '900', color: '#0B0B1A' }}>{child.name || 'Child'}</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>Grade {child.grade || 'N/A'} • {child.board || 'Board'}</div>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '800', background: '#EEF2FF', color: '#4F46E5', padding: '6px 12px', borderRadius: '999px' }}>
                  {child.applications.length} Applications
                </span>
              </div>

              {child.applications.length === 0 ? (
                <div style={{ padding: '18px', textAlign: 'center', color: '#6B7280', border: '1px dashed #E5E7EB', borderRadius: '16px' }}>
                  No applications yet for this child.
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {child.applications.map((item) => {
                    const color = statusColor(item.status);
                    return (
                      <div key={item._id} style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: '#0B0B1A' }}>{item.opportunityId?.title || 'Opportunity'}</div>
                          <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '6px' }}>
                            Applied on {new Date(item.appliedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: '800', color, background: `${color}1A`, padding: '6px 10px', borderRadius: '999px', textTransform: 'capitalize' }}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
