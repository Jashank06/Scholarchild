'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './home.module.css';
import api from '@/lib/api';
import gsap from 'gsap';

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
      const categories = q(`.${styles.categoryCard}`);
      const sections = q(`.${styles.sectionCard}`);

      if (welcome.length) {
        gsap.fromTo(welcome, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
      }
      
      if (stats.length) {
        gsap.fromTo(stats, { scale: 0.9, y: 20, opacity: 0 }, { scale: 1, y: 0, opacity: 1, duration: 0.6, stagger: 0.1, delay: 0.2, ease: 'back.out(1.5)' });
      }

      if (categories.length) {
        gsap.fromTo(categories, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, stagger: 0.08, delay: 0.5, ease: 'power2.out' });
      }
      
      if (sections.length) {
        gsap.fromTo(sections, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, delay: 0.8, ease: 'power3.out' });
      }
    }
  }, [loading]);

  if (loading) return (
    <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '32px', height: '32px', border: '3px solid #F3F4F6', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const profileScore = user?.profileScore || 0;
  const xp = user?.gamification?.xp || 0;
  const level = user?.gamification?.level || 1;
  const streak = user?.gamification?.streakDays || 0;
  
  return (
    <div className={styles.dashboardHome} ref={containerRef} style={{ padding: '0 20px' }}>
      {/* Compact Hero Banner */}
      <div className={styles.welcomeCard} style={{ background: '#0B0B1A', borderRadius: '28px', minHeight: 'auto', marginBottom: '24px' }}>
        <img src="/Users/Jay/.gemini/antigravity/brain/0468840e-b69f-4048-83af-9987c673575c/dashboard_hero_banner_1778703353205.png" alt="Banner" className={styles.welcomeImage} style={{ opacity: 0.3 }} />
        <div className={styles.welcomeOverlay} style={{ background: 'linear-gradient(90deg, #0B0B1A 40%, rgba(11, 11, 26, 0.2) 100%)' }}></div>
        <div className={styles.welcomeContent} style={{ padding: '40px' }}>
          <div className={styles.welcomeText}>
            <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>Discover Your Path 🚀</h1>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', maxWidth: '400px' }}>
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.profile?.firstName}! Unlock thousands of scholarships today.
            </p>
          </div>
        </div>
      </div>

      {/* Ultra-Vibrant Horizontal Stats Row */}
      <div className={styles.statsRow} style={{ marginBottom: '32px', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { label: 'XP Points', value: xp, icon: '⚡', gradient: 'linear-gradient(135deg, #6366F1, #4F46E5)', shadow: 'rgba(79, 70, 229, 0.2)' },
          { label: 'Current Level', value: level, icon: '🏆', gradient: 'linear-gradient(135deg, #F59E0B, #D97706)', shadow: 'rgba(217, 119, 6, 0.2)' },
          { label: 'Day Streak', value: `${streak}d`, icon: '🔥', gradient: 'linear-gradient(135deg, #EF4444, #DC2626)', shadow: 'rgba(220, 38, 38, 0.2)' },
          { label: 'Profile Score', value: `${profileScore}%`, icon: '📊', gradient: 'linear-gradient(135deg, #10B981, #059669)', shadow: 'rgba(5, 150, 105, 0.2)' },
        ].map((stat, i) => (
          <div 
            key={i} 
            className={stat.label === 'XP Points' ? styles.statWidget : ''} // Re-use class for animation targeting
            style={{ 
              background: stat.gradient, border: 'none', padding: '16px 20px', borderRadius: '24px',
              display: 'flex', alignItems: 'center', gap: '16px', textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              boxShadow: `0 10px 20px -5px ${stat.shadow}`, minHeight: 'auto', flex: 1
            }}
          >
            <div style={{ width: '44px', height: '44px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: 'white', lineHeight: 1.1 }}>{stat.value}</div>
              <div style={{ fontSize: '9px', fontWeight: '800', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Browse by Category (Compact) */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '900', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '1px' }}>Browse by Category</h2>
        <div className={styles.categoryGrid} style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
          {[
            { label: 'Scholarships', icon: '🎓', class: 'catScholarships', href: '/dashboard/scholarships' },
            { label: 'Competitions', icon: '🏆', class: 'catCompetitions', href: '/dashboard/scholarships' },
            { label: 'Schemes', icon: '🏛️', class: 'catSchemes', href: '/dashboard/schemes' },
            { label: 'Academic', icon: '📚', class: 'catAcademic', href: '/dashboard/results' },
            { label: 'Coding', icon: '💻', class: 'catCoding', href: '/dashboard/scholarships' },
          ].map((cat, i) => (
            <div key={i} className={`${styles.categoryCard} ${styles[cat.class]}`} onClick={() => router.push(cat.href)} style={{ padding: '16px', borderRadius: '20px' }}>
              <div className={styles.catIcon} style={{ width: '44px', height: '44px', fontSize: '20px', marginBottom: '8px' }}>{cat.icon}</div>
              <div className={styles.catLabel} style={{ fontSize: '13px' }}>{cat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout (Refined) */}
      <div className={styles.twoCol} style={{ gap: '32px' }}>
        <div className={styles.sectionCard} style={{ borderRadius: '28px', padding: '24px' }}>
          <div className={styles.sectionHeader}>
            <h2 style={{ fontSize: '18px', fontWeight: '900' }}>✨ Recommended for You</h2>
            <button className={styles.viewAllBtn} style={{ fontSize: '12px' }} onClick={() => router.push('/dashboard/scholarships')}>See All →</button>
          </div>
          <div className={styles.recoList}>
            {recommendations.map((r, i) => (
              <div key={i} className={styles.recoCard} onClick={() => router.push(`/dashboard/${r.opportunity.type}s`)} style={{ cursor: 'pointer', padding: '16px', borderRadius: '20px' }}>
                <div className={`${styles.recoIcon} ${styles[r.opportunity.type]}`} style={{ width: '44px', height: '44px' }}>{r.opportunity.type === 'scholarship' ? '🎓' : '🏆'}</div>
                <div className={styles.recoInfo}>
                  <div className={styles.recoTitle} style={{ fontSize: '15px' }}>{r.opportunity.title}</div>
                  <div className={styles.recoMeta} style={{ fontSize: '11px' }}>{r.opportunity.organizer?.name} • {r.opportunity.category}</div>
                </div>
                <div className={`${styles.matchScore} ${r.matchScore >= 85 ? styles.matchHigh : styles.matchMed}`} style={{ width: '40px', height: '40px', fontSize: '11px' }}>
                  {r.matchScore}%
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.sectionCard} style={{ borderRadius: '28px', padding: '24px' }}>
          <div className={styles.sectionHeader}>
            <h2 style={{ fontSize: '18px', fontWeight: '900' }}>⏰ Upcoming Deadlines</h2>
            <button className={styles.viewAllBtn} style={{ fontSize: '12px' }} onClick={() => router.push('/dashboard/calendar')}>Calendar →</button>
          </div>
          <div className={styles.deadlineList}>
            {recommendations.filter(r => r.opportunity.dates?.applicationDeadline).slice(0, 4).map((d, i) => {
              const date = new Date(d.opportunity.dates.applicationDeadline);
              const daysLeft = Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24));
              const urgency = daysLeft < 7 ? 'urgent' : daysLeft < 30 ? 'soon' : 'later';
              return (
                <div key={i} className={styles.deadlineItem} style={{ padding: '12px 0' }}>
                  <div className={`${styles.deadlineDot} ${styles[urgency]}`}></div>
                  <div className={styles.deadlineInfo}>
                    <div className={styles.deadlineName} style={{ fontSize: '14px' }}>{d.opportunity.title}</div>
                    <div className={styles.deadlineDate} style={{ fontSize: '11px' }}>{date.toLocaleDateString()}</div>
                  </div>
                  <span className={`${styles.deadlineBadge} ${styles[urgency]}`} style={{ fontSize: '9px' }}>{daysLeft}d</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
