'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './LatestOpportunities.module.css';
import api from '@/lib/api';
import useScrollReveal from '@/hooks/useScrollReveal';

const badgeClass = {
  scholarship: styles.badgeScholarship,
  competition: styles.badgeCompetition,
  scheme: styles.badgeScheme,
};

export default function LatestOpportunities() {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.getOpportunities({ limit: 6 });
        setOpportunities(res.data || []);
      } catch (e) {
        console.error('Failed to fetch latest opportunities', e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleStart = () => {
    router.push('/auth');
  };

  const getDaysLeft = (deadline) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const gridRef = useScrollReveal({ stagger: 0.1, y: 40 });

  return (
    <section className={styles.section} id="latest">
      <div className={styles.sectionHeader}>
        <span className="section-label">⚡ Daily Updates</span>
        <h2 className="section-title">
          Latest <span className={styles.oppHighlight}>Opportunities</span>
        </h2>
        <p className="section-subtitle" style={{ margin: '0 auto', opacity: 0.7 }}>
          Join the movement and apply for the top-tier programs today.
        </p>
      </div>

      <div className={styles.opportunitiesRow} ref={gridRef}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'white', width: '100%' }}>Loading latest opportunities...</div>
        ) : opportunities.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'white', width: '100%' }}>Stay tuned! New opportunities arriving soon.</div>
        ) : opportunities.map((opp, idx) => {
          const daysLeft = getDaysLeft(opp.dates?.applicationDeadline);
          const urgent = daysLeft !== null && daysLeft <= 7;
          
          return (
            <div key={idx} className={styles.oppCard}>
              <div className={styles.cardHeader}>
                <span className={`${styles.oppBadge} ${badgeClass[opp.type] || styles.badgeScholarship}`}>
                  {opp.type}
                </span>
                {daysLeft !== null && (
                  <span className={`${styles.deadlineBadge} ${urgent ? styles.deadlineUrgent : styles.deadlineNormal}`}>
                    {urgent && <span className={styles.urgentDot}></span>}
                    {daysLeft} days left
                  </span>
                )}
              </div>

              <h3 className={styles.oppTitle}>{opp.title}</h3>
              <div className={styles.oppOrganizer}>{opp.organizer?.name}</div>

              <div className={styles.tagsRow}>
                {opp.category && <span className={styles.tag}>{opp.category}</span>}
                {opp.eligibility?.grades?.[0] && <span className={styles.tag}>Grade {opp.eligibility.grades[0]}+</span>}
                {opp.tags?.slice(0, 1).map((tag, i) => (
                  <span key={i} className={styles.tag}>{tag}</span>
                ))}
              </div>

              <div className={styles.reward}>
                <div>
                  <div className={styles.rewardAmount}>{opp.rewards?.cashAmount ? `₹${opp.rewards.cashAmount.toLocaleString()}` : 'Grant'}</div>
                  <div className={styles.rewardType}>{opp.rewards?.type || 'Reward'}</div>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <button className={styles.applyBtn} onClick={handleStart}>Apply Now →</button>
                <button className={styles.bookmarkBtn} onClick={handleStart}>🔖</button>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.viewAll}>
        <button className="btn btn-secondary btn-lg" onClick={handleStart}>
          View All Opportunities →
        </button>
      </div>
    </section>
  );
}
