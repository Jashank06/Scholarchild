'use client';

import { useState, useEffect } from 'react';
import styles from './applications.module.css';
import api from '@/lib/api';

export default function ApplicationsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        setLoading(true);
        const res = await api.getApplications();
        setApplications(res.data || []);
      } catch (err) {
        console.error('Error fetching applications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const filtered = activeTab === 'all' ? applications : applications.filter(a => a.status === activeTab);

  const getStats = (status) => {
    if (status === 'all') return applications.length;
    return applications.filter(a => a.status === status).length;
  };

  const tabs = [
    { label: 'All', status: 'all' },
    { label: 'Applied', status: 'applied' },
    { label: 'Under Review', status: 'review' },
    { label: 'Approved', status: 'approved' },
    { label: 'Rejected', status: 'rejected' },
  ];

  const getStatusLabel = (s) => {
    const labels = {
      applied: 'Applied',
      review: 'Under Review',
      approved: 'Approved ✅',
      rejected: 'Rejected',
      pending: 'Pending',
    };
    return labels[s] || s;
  };

  const getTimelineDots = (status) => {
    if (status === 'rejected') return ['done', 'done', 'rejected', 'done'];
    if (status === 'approved') return ['done', 'done', 'done', 'done'];
    if (status === 'review') return ['done', 'done', 'pending', 'pending'];
    return ['done', 'pending', 'pending', 'pending'];
  };

  return (
    <div className={styles.appPage}>
      <div className={styles.pageHeader}>
        <h1>📋 My Applications</h1>
        <p>Track all your scholarship and competition applications in one place</p>
      </div>

      <div className={styles.statusTabs}>
        {tabs.map(tab => (
          <button key={tab.status} className={`${styles.statusTab} ${activeTab === tab.status ? styles.active : ''}`} onClick={() => setActiveTab(tab.status)}>
            {tab.label} <span className={styles.tabCount}>{getStats(tab.status)}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading applications...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '80px', textAlign: 'center', background: '#F9FAFB', borderRadius: '30px', border: '2px dashed #E5E7EB' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>📋</div>
          <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>No applications yet</h3>
          <p>Start applying to opportunities to track them here!</p>
        </div>
      ) : (
        <div className={styles.appList}>
          {filtered.map(app => (
            <div key={app._id} className={styles.appCard}>
              <div className={`${styles.appCardIcon} ${styles[app.opportunityId?.type || 'scholarship']}`}>
                {app.opportunityId?.type === 'scholarship' ? '🎓' : app.opportunityId?.type === 'competition' ? '🏆' : '🏛️'}
              </div>
              <div className={styles.appCardInfo}>
                <div className={styles.appCardTitle}>{app.opportunityId?.title || 'Unknown Opportunity'}</div>
                <div className={styles.appCardOrg}>{app.opportunityId?.organizer?.name}</div>
                {app.isExternalRedirect ? (
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', background: '#FEF3C7', color: '#D97706', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                      External Tracker
                    </span>
                    {(app.opportunityId?.application?.externalLink || app.opportunityId?.url) && (
                      <a href={app.opportunityId?.application?.externalLink || app.opportunityId?.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold', background: '#EFF6FF', padding: '4px 10px', borderRadius: '6px' }}>
                        Reopen Portal ↗
                      </a>
                    )}
                  </div>
                ) : (
                  <div className={styles.timeline}>
                    {getTimelineDots(app.status).map((step, i) => (
                      <span key={i}>
                        <span className={`${styles.timelineDot} ${step === 'done' ? styles.done : step === 'rejected' ? styles.done : styles.pending}`}></span>
                        {i < 3 && <span className={styles.timelineLine}></span>}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className={styles.appCardDate}>
                <div className={styles.appCardDateLabel}>Applied on</div>
                <div className={styles.appCardDateVal}>{new Date(app.createdAt).toLocaleDateString()}</div>
              </div>
              <span className={`${styles.appStatusBadge} ${styles[app.status]}`}>{getStatusLabel(app.status)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
