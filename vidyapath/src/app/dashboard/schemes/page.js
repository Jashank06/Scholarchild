'use client';

import { useState, useEffect } from 'react';
import styles from '../listings.module.css';
import api from '@/lib/api';

const categories = ['All', 'academic', 'general'];

export default function SchemesPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [bookmarked, setBookmarked] = useState(new Set());
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0 });
  const [applying, setApplying] = useState(null);
  const [applyingSuccess, setApplyingSuccess] = useState(null);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [showBigApplied, setShowBigApplied] = useState(false);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        setLoading(true);
        const params = { type: 'scheme' };
        if (activeCategory !== 'All') params.category = activeCategory.toLowerCase();
        
        const res = await api.getOpportunities(params);
        setSchemes(res.data || []);
        if (res.pagination) setStats({ total: res.pagination.total });
        
        // Fetch bookmarks state
        const meRes = await api.getMe();
        if (meRes.user?.bookmarkedOpportunities) {
          setBookmarked(new Set(meRes.user.bookmarkedOpportunities.map(b => b.toString())));
        }
        // Fetch applications state
        const appRes = await api.getApplications();
        if (appRes.data) {
          setAppliedIds(new Set(appRes.data.map(a => a.opportunityId?._id?.toString() || a.opportunityId?.toString())));
        }
      } catch (err) {
        console.error('Error fetching schemes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, [activeCategory]);

  const toggleBookmark = async (id, e) => {
    e.stopPropagation();
    try {
      await api.toggleBookmark(id);
      setBookmarked(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    }
  };

  const handleApply = async (item, e) => {
    e.stopPropagation();
    if (applying) return; // Prevent double clicks
    
    setApplying(item._id);
    
    try {
      const link = item.application?.externalLink || item.url;
      if (link) {
        // Submit application to backend so it persists
        await api.apply({ opportunityId: item._id });
        
        // Show success states
        setApplyingSuccess(item._id);
        setAppliedIds(prev => new Set([...prev, item._id]));
        
        // Show the big overlay
        setShowBigApplied(true);
        setTimeout(() => setShowBigApplied(false), 3000);

        setTimeout(() => {
          window.open(link, '_blank', 'noopener,noreferrer');
          setApplying(null);
          setApplyingSuccess(null);
        }, 1500);
      } else {
        window.location.href = `/dashboard/opportunities/${item._id}`;
      }
    } catch (err) {
      console.error('Error tracking apply:', err);
      setApplying(null);
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
          <h1>🏛️ Government Schemes <span className={styles.countBadge}>{stats.total}</span></h1>
          <p>Central and state government welfare schemes, fellowships, and educational aids</p>
        </div>
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

      <div className={styles.filterBar}>
        <select className={styles.filterSelect}><option>All States</option><option>Maharashtra</option><option>Rajasthan</option><option>Tamil Nadu</option><option>UP</option><option>Delhi</option></select>
        <select className={styles.filterSelect}><option>All Categories</option><option>SC</option><option>ST</option><option>OBC</option><option>General</option><option>EWS</option></select>
        <select className={styles.filterSelect}><option>All Grades</option>{Array.from({length: 12}, (_, i) => <option key={i}>Grade {i+1}</option>)}</select>
        <button className={styles.filterBtn}>🔽 Sort: Match Score</button>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading schemes...</div>
      ) : schemes.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No schemes found in this category.</div>
      ) : (
        <div className={styles.listingGrid}>
          {schemes.map((item) => {
            const deadline = getDaysLeft(item.dates?.applicationDeadline);
            const isUrgent = deadline && deadline.includes('days') && parseInt(deadline) <= 7;

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
                    <button 
                      className={styles.applyBtnSmall} 
                      onClick={(e) => handleApply(item, e)}
                      disabled={applying === item._id}
                      style={{ 
                        position: 'relative', 
                        overflow: 'hidden',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: (applyingSuccess === item._id || appliedIds.has(item._id)) ? '#10B981' : applying === item._id ? '#6B7280' : 'var(--gradient-primary)',
                        color: 'white',
                        transform: applying === item._id && !applyingSuccess ? 'scale(0.95)' : 'scale(1)',
                        boxShadow: (applyingSuccess === item._id || appliedIds.has(item._id)) ? '0 0 15px rgba(16, 185, 129, 0.5)' : 'none'
                      }}
                    >
                      {applyingSuccess === item._id ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          Redirecting...
                        </span>
                      ) : applying === item._id ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                            <line x1="12" y1="2" x2="12" y2="6"></line>
                            <line x1="12" y1="18" x2="12" y2="22"></line>
                            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                            <line x1="2" y1="12" x2="6" y2="12"></line>
                            <line x1="18" y1="12" x2="22" y2="12"></line>
                            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                          </svg>
                          Linking...
                        </span>
                      ) : appliedIds.has(item._id) ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          Applied
                        </span>
                      ) : (
                        'View Details →'
                      )}
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

      {/* Success Overlay */}
      {showBigApplied && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.95)', 
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, animation: 'fade-in 0.3s ease-out', backdropFilter: 'blur(10px)'
        }}>
          <div style={{ 
            width: '120px', height: '120px', background: '#10B981', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
            marginBottom: '24px', boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)',
            animation: 'success-pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h1 style={{ fontSize: '48px', fontWeight: '900', color: '#065F46', marginBottom: '8px' }}>Applied! 🎉</h1>
          <p style={{ fontSize: '18px', color: '#059669', fontWeight: '600' }}>Redirecting to portal...</p>
        </div>
      )}

      <style jsx global>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes success-pop {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes bounce-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
