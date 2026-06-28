'use client';

import { useState, useEffect, useRef } from 'react';
import styles from '../listings.module.css';
import api from '@/lib/api';
import FilterBar from '@/components/dashboard/FilterBar';
import AddOpportunityModal from '@/components/schools/AddOpportunityModal';

const categories = ['All', 'olympiad', 'science', 'coding', 'quiz', 'arts', 'writing'];
const ITEMS_PER_PAGE = 20;

export default function CompetitionsPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [filters, setFilters] = useState({ sort: 'deadline' });
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0 });
  const [bookmarked, setBookmarked] = useState(new Set());
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [applying, setApplying] = useState(null);
  const [applyingSuccess, setApplyingSuccess] = useState(null);
  const [showBigApplied, setShowBigApplied] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const searchTimer = useRef(null);

  const fetchListings = async (cat, fltrs) => {
    try {
      setLoading(true);
      const params = { type: 'competition', limit: ITEMS_PER_PAGE };
      if (cat !== 'All') params.category = cat.toLowerCase();
      Object.entries(fltrs).forEach(([key, val]) => { if (val && val !== '') params[key] = val; });
      const res = await api.getOpportunities(params);
      setCompetitions(res.data || []);
      if (res.pagination) setStats({ total: res.pagination.total });
      const meRes = await api.getMe();
      if (meRes.user?.bookmarkedOpportunities) setBookmarked(new Set(meRes.user.bookmarkedOpportunities.map(b => b.toString())));
      const appRes = await api.getApplications();
      if (appRes.data) setAppliedIds(new Set(appRes.data.map(a => a.opportunityId?._id?.toString() || a.opportunityId?.toString())));
    } catch (err) {
      console.error('Error fetching competitions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchListings(activeCategory, filters), 300);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [activeCategory, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => { const n = { ...prev }; if (value) n[key] = value; else delete n[key]; return n; });
  };

  const resetFilters = () => { setFilters({ sort: 'deadline' }); setActiveCategory('All'); };

  const toggleBookmark = async (id, e) => {
    e.stopPropagation();
    try { await api.toggleBookmark(id); setBookmarked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); } catch (err) { console.error(err); }
  };

  const handleApply = async (item, e) => {
    e.stopPropagation();
    if (applying) return;
    setApplying(item._id);
    const link = item.application?.externalLink || item.url;
    if (!link) { window.location.href = `/dashboard/opportunities/${item._id}`; return; }
    const redirect = () => { window.open(link, '_blank', 'noopener,noreferrer'); setApplying(null); setApplyingSuccess(null); };
    if (appliedIds.has(item._id)) { redirect(); return; }
    try {
      await api.apply({ opportunityId: item._id });
      setApplyingSuccess(item._id);
      setAppliedIds(prev => new Set([...prev, item._id]));
      setShowBigApplied(true);
      setTimeout(() => setShowBigApplied(false), 3000);
      setTimeout(redirect, 1500);
    } catch (err) {
      if (err?.message?.includes('already applied')) { setAppliedIds(prev => new Set([...prev, item._id])); redirect(); }
      else { setApplying(null); }
    }
  };

  const getDaysLeft = (deadline) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days left` : 'Expired';
  };

  return (
    <div className={styles.listingPage}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1>🏆 Competitions <span className={styles.countBadge}>{stats.total}</span></h1>
          <p>Olympiads, hackathons, quizzes and coding challenges for students</p>
        </div>
        <button onClick={() => setShowAddModal(true)} style={{
          padding: '10px 20px', background: '#2563EB', color: 'white',
          border: 'none', borderRadius: '100px', fontWeight: '800', cursor: 'pointer',
          fontSize: '13px', whiteSpace: 'nowrap',
        }}>➕ Add</button>
      </div>

      <FilterBar
        type="competition"
        filters={filters}
        onChange={handleFilterChange}
        onReset={resetFilters}
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading competitions...</div>
      ) : competitions.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No competitions found matching your filters.</div>
      ) : (
        <div className={styles.listingGrid}>
          {competitions.map((item) => {
            const deadline = getDaysLeft(item.dates?.applicationDeadline);
            const isUrgent = deadline && deadline.includes('days') && parseInt(deadline) <= 7;
            return (
              <div key={item._id} className={styles.listCard}>
                <div className={styles.cardTop}>
                  <span className={`${styles.typeBadge} ${styles[item.type]}`}>{item.type}</span>
                  <span className={`${styles.typeBadge}`} style={{background: 'var(--bg-secondary)', color: 'var(--text-secondary)'}}>{item.category}</span>
                </div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <div className={styles.cardOrganizer}>{item.organizer?.name}</div>
                <div className={styles.cardTags}>
                  {item.eligibility?.grades?.length > 0 && <span className={styles.cardTag}>Grades {Math.min(...item.eligibility.grades)}-{Math.max(...item.eligibility.grades)}</span>}
                  {item.eligibility?.states?.length > 0 ? <span className={styles.cardTag}>{item.eligibility.states[0]}</span> : <span className={styles.cardTag}>All India</span>}
                  {item.tags?.slice(0, 2).map((tag, i) => <span key={i} className={styles.cardTag}>{tag}</span>)}
                </div>
                <div className={styles.rewardRow}>
                  <span className={styles.rewardAmount}>{item.rewards?.cashAmount ? `₹${item.rewards.cashAmount}` : item.rewards?.description || 'View details'}</span>
                  <span className={styles.rewardType}>{item.rewards?.type || 'cash'}</span>
                </div>
                <div className={styles.cardBottom}>
                  <span className={`${styles.deadlineText} ${isUrgent ? styles.urgent : styles.normal}`}>
                    {deadline ? (isUrgent ? '🔴 ' : '🕐 ') + deadline : 'No deadline'}
                  </span>
                  <div className={styles.cardActions}>
                    <button className={styles.applyBtnSmall} onClick={(e) => handleApply(item, e)} disabled={applying === item._id}
                      style={{ position: 'relative', overflow: 'hidden', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: (applyingSuccess === item._id || appliedIds.has(item._id)) ? '#10B981' : applying === item._id ? '#6B7280' : 'var(--gradient-primary)',
                        color: 'white', transform: applying === item._id && !applyingSuccess ? 'scale(0.95)' : 'scale(1)',
                        boxShadow: (applyingSuccess === item._id || appliedIds.has(item._id)) ? '0 0 15px rgba(16, 185, 129, 0.5)' : 'none' }}>
                      {applyingSuccess === item._id ? <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}><polyline points="20 6 9 17 4 12"></polyline></svg>Redirecting...</span>
                      : applying === item._id ? <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                          <line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line>
                          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                          <line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line>
                          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                        </svg>Linking...</span>
                      : appliedIds.has(item._id) ? <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>Applied</span>
                      : 'Register →'}
                    </button>
                    <button className={`${styles.bookmarkSmall} ${bookmarked.has(item._id) ? styles.saved : ''}`} onClick={(e) => toggleBookmark(item._id, e)}>
                      {bookmarked.has(item._id) ? '★' : '☆'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && stats.total > 0 && (
        <div className={styles.pagination}>
          <button className={styles.pageBtn}>←</button>
          <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
          <button className={styles.pageBtn}>→</button>
        </div>
      )}

      {showBigApplied && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 9999, animation: 'fade-in 0.3s ease-out', backdropFilter: 'blur(10px)' }}>
          <div style={{ width: '120px', height: '120px', background: '#10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '24px', boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)', animation: 'success-pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h1 style={{ fontSize: '48px', fontWeight: '900', color: '#065F46', marginBottom: '8px' }}>Applied! 🎉</h1>
          <p style={{ fontSize: '18px', color: '#059669', fontWeight: '600' }}>Redirecting to competition portal...</p>
        </div>
      )}

      <style jsx global>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes success-pop { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes bounce-in { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>

      <AddOpportunityModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSaved={() => window.location.reload()}
        defaultType="competition"
      />
    </div>
  );
}
