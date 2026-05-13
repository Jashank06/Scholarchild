'use client';

import { useState, useEffect } from 'react';
import styles from '../listings.module.css';
import api from '@/lib/api';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setLoading(true);
        const res = await api.getBookmarks();
        setBookmarks(res.data || []);
      } catch (err) {
        console.error('Error fetching bookmarks:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, []);

  const toggleBookmark = async (id, e) => {
    e.stopPropagation();
    try {
      await api.toggleBookmark(id);
      setBookmarks(prev => prev.filter(b => b._id !== id));
    } catch (err) {
      console.error('Error toggling bookmark:', err);
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
          <h1>🔖 Bookmarks <span className={styles.countBadge}>{bookmarks.length}</span></h1>
          <p>Your saved scholarships, competitions, and schemes</p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading bookmarks...</div>
      ) : bookmarks.length === 0 ? (
        <div className={styles.emptyState} style={{ padding: '80px', textAlign: 'center' }}>
          <span className={styles.emptyIcon} style={{ fontSize: '64px', display: 'block', marginBottom: '20px' }}>🔖</span>
          <div className={styles.emptyText} style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>No bookmarks yet</div>
          <div className={styles.emptySub} style={{ color: 'var(--text-secondary)' }}>Save opportunities you're interested in to find them here</div>
        </div>
      ) : (
        <div className={styles.listingGrid}>
          {bookmarks.map((item) => {
            const deadline = getDaysLeft(item.dates?.applicationDeadline);
            const isUrgent = deadline && deadline.includes('days') && parseInt(deadline) <= 7;
            
            return (
              <div key={item._id} className={styles.listCard}>
                <div className={styles.cardTop}>
                  <span className={`${styles.typeBadge} ${styles[item.type]}`}>{item.type}</span>
                  {item.matchScore && (
                    <span className={`${styles.matchPill} ${item.matchScore >= 80 ? styles.high : styles.medium}`}>
                      🎯 {item.matchScore}%
                    </span>
                  )}
                </div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <div className={styles.cardOrganizer}>{item.organizer?.name}</div>
                <div className={styles.cardTags}>
                  {item.eligibility?.grades?.length > 0 && <span className={styles.cardTag}>Grades {Math.min(...item.eligibility.grades)}-{Math.max(...item.eligibility.grades)}</span>}
                  {item.tags?.slice(0, 2).map((tag, i) => <span key={i} className={styles.cardTag}>{tag}</span>)}
                </div>
                <div className={styles.rewardRow}>
                  <span className={styles.rewardAmount}>{item.rewards?.cashAmount ? `₹${item.rewards.cashAmount}` : 'View Details'}</span>
                  <span className={styles.rewardType}>{item.rewards?.type || 'reward'}</span>
                </div>
                <div className={styles.cardBottom}>
                  <span className={`${styles.deadlineText} ${isUrgent ? styles.urgent : styles.normal}`}>
                    {deadline ? (isUrgent ? '🔴 ' : '🕐 ') + deadline : 'No deadline'}
                  </span>
                  <div className={styles.cardActions}>
                    <button className={styles.applyBtnSmall}>Apply →</button>
                    <button className={`${styles.bookmarkSmall} ${styles.saved}`} onClick={(e) => toggleBookmark(item._id, e)}>★</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
