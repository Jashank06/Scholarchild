'use client';

import { useState, useEffect } from 'react';
import styles from '../listings.module.css';
import api from '@/lib/api';
import AddOpportunityModal from '@/components/schools/AddOpportunityModal';

const examTabs = ['All', 'NEET', 'JEE', 'CUET', 'NDA', 'CLAT', 'UPSC', 'NTA'];

export default function DashboardCompetitiveExamsPage() {
  const [activeExam, setActiveExam] = useState('All');
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0 });
  const [filters, setFilters] = useState({ search: '', deadlineDays: '' });
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const params = { type: 'competition' };
        if (activeExam !== 'All') params.search = activeExam;
        
        const res = await api.getOpportunities(params);
        setExams(res.data || []);
        if (res.pagination) setStats({ total: res.pagination.total });
      } catch (err) {
        console.error('Error fetching competitive exams:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [activeExam]);

  const getDaysLeft = (deadline) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days left` : 'Expired';
  };

  const filteredExams = exams.filter((item) => {
    if (filters.search) {
      const query = filters.search.toLowerCase();
      const matches = [item.title, item.organizer?.name, item.category]
        .filter(Boolean)
        .some((val) => val.toLowerCase().includes(query));
      if (!matches) return false;
    }
    if (filters.deadlineDays && item.dates?.applicationDeadline) {
      const daysLeft = Math.ceil((new Date(item.dates.applicationDeadline) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysLeft > Number(filters.deadlineDays)) return false;
    }
    if (filters.deadlineDays && !item.dates?.applicationDeadline) return false;
    return true;
  });

  return (
    <div className={styles.listingPage}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1>🎯 Competitive Exams <span className={styles.countBadge}>{stats.total}</span></h1>
          <p>Track important entrance exams like NEET, JEE, CUET, and NTA updates.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} style={{
          padding: '10px 20px', background: '#2563EB', color: 'white',
          border: 'none', borderRadius: '100px', fontWeight: '800', cursor: 'pointer',
          fontSize: '13px', whiteSpace: 'nowrap',
        }}>➕ Add Exam</button>
      </div>

      <div className={styles.tabPills} style={{ overflowX: 'auto', paddingBottom: '8px' }}>
        {examTabs.map(tab => (
          <button 
            key={tab} 
            className={`${styles.pill} ${activeExam === tab ? styles.active : ''}`} 
            onClick={() => setActiveExam(tab)}
            style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '28px' }}>
        <input
          type="text"
          placeholder="Filter exams..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          style={{ flex: '1', minWidth: '220px', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '14px', fontSize: '14px' }}
        />
        <select
          value={filters.deadlineDays}
          onChange={(e) => setFilters({ ...filters, deadlineDays: e.target.value })}
          style={{ padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '14px', fontSize: '14px' }}
        >
          <option value="">Any Deadline</option>
          <option value="15">Within 15 days</option>
          <option value="30">Within 30 days</option>
          <option value="60">Within 60 days</option>
        </select>
      </div>

      <div className={styles.listingGrid}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', gridColumn: '1/-1' }}>Loading competitive exams...</div>
        ) : filteredExams.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', gridColumn: '1/-1' }}>No competitive exams found for this selection.</div>
        ) : (
          filteredExams.map((item) => {
            const deadline = getDaysLeft(item.dates?.applicationDeadline);
            return (
              <div key={item._id} className={styles.listCard}>
                <div className={styles.cardTop}>
                  <span className={`${styles.typeBadge}`} style={{background: '#EEF2FF', color: '#4F46E5', fontWeight: 'bold'}}>
                    ENTRANCE EXAM
                  </span>
                  <span className={`${styles.typeBadge}`} style={{background: 'var(--bg-secondary)', color: 'var(--text-secondary)'}}>
                    {item.category}
                  </span>
                </div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <div className={styles.cardOrganizer}>{item.organizer?.name}</div>
                
                {item.dates?.examDate && (
                  <div style={{ marginTop: '12px', fontSize: '13px', color: '#B91C1C', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📅</span> Exam Date: {new Date(item.dates.examDate).toLocaleDateString()}
                  </div>
                )}
                
                <div className={styles.cardBottom} style={{ marginTop: '16px' }}>
                  <span className={styles.deadlineText}>{deadline || 'No deadline specified'}</span>
                  <button
                    className={styles.applyBtnSmall}
                    onClick={() => {
                      const link = item.application?.externalLink || item.url;
                      if (link) {
                        window.open(link, '_blank', 'noopener,noreferrer');
                      } else {
                        window.location.href = `/dashboard/opportunities/${item._id}`;
                      }
                    }}
                  >View Details →</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <AddOpportunityModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSaved={() => window.location.reload()}
        defaultType="competition"
      />
    </div>
  );
}
