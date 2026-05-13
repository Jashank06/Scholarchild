'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './home.module.css';
import api from '@/lib/api';
import gsap from 'gsap';

const defaultBadges = [
  { icon: '🌟', name: 'First Steps', locked: true, badgeId: 'first_login' },
  { icon: '🔥', name: '7-Day Streak', locked: true, badgeId: 'streak_7' },
  { icon: '📝', name: '5 Applications', locked: true, badgeId: 'five_applications' },
  { icon: '🏅', name: 'Winner', locked: true, badgeId: 'first_win' },
  { icon: '💎', name: 'Scholar Elite', locked: true, badgeId: 'scholar_elite' },
  { icon: '🚀', name: 'Explorer', locked: true, badgeId: 'explorer' },
];

export default function DashboardHome() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meRes, recRes, appRes] = await Promise.all([
          api.getMe(),
          api.getRecommendations(4),
          api.getApplications({ limit: 4 })
        ]);
        
        setUser(meRes.user);
        setRecommendations(recRes.data || []);
        setApplications(appRes.data || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && containerRef.current) {
      const q = gsap.utils.selector(containerRef.current);
      
      const welcome = q(`.${styles.welcomeCard}`);
      const stats = q(`.${styles.statWidget}`);
      const sections = q(`.${styles.sectionCard}`);

      if (welcome.length) {
        gsap.fromTo(welcome, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power4.out' });
      }
      
      if (stats.length) {
        gsap.fromTo(stats, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, delay: 0.3, ease: 'power3.out' });
      }
      
      if (sections.length) {
        gsap.fromTo(sections, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, delay: 0.6, ease: 'power3.out' });
      }
    }
  }, [loading]);

  if (loading) return (
    <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid #F3F4F6', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const profileScore = user?.profileScore || 0;
  const xp = user?.gamification?.xp || 0;
  const earnedBadges = user?.gamification?.badges || [];
  
  // Merge earned badges with default layout
  const displayBadges = defaultBadges.map(db => {
    const earned = earnedBadges.find(eb => eb.badgeId === db.badgeId);
    if (earned) return { ...db, locked: false, icon: earned.badgeIcon || db.icon, name: earned.badgeName || db.name };
    return db;
  });

  return (
    <div className={styles.dashboardHome} ref={containerRef}>
      {/* Welcome Card */}
      <div className={styles.welcomeCard}>
        <div className={styles.welcomeContent}>
          <div className={styles.welcomeText}>
            <h1>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.profile?.firstName || 'Student'}! 👋</h1>
            <p>You have {recommendations.length} new opportunities matching your profile. Keep going!</p>
          </div>
          <div className={styles.welcomeStats}>
            <div className={styles.welcomeStat}>
              <div className={styles.welcomeStatNum}>{profileScore}%</div>
              <div className={styles.welcomeStatLabel}>Profile Score</div>
            </div>
            <div className={styles.welcomeStat}>
              <div className={styles.welcomeStatNum}>{xp}</div>
              <div className={styles.welcomeStatLabel}>XP Points</div>
            </div>
            <div className={styles.welcomeStat}>
              <div className={styles.welcomeStatNum}>{applications.length}</div>
              <div className={styles.welcomeStatLabel}>Applied</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statWidget}>
          <div className={`${styles.statWidgetIcon} ${styles.purple}`}>🎓</div>
          <div className={styles.statWidgetInfo}>
            <div className={styles.statWidgetNum}>{recommendations.filter(r => r.opportunity.type === 'scholarship').length}</div>
            <div className={styles.statWidgetLabel}>Scholarship Matches</div>
          </div>
        </div>
        <div className={styles.statWidget}>
          <div className={`${styles.statWidgetIcon} ${styles.amber}`}>🏆</div>
          <div className={styles.statWidgetInfo}>
            <div className={styles.statWidgetNum}>{recommendations.filter(r => r.opportunity.type === 'competition').length}</div>
            <div className={styles.statWidgetLabel}>Competition Matches</div>
          </div>
        </div>
        <div className={styles.statWidget}>
          <div className={`${styles.statWidgetIcon} ${styles.teal}`}>📋</div>
          <div className={styles.statWidgetInfo}>
            <div className={styles.statWidgetNum}>{applications.length}</div>
            <div className={styles.statWidgetLabel}>Applications</div>
          </div>
        </div>
        <div className={styles.statWidget}>
          <div className={`${styles.statWidgetIcon} ${styles.rose}`}>🏅</div>
          <div className={styles.statWidgetInfo}>
            <div className={styles.statWidgetNum}>{earnedBadges.length}</div>
            <div className={styles.statWidgetLabel}>Badges Earned</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className={styles.twoCol}>
        {/* Left: Recommendations */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>🧠 AI Recommendations</h2>
            <button className={styles.viewAllBtn} onClick={() => router.push('/dashboard/scholarships')}>View All →</button>
          </div>
          <div className={styles.sectionBody}>
            <div className={styles.recoList}>
              {recommendations.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No recommendations yet. Complete your profile to get matches!</div>
              ) : recommendations.map((r, i) => (
                <div key={i} className={styles.recoCard} onClick={() => router.push(`/dashboard/${r.opportunity.type}s`)} style={{ cursor: 'pointer' }}>
                  <div className={`${styles.recoIcon} ${styles[r.opportunity.type]}`}>{r.opportunity.type === 'scholarship' ? '🎓' : r.opportunity.type === 'competition' ? '🏆' : '🏛️'}</div>
                  <div className={styles.recoInfo}>
                    <div className={styles.recoTitle}>{r.opportunity.title}</div>
                    <div className={styles.recoMeta}>{r.opportunity.organizer?.name} • {r.opportunity.category}</div>
                  </div>
                  <div className={styles.recoRight}>
                    <div className={`${styles.matchScore} ${r.matchScore >= 85 ? styles.matchHigh : styles.matchMed}`}>
                      {r.matchScore}%
                    </div>
                    <div className={styles.matchLabel}>match</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Deadlines (Derived from Recos for now) */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>⏰ Upcoming Deadlines</h2>
            <button className={styles.viewAllBtn} onClick={() => router.push('/dashboard/calendar')}>Calendar →</button>
          </div>
          <div className={styles.sectionBody}>
            <div className={styles.deadlineList}>
              {recommendations.filter(r => r.opportunity.dates?.applicationDeadline).slice(0, 4).map((d, i) => {
                const date = new Date(d.opportunity.dates.applicationDeadline);
                const daysLeft = Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24));
                const urgency = daysLeft < 7 ? 'urgent' : daysLeft < 30 ? 'soon' : 'later';
                return (
                  <div key={i} className={styles.deadlineItem}>
                    <div className={`${styles.deadlineDot} ${styles[urgency]}`}></div>
                    <div className={styles.deadlineInfo}>
                      <div className={styles.deadlineName}>{d.opportunity.title}</div>
                      <div className={styles.deadlineDate}>{date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    </div>
                    <span className={`${styles.deadlineBadge} ${styles[urgency]}`}>{daysLeft} days</span>
                  </div>
                );
              })}
              {recommendations.filter(r => r.opportunity.dates?.applicationDeadline).length === 0 && (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No upcoming deadlines.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Second Two Column: Applications + Badges */}
      <div className={styles.twoCol}>
        {/* Applications */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>📋 Recent Applications</h2>
            <button className={styles.viewAllBtn} onClick={() => router.push('/dashboard/applications')}>View All →</button>
          </div>
          <div className={styles.sectionBody}>
            <div className={styles.appList}>
              {applications.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>You haven't applied to any opportunities yet.</div>
              ) : applications.map((a, i) => (
                <div key={i} className={styles.appItem}>
                  <span className={styles.appIcon}>{a.opportunityId?.type === 'scholarship' ? '🎓' : '🏆'}</span>
                  <div className={styles.appInfo}>
                    <div className={styles.appName}>{a.opportunityId?.title || 'Unknown Opportunity'}</div>
                    <div className={styles.appDate}>Applied {new Date(a.createdAt).toLocaleDateString()}</div>
                  </div>
                  <span className={`${styles.statusBadge} ${styles[a.status] || styles.applied}`}>{a.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>🏅 Your Badges</h2>
            <button className={styles.viewAllBtn} onClick={() => router.push('/dashboard/profile')}>All Badges →</button>
          </div>
          <div className={styles.sectionBody}>
            <div className={styles.badgeRow}>
              {displayBadges.map((b, i) => (
                <div key={i} className={`${styles.badge} ${b.locked ? styles.locked : ''}`} title={b.name}>
                  <span className={styles.badgeIcon}>{b.icon}</span>
                  <span className={styles.badgeName}>{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
