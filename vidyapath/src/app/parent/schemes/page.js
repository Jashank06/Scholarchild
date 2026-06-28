'use client';

import { useState, useEffect } from 'react';
import styles from '../../dashboard/listings.module.css';
import api from '@/lib/api';
import AddOpportunityModal from '@/components/schools/AddOpportunityModal';

const categories = ['All', 'academic', 'general'];

export default function ParentSchemesPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0 });
  const [filters, setFilters] = useState({ search: '', deadlineDays: '', rewardType: '' });
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        setLoading(true);
        const params = { type: 'scheme' };
        if (activeCategory !== 'All') params.category = activeCategory.toLowerCase();
        
        const res = await api.getOpportunities(params);
        setSchemes(res.data || []);
        if (res.pagination) setStats({ total: res.pagination.total });
      } catch (err) {
        console.error('Error fetching schemes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, [activeCategory]);

  const getDaysLeft = (deadline) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days left` : 'Expired';
  };

  const filteredSchemes = schemes.filter((item) => {
    if (filters.search) {
      const query = filters.search.toLowerCase();
      const matches = [item.title, item.organizer?.name, item.category]
        .filter(Boolean)
        .some((val) => val.toLowerCase().includes(query));
      if (!matches) return false;
    }
    if (filters.rewardType && (item.rewards?.type || 'cash') !== filters.rewardType) return false;
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
          <h1>🏛️ Govt. Schemes for Children <span className={styles.countBadge}>{stats.total}</span></h1>
          <p>Verified state and central government schemes to support your child's education.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} style={{
          padding: '12px 24px', background: '#2563EB', color: 'white',
          border: 'none', borderRadius: '100px', fontWeight: '800', cursor: 'pointer',
          fontSize: '14px', whiteSpace: 'nowrap',
        }}>➕ Add Scheme</button>
      </div>

      <div className={styles.tabPills}>
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`${styles.pill} ${activeCategory === cat ? styles.active : ''}`} 
            onClick={() => setActiveCategory(cat)}
            style={{ textTransform: 'capitalize' }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '28px' }}>
        <input
          type="text"
          placeholder="Search schemes..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          style={{ flex: '1', minWidth: '220px', padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '14px', fontSize: '14px' }}
        />
        <select
          value={filters.rewardType}
          onChange={(e) => setFilters({ ...filters, rewardType: e.target.value })}
          style={{ padding: '12px 16px', border: '1px solid #E5E7EB', borderRadius: '14px', fontSize: '14px' }}
        >
          <option value="">All Reward Types</option>
          <option value="cash">Cash</option>
          <option value="in-kind">In-kind</option>
          <option value="tuition">Tuition</option>
        </select>
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
          <div style={{ padding: '2rem', textAlign: 'center', gridColumn: '1/-1' }}>Loading schemes...</div>
        ) : filteredSchemes.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', gridColumn: '1/-1' }}>No schemes found.</div>
        ) : (
          filteredSchemes.map((item) => {
            const deadline = getDaysLeft(item.dates?.applicationDeadline);
            return (
              <div key={item._id} className={styles.listCard}>
                <div className={styles.cardTop}>
                  <span className={`${styles.typeBadge} ${styles[item.type]}`}>{item.type}</span>
                  <span className={`${styles.typeBadge}`} style={{background: 'var(--bg-secondary)', color: 'var(--text-secondary)'}}>
                    {item.category}
                  </span>
                </div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <div className={styles.cardOrganizer}>{item.organizer?.name}</div>
                <div className={styles.rewardRow}>
                  <span className={styles.rewardAmount}>{item.rewards?.cashAmount ? `₹${item.rewards.cashAmount}` : item.rewards?.description || 'View details'}</span>
                  <span className={styles.rewardType}>{item.rewards?.type || 'cash'}</span>
                </div>
                <div className={styles.cardBottom}>
                  <span className={styles.deadlineText}>{deadline || 'No deadline'}</span>
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
        defaultType="scheme"
      />
    </div>
  );
}
